export function distanceBetweenPoints(x1, x2, formula, h) { // Arc length of curve
    let length = 0;
    x1 = parseFloat(x1);
    x2 = parseFloat(x2);

    for(let i = x1; i < x2; i += h) {
        let xStep = h;
        let yStep = formula.getMathY(i+h) - formula.getMathY(i);
        let step = Math.sqrt(Math.pow(xStep, 2) + Math.pow(yStep, 2)); // Distance Formula
        length += step;
    }

    return length.toFixed(2);
}

export function areaBetweenPoints(x1, x2, formula, h) { // Riemann Sum
    let area = 0;
    x1 = parseFloat(x1);
    x2 = parseFloat(x2);

    for(let i = x1; i < x2; i+= h) {
        let yLength = formula.getMathY(i);
        let xLength = h;
        let rectangleArea = yLength * xLength;
        area += rectangleArea;
    }

    return area.toFixed(2);
}

export function derivativeAtPoint(x1, formula, h) { //Definition of Derivative
    let derivative = 0;
    x1 = parseFloat(x1);
    let x2 = x1 + h;
    let y1 = formula.getMathY(x1);
    let y2 = formula.getMathY(x2);

    derivative = (x2-x1)/(y2-y1);
    return derivative
}

export function volumeBetweenPoints(x1, x2, formula, h) { // Solid of Revolution
    let volume = 0;
    x1 = parseFloat(x1);
    x2 = parseFloat(x2);

    for(let i = x1; i < x2; i += h) {
        let radius = formula.getMathY(i);
        let discVolume = Math.pow(radius, 2) * h * Math.PI // Volume of disc = PI * r^2 * height
        volume += discVolume;
    }

    return volume;
}

export function surfaceAreaBetweenPoints(x1, x2, formula, h) { //Surface area of solid of revolution
    let surfaceArea = 0;
    x1 = parseFloat(x1);
    x2 = parseFloat(x2);

    for(let i = x1; i < x2; i += h) {
        let dl = Math.sqrt(Math.pow(derivativeAtPoint(i), 2) + 1) //Difference in length
        let y = formula.getMathY(i);
        surfaceDiskArea = 2* Math.PI * y * dl; // Surface area of disk = 2 * Radius * PI * width (circumfrence * width)
        surfaceArea += surfaceDiskArea;
    }

    return surfaceArea;
}

export function xAndYDifferenceBetweenPoints(x1, x2, formula) {
    x1 = parseFloat(x1);
    x2 = parseFloat(x2);

    let y1 = formula.getMathY(x1);
    let y2 = formula.getMathY(x2);

    let dx = x2-x1;
    let dy = y2-y1;

    return [dx, dy];
}

export function limitAtPoint(x1, formula, delta, epsilon) { // Epsilon Delta definition of limit
    let leftSideLimit = formula.getMathY(x1-delta);
    let rightSideLimit = formula.getMathY(x1+delta);

    let difference = Math.abs(leftSideLimit - rightSideLimit);
    if (difference < epsilon) {
        return true;
    } else {
        return false;
    }
}

export function continuityBetweenPoints(x1, x2, formula, h, delta, epsilon) { // Checking limit for every point in given intervall(not exactly accurate :( ))
    x1 = parseFloat(x1);
    x2 = parseFloat(x2);
    
    for(let i = x1; i < x2; i += h) {
        if(!limitAtPoint(x1, formula, delta, epsilon)) {
            return false;
        }
    }
    return true;
}

export function turningPoints(x1, x2, formula, h, epsilon) {
    listOfLocalMaximaAndMinima = [];

    x1 = parseFloat(x1);
    x2 = parseFloat(x2);

    for(let i = x1; i < x2; i += h) {
        if(derivativeAtPoint(i) < epsilon) {
            listOfLocalMaximaAndMinima.push([i, formula.getMathY(i)]);
        }
    }

    return listOfLocalMaximaAndMinima;
}

export function crossesXAxis(x1, x2, formula, h, epsilon) {
    listsOfPointsThatCrossXAxis = [];

    x1 = parseFloat(x1);
    x2 = parseFloat(x2);

    for(let i = x1; i < x2; i += h) {
        if(formula.getMathY(i) < epsilon) {
            listsOfPointsThatCrossXAxis.push([i, formula.getgetMathY(i)]);
        }
    }

    return listsOfPointsThatCrossXAxis;
}

export function intersectBetweenPoints(x1, x2, formula1, formula2, h) {
    listOfIntersections = [];
    x1 = parseFloat(x1);
    x2 = parseFloat(x2);

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