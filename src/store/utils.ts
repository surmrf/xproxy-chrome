import type { State, Group, Rule } from '.';

export function getRules(state: State): Rule[] {
  if (!state?.namespaces) return [];

  const groups = state.namespaces
    .filter(ns => ns.status)
    .reduce<Group[]>((a, b) => {
      return [...a.concat(...b.groups)];
    }, [])
    .filter(group => group.status);
  const rules = groups.reduce<Rule[]>((a, b) => {
    return [...a.concat(...b.rules)];
  }, []);

  return rules;
}

export function match() {
  //
}
