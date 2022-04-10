import {c, canvas, squareWidth, offsetX, offsetY, mouseDown} from "./canvas.js";
import Formula from "./parser.js";

const colors = ["#54F5B8", "#3963ED", "#F76223", "#6921ED", "#FA9F00", "#CD1DF5"];
let listOfGraphs = [];
let listOfInputedGraphs = [];

function randomColor() {
    let color = Math.ceil(Math.random() * colors.length);
    return colors[color];
}

function drawSelectedGraphs() {
    for(let i = 0; i < listOfGraphs.length; i++) {
        c.beginPath();
        listOfGraphs[i].drawGraph();
        c.beginPath();
    } 
    for(let i = 0; i < listOfInputedGraphs.length; i++) {
        c.beginPath();
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

        for(let i = -canvas.width/2+addjustedoffsetX; i < canvas.width/2+addjustedoffsetX; i++) {
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
}

canvas.addEventListener("mousemove", function(e) {
    // console.log(e.offsetX-canvas.width/2, e.offsetY-canvas.height/2);
    if(!mouseDown) return;
    drawSelectedGraphs();
})

canvas.addEventListener("wheel", function(e) {
    drawSelectedGraphs();
})

window.addEventListener("resize", function(e) {
    drawSelectedGraphs();
})

document.querySelector("#evaluateButton").addEventListener("click", function(e) {
    let expression = document.querySelector(".inputFunction").value;
    let newFormula = new Formula(expression);
    let newGraph = new Graph((x) => x, newFormula);
    newGraph.drawInputedGraph();
    listOfInputedGraphs.push(newGraph);
})







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