// YES, TAU.
Math.TAU = Math.PI*2;


function _drawStroked(text, x, y, textsize, ctx, textAlign) {
	_drawStrokedColor(text, x, y, textsize, 4, 'white', ctx, false,textAlign)
}
function _drawStrokedColor(text, x, y, textsize,lw, color, ctx, blend,textAlign) {
	ctx.save()
	ctx.textAlign = textAlign || "center"
	ctx.font = textsize + "px Sans-serif"
	ctx.lineWidth = lw;
	ctx.shadowColor = "rgba(0,0,0,0.3)";
	ctx.shadowBlur = textsize * .1;
	if (blend) { // blend color into border
		ctx.strokeStyle = color;
		ctx.strokeText(text, x, y);
		ctx.strokeStyle = 'rgba(0, 0, 0, 0.5)';
	} else { // black border
		ctx.strokeStyle = 'black';
	}
	ctx.strokeText(text, x, y);
	ctx.fillStyle = color;
	ctx.fillText(text, x, y);
	ctx.restore()
}

function _drawArrow(ctx, fromx, fromy, tox, toy){
	// https://stackoverflow.com/a/26080467
	
	//variables to be used when creating the arrow
	
	var color = "#444";
	var headlen = 5;

	var angle = Math.atan2(toy-fromy,tox-fromx);

	//starting path of the arrow from the start square to the end square and drawing the stroke
	ctx.beginPath();
	ctx.moveTo(fromx, fromy);
	ctx.lineTo(tox, toy);
	ctx.strokeStyle = color;
	ctx.lineWidth = 3;
	ctx.stroke();

	//starting a new path from the head of the arrow to one of the sides of the point
	ctx.beginPath();
	ctx.moveTo(tox, toy);
	ctx.lineTo(tox-headlen*Math.cos(angle-Math.PI/7),toy-headlen*Math.sin(angle-Math.PI/7));

	//path from the side point of the arrow, to the other side point
	ctx.lineTo(tox-headlen*Math.cos(angle+Math.PI/7),toy-headlen*Math.sin(angle+Math.PI/7));

	//path from the side point back to the tip of the arrow, and then again to the opposite side point
	ctx.lineTo(tox, toy);
	ctx.lineTo(tox-headlen*Math.cos(angle-Math.PI/7),toy-headlen*Math.sin(angle-Math.PI/7));

	//draws the paths created above
	ctx.strokeStyle = color;
	ctx.lineWidth = 3;
	ctx.stroke();
	ctx.fillStyle = color;
	ctx.fill();
}

function _unitVector(to,from) {
	var x1 = from.x
	var y1 = from.y
	var x2 = to.x
	var y2 = to.y
	var dx = x2 - x1
	var dy = y2 - y1
	var length = Math.sqrt(dx**2 + dy**2)
	var ux = dx / length
	var uy = dy / length
	return {x:ux, y:uy}
}

function _copyAttributes(to,from) {
	// create copy of 'from'
	from = from || {}
	to = to || {} // maybe don't need this line?
	for (var name in to) {
		delete to[name]
	}
	for (var name in from) {
		to[name] = from[name];
	}
}

function _addAttributes(to,from) {
	// create copy of 'from'
	from = from || {}
	to = to || {}
	for (var name in from) {
		to[name] = from[name];
	}
}

function _fillInDefaults(to,from) {
	// create copy of 'from'
	from = from || {}
	to = to || {} // maybe don't need this line?
	var copy = _jcopy(from);
	for (var name in copy) {
		if(to[name] == undefined) to[name] = copy[name];
	}
}

function _fillInDefaultsByAddress(to,from) {
	from = from || {}
	to = to || {} // maybe don't need this line?
	for (var name in from) {
		if(to[name] == undefined) to[name] = from[name];
	}
}


function _fillInSomeDefaults(to,from,names) {
	from = from || {}
	for (var i in names) {
		if(from[names[i]] == undefined) continue
		if(to[names[i]] == undefined) to[names[i]] = _jcopy(from[names[i]]);
	}
}

