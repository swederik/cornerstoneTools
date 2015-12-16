(function($, cornerstone, cornerstoneMath, cornerstoneTools) {

    'use strict';

    var previousRotation = 0;

    function calculateToolBoundingBox(element, data) {
        var handleNames = Object.keys(data.handles);

        // Initialize the variables
        var firstHandle = data.handles[handleNames[0]];
        var imageData = {
            leftLeast: firstHandle.x,
            topLeast: firstHandle.y,
            leftMost: firstHandle.x,
            topMost: firstHandle.y
        };

        var handleCanvas = cornerstone.pixelToCanvas(element, firstHandle);
        var canvasData = {
            leftLeast: handleCanvas.x,
            topLeast: handleCanvas.y,
            leftMost: handleCanvas.x,
            topMost: handleCanvas.y
        };

        // Search all handles to find the most and least
        // left / top points
        handleNames.forEach(function(name) {
            var handle = data.handles[name];
            if (handle.movesIndependently === true) {
                return;
            }

            imageData = {
                leftLeast: Math.min(imageData.leftLeast, handle.x),
                topLeast: Math.min(imageData.topLeast, handle.y),
                leftMost: Math.max(imageData.leftMost, handle.x),
                topMost: Math.max(imageData.topMost, handle.y)
            };

            // Calculate values in the canvas coordinate system
            handleCanvas = cornerstone.pixelToCanvas(element, handle);

            canvasData = {
                leftLeast: Math.min(canvasData.leftLeast, handleCanvas.x),
                topLeast: Math.min(canvasData.topLeast, handleCanvas.y),
                leftMost: Math.max(canvasData.leftMost, handleCanvas.x),
                topMost: Math.max(canvasData.topMost, handleCanvas.y)
            };
        });

        return {
            canvas: {
                left: canvasData.leftLeast,
                top: canvasData.topLeast,
                width: canvasData.leftMost - canvasData.leftLeast,
                height: canvasData.topMost - canvasData.topLeast
            },
            image: {
                left: imageData.leftLeast,
                top: imageData.topLeast,
                width: imageData.leftMost - imageData.leftLeast,
                height: imageData.topMost - imageData.topLeast
            }
        };
    }

    function rotateTool(mouseEventData, data, toolData, options, doneCallback) {
        console.log('rotateTool');
        var element = mouseEventData.element;
        var rect = calculateToolBoundingBox(element, data);

        function mouseDragCallback(e, eventData) {
            var points = {
                x: eventData.currentPoints.canvas.x,
                y: eventData.currentPoints.canvas.y
            };

            var pointsFromCenter = {
                x: points.x - rect.canvas.left - rect.canvas.width / 2,
                // Invert the coordinate system so that up is positive
                y: -1 * (points.y - rect.canvas.top - rect.canvas.height / 2)
            };

            var rotationRadians = Math.atan2(pointsFromCenter.y, pointsFromCenter.x);
            var rotationDegrees = rotationRadians * (180 / Math.PI);
            //var rotation = -1 * rotationDegrees + 90;
            var rotation = rotationDegrees - previousRotation;

            console.log('Rotating tool by ' + rotation + ' degrees');

            data.active = true;

            var sinA = Math.sin(rotation);
            var cosA = Math.cos(rotation);

            Object.keys(data.handles).forEach(function(name) {
                var handle = data.handles[name];
                if (handle.movesIndependently === true) {
                    return;
                }

                var handleFromCenter = {
                    x: handle.x - rect.image.left - rect.image.width / 2,
                    y: handle.y - rect.image.top - rect.image.height / 2
                };

                var newX = handleFromCenter.x * cosA - handleFromCenter.y * sinA;
                var newY = handleFromCenter.x * sinA + handleFromCenter.y * cosA;

                handle.x = newX + rect.image.left + rect.image.width / 2;
                handle.y = newY + rect.image.top + rect.image.height / 2;
                
                if (options.preventHandleOutsideImage === true) {
                    handle.x = Math.max(handle.x, 0);
                    handle.x = Math.min(handle.x, eventData.image.width);

                    handle.y = Math.max(handle.y, 0);
                    handle.y = Math.min(handle.y, eventData.image.height);
                }
            });

            previousRotation = rotation;

            cornerstone.updateImage(element);
            return false; // false = causes jquery to preventDefault() and stopPropagation() this event
        }

        $(element).on('CornerstoneToolsMouseDrag', mouseDragCallback);

        function mouseUpCallback(e, eventData) {
            previousRotation = 0;
            data.active = false;
            data.invalidated = true;

            $(element).off('CornerstoneToolsMouseDrag', mouseDragCallback);
            $(element).off('CornerstoneToolsMouseUp', mouseUpCallback);
            $(element).off('CornerstoneToolsMouseClick', mouseUpCallback);

            // If any handle is outside the image, delete the tool data
            if (options.deleteIfHandleOutsideImage === true) {
                var image = eventData.image;
                var handleOutsideImage = false;
                var rect = {
                    top: 0,
                    left: 0,
                    width: image.width,
                    height: image.height
                };
                
                Object.keys(data.handles).forEach(function(name) {
                    var handle = data.handles[name];
                    handle.active = false;
                    if (cornerstoneMath.point.insideRect(handle, rect) === false) {
                        handleOutsideImage = true;
                        return;
                    }
                });

                if (handleOutsideImage) {
                    // find this tool data
                    var indexOfData = -1;
                    toolData.data.forEach(function(thisToolData, index) {
                        if (thisToolData === data) {
                            indexOfData = index;
                            return;
                        }
                    });

                    if (indexOfData !== -1) {
                        toolData.data.splice(indexOfData, 1);
                    }
                }
            }

            cornerstone.updateImage(element);

            if (typeof doneCallback === 'function') {
                doneCallback();
            }
        }

        $(element).on('CornerstoneToolsMouseUp', mouseUpCallback);
        $(element).on('CornerstoneToolsMouseClick', mouseUpCallback);
        return true;
    }

    // module/private exports
    cornerstoneTools.rotateTool = rotateTool;

})($, cornerstone, cornerstoneMath, cornerstoneTools);
