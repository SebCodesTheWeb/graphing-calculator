import {c, canvas, squareWidth, offsetX, offsetY, mouseDown} from "./canvas.js";
import Formula from "./parser.js";
import {clearCanvas, drawGrid, drawAxis} from "./canvas.js";
import {distanceBetweenPoints, areaBetweenPoints, derivativeAtPoint, volumeBetweenPoints, xAndYDifferenceBetweenPoints, surfaceAreaBetweenPoints, limitAtPoint, continuityBetweenPoints, crossesXAxis, turningPoints, drawReflection, drawLineBetweenPoints} from "./numerical-analysis.js";
import {differenceToolActivated, distanceToolActivated, areaToolActivated, derivativeToolActivated, volumeToolActivated, surfaceAreaToolActivated, limitToolActivated, anyToolActivated, deactiveAllTools, continuityToolActivated, rootToolActivated, turningPointsToolActivated} from "./tools.js";

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

const resultWindow = document.querySelector("#info");


function randomColor() {
    let color = Math.ceil(Math.random() * colors.length);
    return colors[color];
}

function drawSelectedGraphs() {
    for(let i = 0; i < listOfGraphs.length; i++) {
        listOfGraphs[i].drawGraph();
    } 
    for(let i = 0; i < listOfInputedGraphs.length; i++) {
        listOfInputedGraphs[i].drawInputedGraph();
    }
}

class Graph {
    constructor (outputFunction, formula) {
        this.color = randomColor();
        this.outputFunction = outputFunction; //Callback function for y -coordinate
        this.centerX = canvas.width / 2;
        this.centerY = canvas.height / 2;
        this.lineWidth = 2;
        this.formula = formula;
    }

    drawGraph() {
        c.beginPath();
        c.lineWidth = this.lineWidth;
        c.strokeStyle = this.color;
        c.moveTo(0, this.centerY)

        //Setting offset to 0,0 in beginning
        let addjustedoffsetX;
        let addjustedoffsetY;
        if(offsetX && offsetY == squareWidth) {
            addjustedoffsetX = 0;
            addjustedoffsetY = 0;
        } else {
            addjustedoffsetX = offsetX;
            addjustedoffsetY = offsetY;
        }

        for(let i = -canvas.width/2+addjustedoffsetX; i < canvas.width/2+addjustedoffsetX; i++) {
            let rescaledYCoordinate = this.outputFunction(i/squareWidth)*squareWidth;
            let convertedYCoordinate = canvas.height- rescaledYCoordinate; //y coordinate between canvas

            if(!isNaN(convertedYCoordinate)) { // Only draw if point is defined
                c.lineTo(i+this.centerX-addjustedoffsetX, convertedYCoordinate-this.centerY-addjustedoffsetY); //Generating line between coordinates
            } else {
                c.stroke();
                c.beginPath();
            }
        }
        c.stroke();
    }

