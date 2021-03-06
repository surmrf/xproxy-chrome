import { watchData } from '@/store/data';
import { getRules } from '@/store/utils';
import RuleEngine from '@/utils/rule/engine';

const engine = new RuleEngine();

watchData(data => {
  const rules = getRules(data);
  engine.create(rules);
});

chrome.webRequest.onBeforeRequest.addListener(
  req => engine.match(req),
  { urls: ['<all_urls>'] },
  ['blocking'],
);
