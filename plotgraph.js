import {c, canvas, squareWidth, offsetX, offsetY, mouseDown} from "./canvas.js";
import Formula from "./parser.js";
import {clearCanvas, drawGrid, drawAxis} from "./canvas.js";
import {distanceBetweenPoints, areaBetweenPoints, derivativeAtPoint, volumeBetweenPoints, xAndYDifferenceBetweenPoints, surfaceAreaBetweenPoints, limitAtPoint, continuityBetweenPoints, crossesXAxis, turningPoints} from "./numerical-analysis.js";
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
        c.fillStyle = "#333";

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
        derivativeAtPoint(mouseX, listOfInputedGraphs[0], 0.1);
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
        c.arc(e.clientX, myY, 5, 0, Math.PI * 2, false); // Draw a circle at graph

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
                    distanceBetweenPoints(listOfSavedDots[0].mathX, mouseX, listOfInputedGraphs[0], 1);
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
                areaBetweenPoints(listOfSavedDots[0].mathX, mouseX, listOfInputedGraphs[0], 0.1);
            }

            if(listOfSavedDots.length == 1) {
                canvas.addEventListener("mousemove", rectangles);
            } 
            
            if(listOfSavedDots.length == 2) {
                drawSavedDots();
                let area = areaBetweenPoints(listOfSavedDots[0].mathX, listOfSavedDots[1].mathX, listOfInputedGraphs[0], 0.1);
                resultWindow.innerHTML = `Area between ${listOfSavedDots[0].name} and ${listOfSavedDots[1].name} = ${area}`;
                deactiveAllTools();
                listOfSavedDots = [];
            }
        }
        if(volumeToolActivated) {
            limitNumberOfDotsTo(2, myNewDot);

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
                let derivative = derivativeAtPoint(listOfSavedDots[0].mathX, listOfInputedGraphs[0], 0.01);
                resultWindow.innerHTML = ` x = ${listOfSavedDots[0].mathX} d/dx = ${derivative}`;
                deactiveAllTools();
                listOfSavedDots = [];
            } 
        }
        if(differenceToolActivated) {
            limitNumberOfDotsTo(2, myNewDot);

            if(listOfSavedDots.length == 2) {
                drawSavedDots();
                let difference = xAndYDifferenceBetweenPoints(listOfSavedDots[0].mathX, listOfSavedDots[1].mathX, listOfInputedGraphs[0]);
                resultWindow.innerHTML = `dx = ${difference[0]}, dy = ${difference[1]}`;
                deactiveAllTools();
                listOfSavedDots = [];
            }
        }
        if(surfaceAreaToolActivated) {
            limitNumberOfDotsTo(2, myNewDot);

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