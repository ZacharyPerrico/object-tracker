// DOM
let tools = {}, 
    menus = {};

function setupGUI() {
  
  /*--------*\
  | Main Div |
  \*--------*/
  
  let mainDiv = createDiv();
  mainDiv.id("mainDiv");
  mainDiv.style(`
    position: absolute;
    left: 0;
    top: 0;
    width:  100vw;
    height: 100vh;    
    background-color: #1c1c1c;
  `);
  
  /*--------*\
  | Tool Div |
  \*--------*/
  
  toolDiv = createDiv();
  toolDiv.id("toolDiv");
  toolDiv.parent("mainDiv");
  toolDiv.class("menu");
  toolDiv.style(`
    display: flex;
    gap: 10px;
    flex-flow: row wrap;
    align-items: flex-start;    
    justify-content: space-around;
    // align-content: space-around;

  `);
  
  /*-----*\
  | Tools |
  \*-----*/
  
  tools.color = createButton("Colors");
  tools.save = createButton("Save");
  tools.display = createButton("Display");
  tools.vectors = createButton("Vectors");
  
  for (let i in tools) {
    tools[i].parent(toolDiv);
    tools[i].style(`
      display: block;
      height: 60px;
      width: 60px;
      color: #ffffff;
      background-color: #4d4d4d;    
    `);
    
    // Open respective menu when clicked
    tools[i].mousePressed(() => {
      
      // Hide All
      for (let j in menus) 
         for (let k in menus[j])
           menus[j][k].hide();
      
      // Show Relevent
      for (let j in menus[i])
         menus[i][j].show();
    
    });
    
    // Respective menu location
    menus[i] = {};
  }
  
  // tools.fullscreen.mousePressed(() => {
  //   fullscreen(!fullscreen());
  // });
    
  /*--------*\
  | Menu Div |
  \*--------*/
  
  menuDiv = createDiv();
  menuDiv.id("menuDiv");
  menuDiv.class("menu");
  menuDiv.parent(mainDiv);
  menuDiv.style(`    
    display: flex;
    gap: 10px;
    flex-flow: row wrap;
    align-items: flex-start;    
    justify-content: stretch;  
  `);
  
  /*-----*\ 
  | Menus |
  \*-----*/
  
  colorMenu();
  
  menus.save.a = createButton("SAVE NORM");
  
  // for (let i = 0; i < 10; i ++) {
  //   menus.a[i] = createButton(i+"");
  //   menus.b[i] = createButton(i+"");
  // }
  
  for (let i in menus) {
    for (let j in menus[i]) {
      menus[i][j].parent(menuDiv);
      menus[i][j].hide();
      menus[i][j].style(`
        color: #ffffff;
        // padding: 5px;
        // margin: 5px;
        background-color: #4d4d4d;    
      `);
    }
  }
  
  /*-----------*\
  | Main Canvas |
  \*-----------*/
    
  mainCanvas = createCanvas(gifW, gifH);
  mainCanvas.id("mainCanvas");
  mainCanvas.parent(mainDiv);
  mainCanvas.style(`
    position: absolute;
    display: block;
  `);
  
  /*--------*\
  | Time Div |
  \*--------*/
  
  timeDiv = createDiv();
  timeDiv.id("timeDiv");
  timeDiv.parent(mainDiv);
  timeDiv.class("menu");
  timeDiv.style(` 
    display: flex;
  `);
  
  frameSlider = createSlider(0, numFrames - 1, 0);
  frameSlider.parent(timeDiv);
  frameSlider.style(`
    margin: 10px;
    width: 100%;
  `);
  
  pauseButton = createButton("Pause");
  pauseButton.parent(timeDiv);
  pauseButton.style(`
    margin: 10px;
  `);
  pauseButton.mousePressed(()=>{
    paused = !paused;
    if (paused) {pauseButton.html('Play')} 
    else {pauseButton.html('Pause')}
  });
  
  /*--------*\
  | Finalize |
  \*--------*/
  
  for (let e of selectAll(".menu")) {
    e.style(`
      padding: 10px;
      position: absolute;
      border: 4px solid #4d4d4d;    
      border-radius: 10px;
    `);
  }
  
  for (let e of selectAll("*")) {
    e.style("box-sizing: border-box;");
  }
  
  /*---*\
  | Fit |
  \*---*/
  
  adjustSize();
}

