import EVENTS from '../events.js';
import external from '../externalModules.js';
import simpleMouseButtonTool from './simpleMouseButtonTool.js';
import touchDragTool from './touchDragTool.js';
import isMouseButtonEnabled from '../util/isMouseButtonEnabled.js';

function mouseUpCallback (e) {
  const eventData = e.detail;
  const element = eventData.element;

  element.removeEventListener(EVENTS.MOUSE_DRAG, dragCallback);
  element.removeEventListener(EVENTS.MOUSE_UP, mouseUpCallback);
  element.removeEventListener(EVENTS.MOUSE_CLICK, mouseUpCallback);
}

function mouseDownCallback (e) {
  const eventData = e.detail;
  const element = eventData.element;

  if (isMouseButtonEnabled(eventData.which, e.data.mouseButtonMask)) {
    element.addEventListener(EVENTS.MOUSE_DRAG, dragCallback);
    element.addEventListener(EVENTS.MOUSE_UP, mouseUpCallback);
    element.addEventListener(EVENTS.MOUSE_CLICK, mouseUpCallback);

    return false; // False = causes jquery to preventDefault() and stopPropagation() this event
  }
}

function dragCallback (e) {
  const eventData = e.detail;

  // FIXME: Copied from Cornerstone src/internal/calculateTransform.js, should be exposed from there.
  let widthScale = eventData.viewport.scale;
  let heightScale = eventData.viewport.scale;

  if (eventData.image.rowPixelSpacing < eventData.image.columnPixelSpacing) {
    widthScale *= (eventData.image.columnPixelSpacing / eventData.image.rowPixelSpacing);
  } else if (eventData.image.columnPixelSpacing < eventData.image.rowPixelSpacing) {
    heightScale *= (eventData.image.rowPixelSpacing / eventData.image.columnPixelSpacing);
  }

  eventData.viewport.translation.x += (eventData.deltaPoints.page.x / widthScale);
  eventData.viewport.translation.y += (eventData.deltaPoints.page.y / heightScale);
  external.cornerstone.setViewport(eventData.element, eventData.viewport);

  return false; // False = causes jquery to preventDefault() and stopPropagation() this event
}

const pan = simpleMouseButtonTool(mouseDownCallback);
const panTouchDrag = touchDragTool(dragCallback);

export {
  pan,
  panTouchDrag
};
