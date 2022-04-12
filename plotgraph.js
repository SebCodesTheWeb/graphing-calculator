import {c, canvas, squareWidth, offsetX, offsetY, mouseDown, rescale} from "./canvas.js";
import Formula from "./parser.js";
import {clearCanvas, drawGrid, drawAxis} from "./canvas.js";
import {distanceBetweenPoints, areaBetweenPoints, derivativeAtPoint, volumeBetweenPoints, xAndYDifferenceBetweenPoints} from "./numerical-analysis.js";

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

let distanceToolActivated = false;
let areaToolActivated = false;
let derivativeToolActivated = false;
let volumeToolActivated = false;
let differenceToolActivated = false;

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
        this.mathX = ((this.x-(canvas.width/2))/squareWidth).toFixed(2); //Calcuate coordinates
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
    if(distanceToolActivated || areaToolActivated || derivativeToolActivated || volumeToolActivated || differenceToolActivated) {
        drawDot(e);
        drawSavedDots();
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
        if(distanceToolActivated) {
            let myNewDot = new Dot(e.clientX+offsetX);
            if(listOfSavedDots.length < 2) {
                listOfSavedDots.push(myNewDot);
                drawSavedDots();
            } 
            if(listOfSavedDots.length == 2) {
                drawSavedDots();
                let distance = distanceBetweenPoints(listOfSavedDots[0].mathX, listOfSavedDots[1].mathX, listOfInputedGraphs[0], 0.1);

                document.querySelector("#info").innerHTML += `Distance between ${listOfSavedDots[0].name} and ${listOfSavedDots[1].name} = ${distance}`;
                distanceToolActivated = false;
                listOfSavedDots = [];
            }
        }

        if(areaToolActivated) {
            let myNewDot = new Dot(e.clientX+offsetX);

            if(listOfSavedDots.length < 2) {
                listOfSavedDots.push(myNewDot);
                drawSavedDots();
            } 

            if(listOfSavedDots.length == 2) {
                drawSavedDots();
                let area = areaBetweenPoints(listOfSavedDots[0].mathX, listOfSavedDots[1].mathX, listOfInputedGraphs[0], 0.1);

                document.querySelector("#info").innerHTML += `Area between ${listOfSavedDots[0].name} and ${listOfSavedDots[1].name} = ${area}`;
                areaToolActivated = false;
                listOfSavedDots = [];
            }
        }
        if(volumeToolActivated) {
            let myNewDot = new Dot(e.clientX+offsetX);

            if(listOfSavedDots.length < 2) {
                listOfSavedDots.push(myNewDot);
                drawSavedDots();
            } 

            if(listOfSavedDots.length == 2) {
                drawSavedDots();
                let volume = volumeBetweenPoints(listOfSavedDots[0].mathX, listOfSavedDots[1].mathX, listOfInputedGraphs[0], 0.1);

                document.querySelector("#info").innerHTML += `Volume between ${listOfSavedDots[0].name} and ${listOfSavedDots[1].name} = ${volume}`;
                volumeToolActivated = false;
                listOfSavedDots = [];
            }
        }
        if(derivativeToolActivated) {
            let myNewDot = new Dot(e.clientX+offsetX);
    
            if(listOfSavedDots.length < 1) {
                listOfSavedDots.push(myNewDot);
                drawSavedDots();
            } 
    
            if(listOfSavedDots.length == 1) {
                drawSavedDots();
                let derivative = derivativeAtPoint(listOfSavedDots[0].mathX, listOfInputedGraphs[0], 0.1);
    
                document.querySelector("#info").innerHTML += ` x = ${listOfSavedDots[0].mathX} d/dx = ${derivative}`;
                derivativeToolActivated = false;
                listOfSavedDots = [];
            }
            
        }
        if(differenceToolActivated) {
            let myNewDot = new Dot(e.clientX+offsetX);
    
            if(listOfSavedDots.length < 2) {
                listOfSavedDots.push(myNewDot);
                drawSavedDots();
            } 
    
            if(listOfSavedDots.length == 2) {
                drawSavedDots();
                let difference = xAndYDifferenceBetweenPoints(listOfSavedDots[0].mathX, listOfSavedDots[1].mathX, listOfInputedGraphs[0]);
    
                document.querySelector("#info").innerHTML += `dx = ${difference[0]}, dy = ${difference[1]}`;
                differenceToolActivated = false;
                listOfSavedDots = [];
            }
            
        }
    }
})

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

document.querySelector("#distance").addEventListener("click", function(e) {
    if(!distanceToolActivated) {
        distanceToolActivated = true;
        areaToolActivated = false;
        derivativeToolActivated = false;
        volumeToolActivated = false;
        differenceToolActivated = false;
    } else {
        distanceToolActivated = false;
    }
})
document.querySelector("#area").addEventListener("click", function(e) {
    if(!areaToolActivated) {
        areaToolActivated = true;
        distanceToolActivated = false;
        derivativeToolActivated = false;
        volumeToolActivated = false;
        differenceToolActivated = false;
    } else {
        areaToolActivated = false;
    }
})
document.querySelector("#derivative").addEventListener("click", function(e) {
    if(!derivativeToolActivated) {
        derivativeToolActivated = true;
        areaToolActivated = false;
        distanceToolActivated = false;
        volumeToolActivated = false;
        differenceToolActivated = false;
    } else {
        derivativeToolActivated = false;
    }
})
document.querySelector("#volume").addEventListener("click", function(e) {
    if(!volumeToolActivated) {
        volumeToolActivated = true;
        derivativeToolActivated = false;
        areaToolActivated = false;
        distanceToolActivated = false;
        differenceToolActivated = false;
    } else {
        volumeToolActivated = false;
    }
})
document.querySelector("#difference").addEventListener("click", function(e) {
    if(!differenceToolActivated) {
        differenceToolActivated = true;
        derivativeToolActivated = false;
        areaToolActivated = false;
        distanceToolActivated = false;
        volumeToolActivated = false;
    } else {
        differenceToolActivated = false;
    }
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

function update() {
    requestAnimationFrame(update);
}
update();


let pointA = {
    mathX: 1
}
let pointB = {
    mathX: 10
}

let formula = {
    getMathY: function(x) {
        return x;
    }
}

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

// listOfGraphs.push(modulus, weirdShit, stairCase);
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