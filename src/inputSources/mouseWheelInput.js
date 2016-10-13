(function($, cornerstone, cornerstoneTools) {

    'use strict';

    function mouseWheel(e) {
        e.preventDefault();

        var element = e.target.parentNode;

        if (!e.deltaY) {
            return;
        }

        var x;
        var y;
        if (e.pageX !== undefined && e.pageY !== undefined) {
            x = e.pageX;
            y = e.pageY;
        }

        var startingCoords = cornerstone.pageToPixel(element, x, y);

        var wheelDeltaPixels;

        if (e.deltaMode === 1) {
            // DeltaY is in Lines
            var pixelsPerLine = 40;
            wheelDeltaPixels = e.deltaY * pixelsPerLine;
        } else {
            // DeltaY is already in Pixels
            wheelDeltaPixels = e.deltaY;
        }

        var direction = e.deltaY < 0 ? -1 : 1;

        var mouseWheelData = {
            element: element,
            viewport: cornerstone.getViewport(element),
            image: cornerstone.getEnabledElement(element).image,
            direction: direction,
            wheelDeltaPixels: wheelDeltaPixels,
            pageX: x,
            pageY: y,
            imageX: startingCoords.x,
            imageY: startingCoords.y
        };

        $(element).trigger('CornerstoneToolsMouseWheel', mouseWheelData);
    }

    function enable(element) {
        // Prevent handlers from being attached multiple times
        disable(element);

        cornerstoneTools.addWheelListener(element, mouseWheel);
    }

    function disable(element) {
        cornerstoneTools.removeWheelListener(element, mouseWheel);
    }

    // module exports
    cornerstoneTools.mouseWheelInput = {
        enable: enable,
        disable: disable
    };

})($, cornerstone, cornerstoneTools);
