
function Viz(model) {
	// There are four places where drawings go.
	// Viz 
	// Arena
	// Candidates
	// Voters


	var self = this

	var yee = new Yee(model)
	var beatMap = new BeatMap(model)
	var voterMapGPU = new VoterMapGPU(model)
	voterMapGPU.init()
	self.yee = yee
	self.beatMap = beatMap
	self.medianDistViz = new MedianDistViz(model)
	self.lpAssignmentsViz = new LpAssignmentsViz(model)

	self.calculateBeforeElection = function() {
		
		// calculate yee if its turned on and we haven't already calculated it ( we aren't dragging the yee object)
		 if (model.yeeon) {
			 var draggingYeeObject = model.yeeobject != undefined && (model.arena.mouse.dragging === model.yeeobject || model.tarena.mouse.dragging === model.yeeobject)
			 var voterCenterIsYeeObject = model.yeeobject != undefined && model.voterCenter === model.yeeobject
			 var onlyOneVoterGroup = model.voterGroups.length == 1
			 var draggingVoterGroup = (model.arena.mouse.dragging && model.arena.mouse.dragging.isVoter) || (model.tarena.mouse.dragging && model.tarena.mouse.dragging.isVoter)
			 if (draggingYeeObject || (voterCenterIsYeeObject && onlyOneVoterGroup && draggingVoterGroup)) {
				 // dragging the yee object, so no need to recalculate, we can save time...
				 // unless we wanted to calculate one of these:
				 if (model.kindayee == 'newcan') {
					 yee.calculateYee()
				 } 
			 } else {
				 // something caused an update and we aren't dragging the yee object
				 yee.calculateYee()
			 }
		 }

	}

	self.calculateAfterElection = function() {

		if (model.checkDoBeatMap()) {
			beatMap.calculateBeatMap()
		}

		if (model.doVoterMapGPU) {
			voterMapGPU.calculateVoterMapGPU()
		}

	}

	self.drawBackground = function() {

		if (model.yeeon) {
			yee.drawBackgroundYee()
		}

		if (model.checkDoBeatMap()) {
			beatMap.drawBackgroundBeatMap()
		}

		if (model.doVoterMapGPU) {
			voterMapGPU.drawVoterMapGPU()
		}
		
		if (model.doMedianDistViz) {
			self.medianDistViz.drawMedianDistViz()
		}

		model.doLpAssignmentsViz = model.system == "PhragmenMax" || model.system == "equalFacilityLocation" ||  model.system == "PAV"
		if (model.doLpAssignmentsViz) {
			self.lpAssignmentsViz.drawLpAssignmentsViz()
		}
	}

}

