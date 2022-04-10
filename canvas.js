export const canvas = document.querySelector("canvas");
export const c = canvas.getContext("2d");
canvas.width = innerWidth;
canvas.height = innerHeight;

let scale = 16;
let scaleX = 16; //The amount of boxes per row
let scaleY = 16; //The amount of boxes per column
export let squareWidth = canvas.width / scale;
export let offsetX = squareWidth; //This offset will handle panning in the x-direction
export let offsetY = squareWidth; //This offset will handle panning in the x-direction

//Hold down variables
let mouseDown = false;
let xPosAtClick;
let yPosAtClick;
let cursorXPos;
let cursorYPos;

let inverseX = false; //false = right movment, true = left movement
let inverseY = false;

//Canvas filling up entire screen
window.addEventListener("resize", function() {
    canvas.width = innerWidth;
    canvas.height = innerHeight;
    squareWidth = canvas.width / scale;
    drawGrid();
})

canvas.addEventListener("mousedown", function(e) {
    xPosAtClick = e.clientX;
    yPosAtClick = e.clientY; 
    mouseDown = true;
})

canvas.addEventListener("mouseup",function(e) {
    mouseDown = false;
})

canvas.addEventListener("mousemove", function(e) {
    if(!mouseDown) { //If not holding mouse 
        return
    }
    cursorXPos = e.clientX;
    cursorYPos = e.clientY;
    
    offsetX = (xPosAtClick - cursorXPos); // How much cursor has moved
    offsetY = (yPosAtClick - cursorYPos);

    
    //Checking if was movement to right or left
    if(offsetX >= 0) {
        scaleX = 16 + Math.ceil(offsetX / squareWidth);
        inverseX = false
    } else {
        scaleX = 16 + Math.ceil(-offsetX / squareWidth);
        inverseX = true;
    } 
    
    if(offsetY >= 0) {
        scaleY = 16 + Math.ceil(offsetY / squareWidth);
        inverseY = false;
    } else {
        scaleY = 16 + Math.ceil(-offsetY / squareWidth);
        inverseY = true;
    }

    clearCanvas()
    drawGrid();
})

//zoom
canvas.addEventListener("wheel",function(e) {
    clearCanvas();
    scale  += e.deltaY * 0.01; // e.deltaY is how much scroll
    reset();
    drawGrid();
})

function clearCanvas() {
    c.clearRect(0, 0, canvas.width, canvas.height);
}

function reset() {
    squareWidth = canvas.width / scale;
    offsetX = squareWidth;
    offsetY = squareWidth;
}

function drawGrid() {
    c.beginPath();

    //Vertical Lines
    if(!inverseX) { // From left to right
        for(let i = 0; i < scaleX; i++) {  
            c.moveTo(squareWidth * i+(squareWidth-offsetX), 0); //squareWidth is space between columns and offset the cursor movement
            c.lineTo(squareWidth*i+(squareWidth-offsetX), canvas.height);
        }
    } else { // From right to left
        for(let i = 16; i >= 16-scaleX; i--) {
            c.moveTo(squareWidth * i+(squareWidth-offsetX), 0);
            c.lineTo(squareWidth*i+(squareWidth-offsetX), canvas.height);
        }
    }

    //Horizontal Lines
    if(!inverseY) {
        for(let i = 0; i < scaleY; i++) {
            c.moveTo(0, squareWidth * i+(squareWidth-offsetY));
            c.lineTo(canvas.width, squareWidth * i+(squareWidth-offsetY));
        }
    } else {
        console.log("up");
        for(let i = 16; i >= 16-scaleY; i--) {
            c.moveTo(0, squareWidth * i+(squareWidth-offsetY));
            c.lineTo(canvas.width, squareWidth * i+(squareWidth-offsetY));
        }
    }
    c.stroke();
}

drawGrid();

/* 
Canvas Transformations
ctx.translate(x, y) => shifting the entire canvas origin
ctx.rotate(angle) => rotates the entire canvas around origin by angle radians
ctx.scale(x, y) => scales the entire canvas by *x and *y

ctx.save(); => saves current transform
ctx.restore(); => restores to previous save

*/