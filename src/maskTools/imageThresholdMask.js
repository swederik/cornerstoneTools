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
        var storedPixelData = new Uint8ClampedArray(numPixels * 4);
        var storedPixelDataIndex = 0;

        // we have tool data for this element - iterate over each one and draw it
        //var context = eventData.canvasContext.canvas.getContext("2d");

        // create new context and canvas
        var canvas = document.createElement('canvas');
        canvas.width = eventData.canvasContext.canvas.width;
        canvas.height = eventData.canvasContext.canvas.height;
        var new_context = canvas.getContext("2d");
        var imageData = new_context.createImageData(width, height);

        var context = eventData.canvasContext.canvas.getContext("2d");
        cornerstone.setToPixelCoordinateSystem(eventData.enabledElement, new_context);
        cornerstone.setToPixelCoordinateSystem(eventData.enabledElement, context);

        for(var i=0; i < numPixels; i++) {
            if (pixelData[i] >= minThresh  && pixelData[i] <= maxThresh) {
                storedPixelData[storedPixelDataIndex++] = 0;
                storedPixelData[storedPixelDataIndex++] = 194;
                storedPixelData[storedPixelDataIndex++] = 237;
                storedPixelData[storedPixelDataIndex++] = 255;
            } else {
                storedPixelData[storedPixelDataIndex++] = 0;
                storedPixelData[storedPixelDataIndex++] = 0;
                storedPixelData[storedPixelDataIndex++] = 0;
                storedPixelData[storedPixelDataIndex++] = 0;
            }
        }

        imageData.data.set(storedPixelData);
        new_context.putImageData(imageData, 0, 0);

        var dataUri = canvas.toDataURL(); // produces a PNG file

        var img = new Image();
        img.src = dataUri; //"http://upload.wikimedia.org/wikipedia/commons/thumb/4/47/PNG_transparency_demonstration_1.png/280px-PNG_transparency_demonstration_1.png"; //transparent png
        //img.src = "http://upload.wikimedia.org/wikipedia/commons/thumb/4/47/PNG_transparency_demonstration_1.png/280px-PNG_transparency_demonstration_1.png"; //transparent png
        img.onload=function(){
            context.drawImage(img,0,0);
        };
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
