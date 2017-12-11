import EVENTS from '../events.js';

export default function (mouseDownCallback) {
  let configuration = {};
  const eventDataMap = {};

  function mouseDown (e) {
    const eventData = e.detail;
    const element = eventData.element;

    e.data = eventDataMap[element];
    mouseDownCallback(e);
  }

  return {
    activate (element, mouseButtonMask, options) {
      element.removeEventListener(EVENTS.MOUSE_DOWN_ACTIVATE, mouseDown);

      eventDataMap[element] = {
        mouseButtonMask,
        options
      };

      element.addEventListener(EVENTS.MOUSE_DOWN_ACTIVATE, mouseDown);
    },
    disable (element) {
      element.removeEventListener(EVENTS.MOUSE_DOWN_ACTIVATE, mouseDown);
      delete eventDataMap[element];
    },
    enable (element) {
      element.removeEventListener(EVENTS.MOUSE_DOWN_ACTIVATE, mouseDown);
      delete eventDataMap[element];
    },
    deactivate (element) {
      element.removeEventListener(EVENTS.MOUSE_DOWN_ACTIVATE, mouseDown);
      delete eventDataMap[element];
    },
    getConfiguration () {
      return configuration;
    },
    setConfiguration (config) {
      configuration = config;
    }
  };
}