    drawInputedGraph() {
        c.beginPath();
        c.lineWidth = this.lineWidth;
        c.strokeStyle = this.color;
        c.moveTo(0, this.centerY)

        //Setting offset to 0,0 in beginning
        let addjustedoffsetX;
        let addjustedoffsetY;
        if(offsetX && offsetY == squareWidth) {
            addjustedoffsetX = 0;
            addjustedoffsetY = 0;
        } else {
            addjustedoffsetX = offsetX;
            addjustedoffsetY = offsetY;
        }
        addjustedoffsetX += windowOffsetX/2;
        addjustedoffsetY -= windowOffsetY/2;

        for(let i = -canvas.width/2+addjustedoffsetX; i < canvas.width/2+addjustedoffsetX-windowOffsetX/2; i++) {
            let rescaledYCoordinate = this.formula.evaluate({x: i/squareWidth})*squareWidth;
            let convertedYCoordinate = canvas.height- rescaledYCoordinate; //y coordinate between canvas

            if(!isNaN(convertedYCoordinate)) { // Only draw if point is defined
                c.lineTo(i+this.centerX-addjustedoffsetX, convertedYCoordinate-this.centerY-addjustedoffsetY); //Generating line between coordinates
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
        let guessIndex = 0;
        let bestGuess = guessX;
        for(let i = guessX-interval; i < guessX+interval; i+= 0.001) {
            if(Math.abs(this.formula.evaluate({x: i}) - mathY) < epsilon) {
                listOfGuesses.push([i, this.formula.evaluate({x: i})-mathY]);
            }
        }
        for(let i = 0; i < listOfGuesses.length; i++) {
            if(listOfGuesses[i][1] < this.formula.evaluate({x: bestGuess})-mathY) {
                bestGuess = listOfGuesses[i][1];
                guessIndex = i;
            }
        }

        // console.log(mathY);

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
        let myY = listOfInputedGraphs[0].yCoordinate(this.x-canvas.width/2)
        this.mathY = -((myY-(canvas.height/2))/squareWidth).toFixed(2); //From canvas coordinates to math coordinates
    }

    draw() {
        c.beginPath();
        c.fillStyle = `#333`;
        let myY = listOfInputedGraphs[0].yCoordinate(this.x-canvas.width/2)
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
    if(anyToolActivated) {
        drawDot(e);
        drawSavedDots();
    }

    if(derivativeToolActivated) {
        let mouseX = parseFloat(((e.clientX-(canvas.width/2)+offsetX)/squareWidth).toFixed(2));
        let derivative = derivativeAtPoint(mouseX, listOfInputedGraphs[0], 0.1, true);
        c.beginPath();
        c.font = "18px monospace"
        c.fillText(`d/dx=${derivative}`, mouseX *squareWidth + canvas.width/2-offsetX -c.measureText(`d/dx${derivative}`).width, listOfInputedGraphs[0].getMathY(mouseX)  *-squareWidth + canvas.height/2-offsetY -20)
        c.font = "15px monospace"
        c.stroke();

    }

    // console.log(Math.abs(e.clientY - listOfInputedGraphs[0].yCoordinate(e.clientX-canvas.width/2+offsetX)))

    if(!mouseDown) return;

    drawSelectedGraphs();


})

function drawDot(e) {
    // && e.clientX < canvas.width && e.clientX > innerWidth*0.225 && e.clientY < canvas.height && e.clientY > 0

    if(listOfInputedGraphs[0] != undefined) { // If a graph has been drawn
        clearCanvas();
        c.beginPath();
        c.strokeStyle = "#333";
        let myY = listOfInputedGraphs[0].yCoordinate(e.clientX+offsetX-canvas.width/2)
        let myX = e.clientX;

        //Snap Feature =================================
        //Snapp to grid if close to whole number along x-axis
        let mathX = parseFloat(((e.clientX-(canvas.width/2)+offsetX)/squareWidth).toFixed(2));

        if(mathX % 1 < 0.1 && mathX >= 0) {  //First check if math coordinate is close to integer
            mathX -= mathX % 1; 
            myX = mathX *squareWidth + canvas.width/2-offsetX; //Convert from rounded math coordinate to canvas coordinate
            myY = listOfInputedGraphs[0].yCoordinate(myX+offsetX-canvas.width/2)
        }
        if(mathX % 1 > 0.9 && mathX >= 0) { // left side positive
            mathX += 1- (mathX % 1);
            myX = mathX *squareWidth + canvas.width/2-offsetX;
            myY = listOfInputedGraphs[0].yCoordinate(myX+offsetX-canvas.width/2)
        }
        if(mathX % 1 > -0.1 && mathX < 0) { //right side negative
            mathX += (mathX % 1) * -1;
            myX = mathX *squareWidth + canvas.width/2-offsetX;
            myY = listOfInputedGraphs[0].yCoordinate(myX+offsetX-canvas.width/2)
        }
        if(mathX % 1 < -0.9 && mathX < 0) { //right side negative
            mathX -= 1 - (mathX % 1) * -1;
            myX = mathX *squareWidth + canvas.width/2-offsetX;
            myY = listOfInputedGraphs[0].yCoordinate(myX+offsetX-canvas.width/2)
        }
        //Snapp to grid if close to whole number along x-axis
        let mathY = listOfInputedGraphs[0].getMathY(mathX);
        
        if(mathY % 1 < 0.1 && mathY >= 0) {  //First check if math coordinate is close to integer
            mathY -= mathY % 1; 
            myY = mathY *-squareWidth + canvas.height/2-offsetY; //Convert from rounded math coordinate to canvas coordinate
            console.log("hej" + listOfInputedGraphs[0].getMathX(myY, mathX, 1, 0.05));
            // myX = listOfInputedGraphs[0].getMathX(myY, mathX, 1, 0.05) *squareWidth + canvas.width/2-offsetX;;
            // myX = listOfInputedGraphs[0].yCoordinate(myX+offsetX-canvas.width/2)
        }
        if(mathY % 1 > 0.9 && mathY >= 0) { // left side positive
            mathY += 1- (mathY % 1);
            myY = mathY *-squareWidth + canvas.height/2-offsetY;
            console.log("hej" + listOfInputedGraphs[0].getMathX(myY, mathX, 1, 0.05));
            // myX = listOfInputedGraphs[0].getMathX(myY, mathX, 1, 0.05) *squareWidth + canvas.width/2-offsetX;;
            // myY = listOfInputedGraphs[0].yCoordinate(myX+offsetX-canvas.width/2)
        }
        if(mathY % 1 > -0.1 && mathY < 0) { //right side negative
            mathY += (mathY % 1) * -1;
            myY = mathY *-squareWidth + canvas.height/2-offsetY;
            console.log("hej" + listOfInputedGraphs[0].getMathX(myY, mathX, 1, 0.05));
            // myX = listOfInputedGraphs[0].getMathX(myY, mathX, 1, 0.05) *squareWidth + canvas.width/2-offsetX;;
            // myY = listOfInputedGraphs[0].yCoordinate(myX+offsetX-canvas.width/2)
        }
        if(mathY % 1 < -0.9 && mathY < 0) { //right side negative
            mathY -= 1 - (mathY % 1) * -1;
            myY = mathY *-squareWidth + canvas.height/2-offsetY;
            console.log("hej" + listOfInputedGraphs[0].getMathX(myY, mathX, 1, 0.05));
            // myX = listOfInputedGraphs[0].getMathX(myY, mathX, 1, 0.05) *squareWidth + canvas.width/2-offsetX;;
            // myY = listOfInputedGraphs[0].yCoordinate(myX+offsetX-canvas.width/2)
        }
        
        // console.log(mathY, myX);

        c.arc(myX, myY, 5, 0, Math.PI * 2, false); // Draw a circle at graph

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
    if(listOfInputedGraphs[0] != undefined  && Math.abs(e.clientY - listOfInputedGraphs[0].yCoordinate(e.clientX-canvas.width/2+offsetX)) < 50) {

        let myNewDot = new Dot(e.clientX+offsetX);

        if(distanceToolActivated) {
            limitNumberOfDotsTo(2, myNewDot);

            if(listOfSavedDots.length == 1) {
                canvas.addEventListener("mousemove", function(e) {
                    if(!distanceToolActivated) return;
                    let mouseX = ((e.clientX-(canvas.width/2)+offsetX)/squareWidth).toFixed(2);
                    let length = distanceBetweenPoints(listOfSavedDots[0].mathX, mouseX, listOfInputedGraphs[0], 0.1);
                    c.beginPath();
                    c.font = "18px monospace"
                    c.fillText(`length=${length}`, mouseX *squareWidth + canvas.width/2-offsetX -c.measureText(`length=${length}`).width, listOfInputedGraphs[0].getMathY(mouseX)  *-squareWidth + canvas.height/2-offsetY -20)
                    c.font = "15px monospace"
                    c.stroke();
                })
            }

            if(listOfSavedDots.length == 2) {
                drawSavedDots();
                let distance = distanceBetweenPoints(listOfSavedDots[0].mathX, listOfSavedDots[1].mathX, listOfInputedGraphs[0], 0.1);

                resultWindow.innerHTML = `Distance between ${listOfSavedDots[0].name} and ${listOfSavedDots[1].name} = ${distance}`;
                deactiveAllTools();
                listOfSavedDots = [];
            }
        }
        if(areaToolActivated) {
            limitNumberOfDotsTo(2, myNewDot);

            let rectangles = function(e) {
                if(!areaToolActivated) return;
                let mouseX = ((e.clientX-(canvas.width/2)+offsetX)/squareWidth).toFixed(2);
                let area = areaBetweenPoints(listOfSavedDots[0].mathX, mouseX, listOfInputedGraphs[0], 0.05);
                c.beginPath();
                c.font = "18px monospace"
                c.fillText(`area=${area}`, mouseX *squareWidth + canvas.width/2-offsetX -c.measureText(`area=${area}`).width, listOfInputedGraphs[0].getMathY(mouseX)  *-squareWidth + canvas.height/2-offsetY -20)
                c.font = "15px monospace"
                c.stroke();
            }

            if(listOfSavedDots.length == 1) {
                canvas.addEventListener("mousemove", rectangles);
            } 
            
            if(listOfSavedDots.length == 2) {
                drawSavedDots();
                let area = areaBetweenPoints(listOfSavedDots[0].mathX, listOfSavedDots[1].mathX, listOfInputedGraphs[0], 0.001);
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
                    let mouseX = parseFloat(((e.clientX-(canvas.width/2)+offsetX)/squareWidth).toFixed(2));

                    drawReflection(listOfSavedDots[0].mathX, mouseX, listOfInputedGraphs[0], 0.01);        

                    let volume = volumeBetweenPoints(listOfSavedDots[0].mathX, mouseX, listOfInputedGraphs[0], 0.01);
                    c.beginPath();
                    c.font = "18px monospace"
                    c.fillText(`volume=${volume.toFixed(2)}`, mouseX *squareWidth + canvas.width/2-offsetX -c.measureText(`volume=${volume.toFixed(2)}`).width, listOfInputedGraphs[0].getMathY(mouseX)  *-squareWidth + canvas.height/2-offsetY -20)
                    c.font = "15px monospace"
                    c.stroke();
                })
            }

            if(listOfSavedDots.length == 2) {
                drawSavedDots();
                let volume = volumeBetweenPoints(listOfSavedDots[0].mathX, listOfSavedDots[1].mathX, listOfInputedGraphs[0], 0.1);
                resultWindow.innerHTML = `Volume between ${listOfSavedDots[0].name} and ${listOfSavedDots[1].name} = ${volume}`;
                deactiveAllTools();
                listOfSavedDots = [];
            }
        }
        if(derivativeToolActivated) {
            limitNumberOfDotsTo(1, myNewDot);

            if(listOfSavedDots.length == 1) {
                drawSavedDots();
                let derivative = derivativeAtPoint(listOfSavedDots[0].mathX, listOfInputedGraphs[0], 0.01, true);
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
                    let mouseX = parseFloat(((e.clientX-(canvas.width/2)+offsetX)/squareWidth).toFixed(2));
    
                    drawLineBetweenPoints(listOfSavedDots[0].mathX, listOfSavedDots[0].mathY, mouseX, listOfSavedDots[0].mathY); //Horizontal line
                    drawLineBetweenPoints(mouseX, listOfSavedDots[0].mathY, mouseX, listOfInputedGraphs[0].getMathY(mouseX)); // Vertical line
                    drawLineBetweenPoints(listOfSavedDots[0].mathX, listOfSavedDots[0].mathY, mouseX, listOfInputedGraphs[0].getMathY(mouseX)); // Diagonal Line

                    c.beginPath();
                    let dx = mouseX - listOfSavedDots[0].mathX;
                    let dy = listOfInputedGraphs[0].getMathY(mouseX) -listOfSavedDots[0].mathY;
                    let dDiagonal = Math.sqrt(dx * dx + dy * dy); //Lenght of diagonal

                    let xCoordinatedx =  ((mouseX + listOfSavedDots[0].mathX)/2) *squareWidth + canvas.width/2-offsetX; //Getting the canvas coordinates for lengths
                    let xCoordinatedy =  mouseX *squareWidth + canvas.width/2-offsetX;

                    let yCoordinatedy = ((listOfSavedDots[0].mathY + listOfInputedGraphs[0].getMathY(mouseX))/2) *-squareWidth + canvas.height/2-offsetY;
                    let yCoordinatedx = listOfSavedDots[0].mathY *-squareWidth + canvas.height/2-offsetY;



                    c.fillText(`${dx.toFixed(2)}`, xCoordinatedx, yCoordinatedx-10); //Horizontal difference
                    c.fillText(`${dy.toFixed(2)}`, xCoordinatedy-c.measureText(`${dy.toFixed(2)}`).width-10, yCoordinatedy); //horizontal difference
                    c.fillText(`${dDiagonal.toFixed(2)}`, xCoordinatedx-20, yCoordinatedy-20); //horizontal difference
                    c.fill();

        
                })
            }

            if(listOfSavedDots.length == 2) {
                drawSavedDots();
                let difference = xAndYDifferenceBetweenPoints(listOfSavedDots[0].mathX, listOfSavedDots[1].mathX, listOfInputedGraphs[0]);
                resultWindow.innerHTML = `dx = ${difference[0].toFixed(2)}, dy = ${difference[1].toFixed(2)}, Diagonal = ${difference[2].toFixed(2)}`;
                deactiveAllTools();
                listOfSavedDots = [];
            }
        }
        if(surfaceAreaToolActivated) {
            limitNumberOfDotsTo(2, myNewDot);

            if(listOfSavedDots.length == 1) {
                canvas.addEventListener("mousemove", function(e) {
                    if(!surfaceAreaToolActivated) return;
                    let mouseX = parseFloat(((e.clientX-(canvas.width/2)+offsetX)/squareWidth).toFixed(2));

                    drawReflection(listOfSavedDots[0].mathX, mouseX, listOfInputedGraphs[0], 0.01);

                    let surfaceArea = parseFloat(surfaceAreaBetweenPoints(listOfSavedDots[0].mathX, mouseX, listOfInputedGraphs[0], 0.01)/10).toFixed(2);
                    c.beginPath();
                    c.font = "18px monospace"
                    c.fillText(`surface area=${surfaceArea}`, mouseX *squareWidth + canvas.width/2-offsetX -c.measureText(`surface area=${surfaceArea}`).width, listOfInputedGraphs[0].getMathY(mouseX)  *-squareWidth + canvas.height/2-offsetY -20)
                    c.font = "15px monospace"
                    c.stroke();
        
                })
            }

            if(listOfSavedDots.length == 2) {
                drawSavedDots();
                let area = surfaceAreaBetweenPoints(listOfSavedDots[0].mathX, listOfSavedDots[1].mathX, listOfInputedGraphs[0], 0.1);
                resultWindow.innerHTML = `Surface Area between ${listOfSavedDots[0].mathX} and ${listOfSavedDots[1].mathX} = ${area}`;
                deactiveAllTools();
                listOfSavedDots = [];
            }
        }
        if(limitToolActivated) {
            limitNumberOfDotsTo(1, myNewDot);

            if(listOfSavedDots.length == 1) {
                drawSavedDots();
                let myLimit = limitAtPoint(listOfSavedDots[0].mathX, listOfInputedGraphs[0], 0.001, 0.01);
                resultWindow.innerHTML = `${myLimit}`;
                deactiveAllTools();
                listOfSavedDots = [];
            }
        }
        if(continuityToolActivated) {
            limitNumberOfDotsTo(2, myNewDot);

            if(listOfSavedDots.length == 2) {
                drawSavedDots();
                let continuity = continuityBetweenPoints(listOfSavedDots[0].mathX, listOfSavedDots[1].mathX, listOfInputedGraphs[0],0.01, 0.001, 0.01);
                resultWindow.innerHTML = `${continuity}`;
                deactiveAllTools();
                listOfSavedDots = [];
            }
        }
        if(rootToolActivated) {
            limitNumberOfDotsTo(2, myNewDot);

            if(listOfSavedDots.length == 2) {
                drawSavedDots();
                let roots = crossesXAxis(listOfSavedDots[0].mathX, listOfSavedDots[1].mathX, listOfInputedGraphs[0],0.1, 0.1);
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
                let listOfTurningPoints = turningPoints(listOfSavedDots[0].mathX, listOfSavedDots[1].mathX, listOfInputedGraphs[0],0.1, 0.1);
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

function limitNumberOfDotsTo(limit, newDot) {
    if(listOfSavedDots.length < limit) {
        listOfSavedDots.push(newDot);
        drawSavedDots();
    } 
}

canvas.addEventListener("wheel", function(e) {
    listOfSavedDots = [];
    drawSelectedGraphs();
    drawDot(e);
})

window.addEventListener("resize", function(e) {
    // clearCanvas();
    drawSelectedGraphs();
})

document.querySelector("#evaluateButton").addEventListener("click", function(e) {
    let i = 0;
    document.querySelectorAll(".inputFunction").forEach((element) => {
        let newGraph = new Graph((x) => x, new Formula(element.value));
        listOfInputedGraphs[i] = newGraph;
        savedFunctions[i] = element.value;
        i++;
    })
    drawSelectedGraphs();
})


document.querySelector("#add").addEventListener("click", function() {
    document.querySelector("#inputs").innerHTML += `<input type="text" class="inputFunction" placeholder="Input">`
    let i = 0;
    document.querySelectorAll(".inputFunction").forEach((element) => {
        if(savedFunctions[i] != undefined) {
            element.value = savedFunctions[i];
        }
        i++;
    })
})

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
const modulus = new Graph((x) => x*x%x);
const weirdShit = new Graph((x) => x<0?x*x*x%x:0);
const random = new Graph((x) => Math.random() * x);
const riemannZetaFunction = function(x) {
    let pi = Math.PI;
      if (x === 0) {
          return -0.5;
      } else if (x === 1) {
          return 0;
      } else if (x === 2) {
          return pi * pi / 6;
      } else if (x === 4) {
          return pi * pi * pi * pi / 90;
      } else if (x < 1) {
          return 0;
      }
      var sum = 4.4 * Math.pow(x, -5.1);
      for (var npw = 1; npw < 10; npw++) {
          sum += Math.pow(npw, -x);
      }
      return sum;
  };
const riemannZeta = new Graph(riemannZetaFunction);

// listOfGraphs.push(weirdShit);
// drawSelectedGraphs();

// random.drawGraph();
// exponential.drawGraph()
// stairCase.drawGraph();
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