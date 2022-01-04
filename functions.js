/*------------------------------*\
 *                              *
 *  Java Script Object Tracker  *
 *         Version 2.4          *
 *                              *
 *       Zachary Perrico        *
 *         Chris Orban          *
 *              &               *
 *          STEMcoding          *
 *                              *
\*------------------------------*/

/*======*\
 * GIFs *
\*======*/

const 

gifs = {
GIF_DROP   : "https://i.imgur.com/qMYrKjb.gif",
GIF_TABLE  : "https://i.imgur.com/49Sft56.gif",
GIF_THROW  : "https://i.imgur.com/BdRE0kF.gif",
GIF_BOUNCE : "https://i.imgur.com/bRX8lp7.gif",
};

// Original
// GIF_THROW  = "https://i.imgur.com/f0vlKyy.gif",

/*==========*\
 * Settings *
\*==========*/

const

// Colors (can use any color format)
PATH_COLOR        = '#00FF00',   // Hex Value 
LOCATION_COLOR    = 'Magenta',   // Color Name
OBJECT_COLOR      = 255,         // Gray Scale
BOUNDS_COLOR      = [0, 255, 0], // RGB Array
BOUNDS_MIN_COLOR  = [255, 0, 0], // RGB Array
BOUNDS_MAX_COLOR  = [0, 0, 255], // RGB Array

// Save Options
SAVE_TIME             = true,
SAVE_DELTA_TIME       = false,

SAVE_X                = false,
SAVE_DELTA_X          = false,
SAVE_VELOCITY_X       = false,
SAVE_DELTA_VELOCITY_X = false,
SAVE_ACCELERATION_X   = false,

SAVE_Y                = true,
SAVE_DELTA_Y          = false,
SAVE_VELOCITY_Y       = false,
SAVE_DELTA_VELOCITY_Y = false,
SAVE_ACCELERATION_Y   = true,

// Calculation Options
CALC_RADIUS = 10, 
CALC_SKIP   =  1, // Default: 1

// Optional Features
DISABLE_FILE_IMPORTS  = true, // WIP

// Other Options
DEBUG_MODE = false;

/*==================*\
 * Global Variables *
\*==================*/

// Source (Optional)
var fileName;
var fps;

// Ruler (Optional)
var ruler;
var end1, end2;             // Legacy Support
var rulerUnit;
var rulerLength = 1.0;

// Bounds (Optional)
var bounds;
var box1, box2;             // Legacy Support
var xMin, xMax, yMin, yMax; // Legacy Support

// Color Data (Optional)
var objectColors;
var backgroundColors;

// Gif Data
let gif;
let numFrames;
let gifFrames = [];
let dispW, dispH; // Gif Display size
let dispX, dispY; // Gif Display offset
let gifW, gifH;   // Actual Gif size

// Control
let framesLoaded = false;
let currentFrame = -1;
let paused = false;

// DOM
let slidder;
let pauseButton;
let saveButton;
let objColors = {};
let bgnColors = {};

// Object Data
let objectData = {};

function clearObjectData() {
  objectData = { 
    t:   [],
    dt:  [],

    x:   [],
    dx:  [],
    vx:  [],
    dvx: [],
    ax:  [],

    y:   [],
    dy:  [],
    vy:  [],
    dvy: [],
    ay:  [],
  };
}

/*=======*\
 * Setup *
\*=======*/

function setup() {

  clearObjectData();
  
  mainCanvas = createCanvas(400, 400);
  mainCanvas.style('display', 'block');
  
  if (fileName) {
    gif = loadImage(gifs[fileName], img => {
      gif = img;
      setupTracker();
    });
  } else {
    fileInput = createFileInput(handleFile);
    fileInput.position(0, 0);
  }
    
  this.focus();
}

/*==============*\
 * Setup Frames *
\*==============*/