function Yee(model) {
	var self = this

	
	var colorNewCan = 'hsl(0,100%,100%)'
	var colorNewCan = 'hsl(0,0%,0%)'
	var colorNewCan = '#ccc'

	self.calculateYee = function(){
		var ctx = model.arena.ctx
		// model.pixelsize= 30.0;
		var pixelsize = model.pixelsize;
		var WIDTH = ctx.canvas.width;
		var HEIGHT = ctx.canvas.height;
		var doArrayWay = model.computeMethod != "ez"
		var doB = (model.dimensions == "1D+B" && (model.kindayee == "newcan" || (model.yeeobject && model.yeeobject.isCandidate)))
		var winners

		// if we are considering a potential candidate, then add it
		var doNewCan = (model.kindayee == "newcan")
		if (doNewCan) {
			var newway = true
			if (newway) {

				model.yeeon = false
				var doDummy = true
				model.arena.plusCandidate.doPlus(doDummy)
				model.yeeon = true
				
				model.initMODEL()
				model.yeeobject = model.candidates[model.candidates.length - 1]
				model.yeeobject.fill = colorNewCan

				model.dm.redistrict()
			} else {
				var nc = new Candidate(model)
				model.candidates.push(nc)
				// CONFIGURE
				// Object.assign( nc,{x:153, y: 95} )
				// , icon:"newdude"
				// INIT
				nc.init()
				nc.icon = "newdude"
				model.initMODEL()
				model.dm.redistrict()
				// UPDATE
				nc.fill = 'hsl(0,100%,100%)'
				model.yeeobject = nc

			}
		}



		if (doArrayWay) { // note that voterCenter is not yet implemented in the array way.  Only if "ez" is selected will the yee diagram work
			// Also note that the broadness representation hasn't been added to this method yet.

			// put candidate information into arrays
			var canAid = [], xc = [], yc = [], fillc = [] //, canA = [], revCan = {} // candidates
			var f=[] // , fA = [], fAid = [], xf = [], yf = [], fillf = [] // frontrunners
			var movethisidx, whichtypetomove
			var i = 0
			for (var can in model.candidatesById) {
				var c = model.candidatesById[can]
				canAid.push(can)
				// canA.push(c)
				// revCan[c] = i
				xc.push(c.x*2) // remember the 2
				yc.push(c.y*2)
				fillc.push(c.fill)
				if (model.preFrontrunnerIds.includes(c.id)) {
					// fAid.push(can)
					// fA.push(c)
					f.push(i)
					// xf.push(c.x*2)
					// yf.push(c.y*2)
					// fillf.push(c.fill) // maybe don't need
				}
				if (model.yeeobject == c){
					movethisidx = i
					whichtypetomove = "candidate"
				}
				i++
			}
			// now we have xc,yc,fillc,xf,yf
			// maybe we don't need fillf, fA, canA, canAid, fAid, but they might help

			// put voter information into arrays
			var av = [], xv = [], yv = [] , vg = [] , xvcenter = [] , yvcenter = []// candidates
			var movethisidx, whichtypetomove
			var i = 0
			for (var vidx in model.voterGroups) {
				var v = model.voterGroups[vidx]
				av.push(v)
				xvcenter.push(v.x*2)
				yvcenter.push(v.y*2)
				if (model.yeeobject == v){
					movethisidx = i
					whichtypetomove = "voter"
				}
				for (var j in v.points) {
					var p = v.points[j]
					xv.push((p[0] + v.x)*2)
					yv.push((p[1] + v.y)*2)
					vg.push(i)
				}
				i++
			}

			if (model.yeeobject == model.voterCenter) { // this is just a workaround until I get around to implementing this in the gpu and js methods of computing the yee diagram
				movethisidx = 0
				whichtypetomove = "voter"
			}

			// now we have xv,yv,
			// we might not need av

			// need to compile yee and decide when to recompile
			// basically the only reason to recompile is when the number of voters or candidates changes
			
			var lv = xv.length
			var lc = xc.length
			model.fastyeesettings = [lc,lv,WIDTH,HEIGHT,pixelsize]
			function arraysEqual(arr1, arr2) {
				arr1 = arr1 || [0]
				arr2 = arr2 || [0]
				if(arr1.length !== arr2.length)
					return false;
				for(var i = arr1.length; i--;) {
					if(arr1[i] !== arr2[i])
						return false;
				}

				return true;
			}
			var recompileyee = !arraysEqual(model.fastyeesettings,model.oldfastyeesettings)
			//(model.fastyeesettings || 0) != (model.oldfastyeesettings || 0))
			model.oldfastyeesettings = model.fastyeesettings
			if (recompileyee) {
				fastyee = createKernelYee(lc,lv,WIDTH,HEIGHT,pixelsize)
			}
			//method = "gpu"
			//method = "js"
			method = model.computeMethod
			winners = fastyee(xc,yc,f,xv,yv,vg,xvcenter,yvcenter,movethisidx,whichtypetomove,method)
			
		}
		model.gridx = [];
		model.gridy = [];
		model.gridl = []; 
		model.gridb = []; 
		saveo = {}


		saveo.x = model.yeeobject.x;
		if (doB) {
			saveo.b = model.yeeobject.b;
		} else {
			saveo.y = model.yeeobject.y;
		}
		if (model.yeeobject == model.voterCenter) {
			var voterso = []
			for(var i=0; i<model.voterGroups.length; i++){
				voterso[i] = {}
				voterso[i].x = model.voterGroups[i].x
				voterso[i].y = model.voterGroups[i].y
			}
		}

		// model.hexgrid
		// make grid

		if (model.theme == "Bees") {
			model.grid = "hexagon"
		} else if (model.dimensions == "1D") {
			model.grid = "linear"
		} else {
			model.grid = "square"
		}
		if (model.grid == "square") { // square grid
			for(var x=.5*pixelsize ; x<=WIDTH; x+= pixelsize) {
				for(var y=.5*pixelsize; y<=HEIGHT; y+= pixelsize) {
					model.gridx.push(x);
					model.gridy.push(y);
				}
			}
		} else if (model.grid == "linear") {
			var y=.5*pixelsize
			for(var x=.5*pixelsize ; x<=WIDTH; x+= pixelsize) {
				model.gridx.push(x);
				model.gridy.push(y);
			}
		} else { // hex grid
			model.gridType = "horizontal hexagon"
			if (model.gridType == "horizontal") {
				var grids = hexgrid(pixelsize, HEIGHT, WIDTH)
				model.gridx = grids.w
				model.gridy = grids.h
			}
			 else if (model.gridType == "vertical") {
				var grids = hexgrid(pixelsize, WIDTH, HEIGHT)
				model.gridx = grids.h
				model.gridy = grids.w
			} else if (model.gridType == "horizontal hexagon") {
				var grids = hexagon_hexgrid(pixelsize, HEIGHT, WIDTH)
				model.gridx = grids.w
				model.gridy = grids.h
			}
			 else if (model.gridType == "vertical hexagon") {
				var grids = hexagon_hexgrid(pixelsize, WIDTH, HEIGHT)
				model.gridx = grids.h
				model.gridy = grids.w
			}
			function hexgrid(pixelsize, HEIGHT, WIDTH) {
				var w = []
				var h = []
				var hexHeight = pixelsize
				var hexWidth = pixelsize * 2/Math.sqrt(3)
				var hexSide = pixelsize * .5
				var row = 0
				for( var y = hexHeight * .5; y + hexHeight <= HEIGHT; y += hexHeight / 2, row++) {
					if (row % 2 == 1) {  
					var offset = (hexWidth - hexSide)/2 + hexSide
					var col = 1
					}  else {
						var offset = 0.0
						var col = 0
					}
					for ( var x=offset + hexWidth*.5; x+hexWidth <= WIDTH; x += hexWidth + hexSide, col += 2) {
						w.push(x);
						h.push(y);
					}
				}
				return {w:w, h:h}
			}
			function hexagon_hexgrid(pixelsize, HEIGHT, WIDTH) {
				var w = []
				var h = []
				var hexHeight = pixelsize
				var hexWidth = pixelsize * 2/Math.sqrt(3)
				var hexSide = pixelsize * .5

				// default is horizontal flat-top Hexagons

				// how many rings of hexagons fit into the total width?
				var numWidth = Math.floor( (WIDTH - hexWidth) / (hexWidth + hexSide) )
				// how many rings of hexagons fit into the total height?
				var numHeight = Math.floor( (HEIGHT - hexHeight) / (2*hexHeight) )

				// how many rings should we make?
				var n = Math.min(numWidth,numHeight)

				var centerX = Math.floor(WIDTH/2)
				var centerY = Math.floor(HEIGHT/2)
				for (var i = -n; i <= n; i++) {
					var iPos = Math.abs(i)
					for (var j = -(2*n-iPos); j <= (2*n-iPos); j+=2) {
						var x = j * hexHeight/2 + centerX
						var y = i * (hexWidth+hexSide) / 2 + centerY
						w.push(x);
						h.push(y);
					}
				}
				return {w:w, h:h}
			}
		}


		// get winners
		for (var i=0; i < model.gridx.length; i++) {
			var x = model.gridx[i]
			var y = model.gridy[i]
			if (doArrayWay) {
				var winner = Math.round(winners[i])
				if (winner > lc) { // we have a set of winners to decode
					//winner = 3 + lc* (2+lc*(4))
					//var decode = function (winner) {
						wl = []
						for (var s = 0; s < lc; s++) {
							if (winner <= lc) {break}
							wl.push(winner % lc)
							winner = Math.floor(winner / lc)
						}
						wl.push(winner)
					//	return wl
					//}
					colorlist = []
					for (w in wl) {colorlist.push(model.candidatesById[canAid[wl[w]] || "square"].fill)}
					model.gridb[i] = colorlist
					var a = "#ccc" // grey is actually a code for "look for more colors"
				} else {
					var a = model.candidatesById[canAid[winner] || "square"].fill
				}
				// if (a == "#ccc") {a = "#ddd"} // hack for now, but will deal with ties later
				model.gridl.push(a);
				continue;
			}
			model.yeeobject.x = x * .5;
			if (doB) {
				model.yeeobject.b = model.arena.bFromY(y * .5)
			} else {
				model.yeeobject.y = y * .5;
			}
			// update positions of all the voters if the voterCenter is the yee object
			if (model.yeeobject == model.voterCenter) {
				var changecenter = {
					x:model.yeeobject.x - saveo.x, 
					y:model.yeeobject.y - saveo.y
				}
				for(var j=0; j<model.voterGroups.length; j++){
					model.voterGroups[j].x = voterso[j].x + changecenter.x
					model.voterGroups[j].y = voterso[j].y + changecenter.y
				}
			}
			if (model.yeeobject.isVoter) {
				model.dm.redistrict()
			}
			if (model.yeeobject.isCandidate) {
				model.dm.redistrictCandidates()
			}
			
			for(var j=0; j<model.voterGroups.length; j++){
				model.voterGroups[j].updatePeople();
			}
			if (model.nDistricts > 1) {


				// put all the results together
				result = {
					colors: []
				}
				for (var k = 0; k < model.nDistricts; k++) {
					result_k = model.election( model.district[k], model, model.optionsForElection );
					if (result) {
						result.colors = [].concat(result.colors , result_k.colors)
					}

				}
				if (result.colors.length > 1) {
					result.color = "#ccc"
				} else {
					result.color = result.colors[0]
				}
			} else {
				var result = model.election(model.district[0], model, {sidebar:false, yeefast:true});
			}


			model.gridl.push(result.color);
			model.gridb.push(result.colors)
			// model.caption.innerHTML = "Calculating " + Math.round(x/WIDTH*100) + "%"; // doesn't work yet 
		}
		model.yeeobject.x = saveo.x;
		if (doB) {
			model.yeeobject.b = saveo.b;
		} else {
			model.yeeobject.y = saveo.y;
		}
		if (model.yeeobject == model.voterCenter) {
			for(var i=0; i<model.voterGroups.length; i++){
				model.voterGroups[i].x = voterso[i].x
				model.voterGroups[i].y = voterso[i].y
			}
		}

		
		if (doNewCan) {
			model.candidates.pop()
			if (newway) {

				model.initMODEL()
			
				// update the GUI
				model.onAddCandidate()

				model.dm.redistrict()
				model.yeeobject = undefined
							
			} else {

				model.dm.redistrict()
				// UPDATE
				// model.update()
	
			}
		}
		for(var voterGroup of model.voterGroups){
			voterGroup.updatePeople()
		}
	}
	
	self.winSeek = function(can) {

		// this function will find the closest point where a candidate wins.

		var temp = {o: model.yeeobject,
			b:model.gridb,
			x:model.gridx,
			y:model.gridy,
			l:model.gridl
		}
		var xMe = can.x
		var yMe = can.y

		// do calculations
		model.yeeobject = can
		self.calculateYee()
		
		// find closest winning point
		var colorMe = can.fill
		var dist
		var minDist = Infinity
		var kGoal
		for(var k=0;k<model.gridl.length;k++) {
			var ca = model.gridl[k]
			var check = false
			if (ca=="#ccc") { // make stripes instead of gray
				var cb = model.gridb[k]
				if (cb.includes(colorMe)) {
					check = true
				}
			} else {
				if (colorMe == ca)
					check = true
			}
			if (check) {
				dist = d2(model.gridx[k]-xMe, model.gridy[k]-yMe)
				if (dist < minDist) {
					minDist = dist
					kGoal = k
				}
			}
		}
		function d2(x,y) {
			return x**2 + y**2
		}

		if(kGoal != undefined) {
			var goal = {
				x:model.gridx[kGoal],
				y:model.gridy[kGoal]
			}
		} else {
			var goal = undefined
		}


		model.yeeobject = temp.o
		model.gridb=temp.b
		model.gridx=temp.x
		model.gridy=temp.y
		model.gridl=temp.l

		return goal
	}

	self.drawBackgroundYee = function() {	
		var arena = model.arena
		var ctx = arena.ctx
		
		if(model.yeeon){
			var temp = ctx.globalAlpha
			ctx.globalAlpha = 1
			ctx.fillStyle = "#fff"
			// ctx.fillStyle = "#ccc"
			// ctx.fillStyle = "#333"
			ctx.fillRect(0,0,ctx.canvas.width,ctx.canvas.height)  // draw a white background
			ctx.fill()
			ctx.globalAlpha = .9
			var pixelsize = model.pixelsize;

			var can_filter_yee = []
			for(var id in model.yeefilter) {
				if (model.yeefilter[id]) {
					can_filter_yee.push(id)
				}
			}
			var method_1 = (Election.stv == model.election) || (Election.rrv == model.election)  // two methods for filtering colors in the yee diagram
			if (method_1) {
				color_filter_yee = can_filter_yee.map(x => model.candidatesById[x].fill)
				if (model.kindayee=='newcan') color_filter_yee.push(colorNewCan)
			} else {
				translate = {}
				for(can in model.candidatesById) {
					var colorcan = model.candidatesById[can].fill
					translate[colorcan] = can_filter_yee.includes(can) ? colorcan : 'white'
				}
				if (model.kindayee=='newcan') translate[colorNewCan] = colorNewCan
			}
			var HEIGHT = ctx.canvas.height
			
			for(var k=0;k<model.gridx.length;k++) {
				var ca = model.gridl[k]
				
				if (ca=="#ccc" && model.computeMethod != "gpu" && model.computeMethod != "js") { // make stripes instead of gray // I'm not sure why this part didn't work for the other compute methods
					var cb = model.gridb[k]
					if (method_1) {
						cb = cb.filter(function(x) {return color_filter_yee.includes(x)} )// filter the colors so that only the selected colors are displayed
						if (cb.length == 0) cb = ['white']
					} else {
						cb = cb.map(x => translate[x])
					}
					var xb = model.gridx[k]-pixelsize*.5
					var yb = model.gridy[k]-pixelsize*.5
					var wb = pixelsize
					var hb = pixelsize
					var hh = pixelsize / 6; // height of stripe // used to be 5
					var numstripes = pixelsize/hh
					if (model.grid == "linear") numstripes = HEIGHT / hh
					for (var j=0; j< numstripes; j++) {
						ctx.fillStyle = cb[j % cb.length]
						ctx.fillRect(xb,yb+j*hh,wb,hh);
					}
				} else {
					if (method_1) {
						if (color_filter_yee.includes(ca)) {
							ctx.fillStyle = ca;
						} else {
							ctx.fillStyle = 'white';
						}	
					} else {
						ctx.fillStyle = translate[ca]
					}
					if (model.grid == "square") {
						ctx.fillRect(model.gridx[k]-pixelsize*.5, model.gridy[k]-pixelsize*.5, pixelsize, pixelsize);
					} else if (model.grid == "linear") {
						ctx.fillRect(model.gridx[k]-pixelsize*.5, 0, pixelsize, HEIGHT);
					} else {
						// var size = pixelsize / Math.sqrt(3)
						var size = pixelsize / 2
						var x = model.gridx[k]
						var y = model.gridy[k]
						self.drawHexagon(x,y,size,ctx)
					}
				}
			}
			ctx.globalAlpha = temp
			// Draw axes
			//var background = new Image();
			//background.src = "../play/img/axis.png";
			// ctx.drawImage(background,0,0);  // eh, I don't like the axis.
		}

	}

	self.drawHexagon = function(x,y,size,ctx) {
		ctx.beginPath();
		ctx.moveTo(x + size * Math.cos(0), y + size * Math.sin(0));

		for (var side = 0.5; side < 7.5; side++) {
			ctx.lineTo(x + size * Math.cos(side * 2 * Math.PI / 6), y + size * Math.sin(side * 2 * Math.PI / 6));
		}
		// ctx.fillStyle = fill;
		ctx.fill();
	}

	self.drawYeeGuyBackground = function(x,y,ctx){
		
		// put circle behind yee candidate
		if(model.yeeon){
			ctx.beginPath();
			ctx.arc(x, y, 60, 0, Math.TAU, true);
			ctx.strokeStyle = "white";
			ctx.lineWidth = 8;
			ctx.fillStyle = 'white';
			var temp = ctx.globalAlpha
			ctx.globalAlpha = 0.3
			ctx.fill();
			ctx.stroke();
			ctx.globalAlpha = temp
		}
	}
	
	self.drawYeeAnnotation = function(x,y,ctx) {
		
		// make the candidate that is moving say "yee-yee!"
		if(model.yeeon){
			ctx.textAlign = "center";
			var temp = ctx.globalAlpha
			ctx.globalAlpha = 0.9
			_drawStroked("yee-yee!",x,y+50,40,ctx);
			var dot = 3
			ctx.fillStyle = "#000"
			ctx.fillRect(x-dot-1,y-dot-1,dot*2+2,dot*2+2);
			ctx.fillStyle = "#fff"
			ctx.fillRect(x-dot,y-dot,dot*2,dot*2);
			ctx.globalAlpha = temp
		}
	}

}



