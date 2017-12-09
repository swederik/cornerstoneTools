const EVENT_MOUSE_WHEEL = 'cornerstonetoolsmousewheel';

export default function (mouseWheelCallback) {
  return {
    activate (element) {
      element.removeEventListener(EVENT_MOUSE_WHEEL, mouseWheelCallback);
      element.addEventListener(EVENT_MOUSE_WHEEL, mouseWheelCallback);
    },
    disable (element) {
      element.removeEventListener(EVENT_MOUSE_WHEEL, mouseWheelCallback);
    },
    enable (element) {
      element.removeEventListener(EVENT_MOUSE_WHEEL, mouseWheelCallback);
    },
    deactivate (element) {
      element.removeEventListener(EVENT_MOUSE_WHEEL, mouseWheelCallback);
    }
  };
}
