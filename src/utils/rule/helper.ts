import { v4 as uuid } from 'uuid';
import { produce } from 'immer';
import { Namespace, Group, Rule } from './type';

export function isNs(ns: Namespace) {
  return !!ns.groups;
}

export function isGroup(group: Group) {
  return !!group.rules;
}

export function isRule(rule: Rule) {
  return !!rule.pattern;
}

export function resetNSData(ns: Namespace, type: Group['type']) {
  if (!isNs(ns)) return null;

  return produce(ns, draft => {
    draft.id = uuid();
    draft.status = false;
    draft.groups = draft.groups || [];

    draft.groups.forEach(group => {
      group.id = uuid();
      group.status = false;
      group.star = false;
      group.type = type;

      group.rules = group.rules || [];
      group.rules.forEach(rule => {
        rule.id = uuid();
      });
    });
  });
}
