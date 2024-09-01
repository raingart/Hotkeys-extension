function docLoad() {
   // let  hotkeysEnabled = true;

   const Scroll = {
      vertical_moment: 250,
      // horizontal_moment: 100,
      scrollDuration: 150, // 50-500

      smoothScroll({ moment, direction }) {
         let startTime;

         requestAnimationFrame(scroll);

         function scroll(currentTime = performance.now()) {
            if (!startTime) startTime = currentTime;

            const progress = Math.min((currentTime - startTime) / this.scrollDuration, 1);
            const distance = (moment - window.pageYOffset) * progress;

            scrollApply({ 'distance': distance, 'direction': direction });

            if (progress < 1) requestAnimationFrame(scroll);
         }

         function scrollApply({ distance, direction = 'vertical' }) {
            switch (direction) {
               case 'vertical':
                  window.scrollBy(0, distance);
                  break;
               case 'horizontal':
                  window.scrollBy(distance, 0);
                  break;
            }
         }
      },
      scrollToTop() {
         // const scrollTop = document.body.scrollTop || document.documentElement.scrollTop;
         window.scrollTo({
            top: 0, // scrollTop
            // left: document.documentElement.scrollWidth,
            behavior: 'instant',
         });
      },
      scrollToBottom() {
         window.scrollTo({
            top: document.documentElement.scrollHeight,
            // left: document.documentElement.scrollWidth,
            behavior: 'instant',
         });
      },
      scrollUp() {
         this.smoothScroll({ moment: window.pageYOffset - this.vertical_moment, direction: 'vertical' });
      },
      scrollDown() {
         this.smoothScroll({ moment: window.pageYOffset + this.vertical_moment, direction: 'vertical' });
      },
      // scrollLeft() {
      //    this.smoothScroll({ moment: window.pageXOffset - horizontal_moment, direction: 'horizontal' });
      // },
      // scrollRight() {
      //    this.smoothScroll({ moment: window.pageXOffset + horizontal_moment, direction: 'horizontal' });
      // },
   };

   const TabControl = {
      newTab() {
         chrome.runtime.sendMessage({ action: 'newTab' });
      },
      closeTab() {
         chrome.runtime.sendMessage({ action: 'closeTab' });
      },
      undoCloseTab() {
         chrome.runtime.sendMessage({ action: 'undoCloseTab' });
      },
      previousTab() {
         chrome.runtime.sendMessage({ action: 'previousTab' });
      },
      nextTab() {
         chrome.runtime.sendMessage({ action: 'nextTab' });
      },
      historyBack() {
         history.back();
      },
      historyForward() {
         history.forward();
      },
      reload() {
         location.reload();
      },
      stopLoading() {
         window.stop();
      },
   };

   Storage.getParams(settings => {
      if (+settings['scroll distance']) Scroll.vertical_moment = +settings['scroll distance'];
      initHotkeys(settings);
   }, storageMethod);

   function initHotkeys(hotkeys) {
      // console.debug('hotkeys', ...arguments);
      addHotkey(hotkeys['scrollToTop'], Scroll.scrollToTop);
      addHotkey(hotkeys['scrollToBottom'], Scroll.scrollToBottom);
      addHotkey(hotkeys['scrollUp'], Scroll.scrollUp);
      addHotkey(hotkeys['scrollDown'], Scroll.scrollDown);

      addHotkey(hotkeys['newTab'], TabControl.newTab);
      addHotkey(hotkeys['closeTab'], TabControl.closeTab);
      addHotkey(hotkeys['undoCloseTab'], TabControl.undoCloseTab);
      addHotkey(hotkeys['previousTab'], TabControl.previousTab);
      addHotkey(hotkeys['nextTab'], TabControl.nextTab);
      addHotkey(hotkeys['historyBack'], TabControl.historyBack);
      addHotkey(hotkeys['historyForward'], TabControl.historyForward);
      addHotkey(hotkeys['reload'], TabControl.reload);
      addHotkey(hotkeys['stopLoading'], TabControl.stopLoading);
   }

   //keybinding
   //@hotkey: properties: value, enabled
   function addHotkey(hotkey, callback = required()) {
      if (hotkey) {
         shortcut.add({
            'shortcutCombination': hotkey,
            'callback': callback,
         });
      }
   }

   // function removeHotkey(hotkey) {
   //    if (hotkey) shortcut.remove(hotkey);
   // }
}

window.addEventListener('load', docLoad, { capture: true, once: true });
