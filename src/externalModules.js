import $ from 'jquery';
import Hammer from 'hammerjs';
import * as cornerstoneMath from 'cornerstone-math';

let cornerstone;

function setCornerstone (cs) {
  cornerstone = cs;
}

function getCornerstone () {
  return cornerstone;
}

export { $, Hammer, cornerstone, setCornerstone, getCornerstone, cornerstoneMath };
