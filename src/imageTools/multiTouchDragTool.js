import EVENTS from '../events.js';

export default function (touchDragCallback, options) {
  let configuration = {};
  let events = EVENTS.MULTI_TOUCH_DRAG;

  if (options && options.fireOnTouchStart === true) {
    events = `${EVENTS.MULTI_TOUCH_DRAG} ${EVENTS.MULTI_TOUCH_START}`;
  }

  return {
    activate (element) {
      element.removeEventListener(events, touchDragCallback);

      if (options && options.eventData) {
        element.addEventListener(events, options.eventData, touchDragCallback);
      } else {
        element.addEventListener(events, touchDragCallback);
      }

      if (options && options.activateCallback) {
        options.activateCallback(element);
      }
    },
    disable (element) {
      element.removeEventListener(events, touchDragCallback);
      if (options && options.disableCallback) {
        options.disableCallback(element);
      }
    },
    enable (element) {
      element.removeEventListener(events, touchDragCallback);
      if (options && options.enableCallback) {
        options.enableCallback(element);
      }
    },
    deactivate (element) {
      element.removeEventListener(events, touchDragCallback);
      if (options && options.deactivateCallback) {
        options.deactivateCallback(element);
      }
    },
    getConfiguration () {
      return configuration;
    },
    setConfiguration (config) {
      configuration = config;
    }
  };
}
