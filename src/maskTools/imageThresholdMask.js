var cornerstoneTools = (function ($, cornerstone, cornerstoneTools) {

    "use strict";

    if(cornerstoneTools === undefined) {
        cornerstoneTools = {};
    }

    var toolType = "imageThresholdMask";
    var overlay = {};

    ///////// BEGIN IMAGE RENDERING ///////

    function onImageRendered(e, eventData) {

        // Stupidly useing frame of reference state manager for now, since stack state management seems broken
        
        // Get the frame of reference
        var frameOfReferenceUID = cornerstoneTools.metaData.get('frameOfReferenceUID', eventData.image.imageId);
        
        // Get the tool data
        var toolData = cornerstoneTools.globalFrameOfReferenceSpecificToolStateManager.get(frameOfReferenceUID, toolType);
        //var toolData = cornerstoneTools.getToolState(e.currentTarget, toolType);

        // if we have no toolData for this element, return immediately as there is nothing to do
        if(toolData === undefined) {
            return;
        }

        var element = cornerstone.getEnabledElement(eventData.element);
        var image = element.image;
        var imageId = element.image.imageId;

        var context = eventData.canvasContext.canvas.getContext("2d");
        cornerstone.setToPixelCoordinateSystem(eventData.enabledElement, context);

        if (overlay[imageId] !== undefined) {
            // If the data has already been cached, draw it
            context.drawImage(overlay[imageId], 0, 0);
        } else {
            // Get minimum and maximum thresholds
            var minThresh = toolData.data[0].minThresh;
            var maxThresh = toolData.data[0].maxThresh;
            var color = toolData.data[0].color;
            var opacity = Math.ceil(toolData.data[0].opacity * 255);

            // Get the pixel data, and dimensions
            var pixelData = image.getPixelData();
            var height = image.height;
            var width = image.width;
            var numPixels = height * width;

            // Create a new overlayCanvas, but don't attach it to the DOM
            var overlayCanvas = document.createElement('canvas');
            overlayCanvas.width = eventData.canvasContext.canvas.width;
            overlayCanvas.height = eventData.canvasContext.canvas.height;
            
            // Fill new overlayCanvas's context with the specified color
            var overlayContext = overlayCanvas.getContext("2d");
            overlayContext.fillStyle = color;
            overlayContext.fillRect(0,0, width, height);
            
            // Set the overlay context to the pixel coordinate system
            cornerstone.setToPixelCoordinateSystem(eventData.enabledElement, overlayContext);

            // Create a new, blank ImageData object
            var imageData = overlayContext.getImageData(0, 0, width, height);
            var canvasImageDataIndex = 3;

            // Detach the overlayCanvas ImageData object
            var canvasImageDataData = imageData.data;
            
            var pixelDataIndex = 0;

            // Loop through the pixel data array.
            var pixel;
            while(pixelDataIndex < numPixels) {
                // Get the relevant pixel
                pixel = pixelData[pixelDataIndex++];

                // If it's within the threshold window
                // set the alpha channel to the desired opacity
                if (pixel >= minThresh && pixel <= maxThresh) {
                    canvasImageDataData[canvasImageDataIndex] = opacity;
                } else {
                    canvasImageDataData[canvasImageDataIndex] = 0;
                }
                canvasImageDataIndex += 4;
            }

            // Reattach the array to the ImageData object
            overlayContext.putImageData(imageData, 0, 0);

            // Produce a PNG file
            var dataUri = overlayCanvas.toDataURL();

            // Create an Image with the given PNG
            var img = new Image();
            img.src = dataUri;

            img.onload=function(){
                // Draw it onto the original canvas context
                context.drawImage(img, 0, 0);
            };

            overlay[imageId] = img;
        }
    }

    function enable(element, data)
    {
        if (data !== undefined) {
            //data = {"minThresh": 0,
            //        "maxThresh": 100,
            //        "color": "red",
            //        "opacity": 1.0};

            // Get the current frameOfReferenceUID 
            var enabledElement = cornerstone.getEnabledElement(element);
            var frameOfReferenceUID = cornerstoneTools.metaData.get('frameOfReferenceUID', enabledElement.image.imageId);

            // Save this data using the frame of reference state manager
            cornerstoneTools.globalFrameOfReferenceSpecificToolStateManager.add(frameOfReferenceUID, toolType, data);
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
