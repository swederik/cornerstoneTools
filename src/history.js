var cornerstoneTools = (function ($, cornerstone, cornerstoneTools) {

    "use strict";

    if(cornerstoneTools === undefined) {
        cornerstoneTools = {};
    }

    var historyStack = {};
    var currentStep = -1;

    function undo(element, steps)
    {
        if (steps === undefined) {
            steps = 1;
        }
        var finalStep = currentStep - steps;
        if (finalStep < 0) {
            return;
        }
        console.log("Undoing " + steps + " step(s) to step " + finalStep);

        setState(element, finalStep);
    }

    function redo(element, steps)
    {
        if (steps === undefined) {
            steps = 1;
        }

        var enabledElement = cornerstone.getEnabledElement(element);
        var imageId = enabledElement.image.imageId;

        var finalStep = currentStep + steps;
        if (finalStep > historyStack[imageId].length) {
            return;
        }
        console.log("Redoing " + steps + " step(s) to step " + finalStep);

        setState(element, finalStep);
    }

    function addState(eventData)
    {
        console.log("Adding state to stack");
        var enabledElement = cornerstone.getEnabledElement(eventData.element);
        var imageId = enabledElement.image.imageId;
        var viewport = cornerstone.getViewport(element);

        var clonedViewport = $.extend(true, {}, viewport);

        var state = {"viewport": clonedViewport};
        if (!historyStack.hasOwnProperty(imageId)) {
            historyStack[imageId] = [];
        }
        // Push the current state one index after the one we're currently on
        currentStep += 1;
        historyStack[imageId].splice(currentStep, 0, state);
    }

    function setState(element, step)
    {
        var enabledElement = cornerstone.getEnabledElement(element);
        var imageId = enabledElement.image.imageId;

        var state = historyStack[imageId][step];
        cornerstone.setViewport(element, state.viewport);
        currentStep = step;
    }

    function resetStateData(element)
    {
        console.log("Clearing state stack");
        historyStack = {};
    }

    function enable(element)
    {
        $(element).off("CornerstoneToolsAction", addState);

        $(element).on("CornerstoneToolsAction", addState);

        var eventData = {"element": element};
        addState(eventData);
    }

    function disable(element)
    {
        $(element).off("CornerstoneToolsAction", addState);
    }

    // module/private exports
    cornerstoneTools.history =
    {
        enable: enable,
        disable: disable,
        undo: undo,
        redo: redo,
        add: addState,
        reset: resetStateData
    };

    return cornerstoneTools;
}($, cornerstone, cornerstoneTools));