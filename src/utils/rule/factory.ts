import { v4 as uuid } from 'uuid';
import type { Namespace, Group, Rule } from './type';

export function createNamespace({ id, name }: Partial<Namespace>): Namespace {
  return {
    type: 'local',
    id: id || uuid(),
    name: name || '',
    status: false,
    groups: [],
  };
}

export function createGroup({ name }: { name?: Group['name'] } = {}): Group {
  return {
    id: uuid(),
    name: name || '',
    status: false,
    lastModifiedTime: new Date().toString(),
    rules: [],
    star: false,
  };
}

export function createRule({
  type,
  pattern,
  destination,
  condition,
  conditionType,
}: Omit<Rule, 'id'>): Rule {
  return {
    id: uuid(),
    type,
    pattern,
    condition,
    conditionType,
    destination,
  };
}
