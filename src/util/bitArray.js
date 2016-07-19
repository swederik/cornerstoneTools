(function($, cornerstone, cornerstoneTools) {

    'use strict';

    function getBytesForBinaryFrame(numPixels) {
        // check whether the 1-bit pixels exactly fit into bytes
        var remainder = numPixels % 8;
        // number of bytes that work on an exact fit
        var bytesRequired = Math.floor(numPixels / 8);

        // add one byte if we have a remainder
        if (remainder > 0) {
            bytesRequired++;
        }

        return bytesRequired;
    }

    function packBitArray(pixelData) {
        var numPixels = pixelData.length;
        var length = getBytesForBinaryFrame(numPixels);
        var bitPixelData = new Uint8Array(length);

        var bytePos = 0;
        for (var count = 0; count < numPixels; count++) {
            // Compute byte position
            bytePos = Math.floor(count / 8);

            var pixValue = (bitPixelData[count] !== 0);
            bitPixelData[bytePos] = bitPixelData[bytePos] | pixValue << (count % 8);
        }

        return pixelData;
    }

    cornerstoneTools.packBitArray = packBitArray;
    cornerstoneTools.getBytesForBinaryFrame = getBytesForBinaryFrame;

})($, cornerstone, cornerstoneTools);