function _copySomeAttributes_old(to,from,names) {
	// create copy of 'from'
	var copy = _jcopy(from); // this ran into problems with self.model being a circular reference
	to = to || {}
	for (var i in names) {
		to[names[i]] = copy[names[i]];
	}
}
function _copySomeAttributes(to,from,names) {
	// create copy of 'from'
	to = to || {}
	for (var i in names) {
		if(from[names[i]] == undefined) continue
		to[names[i]] = _jcopy(from[names[i]]);
	}
}

function _jcopy(a) {
	return JSON.parse(JSON.stringify(a))
}

function _objF(obj,f) { // run function if it exists for each item of an object
	for(var item in obj ) {
		if (obj[item][f]) obj[item][f]()
	} 
	// for example: run ui.menu.systems.configure(), ui.menu.nCandidates.configure(), et al.
}

function _rand5() {
	return Math.round(100000 * Math.random())
}


function _convertImageToDataURLviaCanvas(img, outputFormat){
	var canvas = document.createElement('CANVAS');
	var ctx = canvas.getContext('2d');
	canvas.height = img.height;
	canvas.width = img.width;
	ctx.drawImage(img, 0, 0);
	var dataURL = canvas.toDataURL();
	canvas = null; 
	return dataURL
}

function _convertNameToDataURLviaCanvas(letter,color, outputFormat){
	var canvas = document.createElement('CANVAS');
	var ctx = canvas.getContext('2d');
	var textsize = 120; // retina

	ctx.font = textsize + "px Sans-serif"
	var text = ctx.measureText(letter)

	canvas.height = textsize * 1.25 // extra space because we want uppercase to be centered
	canvas.width = text.width * 1.25
	canvas.style.height = canvas.height
	canvas.style.width = canvas.width

	var x = canvas.width / 2
	var y = textsize
	ctx.textAlign = "center"
	linewidth = textsize / 10
	if (letter.length > 2) {
		reduce = 1.5
		//  _drawStrokedColor(text, x, y, textsize,lw, color, ctx, blend) {
		_drawStrokedColor(letter,x, y / reduce,textsize / reduce,linewidth/reduce,color,ctx, true);
	} else {
		_drawStrokedColor(letter,x,y,textsize,linewidth,color,ctx, true);
	}
	var dataURL = canvas.toDataURL(outputFormat);
	canvas = null; 
	return dataURL
}



function _convertSVGToDataURLviaCanvas(img, outputFormat){
	var canvas = document.createElement('CANVAS');
	var ctx = canvas.getContext('2d');
	canvas.height = img.height;
	canvas.width = img.width;
	ctx.drawImage(img, 0, 0);
	var dataURL = canvas.toDataURL(outputFormat);
	canvas = null; 
	return dataURL
}

// helper

function _insertFunctionAfter(object,oldName,next) {
	var old = object[oldName]
    var newf = function () {
        old()
        next()
    }
    object[oldName] = newf
}

function _removeSubnodes(n) {
	while (n.firstChild) {
		n.removeChild(n.lastChild);
	}
}

function _removeClass(element,name) {
	element.className = element.className.replace(new RegExp(name,"g"), "")
}
function _addClass(element,name) {
	element.className = element.className + " " + name
}

function _isEquivalent(a, b) {
    // Create arrays of property names
    var aProps = Object.getOwnPropertyNames(a);
    var bProps = Object.getOwnPropertyNames(b);

    // If number of properties is different,
    // objects are not equivalent
    if (aProps.length != bProps.length) {
        return false;
    }

    for (var i = 0; i < aProps.length; i++) {
        var propName = aProps[i];

        // If values of same property are not equal,
        // objects are not equivalent
        if (a[propName] !== b[propName]) {
            return false;
        }
    }

    // If we made it this far, objects
    // are considered equivalent
    return true;
}