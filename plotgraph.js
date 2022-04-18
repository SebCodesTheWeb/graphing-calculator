import {c, canvas, squareWidth, offsetX, offsetY, mouseDown} from "./canvas.js";
import Formula from "./parser.js";
import {clearCanvas, drawGrid, drawAxis} from "./canvas.js";
import {distanceBetweenPoints, areaBetweenPoints, derivativeAtPoint, volumeBetweenPoints, xAndYDifferenceBetweenPoints, surfaceAreaBetweenPoints, limitAtPoint, continuityBetweenPoints, crossesXAxis, turningPoints, drawReflection, drawLineBetweenPoints} from "./numerical-analysis.js";
import {differenceToolActivated, distanceToolActivated, areaToolActivated, derivativeToolActivated, volumeToolActivated, surfaceAreaToolActivated, limitToolActivated, anyToolActivated, deactiveAllTools, continuityToolActivated, rootToolActivated, turningPointsToolActivated, snapToolActivated} from "./tools.js";
import {graphODE} from "./diff.js";

const colors = ["#54F5B8", "#3963ED", "#F76223", "#6921ED", "#FA9F00", "#CD1DF5"];
const alphabet = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"];
let currentLetter = 0;
let listOfGraphs = [];
let listOfInputedGraphs = [];
let savedFunctions = []; // List of inputted functions
let listOfSavedDots = [];

//For Resizing of Window
const windowWidth = window.innerWidth;
const windowHeight = window.innerHeight;
let windowOffsetX = 0; 
let windowOffsetY = 0;

const performanceSlider = document.querySelector("#performance-slider");
const decimalInput = document.querySelector("#decimal-input");
const resultWindow = document.querySelector("#info");
export let performance = 0.1;
export let decimalsUsed = 2;
export let selectedFunction = 0;


export let transformationMatrix = [1, 0, 0, 1];
export let transformationApplied = false;
//takes in a point and applies the transformation
export function getTransformedCoordinates(x, y) {
    let a = x * transformationMatrix[0]
    let b = x * transformationMatrix[1]
    let c = y * transformationMatrix[2]
    let d = y * transformationMatrix[3]

    let newX = a + c;
    let newY = b + d;

    return [newX, newY];
}



function randomColor() {
    let color = Math.ceil(Math.random() * colors.length);
    return colors[color];
}

export function drawSelectedGraphs() {
    for(let i = 0; i < listOfGraphs.length; i++) {
        listOfGraphs[i].drawGraph();
    } 
    for(let i = 0; i < listOfInputedGraphs.length; i++) {
        listOfInputedGraphs[i].drawInputedGraph();
    }
    graphODE();
}

export default class Graph {
    constructor (outputFunction, formula) {
        this.color = randomColor();
        this.outputFunction = outputFunction; //Callback function for y -coordinate
        this.centerX = canvas.width / 2;
        this.centerY = canvas.height / 2;
        this.lineWidth = 2;
        this.formula = formula;
    }

    drawGraph() {
        // c.beginPath();
        // c.lineWidth = this.lineWidth;
        // c.strokeStyle = this.color;
        // c.moveTo(0, this.centerY)

        // //Setting offset to 0,0 in beginning
        // let addjustedoffsetX;
        // let addjustedoffsetY;
        // if(offsetX && offsetY == squareWidth) {
        //     addjustedoffsetX = 0;
        //     addjustedoffsetY = 0;
        // } else {
        //     addjustedoffsetX = offsetX;
        //     addjustedoffsetY = offsetY;
        // }

        // for(let i = -canvas.width/2+addjustedoffsetX; i < canvas.width/2+addjustedoffsetX; i++) {
        //     let rescaledYCoordinate = this.outputFunction((i)/squareWidth)*squareWidth;
        //     let convertedYCoordinate = canvas.height- rescaledYCoordinate; //y coordinate between canvas

        //     if(!isNaN(convertedYCoordinate)) { // Only draw if point is defined
        //         c.lineTo(i+this.centerX-addjustedoffsetX, convertedYCoordinate-this.centerY-addjustedoffsetY); //Generating line between coordinates
        //     } else {
        //         c.stroke();
        //         c.beginPath();
        //     }
        // }
        // c.stroke();
        c.beginPath();
        c.lineWidth = this.lineWidth;
        c.strokeStyle = this.color;
        c.moveTo(0, this.centerY)

        for(let i = -canvas.width/2+offsetX; i < canvas.width/2+offsetX; i++) {
            // Firstly get math new math coordinates from matrix
            let xInput = (i/squareWidth);
            let yInput = this.outputFunction((xInput))
            let newCoordinates = getTransformedCoordinates(xInput, yInput);
            let transformedX = newCoordinates[0];
            let transformedY = newCoordinates[1];

            //Then get the canvas coordinates to draw
            let canvasX = transformedX * squareWidth + canvas.width/2-offsetX;
            let canvasY = transformedY * -squareWidth + canvas.height/2-offsetY; 

            if(!isNaN(canvasY) && Math.abs(canvasY) < (Math.pow(10, 9))) { // Only draw if point is defined
                c.lineTo(canvasX, canvasY); //Generating line between coordinates
            } else {
            }
        }
        c.stroke();
    }

