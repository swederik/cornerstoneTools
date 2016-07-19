(function(cornerstone, cornerstoneTools) {

    'use strict';

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
        this.stackOptions = stackOptions;

        this.render = function(element, imageObjects) {
            console.log('FusionRenderer render');
            console.log(this.stackOptions);
            console.log(element);

            var currentImageIdIndex = 80;
            // For the base layer, go to the currentImageIdIndex
            var baseImageObject = imageObjects[0];
            var currentImage = baseImageObject.images[currentImageIdIndex];
            var currentImageId = currentImage.imageId;
            cornerstone.loadAndCacheImage(currentImageId).then(function(image) {
                cornerstone.addLayer(element, image);
                cornerstone.updateImage(element);
            });

            // Splice out the first image
            imageObjects.splice(0, 1);

            // Loop through the remaining 'overlay' image objects
            imageObjects.forEach(function(imgObj) {
                var imageIds = imgObj.images.map(function(image) {
                    return image.imageId;
                });

                var imageId = findClosestImage(imageIds, currentImageId);
                if (!imageId) {
                    throw new Error('FusionRenderer: findClosestImage did not return an imageId');
                }

                cornerstone.loadAndCacheImage(imageId).then(function(image) {
                    cornerstone.addLayer(element, image);
                    cornerstone.updateImage(element);
                });
            });
        };
    }

    cornerstoneTools.stackRenderers = {};
    cornerstoneTools.stackRenderers.FusionRenderer = FusionRenderer;

})(cornerstone, cornerstoneTools);
