(function($, cornerstone, cornerstoneMath, cornerstoneTools) {

    function drawOverlays(context, image) {
        var x, y, i, j, k, byte, mask;
        if (!image.overlays || image.overlays.length === 0) {
            return;
        }
        context.beginPath();
        context.lineWidth = 1;

        image.overlays.forEach(function(overlay) {
            context.fillStyle = overlay.color;
            for (i = 0; i < overlay.pixelData.length; i++) {
                byte = overlay.pixelData[i];
                if (byte !== 0) {
                    for (j = 0; j < 8; j++) {
                        mask = byte >>> j;
                        if (mask & 1) {
                            k = (i * 8) + j;
                            x = (k % overlay.columns) + overlay.origin.x;
                            y = (k / overlay.columns) + overlay.origin.y;
                            context.fillRect(x, y, 1, 1);
                        }
                    }
                }
            }
        });
        context.stroke();
    }

})($, cornerstone, cornerstoneMath, cornerstoneTools);