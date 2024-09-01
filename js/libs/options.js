console.debug('init options.js');

const PopulateForm = {
   fill(settings, container = document.body) {
      // console.debug("Load from Storage: %s=>%s", container?.id, JSON.stringify(settings));

      for (const key in settings) {
         const val = settings[key];
         const el = container.querySelector(`[name="${key}"]`) || container.querySelector('#' + key);

         if (el) {
            // console.debug('PopulateForm.fill %s#%s=%s', el.tagName, key, val);

            switch (el.tagName.toLowerCase()) {
               // case 'div': // for isContentEditable (contenteditable="true")
               //    if (el.isContentEditable) {
               //       // el.innerHTML = val;
               //       el.textContent = val;
               //    }
               //    break;

               case 'textarea':
                  el.value = val;
                  break;

               case 'select':
                  if (Array.isArray(val)) {
                     val.forEach(value => setSelectOption(el, value)); // select multiple
                  }
                  else {
                     setSelectOption(el, val);
                  }
                  break;

               case 'input':
                  switch (el.type.toLowerCase()) {
                     case 'checkbox':
                        if (Array.isArray(val)) {
                           val.forEach(value => el.checked = value ? true : false); // multiple Check/Uncheck
                        }
                        else {
                           el.checked = val ? true : false;
                        }
                        break;

                     case 'radio':
                        [...document.getElementsByName(key)]?.some(e => e.value == val && (e.checked = true));
                        break;

                     default:
                        el.value = val;
                  }
                  break;
            }
         }
      }

      function setSelectOption(selectObj, val) {
         for (const option of selectObj.children) {
            if (option.value === String(val)) {
               option.selected = true;
               break;
            }
         }
      }
   },

   applyDataDependencyRules() {
      const attributeName = 'data-dependent';
      // Find all elements with data-dependent attribute
      const dependentElements = document.body.querySelectorAll(`[${attributeName}]`);

      dependentElements.forEach(element => {
         const rules = JSON.parse(element.getAttribute(attributeName));
         // init
         showOrHide(element, rules);
         // on change
         document.getElementsByName(Object.keys(rules))
            .forEach(el => el.addEventListener('change', () => showOrHide(element, rules)));
      });

      function showOrHide(element, rules) {
         // Iterate through each rule (parent name and its values) in the rules object.
         for (const [parentName, values] of Object.entries(rules)) {
            // Find the corresponding dependent element(s) by their name.
            // const parentElement = document.getElementsByName(parentName)[0];
            const parentElement = document.body.querySelector(`[name="${parentName}"]`);
            if (!parentElement) {
               console.error('showOrHide not found:', parentElement);
               continue;
            }
            const parentValue = parentElement.checked || parentElement.value;

            let shouldHide = true;
            (Array.isArray(values) ? values : [values]) // conver all values to array
               .some(ruleValue => {
                  ruleValue = ruleValue.toString();
                  if (ruleValue.startsWith('!')
                     ? parentValue?.toString() !== ruleValue.slice(1) // inverted
                     : parentValue?.toString() === ruleValue
                  ) {
                     shouldHide = false;
                     return true; // Stop searching within the current value array.
                  }
               });

            if (shouldHide) {
               element.classList.add('hide');
            }
            else {
               element.classList.remove('hide');
            }
            childInputDisable(shouldHide);
         }

         function childInputDisable(disabled = false) {
            element.querySelectorAll('input, textarea, select')
               .forEach(child => child.disabled = Boolean(disabled));
         }
      }
   },

   // Saves options to localStorage/chromeSync.
   saveOptions(form) {
      let newSettings = {};

      for (const [key, value] of new FormData(form)) {
         // SerializedArray
         if (newSettings.hasOwnProperty(key)) {
            newSettings[key] += ',' + value; // add new
            newSettings[key] = newSettings[key].split(','); // to array [old, new]
         }
         else {
            // convert string to boolean
            switch (value) {
               case 'true': newSettings[key] = true; break;
               case 'false': newSettings[key] = false; break;
               case 'undefined': newSettings[key] = undefined; break;
               default: newSettings[key] = value;
            }
         };
      }

      Storage.setParams(newSettings, storageMethod);

      // notify background page
      // browser.extension.sendMessage({ // manifest v2
      // browser.runtime.sendMessage({ // manifest v3
      //    "action": 'setOptions',
      //    "settings": newSettings
      // });
   },

   btnSubmitAnimation: {
      // submitBtns: document.body.querySelectorAll('form [type=submit]'),

      _process() {
         this.submitBtns.forEach(e => {
            e.textContent = i18n('opt_btn_save_settings_process');
            e.classList.remove('unSaved');
            e.disabled = true;
            document.body.style.cursor = 'wait';
         });
      },

      _defaut() {
         setTimeout(() => {
            this.submitBtns.forEach(e => {
               e.textContent = i18n('opt_btn_save_settings');
               e.removeAttribute('disabled');
               document.body.style.cursor = '';
            });
         }, 300); // 300ms
      },
   },

   // Register the event handlers.
   registerEventListeners() {
      let isSubmitting = false;
      // form submit
      document.addEventListener('submit', evt => {
         evt.preventDefault();
         // btnSubmit update
         this.btnSubmitAnimation._process();
         this.saveOptions(evt.target);
         this.btnSubmitAnimation._defaut();
      }, { capture: true });
      // hotkey ctrl+s
      document.addEventListener('keydown', evt => {
         if (isSubmitting) return; // Prevent new submissions when use keydown
         if (['input', 'textarea', 'select'].includes(evt.target.localName) || evt.target.isContentEditable) return;

         if (evt.ctrlKey && evt.code == 'KeyS') {
            isSubmitting = true;
            // Prevent the Save dialog to open
            evt.preventDefault();
            // send form
            // document.getElementsByName('form')[0]
            // document.getElementsByTagName('form')[0]
            document.querySelector('form')
               .dispatchEvent(new Event('submit'));
            // .submit(); // reload page
         }
      });
      document.addEventListener('keyup', evt => {
         if (evt.ctrlKey && evt.code == 'KeyS') isSubmitting = false;
      });
      // form unsave
      document.addEventListener('change', ({ target }) => {
         // console.debug('change', target, 'name:', target.name);
         this.btnSubmitAnimation.submitBtns.forEach(e => e.classList.add('unSaved'));
         // textarea trim value
         // if (target.tagName.toLowerCase() == 'textarea') target.value = target.value.trim();
      });
   },

   async init() {
      Storage.getParams(settings => {
         this.fill(settings);
         this.applyDataDependencyRules();
         this.registerEventListeners();
         // auto selects value on focus
         // document.body.querySelectorAll('form input[type]').forEach(i => i.addEventListener('focus', i.select));
         this.btnSubmitAnimation.submitBtns = document.body.querySelectorAll('form [type=submit]');
      }, storageMethod);
   },
}

window.addEventListener('load', PopulateForm.init.apply(PopulateForm), { capture: true, once: true });
