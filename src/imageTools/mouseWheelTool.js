(function($, cornerstone, cornerstoneTools) {

    'use strict';

    function mouseWheelTool(mouseWheelCallback) {
        var configuration = {};

        var toolInterface = {
            activate: function(element) {
                $(element).off('CornerstoneToolsMouseWheel', mouseWheelCallback);
                var eventData = {
                };
                $(element).on('CornerstoneToolsMouseWheel', eventData, mouseWheelCallback);
            },
            disable: function(element) {$(element).off('CornerstoneToolsMouseWheel', mouseWheelCallback);},
            enable: function(element) {$(element).off('CornerstoneToolsMouseWheel', mouseWheelCallback);},
            deactivate: function(element) {$(element).off('CornerstoneToolsMouseWheel', mouseWheelCallback);},
            getConfiguration: function() { return configuration;},
            setConfiguration: function(config) {configuration = config;}
        };
        return toolInterface;
    }

    // module exports
    cornerstoneTools.mouseWheelTool = mouseWheelTool;

})($, cornerstone, cornerstoneTools);
