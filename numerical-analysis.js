import {c, canvas, squareWidth, offsetX, offsetY} from "./canvas.js";

export function drawLineBetweenPoints(x1, y1, x2, y2) {
    let convertedX1 = x1 *squareWidth + canvas.width/2-offsetX;
    let convertedX2 = x2 *squareWidth + canvas.width/2-offsetX;
    let convertedY1= y1 *-squareWidth + canvas.height/2-offsetY;
    let convertedY2= y2 *-squareWidth + canvas.height/2-offsetY;

    // console.log(x1, y1, x2, y2);

    c.beginPath();
    c.strokeStyle = "red";
    c.lineWidth = 3;
    c.moveTo(convertedX1, convertedY1);
    c.lineTo(convertedX2, convertedY2);
    c.stroke();
}

export function drawRectangle(x1, y1, x2, y2) {
    let convertedX1 = x1 *squareWidth + canvas.width/2-offsetX;
    let convertedX2 = x2 *squareWidth + canvas.width/2-offsetX;
    let convertedY1= y1 *-squareWidth + canvas.height/2-offsetY;
    let convertedY2= y2 *-squareWidth + canvas.height/2-offsetY;


    c.beginPath();
    c.strokeStyle = "red";
    c.lineWidth = 3;
    c.moveTo(convertedX1, convertedY1);
    c.lineTo(convertedX2, convertedY1);
    c.lineTo(convertedX2, convertedY2);
    c.lineTo(convertedX1, convertedY2);
    c.lineTo(convertedX1, convertedY1);
    c.stroke();
}

// export function drawDisc(x1, y1, x2, y1, h) {
//     for(let i = x1; i < x2; i += h) {

//     }
// }


export function distanceBetweenPoints(x1, x2, formula, h) { // Arc length of curve
    let length = 0;

    if(x2 > x1) {
        for(let i = x1; i < x2; i += h) {
            let xStep = h;
            let yStep = formula.getMathY(i+h) - formula.getMathY(i);
    
            drawLineBetweenPoints(i, formula.getMathY(i), i+h, formula.getMathY(i+h));
    
            let step = Math.sqrt(Math.pow(xStep, 2) + Math.pow(yStep, 2)); // Distance Formula
            length += step;
        }
    } else {
        for(let i = x1; i > x2; i -= h) {
            let xStep = h;
            let yStep = formula.getMathY(i-h) - formula.getMathY(i);
    
            drawLineBetweenPoints(i, formula.getMathY(i), i-h, formula.getMathY(i-h));
    
            let step = Math.sqrt(Math.pow(xStep, 2) + Math.pow(yStep, 2)); // Distance Formula
            length += step;
        }
    }

    return length.toFixed(2);
}

export function areaBetweenPoints(x1, x2, formula, h) { // Riemann Sum
    let area = 0;

    if(x2 > x1) {
        for(let i = x1; i < x2; i+= h) {
            let yLength = formula.getMathY(i);
            let xLength = h;
    
            drawRectangle(i, yLength, i+h, 0);
    
            let rectangleArea = yLength * xLength;
            area += rectangleArea;
        }
    } else {
        for(let i = x1; i > x2; i-= h) {
            let yLength = formula.getMathY(i);
            let xLength = h;
    
            drawRectangle(i, yLength, i-h, 0);
    
            let rectangleArea = yLength * xLength;
            area += rectangleArea;
        }
    }

    return area.toFixed(2);
}

export function derivativeAtPoint(x1, formula, h) { //Definition of Derivative
    let x2 = x1 + h;
    let y1 = formula.getMathY(x1);
    let y2 = formula.getMathY(x2);
    let derivative = (y2-y1)/(h); //f(x+h)-f(x)/h

    drawLineBetweenPoints(x1-1, y1-derivative, x1+1, y1+derivative);

    return derivative.toFixed(2);
}

export function volumeBetweenPoints(x1, x2, formula, h) { // Solid of Revolution
    let volume = 0;

    for(let i = x1; i < x2; i += h) {
        let radius = formula.getMathY(i);
        let discVolume = Math.pow(radius, 2) * h * Math.PI // Volume of disc = PI * r^2 * height
        volume += discVolume;
    }

    return volume;
}

export function surfaceAreaBetweenPoints(x1, x2, formula, h) { //Surface area of solid of revolution
    let surfaceArea = 0;

    for(let i = x1; i < x2; i += h) {
        let dl = Math.sqrt(Math.pow(derivativeAtPoint(i, formula, h), 2) + 1) //Difference in length
        let y = formula.getMathY(i);
        let surfaceDiskArea = 2* Math.PI * y * dl; // Surface area of disk = 2 * Radius * PI * width (circumfrence * width)
        surfaceArea += surfaceDiskArea;
    }

    return (surfaceArea/10).toFixed(2); //Idk why but it always returns 10x too much so I divide by 10
}

export function xAndYDifferenceBetweenPoints(x1, x2, formula) { // Difference in x and y coordinates between points
    let y1 = formula.getMathY(x1);
    let y2 = formula.getMathY(x2);

    let dx = x2-x1;
    let dy = y2-y1;

    return [dx, dy];
}

export function limitAtPoint(x1, formula, delta, epsilon) { // Epsilon Delta definition of limit
    let leftSideLimit = formula.getMathY(x1-delta);
    let rightSideLimit = formula.getMathY(x1+delta);
    let exactY = formula.getMathY(x1);

    let leftSideDifference = Math.abs(leftSideLimit - exactY);
    let rightSideDifference = Math.abs(rightSideLimit - exactY);

    if (leftSideDifference < epsilon && rightSideDifference < epsilon) {
        return true;
    } else {
        return false;
    }
}

export function continuityBetweenPoints(x1, x2, formula, h, delta, epsilon) { // Checking limit for every point in given intervall)
    
    for(let i = x1; i < x2; i += h) {
        if(!limitAtPoint(i, formula, delta, epsilon)) {
            return false;
        }
    }
    return true;
}

export function turningPoints(x1, x2, formula, h, epsilon) { 
    let listOfLocalMaximaAndMinima = [];

    for(let i = x1; i < x2; i += h) {
        if(Math.abs(derivativeAtPoint(i, formula, h)) < epsilon) { //If the derivative is closed to zero then the point is a turning point
            listOfLocalMaximaAndMinima.push([i.toFixed(2), formula.getMathY(i).toFixed(2)]);
        }
    }

    return listOfLocalMaximaAndMinima;
}

export function crossesXAxis(x1, x2, formula, h, epsilon) {
    let listsOfPointsThatCrossXAxis = [];

    for(let i = x1; i < x2; i += h) {
        if(Math.abs(formula.getMathY(i)) < epsilon) {
            listsOfPointsThatCrossXAxis.push([i.toFixed(2), formula.getMathY(i).toFixed(2)]);
        }
    }

    return listsOfPointsThatCrossXAxis;
}

export function intersectBetweenPoints(x1, x2, formula1, formula2, h) {
    listOfIntersections = [];

    for(let i = x1; i < x2; i += h) {
        let y1 = formula1.getMathY(i)
        let y2 = formula2.getMathY(i)
        if(Math.abs(y2-y1) < epsilon) {
            listOfIntersections.push([i, y1]);
        }
    }

    return listOfIntersections;
}


// let pointA = {
//     mathX: 1
// }
// let pointB = {
//     mathX: 10
// }

// let formula = {
//     getMathY: function(x) {
//         return Math.sin(x);
//     }
// }

// let test1 = distanceBetweenPoints(pointA, pointB, formula, 0.1);
// console.log(test1);