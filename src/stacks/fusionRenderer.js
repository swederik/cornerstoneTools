(function(cornerstone, cornerstoneTools) {

    'use strict';

    function isInteger(x) {
        return (typeof x === 'number') && (x % 1 === 0);
    }

    var distances = {};

    function getImagePositionPatient(imageId) {
        var imagePlane = cornerstoneTools.metaData.get('imagePlane', imageId);
        if (!imagePlane) {
            throw new Error('getImagePosition: Image plane is not available for imageId: ' + imageId);
        }

        if (!imagePlane.imagePositionPatient) {
            throw new Error('getImagePosition: Image position patient is not available for imageId: ' + imageId);
        }

        return imagePlane.imagePositionPatient;
    }

    function getDistanceBetween(imageId1, imageId2) {
        // Check if we have already calculated this distance

        // TODO: There is probably a smarter way to store the results of this computation?
        // Maybe a hash of the combined image ids?
        if (distances[imageId1] && distances[imageId1].hasOwnProperty(imageId2)) {
            return distances[imageId1][imageId2];
        } else if (distances[imageId2] && distances[imageId2].hasOwnProperty(imageId1)) {
            return distances[imageId2][imageId1];
        }

        // If the distance between these two images is not already calculated, calculate it
        var imagePosition1 = getImagePositionPatient(imageId1);
        var imagePosition2 = getImagePositionPatient(imageId2);
        var distance = imagePosition1.distanceTo(imagePosition2);

        // Store the calculated data in the cache
        distances[imageId1] = {};
        distances[imageId1][imageId2] = distance;

        // Return the distance
        return distance;
    }

    function findClosestImage(imageIds, targetImageId) {
        var closestImageId;
        var minDistance = Infinity;

        // Find the closest image based on the distance between the
        imageIds.forEach(function(imageId) {
            var distance = getDistanceBetween(imageId, targetImageId);
            if (distance < minDistance) {
                minDistance = distance;
                closestImageId = imageId;
            }
        });

        return closestImageId;
    }

    /**
     * Creates a FusionRenderer
     *
     * @param stackOptions
     */
    function FusionRenderer(stackOptions) {
        // TODO: Create a base Renderer class and extend from it for the FusionRenderer
        this.stackOptions = stackOptions;
        this.currentImageIdIndex = 0;
        this.preventCache = false;
        this.layerIds = [];

        this.render = function(element, stack) {
            console.log('FusionRenderer render');

            var imageObjects = stack.imageObjects;

            // Move this to base Renderer class
            if (!isInteger(this.currentImageIdIndex)) {
                throw new Error('FusionRenderer: render - Image ID Index is not an integer');
            }

            // TODO: Figure out what to do with LoadHandlers in this scenario...

            // For the base layer, go to the currentImageIdIndex
            var baseImageObject = imageObjects[0];
            var currentImage = baseImageObject.images[this.currentImageIdIndex];
            var currentImageId = currentImage.imageId;

            // Remove this when we move to ES6 and can use arrow functions
            var layerIds = this.layerIds;
            cornerstone.loadAndCacheImage(currentImageId).then(function(image) {
                // TODO: Maybe make an Update Or Add layer function?
                if (layerIds && layerIds[0]) {
                    var currentLayerId = layerIds[0];
                    var layer = cornerstone.getLayers(element, currentLayerId);
                    layer.image = image;
                } else {
                    var layerId = cornerstone.addLayer(element, image);
                    layerIds.push(layerId);
                }

                cornerstone.updateImage(element);
            });

            // Splice out the first image
            var overlayImageObjects = imageObjects.slice(1, imageObjects.length);

            // Loop through the remaining 'overlay' image objects
            overlayImageObjects.forEach(function(imgObj, overlayLayerIndex) {
                var imageIds = imgObj.images.map(function(image) {
                    return image.imageId;
                });

                var imageId = findClosestImage(imageIds, currentImageId);
                if (!imageId) {
                    throw new Error('FusionRenderer: findClosestImage did not return an imageId');
                }

                cornerstone.loadAndCacheImage(imageId).then(function(image) {
                    var layerIndex = overlayLayerIndex + 1;
                    if (layerIds && layerIds[layerIndex]) {
                        var currentLayerId = layerIds[layerIndex];
                        var layer = cornerstone.getLayers(element, currentLayerId);
                        layer.image = image;
                    } else {
                        var layerId = cornerstone.addLayer(element, image);
                        layerIds.push(layerId);
                    }

                    cornerstone.updateImage(element);
                });
            });
        };
    }

    cornerstoneTools.stackRenderers = {};
    cornerstoneTools.stackRenderers.FusionRenderer = FusionRenderer;

})(cornerstone, cornerstoneTools);
