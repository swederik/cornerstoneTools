import EVENTS from '../events.js';

export default function (touchPinchCallback) {
  const toolInterface = {
    activate (element) {
      element.removeEventListener(EVENTS.TOUCH_PINCH, touchPinchCallback);
      const eventData = {
      };

      element.addEventListener(EVENTS.TOUCH_PINCH, eventData, touchPinchCallback);
    },
    disable (element) {
      element.removeEventListener(EVENTS.TOUCH_PINCH, touchPinchCallback);
    },
    enable (element) {
      element.removeEventListener(EVENTS.TOUCH_PINCH, touchPinchCallback);
    },
    deactivate (element) {
      element.removeEventListener(EVENTS.TOUCH_PINCH, touchPinchCallback);
    }
  };


  return toolInterface;
}