function setupTracker() {
  logStatus("Setting up frames");
  
  gifW = gif.width;
  gifH = gif.height;
  
  // Number of frames
  numFrames = gif.numFrames();
  
  /*-----*\
  |  DOM  |
  \*-----*/
  
  // fullButton = createButton('full');
  // fullButton.style('padding: 0px 0px');
  // fullButton.mousePressed(() => {
  //   fullscreen(!fullscreen());
  // });
  
  // Pause Button
  pauseButton = createButton('Pause');
  pauseButton.style('-webkit-appearance: none'); 
  pauseButton.style('-webkit-box-sizing: border-box');
  pauseButton.style('-webkit-color: #ffffff');
  pauseButton.style('border-radius: 0');  
  pauseButton.mousePressed(()=>{
    paused = !paused;
    if (paused) {pauseButton.html('Play')} 
    else {pauseButton.html('Pause')}
    pauseButton.size(width / 8, height / 16);
  });
  
  
  // Save Button
  saveButton = createButton('Save');
  saveButton.style('-webkit-box-sizing: border-box;');
  saveButton.mousePressed(()=>{
    saveData();
  });
  
  // Color Defaults
  objectColors ??= [];
  backgroundColors ??= [];
  
  // Color Pickers
  const A = [objColors, bgnColors];
  const R = [objectColors, backgroundColors];
    
  for (let i in [0,1]) {
    A[i].colors = [];
  
    A[i].remove = createButton('-');
    A[i].remove.mousePressed( () => {
      paused = true;
      pauseButton.html('Play');
      clearObjectData();
      
      // Remove DOM element
      A[i].colors[A[i].colors.length - 1].remove();
      
      // Remove p5.js Element
      A[i].colors.pop();
      
      // Remove color value reference
      [objectColors, backgroundColors][i].pop();
      
      adjustSize();
    });

    A[i].add = createButton('+')
    A[i].add.mousePressed( () => {
      paused = true;
      pauseButton.html('Play');
      clearObjectData()
      
      // Create p5.js Element
      const CP = createColorPicker("#000000");
      
      // Create reference number
      const I = R[i].length;
      
      // Assign function to color picker
      CP.input(() => {
        R[i][I] = CP.color().levels.slice(0, 3);
        paused = true;
        pauseButton.html('Play');
        clearObjectData();
      });
      
      // Add CP to object storage
      A[i].colors.push(CP);
      
      // Add color reference
      R[i][I] = [0,0,0];
      
      adjustSize();
    });

    for (let j = 0; j < R[i].length; j++) {
      const CP = createColorPicker(color(
        R[i][j]).toString()
      );
      
      CP.input(() => {
        R[i][j] = CP.color().levels.slice(0, 3);
        paused = true;
        pauseButton.html('Play');
        clearObjectData();
      });
      
      A[i].colors[j] = CP;
      
    }
  }
  
  /*---------*\
  | Variables |
  \*---------*/
  
  // Bounding Area
  bounds ??= {};
  
  // Legacy Support (Bounding Area)
  if ( !!box1 && !!box2 && !!box1.x && !!box1.y && !!box2.x && !!box2.y ) {
    bounds.xMin ??= box1.x;
    bounds.yMin ??= box1.y;
    bounds.xMax ??= box2.x;
    bounds.yMax ??= box2.y;
  }
    
  // Legacy Support (Bounding Area)
  if ( !!xMin && !!xMax && !!yMin && !!yMax ) {
    bounds.xMin ??= xMin;
    bounds.yMin ??= yMin;
    bounds.xMax ??= xMax;
    bounds.yMax ??= yMax;
  }
    
  // Bounding Area Defaults
  bounds.xMin ??= gifW * 1/8;
  bounds.yMin ??= gifH * 1/8;
  bounds.xMax ??= gifW * 7/8;
  bounds.yMax ??= gifH * 7/8;
    
  // Ruler
  ruler ??= {};
    
  // Legacy Support (Ruler)
  if ( !!end1 && !!end2 && !!end1.x && !!end1.y && !!end2.x && !!end2.y ) {
    ruler.x1 ??= end1.x;
    ruler.y1 ??= end1.y;
    ruler.x2 ??= end2.x;
    ruler.y2 ??= end2.y;
  }
  
  // Ruler Defaults
  ruler.x1 ??= gifW *  3/16;
  ruler.y1 ??= gifH *  1/16;
  ruler.x2 ??= gifW * 13/16;
  ruler.y2 ??= gifH *  1/16;
  
  /*------*\
  | Frames |
  \*------*/
  
  // Check if device is mobile / tablet
  
    const toMatch = [
        /Android/i,
        /webOS/i,
        /iPhone/i,
        /iPad/i,
        /iPod/i,
        /BlackBerry/i,
        /Windows Phone/i
    ];
    
    const isMobile = toMatch.some((toMatchItem) => {
        return navigator.userAgent.match(toMatchItem);
    });
    
  // Load each frame
  
  if (isMobile) {

    for (let i = 0; i < numFrames; i++) {

    gifFrames[i] = createGraphics(gifW, gifH);
    gifFrames[i].pixelDensity(1);
    gifFrames[i].image(gif, 0, 0);

    gif.pause();
    gif.setFrame(i+1);

    }    

  } else {

    for (let i = 0; i < numFrames; i++) {

    gifFrames[i] = createGraphics(gifW, gifH);
    gifFrames[i].pixelDensity(1);
    gifFrames[i].image(gif, 0, 0);

    gif.pause();
    gif.setFrame(i);

    }
    
  }
  
  // Frame Slider
  frameSlider = createSlider(0, gifFrames.length - 1, 0);
    
  adjustSize();
    
  framesLoaded = true;
  logStatus("gif Loaded");
}

