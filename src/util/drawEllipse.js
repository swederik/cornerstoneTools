(function(cornerstoneTools) {

    'use strict';

    // http://stackoverflow.com/questions/2172798/how-to-draw-an-oval-in-html5-canvas
    function drawEllipse(context, centerX, centerY, radiusX, radiusY, rotationAngle) {
        if (rotationAngle === undefined) {
            rotationAngle = 0;
        }

        context.beginPath();
        
        for (var i = 0 * Math.PI; i < 2 * Math.PI; i += 0.01) {
            var xPos = centerX - (radiusX * Math.sin(i)) * Math.sin(rotationAngle * Math.PI) + (radiusY * Math.cos(i)) * Math.cos(rotationAngle * Math.PI);
            var yPos = centerY + (radiusY * Math.cos(i)) * Math.sin(rotationAngle * Math.PI) + (radiusX * Math.sin(i)) * Math.cos(rotationAngle * Math.PI);

            if (i === 0) {
                context.moveTo(xPos, yPos);
            } else {
                context.lineTo(xPos, yPos);
            }
        }

        context.closePath();
        context.stroke();
    }

    // Module exports
    cornerstoneTools.drawEllipse = drawEllipse;

})(cornerstoneTools);
