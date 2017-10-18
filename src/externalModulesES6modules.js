const $ = window.$;
const Hammer = window.Hammer;
import * as cornerstoneMath from '../../cornerstoneMath/src/index.js';

let cornerstone = window.cornerstone;

function storeCornerstone (cs) {
  cornerstone = cs;
}

function getCornerstone () {
  return cornerstone;
}

export { $, Hammer, storeCornerstone, getCornerstone, cornerstoneMath };
