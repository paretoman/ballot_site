function Candidate(model){

	var self = this;
	Draggable.call(self);
	

	// CONFIGURE DEFAULTS
	self.isCandidate = true
	// it would be better to have a serial number, but for now, use icon and instance
	self.icon = 'square'
	self.instance = 1
	self.size = 40;
	self.b = 1
	self.selected = false
	self.update = function() {
		// GRAPHICS
		self.size = self.sizeFromB(self.b)
		self.grabsize = Math.max(self.size * .8,10)
	}
	self.init = function () {
		self.update()
		// Defaults
		if (model.theme == undefined) model.theme = "Default" // comment: this should already be handled in model.js
		if (model.colorChooser == undefined) model.colorChooser = "pick and generate"
		if (model.colorSpace == undefined) model.colorSpace = "hsluv with dark"

		// compose an id
		if (self.instance > 1) {
			self.id = self.icon + self.instance
		} else {
			self.id = self.icon
		}
		
		// what order are we at
		var chars = Candidate.graphics[model.theme]
		var char = Candidate.graphicsByIcon[model.theme][self.icon]
		var charIndex = char.i
		var serial = charIndex + (self.instance - 1) * chars.length
		self.serial = serial

		// The candidate's name is not his id.  id is unique.
		if (model.customNames == "Yes" && serial < model.namelist.length && model.namelist[serial] != "") {
			self.name = model.namelist[serial]
		} else {
			// use specified name.  If none specified, use alphabet.
			if (Candidate.graphicsByIcon[model.theme][self.icon].hasOwnProperty("name")) {
				self.name = Candidate.graphicsByIcon[model.theme][self.icon]["name"]
			} else {
				self.name = String.fromCharCode((serial % 26) + "A".charCodeAt(0));
			}
		}
		self.nameSelf = new Graphicon(self, "name",char,model,charIndex,chars)
		
		if (model.theme == "Letters") {
			self.imageSelf = self.nameSelf 
		} else {
			self.imageSelf = new Graphicon(self,"image",char,model,charIndex,chars)
		}
		self.fill = self.imageSelf.fill
	}
	
	self.convertColor = function() {
		var coloredSvgXml = svgXml.replace(/#3080d0/g,'#e05030');
		img.src = "data:image/svg+xml;charset=utf-8,"+coloredSvgXml;
	}
	self.sizeFromB = function(b) {
		return b * 40
	}
	self.bFromSize = function(b) {
		return b / 40
	}

	self.drawBackAnnotation = function(x,y,ctx) {}; // TO IMPLEMENT
	self.drawAnnotation = function(x,y,ctx) {}; // TO IMPLEMENT
	self.drawTie = function(ctx,arena) {
		// ctx.textAlign = "center";
		// var p = arena.modelToArena(self)
		// if (model.candidateIconsSet.includes("note")) {
		// 	_drawStroked("TIE",p.x*2,p.y*2-35,40,ctx);
		// }
	}	
	self.drawWin = function(ctx,arena) {
		// ctx.textAlign = "center";
		// var p = arena.modelToArena(self)
		// if (model.candidateIconsSet.includes("note")) {
		// 	_drawStroked("WIN",p.x*2,p.y*2-35,40,ctx);
		// }
	}	
	self.drawText = function(text,ctx,arena) {
		ctx.textAlign = "center";
		var p = arena.modelToArena(self)
		_drawStroked(text,p.x*2,p.y*2-35,40,ctx);
	}	
	self.draw = function(ctx,arena,opt){
		if (model.nLoading > 0) return // still loading, will call lat

		opt = opt || {}
		opt.rotate = opt.rotate || 0

		// RETINA
		var p = arena.modelToArena(self)
		var x = p.x*2;
		var y = p.y*2;
		var size = self.size*2;
		var hsize
		
		if (opt.rotate != 0) {
			var angle = Math.PI/180 * -opt.rotate
			ctx.save()
			ctx.translate(x, y)
			x = 0
			y = 0
			ctx.rotate(angle);
		}
			
		// Draw image instead!
		//if(self.highlight) ctx.filter = "brightness(150%)"
		if(self.highlight) var temp = ctx.globalAlpha
		if(self.highlight) ctx.globalAlpha = 0.8
		if (model.candidateIconsSet.includes("note")) {
			self.drawBackAnnotation(x,y,ctx)
		}
		

		// fade out the non-continuing candidates
		if (model.roundCurrent !== undefined) {
			var round = model.roundCurrent[self.iDistrict]
			var elimSystem = (model.system == "IRV" || model.system == "STV")
			if (round !== undefined && elimSystem && round > 0) {
				var maxRound = model.result.continuing.length
				if (round > maxRound) {
					// final results.. forget about shading out candidate
					round = maxRound
				} else {
					if (! model.result.continuing[round-1].includes(self.id)) {
						ctx.globalAlpha = 0.3
					}
				}
			}
		}

		if (model.customNames == "Yes") {
			hsize = self.imageSelf.img.width / self.imageSelf.img.height * size
		}
		if (model.candidateIconsSet.includes("body")) {

			size *= 2/3
			
			var iwon = self.winner

			// draw differently for each round
			if (model.roundCurrent !== undefined) {
				var round = model.roundCurrent[self.iDistrict]
				// if (round > model.result.history.rounds.length) round = model.result.history.rounds.length - 1
				if (round !== undefined && (model.system == "STV")) {
					if (round >= model.result.won.length) round = model.result.won.length - 1
					winners = model.result.won[round]
					iwon = winners.includes(self.id)
					// winnerIdxs = model.result.history.rounds[round].winners
					// winners = winnerIdxs.map( x => district.candidates[x].id)
				}
			}

			if (iwon) {
				_drawSpeckMan2(self.fill, self.fill, 4, ctx.globalAlpha, x/2, y/2, ctx)				
			} else {
				_drawSpeckMan1(self.fill, self.fill, 4, ctx.globalAlpha, x/2, y/2, ctx)
			}
		}
		if (model.candidateIconsSet.includes("image")) {

			if (model.theme != "Nicky") {
				var rectW = size
				var rectH = size
	
				if (self.winner && model.candidateIconsSet.includes("note")) {
					_winBackgroundRectangle(ctx,x,y,rectW,rectH)
				} else {
					_backgroundRectangle(ctx,x,y,rectW,rectH)
				}

			}

			hsize = self.imageSelf.img.width / self.imageSelf.img.height * size
			ctx.drawImage(self.imageSelf.img, x-hsize/2, y-size/2, hsize, size);
		}
		if (model.candidateIconsSet.includes("name")) {
			var rectW = self.nameSelf.widthFracName * size
			var rectH = self.nameSelf.heightFracName * size
			if (self.winner && model.candidateIconsSet.includes("note")) {
				_winBackgroundRectangle(ctx,x,y,rectW,rectH)
			} else {
				_backgroundRectangle(ctx,x,y,rectW,rectH)
			}

			hsize = self.nameSelf.img.width / self.nameSelf.img.height * size
			ctx.drawImage(self.nameSelf.img, x-hsize/2, y-size/2, hsize, size);
		}
		if (model.candidateIconsSet.includes("dots")) {

			var squareSize = 20
			if (self.winner && model.candidateIconsSet.includes("note")) {
				_winBackgroundRectangle(ctx,x,y,squareSize,squareSize)
			}

			ctx.fillStyle = self.fill
			ctx.strokeStyle = 'black'
			ctx.lineWidth = 1
	
			ctx.beginPath()
			var side = 10
			ctx.rect(x-side/2, y-side/2, side, side)
			ctx.fill()
			ctx.stroke()
		}
		// } else if (model.votersAsCandidates) {
		// 	ctx.rect(x-size/2, y-size/2, size, size);
		// 	ctx.fillStyle = self.fill
		// 	ctx.fill()

		if (model.candidateIconsSet.includes("note")) {
			self.drawAnnotation(x,y,ctx)
			if (self.selected) {
				_drawStroked("SELECTED",x,y-5,40,ctx);			
			}
		}
		if(self.highlight) ctx.globalAlpha = temp
		//if(self.highlight) ctx.filter = "brightness(100%)"

		if (opt.rotate != 0) {
			ctx.restore()
		}
		ctx.globalAlpha = 1.0
	};

}

// CONSTANTS: the GRAPHICS!
// id => img & fill

Candidate.graphics = {
	Letters: [
		{
			icon: "square",
			fill: "hsl(240,80%,70%)",
		},
		{
			icon: "triangle",
			fill: "hsl(45,80%,70%)",
		},
		{
			icon: "hexagon",
			fill: "hsl(0,80%,70%)",
		},
		{
			icon: "pentagon",
			url: "play/img/pentagon.svg",
			fill: "hsl(90,80%,70%)",
		},
		{
			icon: "bob",
			fill: "hsl(30,80%,70%)",
		}
	],
	Default: [
		{
			icon: "square",
			url: "play/img/square.svg",
			fill: "hsl(240,80%,70%)",
			name: "square",
		},
		{
			icon: "triangle",
			url: "play/img/triangle.svg",
			fill: "hsl(45,80%,70%)",
			name: "triangle",
		},
		{
			icon: "hexagon",
			url: "play/img/hexagon.svg",
			fill: "hsl(0,80%,70%)",
			name: "hexagon",
		},
		{
			icon: "pentagon",
			url: "play/img/pentagon.svg",
			fill: "hsl(90,80%,70%)",
			name: "pentagon",
		},
		{
			icon: "bob",
			url: "play/img/bob.svg",
			fill: "hsl(30,80%,70%)",
			name: "bob",
		}
	],
	Nicky: [
		{
			icon: "square",
			url: "play/img/square.png",
			fill: "hsl(240,80%,70%)",
			name: "square",
		},
		{
			icon: "triangle",
			url: "play/img/triangle.png",
			fill: "hsl(45,80%,70%)",
			name: "triangle",
		},
		{
			icon: "hexagon",
			url: "play/img/hexagon.png",
			fill: "hsl(0,80%,70%)",
			name: "hexagon",
		},
		{
			icon: "pentagon",
			url: "play/img/pentagon.png",
			fill: "hsl(90,80%,70%)",
			name: "pentagon",
		},
		{
			icon: "bob",
			url: "play/img/bob.png",
			fill: "hsl(30,80%,70%)",
			name: "bob",
		}
	],
	Bees: [
		{
			icon: "square",
			url: "play/img/blue_bee.png",
			fill: "hsl(240,80%,70%)",
			name: "blue",
		},
		{
			icon: "triangle",
			url: "play/img/yellow_bee.png",
			fill: "hsl(45,80%,70%)",
			name: "yellow",
		},
		{
			icon: "hexagon",
			url: "play/img/red_bee.png",
			fill: "hsl(0,80%,70%)",
			name: "red",
		},
		{
			icon: "pentagon",
			url: "play/img/green_bee.png",
			fill: "hsl(90,80%,70%)",
			name: "green",
		},
		{
			icon: "bob",
			url: "play/img/orange_bee.png",
			fill: "hsl(30,80%,70%)",
			name: "orange",
		}
	]
};

// index by icon, as well, and have index stored and ready
Candidate.graphicsByIcon = {}
for (var themename in Candidate.graphics) {
	var theme = Candidate.graphics[themename]
	Candidate.graphicsByIcon[themename] = {}
	for (var k = 0; k < theme.length; k++) {
		var char = theme[k]
		char.i = k
		Candidate.graphicsByIcon[themename][char.icon] = char
	}
}

Candidate.idFromSerial = function (serial,theme) {
	var chars = Candidate.graphics[theme]
	var icon = serial % chars.length
	var instance = (serial - icon) / chars.length +1
	if (instance == 1) instance = ''
	var id = chars[icon].icon + instance
	return id
}

// put all the graphical stuff here... because it's difficult

function Graphicon(candidate,option,char,model,charIndex,chars) {
	var self = this
	if (option == "name") {
		// Make an image for the name
		self.ext = "NA"
		pickFillFromColorChooser()
		if (candidate.dummy) return // don't make
		makeNameImage()
	} else {
		
		// Load the regular image
		self.url = char.url
		// var _graphics = Candidate.graphics[model.theme][self.icon];
		// self.url = _graphics.img

		// are we using an svg or an img?
		// if the model doesn't have assets, then load the files the old way
		if (model.assets) {
			if (model.assets[self.url]) {
				var asset = model.assets[self.url]
			} else {
				if (0) { // was for Letters
					// skip
				} else if (Loader) {
					if (Loader.assets[self.url]) {
						var asset = Loader.assets[self.url]
					}
				}
			}
		}

		// png or svg?
		if (0) { // was for Letters
			var ext = "NA"
		} else {
			var ext = char.url.split('.').pop();
		}
		self.ext = ext
		if (ext != "svg" &&  (1) ) { // 1 used to be !"Letters" theme
			// if we are using png's then we have to repeat the fill // TODO: fix
			self.fill = char.fill
		} else {
			pickFillFromColorChooser()
		}
		
		
		if (candidate.dummy) return // don't make

		// make an img for canvas
		// make an embeddable text string for html
		// This should be the last thing in this function because there are callbacks here.
		if (asset) {
			if (ext == "svg") {
				processSVG(asset)
				makeImg()
			} else { 
				// png asset
				// the img is already made
				self.img = asset

				self.texticon = "<img src='"+self.url+"'/>"
			}
		} else { 
			// no asset, so load the img from a file
			if (ext == "svg") {
				downloadSVGandMakeImg( function() { 
					// callback
					self.texticon = self.svg
					
					if (! candidate.dummy) model.update() // draw the UI.. maybe we don't need a whole bunch
				})
			} else if (0) {  // 0 used to be "Letters" theme
				makeNameImage()
			} else { 
				self.srcImg = self.url
				makeImg()

				self.texticon = "<img src='"+self.url+"'/>"
			}
		}

		
		if (model.theme == "Nicky") {
			self.texticon = "<img src='play/img/icon/"+candidate.name+".png'/>";
		}
	}
	
	function pickFillFromColorChooser() {
		if (model.colorChooser == "pick and generate") {
			if (candidate.instance > 1) {
				// change fill for further rounds
				self.fill = Color.generate(candidate.serial)
			} else {
				self.fill = char.fill
				// self.fill = _graphics.fill;
			}
		} else if (model.colorChooser == "pick and repeat w/ offset") {
			if (candidate.instance > 1) {
				// change fill for further rounds
				var fillIndex = (charIndex + candidate.instance - 1) % chars.length
				self.fill = chars[fillIndex].fill
			} else {
				self.fill = char.fill
				// self.fill = _graphics.fill;
			}
		} else if (model.colorChooser == "generate all") {
			self.fill = Color.generate(candidate.serial)
		} else { // "pick and repeat"
			self.fill = char.fill
		}
	}
	
	function processSVG(asset) {
		// make self.srcImg and self.svg from asset

		// svg processing
		// create own class: replace cls-1 with cls-id
		self.svg = asset
		self.svg = self.svg.replace(/cls-1/g,"cls-"+candidate.id)
		// set style color
		var stylechange = "<style>.cls-" + candidate.id + "{fill:" + self.fill + ";}</style>"
		// add style to svg
		self.svg  = self.svg.replace("</svg>", stylechange + "</svg>")
		// auto | optimizeSpeed | crispEdges | geometricPrecision
		// shapeRender = 'shape-rendering="auto"'
		// self.svg  = self.svg.replace("<svg", '<svg ' + shapeRender)
		// self.svg  = self.svg.replace("<rect", '<rect ' + shapeRender)
		// self.svg  = self.svg.replace("<polygon", '<polygon ' + shapeRender)
		// self.svg = self.svg.replace("<svg",'<svg width="800" height="800"')

		
		// deal with tooltext
		var doToolText = false
		if (doToolText) { // replace name in tooltext
			self.svg  = self.svg.replace(/<title>[^<]*<\/title>/, "<title>" + candidate.id + "</title>")
		} else { // no tooltext
			self.svg  = self.svg.replace(/<title>[^<]*<\/title>/, "")
		}
		
		// parse svg
		var parser = new DOMParser();
		self.svgDoc = parser.parseFromString(self.svg, "text/xml");

		// edit svg Doc
		var root = self.svgDoc.getElementsByTagName("svg")[0]
		root.setAttribute("width", "80");
		root.setAttribute("height", "80");

		// serialize
		var s = new XMLSerializer();
		 self.svg = s.serializeToString(self.svgDoc);

		 root.setAttribute("width", "10");
		 root.setAttribute("height", "10");

		 self.svg_small = s.serializeToString(self.svgDoc);

		// make the image source
		if (1) { // just trying different methods
			self.srcImg = "data:image/svg+xml;base64," + btoa(self.svg);
			// self.srcImg = "data:image/svg+xml;base64," + btoa(self.svg_small);
		} else {
			var svgblob = new Blob([self.svg], {type: 'image/svg+xml'});
			self.srcImg = URL.createObjectURL(svgblob); 
		}
		self.texticon = self.svg
	}
	
	function downloadSVGandMakeImg(cb) {
		// save svg as text
		var svgText
		var request = new XMLHttpRequest();
		request.open("GET", self.url);
		request.setRequestHeader("Content-Type", "image/svg+xml");
		request.onload = function(event) { // onload ... not load
			svgText = event.target.responseText
			processSVG(svgText)
			makeImg()
			cb()
		}
		// request.addEventListener("load", function(event) { // onload ... not load
		// 	svgText = event.target.responseText
		// 	loaded(src,svgText)
		// });
		request.send();

	}

	function makeImg() {
		// is this an svg?
		// img_svg, img_png, img_blob
		
		model.nLoading++

		self.img1 = new Image()
		self.img1.src = self.srcImg // This is either a base64 string of the svg text of a base64 png.. but we'd like to make it a png so it loads faster
		self.img1.onload = function () {
			self.png_b64 = _convertImageToDataURLviaCanvas(self.img1, 'png')
			self.img = new Image()
			if (1) {
				self.img.src = self.png_b64 // base64 png
			} else {
				var bb = self.png_b64.split(',')
				var svgblob = b64toBlob(bb[1], 'image/png');
				self.img.src = URL.createObjectURL(svgblob); 
			}
			self.texticon_png = "<img src='"+self.img.src+"'/>"
			self.img.onload = function () {
				model.nLoading--
				if (model.nLoading == 0) {
					if (candidate.dummy) return
					model.draw()
				}
			}
		}
	}

	function b64toBlob(b64Data, contentType='', sliceSize=512) {
		// str = b64Data
		// str = str + '===' // pad
		// newlen = str.length - str.length % 4 // round
		// str = str.slice(0,newlen) // cut
		// b64Data = str
		const byteCharacters = atob(b64Data);
		const byteArrays = [];
	  
		for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
		  const slice = byteCharacters.slice(offset, offset + sliceSize);
	  
		  const byteNumbers = new Array(slice.length);
		  for (let i = 0; i < slice.length; i++) {
			byteNumbers[i] = slice.charCodeAt(i);
		  }
	  
		  const byteArray = new Uint8Array(byteNumbers);
		  byteArrays.push(byteArray);
		}
	  
		const blob = new Blob(byteArrays, {type: contentType});
		return blob;
	}
	
	function makeNameImage() {
		model.nLoading++
		var nameImage = _convertNameToDataURLviaCanvas(candidate.name,self.fill, '.png')
		self.png_b64 = nameImage.png_b64
		self.widthFracName = nameImage.widthFrac
		self.heightFracName = nameImage.heightFrac
		self.img = new Image()
		self.img.src = self.png_b64 // base64 png
		self.texticon_png = "<img src='"+self.img.src+"'/>"
		self.img.onload = function () {
			model.nLoading--
			if (model.nLoading == 0) {
				if (candidate.dummy) return
				model.draw()
			}
		}	
	}
}