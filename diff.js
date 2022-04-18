import { drawLineBetweenPoints } from "./numerical-analysis.js";
import {c} from "./canvas.js";
import {diffFunction} from "./plotgraph.js";

// Numerically Solving 1st Order Non Elementary ODEs:s
const h = 1;
const startCoordinate = [0, 0];
const stop = 10;
function getDerivative(x, y) {
    return diffFunction(x, y);
}


let arrayOfCoordinates = [startCoordinate];
//Eulers Method
function eulersMethod(x, y, derivativeCallback) {
    if(x > stop) return;
    let nextCoordinates = getNextCoordinateEuler(x, y);
    arrayOfCoordinates.push(nextCoordinates);

    let nextX = nextCoordinates[0];
    let nextY = nextCoordinates[1];

    eulersMethod(nextX, nextY, derivativeCallback, h);
}

// Midpoint Method
function midPointMethod(x, y, derivativeCallback) {
    if(x > stop) return;
    let nextCoordinates = getNextCoordinateMid(x, y);
    arrayOfCoordinates.push(nextCoordinates);

    let nextX = nextCoordinates[0];
    let nextY = nextCoordinates[1];

    midPointMethod(nextX, nextY, derivativeCallback, h);
}

// Runge Kutta RK4 Method
function rungeMethod(x, y, derivativeCallback) {
    if(x > stop) return;
    let nextCoordinates = getNextCoordinateRunge(x, y);
    arrayOfCoordinates.push(nextCoordinates);

    let nextX = nextCoordinates[0];
    let nextY = nextCoordinates[1];

    rungeMethod(nextX, nextY, derivativeCallback, h);
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
    for(let i = 0; i < arrayOfCoordinates.length-1; i++) {
        let x1 = arrayOfCoordinates[i][0];
        let y1 = arrayOfCoordinates[i][1];
        let x2 = arrayOfCoordinates[i+1][0];
        let y2 = arrayOfCoordinates[i+1][1];
    
        drawLineBetweenPoints(x1, y1, x2, y2, color);
    }
}

export function graphODE() {
    if(typeof diffFunction != "function") return;
    eulersMethod(0, 0, getDerivative);
    graphCoordinate("blue");
    arrayOfCoordinates = [startCoordinate];
    midPointMethod(0, 0, getDerivative);
    graphCoordinate("green");
    arrayOfCoordinates = [startCoordinate];
    rungeMethod(0, 0, getDerivative);
    graphCoordinate("red");
}
