import $ from 'jquery';
import Hammer from 'hammerjs';
import * as cornerstoneMath from 'cornerstone-math';

let cornerstone = window.cornerstone;

function storeCornerstone (cs) {
  cornerstone = cs;
}

function getCornerstone () {
  return cornerstone;
}

export { $, Hammer, storeCornerstone, getCornerstone, cornerstoneMath };
