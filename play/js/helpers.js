// YES, TAU.
Math.TAU = Math.PI*2;


function _drawText(text, x, y, textsize, ctx, textAlign) {
	var lw = 2
	var color = 'black'

	ctx.save()
	ctx.textAlign = textAlign || "center"
	ctx.font = textsize + "px Sans-serif"
	ctx.lineWidth = lw;
	// ctx.strokeStyle = 'black';
	// ctx.strokeText(text, x, y);
	ctx.fillStyle = color;
	ctx.fillText(text, x, y);
	ctx.restore()
}


/// expand with color, background etc.
// https://stackoverflow.com/a/18901408
function drawTextBG(txt, x, y, textsize, ctx, textAlign) {

    /// lets save current state as we make a lot of changes        
    ctx.save();

	/// set font
	var font = textsize + "px Sans-serif"
	ctx.font = textsize + "px Sans-serif"
	ctx.textAlign = textAlign || "center"

    /// draw text from top - makes life easier at the moment
    ctx.textBaseline = 'top';

    /// color for background
    ctx.fillStyle = '#f50';
    
    /// get width of text
    var width = ctx.measureText(txt).width;

    /// draw background rect assuming height of font
    ctx.fillRect(x, y, width, textsize);
    
    /// text color
    ctx.fillStyle = '#000';

    /// draw text on top
    ctx.fillText(txt, x, y);
    
    /// restore original state
    ctx.restore();
}
	

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

function _randomString(length, chars) { // https://stackoverflow.com/a/10727155
    var result = '';
    for (var i = length; i > 0; --i) result += chars[Math.floor(Math.random() * chars.length)];
    return result;
}

function _randAlphaNum(n) {
	return _randomString(n, '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ');
}

function _hashCode(s) { // https://stackoverflow.com/a/7616484
	var hash = 0, i, chr;
	for (i = 0; i < s.length; i++) {
		chr   = s.charCodeAt(i);
		hash  = ((hash << 5) - hash) + chr;
		hash |= 0; // Convert to 32bit integer
	}

	// I will only use non-negative integers because it might be easier. 
	// So basically, I'm setting the first bit to 0.
	var half = 2147483648 
	return (hash + half) % half;
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
	linewidth = textsize / 30
	if (letter.length > 4) {
		var reduce = Math.sqrt(letter.length) / 2
		//  _drawStrokedColor(text, x, y, textsize,lw, color, ctx, blend) {
		// _backgroundRectangleOffset(ctx,x,y/reduce,text.width/reduce,textsize/reduce)
		_drawStrokedColor(letter,x, y - textsize/2 + textsize/reduce/2 + textsize/14 ,textsize / reduce,linewidth/reduce,color,ctx, true);
		// drawTextBG(letter, x, y, textsize, ctx, "center")
	} else {
		var reduce = 1
		// _backgroundRectangleOffset(ctx,x,y,text.width,textsize)
		_drawStrokedColor(letter,x,y,textsize,linewidth,color,ctx, true);
		// drawTextBG(letter, x, y, textsize, ctx, "center")
	}
	var dataURL = canvas.toDataURL(outputFormat);
	canvas = null; 
	return {
		png_b64:dataURL,
		widthFrac: text.width/textsize/1.25/reduce, // width as a fraction of image height
		heightFrac: 1/1.25/reduce, // height as a fraction of image height
	}
}

function _backgroundRectangleOffset(ctx,x,y,width,height) {
	ctx.save()
	ctx.globalAlpha = .8
	ctx.fillStyle = "#fff"
	ctx.fillRect(x - width/2, y-height/2*1.7, width, height);
	ctx.restore()
}

function _winBackgroundRectangle(ctx,x,y,width,height) {
	ctx.save()
	ctx.shadowColor = "rgba(0,0,0,0.3)";
	ctx.shadowBlur = 40 * .1;
	ctx.globalAlpha = .8
		width += 45
		height += 45
	ctx.fillStyle = "#fff"
	ctx.fillRect(x - width/2, y-height/2, width, height);
	
	
	width -= 30
	height -= 30

	// ctx.globalAlpha = 1
	ctx.lineWidth = 8
	ctx.strokeStyle = "#555"
	// ctx.setLineDash([5, 5]);
	ctx.strokeRect(x - width/2, y-height/2, width, height);
	ctx.restore()
}

function _winBackgroundRectangle2(ctx,x,y,width,height) {
	ctx.save()
	ctx.globalAlpha = .8
		width += 15
		height += 15
	ctx.fillStyle = "#fff"
	ctx.fillRect(x - width/2, y-height/2, width, height);
	
	// ctx.globalAlpha = 1
	ctx.lineWidth = 8
	ctx.strokeStyle = "#555"
	// ctx.setLineDash([5, 5]);
	ctx.strokeRect(x - width/2, y-height/2, width, height);
	if (1) {
		ctx.strokeStyle = "#fff"
		width += 8
		height += 8
		// ctx.setLineDash([15, 5]);
		ctx.strokeRect(x - width/2, y-height/2, width, height);
	}
	ctx.restore()
}

function _backgroundRectangle(ctx,x,y,width,height) {
	ctx.save()
	ctx.shadowColor = "rgba(0,0,0,0.3)";
	ctx.shadowBlur = 40 * .1;
	width += 15
	height += 15
	ctx.globalAlpha = .8
	ctx.fillStyle = "#fff"
	ctx.fillRect(x - width/2, y-height/2, width, height);
	ctx.restore()
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
	_removeClass(element,name) // only one
	element.className = element.className + " " + name
}

