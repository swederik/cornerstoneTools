export default function (mouseDownCallback, mouseMoveCallback) {
  let configuration = {};

  const toolInterface = {
    activate (element, mouseButtonMask, options) {
      $(element).off('CornerstoneToolsMouseDownActivate', mouseDownCallback);
      const eventData = {
        mouseButtonMask,
        options
      };

      $(element).on('CornerstoneToolsMouseDownActivate', eventData, mouseDownCallback);

      if (mouseMoveCallback) {
        $(element).off('CornerstoneToolsMouseMove', mouseMoveCallback);
        $(element).on('CornerstoneToolsMouseMove', mouseMoveCallback);
      }
    },
    disable (element) {
      $(element).off('CornerstoneToolsMouseDownActivate', mouseDownCallback);
      if (mouseMoveCallback) {
        $(element).off('CornerstoneToolsMouseMove', mouseMoveCallback);
      }
    },
    enable (element) {
      $(element).off('CornerstoneToolsMouseDownActivate', mouseDownCallback);
      if (mouseMoveCallback) {
        $(element).off('CornerstoneToolsMouseMove', mouseMoveCallback);
      }
    },
    deactivate (element) {
      $(element).off('CornerstoneToolsMouseDownActivate', mouseDownCallback);
      if (mouseMoveCallback) {
        $(element).off('CornerstoneToolsMouseMove', mouseMoveCallback);
      }
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