/*==========*\
 * Resizing *
\*==========*/
    
function adjustSize() {
  resizeCanvas(windowWidth, windowHeight);
  
  C = min(width, height);
  
  // Find the shortest side
  const M = min(width / gifW, height / gifH * 7/8);

  // Adjust the size of the...
  
  // Frame's size
  dispW = gifW * M;
  dispH = gifH * M;

  // Frames's offset
  dispX = (width - dispW) / 2;
  dispY = (height - dispH) / 2;
  
  // Interactives
  frameSlider.size(width * 22/32, height * 1/16);
  frameSlider.position(width * 5/32, height * 15/16);
  frameSlider.mousePressed(function(){paused=true;pauseButton.html('Play');});
  
  // fullButton.position(width / 2, height * 14/16);
  // fullButton.size(width / 8, height / 16);
  
  pauseButton.position(0, height * 15/16);
  pauseButton.size(width / 8, height / 16);
  pauseButton.style('padding: 0px 0px');
  pauseButton.style('font-size:' + C / 40 + 'px;');
  
  saveButton.position(width * 7/8, height * 15/16);
  saveButton.size(width / 8, height / 16);
  saveButton.style('padding: 0px 0px');
  saveButton.style('font-size:' + C / 40 + 'px;'); 
  
  // Color Pickers
  const A = [bgnColors, objColors];
  for (let i of [0, 1]) {
    const N = A[i].colors.length;
    const W = width / 2 / (N + 1);
    
    A[i].remove.size(W / 2, height / 16);
    A[i].remove.position(W * (N + 1) - width / 2 * i, 0);

    A[i].add.size(W / 2, height / 16);
    A[i].add.position(W * (2 * N + 3 / 2) - width / 2 * i, 0);

    for (let j = 0; j < N; j++) {
      A[i].colors[j].size(W, height / 16);
      A[i].colors[j].position(W * (j + N + 3 / 2) - width / 2 * i, 0);
      A[i].colors[j].style('-webkit-box-sizing: border-box;');
  
    }
  }
  
}
    
/*=================*\
 * Console Updates *
\*=================*/

function logStatus(s0, s1, s2) {
  if (s2!==undefined) {
    s0 += ' [' + s1 + '/' + s2 + ']';
  } else if (s1!==undefined) {
    s0 += ' [' + s1 + ']';
  }
  if (DEBUG_MODE) print(s);
}
    
/*======*\
 * Draw *
\*======*/

