(function(cornerstone, cornerstoneTools) {

    'use strict';

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

        if (!stack.imageObjects) {
            throw 'displayStack: Stack has no Image Objects to render';
        }

        renderer.render(element, stack.imageObjects);
    }

    cornerstoneTools.displayStack = displayStack;

})(cornerstone, cornerstoneTools);
