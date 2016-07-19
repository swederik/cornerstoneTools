(function(cornerstone, cornerstoneTools) {

    'use strict';

    /**
     * Creates an Image Object
     *
     * @param images
     * @param options
     * @constructor
     */
    function ImageObject(images, options) {
        this.images = images;
        this.options = options;
    }

    cornerstoneTools.ImageObject = ImageObject;

})(cornerstone, cornerstoneTools);
