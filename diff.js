import { drawLineBetweenPoints } from "./numerical-analysis.js";
import {c, clearCanvas, drawAxis, drawGrid} from "./canvas.js";
import {diffFunction, drawSelectedGraphs} from "./plotgraph.js";

// Numerically Solving 1st Order Non Elementary ODEs:s
let h = 0.1;
let startCoordinate = [0, 0];
let stop = 100;
function getDerivative(x, y) {
    return diffFunction(x, y);
}
let arrayOfCoordinates = [startCoordinate];

document.querySelector("#step-input").addEventListener("change", function() {
    h = parseFloat(document.querySelector("#step-input").value);
    reset();
})
document.querySelector("#start-x-input").addEventListener("change", function() {
    startCoordinate[0] = parseFloat(document.querySelector("#start-x-input").value)
    reset();

})
document.querySelector("#start-y-input").addEventListener("change", function() {
    startCoordinate[1] = parseFloat(document.querySelector("#start-y-input").value)
    reset();
})
document.querySelector("#stop-input").addEventListener("change", function() {
    stop = parseFloat(document.querySelector("#stop-input").value)
    reset();
})

function reset() {
    clearCanvas();
    drawAxis();
    drawGrid();
    drawSelectedGraphs();
    graphODE();
}


//Eulers Method
function eulersMethod(x, y) {
    if(x > stop) return;
    let nextCoordinates = getNextCoordinateEuler(x, y);
    arrayOfCoordinates.push(nextCoordinates);

    let nextX = nextCoordinates[0];
    let nextY = nextCoordinates[1];

    eulersMethod(nextX, nextY);
}

// Midpoint Method
function midPointMethod(x, y) {
    if(x > stop) return;
    let nextCoordinates = getNextCoordinateMid(x, y);
    arrayOfCoordinates.push(nextCoordinates);

    let nextX = nextCoordinates[0];
    let nextY = nextCoordinates[1];

    midPointMethod(nextX, nextY);
}

// Runge Kutta RK4 Method
function rungeMethod(x, y) {
    if(x > stop) return;
    let nextCoordinates = getNextCoordinateRunge(x, y);
    arrayOfCoordinates.push(nextCoordinates);

    let nextX = nextCoordinates[0];
    let nextY = nextCoordinates[1];

    rungeMethod(nextX, nextY);
}


function getNextCoordinateEuler(x, y) {
    return [x + h, y + h * getDerivative(x, y)];
}
function getNextCoordinateMid(x, y) {
    let k1 = getDerivative(x, y);
    let k2 = getDerivative(x+h/2, y + k1*h/2);
    
    let nextX = x +h;
    let nextY = y + k2*h;
    return [nextX, nextY];
}
function getNextCoordinateRunge(x, y) {
    let k1 = getDerivative(x, y);
    let k2 = getDerivative(x+h/2, y + k1*h/2);
    let k3 = getDerivative(x+h/2, y + k2*h/2);
    let k4 = getDerivative(x+h, y + k3*h);

    let nextY = y + (k1 + 2*k2 + 2*k3 + k4)*h/6;
    let nextX = x + h;
    return [nextX, nextY]
}


function graphCoordinate(color) {
    c.beginPath();
    c.moveTo(startCoordinate[0], startCoordinate[1]);
    c.lineTo(arrayOfCoordinates[0][1], arrayOfCoordinates[0][1]);
    c.stroke();
    for(let i = 0; i < arrayOfCoordinates.length-1; i++) {
        let x1 = arrayOfCoordinates[i][0];
        let y1 = arrayOfCoordinates[i][1];
        let x2 = arrayOfCoordinates[i+1][0];
        let y2 = arrayOfCoordinates[i+1][1];
    
        drawLineBetweenPoints(x1, y1, x2, y2, color, true);
    }
}

export function graphODE() {
    if(typeof diffFunction != "function") return;
    
    
    let x = startCoordinate[0];
    let y = startCoordinate[1];
    
    console.log(x, y, getDerivative(x, y));
    arrayOfCoordinates = [startCoordinate];
    eulersMethod(x, y);
    graphCoordinate("blue");
    arrayOfCoordinates = [startCoordinate];
    rungeMethod(x, y);
    graphCoordinate("red");
    arrayOfCoordinates = [startCoordinate];
    midPointMethod(x, y);
    graphCoordinate("green");
}    