    drawInputedGraph() {
        // c.beginPath();
        // c.lineWidth = this.lineWidth;
        // c.strokeStyle = this.color;
        // c.moveTo(0, this.centerY)

        // //Setting offset to 0,0 in beginning
        // let addjustedoffsetX;
        // let addjustedoffsetY;
        // if(offsetX && offsetY == squareWidth) {
        //     addjustedoffsetX = 0;
        //     addjustedoffsetY = 0;
        // } else {
        //     addjustedoffsetX = offsetX;
        //     addjustedoffsetY = offsetY;
        // }
        // addjustedoffsetX += windowOffsetX/2;
        // addjustedoffsetY -= windowOffsetY/2;

        // for(let i = -canvas.width/2+addjustedoffsetX; i < canvas.width/2+addjustedoffsetX-windowOffsetX/2; i++) {
        //     let rescaledYCoordinate = this.formula.evaluate({x: i/squareWidth})*squareWidth;
        //     let convertedYCoordinate = canvas.height- rescaledYCoordinate; //y coordinate between canvas

        //     if(!isNaN(convertedYCoordinate)) { // Only draw if point is defined
        //         c.lineTo(i+this.centerX-addjustedoffsetX, convertedYCoordinate-this.centerY-addjustedoffsetY); //Generating line between coordinates
        //     } else {
        //         c.stroke();
        //         c.beginPath();
        //     }
        // }
        // c.stroke();
        c.lineWidth = this.lineWidth;
        c.strokeStyle = this.color;
        c.moveTo(0, this.centerY)
    
        for(let i = -canvas.width/2+offsetX; i < canvas.width/2+offsetX; i++) {
            // Firstly get math new math coordinates from matrix
            let xInput = (i/squareWidth);
            let yInput = this.formula.evaluate({x: xInput});
            let newCoordinates = getTransformedCoordinates(xInput, yInput);
            let transformedX = newCoordinates[0];
            let transformedY = newCoordinates[1];

            
            
            //Then get the canvas coordinates to draw
            let canvasX = transformedX * squareWidth + canvas.width/2-offsetX;
            let canvasY = transformedY * -squareWidth + canvas.height/2-offsetY; 
            
            if(!isNaN(canvasY) && Math.abs(canvasY) < (Math.pow(10, 9))) { // Only draw if point is defined and under 1 billion away (it has problems with drawing points that are super far away)
                c.lineTo(canvasX, canvasY); //Generating line between coordinates
            } else {
                c.stroke();
                c.beginPath();
            }

        }
        c.stroke();
    }

    drawTransformedGraph() {
        c.beginPath();
        c.lineWidth = this.lineWidth;
        c.strokeStyle = this.color;
        c.moveTo(0, this.centerY)

        for(let i = -canvas.width/2+offsetX; i < canvas.width/2+offsetX; i++) {
            // Firstly get math new math coordinates from matrix
            let xInput = (i/squareWidth)
            let yInput = this.outputFunction((xInput))
            let newCoordinates = getTransformedCoordinates(xInput, yInput);
            let transformedX = newCoordinates[0];
            let transformedY = newCoordinates[1];

            //Then get the canvas coordinates to draw
            let canvasX = transformedX * squareWidth + canvas.width/2-offsetX;
            let canvasY = transformedY * -squareWidth + canvas.height/2-offsetY; 


            if(!isNaN(canvasY)) { // Only draw if point is defined
                c.lineTo(canvasX, canvasY); //Generating line between coordinates
            } else {
                c.stroke();
                c.beginPath();
            }
        }
        c.stroke();
    }

    

    yCoordinate(xCoordinate) {
        let rescaledYCoordinate = this.formula.evaluate({x: xCoordinate/squareWidth})*squareWidth;
        let convertedYCoordinate = canvas.height- rescaledYCoordinate; //y coordinate between canvas
        return convertedYCoordinate-this.centerY-offsetY;
    }

    getMathY(mathX) {
        return this.formula.evaluate({x: mathX});
    }

    getMathX(mathY, guessX, interval, epsilon) { //Basically inverse function but numerically guessing
        let listOfGuesses = [];
        let bestGuess = guessX;

        for(let i = guessX-interval; i < guessX+interval; i+= 0.01) { //Generate tons of guesses around interval
            let currentDistance = Math.abs(this.formula.evaluate({x: i}));
            let totalDistance = Math.abs(currentDistance - Math.abs(mathY)); //Determine how good guess is by distance to y

        if(totalDistance < epsilon) {
                listOfGuesses.push([i, totalDistance]); //Create a list of good guesses (a guess is good if less than epsilon)
            }
        }
        for(let i = 0; i < listOfGuesses.length; i++) { //Loop through the list and find the best guess
            let guessDistance = listOfGuesses[i][1];
            let bestGuessDistance = Math.abs(Math.abs(this.formula.evaluate({x: bestGuess}))-Math.abs(mathY));
            if(guessDistance < bestGuessDistance) { //if guess better than current best guess, replace bestguess
                bestGuess = listOfGuesses[i][0];
            }
        }

        return bestGuess;
    }
}

