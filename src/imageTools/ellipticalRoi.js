(function($, cornerstone, cornerstoneMath, cornerstoneTools) {

    'use strict';

    var toolType = 'ellipticalRoi';

    ///////// BEGIN ACTIVE TOOL ///////
    function createNewMeasurement(mouseEventData) {
        // create the measurement data for this tool with the end handle activated
        var measurementData = {
            visible: true,
            active: true,
            invalidated: true,
            angle: 0,
            handles: {
                start: {
                    x: mouseEventData.currentPoints.image.x,
                    y: mouseEventData.currentPoints.image.y,
                    highlight: true,
                    active: false
                },
                end: {
                    x: mouseEventData.currentPoints.image.x,
                    y: mouseEventData.currentPoints.image.y,
                    highlight: true,
                    active: true
                },
                textBox: {
                    active: false,
                    hasMoved: false,
                    movesIndependently: false,
                    drawnIndependently: true,
                    allowedOutsideImage: true,
                    hasBoundingBox: true
                }
            },
            rotateHandle: {}
        };

        return measurementData;
    }
    ///////// END ACTIVE TOOL ///////

    ///////// BEGIN IMAGE RENDERING ///////
    function pointInEllipse(ellipse, location) {
        /* This is a more general form of the circle equation
         *
         * X^2/a^2 + Y^2/b^2 <= 1
         */

        var normalized = {
            x: location.x - center.x,
            y: location.y - center.y
        };

        var radiiSquared = {
            x: ellipse.radiusX * ellipse.radiusX,
            y: ellipse.radiusY * ellipse.radiusY
        };

        var term1 = Math.pow((normalized.x * Math.cos(angle) - normalized.y * Math.sin(angle)), 2) / radiiSquared.x;
        var term2 = Math.pow((normalized.x * Math.sin(angle) + normalized.y * Math.cos(angle)), 2) / radiiSquared.y;

        var inEllipse = (term1 + term2) <= 1.0;
        return inEllipse;
    }

    function calculateMeanStdDev(sp, ellipse) {
        // TODO: Get a real statistics library here that supports large counts

        var sum = 0;
        var sumSquared = 0;
        var count = 0;
        var index = 0;

        for (var y = ellipse.top; y < ellipse.top + ellipse.height; y++) {
            for (var x = ellipse.left; x < ellipse.left + ellipse.width; x++) {
                if (pointInEllipse(ellipse, {
                    x: x,
                    y: y
                }) === true) {
                    sum += sp[index];
                    sumSquared += sp[index] * sp[index];
                    count++;
                }

                index++;
            }
        }

        if (count === 0) {
            return {
                count: count,
                mean: 0.0,
                variance: 0.0,
                stdDev: 0.0
            };
        }

        var mean = sum / count;
        var variance = sumSquared / count - mean * mean;

        return {
            count: count,
            mean: mean,
            variance: variance,
            stdDev: Math.sqrt(variance)
        };
    }

    function getEllipseRadii(topLeft, bottomRight, angle) {
        var radii = {};
        return radii;
    }

    function pointNearEllipse(element, data, coords, distance) {
        var startCanvas = cornerstone.pixelToCanvas(element, data.handles.start);
        var endCanvas = cornerstone.pixelToCanvas(element, data.handles.end);

        var center = {
            x: (startCanvas.x + endCanvas.x) / 2,
            y: (startCanvas.x + endCanvas.x) / 2
        };

        var radius = getEllipseRadii(startCanvas, endCanvas, data.angle);

        var minorEllipse = {
            x: center.x,
            y: center.y,
            radiusX: radius.x - distance
            radiusY: radius.y - distance
        };


        var majorEllipse = {
            x: center.x,
            y: center.y,
            radiusX: radius.x + distance
            radiusY: radius.y + distance
        };

        var pointInMinorEllipse = pointInEllipse(minorEllipse, coords);
        var pointInMajorEllipse = pointInEllipse(majorEllipse, coords);

        return (pointInMajorEllipse && !pointInMinorEllipse);
    }

    function pointNearTool(element, data, coords) {
        return pointNearEllipse(element, data, coords, 15);
    }

    function pointNearToolTouch(element, data, coords) {
        return pointNearEllipse(element, data, coords, 25);
    }

    function numberWithCommas(x) {
        // http://stackoverflow.com/questions/2901102/how-to-print-a-number-with-commas-as-thousands-separators-in-javascript
        var parts = x.toString().split('.');
        parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
        return parts.join('.');
    }

    function onImageRendered(e, eventData) {

        // if we have no toolData for this element, return immediately as there is nothing to do
        var toolData = cornerstoneTools.getToolState(e.currentTarget, toolType);
        if (!toolData) {
            return;
        }

        // we have tool data for this element - iterate over each one and draw it
        var context = eventData.canvasContext.canvas.getContext('2d');
        context.setTransform(1, 0, 0, 1, 0, 0);

        //activation color 
        var lineWidth = cornerstoneTools.toolStyle.getToolWidth();
        var config = cornerstoneTools.ellipticalRoi.getConfiguration();

        for (var i = 0; i < toolData.data.length; i++) {
            context.save();

            if (config && config.shadow) {
                context.shadowColor = config.shadowColor || '#000000';
                context.shadowOffsetX = config.shadowOffsetX || 1;
                context.shadowOffsetY = config.shadowOffsetY || 1;
            }

            var data = toolData.data[i];

            //differentiate the color of activation tool
            var color = cornerstoneTools.toolColors.getColorIfActive(data.active);

            // draw the ellipse
            var handleStartCanvas = cornerstone.pixelToCanvas(eventData.element, data.handles.start);
            var handleEndCanvas = cornerstone.pixelToCanvas(eventData.element, data.handles.end);

            var widthCanvas = Math.abs(handleStartCanvas.x - handleEndCanvas.x);
            var heightCanvas = Math.abs(handleStartCanvas.y - handleEndCanvas.y);
            var leftCanvas = Math.min(handleStartCanvas.x, handleEndCanvas.x);
            var topCanvas = Math.min(handleStartCanvas.y, handleEndCanvas.y);

            context.beginPath();
            context.strokeStyle = color;
            context.lineWidth = lineWidth;

            var xCenterCanvas = (handleStartCanvas.x + handleEndCanvas.x) / 2;
            var yCenterCanvas = (handleStartCanvas.y + handleEndCanvas.y) / 2;
            var yRadiusCanvas = Math.abs(handleStartCanvas.x - handleEndCanvas.x) / 2;
            var xRadiusCanvas = Math.abs(handleStartCanvas.y - handleEndCanvas.y) / 2;

            cornerstoneTools.drawEllipse(context, xCenterCanvas, yCenterCanvas, xRadiusCanvas, yRadiusCanvas, data.angle);
            context.closePath();

            var left = Math.min(data.handles.start.x, data.handles.end.x);
            var top = Math.min(data.handles.start.y, data.handles.end.y);
            var center = {
                x: (data.handles.start.x + data.handles.end.x) / 2,
                y: (data.handles.start.y + data.handles.end.y) / 2
            };

            data.center = center;
            data.rotateHandle.x = left + 50;
            data.rotateHandle.y = top + 30;

            if (data.active) {
                var handleRadius = 7;
                context.beginPath();
                var rotateHandleCanvasCoords = cornerstone.pixelToCanvas(eventData.element, data.rotateHandle);
                context.arc(rotateHandleCanvasCoords.x, rotateHandleCanvasCoords.y, handleRadius, 0, 2 * Math.PI);
                context.fillStyle = cornerstoneTools.toolColors.getActiveColor();
                context.fill();
                context.stroke();
            }

            // draw the handles if the tool is active
            if (config && config.drawHandlesOnHover) {
                if (data.active === true) {
                    cornerstoneTools.drawHandles(context, eventData, data.handles, color);
                } else {
                    var handleOptions = {
                        drawHandlesIfActive: true
                    };
                    cornerstoneTools.drawHandles(context, eventData, data.handles, color, handleOptions);
                }
            } else {
                cornerstoneTools.drawHandles(context, eventData, data.handles, color);    
            }

            var area,
                meanStdDev;

            if (!data.invalidated) {
                meanStdDev = data.meanStdDev;
                area = data.area;
            } else {
                // TODO: calculate this in web worker for large pixel counts...

                
                var width = Math.abs(data.handles.start.x - data.handles.end.x);
                var height = Math.abs(data.handles.start.y - data.handles.end.y);

                var pixels = cornerstone.getPixels(eventData.element, left, top, width, height);

                var ellipse = {
                    left: left,
                    top: top,
                    width: width,
                    height: height
                };

                // Calculate the mean, stddev, and area
                meanStdDev = calculateMeanStdDev(pixels, ellipse);
                
                var columnPixelSpacing = eventData.image.columnPixelSpacing || 1;
                var rowPixelSpacing = eventData.image.rowPixelSpacing || 1;

                area = Math.PI * (width * columnPixelSpacing / 2) * (height * rowPixelSpacing / 2);

                data.invalidated = false;
                if (!isNaN(area)) {
                    data.area = area;
                }

                if (!isNaN(meanStdDev.mean) && !isNaN(meanStdDev.stdDev)) {
                    data.meanStdDev = meanStdDev;
                    data.mean = meanStdDev.mean;
                    data.stdev = meanStdDev.stdev;
                }
            }

            var textLines = [];
            if (meanStdDev) {
                var meanText = 'Mean: ' + numberWithCommas(meanStdDev.mean.toFixed(2));
                textLines.push(meanText);

                var stdDevText = 'StdDev: ' + numberWithCommas(meanStdDev.stdDev.toFixed(2));
                textLines.push(stdDevText);
            }

            if (area !== undefined && !isNaN(area)) {
                // Char code 178 is a superscript 2
                var suffix = ' mm' + String.fromCharCode(178);
                if (!eventData.image.rowPixelSpacing || !eventData.image.columnPixelSpacing) {
                    suffix = ' pixels'  + String.fromCharCode(178);
                }

                var areaText = 'Area: ' + numberWithCommas(area.toFixed(2)) + suffix;
                textLines.push(areaText);
            }

            if (!data.handles.textBox.hasMoved) {
                data.handles.textBox.x = Math.max(data.handles.start.x, data.handles.end.x);
                data.handles.textBox.y = (data.handles.start.y + data.handles.end.y) / 2;
            }

            var textCoords = cornerstone.pixelToCanvas(eventData.element, data.handles.textBox);

            // Draw text
            var options = {
                centering: {
                    x: false,
                    y: true
                }
            };

            var boundingBox = cornerstoneTools.drawTextBox(context, textLines, textCoords.x,
                textCoords.y, color, options);

            data.handles.textBox.boundingBox = boundingBox;

            if (data.handles.textBox.hasMoved) {
                // Draw dashed link line between tool and text
                var link = {
                    start: {},
                    end: {}
                };

                var ellipsePoints = [ {
                    // Top middle point of ellipse
                    x: leftCanvas + widthCanvas / 2,
                    y: topCanvas
                }, {
                    // Left middle point of ellipse
                    x: leftCanvas,
                    y: topCanvas + heightCanvas / 2
                }, {
                    // Bottom middle point of ellipse
                    x: leftCanvas + widthCanvas / 2,
                    y: topCanvas + heightCanvas
                }, {
                    // Right middle point of ellipse
                    x: leftCanvas + widthCanvas,
                    y: topCanvas + heightCanvas / 2
                },
            ];

                link.end.x = textCoords.x;
                link.end.y = textCoords.y;

                link.start = cornerstoneMath.point.findClosestPoint(ellipsePoints, link.end);

                var boundingBoxPoints = [ {
                    // Top middle point of bounding box
                    x: boundingBox.left + boundingBox.width / 2,
                    y: boundingBox.top
                }, {
                    // Left middle point of bounding box
                    x: boundingBox.left,
                    y: boundingBox.top + boundingBox.height / 2
                }, {
                    // Bottom middle point of bounding box
                    x: boundingBox.left + boundingBox.width / 2,
                    y: boundingBox.top + boundingBox.height
                }, {
                    // Right middle point of bounding box
                    x: boundingBox.left + boundingBox.width,
                    y: boundingBox.top + boundingBox.height / 2
                },
            ];

                link.end = cornerstoneMath.point.findClosestPoint(boundingBoxPoints, link.start);

                context.beginPath();
                context.strokeStyle = color;
                context.lineWidth = lineWidth;
                context.setLineDash([ 2, 3 ]);
                context.moveTo(link.start.x, link.start.y);
                context.lineTo(link.end.x, link.end.y);
                context.stroke();
            }

            context.restore();
        }
    }
    ///////// END IMAGE RENDERING ///////

    // module exports
    cornerstoneTools.ellipticalRoi = cornerstoneTools.mouseButtonTool({
        createNewMeasurement: createNewMeasurement,
        onImageRendered: onImageRendered,
        pointNearTool: pointNearTool,
        toolType: toolType
    });
    cornerstoneTools.ellipticalRoiTouch = cornerstoneTools.touchTool({
        createNewMeasurement: createNewMeasurement,
        onImageRendered: onImageRendered,
        pointNearTool: pointNearToolTouch,
        toolType: toolType
    });

})($, cornerstone, cornerstoneMath, cornerstoneTools);
