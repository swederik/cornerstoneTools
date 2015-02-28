var cornerstoneTools = (function ($, cornerstone, cornerstoneMath, cornerstoneTools) {

    "use strict";

    if(cornerstoneTools === undefined) {
        cornerstoneTools = {};
    }

    function maskTool(maskToolInterface)
    {

        // not visible, not interactive
        function disable(element)
        {
            $(element).off("CornerstoneImageRendered", maskToolInterface.onImageRendered);
            cornerstone.updateImage(element);
        }

        // visible but not interactive
        function enable(element)
        {
            $(element).on("CornerstoneImageRendered", maskToolInterface.onImageRendered);
            cornerstone.updateImage(element);
        }

        var toolInterface = {
            enable: enable,
            disable : disable
        };

        return toolInterface;
    }

    // module exports
    cornerstoneTools.maskTool = maskTool;

    return cornerstoneTools;
}($, cornerstone, cornerstoneMath, cornerstoneTools));