class Dot {
    constructor(x){
        this.x = x;
        this.name = alphabet[currentLetter]; //Selects sequential letters from alphabet
        currentLetter++;
        if(currentLetter == 25) { //Reseting if max
            currentLetter = 0
        }
        this.mathX = parseFloat(((this.x-(canvas.width/2))/squareWidth).toFixed(2)); //Calcuate coordinates
        let myY = listOfInputedGraphs[selectedFunction].yCoordinate(this.x-canvas.width/2)
        this.mathY = -((myY-(canvas.height/2))/squareWidth).toFixed(2); //From canvas coordinates to math coordinates
    }

    draw() {
        c.beginPath();
        c.fillStyle = `#333`;
        let myY = listOfInputedGraphs[selectedFunction].yCoordinate(this.x-canvas.width/2)
        c.arc(this.x-offsetX, myY, 5, 0, Math.PI * 2, false);
        c.fillStyle = "hsla(0, 0%, 0%, 0.5)";

        if(!isNaN(this.mathX) && !isNaN(this.mathY)) {
            c.fillText(`(${this.mathX}, ${this.mathY})`, this.x+10-offsetX, myY+10); // Display coordinates
            c.fillText(`${this.name}`, this.x-offsetX, myY -30)
        } 

        c.fill();
        drawSelectedGraphs();
        drawAxis();
        drawGrid();
    }
}

canvas.addEventListener("mousemove", function(e) {
    // console.log(e.offsetX-canvas.width/2, e.offsetY-canvas.height/2);
    windowOffsetX = windowWidth - window.innerWidth; // Setting the offset equal to difference in window size
    windowOffsetY = windowHeight - window.innerHeight; // Setting the offset equal to difference in window
    if(anyToolActivated && !transformationApplied) {
        drawDot(e);
        drawSavedDots();
    }

    if(derivativeToolActivated) {
        let mouseX = parseFloat(((e.clientX-(canvas.width/2)+offsetX)/squareWidth).toFixed(decimalsUsed));
        let derivative = parseFloat(derivativeAtPoint(mouseX, listOfInputedGraphs[selectedFunction], 0.001/performance, true)).toFixed(decimalsUsed);
        c.beginPath();
        c.font = "18px monospace"
        c.fillText(`d/dx=${derivative}`, mouseX *squareWidth + canvas.width/2-offsetX -c.measureText(`d/dx${derivative}`).width, listOfInputedGraphs[selectedFunction].getMathY(mouseX)  *-squareWidth + canvas.height/2-offsetY -20)
        c.font = "15px monospace"
        c.stroke();

    }

    // console.log(Math.abs(e.clientY - listOfInputedGraphs[selectedFunction].yCoordinate(e.clientX-canvas.width/2+offsetX)))

    if(!mouseDown) return;

    drawSelectedGraphs();


})

