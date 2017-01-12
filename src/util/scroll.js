(function(cornerstone, cornerstoneTools) {

    'use strict';

    function scroll(element, images) {
        var stackData = cornerstoneTools.getStackData(element);
        if (!stackData) {
            return;
        }

        var baseImageObject = stackData.stack.imageObjects[0];
        var numImages = baseImageObject.images.length;
        var newImageIdIndex = stackData.renderer.currentImageIdIndex + images;
        newImageIdIndex = Math.min(numImages - 1, newImageIdIndex);
        newImageIdIndex = Math.max(0, newImageIdIndex);

        cornerstoneTools.scrollToIndex(element, newImageIdIndex);
    }

    // module exports
    cornerstoneTools.scroll = scroll;

})(cornerstone, cornerstoneTools);