/*=============*\
 * Adjust Size *
\*=============*/

function adjustSize() {
  
  C = min(width, height);
  
  const WW = windowWidth;
  const WH = windowHeight;
  
  const M = min(WW / gifW, WH / gifH);
  
  dispW = gifW * M;
  dispH = gifH * M;
  dispX = 0;
  dispY = 0;
  
  let tool = {
    w: WW , h: WH ,
    x: 0  , y: 0  ,
  };
  
  let menu = {
    w: WW , h: WH ,
    x: 0  , y: 0  ,
  }
  
  let time = {
    w: WW , h: 100 ,
    x: 0  , y: 0  ,
  }
  
  if ( WH / gifH - WW / gifW > 0 ) {   
    // T 
    // C
    // M
    // O
    
    // limit height to 50%
    if ( dispH / WH > 0.5 ) {
      dispH = WH * 0.5;
      dispW = dispH * gifW / gifH;
    }
        
    menu.h = max(WH * 0.25, WH * 0.75 - time.h - dispH);
    menu.y = WH - menu.h;

    time.y = menu.y - time.h;      

    dispY = time.y - dispH;
    dispX = (WW - dispW) / 2;

    tool.h = dispY;

  } else if ( WH / gifH - WW / gifW <= 0 ) {
    // T C O
    // T M O
    
    dispH = gifH * M - time.h;
    dispW = dispH * gifW / gifH;
    
    // limit width to 50%
    if ( dispW / WW > 0.5 ) {
      dispW = WW * 0.5;
      dispH = dispW * gifH / gifW;
    }

    dispX = (WW - dispW) / 2;
    dispY = (WH - dispH - time.h) / 2;
    
    tool.w = (WW - dispW) / 2;
    tool.h = WH - time.h;
    
    menu.w = (WW - dispW) / 2;
    menu.h = WH - time.h;
    menu.x = dispW + tool.w;
    
    time.y = WH - time.h;
    
  }
  
  if ( dispW / WW < 0.7 && WW * 0.4 > 300 ) { 
      // T O 
      // C O
      // M O
      
      dispW = WW * 0.6;
      dispH = dispW * gifH / gifW;
    
      // limit height to 60%
      if ( dispH / WH > 0.6 ) {
        dispH = WH * 0.6;
        dispW = dispH * gifW / gifH;
      }
    
      dispY = WH - dispH - time.h;      
      dispX = 0;
    
      menu.h = WH;
      menu.w = WW - dispW;
      menu.x = dispW;
      menu.y = 0;  
    
      time.w = WW - menu.w;
      time.y = WH - time.h;
      
      tool.w = WW - menu.w;
      tool.h = dispY;
      
      if ( WH - dispH > WW - dispW ) {
        // O O
        // C T
        // M T
  
        menu.x = 0;
        menu.y = 0;
        menu.w = WW;
        menu.h = WH - dispH - time.h;

        time.w = dispW;
        time.y = WH - time.h;

        tool.x = dispW;
        tool.y = menu.h;
        tool.w = WW - dispW;
        tool.h = dispH + time.h;
      }
      
    }
  
  // Change canvas size and location
  resizeCanvas(dispW, dispH);
  mainCanvas.style(
    "left:" + dispX + "px;" +
    "top:"  + dispY + "px;"
  );
  
  // Find and change element sizes and locations
  let pos = {};
  
  pos.tool = tool;
  pos.menu = menu;
  pos.time = time;
  
  let c = selectAll(".menu");
  
  for (let e of c) {
    let i = e.id().slice(0,-3);
    e.style(
      "width:"  + (pos[i].w - 20) + "px;" +
      "height:" + (pos[i].h - 20) + "px;" +
      "left:"   + (pos[i].x + 10) + "px;" +
      "top:"    + (pos[i].y + 10) + "px;"
    ); 
  }

}

/*================*\
 * Menu Functions *
\*================*/

function setupMenus() {
  
}


function colorMenu() {
  
  
  
  menus.color.a = createButton("COLOR1");
  menus.color.b = createButton("COLOR2");
  
  for (let i of ["a","b"]) {
    menus.color[i].style(`
      width: 100%;
      
    `);
  }
  
}