function drawDot(e) {
    // && e.clientX < canvas.width && e.clientX > innerWidth*0.225 && e.clientY < canvas.height && e.clientY > 0

    if(listOfInputedGraphs[selectedFunction] != undefined) { // If a graph has been drawn
        clearCanvas();
        c.beginPath();
        c.strokeStyle = "#333";
        let myY = listOfInputedGraphs[selectedFunction].yCoordinate(e.clientX+offsetX-canvas.width/2)
        let myX = e.clientX;

        if(snapToolActivated) {
            //Snap Feature =================================
            //(Snapp cursor to grid if close to whole number) 
            let mathX = parseFloat(((e.clientX-(canvas.width/2)+offsetX)/squareWidth).toFixed(2));
    
            if(mathX % 1 < 0.1 && mathX >= 0) {  //First check if math coordinate is close to integer
                mathX -= mathX % 1; //Calculate the difference
                myX = mathX *squareWidth + canvas.width/2-offsetX; //Convert from rounded math coordinate to canvas coordinate
                myY = listOfInputedGraphs[selectedFunction].yCoordinate(myX+offsetX-canvas.width/2)
            }
            if(mathX % 1 > 0.9 && mathX >= 0) { // left side positive
                mathX += 1- (mathX % 1);
                myX = mathX *squareWidth + canvas.width/2-offsetX;
                myY = listOfInputedGraphs[selectedFunction].yCoordinate(myX+offsetX-canvas.width/2)
            }
            if(mathX % 1 > -0.1 && mathX < 0) { //right side negative
                mathX += (mathX % 1) * -1;
                myX = mathX *squareWidth + canvas.width/2-offsetX;
                myY = listOfInputedGraphs[selectedFunction].yCoordinate(myX+offsetX-canvas.width/2)
            }
            if(mathX % 1 < -0.9 && mathX < 0) { //right side negative
                mathX -= 1 - (mathX % 1) * -1;
                myX = mathX *squareWidth + canvas.width/2-offsetX;
                myY = listOfInputedGraphs[selectedFunction].yCoordinate(myX+offsetX-canvas.width/2)
            }
    
            //Snapp to grid if close to whole number along x-axis
            let mathY = listOfInputedGraphs[selectedFunction].getMathY(mathX);
            
            if(mathY % 1 < 0.1 && mathY >= 0) {  //First check if math coordinate is close to integer
                mathY -= mathY % 1; 
                myY = mathY *-squareWidth + canvas.height/2-offsetY; //Convert from rounded math coordinate to canvas coordinate
    
                mathX = listOfInputedGraphs[selectedFunction].getMathX(mathY, mathX, 0.5, 0.01);
                myX = mathX * squareWidth + canvas.width/2-offsetX;
                // console.log("one" + listOfInputedGraphs[selectedFunction].getMathX(mathY, mathX, 0.5, 0.01));
            }
            if(mathY % 1 > 0.9 && mathY >= 0) { // left side positive
                mathY += 1- (mathY % 1);
                myY = mathY *-squareWidth + canvas.height/2-offsetY;
    
                mathX = listOfInputedGraphs[selectedFunction].getMathX(mathY, mathX, 0.5, 0.01);
                myX = mathX * squareWidth + canvas.width/2-offsetX;
                // console.log("two" + listOfInputedGraphs[selectedFunction].getMathX(mathY, mathX, 0.5, 0.01));
            }
            if(mathY % 1 > -0.1 && mathY < 0) { //right side negative
                mathY += (mathY % 1) * -1;
                myY = mathY *-squareWidth + canvas.height/2-offsetY;
    
                mathX = listOfInputedGraphs[selectedFunction].getMathX(mathY, mathX, 0.5, 0.01);
                myX = mathX * squareWidth + canvas.width/2-offsetX;
                // console.log("three" + listOfInputedGraphs[selectedFunction].getMathX(mathY, mathX, 0.5, 0.01));
            }
            if(mathY % 1 < -0.9 && mathY < 0) { //right side negative
                mathY -= 1 - (mathY % 1) * -1;
                myY = mathY *-squareWidth + canvas.height/2-offsetY;
    
                mathX = listOfInputedGraphs[selectedFunction].getMathX(mathY, mathX, 0.5, 0.01);
                myX = mathX * squareWidth + canvas.width/2-offsetX;
                // console.log("four" + listOfInputedGraphs[selectedFunction].getMathX(mathY, mathX, 0.5, 0.01));
            }

       
        } 

        c.arc(myX, myY, 5, 0, Math.PI * 2, false); // Draw the addjusted dot snapped to grid

        let mathematicalXCoordinate = ((e.clientX-(canvas.width/2)+offsetX)/squareWidth).toFixed(2); //Calcuate coordinates
        let mathematicalYCoordinate = -((myY-(canvas.height/2)+offsetY)/squareWidth).toFixed(2); //From canvas coordinates to math coordinates

        if(!isNaN(mathematicalXCoordinate) && !isNaN(mathematicalYCoordinate)) {
            c.fillText(`(${mathematicalXCoordinate}, ${mathematicalYCoordinate})`, e.clientX+10, myY+10); // Display coordinates
        } 

        c.stroke(); // redraw
        drawSelectedGraphs();
        drawAxis();
        drawGrid();
    } 
}

function drawSavedDots() {
    for(let i = 0; i < listOfSavedDots.length; i++) {
        listOfSavedDots[i].draw();
    }
}

