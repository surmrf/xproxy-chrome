export interface Rule {
  id: string;
  type: 'replace' | 'redirect' | 'cancel';
  pattern: string;
  conditionType: 'equal' | 'contain' | 'regexp';
  condition: string;
  destination: string;
}

export interface Group {
  id: string;
  name: string;
  status: boolean;
  lastModifiedTime: string;
  rules: Rule[];
  star?: boolean;
}

export interface Namespace {
  type?: 'local' | 'remote';
  id: string;
  name: string;
  status: boolean;
  groups: Group[];
  remoteUrl?: string;
}