function BeatMap(model) {
	var self = this

	// calculate Condorcet decision boundaries

	// calculate medians in all directions
	// detail: even number
	// detail: counterclockwise
	
	// calculate winner circle against each candidate
	
	// The data is a list of points that connect to form a circle.  This is calcualted per candidate.


	self.calculateBeatMap = function() {
		// calculate medians

		var median = function(values) {

			values.sort( function(a,b) {return a - b;} );
		
			var half = Math.floor(values.length/2);
		
			if(values.length % 2)
				return values[half];
			else
				return (values[half-1] + values[half]) / 2.0;
		}
		xvals = []
		yvals = []
		for(i=0; i<model.voterGroups.length; i++){
			voter = model.voterGroups[i]
			for(m=0; m<voter.points.length; m++) {
				point = voter.points[m]
				xvals.push(point[0]+voter.x)
				yvals.push(point[1]+voter.y)
			}
		}
		var xCenter = model.voterCenter.x
		var yCenter = model.voterCenter.y
		var medians = []
		var angles = []
		var xMedians = []
		var yMedians = []
		var xCenteredMedians = []
		var yCenteredMedians = []

		beatCircle = {}
		beatCircle.x = {}
		beatCircle.y = {}
		for( var j = 0; j < model.candidates.length; j++) {
			var can = model.candidates[j]
			beatCircle.x[can.id] = []
			beatCircle.y[can.id] = []
		}

		for (var angle = 0; angle <= 180; angle+= .5) {
			angles.push(angle)
			var angleR = angle * Math.PI / 180
			var s = Math.sin(angleR)
			var c = Math.cos(angleR)
			var dot = []
			for( var j = 0; j < xvals.length; j++) {
				x = xvals[j]
				y = yvals[j]
				dot.push( c * x + s * y)
			}
			var m = median(dot)
			medians.push(m)

		// for (var i = 0; i < angles.length; i++) {
			// calculate medians diagram
			// median point 
			var xMedian = m * c
			var yMedian = m * s				
			// perpendicular is (s, -c)
			// project center along perpendicular (perp dot center)
			var proj = s * xCenter - c * yCenter
			// calculate change vector
			var xChange = proj * s
			var yChange = proj * -c
			// add projected length to the median point
			var xCenteredMedian = xMedian + xChange
			var yCenteredMedian = yMedian + yChange
			xMedians.push(xMedian)
			yMedians.push(yMedian)
			xCenteredMedians.push(xCenteredMedian)
			yCenteredMedians.push(yCenteredMedian)

			// calculate beat circles
			for( var j = 0; j < model.candidates.length; j++) {
				var can = model.candidates[j]
				if (0) {
					var xMove = (m * c - can.x) * 2 
					var yMove = (m * c - can.y) * 2 
				} else {
					var canProj = c * can.x + s * can.y
					var xMove = (m - canProj) * c * 2
					var yMove = (m - canProj) * s * 2
				}
				beatCircle.x[can.id].push(can.x + xMove)
				beatCircle.y[can.id].push(can.y + yMove)
			}
		}
		model.beatCircle = beatCircle
		return
	}

	self.drawBackgroundBeatMap = function () {
		var arena = model.arena
		var ctx = arena.ctx
		var temp = ctx.globalAlpha
		var tempComposite = ctx.globalCompositeOperation
		var tempLinewidth = ctx.lineWidth

		// ctx.globalAlpha = 1
		// ctx.fillStyle = "#fff"
		// ctx.fillRect(0,0,ctx.canvas.width,ctx.canvas.height)  // draw a white background
		// ctx.fill()

		var can_filter_yee = []
		for(var id in model.yeefilter) {
			if (model.yeefilter[id]) {
				can_filter_yee.push(id)
			}
		}



		ctx.globalAlpha = .3
		

		// draw the beatcircles
		ctx.globalCompositeOperation = "multiply"
		// ctx.globalCompositeOperation = "screen"
		// ctx.globalCompositeOperation = "overlay"
		// ctx.globalCompositeOperation = "hue"
		// ctx.globalCompositeOperation = "lighter"
		// ctx.globalCompositeOperation = "darker" // compatibility issues
		// ctx.globalCompositeOperation = "lighten"
		// ctx.globalCompositeOperation = "darken"
		
		ctx.lineWidth = 1

		for (var i = 0; i < can_filter_yee.length; i++) {
			var cid = can_filter_yee[i]
			x = model.beatCircle.x[cid]
			y = model.beatCircle.y[cid]
			var bc = new Path2D()
			
			bc.moveTo(x[0]*2,y[0]*2)
			for (var j=1; j < x.length; j++) {
				bc.lineTo(x[j]*2,y[j]*2)
			}
			var fillCircle = true
			if (fillCircle) {
				bc.rect(0,0,ctx.canvas.width,ctx.canvas.height)
				ctx.fillStyle = model.candidatesById[cid].fill;
				ctx.closePath()
				ctx.fill(bc,"evenodd")
				if (1) {
					ctx.strokeStyle = model.candidatesById[cid].fill;
					ctx.stroke(bc)
				}
			} else {
				// ctx.lineWidth = 8;
				ctx.strokeStyle = model.candidatesById[cid].fill;
				ctx.stroke(bc)

			}
		}
		ctx.globalCompositeOperation = tempComposite
		ctx.globalAlpha = temp
	}
}