canvas.addEventListener("dblclick", function(e) {
    if(listOfInputedGraphs[selectedFunction] != undefined  && Math.abs(e.clientY - listOfInputedGraphs[selectedFunction].yCoordinate(e.clientX-canvas.width/2+offsetX)) < 50) {

        let myNewDot = new Dot(e.clientX+offsetX);

        if(distanceToolActivated) {
            limitNumberOfDotsTo(2, myNewDot);

            if(listOfSavedDots.length == 1) {
                canvas.addEventListener("mousemove", updateDistance)
            }

            if(listOfSavedDots.length == 2) {
                drawSavedDots();
                let distance = distanceBetweenPoints(listOfSavedDots[0].mathX, listOfSavedDots[1].mathX, listOfInputedGraphs[selectedFunction], 0.01/performance);

                resultWindow.innerHTML = `Distance between ${listOfSavedDots[0].name} and ${listOfSavedDots[1].name} = ${distance}`;
                deactiveAllTools();
                listOfSavedDots = [];
            }
        }
        if(areaToolActivated) {
            limitNumberOfDotsTo(2, myNewDot);

            if(listOfSavedDots.length == 1) {
                canvas.addEventListener("mousemove", updateArea);
            } 
            
            if(listOfSavedDots.length == 2) {
                drawSavedDots();
                let area = areaBetweenPoints(listOfSavedDots[0].mathX, listOfSavedDots[1].mathX, listOfInputedGraphs[selectedFunction], 0.005/performance);
                resultWindow.innerHTML = `Area between ${listOfSavedDots[0].name} and ${listOfSavedDots[1].name} = ${area}`;
                deactiveAllTools();
                listOfSavedDots = [];
            }
        }
        if(volumeToolActivated) {
            limitNumberOfDotsTo(2, myNewDot);

            if(listOfSavedDots.length == 1) {
                canvas.addEventListener("mousemove", function(e) {
                    if(!volumeToolActivated) return;
                    let mouseX = parseFloat(((e.clientX-(canvas.width/2)+offsetX)/squareWidth).toFixed(decimalsUsed));

                    drawReflection(listOfSavedDots[0].mathX, mouseX, listOfInputedGraphs[selectedFunction], 0.0001/performance);        

                    let volume = volumeBetweenPoints(listOfSavedDots[0].mathX, mouseX, listOfInputedGraphs[selectedFunction], 0.0001/performance);
                    c.beginPath();
                    c.font = "18px monospace"
                    c.fillText(`volume=${volume.toFixed(decimalsUsed)}`, mouseX *squareWidth + canvas.width/2-offsetX -c.measureText(`volume=${volume.toFixed(decimalsUsed)}`).width, listOfInputedGraphs[selectedFunction].getMathY(mouseX)  *-squareWidth + canvas.height/2-offsetY -20)
                    c.font = "15px monospace"
                    c.stroke();
                })
            }

            if(listOfSavedDots.length == 2) {
                drawSavedDots();
                let volume = volumeBetweenPoints(listOfSavedDots[0].mathX, listOfSavedDots[1].mathX, listOfInputedGraphs[selectedFunction], 0.0001/performance);
                resultWindow.innerHTML = `Volume between ${listOfSavedDots[0].name} and ${listOfSavedDots[1].name} = ${volume}`;
                deactiveAllTools();
                listOfSavedDots = [];
            }
        }
        if(derivativeToolActivated) {
            limitNumberOfDotsTo(1, myNewDot);

            if(listOfSavedDots.length == 1) {
                drawSavedDots();
                let derivative = derivativeAtPoint(listOfSavedDots[0].mathX, listOfInputedGraphs[selectedFunction], 0.001/performance, true);
                resultWindow.innerHTML = ` x = ${listOfSavedDots[0].mathX} d/dx = ${derivative}`;
                deactiveAllTools();
                listOfSavedDots = [];
            } 
        }
        if(differenceToolActivated) {
            limitNumberOfDotsTo(2, myNewDot);
            
            if(listOfSavedDots.length == 1) {
                canvas.addEventListener("mousemove", function(e) {
                    if(!differenceToolActivated) return;
                    let mouseX = parseFloat(((e.clientX-(canvas.width/2)+offsetX)/squareWidth).toFixed(decimalsUsed));
                    console.log(listOfSavedDots[0].mathX, listOfSavedDots[0].mathY);
    
                    drawLineBetweenPoints(listOfSavedDots[0].mathX, listOfSavedDots[0].mathY, mouseX, listOfSavedDots[0].mathY); //Horizontal line
                    drawLineBetweenPoints(mouseX, listOfSavedDots[0].mathY, mouseX, listOfInputedGraphs[selectedFunction].getMathY(mouseX)); // Vertical line
                    drawLineBetweenPoints(listOfSavedDots[0].mathX, listOfSavedDots[0].mathY, mouseX, listOfInputedGraphs[selectedFunction].getMathY(mouseX)); // Diagonal Line

                    c.beginPath();
                    let dx = mouseX - listOfSavedDots[0].mathX;
                    let dy = listOfInputedGraphs[selectedFunction].getMathY(mouseX) -listOfSavedDots[0].mathY;
                    let dDiagonal = Math.sqrt(dx * dx + dy * dy); //Lenght of diagonal

                    let xCoordinatedx =  ((mouseX + listOfSavedDots[0].mathX)/2) *squareWidth + canvas.width/2-offsetX; //Getting the canvas coordinates for lengths
                    let xCoordinatedy =  mouseX *squareWidth + canvas.width/2-offsetX;

                    let yCoordinatedy = ((listOfSavedDots[0].mathY + listOfInputedGraphs[selectedFunction].getMathY(mouseX))/2) *-squareWidth + canvas.height/2-offsetY;
                    let yCoordinatedx = listOfSavedDots[0].mathY *-squareWidth + canvas.height/2-offsetY;



                    c.fillText(`${dx.toFixed(decimalsUsed)}`, xCoordinatedx, yCoordinatedx-10); //Horizontal difference
                    c.fillText(`${dy.toFixed(decimalsUsed)}`, xCoordinatedy-c.measureText(`${dy.toFixed(decimalsUsed)}`).width-10, yCoordinatedy); //horizontal difference
                    c.fillText(`${dDiagonal.toFixed(decimalsUsed)}`, xCoordinatedx-20, yCoordinatedy-20); //horizontal difference
                    c.fill();

        
                })
            }

            if(listOfSavedDots.length == 2) {
                drawSavedDots();
                let difference = xAndYDifferenceBetweenPoints(listOfSavedDots[0].mathX, listOfSavedDots[1].mathX, listOfInputedGraphs[selectedFunction]);
                resultWindow.innerHTML = `dx = ${difference[0].toFixed(decimalsUsed)}, dy = ${difference[1].toFixed(decimalsUsed)}, Diagonal = ${difference[2].toFixed(decimalsUsed)}`;
                deactiveAllTools();
                listOfSavedDots = [];
            }
        }
        if(surfaceAreaToolActivated) {
            limitNumberOfDotsTo(2, myNewDot);

            if(listOfSavedDots.length == 1) {
                canvas.addEventListener("mousemove", function(e) {
                    if(!surfaceAreaToolActivated) return;
                    let mouseX = parseFloat(((e.clientX-(canvas.width/2)+offsetX)/squareWidth).toFixed(decimalsUsed));

                    drawReflection(listOfSavedDots[0].mathX, mouseX, listOfInputedGraphs[selectedFunction], 0.0001/performance);

                    let surfaceArea = parseFloat((surfaceAreaBetweenPoints(listOfSavedDots[0].mathX, mouseX, listOfInputedGraphs[selectedFunction], 0.0001/performance)/(100*performance*10)).toFixed(decimalsUsed));
                    c.beginPath();
                    c.font = "18px monospace"
                    c.fillText(`surface area=${surfaceArea}`, mouseX *squareWidth + canvas.width/2-offsetX -c.measureText(`surface area=${surfaceArea}`).width, listOfInputedGraphs[selectedFunction].getMathY(mouseX)  *-squareWidth + canvas.height/2-offsetY -20)
                    c.font = "15px monospace"
                    c.stroke();
        
                })
            }

            if(listOfSavedDots.length == 2) {
                drawSavedDots();
                let area = parseFloat(surfaceAreaBetweenPoints(listOfSavedDots[0].mathX, listOfSavedDots[1].mathX, listOfInputedGraphs[selectedFunction], 0.0001/performance)/(100*performance*10)).toFixed(decimalsUsed);
                resultWindow.innerHTML = `Surface Area between ${listOfSavedDots[0].mathX} and ${listOfSavedDots[1].mathX} = ${area}`;
                deactiveAllTools();
                listOfSavedDots = [];
            }
        }
        if(limitToolActivated) {
            limitNumberOfDotsTo(1, myNewDot);

            if(listOfSavedDots.length == 1) {
                drawSavedDots();
                let myLimit = limitAtPoint(listOfSavedDots[0].mathX, listOfInputedGraphs[selectedFunction], 0.0001/performance, 0.001/performance);
                resultWindow.innerHTML = `${myLimit}`;
                deactiveAllTools();
                listOfSavedDots = [];
            }
        }
        if(continuityToolActivated) {
            limitNumberOfDotsTo(2, myNewDot);

            if(listOfSavedDots.length == 2) {
                drawSavedDots();
                let continuity = continuityBetweenPoints(listOfSavedDots[0].mathX, listOfSavedDots[1].mathX, listOfInputedGraphs[selectedFunction],0.001/performance, 0.0001/performance, 0.001/performance);
                resultWindow.innerHTML = `${continuity}`;
                deactiveAllTools();
                listOfSavedDots = [];
            }
        }
        if(rootToolActivated) {
            limitNumberOfDotsTo(2, myNewDot);

            if(listOfSavedDots.length == 2) {
                drawSavedDots();
                let roots = crossesXAxis(listOfSavedDots[0].mathX, listOfSavedDots[1].mathX, listOfInputedGraphs[selectedFunction],0.001/performance, 0.001/performance);
                resultWindow.innerHTML = "The roots are: ";
                for(let i = 0; i < roots.length; i++) {
                    resultWindow.innerHTML += `(${roots[i]})`;
                }
                deactiveAllTools();
                listOfSavedDots = [];
            }
        }
        if(turningPointsToolActivated) {
            limitNumberOfDotsTo(2, myNewDot);

            if(listOfSavedDots.length == 2) {
                drawSavedDots();
                let listOfTurningPoints = turningPoints(listOfSavedDots[0].mathX, listOfSavedDots[1].mathX, listOfInputedGraphs[selectedFunction],0.001/performance, 0.001/performance);
                resultWindow.innerHTML = "The turning points are: ";
                for(let i = 0; i < listOfTurningPoints.length; i++) {
                    resultWindow.innerHTML += `(${listOfTurningPoints[i]})`;
                }
                deactiveAllTools();
                listOfSavedDots = [];
            }
        }
    }
    
})

