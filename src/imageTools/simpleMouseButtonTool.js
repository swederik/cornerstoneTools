import EVENTS from '../events.js';

export default function (mouseDownCallback) {
  let configuration = {};

  const toolInterface = {
    activate (element, mouseButtonMask, options) {
      element.removeEventListener(EVENTS.MOUSE_DOWN_ACTIVATE, mouseDownCallback);
      const eventData = {
        mouseButtonMask,
        options
      };

      element.addEventListener(EVENTS.MOUSE_DOWN_ACTIVATE, eventData, mouseDownCallback);
    },
    disable (element) {
      element.removeEventListener(EVENTS.MOUSE_DOWN_ACTIVATE, mouseDownCallback);
    },
    enable (element) {
      element.removeEventListener(EVENTS.MOUSE_DOWN_ACTIVATE, mouseDownCallback);
    },
    deactivate (element) {
      element.removeEventListener(EVENTS.MOUSE_DOWN_ACTIVATE, mouseDownCallback);
    },
    getConfiguration () {
      return configuration;
    },
    setConfiguration (config) {
      configuration = config;
    }
  };


  return toolInterface;
}
