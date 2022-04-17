import { drawLineBetweenPoints } from "./numerical-analysis.js";
import {c, canvas} from "./canvas.js";

// Numerically Solving 1st Order Non Elementary ODEs:s
const h = 0.1;
const startCoordinate = [1, 0];
const stop = 10;
function getDerivative(x, y) {
    let derivative = (2*x + y)
    return derivative;
}


let arrayOfCoordinates = [startCoordinate];
//Eulers Method
function eulersMethod(x, y, derivativeCallback, h) {
    if(x > stop) return;
    let nextCoordinate = getNextCoordinateEuler(x, y);
    let nextX = nextCoordinate[0];
    let nextY = nextCoordinate[1];
    let nextDerivative = derivativeCallback(nextX, nextY);
    arrayOfCoordinates.push([nextX, nextY]);

    eulersMethod(nextX, nextY, derivativeCallback, h);
    return [nextX, nextY + h * nextDerivative]; 
}

// Midpoint Method
function midpointMethod(x, y, derivativeCallback, h) {
    if(x > stop) return;
    let nextCoordinate = getNextCoordinateHeun(x, y);
    let nextX = nextCoordinate[0];
    let nextY = nextCoordinate[1];
    let nextDerivative = derivativeCallback(nextX, nextY);


    arrayOfCoordinates.push([nextX, nextY]);

    midpointMethod(nextX, nextY, derivativeCallback, h);
    return [nextX, nextY + h * nextDerivative]; 
}

// Runge Kutta RK4 Method
function rungeMethod(x, y, derivativeCallback, h) {
    if(x > stop) return;
    let nextCoordinate = getNextCoordinateRK4(x, y);
    let nextX = nextCoordinate[0];
    let nextY = nextCoordinate[1];
    let nextDerivative = derivativeCallback(nextX, nextY);


    arrayOfCoordinates.push([nextX, nextY]);

    rungeMethod(nextX, nextY, derivativeCallback, h);
    return [nextX, nextY + h * nextDerivative]; 
}


function getNextCoordinateEuler(x, y) {
    return [x + h, y + h * getDerivative(x, y)];
}
function getNextCoordinateHeun(x, y) {
    let nextX = x + h;
    let midPointY = y + getDerivative(x, y) * h/2;
    let midderivative = getDerivative(x+h/2, midPointY);
    return [nextX, y + midderivative]
}
function getNextCoordinateRK4(x, y) {
    let k1 = getDerivative(x, y);
    let k2 = getDerivative(x+h/2, y + k1*h/2);
    let k3 = getDerivative(x+h/2, y + k2*h/2);
    let k4 = getDerivative(x+h, y + k3*h);

    let nextY = y + (k1 + 2*k2 + 2*k3 + k4)/6;
    let nextX = x + h;
    return [nextX, nextY]
}

function graphCoordinate() {
    c.beginPath();
    c.moveTo(startCoordinate[0], startCoordinate[1]);
    for(let i = 0; i < arrayOfCoordinates.length; i++) {
        let x1 = arrayOfCoordinates[i][0];
        let y1 = arrayOfCoordinates[i][1];
        let x2 = arrayOfCoordinates[i+1][0];
        let y2 = arrayOfCoordinates[i+1][1];
    
        drawLineBetweenPoints(x1, y1, x2, y2);
    }
}

rungeMethod(1, 0, getDerivative, 0.1);
graphCoordinate();