function draw() {
  background(0);
  if (framesLoaded) {
    if (paused) {  
    // if (currentFrame != frameSlider.value()) 
    // {
      currentFrame = frameSlider.value();
      pixl = [];
      searchPixels(gifFrames[currentFrame]);
  } else {
    if (currentFrame < gifFrames.length - 1) {
      currentFrame++;
    } else {
      currentFrame = 0;
    }
    frameSlider.value(currentFrame);
    pixl = [];
    searchPixels(gifFrames[currentFrame]);
    // frame.remove();  // very important for conserving memory!!!
  }
  
  push();
  translate(dispX, dispY);
  scale(dispW / gifW, dispH / gifH);
    
  gif.pause();
  gif.setFrame(currentFrame);
  image(gif, 0, 0);
    
  // image(gifFrames[currentFrame], 0, 0);
    
  // if (!!objectData.x[currentFrame]) {
  //   // drawArrow(
  //   //   50 * objectData.vx[currentFrame], 
  //   //   50 * objectData.vy[currentFrame], 
  //   //   "Red",
  //   // );
  //   drawArrow(
  //     50 * objectData.vx[currentFrame], 
  //     0, 
  //     "Red",
  //   );
  //   drawArrow(
  //     0, 
  //     50 * objectData.vy[currentFrame], 
  //     "Red",
  //   );
  // }
    
  // if (!!objectData.x[currentFrame]) {
  //   drawArrow(
  //     100 * objectData.ax[currentFrame], 
  //     0, 
  //     "Blue",
  //   );
  //   drawArrow(
  //     0, 
  //     100 * objectData.ay[currentFrame], 
  //     "Blue",
  //   );
  // }
    
  highlightObject();
  drawBounds(bounds.xMin, bounds.yMin, bounds.xMax, bounds.yMax);
  drawRuler(ruler.x1, ruler.y1, ruler.x2, ruler.y2);
  drawCoords();
  pop();
  }
}
    
/*==================*\
 * Object Detection *
\*==================*/

function searchPixels(frame) {
  frame.loadPixels();
  for (let y = 0; y < frame.height; y++) {
    for (let x = 0; x < frame.width; x++) {
      const index = (x + y * frame.width) * 4;
      const r = frame.pixels[index + 0];
      const g = frame.pixels[index + 1];
      const b = frame.pixels[index + 2];
      const a = frame.pixels[index + 3];
      const c = [r,g,b];
      if (
        x > bounds.xMin && 
        x < bounds.xMax && 
        gifH - y > bounds.yMin && 
        gifH - y < bounds.yMax
      ) {
        let score = 0;
        
        // distance from good colors
        for (let i of objectColors) {
          score -= (colorDif(c, i) / objectColors.length) ** 2;
        }

        // distance from bad colors
        for (let i of backgroundColors) {
          score += (colorDif(c, i) / backgroundColors.length) ** 2;
        }
  
        if (score > 0) {
          pixl.push({
            x: x,
            y: frame.height-y
          });
        }
        
      }
    }
  }
  
  let sumOf = {x:0, y:0};
  
  for (let i = 0; i < pixl.length; i += 1) {
    sumOf.x += pixl[i].x;
    sumOf.y += pixl[i].y;
  }
  
  objectData.x[currentFrame] = sumOf.x / pixl.length
  objectData.y[currentFrame] = sumOf.y / pixl.length
  
  // calculateVectorQuantities()
  
}

function colorDif(c1, c2) {
  const r1 = c1[0];
  const g1 = c1[1];
  const b1 = c1[2];
  const r2 = c2[0];
  const g2 = c2[1];
  const b2 = c2[2];
  return sqrt((r2 - r1) ** 2 + (g2 - g1) ** 2 + (b2 - b1) ** 2) / 256;
}
    
// function calculateVectorQuantities() {
//   const C = CALC_RADIUS
  
//   // Time and Position
//     for (let i = 0; i < numFrames; i += CALC_SKIP) {
//       objectData.t[i] = i;    
//     }
  
//   // Delta Time and Delta Position
//     for (let i = 0; i < numFrames; i += CALC_SKIP) {
//       objectData.dx[i] = objectData.x[i+C] - objectData.x[i]
//       objectData.dy[i] = objectData.y[i+C] - objectData.y[i]
//       objectData.dt[i] = objectData.t[i+C] - objectData.t[i]
//     }

//   // Velocity
//     for (let i = 0; i < numFrames; i += CALC_SKIP) {
//       objectData.vx[i] = objectData.dx[i] / objectData.dt[i]
//       objectData.vy[i] = objectData.dy[i] / objectData.dt[i]
//     }
  
//   // Delta Velocity
//   for (let i = 0; i < numFrames; i += CALC_SKIP) {
//     objectData.dvx[i] = objectData.vx[i+C] - objectData.vx[i]
//     objectData.dvy[i] = objectData.vy[i+C] - objectData.vy[i]
//   }
  
