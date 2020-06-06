
// set values

var numValues = 3 // required to be constant to compile kernel, I think
var width = 500
var height = 500
var ProcessorType = "gpu"

values = new function () {
    for (var colo = [], i = 0; i < numValues; ++i) colo[i] = Math.random(); // determines color
    for (var xpos = [], i = 0; i < numValues; ++i) xpos[i] = width * Math.random();
    for (var ypos = [], i = 0; i < numValues; ++i) ypos[i] = height * Math.random();
    var rad = []
    for (var i = 0; i < xpos.length; i++) {
        var d2 = (xpos[i] - 200) ** 2 + (ypos[i] - 200) ** 2
        rad.push(Math.sqrt(d2))
    }
    return {
        colo,
        xpos,
        ypos,
        rad,
    };
}

var colors = ["#ffffcc", "#ffffca", "#fffec8", "#fffdc6", "#fffdc4", "#fffcc3", "#fffbc1", "#fffbbf", "#fefabd", "#fef9bb", "#fef9b9", "#fef8b7", "#fef7b5", "#fef7b3", "#fdf6b1", "#fdf5af", "#fdf5ad", "#fdf4ab", "#fdf3a9", "#fdf3a7", "#fdf2a5", "#fcf1a3", "#fcf1a1", "#fcf0a0", "#fcef9e", "#fcee9c", "#fbee9a", "#fbed98", "#fbec96", "#fbec94", "#fbeb92", "#fbea90", "#faea8e", "#fae98c", "#fae88a", "#fae788", "#fae786", "#fae684", "#f9e582", "#f9e480", "#f9e37e", "#f9e37c", "#f8e27a", "#f8e178", "#f8e076", "#f8df74", "#f8de72", "#f7dd70", "#f7dc6e", "#f7db6d", "#f7d96b", "#f6d869", "#f6d767", "#f6d666", "#f5d464", "#f5d363", "#f5d261", "#f4d060", "#f4cf5f", "#f4ce5d", "#f4cc5c", "#f3cb5b", "#f3c95a", "#f3c85a", "#f2c759", "#f2c558", "#f2c458", "#f1c257", "#f1c157", "#f1c056", "#f1be56", "#f0bd56", "#f0bc55", "#f0ba55", "#efb955", "#efb855", "#efb755", "#efb554", "#eeb454", "#eeb354", "#eeb254", "#eeb054", "#edaf54", "#edae54", "#edac54", "#edab53", "#ecaa53", "#eca953", "#eca753", "#eca653", "#eba553", "#eba453", "#eba253", "#eba153", "#eaa053", "#ea9f52", "#ea9d52", "#ea9c52", "#e99b52", "#e99a52", "#e99852", "#e89752", "#e89652", "#e89552", "#e89352", "#e79252", "#e79151", "#e79051", "#e78e51", "#e68d51", "#e68c51", "#e68b51", "#e68951", "#e58851", "#e58751", "#e58551", "#e58450", "#e48350", "#e48250", "#e48050", "#e47f50", "#e37e50", "#e37c50", "#e37b50", "#e27a50", "#e27850", "#e27750", "#e2764f", "#e1744f", "#e1734f", "#e1724f", "#e0704f", "#e06f4f", "#df6e4f", "#df6c4f", "#df6b4f", "#de694e", "#de684e", "#dd674e", "#dd654e", "#dc644e", "#db624e", "#db614e", "#da604d", "#d95e4d", "#d85d4d", "#d75b4d", "#d65a4d", "#d5594c", "#d4574c", "#d2564c", "#d1554c", "#d0544c", "#ce534b", "#cd524b", "#cb514b", "#c9504b", "#c84f4a", "#c64e4a", "#c44d4a", "#c34c4a", "#c14c49", "#bf4b49", "#bd4b49", "#bb4a49", "#ba4a48", "#b84948", "#b64948", "#b44847", "#b24847", "#b14847", "#af4746", "#ad4746", "#ab4746", "#a94645", "#a74645", "#a64644", "#a44544", "#a24543", "#a04443", "#9e4442", "#9c4442", "#9a4341", "#984340", "#974240", "#95423f", "#93413e", "#91413e", "#8f403d", "#8d403c", "#8b3f3b", "#893f3a", "#873e3a", "#853d39", "#833d38", "#813c37", "#7f3c36", "#7d3b35", "#7b3a34", "#793a33", "#773932", "#763931", "#743830", "#72372f", "#70372e", "#6e362d", "#6c352c", "#6a352b", "#68342a", "#663429", "#643328", "#623227", "#613226", "#5f3125", "#5d3024", "#5b3023", "#592f22", "#572f21", "#552e20", "#542d1f", "#522d1e", "#502c1d", "#4e2b1d", "#4c2b1c", "#4b2a1b", "#492a1a", "#472919", "#452918", "#442817", "#422717", "#402716", "#3e2615", "#3d2614", "#3b2513", "#392513", "#382412", "#362311", "#342310", "#33220f", "#31220f", "#30210e", "#2e210d", "#2c200c", "#2b200b", "#291f0a", "#281f09", "#261e08", "#251d07", "#231d06", "#221c05", "#201c04", "#1f1b03", "#1d1b03", "#1c1a02", "#1b1a01", "#191900"]