//Calculations using the tools and visualizing =================================================================
function updateDistance(e) {
    if(!distanceToolActivated) return;
    let mouseX = ((e.clientX-(canvas.width/2)+offsetX)/squareWidth).toFixed(decimalsUsed);
    let length = distanceBetweenPoints(listOfSavedDots[0].mathX, mouseX, listOfInputedGraphs[selectedFunction], 0.01/performance);
    c.beginPath();
    c.font = "18px monospace"
    c.fillText(`length=${length}`, mouseX *squareWidth + canvas.width/2-offsetX -c.measureText(`length=${length}`).width, listOfInputedGraphs[selectedFunction].getMathY(mouseX)  *-squareWidth + canvas.height/2-offsetY -20)
    c.font = "15px monospace"
    c.stroke();
}

function updateArea(e) {
    if(!areaToolActivated) return;
    let mouseX = ((e.clientX-(canvas.width/2)+offsetX)/squareWidth).toFixed(decimalsUsed);
    let area = areaBetweenPoints(listOfSavedDots[0].mathX, mouseX, listOfInputedGraphs[selectedFunction], 0.005/performance);
    c.beginPath();
    c.font = "18px monospace"
    c.fillText(`area=${area}`, mouseX *squareWidth + canvas.width/2-offsetX -c.measureText(`area=${area}`).width, listOfInputedGraphs[selectedFunction].getMathY(mouseX)  *-squareWidth + canvas.height/2-offsetY -20)
    c.font = "15px monospace"
    c.stroke();
}



function limitNumberOfDotsTo(limit, newDot) {
    if(listOfSavedDots.length < limit) {
        listOfSavedDots.push(newDot);
        drawSavedDots();
    } 
}

