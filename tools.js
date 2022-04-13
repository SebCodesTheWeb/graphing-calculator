export let distanceToolActivated = false;
export let areaToolActivated = false;
export let derivativeToolActivated = false;
export let volumeToolActivated = false;
export let differenceToolActivated = false;
export let surfaceAreaToolActivated = false;
export let limitToolActivated = false;
export let continuityToolActivated = false;
export let rootToolActivated = false;
export let turningPointsToolActivated = false;
export let standardToolActivated = true;
const toolInfo = document.querySelector("#tool-info");

export function anyToolActivated() {
    if(distanceToolActivated || areaToolActivated || derivativeToolActivated || volumeToolActivated || differenceToolActivated || surfaceAreaToolActivated || limitToolActivated || continuityToolActivated || rootToolActivated || turningPointsToolActivated) {
        return true;
    }
}

document.querySelector("#distance").addEventListener("click", function(e) {
    if(!distanceToolActivated) {
        deactiveAllTools();
        outputToolInfo("distance-tool");
        distanceToolActivated = true;
    } else {
        distanceToolActivated = true;
    }
})
document.querySelector("#area").addEventListener("click", function(e) {
    if(!areaToolActivated) {
        deactiveAllTools();
        outputToolInfo("area-tool");
        areaToolActivated = true;
    } 
    else {
        areaToolActivated = true;
    }
})
document.querySelector("#derivative").addEventListener("click", function(e) {
    if(!derivativeToolActivated) {
        deactiveAllTools();
        outputToolInfo("derivative-tool");
        derivativeToolActivated = true;
    } else {
        derivativeToolActivated = true;
    }
})
document.querySelector("#volume").addEventListener("click", function(e) {
    if(!volumeToolActivated) {
        deactiveAllTools();
        outputToolInfo("volume-tool");
        volumeToolActivated = true
    } else {
        volumeToolActivated = true;
    }
})
document.querySelector("#difference").addEventListener("click", function(e) {
    if(!differenceToolActivated) {
        deactiveAllTools();
        outputToolInfo("difference-tool");
        differenceToolActivated = true;
    } else {
        differenceToolActivated = true;
    }
})
document.querySelector("#surface-area").addEventListener("click", function(e) {
    if(!surfaceAreaToolActivated) {
        deactiveAllTools();
        outputToolInfo("surface-area-tool");
        surfaceAreaToolActivated = true;
    } else {
        surfaceAreaToolActivated = true;
    }
})
document.querySelector("#limit").addEventListener("click", function(e) {
    if(!limitToolActivated) {
        deactiveAllTools();
        outputToolInfo("limit-tool");
        limitToolActivated = true;
    } else {
        limitToolActivated = true;
    }
})
document.querySelector("#continuity").addEventListener("click", function(e) {
    if(!continuityToolActivated) {
        deactiveAllTools();
        outputToolInfo("continuity-tool");
        continuityToolActivated = true;
    } else {
        continuityToolActivated = true;
    }
})
document.querySelector("#root").addEventListener("click", function(e) {
    if(!rootToolActivated) {
        deactiveAllTools();
        outputToolInfo("root-tool");
        rootToolActivated = true;
    } else {
        rootToolActivated = true;
    }
})
document.querySelector("#turning").addEventListener("click", function(e) {
    if(!turningPointsToolActivated) { //Optimization if already clicked
        deactiveAllTools();
        outputToolInfo("turning-tool");
        turningPointsToolActivated = true;
    } else {
        turningPointsToolActivated = true;
    }
})
document.querySelector("#standard").addEventListener("click", function(e) {
        deactiveAllTools();
        outputToolInfo("standard-tool");
        standardToolActivated = true;
})

export function deactiveAllTools() {
    differenceToolActivated = false;
    derivativeToolActivated = false;
    areaToolActivated = false;
    distanceToolActivated = false;
    volumeToolActivated = false;
    surfaceAreaToolActivated = false;
    limitToolActivated = false;
    continuityToolActivated = false;
    rootToolActivated = false;
    turningPointsToolActivated = false;
    standardToolActivated = false;
}

function outputToolInfo(tool) {
    switch(tool) {
        case "distance-tool":
            toolInfo.innerHTML = `The distance tool calculates the length of the graph between two points`;
            break;
        case "area-tool":
            toolInfo.innerHTML = `The area tool calculates the area under the graph between two points`;
            break;
        case "derivative-tool":
            toolInfo.innerHTML = `The derivative tool calculates the tangent/slope of the curve at a specific point`;
            break;
        case "volume-tool":
            toolInfo.innerHTML = `The volume tool calculates the volume of the corresponding solid of revolution to the curve between two points`;
            break;
        case "difference-tool":
            toolInfo.innerHTML = `The difference tool calculates the difference in the x and y coordinates between two points`;
            break;
        case "surface-area-tool":
            toolInfo.innerHTML = `The surface area tool calculates the surface area of the corresponding solid of revolution to the curve between two points`;
            break;
        case "limit-tool":
            toolInfo.innerHTML = `The limit tool calculates the right and left side limit at a point and return true if limit exits`;
            break;
        case "continuity-tool":
            toolInfo.innerHTML = `The continuity tool calculates the limit at every point between two points, if all limits exists it returns true`;
            break;
        case "root-tool":
            toolInfo.innerHTML = `The root tool calculates the points at which the graph crosses the x axis`;
            break;
        case "turning-tool":
            toolInfo.innerHTML = `The turning points tool calculates the points at which the graph changes direction(local maxima and minima)`;
            break;
        case "standard-tool":
            toolInfo.innerHTML = `The standard cursor tool lets you move around freely`;
            break;
    }
}