function _displayNoneIf(dom,condition) {
    if (condition) {
        _addClass(dom,"displayNoneClass")
    } else {
        _removeClass(dom,"displayNoneClass")
    }
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


var _ajax = {};  // https://stackoverflow.com/a/18078705

_ajax.x = function () {
	if (typeof XMLHttpRequest !== 'undefined') {
		return new XMLHttpRequest();
	}
	var versions = [
		"MSXML2.XmlHttp.6.0",
		"MSXML2.XmlHttp.5.0",
		"MSXML2.XmlHttp.4.0",
		"MSXML2.XmlHttp.3.0",
		"MSXML2.XmlHttp.2.0",
		"Microsoft.XmlHttp"
	];

	var xhr;
	for (var i = 0; i < versions.length; i++) {
		try {
			xhr = new ActiveXObject(versions[i]);
			break;
		} catch (e) {
		}
	}
	return xhr;
};

_ajax.send = function (url, callback, method, data, async) {
	if (async === undefined) {
		async = true;
	}
	var x = _ajax.x();
	x.open(method, url, async);
	x.onreadystatechange = function () {
		if (x.readyState == 4) {
			callback(x.responseText)
		}
	};
	if (method == 'POST') {
		x.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
	}
	x.send(data)
};

_ajax.get = function (url, data, callback, async) {
	var query = [];
	for (var key in data) {
		query.push(encodeURIComponent(key) + '=' + encodeURIComponent(data[key]));
	}
	_ajax.send(url + (query.length ? '?' + query.join('&') : ''), callback, 'GET', null, async)
};

function _getRequest(url, callback) {
	const Http = new XMLHttpRequest();
	Http.open("GET", url);
	Http.send();
	
	Http.onreadystatechange = function(e) {
		if (Http.readyState == 4) {
			callback(Http.responseText)
		}
	}
}

// https://stackoverflow.com/a/44134328
function sepHslToHex(h, s, l) {
	h /= 360;
	s /= 100;
	l /= 100;
	let r, g, b;
	if (s === 0) {
	  r = g = b = l; // achromatic
	} else {
	  const hue2rgb = (p, q, t) => {
		if (t < 0) t += 1;
		if (t > 1) t -= 1;
		if (t < 1 / 6) return p + (q - p) * 6 * t;
		if (t < 1 / 2) return q;
		if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
		return p;
	  };
	  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
	  const p = 2 * l - q;
	  r = hue2rgb(p, q, h + 1 / 3);
	  g = hue2rgb(p, q, h);
	  b = hue2rgb(p, q, h - 1 / 3);
	}
	const toHex = x => {
	  const hex = Math.round(x * 255).toString(16);
	  return hex.length === 1 ? '0' + hex : hex;
	};
	return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

// https://stackoverflow.com/a/36721970
function hslToHex(hsl) {
	var a, b, g, h, l, p, q, r, ref, s;
	if (hsl.match(/hsla?\((.+?)\)/)) {
	  ref = hsl.match(/hsla?\((.+?)\)/)[1].split(',').map(function(value) {
		value.trim();
		return parseFloat(value);
	  }), h = ref[0], s = ref[1], l = ref[2], a = ref[3];
	} else {
		return hsl
	}

	return sepHslToHex(h, s, l)
}

function addMinusButton(div,opt) {
	var control = {}
	addMinusButtonC(div,control,opt)
}

function addMinusButtonC(div,control,opt) {

	opt = opt || {}
	opt.caption = opt.caption || false
	opt.ballot = opt.ballot || false
	// add to dom
	// var minus = document.createElement("div")
	var minus = document.createElement("div")
	div.prepend(minus)
	// div.parentNode.insertBefore(minus, div.nextSibling)
	// div.insertAdjacentElement('beforebegin', minus)
	// make float to upper right
	div.style.position = "relative"
	minus.style = `
		position: absolute;
		top: 0px;
		right: 0px;
		width: 20px;
		height: 20px;
		text-align: center;
		vertical-align: middle;
		line-height: 20px;
		font-size: 20px;
		background-color: #fff9;
		color: #000d;
		margin-top: 2px;
	`
	// minus.style.float = "right"
	// minus.style.clear = "both"
	if (opt.ballot) {
		minus.style["margin-right"] = "10px"
	}
	// minus.style.border = '2px solid black';
	// make minus sign
	// var sign = document.createTextNode('-')
	// minus.append(sign)
	minus.innerText = '-'
	// keep track of state
	if (control.show == undefined) control.show = true
	var stateDisplayDefault = div.style.display
	updateMinus()
	// add button function
	minus.onclick = function () {
		control.show = ! control.show
		updateMinus()
	}
	function updateMinus() {
		if (control.show) {
			minus.innerText = '-'
			// div.style.display = stateDisplayDefault
			// div.hidden = false
			div.style.height = 'unset'
			div.style["overflow-y"] = "inherit"
		} else {
			minus.innerText = '+'
			// div.style.display = 'none'
			// div.hidden = true
			if (opt.caption) {
				div.style.height = '5px'
			} else if (opt.ballot) {
				div.style.height = '39px'
			} else {
				div.style.height = '25px'
			}
			div.style["overflow-y"] = "hidden"
		}
	}
	
}