//   // Acceleration
//   for (let i = 0; i < numFrames; i += CALC_SKIP) {
//     objectData.ax[i] = objectData.dvx[i] / objectData.dt[i]
//     objectData.ay[i] = objectData.dvy[i] / objectData.dt[i]
//   }
  
// }
    
/*=================*\
 * Tracker Visuals *
\*=================*/

function highlightObject() {
  push();  
  
  // Highlight Object
  stroke(OBJECT_COLOR);
  strokeWeight(2);
  for (let i = 1; i < pixl.length; i += 1) {
    point(pixl[i].x, gifH - pixl[i].y);
  }

  // Highlight Path
  stroke(PATH_COLOR);
  for (let i = 0; i < objectData.y.length; i += 1) {
    if (objectData.x[i] != null)
      point(objectData.x[i], gifH - objectData.y[i]);
  }
  
  // Highlight Center
  // stroke(LOCATION_COLOR);
  // strokeWeight(10);
  // point(objectData.x[currentFrame], gifH - objectData.y[currentFrame]);
  
  pop();
}
    
function drawArrow (x, y, c) {
  const M = mag(x, y);
  if (M === 0) return;
  const C = min(width, height);
  push()
  translate(objectData.x[currentFrame], gifH - objectData.y[currentFrame]);
  rotate(atan2(-y, x));  
  stroke(c);
  fill(c);
  line(0, 0, M - C * 1/256, 0);
  noStroke();
  triangle(
    M - C * 3/256, C * -1/256,
    M            , 0         ,
    M - C * 3/256, C *  1/256,
  );
  pop();
}
    
function drawRuler(x1, y1, x2, y2) {
  push();
  
  fill(255);
  stroke(0);
  strokeWeight(1);
  
  translate(x1, gifH - y1);
  rotate(atan2(x2 - x1, y2 - y1));
  
  rect(-C/240, 0, C/120, -dist(x1, y1, x2, y2));
  
  pop();
}
    
function drawBounds(x1, y1, x2, y2) {
  push();
  
  strokeWeight(4);
  stroke(BOUNDS_COLOR);
  noFill();
  rect(x1, gifH - y1, x2 - x1, y1 - y2);

  strokeWeight(2);
  rectMode(CENTER);

  fill(BOUNDS_MIN_COLOR);
  rect(x1, gifH - y1, 10);

  fill(BOUNDS_MAX_COLOR);
  rect(x2, gifH - y2, 10);

  strokeWeight(1);

  stroke(BOUNDS_MIN_COLOR);
  line(x1, gifH - y1, x1, gifH - y1 - 20);
  line(x1, gifH - y1, x1 + 20, gifH - y1);

  stroke(BOUNDS_MAX_COLOR);
  line(x2, gifH - y2, x2, gifH - y2 + 20);
  line(x2, gifH - y2, x2 - 20, gifH - y2);

  pop();
}
    
function drawCoords() {
  push();
  
  stroke(255);
  strokeWeight(1);

  textSize(14);

  textAlign(LEFT, TOP);
  text("(" + frameRate().toFixed(0) + ")", 3, 3);
  
  textAlign(LEFT, BOTTOM);
  text("(0,0)", 3, gifH - 3);

  textAlign(RIGHT, TOP);
  text("(" + gifW + "," + gifH + ")", gifW - 3, 3);

  textAlign(RIGHT, BOTTOM);
  text("(" + currentFrame + ")", gifW - 3, gifH - 3);
  
  push();
}

/*===============*\
 * Input Control *
\*===============*/

function keyTyped() {
  // map the mouse coords to the gif instead of the canvas
  const X = map(mouseX - (width - dispW) / 2, 0, dispW, 0, gifW, true);
  const Y = gifH - map(mouseY - (height - dispH) / 2, 0, dispH, 0, gifH, true);
    
  switch (key) {
    case "r":
      ruler.x1 = X;
      ruler.y1 = Y;
      break;
    case "R":
      ruler.x2 = X;
      ruler.y2 = Y;
      break;
    case "b":
      bounds.xMin = X;
      bounds.yMin = Y;
      break;
    case "B":
      bounds.xMax = X;
      bounds.yMax = Y;
      break;
    case "c":
      print("x: " + mouseX + " -> " + X + ", y: " + mouseY + " -> " + Y );
      break;
  }
}
    
