/**
 * Keyboard Shortcut Handler
 * created by: raingart
*/

// Usage
// shortcut.add({
//    shortcutCombination: 'ctrl+shift+a',
//    callback: (e) => {
//      console.log('Ctrl+Shift+A pressed!', e);
//    }
//  });

const shortcut = (() => {
   const SHORTCUT_SET = new Set();
   const SHORTCUT_DATA = new Map();

   /**
    * Add a new keyboard shortcut
    * @param {string} shortcutCombination - Combination of keys for the shortcut (e.g., 'ctrl+shift+a')
    * @param {function} callback - Function to be executed on key press
    * @param {Object} options - Options for the shortcut (type, propagate, target)
    */
   const add = ({ shortcutCombination = required(), callback = required(), options = {} }) => {
      if (!shortcutCombination || typeof callback !== 'function') {
         console.error('Invalid arguments');
         return
      }

      const normalizedCombination = shortcutCombination.toUpperCase();
      SHORTCUT_SET.add(normalizedCombination);

      // Merge provided options with default ones
      const mergedOptions = {
         type: 'keydown',
         propagate: false,
         target: document,
         ...options,
      };

      SHORTCUT_DATA.set(normalizedCombination, { callback, ...mergedOptions });
   };

   /**
    * Remove a keyboard shortcut
    * @param {string} shortcutCombination - Combination of keys for the shortcut (e.g., 'ctrl+shift+a')
    */
   const remove = (shortcutCombination = required()) => {
      SHORTCUT_SET.delete(shortcutCombination.toUpperCase());
   };

   /**
    * Check if the target element is an input, textarea, or contenteditable
    * @param {Element} target - Target event target element
    * @returns {boolean}
    */
   const isInputDisabled = (target = required()) => {
      return ['input', 'textarea', 'select'].includes(target.localName) || target.isContentEditable;
   };

   /**
    * Handle key press event
    * @param {Event} evt - Key press event
    */
   const handleKeyPress = (evt) => {
      if (evt.repeat) return;

      const pressedKeys = [];
      if (evt.ctrlKey) pressedKeys.push('CTRL');
      if (evt.shiftKey) pressedKeys.push('SHIFT');
      if (evt.altKey) pressedKeys.push('ALT');
      if (evt.metaKey) pressedKeys.push('META');
      if (!['Control', 'Shift', 'Alt', 'Meta'].includes(evt.key)) {
         const keyName = evt.code.replace(/^(Key|Digit|Numpad)/, '').toUpperCase();
         pressedKeys.push(keyName);
      }

      const pressedShortcut = pressedKeys.join('+');

      // console.debug('pressedShortcut', pressedShortcut);

      if (SHORTCUT_SET.has(pressedShortcut) && !isInputDisabled(evt.target)) {
         // console.debug('evt.target', evt.target, document.activeElement);
         const { callback, options } = SHORTCUT_DATA.get(pressedShortcut);
         callback(evt, options);

         evt.stopPropagation();
         evt.preventDefault();
      }
   };

   // Attach a single event listener for key events on document
   document.addEventListener('keydown', handleKeyPress, { capture: true });

   return { add, remove };
})();
