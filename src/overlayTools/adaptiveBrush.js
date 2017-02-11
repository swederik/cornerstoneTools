(function($, cornerstone, cornerstoneTools) {

    'use strict';

    // This module is for creating segmentation overlays

    /*
    on mouseDown
        - Record initial gray levels
        - on mouseDrag
            - Check image pixel values at the current location and around the current location in a specified shape
            - Record pixels that will be filled-in on dynamic painting canvas
            - Draw the paintbrush onto the on-screen canvas to give user feedback
        - on mouseUp
            - Update the element
                - This updates the dynamic image canvas using getPixelData
    */

    var configuration = {
        draw: 1,
        radius: 10,
        hoverColor: 'green',
        dragColor: 'yellow',
        overlayColor: 'red'
    };

    var lastCanvasCoords;
    var dynamicImageCanvas = document.createElement('canvas');

    // The adaptive pointer
    var radiusSet = 25; // Set this value with slider
    var thrMin = 0;
    var thrMax = 255;
    var pointerArray;
    var pointerArrayNextSize;
    var canvasWidth;
    var canvasHeight;
    var canvasArray;

    // Average time for radius 390 and width 2: 6ms
    function getCircleM1(radius, width) {
        var circleArray = [];

        // For flipping we calculate the last y value we have to go to 
        // and afterwards we flip x and y. This is the point where x and y are same.
        // Use * instead of pow as it seems to be faster for some browsers.
        var yMax = Math.round(Math.sqrt(radius * radius / 2));

        // Calculate the circle. This needs to be done only for 1/8 of the 
        // circle. Afterthe first 1/8th onlye x and y needs to be flipped.
        // Use * instead of pow as it seems to be faster for some browsers
        var index = 0;
        for (var y = 0; y <= yMax; y++) {
            var xMax = Math.round(Math.sqrt(radius * radius - y * y));
            for (var border = 1; border <= width; border++) {
                var x = xMax - border;
                circleArray[index++] = [y, x];
                circleArray[index++] = [x, y];
                circleArray[index++] = [-x, y];
                circleArray[index++] = [y, -x];
                circleArray[index++] = [-y, -x];
                circleArray[index++] = [-x, -y];
                circleArray[index++] = [x, -y];
                circleArray[index++] = [-y, x];
            }
        }
        return circleArray;
    }

    function recordInitialGrayLevels(eventData) {
        // Here we would get the min and max values in the current location
        console.log(eventData.currentPoints.canvas);
        thrMin = 0;
        thrMax = 255;
    }

    function calcPointer(radius) {
        var borderSet = 1;
        pointerArray = getCircleM1(radius, borderSet);
        if (radius < 26) {
            pointerArrayNextSize = getCircleM1(radius + 1, borderSet);
        }
    }

    function getWithinThresholdPixelDataSquare(image, x, y, width, height) {
        var luminance = [];
        var index = 0;
        var pixelData = image.getPixelData();
        var spIndex,
            row,
            column;

        for (row = 0; row < height; row++) {
            for (column = 0; column < width; column++) {
                spIndex = ((row + y) * image.columns) + (column + x);
                var val = pixelData[spIndex] * image.slope + image.intercept;
                if (val > thrMin && val < thrMax) {
                    luminance[index++] = 1;    
                } else {
                    luminance[index++] = 0;
                }
            }
        }
    }

    function drawToCanvas(canvas, imagePixelsBinary, x, y, width, height) {
        var context = canvas.getContext('2d');
        var imageData = context.getImageData(x, y, width, height);
        var numPixels = imageData.data.length / 4;

        var rgb = [255, 0, 0];
        for (var i=0; i<numPixels; i++) {
            if (imagePixelsBinary[index]) {
                imageData.data[index] = rgb[0];
                imageData.data[index++] = rgb[1];
                imageData.data[index++] = rgb[2];
                imageData.data[index++] = 255;
            } else {
                imageData.data[index] = rgb[0];
                imageData.data[index++] = rgb[1];
                imageData.data[index++] = rgb[2];
                imageData.data[index++] = 70;
            }
        }

        context.putImageData(imageData.data, x, y, width, height);

    }

    function defaultStrategy(eventData) {
        var configuration = cornerstoneTools.adaptiveBrush.getConfiguration();
        var enabledElement = cornerstone.getEnabledElement(eventData.element);
        var context = enabledElement.canvas.getContext('2d');
        context.setTransform(1, 0, 0, 1, 0, 0);

        var radius = configuration.radius * enabledElement.viewport.scale;

        // - on mouseDrag
        //  - Check image pixel values at the current location and around the current location in a specified shape
        //  - Record pixels that will be filled-in on dynamic painting canvas
        var pixels = getWithinThresholdPixelDataSquare(enabledElement.image, x, y, width, height);
        //  - Draw the paintbrush onto the on-screen canvas to give user feedback
        drawToCanvas(dynamicImageCanvas, pixels, x, y, width, height);

        lastCanvasCoords = eventData.currentPoints.canvas;

        cornerstone.updateImage(eventData.element);
    }

    function mouseMoveCallback(e, eventData) {
        lastCanvasCoords = eventData.currentPoints.canvas;
        cornerstone.updateImage(eventData.element);
    }

    function mouseUpCallback(e, eventData) {
        lastCanvasCoords = eventData.currentPoints.canvas;
        cornerstone.updateImage(eventData.element, true);

        $(eventData.element).off('CornerstoneToolsMouseDrag', mouseMoveCallback);
        $(eventData.element).off('CornerstoneToolsMouseDrag', dragCallback);
        $(eventData.element).off('CornerstoneToolsMouseUp', mouseUpCallback);
        $(eventData.element).off('CornerstoneToolsMouseClick', mouseUpCallback);
    }

    function dragCallback(e, eventData) {
        cornerstoneTools.adaptiveBrush.strategy(eventData);
        return false;
    }

    function mouseDownActivateCallback(e, eventData) {
        if (cornerstoneTools.isMouseButtonEnabled(eventData.which, e.data.mouseButtonMask)) {
            $(eventData.element).on('CornerstoneToolsMouseDrag', dragCallback);
            $(eventData.element).on('CornerstoneToolsMouseUp', mouseUpCallback);
            $(eventData.element).on('CornerstoneToolsMouseClick', mouseUpCallback);

            recordInitialGrayLevels(eventData);
            cornerstoneTools.adaptiveBrush.strategy(eventData);
            return false; // false = causes jquery to preventDefault() and stopPropagation() this event
        }

        $(eventData.element).on('CornerstoneToolsMouseDrag', mouseMoveCallback);
        $(eventData.element).on('CornerstoneToolsMouseUp', mouseUpCallback);
    }

    function onImageRendered(e, eventData) {
        var configuration = cornerstoneTools.adaptiveBrush.getConfiguration();
        var enabledElement = cornerstone.getEnabledElement(eventData.element);
        var context = enabledElement.canvas.getContext('2d');
        context.setTransform(1, 0, 0, 1, 0, 0);

        if (!lastCanvasCoords) {
            return;
        }

        var radius = configuration.radius * enabledElement.viewport.scale;
        cornerstoneTools.drawFilledCircle(context, lastCanvasCoords, radius, configuration.hoverColor);
    }

    function getPixelData() {
        /*jshint validthis:true */
        var context = dynamicImageCanvas.getContext('2d');

        this.rgba = true;
        var width = this.width;
        var height = this.height;
        var imageData = context.getImageData(0, 0, width, height);
        return imageData.data;
    }

    function activate(element, mouseButtonMask) {
        $(element).off('CornerstoneImageRendered', onImageRendered);
        $(element).on('CornerstoneImageRendered', onImageRendered);

        var eventData = {
            mouseButtonMask: mouseButtonMask
        };

        $(element).off('CornerstoneToolsMouseDownActivate', mouseDownActivateCallback);
        $(element).on('CornerstoneToolsMouseDownActivate', eventData, mouseDownActivateCallback);

        $(element).off('CornerstoneToolsMouseMove', mouseMoveCallback);
        $(element).on('CornerstoneToolsMouseMove', mouseMoveCallback);

        var enabledElement = cornerstone.getEnabledElement(element);
        dynamicImageCanvas.width = enabledElement.canvas.width;
        dynamicImageCanvas.height = enabledElement.canvas.height;
        canvasWidth = enabledElement.canvas.width;
        canvasHeight = enabledElement.canvas.height;
        var baseContext = enabledElement.canvas.getContext('2d');
        var canvasImageData = baseContext.getImageData(0, 0, canvasWidth, canvasHeight);
        var canvasData = canvasImageData.data;

        var context = dynamicImageCanvas.getContext('2d');
        context.fillStyle = 'rgba(0,0,0,0)';
        context.fillRect(0, 0, dynamicImageCanvas.width, dynamicImageCanvas.height);

        var dynamicImage = {
            minPixelValue: 0,
            maxPixelValue: 255,
            slope: 1.0,
            intercept: 0,
            windowCenter: 127,
            windowWidth: 256,
            getPixelData: getPixelData,
            rows: enabledElement.image.height,
            columns: enabledElement.image.width,
            height: enabledElement.image.height,
            width: enabledElement.image.width,
            color: true,
            invert: false,
            columnPixelSpacing: 1.0,
            rowPixelSpacing: 1.0,
            sizeInBytes: enabledElement.image.width * enabledElement.image.height * 4,
        };

        cornerstone.addLayer(element, dynamicImage);

        cornerstone.updateImage(element);
    }

    // Module exports
    cornerstoneTools.adaptiveBrush = cornerstoneTools.mouseButtonTool({
        mouseMoveCallback: mouseMoveCallback,
        mouseDownActivateCallback: mouseDownActivateCallback,
        onImageRendered: onImageRendered
    });

    cornerstoneTools.adaptiveBrush.activate = activate;

    cornerstoneTools.adaptiveBrush.setConfiguration(configuration);
    cornerstoneTools.adaptiveBrush.strategies = {
        default: defaultStrategy
    };

    cornerstoneTools.adaptiveBrush.strategy = defaultStrategy;

})($, cornerstone, cornerstoneTools);