function windowResized() {
  adjustSize();
}

/*=============*\
 * File Import *
\*=============*/

function handleFile(file) {
  logStatus('Loaded file', file.name);

  fileInput.hide();
  
  switch (file.type) {

    case 'image':
      loadImage(file.data, img => {
        gif = img;
        setupTracker();
      })
      break;
  
    case 'video':
      var video = createVideo(file.data, () => {
        logStatus('Converting mp4');
        video.hide();

        gifshot.createGIF({
            video: [file.data],
            gifWidth: video.width,
            gifHeight: video.height,
            numFrames: floor(fps*video.duration()),
            frameDuration: 1,
            interval: 1/fps,
            progressCallback: function(captureProgress) {print(captureProgress)},
            sampleInterval: 10,
          },
          function (obj) {
            if (!obj.error) {
              logStatus('Creating gif');
              var image = obj.image;
              var animatedImage = document.createElement("img");
              animatedImage.src = image;
              gif = loadImage(animatedImage.src, img => {
                gif = img;
                setupTracker();
              });
            }
          }
        );
      });
    break;
  }
}

/*===============*\
 * Data Download *
\*===============*/

function saveData() {

  unitsPerPixel = rulerLength / dist(ruler.x1, ruler.y1, ruler.x2, ruler.y2);
  
  const SAVE_COLUMN = {
    t:   SAVE_TIME,     
    dt:  SAVE_DELTA_TIME,

    x:   SAVE_X,         
    dx:  SAVE_DELTA_X,      
    vx:  SAVE_VELOCITY_X,
    dvx: SAVE_DELTA_VELOCITY_X, 
    ax:  SAVE_ACCELERATION_X,   

    y:   SAVE_Y, 
    dy:  SAVE_DELTA_Y,          
    vy:  SAVE_VELOCITY_Y,      
    dvy: SAVE_DELTA_VELOCITY_Y, 
    ay:  SAVE_ACCELERATION_Y
  }
  
  // Create Table
  let tableData = {};
  
  for (i in SAVE_COLUMN) {
    tableData[i] = [];
  }
  
  const C = CALC_RADIUS;
  
  // Time and Position
  for (let i = 0; i < numFrames; i += CALC_SKIP) {
    tableData.t[i] = i/fps;    
    tableData.x[i] = unitsPerPixel * objectData.x[i];  
    tableData.y[i] = unitsPerPixel * objectData.y[i];
  }
  
  // Delta Time and Delta Position
  for (let i = 0; i < numFrames; i += CALC_SKIP) {
    tableData.dx[i] = tableData.x[i+C] - tableData.x[i]
    tableData.dy[i] = tableData.y[i+C] - tableData.y[i]
    tableData.dt[i] = tableData.t[i+C] - tableData.t[i]
  }

  // Velocity
    for (let i = 0; i < numFrames; i += CALC_SKIP) {
      tableData.vx[i] = tableData.dx[i] / tableData.dt[i]
      tableData.vy[i] = tableData.dy[i] / tableData.dt[i]
    }
  
  // Delta Velocity
  for (let i = 0; i < numFrames; i += CALC_SKIP) {
    tableData.dvx[i] = tableData.vx[i+C] - tableData.vx[i]
    tableData.dvy[i] = tableData.vy[i+C] - tableData.vy[i]
  }
  
  // Acceleration
  for (let i = 0; i < numFrames; i += CALC_SKIP) {
    tableData.ax[i] = tableData.dvx[i] / tableData.dt[i]
    tableData.ay[i] = tableData.dvy[i] / tableData.dt[i]
  }
  
  // Create Table
  let table = new p5.Table();
  
  // Add Columns
  for (let c in tableData) {
    if (SAVE_COLUMN[c]) table.addColumn(c);
  }

  // Add Row for each frame
  for (let f = 0; f < numFrames; f += CALC_SKIP) {
    logStatus('Saving', f, numFrames - 1);
    let newRow = table.addRow();
    for (let c in tableData) {
      if (SAVE_COLUMN[c]) newRow.setNum(c+"", tableData[c][f])
    }  
  }
  
  saveTable(table, "data.csv");
  logStatus('Saved');
}