colorScaleImageData = new function () {
    var canvasColorScale = document.createElement("canvas");
    canvasColorScale.width = 256;
    canvasColorScale.height = 1;
    canvasColorScale.style.display = "none";
    var contextColorScale = canvasColorScale.getContext("2d");
    for (var i = 0; i < colors.length; ++i) {
        contextColorScale.fillStyle = colors[i];
        contextColorScale.fillRect(i, 0, 256, 1);
    }

    return contextColorScale.getImageData(0, 0, 255, 1).data;
}


// start kernel



var canGo = document.createElement('canvas')

var gpu = new GPU({
    processor: ProcessorType,
    canvas: canGo,
});

var render =  gpu.createKernel(kernel)
    .setConstants({
        numPoints: values.colo.length
    })
    .setOutput([width, height])
    .setGraphical(true);

render(
    values.xpos,
    values.ypos,
    values.colo,
    colorScaleImageData,
    values.rad,
);

function kernel (
    xpos,
    ypos,
    colo,
    colorScaleImageData,
    rad,
) {
    var dist = 0;
    var r = 0.0;
    var g = 0.0;
    var b = 0.0;

    for (var i = 0; i < this.constants.numPoints; i++) {
        var x = this.thread.x - xpos[i],
            y = this.thread.y - ypos[i];

        dist = Math.sqrt(x * x + y * y);

        if (dist > rad[i]) { 

            if (false) {
                var flagDist = i + 1;
                var value = colo[flagDist];
                var c = Math.ceil(255 * value);

                r = r + (colorScaleImageData[c * 4] / 255) **2  / this.constants.numPoints;
                g = g + (colorScaleImageData[1 + c * 4] / 255) **2  / this.constants.numPoints;
                b = b + (colorScaleImageData[2 + c * 4] / 255) **2  / this.constants.numPoints;
            }
        } else { // white
            r = r + 1 / this.constants.numPoints;
            g = g + 1 / this.constants.numPoints;
            b = b + 1 / this.constants.numPoints;
        }
        
    }

    this.color(Math.sqrt(r),Math.sqrt(g),Math.sqrt(b),1)

}



// draw more stuff



var can4 = document.createElement("canvas");
can4.width = width*2;
can4.height = height*2;
can4.style.width = width+"px";
can4.style.height = height+"px";
var ctx4 = can4.getContext("2d");

ctx4.fillRect(0, 0, 200, 200);
ctx4.fillRect(200, 200, 200, 200);


var canvas = document.createElement("canvas");
canvas.width = width*2;
canvas.height = height*2;
canvas.style.width = width+"px";
canvas.style.height = height+"px";
var ctx = canvas.getContext("2d");

ctx.fillStyle = "pink"
ctx.fillRect(250, 205, 110, 110);



var can3 = document.getElementById("can3");
can3.width = width*2;
can3.height = height*2;
can3.style.width = width+"px";
can3.style.height = height+"px";
var ctx3 = can3.getContext('2d');

document.body.appendChild(can3);

ctx3.drawImage(can4,0,0)
ctx3.globalAlpha = .8
ctx3.drawImage(canGo, 0, 0);
ctx3.globalAlpha = 1
ctx3.drawImage(canvas, 0, 0);
