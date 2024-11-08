importScripts('/js/libs/browser-support.js');

browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
   // console.debug('message.action', message.action);
   if (!sender.tab) return;
   switch (message.action) {
      // case 'enable':
      //    browser.action.setIcon({ tabId: sender.tab.id, path: { '14': '/img/14.png' } });
      //    browser.action.setTitle({ tabId: sender.tab.id, title: 'Click to disable hotkeys' });
      //    break;
      // case 'disable':
      //    browser.action.setTitle({ tabId: sender.tab.id, title: 'Click to enable hotkeys' });
      //    break;
      case 'newTab':
         // browser.tabs.create({});
         browser.tabs.query({ active: true, currentWindow: true }, tabs => {
            if (tabs.length) {
               browser.tabs.create({
                  index: tabs[0].index + 1 // Open to the right of the active tab
               });
            }
         });
         break;
      case 'closeTab':
         browser.tabs.remove(sender.tab.id);
         break;
      case 'undoCloseTab':
         browser.tabs.query({ lastFocused: true }, tabs => {
            if (tabs.length) {
               const lastFocusedTab = tabs[0];
               browser.tabs.create({ url: lastFocusedTab.url }); // Recreate the last focused tab
            }
         });
         break;
      case 'previousTab':
      case 'nextTab':
         browser.tabs.query({ currentWindow: true }, tabs => {
            const currentTabIndex = sender.tab.index;
            const targetTabIndex = message.action === 'previousTab'
               ? currentTabIndex === 0 ? tabs.length - 1 : currentTabIndex - 1
               : currentTabIndex === tabs.length - 1 ? 0 : currentTabIndex + 1;

            browser.tabs.update(tabs[targetTabIndex].id, { selected: true });
         });
         break;
   }
});
