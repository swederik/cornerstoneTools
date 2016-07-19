(function(cornerstone, cornerstoneTools) {

    'use strict';

    /**
     * Creates a Stack
     *
     * @param imageObjects Stack of composite image objects (pixel data, masks, etc)
     * @param renderer Pluggable renderer
     */
    function Stack(imageObjects) {
        this.imageObjects = imageObjects;
    }

    cornerstoneTools.Stack = Stack;

})(cornerstone, cornerstoneTools);
