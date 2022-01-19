/*------------------------------*\
 *                              *
 *  Java Script Object Tracker  *
 *         Version 3.0          *
 *                              *
 *       Zachary Perrico        *
 *         Chris Orban          *
 *              &               *
 *          STEMcoding          *
 *                              *
\*------------------------------*/

// Example Gifs
const GIFS = {
  DROP   : "https://i.imgur.com/qMYrKjb.gif",
  TABLE  : "https://i.imgur.com/49Sft56.gif",
  THROW  : "https://i.imgur.com/BdRE0kF.gif",
  BOUNCE : "https://i.imgur.com/bRX8lp7.gif",
};

// fileName supports Imgur URLs
// Erase line to select from computer
fileName = GIFS.THROW;

ruler = {
  x1: 55, 
  y1: 10,
  x2: 125, 
  y2: 10,
};

bounds = {
  xMin: 50,
  yMin: 29,
  xMax: 208,
  yMax: 214,
};

fps = 240; // Usually 240

objectColors = [
  [169, 40, 51],
];

backgroundColors = [
  [81, 69, 69],
];