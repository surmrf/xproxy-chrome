export const setNormalIcon = () => {
  chrome.browserAction.setIcon({
    path: {
      '32': 'assets/icon@32.png',
      '48': 'assets/icon@48.png',
      '64': 'assets/icon@64.png',
      '128': 'assets/icon@128.png',
    },
  });
};

export const setActiveIcon = () => {
  getCurrentTab(id => {
    if (!id) return;

    chrome.browserAction.setIcon({
      path: {
        '32': 'assets/active@32.png',
        '48': 'assets/active@48.png',
        '64': 'assets/active@64.png',
        '128': 'assets/active@128.png',
      },
      tabId: id,
    });
  });
};

function getCurrentTab(cb: (id: number) => void) {
  const queryOptions = { active: true, currentWindow: true };
  chrome.tabs.query(queryOptions, tab => {
    cb(tab?.[0]?.id);
  });
}
