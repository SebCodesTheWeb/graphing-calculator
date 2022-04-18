import {c, canvas, squareWidth, offsetX, offsetY, clearCanvas} from "./canvas.js";
import {performance, decimalsUsed, transformationMatrix, transformationApplied, getTransformedCoordinates} from "./plotgraph.js";

export function drawSingleDot(x1, y1, color) {
    let convertedX1 = x1 *squareWidth + canvas.width/2-offsetX;
    let convertedY1 = y1  *-squareWidth + canvas.height/2-offsetY;

    c.beginPath();
    c.fillStyle = `${color}`;
    c.arc(convertedX1, convertedY1, 5, 0, Math.PI * 2, false); // Draw a circle at graph
    c.fill();
    c.fillStyle = "#333;"
}

export function drawLineBetweenPoints(x1, y1, x2, y2, color="red", transformed=false) {
    if(transformed) {
        let newCoordinates = getTransformedCoordinates(x1, y1);
        x1 = newCoordinates[0];
        y1 = newCoordinates[1];
        newCoordinates = getTransformedCoordinates(x2, y2);
        x2 = newCoordinates[0];
        y2 = newCoordinates[1];
    }

    let convertedX1 = x1 *squareWidth + canvas.width/2-offsetX;
    let convertedX2 = x2 *squareWidth + canvas.width/2-offsetX;
    let convertedY1= y1 *-squareWidth + canvas.height/2-offsetY;
    let convertedY2= y2 *-squareWidth + canvas.height/2-offsetY;
    
    // console.log(x1, y1, x2, y2);
    
    c.beginPath();
    c.strokeStyle = `${color}`;
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

export function fillRectangle(x1, y1, width, height) {
    let convertedX1 = x1 *squareWidth + canvas.width/2-offsetX;
    let convertedY1= y1 *-squareWidth + canvas.height/2-offsetY;
    
    let updatedWidth = width*squareWidth;
    let updateHeight = height*squareWidth;
    
    c.beginPath();
    c.fillStyle = "#88F2E8";
    c.rect(convertedX1, convertedY1, updatedWidth, updateHeight);
    c.fill();
}


export function drawDisc(x1, y1, h, fill) { //(x coordinate, ycooridinate/yradius, xradius, if want fill or just dotted lines)
    c.beginPath();
    y1 = Math.abs(y1);
    c.fillStyle = "#41BFB3";
    c.strokeStyle = "red";
    c.setLineDash([1, 2]);
    c.lineWidth = 3;
    let convertedX1 = x1 *squareWidth + canvas.width/2-offsetX;
    let convertedY1= y1 *-squareWidth + canvas.height/2-offsetY;
    let radiusX = Math.abs(h);
    let radiusY = y1*squareWidth;

    c.ellipse(convertedX1, convertedY1+radiusY, radiusX, radiusY, 0, 0, Math.PI * 2, false);
    if(fill) { 
        c.fill();
    }
    c.stroke();
    c.setLineDash([]);
    c.fillStyle = "#333";
    c.strokeStyle = "#333";
}



export function drawReflection(x1, x2, formula, h) { //Draws solid of revolution
    let numberOfIterations = 0; 
    if(x2 > x1) {
        for(let i = x1; i < x2; i += h) {
            let y = formula.getMathY(i);
            c.beginPath();
            c.rect(i, formula.getMathY(i), h*squareWidth, formula.getMathY(i)*squareWidth);
            c.fill();
            c.stroke();

            drawLineBetweenPoints(i, -y, i+h, -formula.getMathY(i+h)); // Draw reflection graph
            fillRectangle(i, formula.getMathY(i), h, formula.getMathY(i)*2) // Fill gap with blue rectangles
            if(i > x1+(h*10) && i < x2-(h*10) && numberOfIterations % (performance*1000) == 0) { // Generate a red line every 100-1000 iterations
                drawDisc(i, formula.getMathY(i), 10, false);
            }
            numberOfIterations++;
        }
        if(Math.abs(formula.getMathY(x1)) > 0.15) { // Draw start and end ellipse last so it overlaps the blue rectangles
            drawDisc(x1, formula.getMathY(x1), 10, true);
        } 
        drawDisc(x2, formula.getMathY(x2), 10, true);
        
    } else { // Same but reverse
        drawDisc(x1, formula.getMathY(x1), 10);
        for(let i = x1; i > x2; i -= h) {
            let y = formula.getMathY(i);
            drawLineBetweenPoints(i, -y, i-h, -formula.getMathY(i-h));
            fillRectangle(i, formula.getMathY(i), h, formula.getMathY(i)*2)
            if(i < x1-(h*10) && i > x2+(h*10) && numberOfIterations % (performance*1000) == 0) {
                drawDisc(i, formula.getMathY(i), 10, false);
            }
            numberOfIterations++;
        }
        if(Math.abs(formula.getMathY(x1)) > 0.15) {
            drawDisc(x1, formula.getMathY(x1), 10, true);
        } 
        drawDisc(x2, formula.getMathY(x2), 10, true);
    }
}


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

    return length.toFixed(decimalsUsed);
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

    return area.toFixed(decimalsUsed);
}

export function derivativeAtPoint(x1, formula, h, drawDerivative=true) { //Definition of Derivative
    let x2 = x1 + h;
    let y1 = formula.getMathY(x1);
    let y2 = formula.getMathY(x2);
    let derivative = (y2-y1)/(h); //f(x+h)-f(x)/h

    if(drawDerivative) {
        drawLineBetweenPoints(x1-1, y1-derivative, x1+1, y1+derivative);
    }

    return derivative.toFixed(decimalsUsed);
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
        let dl = Math.sqrt(Math.pow(derivativeAtPoint(i, formula, h, false), 2) + 1) //Difference in length
        let y = formula.getMathY(i);
        let surfaceDiskArea = 2* Math.PI * y * dl; // Surface area of disk = 2 * Radius * PI * width (circumfrence * width)
        surfaceArea += surfaceDiskArea;
    }

    return (surfaceArea/10).toFixed(decimalsUsed); //Idk why but it always returns 10x too much so I divide by 10
}

export function xAndYDifferenceBetweenPoints(x1, x2, formula) { // Difference in x and y coordinates between points
    let y1 = formula.getMathY(x1);
    let y2 = formula.getMathY(x2);

    let dx = x2-x1;
    let dy = y2-y1;
    let dDiagonal = Math.sqrt(dx*dx + dy*dy);

    return [dx, dy, dDiagonal];
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
            drawSingleDot(i, formula.getMathY(i), "red")
            return false;
        }
    }
    return true;
}

export function turningPoints(x1, x2, formula, h, epsilon) { 
    let listOfLocalMaximaAndMinima = [];

    for(let i = x1; i < x2; i += h) {
        if(Math.abs(derivativeAtPoint(i, formula, h, false)) < epsilon) { //If the derivative is closed to zero then the point is a turning point
            listOfLocalMaximaAndMinima.push([i.toFixed(decimalsUsed), formula.getMathY(i).toFixed(decimalsUsed)]);
            drawSingleDot(i, formula.getMathY(i), "green");
        }
    }

    return listOfLocalMaximaAndMinima;
}

export function crossesXAxis(x1, x2, formula, h, epsilon) {
    let listsOfPointsThatCrossXAxis = [];

    for(let i = x1; i < x2; i += h) {
        if(Math.abs(formula.getMathY(i)) < epsilon) {
            listsOfPointsThatCrossXAxis.push([i.toFixed(decimalsUsed), formula.getMathY(i).toFixed(decimalsUsed)]);
            drawSingleDot(i, formula.getMathY(i), "green");
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