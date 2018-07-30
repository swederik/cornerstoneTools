/* eslint no-loop-func: 0 */ // --> OFF
import external from './../externalModules.js';
import baseBrushTool from './../base/baseBrushTool.js';
import toolColors from './../stateManagement/toolColors.js';
// Utils
import getCircle from './shared/brushUtils/getCircle.js';
import { drawBrushPixels, drawBrushOnCanvas } from './shared/brushUtils/drawBrush.js';
// State
import { getToolState, addToolState } from './../stateManagement/toolState.js';
import mouseToolEventDispatcher from './../eventDispatchers/mouseToolEventDispatcher.js';

const cornerstone = external.cornerstone;

export default class extends baseBrushTool {
  constructor (name) {
    super({
      name: name || 'brush',
      supportedInteractionTypes: ['mouse'],
      configuration: defaultBrushConfiguration()
    });
  }

  /**
  * Event handler for MOUSE_MOVE event.
  *
  * @event
  * @param {Object} evt - The event.
  */
  mouseMoveCallback (evt) {
    console.log('brushTool.mouseMoveCallback');
    const eventData = evt.detail;

    this._dragging = false;
    this._lastImageCoords = eventData.currentPoints.image;
  }

  /**
  * Event handler for NEW_IMAGE event.
  *
  * @event
  * @param {Object} evt - The event.
  */
  onNewImageCallback(evt) {
    console.log('brushTool.onNewImageCallback');

    const config = this.configuration;
    const eventData = evt.detail;
    const element = eventData.element;
    let toolData = getToolState(element, this._referencedToolData);

    if (!toolData) {
      const pixelData = new Uint8ClampedArray(eventData.image.width * eventData.image.height);
      addToolState(element, this._referencedToolData, { pixelData });
      toolData = getToolState(element, this._referencedToolData);
    }

    toolData.data[0].invalidated = true;
    this._newImage = true;

    external.cornerstone.updateImage(eventData.element);
  }

  /**
  * Event handler for MOUSE_DRAG event.
  *
  * @event
  * @param {Object} evt - The event.
  */
  mouseDragCallback (evt) {
    console.log('brushTool.mouseDragCallback');
    const eventData = evt.detail;

    this._paint(eventData);
    this._dragging = true;
    this._lastImageCoords = eventData.currentPoints.image;
  }

  /**
  * Event handler for MOUSE_DRAG event.
  *
  * @event
  * @param {Object} evt - The event.
  */
  mouseDownCallback (evt) {
    console.log('brushTool.mouseDownCallback');
    const eventData = evt.detail;

    this._paint(eventData);
    this.configuration.dragging = true;
    this._lastImageCoords = eventData.currentPoints.image;
  }


  /**
   * renderBrush - called by the event dispatcher to render the image.
   *
   */
  renderBrush (evt) {
    const eventData = evt.detail;

    if (!this._lastImageCoords) {
      return;
    }

    const { rows, columns } = eventData.image;
    const { x, y } = this._lastImageCoords;

    if (x < 0 || x > columns ||
      y < 0 || y > rows) {
      return;
    }

    // Draw the hover overlay on top of the pixel data
    const configuration = this._configuration;
    const radius = configuration.radius;
    const context = eventData.canvasContext;
    const color = this._dragging ? configuration.dragColor : configuration.hoverColor;
    const element = eventData.element;

    context.setTransform(1, 0, 0, 1, 0, 0);

    const { cornerstone } = external;
    const mouseCoordsCanvas = cornerstone.pixelToCanvas(element, this._lastImageCoords);
    const canvasTopLeft = cornerstone.pixelToCanvas(element, { x: 0, y: 0 });
    const radiusCanvas = cornerstone.pixelToCanvas(element, { x: radius, y: 0 });
    const circleRadius = Math.abs(radiusCanvas.x - canvasTopLeft.x);
    context.beginPath();
    context.strokeStyle = color;
    context.ellipse(mouseCoordsCanvas.x, mouseCoordsCanvas.y, circleRadius, circleRadius, 0, 0, 2 * Math.PI);
    context.stroke();
  }

  _paint(eventData) {
    const configuration = this.configuration;
    const element = eventData.element;
    const { rows, columns } = eventData.image;
    const { x, y } = eventData.currentPoints.image;
    let toolData = getToolState(element, this._referencedToolData);

    let pixelData;
    if (!toolData) {
      pixelData = new Uint8ClampedArray(eventData.image.width * eventData.image.height);
      addToolState(element, this._referencedToolData, { pixelData });
      toolData = getToolState(element, this._referencedToolData);
    } else {
      pixelData = toolData.data[0].pixelData;
    }

    const brushPixelValue = configuration.draw;
    const radius = configuration.radius;

    if (x < 0 || x > columns ||
      y < 0 || y > rows) {
      return;
    }

    const pointerArray = getCircle(radius, rows, columns, x, y);

    drawBrushPixels(pointerArray, pixelData, brushPixelValue, columns);

    toolData.data[0].invalidated = true;

    external.cornerstone.updateImage(eventData.element);
  }


}

function defaultBrushConfiguration () {
  return {
    draw: 1,
    radius: 30,
    hoverColor: toolColors.getToolColor(),
    dragColor: toolColors.getActiveColor()
  };
}