(function(cornerstone, cornerstoneTools) {

    'use strict';

    function isNumber(value) {
        return typeof value === 'number' && !isNaN(value);
    }

    function isInteger(number) {
        return number % 1 === 0;
    }

    function scrollToIndex(element, newImageIdIndex) {
        var toolData = cornerstoneTools.getToolState(element, 'stack');
        if (!toolData || !toolData.data || !toolData.data.length) {
            return;
        }

        var stackData = toolData.data[0];

        if (!isNumber(newImageIdIndex)) {
            throw 'scrollToIndex: index provided is not numeric: ' + newImageIdIndex;
        } else if (isNumber(newImageIdIndex) && !isInteger(newImageIdIndex)) {
            throw 'scrollToIndex: index provided is not an integer: ' + newImageIdIndex;
        }

        // Allow for negative indexing
        if (newImageIdIndex < 0) {
            newImageIdIndex += stackData.imageIds.length;
        }

        var startLoadingHandler = cornerstoneTools.loadHandlerManager.getStartLoadHandler();
        var endLoadingHandler = cornerstoneTools.loadHandlerManager.getEndLoadHandler();
        var errorLoadingHandler = cornerstoneTools.loadHandlerManager.getErrorLoadingHandler();
        var viewport = cornerstone.getViewport(element);

        function doneCallback(image) {
            if (stackData.currentImageIdIndex !== newImageIdIndex) {
                return;
            }

            // Check if the element is still enabled in Cornerstone,
            // if an error is thrown, stop here.
            try {
                // TODO: Add 'isElementEnabled' to Cornerstone?
                cornerstone.getEnabledElement(element);
            } catch(error) {
                return;
            }

            cornerstone.displayImage(element, image, viewport);
            if (endLoadingHandler) {
                endLoadingHandler(element);
            }
        }

        function failCallback(error) {
            var imageId = stackData.imageIds[newImageIdIndex];
            if (errorLoadingHandler) {
                errorLoadingHandler(element, imageId, error);
            }
        }

        if (newImageIdIndex === stackData.currentImageIdIndex) {
            return;
        }

        if (startLoadingHandler) {
            startLoadingHandler(element);
        }

        var eventData = {
            newImageIdIndex: newImageIdIndex,
            direction: newImageIdIndex - stackData.currentImageIdIndex
        };

        stackData.currentImageIdIndex = newImageIdIndex;
        var newImageId = stackData.imageIds[newImageIdIndex];

        // Retry image loading in cases where previous image promise
        // was rejected, if the option is set
        var config = cornerstoneTools.stackScroll.getConfiguration();
        if (config && config.retryLoadOnScroll === true) {
            var newImagePromise = cornerstone.imageCache.getImagePromise(newImageId);
            if (newImagePromise && newImagePromise.state() === 'rejected') {
                cornerstone.imageCache.removeImagePromise(newImageId);
            }
        }

        // Convert the preventCache value in stack data to a boolean
        var preventCache = !!stackData.preventCache;

        var imagePromise;
        if (preventCache) {
            imagePromise = cornerstone.loadImage(newImageId);
        } else {
            imagePromise = cornerstone.loadAndCacheImage(newImageId);
        }

        imagePromise.then(doneCallback, failCallback);
        // Make sure we kick off any changed download request pools
        cornerstoneTools.requestPoolManager.startGrabbing();

        $(element).trigger('CornerstoneStackScroll', eventData);
    }

    // module exports
    cornerstoneTools.scrollToIndex = scrollToIndex;
    cornerstoneTools.loadHandlers = {};

})(cornerstone, cornerstoneTools);
