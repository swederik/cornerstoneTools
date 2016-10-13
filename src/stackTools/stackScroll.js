(function($, cornerstone, cornerstoneTools) {

    'use strict';

    function mouseUpCallback(e, eventData) {
        $(eventData.element).off('CornerstoneToolsMouseDrag', dragCallback);
        $(eventData.element).off('CornerstoneToolsMouseUp', mouseUpCallback);
        $(eventData.element).off('CornerstoneToolsMouseClick', mouseUpCallback);
    }

    function mouseDownCallback(e, eventData) {
        if (cornerstoneTools.isMouseButtonEnabled(eventData.which, e.data.mouseButtonMask)) {
            var mouseDragEventData = {
                deltaY: 0
            };
            $(eventData.element).on('CornerstoneToolsMouseDrag', mouseDragEventData, dragCallback);
            $(eventData.element).on('CornerstoneToolsMouseUp', mouseUpCallback);
            $(eventData.element).on('CornerstoneToolsMouseClick', mouseUpCallback);
            e.stopImmediatePropagation();
            return false;
        }
    }

    function mouseWheelCallback(e, eventData) {
        var config = cornerstoneTools.stackScroll.getConfiguration();
        var pixelsPerImage = config.wheelDeltaPixelsPerImage || 100;
        var images = eventData.direction * Math.max(1, Math.round(Math.abs(eventData.wheelDeltaPixels) / pixelsPerImage));
        cornerstoneTools.scroll(eventData.element, images);

        // false = causes jquery to preventDefault() and stopPropagation() this event
        return false;
    }

    function dragCallback(e, eventData) {
        var element = eventData.element;

        var toolData = cornerstoneTools.getToolState(element, 'stack');
        if (!toolData || !toolData.data || !toolData.data.length) {
            return;
        }

        var stackData = toolData.data[0];

        var config = cornerstoneTools.stackScroll.getConfiguration();

        // The Math.max here makes it easier to mouseDrag-scroll small image stacks
        var pixelsPerImage = $(element).height() / Math.max(stackData.imageIds.length, 8);
        if (config && config.stackScrollSpeed) {
            pixelsPerImage = config.stackScrollSpeed;
        }

        e.data.deltaY = e.data.deltaY || 0;
        e.data.deltaY += eventData.deltaPoints.page.y;
        if (Math.abs(e.data.deltaY) >= pixelsPerImage) {
            var imageDelta = e.data.deltaY / pixelsPerImage;
            var imageIdIndexOffset = Math.round(imageDelta);
            var imageDeltaMod = e.data.deltaY % pixelsPerImage;
            e.data.deltaY = imageDeltaMod;
            cornerstoneTools.scroll(element, imageIdIndexOffset);
        }

        return false; // false = causes jquery to preventDefault() and stopPropagation() this event
    }

    // module/private exports
    cornerstoneTools.stackScroll = cornerstoneTools.simpleMouseButtonTool(mouseDownCallback);
    cornerstoneTools.stackScrollWheel = cornerstoneTools.mouseWheelTool(mouseWheelCallback);

    var stackScrollWheelConfig = {
        // Smaller numbers lead to faster scrolling
        // 100 is the default here because in my empirical tests,
        // a single tick of my mouse produces a value of 100 pixels
        // on Firefox on Windows. This is the largest I noticed in my
        // tests. In some cases (e.g. >500 image stacks), the user
        // may want to speed up stack scrolling. Lowering this value
        // can do this.
        wheelDeltaPixelsPerImage: 100
    };

    cornerstoneTools.stackScrollWheel.setConfiguration(stackScrollWheelConfig);

    var options = {
        eventData: {
            deltaY: 0
        }
    };
    cornerstoneTools.stackScrollTouchDrag = cornerstoneTools.touchDragTool(dragCallback, options);

    function multiTouchDragCallback(e, eventData) {
        var config = cornerstoneTools.stackScrollMultiTouch.getConfiguration();
        if (config && config.testPointers(eventData)) {
            dragCallback(e, eventData);
        }
    }

    var configuration = {
        testPointers: function(eventData) {
            return (eventData.numPointers >= 3);
        }
    };

    cornerstoneTools.stackScrollMultiTouch = cornerstoneTools.multiTouchDragTool(multiTouchDragCallback, options);
    cornerstoneTools.stackScrollMultiTouch.setConfiguration(configuration);

})($, cornerstone, cornerstoneTools);
