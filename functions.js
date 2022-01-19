/*------------------------------*\
 *                              *
 *  Java Script Object Tracker  *
 *                              *
\*------------------------------*/

/*======*\
 * GIFs *
\*======*/

const 

GIF_DROP   = "https://i.imgur.com/qMYrKjb.gif",
GIF_TABLE  = "https://i.imgur.com/49Sft56.gif",
GIF_THROW  = "https://i.imgur.com/f0vlKyy.gif",
GIF_BOUNCE = "https://i.imgur.com/bRX8lp7.gif";

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
  
  if (fileName) {
    gif = loadImage(fileName, img => {
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
  
  gifW = gif.width;
  gifH = gif.height;
   
  // Number of frames
  numFrames = gif.numFrames();
 
  setupGUI();
  
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
  
  // Load each frame
  for (let i = 0; i < numFrames; i++) {
    let frame = createGraphics(gifW, gifH);
    frame.pixelDensity(1);
    gif.pause();
    gif.setFrame(i);
    frame.image(gif, 0, 0);
    gifFrames.push(frame)
  }
    
  framesLoaded = true;
}

/*======*\
 * Draw *
\*======*/

function draw() {
  background(0);
  if (framesLoaded) {
    if (paused) {  
    if (currentFrame != frameSlider.value()) 
    {
      currentFrame = frameSlider.value();
      pixl = [];
      searchPixels(gifFrames[currentFrame]);
    }
  } else {
    if (currentFrame < numFrames - 1) {
      currentFrame++;
    } else {
      currentFrame = 0;
    }
    frameSlider.value(currentFrame);
    pixl = [];
    searchPixels(gifFrames[currentFrame]);
  }
  
  push();
  scale(width / gifW, height / gifH);
  image(gifFrames[currentFrame], 0, 0);
    
  if (!!objectData.x[currentFrame]) {
    // drawArrow(
    //   50 * objectData.vx[currentFrame], 
    //   50 * objectData.vy[currentFrame], 
    //   "Red",
    // );
    drawArrow(
      50 * objectData.vx[currentFrame], 
      0, 
      "Red",
    );
    drawArrow(
      0, 
      50 * objectData.vy[currentFrame], 
      "Red",
    );
  }
    
  if (!!objectData.x[currentFrame]) {
    drawArrow(
      100 * objectData.ax[currentFrame], 
      0, 
      "Blue",
    );
    drawArrow(
      0, 
      100 * objectData.ay[currentFrame], 
      "Blue",
    );
  }
    
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
  
  calculateVectorQuantities()
  
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
    
function calculateVectorQuantities() {
  const C = CALC_RADIUS
  
  // Time and Position
    for (let i = 0; i < numFrames; i += CALC_SKIP) {
      objectData.t[i] = i;    
    }
  
  // Delta Time and Delta Position
    for (let i = 0; i < numFrames; i += CALC_SKIP) {
      objectData.dx[i] = objectData.x[i+C] - objectData.x[i]
      objectData.dy[i] = objectData.y[i+C] - objectData.y[i]
      objectData.dt[i] = objectData.t[i+C] - objectData.t[i]
    }

  // Velocity
    for (let i = 0; i < numFrames; i += CALC_SKIP) {
      objectData.vx[i] = objectData.dx[i] / objectData.dt[i]
      objectData.vy[i] = objectData.dy[i] / objectData.dt[i]
    }
  
  // Delta Velocity
  for (let i = 0; i < numFrames; i += CALC_SKIP) {
    objectData.dvx[i] = objectData.vx[i+C] - objectData.vx[i]
    objectData.dvy[i] = objectData.vy[i+C] - objectData.vy[i]
  }
  
  // Acceleration
  for (let i = 0; i < numFrames; i += CALC_SKIP) {
    objectData.ax[i] = objectData.dvx[i] / objectData.dt[i]
    objectData.ay[i] = objectData.dvy[i] / objectData.dt[i]
  }
  
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
    let newRow = table.addRow();
    for (let c in tableData) {
      if (SAVE_COLUMN[c]) newRow.setNum(c+"", tableData[c][f])
    }  
  }
  
  saveTable(table, "data.csv");
}