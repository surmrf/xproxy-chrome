export interface Rule {
  id: string;
  type: 'replace' | 'redirect' | 'cancel';
  pattern: string;
  conditionType: 'equal' | 'contain' | 'regexp';
  condition: string;
  destination: string;
}

export interface Group {
  type: 'local' | 'remote';
  id: string;
  name: string;
  status: boolean;
  lastModifiedTime: string;
  rules: Rule[];
  star?: boolean;
}

export interface Namespace {
  id: string;
  name: string;
  status: boolean;
  groups: Group[];
  remoteUrl?: string;
}
