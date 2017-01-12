(function(cornerstone, cornerstoneTools) {

    'use strict';

    function scrollToIndex(element, newImageIdIndex) {
        var stackData = cornerstoneTools.getStackData(element);
        if (!stackData) {
            return;
        }

        var renderer = stackData.renderer;

        // Allow for negative indexing
        var baseImageObject = stackData.stack.imageObjects[0];
        var numImages = baseImageObject.images.length;
        if (newImageIdIndex < 0) {
            newImageIdIndex += numImages;
        }

        if (newImageIdIndex === renderer.currentImageIdIndex) {
            return;
        }

        renderer.currentImageIdIndex = newImageIdIndex;
        renderer.render(element, stackData.stack);

        // Make sure we kick off any changed download request pools
        cornerstoneTools.requestPoolManager.startGrabbing();

        // Fire an event to let the application know that an element was scrolled
        // to a new image ID index
        var eventData = {
            newImageIdIndex: newImageIdIndex,
        };

        $(element).trigger('CornerstoneStackScroll', eventData);
    }

    // module exports
    cornerstoneTools.scrollToIndex = scrollToIndex;

})(cornerstone, cornerstoneTools);
