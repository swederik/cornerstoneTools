var cornerstoneTools = (function ($, cornerstone, cornerstoneTools) {

    "use strict";

    if(cornerstoneTools === undefined) {
        cornerstoneTools = {};
    }

    function textStyleManager() {
        var defaultFontSize = 15,
            defaultFont = defaultFontSize + "px Arial",
            defaultBackgroundColor = "black";

        function setFont(font){
            defaultFont = font;
        }
        function getFont(){
            return defaultFont;
        }

        function setFontSize(fontSize){
            defaultFontSize = fontSize;
        }
        function getFontSize(){
            return defaultFontSize;
        }

        function setBackgroundColor(backgroundColor){
            defaultBackgroundColor = backgroundColor;
        }
        function getBackgroundColor(){
            return defaultBackgroundColor;
        }
      
        var textStyle = {
            setFont: setFont,
            getFont: getFont,
            setFontSize: setFontSize,
            getFontSize: getFontSize,
            setBackgroundColor: setBackgroundColor,
            getBackgroundColor: getBackgroundColor
        };

        return textStyle;
    }

    // module/private exports
    cornerstoneTools.textStyle = textStyleManager();

    return cornerstoneTools;
}($, cornerstone, cornerstoneTools));