canvas.addEventListener("wheel", function(e) {
    // listOfSavedDots = [];
    drawSelectedGraphs();
    if(!transformationApplied) {
        drawDot(e);
    }
    // drawSavedDots();
})

window.addEventListener("resize", function(e) {
    // clearCanvas();
    drawSelectedGraphs();
})

document.querySelector("#evaluateButton").addEventListener("click", function(e) {
    if(document.querySelector(".inputFunction").value === "") return; //checking for no input

    try {
    let i = 0;
    document.querySelectorAll(".inputFunction").forEach((element) => {
        let newGraph;
        newGraph = new Graph((x) => x, new Formula(element.value));
        listOfInputedGraphs[i] = newGraph;
        savedFunctions[i] = element.value;
        i++;

    })
    drawSelectedGraphs();
    
    let selectedX =  document.querySelector("#single-input").value;
    document.querySelector("#answer").innerText = `= ${listOfInputedGraphs[selectedFunction].getMathY(selectedX).toFixed(decimalsUsed)}`;


    } catch (error) { //Handling invalid input
        console.log(error);
       }
   
})

let k = 1; //Giving counting id to corresponding input field
document.querySelector("#add").addEventListener("click", function() {
    let i = 0;
    document.querySelector("#inputs").innerHTML += `<input type="text" class="inputFunction" placeholder="Input" id="${k}">`
    document.querySelectorAll(".inputFunction").forEach((element) => {
        if(savedFunctions[i] != undefined) {
            element.value = savedFunctions[i];
        }
        element.addEventListener("click", function() {
            updateSelectedInput();
            element.style.backgroundColor = "#ccc";
            selectedFunction = parseInt(element.id);
            document.querySelector("#evaluate-function").innerText = `${element.value} at x =`
        })
        i++;
    })
    k++;
})


const performanceLabel = document.querySelector("#performance-value");
let liveEditingMode = false;

performanceSlider.addEventListener("change", function() {
    performanceLabel.innerText = `${performanceSlider.value}%`;
    performance = performanceSlider.value/100;
})

document.addEventListener("keydown", function(e) {
    if(liveEditingMode) return;
    switch (e.key) {

        //Mapping change in performance to keys left right
        case "ArrowRight": 
            performanceSlider.value++;
            performance = performanceSlider.value/100;
            performanceLabel.innerText = `${performanceSlider.value}%`;
            break;
        case "ArrowLeft":
            performanceSlider.value--;
            performance = performanceSlider.value/100;
            performanceLabel.innerText = `${performanceSlider.value}%`;
            break;
        case "d": 
            performanceSlider.value++;
            performance = performanceSlider.value/100;
            performanceLabel.innerText = `${performanceSlider.value}%`;
            break;
        case "a":
            performanceSlider.value--;
            performance = performanceSlider.value/100;
            performanceLabel.innerText = `${performanceSlider.value}%`;
            break;

        //Mapping change in decimals used to keys up down
        case "ArrowUp": 
            decimalInput.value++;
            decimalsUsed = decimalInput.value;
            break;
        case "ArrowDown":
            decimalInput.value--;
            decimalsUsed = decimalInput.value;
            break;
        case "w": 
            decimalInput.value++;
            decimalsUsed = decimalInput.value;
            break;
        case "s":
            decimalInput.value--;
            decimalsUsed = decimalInput.value;
            break;
        }

        //Lower and upper limit
        if(decimalInput.value < 0) {
            decimalInput.value = 0;
            decimalsUsed = decimalInput.value;
        }
        if(decimalInput.value > 15) {
            decimalInput.value = 15;
            decimalsUsed = decimalInput.value;
        }

})

decimalInput.addEventListener("change", function(e) {
    decimalsUsed = decimalInput.value;
})


function updateSelectedInput() { //Setting all input fields back to white
    document.querySelectorAll(".inputFunction").forEach(input => {
        input.style.backgroundColor = "#FFF";
    })
}

const firstFunction = document.querySelector(".inputFunction");
firstFunction.addEventListener("change", function() {
    updateSelectedInput();
    firstFunction.style.backgroundColor = "#ccc";
    selectedFunction = parseInt(firstFunction.id);
    document.querySelector("#evaluate-function").innerText = `${firstFunction.value} at x =`
})

//Live Code Editor =================================================================
let inputedFunction;
export let diffFunction;
const js = document.getElementById("js");
const codeSpace = document.getElementById("code")

//Not to fiddle with values mapped to key while inputting function
js.addEventListener("click", function() {
    liveEditingMode = true;
})
document.querySelector("#menu").addEventListener("click", function() {
    liveEditingMode = false;
})
canvas.addEventListener("click", function() {
    liveEditingMode = false;
})

function compile() {  
    codeSpace.contentWindow.eval(js.value);
    inputedFunction = codeSpace.contentWindow.myGraph;
    document.body.onkeyup = function() {
        codeSpace.contentWindow.eval(js.value);
        inputedFunction = codeSpace.contentWindow.myGraph;
        diffFunction = codeSpace.contentWindow.diffEquation;
      };
    }

compile();
function logFunction() {
  if(typeof inputedFunction === "function") {
    let userGraph = new Graph((x) => inputedFunction(x));
    userGraph.drawGraph();
    listOfGraphs.push(userGraph);
    drawSelectedGraphs();
  }
}
logFunction();


