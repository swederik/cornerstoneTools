import * as cornerstone from 'cornerstone-core';

export default class FusionRenderer {
  constructor () {
    this.currentImageIdIndex = 0;
    this.layerIds = [];
    this.findImageFn = undefined;
  }

  render (element, imageStacks) {
    // Move this to base Renderer class
    if (!Number.isInteger(this.currentImageIdIndex)) {
      throw new Error('FusionRenderer: render - Image ID Index is not an integer');
    }

    if (!this.findImageFn) {
      throw new Error('No findImage function has been defined');
    }

    // TODO: Figure out what to do with LoadHandlers in this scenario...

    // For the base layer, go to the currentImageIdIndex
    const baseImageObject = imageStacks[0];
    const currentImageId = baseImageObject.imageIds[this.currentImageIdIndex];

    // TODO: Figure out how to calculate the minimum distance
    const minDistance = 1;

    cornerstone.loadAndCacheImage(currentImageId).then((image) => {
      if (this.layerIds && this.layerIds[0]) {
        const currentLayerId = this.layerIds[0];
        const layer = cornerstone.getLayer(element, currentLayerId);

        layer.image = image;
      } else {
        const layerId = cornerstone.addLayer(element, image, baseImageObject.options);

        this.layerIds.push(layerId);
      }

      cornerstone.updateImage(element);

      // Splice out the first image
      const overlayImageStacks = imageStacks.slice(1, imageStacks.length);

      // Loop through the remaining 'overlay' image stacks
      overlayImageStacks.forEach((imgObj, overlayLayerIndex) => {
        const imageId = this.findImageFn(imgObj.imageIds, currentImageId, minDistance);
        const layerIndex = overlayLayerIndex + 1;
        let currentLayerId;
        let layer;

        if (this.layerIds && this.layerIds[layerIndex]) {
          currentLayerId = this.layerIds[layerIndex];
          layer = cornerstone.getLayer(element, currentLayerId);
        }

        if (!imageId) {
          if (layer) {
            layer.image = undefined;
          }

          return;
        }

        cornerstone.loadAndCacheImage(imageId).then((image) => {
          if (layer) {
            layer.image = image;
          } else {
            const layerId = cornerstone.addLayer(element, image, imgObj.options);

            this.layerIds.push(layerId);
          }

          cornerstone.updateImage(element, true);
        });
      });
    });
  }
}
