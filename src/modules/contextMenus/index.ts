chrome.contextMenus.create({
  id: 'Home',
  title: chrome.i18n.getMessage('home'),
  contexts: ['browser_action'],
  onclick: () => {
    chrome.tabs.create({
      url: 'pages/home/index.html',
    });
  },
});
