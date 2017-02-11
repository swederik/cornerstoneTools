// Average time for radius 390 and width 2: 6ms
function getCircleM1(radius, width) { 
  var circleArray = [];
  
  // For flipping we calculate the last y value we have to go to 
  // and afterwards we flip x and y. This is the point where x and y are same.
  // Use * instead of pow as it seems to be faster for some browsers.
  var yMax = Math.round( Math.sqrt( radius*radius / 2 ) );
  
  // Calculate the circle. This needs to be done only for 1/8 of the 
  // circle. Afterthe first 1/8th onlye x and y needs to be flipped.
  // Use * instead of pow as it seems to be faster for some browsers
  var index = 0;
  for (var y=0; y<=yMax; y++) {
    var xMax = Math.round( Math.sqrt( radius*radius - y*y ) );
    for (var border=1; border<=width; border++) {
      var x = xMax - border; 
      circleArray[index++] = [ y, x];
      circleArray[index++] = [ x, y];
      circleArray[index++] = [-x, y];
      circleArray[index++] = [ y,-x];
      circleArray[index++] = [-y,-x];
      circleArray[index++] = [-x,-y];
      circleArray[index++] = [ x,-y];
      circleArray[index++] = [-y, x];
    }
  }
  return circleArray;
}


// Average time for radius 390 and width 2: 6ms
function getFullCircle(radius) { 
  var circleArray = [];
  var index = 0;
  for (var y=0; y<=radius; y++) {
    var xMax = Math.round( Math.sqrt( radius*radius - y*y ) );
    for (var x=0; x<=xMax; x++) {
      circleArray[index++] = [ y, x];
      circleArray[index++] = [-y,-x];
      circleArray[index++] = [-y, x];
      circleArray[index++] = [ y,-x];
    }
  }
  return circleArray;
}


// Average time for radius 390: 36ms
function getCircleM2(radius) {
  circleArray = []

  var distance = function(x, y) {
    return Math.sqrt((Math.pow(y, 2)) + Math.pow(x, 2));
  };

  var filled = function(x, y, radius) {
    return distance(x, y) <= radius-1;
  };

  var fatfilled = function( x, y, radius) {

    return (filled(x, y, radius) && !(
        filled(x + 1, y, radius) &&
        filled(x - 1, y, radius) &&
        filled(x, y + 1, radius) &&
        filled(x, y - 1, radius) &&
        filled(x + 1, y + 1, radius) &&
        filled(x + 1, y - 1, radius) &&
        filled(x - 1, y - 1, radius) &&
        filled(x - 1, y + 1, radius)
        ))||

    (!filled(x, y, radius) &&
        filled(x+1, y-1, radius) &&
             filled(x+1, y, radius) &&
             filled(x+1, y+1, radius))||

    (!filled(x, y, radius) && filled(x-1, y-1, radius) &&
             filled(x-1, y, radius) &&
             filled(x-1, y+1, radius))||

    (!filled(x, y, radius) && filled(x+1, y+1, radius) &&
             filled(x, y+1, radius) &&
             filled(x-1, y+1, radius))||

    (!filled(x, y, radius) && filled(x+1, y-1, radius) &&
             filled(x, y-1, radius) &&
             filled(x-1, y-1, radius));
  };

  var index = 0;
  for( var y = -radius + 1; y < radius; y++ ) {
    for( var x = -radius + 1; x < radius; x++ ) {
      var xfilled;

      xfilled = fatfilled(x, y, radius, 1);

      if( xfilled ) {
        circleArray[index] = [];
        circleArray[index][0] = y;
        circleArray[index][1] = x;
        index++;
      }
    }
  }
  
  return circleArray;
}




function getGreyValues(pointerX, pointerY, pointerArray, canvasArray) {
  var circlePoints = pointerArray.length;

  var medianValue = 0;
  var minValue = 255;
  var maxValue = 0;

  for (var i=0; i<circlePoints; i++) {
    var greyValue = canvasArray[pointerY + pointerArray[i][0]][pointerX + pointerArray[i][0]];
    medianValue += greyValue;

    if (greyValue<minValue) {
      minValue = greyValue;
    }
    if (greyValue>maxValue) {
      maxValue = greyValue;
    }
  }
  medianValue = Math.round( medianValue / pointerArray.length); // TODO - Useless
  
  thrMin = minValue - tolerance;
  if (thrMin<0){ thrMin = 0; }
  thrMax = maxValue + tolerance;
  if (thrMax>255){ thrMax = 255; }
}