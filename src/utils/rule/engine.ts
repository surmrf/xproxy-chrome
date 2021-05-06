import validUrl from 'valid-url';
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
  protected error: boolean;

  constructor(rule: Rule) {
    this.rule = rule;
    this.init();
  }

  init() {
    try {
      this.ruleType = this.rule.type;

      const { str: pattern, flag: patternFlag } = this.trim(this.rule.pattern);
      this.patternRE = new RegExp(pattern, patternFlag);

      const { str: condition, flag: conditionFlag } = this.trim(
        this.rule.condition,
      );
      this.conditionRE = new RegExp(condition, conditionFlag);
    } catch (error) {
      console.error(error);
      this.error = true;
    }
  }

  trim(input: string): { str: string; flag: string } {
    let output = input.trim();
    let flag = '';

    // trim start
    if (/^\//.test(output)) {
      output = output.replace(/^\//, '');
    }

    // trim end when input end with '/'
    if (/\/$/.test(output)) {
      output = output.replace(/\/$/, '');

      return {
        str: output,
        flag,
      };
    }

    // trim end when input end with '/i'、'/g'、'/gi'、'/ig'
    const match = /(?:\/)(g|i|gi|ig)?$/gi.exec(output);
    if (match && match[1]) {
      output = output.replace(`/${match[1]}`, '');
      flag = match[1].toLowerCase();
    }

    return {
      str: output,
      flag,
    };
  }

  hasError(): boolean {
    return this.error;
  }

  replace(url: string): Resp {
    if (this.conditionRE && !this.conditionRE.test(url)) {
      return null;
    }

    let newUrl = '';

    try {
      newUrl = url.replace(this.patternRE, this.rule.destination);
    } catch (error) {
      console.error(error);
      return null;
    }

    if (newUrl === url) return null;

    if (!validUrl.isUri(newUrl)) return null;

    return {
      redirectUrl: newUrl,
    };
  }

  redirect(url: string): Resp {
    if (this.patternRE.test(url) && validUrl.isUri(this.rule.destination)) {
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
    if (this.hasError()) return null;

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

  match(req: chrome.webRequest.ResourceRequest): Resp {
    const { url } = req;

    for (const rule of this.ruleList) {
      const r = rule.exec(url);
      if (r) {
        return r;
      }
    }

    return null;
  }
}

export default RuleEngine;
