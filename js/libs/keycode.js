/**
 * Recording hotkey input
 * created by: raingart
*/

// Function to handle hotkey input management
function handleHotkeyInput() {
   const inputs = document.body.querySelectorAll('input[type="text"]');
   let needClearInput = false;

   inputs.forEach((input) => {
      input.addEventListener('keydown', setShortcut); // Set the shortcut when a key is pressed
      input.addEventListener('keyup', clearInput); // Clear the input when a key is released
   });

   /**
    * Function to get the pressed shortcut based on keyboard events
    * @param {object} evt - Keyboard event object
    * @returns {string} - The string representation of the pressed keys as a hotkey
   */
   function getPressedShortcut({ ctrlKey, shiftKey, altKey, metaKey, key, code }) {
      // If the Delete or Backspace key is pressed, return an empty string for clear actions
      switch (key) {
         case 'Delete':
         case 'Backspace':
            return '';
      }

      const keysMap = [];

      // Check and add each modifier key if it's pressed
      if (ctrlKey) keysMap.push('Ctrl');
      if (shiftKey) keysMap.push('Shift');
      if (altKey) keysMap.push('Alt');
      if (metaKey) keysMap.push('Meta');

      // If a non-modifier key is pressed, add its code to the shortcu
      if (!['Control', 'Shift', 'Alt', 'Meta'].includes(key)) {
         needClearInput = false;
         keysMap.push(code.replace(/^(Key|Digit|Numpad)/, ''));
      }
      // If a modifier key is pressed, set needClearInput to true
      else {
         needClearInput = true;
         keysMap.push(''); // add empty to indicate that to continue entering
      }

      return keysMap.join('+');
   };

   /**
    * Function to set the input value based on the pressed shortcut
    * @param {object} evt - Keyboard event object
   */
   function setShortcut(evt) {
      // Prevent the default action of the event
      evt.preventDefault();

      // if the key is being held down and ignore subsequent events
      if (evt.repeat) return;

      const input = evt.target;

      // Set the input value to the current pressed shortcut
      input.value = getPressedShortcut(evt);
   };

   /**
    * Function to clear the input field if needed
    * @param {object} evt - Keyboard event object
   */
   function clearInput({ target }) {
      if (needClearInput) target.value = '';
   };
}

// Add the load event listener to call handleHotkeyInput once when the window loads
window.addEventListener('load', handleHotkeyInput, { capture: true, once: true });
