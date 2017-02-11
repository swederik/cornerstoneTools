var assert = chai.assert;

describe('Array', function() {
  it('should start empty', function() {
    var arr = [];

    assert.equal(arr.length, 0);
  });
});


describe('image', function() {
  it('should be drawn correctly', function() {
    var element = document.createElement('element');
    element.style.width = '512px';
    element.style.height = '512px';
    element.style.color = 'red';

    document.body.appendChild(element);

    cornerstone.enable(element);
    cornerstone.loadAndCacheImage('example://1').then(function(image) {
    	cornerstone.displayImage(element, image)

    	var enabledElement = cornerstone.getEnabledElement(element);
    	var canvas = enabledElement.canvas;
    	var context = canvas.getContext("2d");
    	var imageData = context.getImageData(0, 0, canvas.width, canvas.height);

    	console.log(imageData);
    	assert.equal(arr.length, 0);	
    });
  });
});