VoterMapGPU = function(model) {
	var self = this
	var backup = false
	self.init = function(){
		
		self.canvasGPU = document.createElement('canvas')
		if (backup) return
		
		var ProcessorType = "gpu"
		self.gpu = new GPU({
			processor: ProcessorType,
			canvas: self.canvasGPU,
		});

		self.oldNumValues = undefined
		
		// document.body.appendChild(self.canvasGPU);
		// var width = model.size
		// var height = model.size
		// canvasGPU.width = width*2;
		// canvasGPU.height = height*2;
		// canvasGPU.style.width = width+"px";
		// canvasGPU.style.height = height+"px";

	}
	self.calculateVoterMapGPU = function() {
	// 	self.flag = true // flag to do calculation
	// 	self.renderGPU()
	// }
	// self.renderGPU = function() {
	// 	if (self.flag = false) return
	// 	self.flag = false

		if (model.ballotType == "Plurality" || model.system == "IRV" || model.system == "STV") return
		if (model.voterSet.totalVoters == 0) return
		if (model.voterSet.allVoters[0].stages[model.stage].ballot == undefined) return

		// need some calculations
		for(var voterGroup of model.voterGroups) {
			for(var voterPerson of voterGroup.voterPeople){
				voterGroup.voterModel.drawMap(model.arena.ctx, voterPerson)
			}
		}
		
		// required to be constant to compile kernel, I think
		var numVoters = model.voterSet.totalVoters

		var width = model.size * 2
		var height = model.size * 2

		var xpos1 = model.voterSet.getArrayAttr('x')
		var ypos1 = model.voterSet.getArrayAttr('y')
		var rad1 = model.voterSet.getArrayAttr('rad')
		var idxCan1 = model.voterSet.getArrayAttr('idxCan')

		// for multiple radii per voter
		var xpos = []
		var ypos = []
		var rad = []
		var idxCan = []
		for (var i = 0; i < numVoters; i++) {
			for (var k = 0; k < rad1[i].length; k++) {
				xpos.push(xpos1[i])
				ypos.push(ypos1[i])
				rad.push(rad1[i][k])
				idxCan.push(idxCan1[i][k])
			}
		}

		var numCircles = rad1[0].length
		var numValues = numVoters * numCircles
		var numValues = xpos.length


		// candidate color list
		var colors = []
		for (var i = 0; i < model.candidates.length; i++) {
			colors.push(model.candidates[i].fill)
		}
		if (model.ballotType == "Score" || model.ballotType == "Approval" || model.ballotType == "Three" || model.system == "Borda") {
			colors[0] = "#000"
		}
		colorData = getColorScale(colors) // just a list of colors in an array
		
		if (backup) {
			doBackup()
			return
		}

		var changedVotingModel = false
		var changedNumValues = (numValues != self.oldNumValues)

		if (changedVotingModel || changedNumValues) {
			Acompile()
			self.oldNumValues = numValues
		}
		self.render(
			xpos,
			ypos,
			idxCan,
			colorData,
			rad,
		);

			
		function Acompile() {
			var theKernel = function (
				xpos,
				ypos,
				idxCan,
				colorData,
				rad,
			) {
				var dist = 0;
				var r = 0.0;
				var g = 0.0;
				var b = 0.0;
			
				for (var i = 0; i < this.constants.numPoints; i++) {
					var x = this.thread.x - xpos[i] * 2,
						y = this.thread.y - ( 600 - ypos[i] * 2);
			
					dist = Math.sqrt(x * x + y * y);
			
					if (dist > rad[i] * 2) { 
			
						var c = idxCan[i]

						r = r + (colorData[c * 4] / 255) **2  / this.constants.numPoints;
						g = g + (colorData[1 + c * 4] / 255) **2  / this.constants.numPoints;
						b = b + (colorData[2 + c * 4] / 255) **2  / this.constants.numPoints;
					} else { // white
						r = r + 1 / this.constants.numPoints;
						g = g + 1 / this.constants.numPoints;
						b = b + 1 / this.constants.numPoints;
					}
					this.color(Math.sqrt(r),Math.sqrt(g),Math.sqrt(b),1)
					
				}
			}

			self.render =  self.gpu.createKernel(theKernel)
				.setConstants({
					numPoints: numValues
				})
				.setOutput([width, height])
				.setGraphical(true);
		}
		function Bcompile() {
			var c1 = 1/numValues
			var c2 = 1/255**2 /numValues
			var theKernel = function (
				xpos,
				ypos,
				idxCan,
				colorData,
				rad,
			) {
				// var sum = this.vec4(0,0,0,1) // maybe
				var r = 0.0;
				var g = 0.0;
				var b = 0.0;
			
				for (var i = 0; i < this.constants.numPoints; i++) {
					var x = this.thread.x - xpos[i] * 2,
						y = this.thread.y - ( 600 - ypos[i] * 2);
			
					if (x * x + y * y > (rad[i] * 2)**2 ) { 
			
						var c = idxCan[i]

						r += this.constants.c2 * colorData[c * 4] ** 2
						g += this.constants.c2 * colorData[1 + c * 4] ** 2
						b += this.constants.c2 * colorData[2 + c * 4] ** 2
					} else { // white
						r += this.constants.c1
						g += this.constants.c1
						b += this.constants.c1
					}
					
				}
				this.color(Math.sqrt(r),Math.sqrt(g),Math.sqrt(b))
			
			}
			self.render =  self.gpu.createKernel(theKernel)
				.setConstants({
					numPoints: numValues,
					c1: c1,
					c2: c2,
				})
				.setOutput([width, height])
				.setGraphical(true);

		}
		function doBackup () {
			// doesn't work because rgb values are too small
			// transparency values are too small too I guess
			
			self.canvasGPU.width = width
			self.canvasGPU.height = height
			var ctx = self.canvasGPU.getContext('2d')
			ctx.save()
			ctx.fillStyle = "black"
			ctx.fillRect(0,0,width,height)
			ctx.globalCompositeOperation = "source-over"
			var c1 = 1/numValues
			// var c2 = 1/255**2 /numValues
			var c2 = 1/255 /numValues
			ctx.globalAlpha = c1
			var insideColor = 'white'
			// var insideColor = `rgba(${c1},${c1},${c1},1)`
			for (var i = 0; i < numValues; i++) {
				
				// outside color
				var c = idxCan[i]
				ctx.fillStyle = colors[c]
				// r2 = c2 * colorData[c * 4] ** 2
				// g2 = c2 * colorData[1 + c * 4] ** 2
				// b2 = c2 * colorData[2 + c * 4] ** 2
				// r2 = c2 * colorData[c * 4]
				// g2 = c2 * colorData[1 + c * 4]
				// b2 = c2 * colorData[2 + c * 4]
				// ctx.fillStyle = `rgba(${r2},${g2},${b2},1)`
				ctx.beginPath()
				ctx.arc(xpos[i]*2, ypos[i]*2, rad[i]*2, 0, Math.TAU, false)
				ctx.rect(0,0,width,height)
				ctx.closePath()
				ctx.fill('evenodd')
				// inside color
				ctx.fillStyle = insideColor
				ctx.beginPath()
				ctx.arc(xpos[i]*2, ypos[i]*2, rad[i]*2, 0, Math.TAU, false)
				ctx.closePath()
				ctx.fill()
				
			}
			ctx.restore()
		}
	}
	
	self.drawVoterMapGPU = function () {
		// self.renderGPU() // only runs if update was called (flag)

		var arena = model.arena
		var ctx = arena.ctx
		ctx.save()

		ctx.globalAlpha = .8
		ctx.drawImage(self.canvasGPU, 0, 0);

		ctx.restore()

	}
	
	var getColorScale = function (colors) {
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
		// return contextColorScale.getImageData(0, 0, colors.length-1, 1).data;
	}

}

