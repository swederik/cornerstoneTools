(function(cornerstone, cornerstoneTools) {

    'use strict';

    var stackData = {};

    /**
     * Displays a Stack
     *
     * @param element Enabled Cornerstone element
     * @param stack Instance of the Stack class
     */
    function displayStack(element, stack, renderer) {
        if (!element) {
            throw 'displayStack: No element provided';
        }

        if (!stack) {
            throw 'displayStack: No stack provided';
        }

        if (!renderer || !renderer.render) {
            throw 'displayStack: No renderer provided';
        }

        renderer.render(element, stack);

        stackData[element] = {
            stack: stack,
            renderer: renderer
        };
    }

    /**
     * Displays a Stack
     *
     * @param element Enabled Cornerstone element
     * @param stack Instance of the Stack class
     */
    function getStackData(element) {
        return stackData[element];
    }

    cornerstoneTools.displayStack = displayStack;
    cornerstoneTools.getStackData = getStackData;

})(cornerstone, cornerstoneTools);
