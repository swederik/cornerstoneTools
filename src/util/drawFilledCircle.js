(function(cornerstoneTools) {

    'use strict';

    function drawFilledCircle(context, coords, radius, color) {
        context.save();
        context.beginPath();
        context.arc(coords.x, coords.y, radius, 0, 2 * Math.PI, true);
        context.strokeStyle = color;
        context.fillStyle = color;
        context.stroke();
        context.fill();
        context.restore();
    }

    function clearCircle(context, coords, radius) {
        context.save();
        context.beginPath();
        context.arc(coords.x, coords.y, radius, 0, 2 * Math.PI, true);
        context.clip();
        context.clearRect(coords.x - radius - 1, coords.y - radius - 1,
                      radius * 2 + 2, radius * 2 + 2);
        context.restore();
    }

    // Module exports
    cornerstoneTools.drawFilledCircle = drawFilledCircle;
    cornerstoneTools.clearCircle = clearCircle;

})(cornerstoneTools);
