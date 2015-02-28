var cornerstoneTools = (function ($, cornerstone, cornerstoneTools) {

    "use strict";

    if(cornerstoneTools === undefined) {
        cornerstoneTools = {};
    }

    var toolType = "imageThresholdMask";

    ///////// BEGIN IMAGE RENDERING ///////

    function onImageRendered(e, eventData) {

        var toolData = cornerstoneTools.getToolState(e.currentTarget, toolType);
        if(toolData === undefined) {
            return;
        }

        var minThresh = toolData.data[0].minThresh;
        var maxThresh = toolData.data[0].maxThresh;

        // if we have no toolData for this element, return immediately as there is nothing to do
        var element = cornerstone.getEnabledElement(eventData.element);
        var image = element.image;
        var pixelData = image.getPixelData();
        var height = image.height;
        var width = image.width;

        var numPixels = height * width;
        //var storedPixelData = new Uint8Array(numPixels * 4);
        var storedPixelDataIndex = 0;

        // we have tool data for this element - iterate over each one and draw it
        var context = eventData.canvasContext.canvas.getContext("2d");
        cornerstone.setToPixelCoordinateSystem(eventData.enabledElement, context);

        var imageData = context.createImageData(width, height);
        var storedPixelData = imageData.data;

        for(var i=0; i < numPixels; i++) {
            if (pixelData[i] >= minThresh  && pixelData[i] <= maxThresh) {
                imageData.data[storedPixelDataIndex++] = 0;
                imageData.data[storedPixelDataIndex++] = 194;
                imageData.data[storedPixelDataIndex++] = 237;
                imageData.data[storedPixelDataIndex++] = 255;
            } else {
                imageData.data[storedPixelDataIndex++] = 0;
                imageData.data[storedPixelDataIndex++] = 0;
                imageData.data[storedPixelDataIndex++] = 0;
                imageData.data[storedPixelDataIndex++] = 0;
            }
        }

        // draw the overlay
        //context.save();
        context.putImageData(imageData, 0, 0);
        //context.restore();
    }

    function enable(element, min, max)
    {
        if (min !== undefined && max !== undefined) {
            var data = {"minThresh": min,
                        "maxThresh": max};
            cornerstoneTools.addToolState(element, toolType, data);
        }
        $(element).on("CornerstoneImageRendered", onImageRendered);
        cornerstone.updateImage(element);
    }
    ///////// END IMAGE RENDERING ///////


    // module exports
    cornerstoneTools.imageThresholdMask = cornerstoneTools.maskTool({
        onImageRendered: onImageRendered
    });

    // Overwrite the standard enable method
    cornerstoneTools.imageThresholdMask.enable = enable;

    return cornerstoneTools;
}($, cornerstone, cornerstoneTools));