function MedianDistViz(model) {
	var self = this
	self.drawMedianDistViz = function() {

		var median = function(values) {

			values.sort( function(a,b) {return a - b;} );
		
			var half = Math.floor(values.length/2);
		
			if(values.length % 2)
				return values[half];
			else
				return (values[half-1] + values[half]) / 2.0;
		}

		for (var district of model.district) {
				
			let cans = district.stages[model.stage].candidates
			if (model.stage == "primary") {
				cans = district.parties[voterPerson.iParty].candidates
			}

			if ( model.dimensions == "2D") {
				var voterPeople = district.voterPeople
				var distancemeasure = (xd,yd) => Math.sqrt(xd*xd+yd*yd)
				var guess = meanPeople(voterPeople)
				var median = numericApproxGeometricMedian(voterPeople, guess, distancemeasure)

				var ctx = model.arena.ctx
				ctx.save()
				ctx.globalAlpha = .5
				ctx.globalCompositeOperation = "multiply"
				for (var c of cans) {
					doDraw2(c)
				}
				ctx.globalAlpha = 1
				median.fill = "#ccc"
				doDraw2(median)
				ctx.restore()
	
				function doDraw2(c) {
					for (var voterPerson of voterPeople) {
						ctx.beginPath();
						ctx.moveTo(voterPerson.x*2,voterPerson.y*2)
						ctx.lineTo(c.x*2,c.y*2)
						ctx.lineWidth = 10
						ctx.strokeStyle = c.fill;
						ctx.stroke();
					}
				}


			} else if( model.dimensions == "1D") {
				xvals = []
				for (var voterPerson of district.voterPeople) {
	
					xvals.push(voterPerson.x)
				}
				var xmed = median(xvals)
				var scaley = 100 / xvals.length
				var widthy = 100 / xvals.length
				var ctx = model.arena.ctx
				ctx.save()
				ctx.globalAlpha = .5
				ctx.globalCompositeOperation = "multiply"
				for (var c of cans) {
					doDraw(c)
				}
				ctx.globalAlpha = 1
				doDraw({x:xmed,fill:"#ccc"})
				ctx.restore();
	
				function doDraw(c) {
					for (var i = 0; i < xvals.length; i++) {
						var x = xvals[i]
						var y = i * scaley + 150
						ctx.beginPath();
						ctx.moveTo(x*2,y*2)
						ctx.lineTo(c.x*2,y*2)
						ctx.lineWidth = widthy
						ctx.strokeStyle = c.fill;
						ctx.stroke();
					}
				}
				
			}
		}
	}
}


