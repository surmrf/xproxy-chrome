import type { Rule } from './type';

type RuleType = Rule['type'];

type Resp = chrome.webRequest.BlockingResponse | null;

type TRuleBase = {
  [key in RuleType]: (url: string) => Resp;
};

class RuleBase implements TRuleBase {
  protected rule: Rule;
  protected ruleType: RuleType;
  protected conditionRE: RegExp;
  protected patternRE: RegExp;

  constructor(rule: Rule) {
    this.rule = rule;
    this.init();
  }

  init() {
    this.ruleType = this.rule.type;

    const pattern = this.rule.pattern.trim().replace(/(^\/|\/$)/gi, '');
    this.patternRE = new RegExp(pattern, 'g');

    const condition = this.rule.condition.trim().replace(/(^\/|\/$)/gi, '');
    this.conditionRE = new RegExp(condition, 'g');
  }

  replace(url: string): Resp {
    if (url.includes('d-vision')) {
      console.log('input', url);
    }

    if (this.conditionRE && !this.conditionRE.test(url)) {
      return null;
    }

    console.log('output', url);

    const newUrl = url.replace(this.patternRE, this.rule.destination);

    if (newUrl === url) return null;

    return {
      redirectUrl: newUrl,
    };
  }

  redirect(url: string): Resp {
    if (this.patternRE.test(url)) {
      return {
        redirectUrl: this.rule.destination,
      };
    }
    return null;
  }

  cancel(url: string): Resp {
    if (this.patternRE.test(url)) {
      return {
        cancel: true,
      };
    }
    return null;
  }
}

class RuleMatch extends RuleBase {
  private handle: (url: string) => Resp;

  constructor(rule: Rule) {
    super(rule);
    this.initHandle();
  }

  initHandle() {
    if (this[this.ruleType]) {
      this.handle = this[this.ruleType].bind(this);
    } else {
      this.handle = () => ({});
      console.error(`${this.ruleType} is not supported`);
    }
  }

  exec(url: string): Resp {
    return this.handle(url);
  }
}

class RuleEngine {
  private rules: Rule[] = [];
  private ruleList: RuleMatch[] = [];

  create(rules: Rule[]) {
    this.rules = rules;
    this.build();
  }

  addRule(rule) {
    this.rules.push(rule);
    this.build();
  }

  addRules(rules: Rule[]) {
    this.rules = this.rules.concat(...rules);
    this.build();
  }

  build() {
    this.ruleList = this.rules.map(rule => new RuleMatch(rule));
  }

  match(
    req: chrome.webRequest.ResourceRequest,
  ): chrome.webRequest.BlockingResponse {
    const { url } = req;

    for (const rule of this.ruleList) {
      const r = rule.exec(url);
      if (r) {
        return r;
      }
    }

    return {};
  }
}

export default RuleEngine;