//Taking input for matrix to apply linear transformations(scale, rotate, translate, skew)
document.querySelectorAll(".matrix-input").forEach(matrixInput => {
    matrixInput.addEventListener("change", function() {
        switch(matrixInput.id) {
            case "input-0": 
                transformationMatrix[0] = parseInt(matrixInput.value);
                break;
            case "input-1": 
                transformationMatrix[1] = parseInt(matrixInput.value);
                break;
            case "input-2": 
                transformationMatrix[2] = parseInt(matrixInput.value);
                break;
            case "input-3": 
                transformationMatrix[3] = parseInt(matrixInput.value);
                break;
        }
        transformationApplied = true;
        clearCanvas();
        drawAxis();
        drawGrid();
        drawSelectedGraphs();
    })
})

document.querySelector("#reset").addEventListener("click", function() {
    transformationMatrix = [1, 0, 0, 1];
    transformationApplied = false;
    document.querySelector("#input-0").value = 1;
    document.querySelector("#input-1").value = 0;
    document.querySelector("#input-2").value = 0;
    document.querySelector("#input-3").value = 1;

    clearCanvas();
    drawAxis();
    drawGrid();
    drawSelectedGraphs();
})


//Numerical Analysis Tester =================================================
// function update() {
//     requestAnimationFrame(update);
// }
// update();
// let pointA = {
//     mathX: 1
// }
// let pointB = {
//     mathX: 10
// }
// let formula = {
//     getMathY: function(x) {
//         return x;
//     }
// }
// let test1 = distanceBetweenPoints(pointA, pointB, formula, 0.1);
// console.log(test1);


//Testing different Functions
const sineCurve = new Graph((x) => Math.sin(x));
const tanCurve = new Graph((x) => Math.tan(x));
const naturalLog = new Graph((x) => Math.log(x));
const arcSine = new Graph((x) => Math.asin(x));
const squareRoot = new Graph((x) => Math.sqrt(x));
const abs = new Graph((x) => Math.abs(x));
const line = new Graph((x) => x);
const polynomial = new Graph((x) => 2*Math.pow(x, 2) + x - 2);
const exponential = new Graph((x) => Math.exp(x));
const constant = new Graph((x) => Math.PI);
const rational = new Graph((x) => Math.pow(x, 2) +3/x);
const hyperbolic = new Graph((x) => Math.sinh(x));
const inverseHyperbolic = new Graph((x) => Math.acosh(x));
const stairCase = new Graph((x) => Math.ceil(x));
// const modulus = new Graph((x) => x*x%x);
const weirdShit = new Graph((x) => x<0?x*x*x%x:0);
const random = new Graph((x) => Math.random() * x);

//I just played around but it looks cool as heck
function theSebastianDFunction(x) {
    return (x*x%x+Math.ceil(x) * Math.sin(x) - Math.abs(x) + Math.sign(x) * Math.cbrt(x)%x -Math.tanh(x/10)*Math.E *x + Math.pow(Math.PI, Math.PI) +10 -Math.random(x) + 1/(Math.pow(x, 5)))/10 -4;
}


function weierstrassFunction(x) {
    let sum = 0;
    let a = 0.5;
    let b = 7;
    for(let i = 0; i < 10; i++) {
        sum += (Math.pow(a, i) * Math.cos((Math.pow(b, i) * Math.PI * x)));
    }
    return sum;
}

function modulus() {
    return Math.pow(x, 2) % x
}

function volterrasFunction(x) {
    return Math.sin(1/x)*Math.pow(x,2)
}


function riemannZetaFunction(x) {
    let sum = 0;
    for(let i = 0; i < 10; i++) {
        sum += 1/(Math.pow(i, x));
    }
    return sum;
}

function getFactorial(x) { //iterative version seemed to work better to graph
    let product = x;
    let i = x-1;
    while (i > 1) {
        product *= i;
        i--;
    }
    return product;
}

function papaLambertsWFunction(x) { 
    if(Math.abs(x) > 5) return;
    let sum = 0;
    for(let i = 1; i < 6; i++) {
        sum += ((Math.pow((-i), i-1))/getFactorial(x) * Math.pow(x, i))
    }
    return sum;
}

function myGraph(x) { //one of my personal favourites
    return theSebastianDFunction(x) % weisterassFunction(x)  * modulus(x)   ;
}

function hybridCombo(x) {
    if(x < 2) {
    return Math.cbrt(x);
    }

    return hybridCombo(x-2) -Math.log(x);
}


    





// listOfGraphs.push(inputedFunction);
// drawSelectedGraphs();

// random.drawGraph();
// exponential.drawGraph()
// stairCase.drawTransformedGrsaph();
// inverseHyperbolic.drawGraph();
// hyperbolic.drawGraph();
// weirdShit.drawGraph();
// modulus.drawGraph();
// rational.drawGraph();
// constant.drawGraph();
// polynomial.drawGraph();
// line.drawGraph();
// abs.drawGraph();
// squareRoot.drawGraph();
// arcSine.drawGraph();
// naturalLog.drawGraph();
// new Graph((x) => x).drawGraph();
// sineCurve.drawGraph();
// tanCurve.drawGraph();