let grid = [];
let steps = [];
let w = 10;
let h = 10;

const EMPTY = -1;

let padding = 0;
let margin = 0;
let widthCanvas = 500;
let heightCanvas = 500;
let buttonSize = 50;
let buttonVMargin = 20;
let buttonHMargin = 24;
let wSlider;

let startHue = 30;
let empty;
let canvas;

const UP = 0;
const RIGHT = 1;
const DOWN = 2;
const LEFT = 3;


let emptyCells;
let lastStep;
let frameIndex = 0;
let stepsQty = w*h;
let stepMaxValue = widthCanvas/w/2;
let deadEnd = true;
let cursor;
let shape;

let cellW = widthCanvas/w;
let cellH = heightCanvas/h;

let fps = 1;
let capturer = new CCapture({ format: 'jpg', framerate: fps });
let saveFrames = false;
let sketchCanvas;
let captured = false;

function setup() {
    sketchCanvas = createCanvas(widthCanvas,heightCanvas);
    frameRate(fps);
    init();
}

function init() {

    canvas = createGraphics(widthCanvas,heightCanvas);
    steps = [];
    for (let i = stepsQty; i > 0; i--) {    
        steps.push(map(i,1,stepsQty,stepMaxValue,0));
    }
    // init grid
    grid = [];
    empty = EMPTY;
    for (let i = 0; i < w; i++) {
        grid[i] = [];
        for (let j = 0; j < h; j++) {
            grid[i][j] = empty;
        }
    }

    emptyCells = [];
    for (let i = 0; i < grid.length; i++) {
        for (let j = 0; j < grid[i].length; j++) {
            if (grid[i][j] == empty) {
                emptyCells.push(createVector(i,j));
            }
        }
    }        

    lastStep = steps.splice(0,1)[0]; // takes the first step

}

function draw() {
    background('#fff');

    if (frameCount === 1) {
        capturer.start();
    }

    if (deadEnd) {
        // update empty cells to start again
        emptyCells = [];
        for (let i = 0; i < grid.length; i++) {
            for (let j = 0; j < grid[i].length; j++) {
                if (grid[i][j] == empty) {
                    emptyCells.push(createVector(i,j));
                }
            }
        }
        if (emptyCells.length > 0) {
            // begins a new path
            let start = emptyCells[floor(random(emptyCells.length))];
            let dir = floor(random(4));
            cursor = createVector(start.x,start.y,dir);
            grid[cursor.x][cursor.y] = lastStep;   
            deadEnd = false;
        }
    } else {
        // follows the path
        let c = nextCursor(cursor);
        if (c && grid[c.x][c.y] == empty) {
            grid[c.x][c.y] = steps.splice(0,1)[0];
        } else {
            c = newDirCursor(cursor,grid);
        } 
        if (c) {
            lastStep = grid[c.x][c.y];
            cursor = c;
        } else {
            deadEnd = true;
        }
        
    }

    updateCanvas();    
    image(canvas,0,0);

    if (emptyCells.length <= 0 && !captured) {
        capturer.stop();        
        capturer.save();
        noLoop();
    }

    let b = 0;
    if (frameCount) {
        let c = 0;
    }

    capturer.capture(document.getElementById('defaultCanvas0')); 

} 

function updateCanvas() {
    canvas.clear();
    //draw grid
    for (let i = 0; i < w; i++) {
        for (let j = 0; j < h; j++) {
            if (grid[i][j] >= 0) {
                canvas.push();
                let shapeColor = round(map(grid[i][j],0,stepMaxValue,0,200));
                canvas.stroke(50);                
                canvas.strokeWeight(2);
                canvas.fill(0,0,0,shapeColor);
                canvas.rectMode(CENTER);
                canvas.translate(i*cellW+cellW/2,j*cellH+cellH/2);
                canvas.rect(0,0,cellW*.9,cellH*.9,grid[i][j]);
                canvas.pop();
            }
        }
    }

    frameIndex = stepsQty - steps.length;
}


function newDirCursor(cursor,grid) {
    let newDir = [];
    // up
    if (cursor.y > 0 && grid[cursor.x][cursor.y-1] == empty && cursor.z != DOWN) newDir.push(UP);
    // right
    if (cursor.x < w - 1 && grid[cursor.x+1][cursor.y] == empty && cursor.z != LEFT) newDir.push(RIGHT);
    // down
    if (cursor.y < h - 1 && grid[cursor.x][cursor.y+1] == empty && cursor.z != UP) newDir.push(DOWN);
    // left
    if (cursor.x > 0 && grid[cursor.x-1][cursor.y] == empty && cursor.z != RIGHT) newDir.push(LEFT);
    if (newDir.length == 0) {
        return false;
    } else {
        return createVector(cursor.x,cursor.y,newDir[floor(random(newDir.length))]);
    }    
}

function nextCursor(currentCursor) {
    let c = createVector(currentCursor.x,currentCursor.y,currentCursor.z);
    switch(c.z) {
        case UP:
            if (c.y > 0) c.y--;
            break;
        case RIGHT:
            if (c.x < w - 1) c.x++;
            break;
        case DOWN:
            if (c.y < h - 1) c.y++;
            break;
        case LEFT:
            if (c.x > 0) c.x--;
            break;
    }
    if (c.dist(currentCursor) == 0) {
        return false;
    } else {
        return c;
    }
}