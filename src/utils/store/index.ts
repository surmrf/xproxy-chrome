import EE from 'eventemitter3';

class Store extends EE<'change'> {
  constructor() {
    super();
    this.init();
  }

  init() {
    chrome.storage.onChanged.addListener(() => {
      this.emit('change');
    });
  }

  async set(key: string, value: any): Promise<void> {
    return new Promise(resolve => {
      console.info('set', key, value);
      chrome.storage.sync.set(
        {
          [key]: value,
        },
        resolve,
      );
    });
  }

  async get(key: string, defaultValue?: any): Promise<{ [key: string]: any }> {
    return new Promise(resolve => {
      chrome.storage.sync.get([key], value => {
        console.info('get', key, value[key]);
        resolve(value[key] || defaultValue);
      });
    });
  }

  async clear(): Promise<void> {
    return new Promise(resolve => {
      chrome.storage.sync.clear(resolve);
    });
  }
}

export { Store };
export default new Store();
