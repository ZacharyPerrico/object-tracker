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
    point(objectData.x[i], gifH - objectData.y[i]);
  }
  
  // Highlight Center
  stroke(LOCATION_COLOR);
  strokeWeight(10);
  point(objectData.x[currentFrame], gifH - objectData.y[currentFrame]);
  
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
