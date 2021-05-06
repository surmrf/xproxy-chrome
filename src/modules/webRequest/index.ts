import { watchData } from '@/store/data';
import { getRules } from '@/store/utils';
import RuleEngine from '@/utils/rule/engine';
import { setActiveIcon } from '@/modules/browserAction';

const engine = new RuleEngine();

watchData(data => {
  const rules = getRules(data);
  engine.create(rules);
});

chrome.webRequest.onBeforeRequest.addListener(
  req => {
    const r = engine.match(req);
    if (r) {
      setActiveIcon();
      return r;
    }
    return {};
  },
  { urls: ['<all_urls>'] },
  ['blocking'],
);