function meanPeople(voterPeople) {
	var x = 0
	var y = 0
	for(var voterPerson of voterPeople){
		x += voterPerson.x
		y += voterPerson.y
	}
	var totalnumbervoters = voterPeople.length
	x/=totalnumbervoters
	y/=totalnumbervoters
	return {x:x, y:y}
}

function LpAssignmentsViz(model) {
	var self = this
	self.drawLpAssignmentsViz = function() {
		for (var district of model.district) {

			var a = district.stages[model.stage].assignments
			
			drawA(a,district)

		}
	}

	function drawA(a,district) {
		var ctx = model.arena.ctx
		ctx.save()
		var cans = district.stages[model.stage].candidates
		for (var i = 0; i < a.length; i++) {
			var x = district.voterPeople[i].x
			var y = district.voterPeople[i].y
			for (var k = 0; k < a[0].length; k++) {
				var assign = a[i][k]

				if (assign) {
					// if we draw it
					ctx.globalAlpha = assign

					var c = cans[k]
					
					ctx.beginPath();
					ctx.moveTo(x*2,y*2)
					ctx.lineTo(c.x*2,c.y*2)
					ctx.lineWidth = 4
					ctx.strokeStyle = c.fill;
					ctx.stroke();
				}
			}

		}
		ctx.restore()
	}

}