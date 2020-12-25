/***************************

A MODEL:
- Draggable candidates & voter(s)
- Has to draw & up 'em up & down appropriately.

***************************/

function Model(idModel){

	var self = this;

	// CREATE DATA STRUCTURE
	self.voterGroups = [];
	self.voterSet = new VoterSet(self)
	self.district = []
	self.dm = new DistrictManager(self)
	self.candidates = [];
	self.dom = document.createElement("div");
	self.arena = new Arena("arena",self)
	self.tarena = new Arena("tarena",self)
	self.nLoading = 0 // counter for drawing after everything is loaded
	// the only thing to be done after loading the images is drawing the images
	
	// CONFIGURE DEFAULTS
	// helper
	var all_candidate_names = Object.keys(Candidate.graphicsByIcon["Default"])
	var yes_all_candidates = {}
    for (var i = 0; i < all_candidate_names.length; i++) {
        var a = all_candidate_names[i]
        yes_all_candidates[a] = true
    }
	Object.assign(self,{
		// values used in init
		id:idModel,
		size:300,
		scale:1,
		border:10,
		optionsForElection:{sidebar:true},
	// values used later
	// defaults that are also in main_sandbox.js in the cleanConfig function
		system: "FPTP",
		rbsystem: "Tideman",
		numOfCandidates: 3,
		spread_factor_voters: 1,
		arena_size: 300,
		median_mean: 1,
		utility_shape: "linear",
		dimensions: "2D",
		nDistricts: 1,
        colorChooser: "pick and generate",
        colorSpace: "hsluv with dark",
		arena_border: 2,
		preFrontrunnerIds: ["square","triangle"],
		autoPoll: "Manual",
		// primaries: "No",
		firstStrategy: "zero strategy. judge on an absolute scale.", // maybe should be for voter, not model
		secondStrategy: "zero strategy. judge on an absolute scale.", // maybe should be for voter, not model
		doTwoStrategies: true,// maybe should be for voter, not model
        yeefilter: yes_all_candidates,
		computeMethod: "ez",
		pixelsize: 60,
		//
		nVoterGroupsRealName: "Single Voter",
		yeeobject: undefined,
		yeeon: false,		
		//
		// VoterType: PluralityVoter,
		election: Election.plurality,
		BallotType: PluralityBallot,
		ballotType: "Plurality",
		rbelection: rbvote.calctide,
		opt: {
			irv100: true, // show the final transfer to the winner (to reach 100%)
			IRVShowdown: false,  // show a reverse-direction transfer to represent the winner
			showIRVTransfers: true,  // show lines representing transfers between rounds
			breakWinTiesMultiSeat: true, // break ties for winning candidates in multi-winner methods
			breakEliminationTiesIRV: true // break ties for eliminations of candidates in IRV
		},
		ballotVis: true, // turn on or off the visuals that show where the ballots go
		visSingleBallotsOnly: false, // only show the single ballots as part of the ballotVis
		beatMap: "auto",
        keyyee: "newcan",
        kindayee: "newcan",
        ballotConcept: "auto",
        roundChart: "auto",
		voterIcons: "circle",
		voterCenterIcons: "off",
		candidateIconsSet: ["image","note"],
		placeHoldDuringElection: false,
		doPlaceHoldDuringElection: true,
		pairwiseMinimaps: "off",
		doTextBallots: false,
		behavior:"stand",
		showVoters:true,
		showToolbar: "off",
		rankedVizBoundary: "atWinner",
		useBeatMapForRankedBallotViz: false,
		doMedianDistViz: false,
		drawSliceMethod: "circleNicky", // "circleBunch" or "old"
		allCan: false,
		useBorderColor: true,
		pairOrderByCandidate: true,
		squareFirstChoice: true, 
		doVoterMapGPU: false,
		devOverrideShowAllFeatures: false,
		doElectabilityPolls: true,
		partyRule: 'crowd',
		stage: "general",
		showPowerChart: true,
		centerPollThreshold: .5,
		howBadlyDefeatedThreshold: 1.1,
		doTallyChart: true,
        codeEditorText: Election.defaultCodeScore,
		createStrategyType: "score",
		createBallotType: "Score",
		showUtilityChart: false,
		enableTArena: false,
	})
	
	self.viz = new Viz(self);
	
	self.createDOM = function() {
		self.arena.createDOM()
		self.tarena.createDOM()
		self.tarena.canvas.hidden = true

		// My DOM: title + canvas + caption
		self.dom = document.createElement("div");
		self.dom.setAttribute("class", "model");
		self.title = document.createElement("div");
		self.title.id = "title";
		self.caption = document.createElement("div");
		self.caption.id = "caption";

		self.dom.appendChild(self.title);
		self.dom.appendChild(self.arena.canvas);
		self.dom.appendChild(self.tarena.canvas);
		self.dom.appendChild(self.caption);
	}

	self.initDOM = function() {
		self.arena.initDOM()
		self.tarena.initDOM()
		
		self.dom.style.width = (self.size+2*self.border)+"px"; // size+2*borders!
		// self.caption.style.width = self.dom.style.width;
	}

	self.initMODEL = function() {

		self.arena.initARENA()
		self.tarena.initARENA()
		
		self.candidatesById = {};
		self.candidatesBySerial = {};
		for (var i=0; i<self.candidates.length; i++) {
			var c = self.candidates[i]
			c.i = i
			self.candidatesById[c.id] = c;
			self.candidatesBySerial[c.serial] = c;
		}

		self.yeefilter = {}
		for (var c of self.candidates) {
			self.yeefilter[c.id] = true
		}


		var expYeeObject = function() {
			// Yee diagram
			if ( ! self.yeeon) {
				return undefined
			} else if (self.kindayee == "can") {
				return self.candidatesById[self.keyyee]
			} else if (self.kindayee=="voter") {
				return self.voterGroups[self.keyyee]
			} else if (self.kindayee=="center") { 
				return self.voterCenter
			} else if (self.kindayee=="newcan") { 
				return undefined
			} else { // if yeeobject is not defined
				return undefined
			}
		}
		self.yeeobject = expYeeObject()
		self.onInitModel()
	}
	self.onInitModel = function() {} // a hook for a caller

	self.election = function(){
		self.stage = "general"
		for (let district of self.district) {
			district.stages = {}
			district.stages["general"] = {candidates: district.candidates }
			self.updateDistrictBallots(district)
		}
	};

	self.initPlugin = function(){  // TO IMPLEMENT FURTHER IN CALLER
		self.initMODEL() // replace this with more
	};

	// Reset!
	self.reset = function(){
		// RE-CREATE DATA STRUCTURE
		self.candidates = [];
		self.voterGroups = [];
		// START - combination of CREATE, CONFIGURE, INIT, UPDATE
		self.initPlugin();
	};

	// Update!
	self.onUpdate = function(){}; // TO IMPLEMENT
	self.getSortedVoters = function() {
		var v = self.voterSet.getVoterArray()
		var x = v.map( (d,i) => v[self.orderOfVoters[i]] )
		return x
	}
	self.onDrop = function() {
		if (self.showToolbar == "on") {
			if (self.arena.trashes.overTrash) {
				self.arena.trashes.tossInTrash()
			}
		}
	}

	self.onAddCandidate = function() {} // callback
	self.update = function(){

		
        if (self.checkRunTextBallots() && self.textBallotInput !== "" ){ // TODO: make text ballots work for every method, so we don't have to do this step and we can 
			self.textBallotUpdate()
			return
		}

		// if (self.nLoading > 0) return // the loading function will call update()

		// update positions of draggables
		self.arena.update();
		self.tarena.update();
		
		// update the position of the voter center
		if (typeof self.voterCenter !== 'undefined') { // does the voterCenter exist?  If so then calculate it.
			self.voterCenter.update()
		}

		// do an analysis kind of election
		if (self.votersAsCandidates) {
			self.updateVC()
			self.votersAsCandidates = false
		}		

		// get the ballots for this election
		for(var i=0; i<self.voterGroups.length; i++){
			var voter = self.voterGroups[i];
			voter.updatePeople();
		}
		
		self.viz.calculateBeforeElection()


		for(var i=0; i<self.candidates.length; i++){
			var c = self.candidates[i];
			c.update(); // doesn't do anything... yet
		}
		 
		// did we manually select the winners? (with ctrl-click)
		var selected = self.selection()
		
		if (selected.winners.length > 0) {
			self.result = selected
			if (self.doTop2) self.result.theTop2 = selected
			self.updateBallots()
		} else {
			self.doTheElection()
		}
		
		self.sortVoters()
		
		self.viz.calculateAfterElection()
		 
		self.draw()

		// Update!
		self.onUpdate();
		publish(self.id+"-update");

	};


	self.updateFromModel = function() {} // hook

	self.onDraw = function(){}; // TO IMPLEMENT
	self.draw = function() {
		
		if (self.nLoading > 0) return // still loading, will call later and save some computing cycles
		// The drawing system and the loading assets system are connected here.

		if (self.checkRunTextBallots()) {
			self.arena.canvas.hidden = true
			self.drawSidebar() 
			return
		} else {
			self.arena.canvas.hidden = false
		}

		// three things need to be drawn.  The arenas, the sidebar, and maybe more, like the main_sandbox or the main_ballot or whatever else calls new Model
		self.drawArenas()
		self.drawSidebar()
		self.onDraw()
	}

	self.textBallotUpdate = function() {
		// run an election with RBVote
		if (self.system === "RBVote") {
			self.result = self.election(self.district[0] ,self,self.optionsForElection)
			self.district[0].result = self.result
			self.drawSidebar()
		}
		// self.onDraw()
		// self.onUpdate()
		publish(self.id+"-update");
		return
	}

	self.sortVoters = function() {

		if (self.checkDoSort()) // find order of voters
		{
			var v = self.voterSet.getVoterArray()
			for (var i = 0; i < v.length; i++) {
				v[i].i = i
			}
			// if (self.system == "STV") {
			// 	for (var voter of v) {
			// 		var newb = []
			// 		for (var [r,c] of Object.entries(voter.b)) {
			// 			newb[c] = r
			// 		}
			// 		voter.b = newb
			// 	}
			// }
			if (self.ballotType == "Ranked") {
				var iList = self.candidates.map( x => x.i)
				for (var i = 0; i < v.length; i++) {
					v[i].b = pairList(v[i].b,iList)
				}
			}
			if (v.length > 0) {
				if (self.dimensions == "1D+B" || self.dimensions == "1D") {
					// easy sort in 1D
					var m = v.map( function(d, i) {	return { i: i, d: d }; } ) // add an index to each voter
					m.sort(function(a,b){return a.d.x - b.d.x}) // sort voters
					self.orderOfVoters = m.map( a => a.i) // get original indices of sorted voters
				} else { 
					// 2D
					var draggingSomething = (self.arena.mouse.dragging || self.tarena.mouse.dragging)
					var changedNumVoters = (self.orderOfVoters != undefined) && (self.orderOfVoters.length != v.length)
					if (changedNumVoters || !draggingSomething ) {
						var algorithmForTSP = 4
						if (algorithmForTSP == 4) { // fast way
							var out = clusterTheVoters(v,{sortCluster:false,sortAll:false})
							var order = out.map(x => x.i)
						} else if (algorithmForTSP == 3) {
								var out = clusterTheVoters(v,{sortCluster:true,sortAll:true})
								var order = out.map(x => x.i)
						} else if (algorithmForTSP == 2) {
							
							if (v.length > 2) {
								var out = order_by_distance(v,nodeDist2, {crossover: true, points: true})
							} else {
								var out = v
							}
							var order = out.map(x => x.i)
						} else {
							var tsp = new TravelingSalesman(); 
							tsp.runOnSet(v)
							var order = tsp.getOrder()
						}
						self.orderOfVoters = order
	
					}
				}
			}
		}
		
	}
	
	// helpers for the immediately above code for self.sortVoters
	function pairList(b,iList) {
		var p = []
		for (var i = 0; i < b.length; i++ ) {
			p[b[i]] = []
			for (var j = 0; j < i; j ++) {
				var weight = b.length - j // set to 1 maybe
				var weight = 1
				p[b[i]][b[j]] = weight // set all beats to 1
			}
		}
		var pairs = []
		for (var m = 0; m < iList.length; m++ ) {
			var i = iList[m]
			for (var n = 0; n < iList.length; n ++) {
				var j = iList[n]
				if (p[i] && p[i][j]) {
					pairs.push(p[i][j])
				} else {
					pairs.push(0)
				}
			}
		}
		return pairs
		
	}
	function clusterTheVoters(v,opt) {
		// basically, we're creating clusters based only on the ballots, not the voter positions.
		// Then we're sorting the center of each cluster by it's similarity in ballot and in position to other clusters.
		// Also, there is no sorting within the clusters.

		opt = opt || {}

		// identify clusters
		var clusters = {}
		var clusterNames = []
		for (var i = 0; i < v.length; i++ ) {
			var clusterName = JSON.stringify(v[i].b)
			if (clusters[clusterName] == undefined) {
				clusters[clusterName] = []
				clusterNames.push(clusterName)
			}
			clusters[clusterName].push(v[i])
		}
		// find center of clusters
		clusterPositions = []
		for (var i = 0; i < clusterNames.length; i++) {
			var clusterName = clusterNames[i]
			var cluster = clusters[clusterName]
			var avgx = cluster.map( a => a.x).reduce( (a,b) => a + b) / cluster.length // average voter positions
			var avgy = cluster.map( a => a.y).reduce( (a,b) => a + b) / cluster.length // average voter positions
			clusterPositions.push( {x:avgx , y:avgy, i:i, b:cluster[0].b})
		}
		// tsp on cluster positions
		var sortedClusterPositions = order_by_distance(clusterPositions,nodeDist2,{crossover: true, points: true})
		var clusterOrder = sortedClusterPositions.map( x => x.i)
		// clustered voters
		var clusteredVoters = []
		for ( var i = 0; i < clusterOrder.length; i++) {
			var index = clusterOrder[i]
			var clusterName = clusterNames[index]
			var cluster = clusters[clusterName]
			if (opt.sortCluster && cluster.length > 2) {
				cluster = order_by_distance(cluster, dist2xy)
			}
			for ( var k = 0; k < cluster.length; k++) {
				clusteredVoters.push(cluster[k])
			}
		}
		if (opt.sortAll) {
			crosssOverAndPoints(clusteredVoters, nodeDist2, {crossover: true, points: true})
		}
		return clusteredVoters
	}
	function nodeDist2(m,n) {
		var bWeight = 739
		return (m.x - n.x) ** 2 + (m.y - n.y) ** 2 + euclidian2(m.b, n.b) * bWeight * bWeight
	}
	function euclidian2(a, b) {
	  return a.map((_, i) => (a[i] - b[i]) ** 2).reduce((a, b) => a + b); // sum of squares of differences
	}
	function dist2xy(a,b) {
		return (a.x - b.x) ** 2 + (a.y - b.y) ** 2
	}

	self.selection = function() {
		var selected = {}
		selected.winners = []
		selected.colors = []
		for (var i=0; i < self.candidates.length; i++) {
			var c = self.candidates[i]
			if (c.selected) {
				selected.winners.push(c.id)
				selected.colors.push(c.fill)
			}
		}
		if (selected.winners.length == 1) {
			selected.winner = selected.winners[0]
			selected.color = selected.colors[0]
		} else if (selected.winners.length > 1) {
			selected.winner = selected.winners[0]
			selected.color = "#ccc"
		}
		return selected
	}

	self.doTheElection = function() {
		

		// for the moment, this works, but ideally there would be separate components of the STV, RRV etc elections for the roundCharts
		// we make sure that we generate the data now so we have it later.
		self.optionsForElection.sidebar = self.optionsForElection.sidebar || self.checkGotoTarena()

		if (self.nDistricts > 1) {
			for (var i = 0; i < self.nDistricts; i++) {
				self.placeHoldDuringElection = self.doPlaceHoldDuringElection
				self.district[i].result = self.election(self.district[i], self, self.optionsForElection);
				self.placeHoldDuringElection = false
			}

			// put all the results together
			self.result = {
				winners: [],
				colors: [],
				color: [],
				history: [],
				eventsToAssign: [],
				text: ''
			}
			if (self.doTop2) self.result.theTop2 = []
			for (var i = 0; i < self.nDistricts; i++) {
				if (self.result) {
					self.result.text += "<br>"
					self.result.text += "<br>"
					self.result.text += "District " + (i+1)
					self.result.text += "<br>"
					self.result.text += self.district[i].result.text
					self.result.winners = [].concat(self.result.winners , self.district[i].result.winners)
					self.result.colors = [].concat(self.result.colors , self.district[i].result.colors)
					self.result.color = [].concat(self.result.color , self.district[i].result.color)
					if (self.district[i].result.eventsToAssign) self.result.eventsToAssign = [].concat(self.result.eventsToAssign , self.district[i].result.eventsToAssign)
					if (self.doTop2) self.result.theTop2 = [].concat(self.result.theTop2 , self.district[i].result.theTop2)
				}
			}
			// for now, just give the history for the first district with candidates
			for (var i = 0; i < self.nDistricts; i++) {
				if (self.result) {
					self.result.history = self.district[i].result.history
					break
				}
			}
			
			// for (var i = 0; i < self.nDistricts; i++) {
			// 	self.result.history =[].concat(self.result.history , self.district[i].result.history)
			// 	self.result.history.push =[].concat(self.result.history , self.district[i].result.history)
			// }

			// TODO: visualize many districts results in tarena
			

		} else {
			self.placeHoldDuringElection = self.doPlaceHoldDuringElection
			self.result = self.election(self.district[0], self,self.optionsForElection);
			self.placeHoldDuringElection = false
			self.district[0].result = self.result
		}

	}

	self.drawArenas = function() {

		self.arena.clear()

		var doTarena = self.checkGotoTarena()
		if (doTarena) {
			self.tarena.clear()
		}

		// Draw axes
		//var background = new Image();
		//background.src = "../play/img/axis.png";
		//self.ctx.drawImage(background,0,0);
		self.viz.drawBackground()
		
		if (doTarena) {
			if (self.nDistricts > 1) {
				// TODO later
				// for (var i = 0; i < self.nDistricts; i++) {
				// 	if (self.district[i].candidates.length == 0) continue
				// 	_drawBars(i,self.tarena,self,self.round)
				// }
			} else {
				if (self.optionsForElection.sidebar) {
					_drawBars(0,self.tarena,self,self.round)
					_drawText("Candidates in Voter Space",10,35,40,self.tarena.ctx,"start")
				}
			}
		}

		if (self.dimensions == "1D+B") self.arena.drawHorizontal(self.arena.yDimOne + self.arena.yDimBuffer)
		if (self.dimensions == "1D" && 0) {
			self.arena.drawHorizontal(self.arena.yDimOne)
			self.arena.drawHorizontal(self.size - self.arena.yDimOne)
		}

		if (self.dimensions == "2D") {
			for (var i=0; i < self.district.length - 1; i++) {
				self.arena.drawHorizontal(self.district[i].upperBound)
			}
		}
		
		self.arena.draw()
		if (doTarena) {
			self.tarena.draw()
		}


	}
	self.drawSidebar = function () {		
		if (self.result) {
			if(self.result.text) {
				// the doPlaceHoldDuringElection option helps make it easier to draw
				// because we can use a placeholder for the drawing during the calculation phase of the election
				// and then substitute the image on the draw step.
				if (self.placeHolding || self.doPlaceHoldDuringElection) {
					if (self.nLoading > 0) {
						// will do on next draw
						return
					} else {
						// ready to replace
						self.result.textSubs = self.replacePlaceholder(self.result.text)
					}
				} else {
					self.result.textSubs = self.result.text
				}
				if (! (self.optionsForElection.originalCaption == true) ) {
					var title = '<div style="text-align:center;"><span class="small" > Election Results </span></div>'
				} else {
					var title = ''
				}
				self.caption.innerHTML = title + self.result.textSubs;
				if (self.result.eventsToAssign) {
					for (var i=0; i < self.result.eventsToAssign.length; i++) {
						var e = self.result.eventsToAssign[i]
						self.caption.querySelector("#" + e.eventID).addEventListener("mouseover", e.f)
						self.caption.querySelector("#" + e.eventID).addEventListener("mouseleave", ()=>self.drawArenas())
					}
				}
				if (! (self.optionsForElection.originalCaption == true) ) {
					// self should really be ui and this should be moved out of model as a plugin to model like sandbox
					if (self.minusControl == undefined) self.minusControl = {}
					if (self.minusControl.caption == undefined) self.minusControl.caption = {}
					addMinusButtonC(self.caption,self.minusControl.caption, {caption:true})
				}
			}
		}
	}


	var finding = false
	var seed = 1
	var goal = []
	var bounce = undefined
	self.buzz = function() {
		
		if (self.behavior == "goal") {
			//find goal
			if (!finding) {
				finding = true
				for(var i=0; i<self.candidates.length; i++){
					var can = self.candidates[i]
					goal[i] = self.viz.yee.winSeek(can)
				}
				finding = false
			}
				
			// move toward goal or center
			for(var i=0; i<self.candidates.length; i++){
				var c = self.candidates[i];
				if (self.result) {
					if (self.result.winners.includes(c.id))
					{
						continue // skip this guy because he's winning
					}
				}
				if (goal[i]) {
					var g = goal[i]
				} else {
					if (1) {
						continue // skip this guy
					} else {
						// move toward center
						var g = {
							x: self.canvas.width * .5,
							y: self.canvas.height * .5
						}
					}
				}
				var diff = {
					x: g.x * .5 - c.x,
					y: g.y * .5 - c.y
				}
				lenDiff = Math.sqrt(diff.x**2 + diff.y**2)
				var unit = {
					x: diff.x / lenDiff,
					y: diff.y / lenDiff
				}
				var speed = 5
				c.x += unit.x * speed
				c.y += unit.y * speed
			}
			bumble()
		} else if (self.behavior == "bounce") {
			// bouncing
	
			if (bounce == undefined || bounce.length != self.candidates.length) {
				bounce = []
			
				for(var i=0; i<self.candidates.length; i++){
					var c = self.candidates[i];
					var x = c.x - self.arena.canvas.width * .25
					var y = c.y - self.arena.canvas.height * .25
			
					var lenC = Math.sqrt(x**2 + y**2)
					bounce[i] = {
						x: y / lenC,
						y: -x / lenC
					}
				}
			}
			var speed = 10
			for(var i=0; i<self.candidates.length; i++){
				var c = self.candidates[i];
				c.x += bounce[i].x * speed
				c.y += bounce[i].y * speed
				// r = Math.sqrt(c.x**2 + c.y**2)
				// if (r > modelName.size * .5) {
				// 	// reverse the radial component of the bounce
				// 	theta_approx = c.y/c.x
				// 	c.x = r * theta_approx
				// 	c.y = r * 
				// }
				if (c.x < 0) {
					bounce[i].x = Math.abs(bounce[i].x)
				} else if (c.x > self.arena.canvas.width * .5) {
					bounce[i].x = - Math.abs(bounce[i].x)
				}
				if (c.y < 0) {
					bounce[i].y = Math.abs(bounce[i].y)
				} else if (c.y > self.arena.canvas.height * .5) {
					bounce[i].y = - Math.abs(bounce[i].y)
				}
			}
			// radial
		
		} else if (self.behavior == "buzz") {
			bumble()
		}
		function bumble() {
			// random movement
			seed++
			Math.seedrandom(seed);
			var stepsize = 1
			for(var i=0; i<self.candidates.length; i++){
				var c = self.candidates[i];
				c.x += Math.round((Math.random()*2-1)*stepsize)
				c.y += Math.round((Math.random()*2-1)*stepsize)
			}
		}
	}
	self.icon = function(id) {
		if (self.placeHoldDuringElection) {
			return "^Placeholder{" + id + "}"

		} else if (self.nLoading > 0) {
			// if the images haven't loaded yet, then put a placeholder here and flag a task to replace the text during the redraw 
			// (The redraw happens after images are loaded)
			self.placeHolding = true
			return "^Placeholder{" + id + "}"

		} else if (self.theme == "Letters") {
			var c = self.candidatesById[id]
			return "<span class='letter' style='color:"+c.fill+";'><b>"+c.name.toUpperCase()+"</b></span>"
		} else {
			return self.candidatesById[id].imageSelf.texticon
			// return self.candidatesById[id].imageSelf.texticon_png
		}
	}

	self.replacePlaceholder = function(text) {
		var filled = text.replace(/\^Placeholder{(.*?)}/g, (match, $1) => {
			return self.icon($1)
		});  
		// https://stackoverflow.com/a/49262416
		var filled2 = filled.replace(/\^PlaceholderNameUpper{(.*?)}/g, (match, $1) => {
			return self.nameUpper($1)
		}); 
		return filled2
	}
	
	self.nameUpper = function(id) {
		if (self.placeHoldDuringElection) {
			return "^PlaceholderNameUpper{" + id + "}"

		} else if (self.nLoading > 0) {
			// if the images haven't loaded yet, then put a placeholder here and flag a task to replace the text during the redraw 
			// (The redraw happens after images are loaded)
			self.placeHolding = true
			return "^PlaceholderNameUpper{" + id + "}"
			
		} else if (self.candidateIconsSet.includes("name")) {
			var c = self.candidatesById[id]
			// return "<span class='letterBig' style='color:"+c.fill+";'>"+c.name.toUpperCase()+"</span>"
			return "<span class='letterBig'>"+c.name.toUpperCase()+"</span>"
		} else {
			return "<span class='letterBig'>" + self.candidatesById[id].name.toUpperCase()+"</span>"
		}

		
	}
	
	self.checkGotoTarena = function() { 
		// checks to see if we want to add the additional arena for displaying the bar charts that we use for multi-winner systems
		// right now, we don't have a good visual of these for multiple districts, just one
		return (self.nDistricts < 2) && self.checkSystemWithBarChart() && ! (self.roundChart == "off") && (self.enableTArena)
	}
	self.checkDoMultiWinnerBarCharts = function() { 
		// checks to see if we want to add the additional arena for displaying the bar charts that we use for multi-winner systems
		// right now, we don't have a good visual of these for multiple districts, just one
		return self.checkSystemWithBarChart() && ! (self.roundChart == "off")
	}
	self.checkSystemWithBarChart = function () {
		return self.system == "QuotaApproval"  || self.system == "QuotaScore" || self.system == "Monroe Seq S" || self.system == "Phragmen Seq S" || self.system == "RRV" ||  self.system == "RAV" ||  self.system == "STV"
	}
	self.checkSystemWithRoundButtons = function() { 
		return self.checkSystemWithBarChart() || self.system == "IRV"
	}
	self.checkDoSort = function() {
		if (self.orderOfVoters == undefined || self.behavior == "stand") { 
			return self.checkDoMultiWinnerBarCharts() ||  ["IRV","STV"].includes(self.system) || self.showUtilityChart
		} else {
			return false
		}
	}

	self.checkDoBeatMap = function() {
		// ranked voter and not (original or IRV or Borda)
		var autoBeatMap = (self.beatMap == "auto") && (self.ballotType == "Ranked") && ! (self.doOriginal  || self.system == "IRV" || self.system == "STV" || self.system == "Borda")
		var on = (self.beatMap == "on") || autoBeatMap
		var doBeatMap = on && ( ! self.doTextBallots)
		return doBeatMap
	}
	self.checkDrawCircle = function() {
		return self.yeeon || self.checkDoBeatMap()
	}
	self.checkDoBallotConcept = function() {
		// ranked voter and not (original or IRV or Borda)
		var p1 = ! self.doOriginal
		var p2 =   self.ballotConcept != "off"
		var p3 = ! self.doTextBallots
		return p1 && p2 && p3

	}
	self.checkDoIRVConcept = function() {
		var go = (self.system == "IRV" || self.system == "STV")  && self.dimensions == "2D" && self.result
		go = go && self.checkDoBallotConcept()
		return go
	}

	self.checkDoStarStrategy = function(strategy) {
		var starOr321 = ["STAR","3-2-1"].includes(self.system)
		var doStar =  ( starOr321  &&  strategy != "zero strategy. judge on an absolute scale.") || self.doStarStrategy
		return doStar
	}

	self.checkRunTextBallots = function() {
		return self.system == "RBVote" && self.doTextBallots
	}

	self.checkRunPoll = function() {
		var not_f = ["zero strategy. judge on an absolute scale.","normalize"]
		var skipthis =  true
		for(var i=0;i<self.voterGroups.length;i++){ // someone is looking at frontrunners, then don't skipthis
			if (! not_f.includes(self.firstStrategy) && self.voterGroups[0].percentSecondStrategy != 100) skipthis = false
			if (! not_f.includes(self.secondStrategy) && self.voterGroups[0].percentSecondStrategy != 0) skipthis = false
		}   //not_f.includes(config.firstStrategy) && not_f.includes(config.secondStrategy)
		return ! skipthis
	}
	
	self.checkMultiWinner = function(system) {
		return (system == "QuotaApproval"  || system == "QuotaScore" || system == "Monroe Seq S" || system == "Phragmen Seq S" || system == "RRV" ||  system == "RAV" ||  system == "STV" || system == "QuotaMinimax" || system == "PhragmenMax" || system == "equalFacilityLocation") 
	}

	self.updateVC = function() {
		
		// make candidates in the positions of the voters
		var vs = self.voterSet.getVoterArrayXY()
		self.candidates = []
		self.preFrontrunnerIds = []
		for (var k = 0; k < vs.length; k ++) {
			var v = vs[k]
			
			var n = new Candidate(self)
			n.x = v.x
			n.y = v.y

			// generate a new id]
			var c = Object.keys(Candidate.graphicsByIcon[self.theme])
			var x = c.length
			var i = Math.floor(k/x) + 1
			var b = k % x
			var icon = c[b]
			n.icon = icon
			n.instance = i
			self.candidates.push(n)
				
			// INIT
			n.init()
		}
		self.initMODEL()
		self.dm.redistrictCandidates()
		// update the GUI
		self.onAddCandidate()
		
	}

	self.updateDistrictBallots = function(district) {
		self.voterSet.updateDistrictBallots(district)
	}
	self.updateBallots = function() {
		self.voterSet.updateBallots()
	}
};

function Arena(arenaName, model) {
	var self = this
	self.id = arenaName
	
	self.createDOM = function() {
		self.canvas = document.createElement("canvas");
		self.canvas.setAttribute("class", "interactive");
		self.ctx = self.canvas.getContext("2d");
		self.mouse = new Mouse(model.id + "-" + self.id, self.canvas);	// MAH MOUSE
		// if (self.id == "arena") self.draggableManager = new DraggableManager(self,model); // only allow dragging for the main arena... for now.. TODO
		self.draggableManager = new DraggableManager(self,model); 
		self.plusCandidate = new Plus(model)
		self.plusOneVoter = new Plus(model)
		self.plusVoterGroup = new Plus(model)
		self.plusXVoterGroup = new Plus(model)
		self.plusRectangle = new Plus(model)
		self.plusCandidate.isPlusCandidate = true
		self.plusOneVoter.isPlusOneVoter = true
		self.plusVoterGroup.isPlusVoterGroup = true
		self.plusXVoterGroup.isPlusXVoterGroup = true
		self.plusRectangle.isPlusRectangle = true
		self.trashes = new Trashes(model)
		self.modify = new Modify(model)
		self.viewMan = new ViewMan(model)
	}
	self.initDOM = function() {
		// RETINA canvas, whatever.
		self.canvas.width = self.canvas.height = model.size*2; // retina!
		self.canvas.style.width = self.canvas.style.height = model.size+"px";
		self.canvas.style.borderWidth = model.border+"px";
		//self.canvas.style.margin = (2-self.border)+"px"; // use margin instead of border
		
		self.plusCandidate.init()
		self.plusOneVoter.init()
		self.plusVoterGroup.init()
		self.plusXVoterGroup.init()
		self.plusRectangle.init()
		self.trashes.init()
		self.modify.init()
		self.viewMan.init()
	}


	function Plus(model){

		var self = this;
		Draggable.call(self);
		self.isplus = true // when we try to drag the plus, we'll find out it's a plus and make a new candidate
		
		// CONFIGURE DEFAULTS
		self.size = 20;
		self.isPlusCandidate = false
		self.isPlusOneVoter = false
		self.isPlusVoterGroup = false
		self.isPlusXVoterGroup = false
		self.isPlusRectangle = false
		
		self.init = function() {
			self.y = model.size - 20
			var between = 35
			if (self.isPlusCandidate) {
				self.x = model.size - between * 5.5
				var srcPlus = "play/img/plusCandidate.png"
			} else if (self.isPlusOneVoter) {
				self.x = model.size - between * 4.5
				var srcPlus = "play/img/plusOneVoter.png"
			} else if (self.isPlusVoterGroup) {
				self.x = model.size - between * 3.5
				var srcPlus = "play/img/plusVoterGroup.png"
			} else if (self.isPlusXVoterGroup) {
				self.x = model.size - between * 1.5
				var srcPlus = "play/img/plus_bell.png"
			} else if (self.isPlusRectangle) {
				self.x = model.size - between * 2.5
				var srcPlus = "play/img/plus_rectangle.png"
			}
			// if (Loader) {
			// 	if (Loader.assets[srcPlus]) {
			// 		self.img = Loader.assets[srcPlus]
			// 	}
			// }
			self.img = new Image();
			self.img.src = srcPlus
			model.nLoading++
			self.img.onload = onLoadTool
		}
		self.draw = function(ctx,arena){
	
			// RETINA
			var p = self
			var x = p.x*2;
			var y = p.y*2;
			var size = self.size*2;
	
			if(self.highlight) {
				var temp = ctx.globalAlpha
				ctx.globalAlpha = 0.8
				size *= 2
				// y -= size/4
			}
			ctx.drawImage(self.img, x-size/2, y-size/2, size, size);
			if(self.highlight) {
				ctx.globalAlpha = temp
			}
		};

		self.doPlus = function(doDummy) {
			if (self.isPlusCandidate) {
				// add candidate
				var n = new Candidate(model)
				n.x = self.x
				n.y = self.y
				// generate a new id
				// look for the first one that isn't taken
				for (var i=1; i < 10000000; i++) {  // million is more than enough candidates
					var c = Candidate.graphicsByIcon[model.theme]
					for (var icon in c) {
						if (i == 1) {
							var newId = icon
						} else {
							var newId = icon + i
						}
						if (model.candidatesById[newId] != undefined) {
							// already done
						} else {
							var doBreak = true
							break
						}
					}
					if (doBreak) break
				}
				n.icon = icon
				n.instance = i
				n.dummy = doDummy
				model.candidates.push(n)

				// once model.candidates is updated, we call the usual functions

			
				// INIT
				n.init()
				model.initMODEL()
				// UPDATE
				model.dm.redistrictCandidates()
				model.onAddCandidate()
				// model.update will happen later

				return n			
			} else if (self.isPlusOneVoter || self.isPlusVoterGroup || self.isPlusXVoterGroup || self.isPlusRectangle) {
				if (self.isPlusOneVoter) {
					var n = new SingleVoter(model)
				} else if (self.isPlusVoterGroup || self.isPlusXVoterGroup || self.isPlusRectangle) {
					var n = new GaussianVoters(model)
				}
				n.x = self.x
				n.y = self.y
				if (self.isPlusXVoterGroup) {
					n.x_voters = true
					n.crowdShape = "gaussian sunflower"
				} else if (self.isPlusRectangle) {
					n.crowdShape = "rectangles"
				} else {
					n.crowdShape = "circles"
				}
				var max = 0
				for (var i = 0; i < model.voterGroups.length; i++) {
					var a = model.voterGroups[i].vid
					if (a > max) max = a
				}
				n.vid = max + 1
				n.typeVoterModel = model.ballotType // needs init
				n.firstStrategy = model.firstStrategy
				n.secondStrategy = model.secondStrategy
                n.spread_factor_voters = model.spread_factor_voters
				model.voterGroups.push(n)
				// INIT
				model.initMODEL()
				n.init()
				return n
			}
		}
	
	}

	function Trashes(model) {
		var self = this
		self.init = function() {
			self.t = [new Trash(model)]
			if (model.dimensions != "2D") {
				self.t.push (new Trash(model))
			}
			for (var i=0; i<self.t.length; i++) {
				self.t[i].init()
			}
			if (model.dimensions == "1D+B") {
				self.t[1].y = model.arena.yDimOne
			} else if (model.dimensions == "1D") {
				self.t[0].y = model.size - model.arena.yDimOne
				self.t[1].y = model.arena.yDimOne
			}
		}
		self.tossInTrash = function() {
			for (var i=0; i<self.t.length; i++) {
				if (self.t[i].overTrash) self.t[i].tossInTrash()
			}
		}
		self.test = function() {
			var r = false
			for (var i=0; i<self.t.length; i++) {
				self.t[i].test()
				r = r || self.t[i].overTrash
			}
			self.overTrash = r
		}
		self.draw = function(ctx,a) {
			for (var i=0; i<self.t.length; i++) {
				self.t[i].draw(ctx,a)
			}
		}
	}

	function Trash(model){

		var self = this;
		Draggable.call(self);
		self.istrash = true
		self.isArenaObject = true

		// CONFIGURE DEFAULTS
		self.size = 20;
		self.img = new Image();
		self.img.src = "play/img/trash.png"
		model.nLoading++
		self.img.onload = onLoadTool
		self.init = function() { // these x & y are with respect to the arena, rather than the model
			self.x = model.size - 20
			self.y = model.size - 20
		}
		self.init()
		self.draw = function(ctx,arena){
	
			// RETINA
			var x = self.x*2;
			var y = self.y*2;
			var size = self.size*2;
	
			if(self.highlight) {
				var temp = ctx.globalAlpha
				ctx.globalAlpha = 0.8
			}
			ctx.drawImage(self.img, x-size/2, y-size/2, size, size);
			if(self.highlight) {
				ctx.globalAlpha = temp
			}
	
			// TODO: make the trashcan open
		};

		self.tossInTrash = function() {
			self.overTrash = false
			
			var d = model.arena.mouse.dragging
			// find the candidate in the candidate list
			for (var i=0; i < model.candidates.length; i++) {
				if (model.candidates[i] == d) {
					// delete candidate
					model.candidates.splice(i,1)
					
					break
				}
			}
			for (var i=0; i < model.preFrontrunnerIds.length; i++) {
				if (model.preFrontrunnerIds[i] == d.id) {
					// delete candidate
					model.preFrontrunnerIds.splice(i,1)
					break
				}
			}
			model.preFrontrunnerIds[i]

			// find the voter in the list
			for (var i=0; i < model.voterGroups.length; i++) {
				if (model.voterGroups[i] == d) {
					// delete candidate
					model.voterGroups.splice(i,1)
					// need to init voterSet
					model.voterSet.init()

					// also, check if the viewMan was on a voter in the group
					var viewMan = model.arena.viewMan
					if (viewMan.active && i == viewMan.focus.iGroup) {
						viewMan.unInit()
						viewMan.configure()
					}

					break
				}
			}


			// INIT
			model.initMODEL()
			// update the GUI
			model.onAddCandidate()
			model.dm.redistrict()

			self.size = 20
			return 
		}

		self.test = function() {
			var d = model.arena.mouse.dragging
			var p = d.newArenaPosition(model.arena.mouse.x,model.arena.mouse.y);
			var dx = p.x - self.x
			var dy = p.y - self.y
			var r = self.size * self.radiusScale
			if (model.arena.mouse.isTouch) r += d.touchAdd
			if (dx * dx + dy * dy < r * r) {
				// we have trash
				self.size = 40
				self.overTrash = true
			} else {
				self.size = 20
				self.overTrash = false
			}
		}
	
	}

	function Modify(model) {
		var self = this;
		Draggable.call(self);
		self.isModify = true // might help later
		self.isGear = true
		self.isArenaObject = true
		
		// CONFIGURE DEFAULTS
		self.size = 20;
		
		self.init = function() {
			var srcMod = "play/img/gear.png"
			// if (Loader) {
			// 	if (Loader.assets[srcMod]) {
			// 		self.img = Loader.assets[srcMod]
			// 	}
			// }
			self.img = new Image();
			self.img.src = srcMod
			model.nLoading++
			self.img.onload = onLoadTool
			self.configure()
		}
		self.configure = function() {
			if (self.active) {
				var f = model.arena.modelToArena(self.focus)
				self.x = f.x
				self.y = f.y
			} else {
				self.y = model.size - 20
				var between = 35
				self.x = model.size - between * 6.5
			}
		}
		self.draw = function(ctx,arena){
			// if it is near a candidate, then draw it on that candidate
			// when the mouse is let go, the coordinates will snap to the candidate
			
			if (self.active) {
				var f = model.arena.modelToArena(self.focus)
				self.x = f.x
				self.y = f.y
			}

			// RETINA
			var x = self.x*2;
			var y = self.y*2;
			var size = self.size*2;
	
			if(self.highlight) {
				var temp = ctx.globalAlpha
				ctx.globalAlpha = 0.8
				size *= 2
				// y -= size/4
			}
			ctx.drawImage(self.img, x-size/2, y-size/2, size, size);
			if(self.highlight) {
				ctx.globalAlpha = temp
			}
		};

		self.doModify = function(flashydude) {
			// snap to the nearest candidate, that we've been drawing on
			if (flashydude && (flashydude.isCandidate || flashydude.isGaussianVoters) ) {
				self.focus = flashydude
				self.active = true
				self.configure()
				if (flashydude.isGaussianVoters) {
					model.arena.up = new Up(model,flashydude) // create controls
					if (flashydude.crowdShape == "rectangles") {
						model.arena.down = new Down(model,flashydude)
					}
					model.arena.up.init()
					if (model.arena.down) {
						model.arena.down.init()
					}
				}
				model.arena.right = new Right(model,flashydude)
				model.arena.right.init()
				model.arena.initARENA() // add the controls to the arena
			} else {
				self.unInit()
				self.init()
				model.arena.initARENA()
			}
		}

		self.unInit = function() {
			self.active = false
			self.focus = null
			model.arena.up = null
			model.arena.right = null
			model.arena.down = null
		}
	}
	function ViewMan(model) {
		var self = this;
		Draggable.call(self);
		self.isModify = true // might help later
		self.isViewMan = true // might help later
		self.isArenaObject = true
		
		// CONFIGURE DEFAULTS
		self.size = 20;
		self.sizey = 60;
		
		self.init = function() {
			var srcMod = "play/img/viewMan.png"
			// if (Loader) {
			// 	if (Loader.assets[srcMod]) {
			// 		self.img = Loader.assets[srcMod]
			// 	}
			// }
			self.img = new Image();
			self.img.src = srcMod
			model.nLoading++
			self.img.onload = onLoadTool
			self.configure()
		}
		self.configure = function() {
			if (self.active) {
				var f = model.arena.modelToArena(self.focus)
				self.x = f.x
				self.y = f.y
			} else {
				self.y = model.size - 20
				var between = 35
				self.x = model.size - between * 7.5
			}
		}
		self.draw = function(ctx,arena){
			// if it is near a candidate, then draw it on that candidate
			// when the mouse is let go, the coordinates will snap to the candidate


			if (self.active) {
				var f = model.arena.modelToArena(self.focus)
				self.x = f.x
				self.y = f.y
			}

			// RETINA
			var x = self.x*2;
			var y = self.y*2;
			var size = self.size*2;
			var sizey = self.sizey*2;
	
			var doDoubleSize = self.highlight || self.active || model.arena.mouse.dragging == self
			if(doDoubleSize) {
				var temp = ctx.globalAlpha
				ctx.globalAlpha = 0.8
				size *= 2
				sizey *= 2
				// y -= size/4
			}
			ctx.drawImage(self.img, x-size/2, y-sizey/2, size, sizey);
			if(doDoubleSize) {
				ctx.globalAlpha = temp
			}
		};
		self.drag = function(arena) {

			arena.update() // update position of draggable

			// focus on closest voter
			var closest = arena.draggableManager.nearestVoterToMouse()
			if (closest) {
				self.focus = closest
				
				// check for snap
				self.snap(arena)
			}

			model.drawArenas() // draw everything inside the arenas
			if (closest) model.onDraw() // draw ballot for closest voter

		}
		self.snap = function(arena) {
			
			if (self.focus) {
				
				// check for snap
				var hit = self.objectMouseHitTest(25, self.focus, arena)
				if (hit) {
					self.active = true
					self.configure()
					return true
				}
				// model.arena.initARENA() // add the controls to the arena
			}
			self.active = false
			return false
		}

		self.drop = function() {
			self.configure()
			// model.arena.initARENA()
		}

		self.unInit = function() {
			self.active = false
			self.focus = null
		}
	}

	function Up(model,o) {  // o is the object that is being modified
		var self = this;
		Draggable.call(self);
		self.isUp = true // might help later
		self.isArenaObject = true
		self.dontchangex = true
		self.o = o
		self.scale = 4
		self.shapeScale = 5/20
		
		// CONFIGURE DEFAULTS
		self.size = 20;
		
		self.init = function() {
			var srcMod = "play/img/gear.png"
			// if (Loader) {
			// 	if (Loader.assets[srcMod]) {
			// 		self.img = Loader.assets[srcMod]
			// 	}
			// }
			self.img = new Image();
			self.img.src = srcMod
			model.nLoading++
			self.img.onload = onLoadTool
			self.configure()
		}
		self.configure = function() {
			var oa = model.arena.modelToArena(o)
			var length = self.getLengthFromProp()
			self.y = oa.y - length
			self.x = oa.x
			self.xC = oa.x
			self.yC = oa.y
		}
		self.getLengthFromProp = function() {
			if (o.crowdShape == "rectangles" || o.crowdShape == "circles") {
				if (typeof o.group_count_h !== "undefined") {
					var length = self.propToLength(o.group_count_h)
				} else {
					var length = 60
				}
			} else {
				if (typeof o.group_count !== "undefined") {
					var length = self.propToLength(o.group_count)
				} else {
					var length = 60
				}
			}
			return length
		}
		self.propToLength = function(p) {
			if (o.crowdShape == "rectangles" || o.crowdShape == "circles") {
				return Math.round(p / self.shapeScale)
			} else {
				return Math.round(p / self.scale)
			}
			 
		}
		self.updatePropFromLength = function(length) {
			var prop = self.lengthToProp(length)
			if (o.crowdShape == "rectangles" || o.crowdShape == "circles") {
				o.group_count_h = prop
			} else {
				o.group_count = prop
			}

		}
		self.lengthToProp = function(length) {
			if (o.crowdShape == "rectangles" || o.crowdShape == "circles") {
				return Math.round(length * self.shapeScale)
			} else {
				return Math.round(length * self.scale)
			}
			 
		}

		self.draw = function(ctx,arena){
			// RETINA
			var p = self
			var x = p.x*2;
			var y = p.y*2;
			var size = self.size*2;
	
			if(self.highlight) {
				var temp = ctx.globalAlpha
				ctx.globalAlpha = 0.8
				size *= 2
				// y -= size/4
			}
			
			ctx.drawImage(self.img, x-size/2, y-size/2, size, size);

			var arrow_size = 20
			var offset_y = 0
			ctx.beginPath();
			ctx.moveTo(x,y+offset_y)
			ctx.lineTo(self.xC*2,self.yC*2)
			ctx.moveTo(x,y+offset_y)
			ctx.lineTo(x+arrow_size, y + offset_y + arrow_size)
			ctx.moveTo(x,y+offset_y)
			ctx.lineTo(x-arrow_size, y + offset_y + arrow_size)
			ctx.lineWidth = 10
			ctx.strokeStyle = "#333";
			ctx.stroke();

			if(self.highlight) {
				ctx.globalAlpha = temp
			}
		};

	}

	function Right(model,o) {  // o is the object that is being modified
		var self = this;
		Draggable.call(self);
		self.isRight = true // might help later
		self.isArenaObject = true
		self.dontchangey = true
		self.o = o
		self.scale = 5
		self.sizeScale = 2/3
		
		// CONFIGURE DEFAULTS
		self.size = 20;
		
		self.init = function() {
			var srcMod = "play/img/gear.png"
			// if (Loader) {
			// 	if (Loader.assets[srcMod]) {
			// 		self.img = Loader.assets[srcMod]
			// 	}
			// }
			self.img = new Image();
			self.img.src = srcMod
			model.nLoading++
			self.img.onload = onLoadTool
			self.configure()
		}
		self.configure = function() {
			var oa = model.arena.modelToArena(o)	
			self.y = oa.y
			self.yC = oa.y
			self.xC = oa.x
			if (typeof o.group_spread !== "undefined") {
				var length = o.group_spread / self.scale
				self.x = oa.x + length
			} else if (typeof o.b !== "undefined") {
				var length = o.size / self.sizeScale
				self.x = oa.x + length
			} else {
				self.x = oa.x + 60
			}
		}
		self.draw = function(ctx,arena){
			// RETINA
			var p = self
			var x = p.x*2;
			var y = p.y*2;
			var size = self.size*2;
	
			if(self.highlight) {
				var temp = ctx.globalAlpha
				ctx.globalAlpha = 0.8
				size *= 2
				// y -= size/4
			}
			
			ctx.drawImage(self.img, x-size/2, y-size/2, size, size);

			var arrow_size = 20
			var offset_x = 0

			ctx.beginPath();
			ctx.moveTo(x-offset_x,y)
			ctx.lineTo(self.xC*2,self.yC*2)
			ctx.moveTo(x-offset_x,y)
			ctx.lineTo(x-offset_x-arrow_size, y + arrow_size)
			ctx.moveTo(x-offset_x,y)
			ctx.lineTo(x-offset_x-arrow_size, y - arrow_size)
			ctx.lineWidth = 10
			ctx.strokeStyle = "#333";
			ctx.stroke();
			
			if(self.highlight) {
				ctx.globalAlpha = temp
			}
		};

	}
	function Down(model,o) {  // o is the object that is being modified
		var self = this;
		Draggable.call(self);
		self.isDown = true // might help later
		self.isArenaObject = true
		self.dontchangex = true
		self.o = o
		self.scale = 5/20
		self.sizeScale = 2/3
		
		// CONFIGURE DEFAULTS
		self.size = 20;
		
		self.init = function() {
			var srcMod = "play/img/gear.png"
			// if (Loader) {
			// 	if (Loader.assets[srcMod]) {
			// 		self.img = Loader.assets[srcMod]
			// 	}
			// }
			self.img = new Image();
			self.img.src = srcMod
			model.nLoading++
			self.img.onload = onLoadTool
			self.configure()
		}
		self.configure = function() {
			var oa = model.arena.modelToArena(o)
			if (typeof o.group_count_vert !== "undefined") {
				var length = self.propToLength(o.group_count_vert)
				self.y = oa.y + length
			} else {
				self.y = oa.y + 60
			}
			self.x = oa.x
			self.xC = oa.x
			self.yC = oa.y
		}
		self.lengthToProp = p => Math.round(p * self.scale)
		self.propToLength = p => p / self.scale
		self.draw = function(ctx,arena){
			// RETINA
			var p = self
			var x = p.x*2;
			var y = p.y*2;
			var size = self.size*2;
	
			if(self.highlight) {
				var temp = ctx.globalAlpha
				ctx.globalAlpha = 0.8
				size *= 2
				// y -= size/4
			}
			
			ctx.drawImage(self.img, x-size/2, y-size/2, size, size);

			var arrow_size = 20
			var offset_y = 0

			ctx.beginPath();
			ctx.moveTo(x,y-offset_y)
			ctx.lineTo(self.xC*2,self.yC*2)
			ctx.moveTo(x,y-offset_y)
			ctx.lineTo(x+arrow_size, y - offset_y - arrow_size)
			ctx.moveTo(x,y-offset_y)
			ctx.lineTo(x-arrow_size, y - offset_y - arrow_size)
			ctx.lineWidth = 10
			ctx.strokeStyle = "#333";
			ctx.stroke();
			
			if(self.highlight) {
				ctx.globalAlpha = temp
			}
		};

	}
	function onLoadTool() {
		model.nLoading--
		if (model.nLoading == 0) {
			model.draw()
		}
	}
	

	self.bFromY = function (y) {
		return (model.size - y)/60
	}
	self.yFromB = function (b) {
		return model.size - b * 60
	}
	
	// function Right(model,o) {  // o is the object that is being modified
	// 	Up.call(self,model,o)
	// }


	self.initARENA = function() {

		// Draggable candidates and voters
		var doControls = false
		var doVoters = true
		var doCandidates = true
		
		if (self.id == "arena" && model.showToolbar == "on") {
			doControls = true
		}

		self.draggables = [];
		if (doControls) {
			self.draggables.push(self.plusCandidate)
			self.draggables.push(self.plusOneVoter)
			self.draggables.push(self.plusVoterGroup)
			self.draggables.push(self.plusXVoterGroup)
			self.draggables.push(self.plusRectangle)
			for (var i=0; i<self.trashes.t.length; i++) {
				self.draggables.push(self.trashes.t[i])
			}
		}
		for (var i=0; i<model.candidates.length; i++) {
			var c = model.candidates[i]
			self.draggables.push(c);
		}
		for (var i=0; i<model.voterGroups.length; i++) {
			var v = model.voterGroups[i]
			self.draggables.push(v);
		}
		if(model.voterCenter && model.voterGroups.length > 1) self.draggables.push(model.voterCenter)
		if (doControls) {
			self.draggables.push(self.modify)
			if (self.modify.active) {
				if (self.up) {
					self.draggables.push(self.up)
				}
				if (self.down) {
					self.draggables.push(self.down)
				}
				self.draggables.push(self.right)
			}
			self.draggables.push(self.viewMan)
		}
	}

		
	self.modelToArena = function(d) {
		if (d.isArenaObject) {
			return d
		}
		if (self.id == "tarena") {
			if (d.isCandidate) {
				if (model.dimensions == "2D") {
					// find closest voter's index
					var i = _closestVoterIndex(d,model)
					var xP = i  * (self.canvas.width/2)
					return {x:xP,y:50}
				} else {
					var xP = _xToPercentile(d.x,model) / 100 * (self.canvas.width/2)
					// return {x:xP,y:15*d.i+7} // each candidate has his own track
					return {x:xP,y:50}
				}
			} else {
				return {x:0,y:-100} // offscreen... move voter offscreen
			}
		} else {
			var x,y
			// just a regular arena
			x = d.x
			if (model.dimensions == "1D+B") {
				if (d.isCandidate) {
					y = self.yFromB(d.b)
				} else if (d.isVoter || d.isVoterCenter || d.isVoterPerson) {
					y = self.yDimOne
				} else {
					y = d.y
				}
			} else if (model.dimensions == "1D" ) {
				if (d.isCandidate) {
					y = model.size - self.yDimOne
				} else if (d.isVoter || d.isVoterCenter || d.isVoterPerson) {
					y = self.yDimOne
				} else {
					y = d.y
				}
			} else {
				y = d.y
			}
			return {x:x,y:y}
		}

	}

	function _closestVoterIndex(d,model) { // returns where the candidate should be in the sorted list of voters
		closest = 0
		min = Infinity
		var a = model.voterSet.getVoterArray()
		for (var i = 0; i < a.length; i++) {
			v = a[model.orderOfVoters[i]]
			var dx = d.x - v.x
			var dy = d.y - v.y
			var d2 = dx*dx + dy*dy
			if (d2 < min) {
				min = d2
				closest = i
			}
		}
		return closest / a.length
	}

	self.arenaToModel = function(p,d) { // p is the new arena coordinate and d is the old model object (usually it is being dragged)
		
		var x,y,b // return variables

		if (d.isArenaObject) {
			return p
		}
		if (self.id == "tarena") {
			// Percentiles for Tetris Ballot Arena
			var percentile = p.x/(self.canvas.width/2) * 100
			percentile = Math.min(100,percentile)
			percentile = Math.max(0,percentile) // TODO: figure out why I would get a mouse at a negative x
			x = _percentileToX(percentile, model)
			y = _percentileToY(percentile, model)
			if (d.isCandidate) {
				b = d.b
			}
		} else {
			// Main Arena
			x = p.x
			if (model.dimensions == "2D") {
				y = p.y
				if (d.isCandidate) {
					b = d.b
				}
			} else {
				y = d.y
				if (d.isCandidate) {
					if (model.dimensions == "1D+B") {
						var h = (self.yDimOne + self.yDimBuffer)
						var limYc = (model.size - h) * .3 + h
						if (p.y < limYc) {
							b = self.bFromY(limYc)
						} else {
							b = self.bFromY(p.y)
						}
					} else {
						b = d.b
					}
				}
			}
		}
		return {x:x,y:y,b:b} // b is sometimes undefined, on purpose
	}

	self.update = function(){
		// Move the one that's being dragged, if any
		
		self.yDimOne = model.size * .6 / 1.6
		self.yDimBuffer = 20
		// self.yDimBuffer = (model.size - self.yDimOne) * .3
		
		// if (self.id == "arena") {
		if(self.mouse.dragging){
			var d = self.mouse.dragging
			if (d.isCandidate || d.isVoter || d.isVoterCenter) {
				var p = d.newArenaPosition(self.mouse.x,self.mouse.y);
				var n = self.arenaToModel(p,d)
				d.x = n.x
				d.y = n.y
				if (d.isCandidate) {
					d.b = n.b
					d.update()
					model.dm.candidatePicksDistrict(d)
					model.dm.districtsListCandidates()
				}
				if (d.isVoter) {
					_pileVoters(model)
					model.dm.redistrict()
				}
				if (d.isVoterCenter) {
					d.drag()
					model.dm.redistrict()
				}
			} else {
				var p = d.newArenaPosition(self.mouse.x,self.mouse.y);
				d.x = p.x
				d.y = p.y
			}
			if (d.isUp) {
				d.x = d.xC
				d.y = Math.min(d.yC,d.y)
				if (d.o.voterGroupType && d.o.voterGroupType=="GaussianVoters") {
					var length = -(d.y - d.yC)
					d.updatePropFromLength(length)
					d.o.init()
					_pileVoters(model)
					model.dm.redistrict()
					model.updateFromModel()
				}
			} else if (d.isDown) {
				d.x = d.xC
				d.y = Math.max(d.yC,d.y)
				if (d.o.voterGroupType && d.o.voterGroupType=="GaussianVoters" && d.o.crowdShape == "rectangles") {
					var length = d.y - d.yC
					d.o.group_count_vert = d.lengthToProp(length)
					d.o.init()
					_pileVoters(model)
					model.dm.redistrict()
					model.updateFromModel()
				}
			} else if (d.isRight) {
				d.y = d.yC
				d.x = Math.max(d.xC,d.x)
				var length = d.x - d.xC
				if (d.o.voterGroupType && d.o.voterGroupType=="GaussianVoters") {
					d.o.group_spread = length * d.scale
					d.o.init()
					_pileVoters(model)
					model.dm.redistrict()
					model.updateFromModel()
				} else if (d.o.isCandidate) {
					d.o.size = length * d.sizeScale
					d.o.b = d.o.bFromSize(d.o.size)
				}	
			} else if (d.isModify) {
				d.unInit() // dont show the axes when we're dragging the modify gear
			}
		}
		if (self.modify && self.modify.active) { // update the modify value
			self.modify.configure()
			self.right.configure()  // so re-configure the lengths of these controls
			if (self.up) { // this value might have changed
				self.up.configure()	
			} 
			if (self.down) { // this value might have changed
				self.down.configure() 
			} 
		}
		if (self.viewMan && self.viewMan.active) { // update the viewMan value
			self.viewMan.configure()
		}
	}

	self.clear = function(){
		// Clear it all!
		self.ctx.clearRect(0,0,self.canvas.width,self.canvas.height);
		// not sure why this doesn't work
		var darkMode = false
		if (darkMode) {
			self.ctx.fillStyle = "#222"
			self.ctx.beginPath()
			self.ctx.fillRect(0,0,self.canvas.width,self.canvas.height);
			self.ctx.closePath()
			self.ctx.fill()
		}
	}

	self.drawHorizontal = function(yLine) {
		// draw line through middle
		var ctx = self.ctx
		ctx.beginPath();
		ctx.moveTo(0,yLine*2);
		ctx.lineTo(ctx.canvas.width,yLine*2);
		ctx.lineWidth = 5;
		ctx.strokeStyle = "#888";
		
		ctx.setLineDash([5, 15]);
		ctx.stroke();
			ctx.setLineDash([]);
	}

	self.draw = function(){

		// DRAW 'EM ALL.
		// Draw voters' BG first, then candidates, then voters.

		var noClip = true
		//set annotations
		resetAnnotations()
		if (self.id == "arena") {
			setAnnotations()
			// if (model.orderOfVoters) drawSortLines()
			if (model.dimensions == "2D" || noClip) {
				drawVoters0()
				drawVoters1()
				drawToolbar()
				var flashydude = getFlashydude()
				drawExtraTrash()
				drawVotes()
				drawVoters2()
				drawVoterCenter()
				drawCandidates()
				drawAnotherYeeObject()
				drawFlashydude()
				drawWinners()
			} else {
				drawToolbar()
				var flashydude = getFlashydude()
				var flashyFirst = (flashydude && flashydude.isCandidate)
				// startClip()
				drawCandidates()
				if (flashyFirst) drawFlashydude()
				drawWinners()
				// resetClip()
				clipCandidates()
				drawVoters0()
				drawVoters1()
				drawExtraTrash()
				drawVotes()
				drawVoters2()
				if (!flashyFirst) drawFlashydude()
				drawVoterCenter()
				drawAnotherYeeObject()
			}
			drawModify()
			setBorderColor()
		} else {	
			var flashydude = getFlashydude()
			drawCandidates()
			var flashyFirst = (flashydude && flashydude.isCandidate)
			if (flashyFirst) drawFlashydude() // only if flashydude is a candidate 
			// flashydude means we are hovering over the object and the object changes color to show we're hovering
			drawWinners()
			setBorderColor()
		}
		
		// //set annotations
		// if (self.id == "arena") {
		// 	setAnnotations()
		// 	// drawSortLines()
		// 	drawToolbar()
		// }
		// var flashydude = getFlashydude()
		// if (model.dimensions != "2D") {
		// 	drawCandidates()
		// 	if (flashydude && flashydude.isCandidate) drawFlashydude()
		// 	if (self.id == "arena") clipCandidates()
		// }
		// if (self.id == "arena") {
		// 	drawVoters()
		// }
		// if (model.dimensions == "2D") {
		// 	drawCandidates()
		// }
		// if (self.id == "arena") {
		// 	drawVoterCenter()
		// 	drawAnotherYeeObject()
		// }
		// if (!(flashydude && flashydude.isCandidate && model.dimensions != "2D")) drawFlashydude()

		// if (self.id == "arena") {
		// 	drawModify()
		// }
		// drawWinners()
		// setBorderColor()

		function resetAnnotations() {
			// reset annotations
			for(var i=0; i<self.draggables.length; i++){
				var draggable = self.draggables[i];
				draggable.drawAnnotation = (function(){});
				draggable.drawBackAnnotation = (function(){});
			}
		}
		function setAnnotations() {
			if(model.yeeobject) model.yeeobject.drawBackAnnotation = model.viz.yee.drawYeeGuyBackground
			if(model.yeeobject) model.yeeobject.drawAnnotation = model.viz.yee.drawYeeAnnotation
		}

		function drawSortLines() {
			// draw sort lines
			var s = model.getSortedVoters()
			for (var i=0; i<s.length-1; i++) {
				// draw line from here to next
				
				var ctx = self.ctx
				var va = s[i]
				var vb = s[i+1]
				ctx.beginPath();
				ctx.moveTo(va.x*2	,va.y*2	);
				ctx.lineTo(vb.x*2	,vb.y*2	);
				ctx.lineWidth = 5;
				ctx.strokeStyle = "#888";
				ctx.stroke();

			}

		}

		function drawToolbar() {
			if (model.showToolbar == "on") {
				self.plusCandidate.draw(self.ctx,self)
				self.plusOneVoter.draw(self.ctx,self)
				self.plusVoterGroup.draw(self.ctx,self)
				self.plusXVoterGroup.draw(self.ctx,self)
				self.plusRectangle.draw(self.ctx,self)
				self.trashes.t[0].draw(self.ctx,self)
			}
		}
		

		function getFlashydude() {
			for(var i=0; i<model.candidates.length; i++){
				var c = model.candidates[i];
				if (c.highlight) {
					return c
				}
			}
			for(var i=0; i<model.voterGroups.length; i++){
				var voter = model.voterGroups[i];
				if (voter.highlight) {
					return voter
				}
			}
			return null
		}

		function startClip() {
			// Clip a rectangular area
			var dy = self.yDimOne + self.yDimBuffer
			var ctx = self.ctx
			ctx.rect(0,dy,self.canvas.width,self.canvas.height-dy);
			ctx.stroke();
			ctx.clip();
		}

		function resetClip() {
			// Clip a rectangular area
			var ctx = self.ctx
			ctx.rect(0,0,self.canvas.width,self.canvas.height);
			ctx.stroke();
			ctx.clip();
		}
		
		function drawCandidates() {
			// There's two ways to draw the candidate.  One shows the candidate icon.
			// Two shows the vote totals and optionally, the candidate icon.
			var go = model.checkDoIRVConcept() && self.id == "arena"
			if (go) {
				for (var k = 0; k < model.district.length; k++) {
					result = model.district[k].result
					drawIRVCandidates(result)
				}
			}
			var ctx = self.ctx
			for(var i=0; i<model.candidates.length; i++){
				var c = model.candidates[i];
				if (c.highlight) {
					continue
				}
				if (go) { // use transparency to draw candidate
					temp = ctx.globalAlpha
					ctx.globalAlpha = (model.theme == "Letters") ? .8 : .4
					c.draw(ctx,self);
					ctx.globalAlpha = temp
				} else {
					c.draw(ctx,self);
				}
			}
		}

		function drawIRVCandidates(result) {

			if (result === undefined) return

			var coalitions = result.coalitions

			if (coalitions.length == 0) return // edge case: everybody tied

			for (var i = 0; i < coalitions.length; i++) {
				var coalition = coalitions[i]
				drawCoalition(coalition,result)
			}

		}

		function drawCoalition(coalition,result) {

			
			var from = model.candidatesById[coalition.id]
			var list = coalition.list
			
			var canIdByDecision = result.canIdByDecision
			var nBallots = result.nBallots
			var ctx = self.ctx
			var norm = 2.5 * nBallots / (135 * model.seats)
			var total = 0
			
			for (var firstID in list) {
				var size = list[firstID]
				total = total + size
			}

			ctx.lineWidth = 0;

			if (1) {
				norm = norm * 0.02

				sumsize = 0
				var slices = []
				for (var i = 0; i < canIdByDecision.length; i++) {
					var firstID = canIdByDecision[i]
					if ( list.hasOwnProperty(firstID)) {
						var first = model.candidatesById[firstID]
						var size = list[firstID]
						if (size > 0) {
							// add to list
							slices.push({num:size, fill:first.fill})
						}
					}
				}
				if (slices.length === 0) return
				var x = from.x
				var y = from.y
				var lastme = slices.pop()
				mesize = lastme.num
				var totalSlices = total - mesize
				var size2 = Math.sqrt(total/norm)
				if (slices.length > 0) {
					_drawSlices(model, ctx, x, y, size2, slices, totalSlices)
				}
				
				// draw me
				r = Math.sqrt(mesize/ norm)
				ctx.beginPath();
				ctx.arc(x*2, y*2, r, 0, Math.TAU, false);
				ctx.strokeStyle = lastme.fill;
				ctx.fillStyle = lastme.fill;
				ctx.fill();
				return
			}


			sumsize = 0
			for (var i = 0; i < canIdByDecision.length; i++) {
				var firstID = canIdByDecision[i]
				if ( list.hasOwnProperty(firstID)) {
					var first = model.candidatesById[firstID]
					var size = list[firstID] / norm
					if (size > 0) {
						var x = from.x
						var y = from.y
	

						r = Math.sqrt((total - sumsize) / norm) * 5
						r = (total - sumsize) / norm * .2
	
						ctx.beginPath();
						ctx.arc(x*2, y*2, r*2, 0, Math.TAU, false);
						ctx.strokeStyle = first.fill;
						ctx.fillStyle = first.fill;
						ctx.fill();
						ctx.stroke();
					}
					sumsize = sumsize + size

				}
			}
		}


		function clipCandidates() {
			// draw a white rectangle
			var ctx = self.ctx
			var temp = ctx.globalAlpha
			ctx.globalAlpha = 1
			ctx.fillStyle = "#fff"
			ctx.fillRect(0,0,ctx.canvas.width,(self.yDimOne + self.yDimBuffer)*2)  // draw a white background
			ctx.fill()
			ctx.globalAlpha = temp
		}


		function drawExtraTrash() {
			if (model.dimensions != "2D" && model.showToolbar == "on") {
				self.trashes.t[1].draw(self.ctx,self)
			}
		}

		function drawVoters0() {
			for(var i=0; i<model.voterGroups.length; i++){
				var voter = model.voterGroups[i];
				voter.draw0(self.ctx,self);
			}
		}
		function drawVoters1() {
			for(var i=0; i<model.voterGroups.length; i++){
				var voter = model.voterGroups[i];
				voter.draw1(self.ctx,self);
			}
		}
		function drawVotes() {
			
			if ( ! model.checkDoBallotConcept() ) return

			var go = model.system == "IRV" || model.system == "STV"
			if (go && model.dimensions == "2D" && model.result && model.opt.showIRVTransfers) {
				ctx = self.ctx
				for (var k = 0; k < model.district.length; k++) {
					result = model.district[k].result
					if (result)	drawIRVTransfers(result)
				}
			}
		}
		function drawIRVTransfers(result) {
			var transfers = result.transfers
			var topChoice = result.topChoice
			var nBallots = result.nBallots

			if (transfers.length == 0) return // edge case: everybody tied

			for (var i = 0; i < transfers.length; i++) {
				for (var k = 0; k < transfers[i].length; k++) {
					var transfer = transfers[i][k]
					var from = model.candidatesById[transfer.from]
					var flows = transfer.flows
					for (var toID in flows) {
						var f = flows[toID]
						var to = model.candidatesById[toID]
						drawTransfer(f,from,to,nBallots)
					}
				}
			}

			if (model.opt.IRVShowdown) {
				if (0) {
					// make a list of voters first choices for the voters in the winning coalition
					for (var k = 0; k < result.winners.length; k++) {
						winner = result.winners[k]
						coalition = {}
						for (var i = 0; i < model.candidates.length; i++) {
							coalition[model.candidates[i].id] = 0
						}
						for (var i = 0; i < topChoice[0].length; i++) {
							penultimate = topChoice[topChoice.length-1][i]
							first = topChoice[0][i]
							if( penultimate == winner) {
								coalition[first] ++
							}
						}
						to = model.candidatesById[winner]
						frac = .5
						halfway = {}
						halfway.x = from.x * frac + to.x * (1-frac)
						halfway.y = from.y * frac + to.y * (1-frac)
						drawTransfer(coalition,halfway,to,nBallots)
					}
				} else {
					// make a list of voters first choices for the voters in the winning coalition
					for (var m = 0; m < result.lastlosers.length; m++) {
						var loser = result.lastlosers[m]
						var from = model.candidatesById[loser]
		
						for (var k = 0; k < result.winners.length; k++) {
							winner = result.winners[k]
							coalition = {}
							for (var i = 0; i < model.candidates.length; i++) {
								coalition[model.candidates[i].id] = 0
							}
							for (var i = 0; i < topChoice[0].length; i++) {
								penultimate = topChoice[topChoice.length-1][i]
								first = topChoice[0][i]
								if( penultimate == winner) {
									coalition[first] ++
								}
							}
							to = model.candidatesById[winner]
							frac = .5
							halfway = {}
							halfway.x = from.x * frac + to.x * (1-frac)
							halfway.y = from.y * frac + to.y * (1-frac)
							drawTransfer(coalition,halfway,to,nBallots)
				
						}
					}
				}
			}

			

		}
		
		function drawTransfer(flow,from,to,nBallots) {
			var ctx = self.ctx
			var norm = 2.5 * nBallots / (135 * model.seats)
			norm = norm * 1.5
			var total = 0
			for (var firstID in flow) {
				var size = flow[firstID] / norm
				total = total + size
			}
			sumsize = 0
			for (var firstID in flow) {
				var size = flow[firstID] / norm
				var first = model.candidatesById[firstID]
				if (size > 0) {
					
					var u = _unitVector(to,from) 
					// amount to move by
					move = total/2 - sumsize - size/2
					x1 = from.x + u.y * move
					x2 = to.x + u.y * move
					y1 = from.y - u.x * move
					y2 = to.y - u.x * move
					
					ctx.beginPath();
					ctx.moveTo(x1*2,y1*2);
					ctx.lineTo(x2*2,y2*2);
					ctx.lineWidth = size*2;
					ctx.strokeStyle = first.fill;
					ctx.stroke();
				}
				sumsize = sumsize + size
			}


			if (total > 0) {
				frac = .5
				halfway = {}
				halfway.x = from.x * frac + to.x * (1-frac)
				halfway.y = from.y * frac + to.y * (1-frac)
				
				var u = _unitVector(to,from) 
				var alen = 5
				a = {
					from: {
						x: halfway.x - alen * u.x,
						y: halfway.y - alen * u.y
					},
					to: {
						x: halfway.x + alen * u.x,
						y: halfway.y + alen * u.y
					},
				}
				_drawArrow(ctx, a.from.x * 2, a.from.y * 2, a.to.x * 2, a.to.y * 2)
			}

		}

		function drawVoters2() {
			for(var i=0; i<model.voterGroups.length; i++){
				var voter = model.voterGroups[i];
				voter.draw2(self.ctx,self);
			}
		}
		
		function drawVoterCenter() {	
			var oneVoter = (model.voterGroups.length == 1)
			// var oneVoter = (model.voterGroups.length == 1 && model.voterGroups[0].points.length == 1)
			var isCenter = (typeof model.voterCenter !== 'undefined')
			if (isCenter && ! oneVoter) {
				model.voterCenter.draw(self.ctx)
			}
		}
		
		function drawAnotherYeeObject() {
			var oneVoter = (model.voterGroups.length == 1)
			// var oneVoter = (model.voterGroups.length == 1 && model.voterGroups[0].points.length == 1)
			var isCenter = (typeof model.voterCenter !== 'undefined')

			if (isCenter && ! oneVoter) {
				return
			}

			// draw the Yee object last so it is easy to see.
			if (model.yeeon && model.yeeobject) {
				var yeeCenter = (isCenter) ? (model.yeeobject == model.voterCenter) : false
				var yeeOne = model.yeeobject == model.voterGroups[0]
				var covering = (oneVoter && (yeeOne || yeeCenter) )
				// unless it covers the one voter
				if (! covering ) {

					if (model.yeeobject.isCandidate) {
						model.yeeobject.draw(self.ctx,self)
					} else {
						model.yeeobject.draw2(self.ctx,self)
					}
				}
			}
		}

		function drawFlashydude() {
			var d = self.mouse.dragging
			var dontdo = true // I'm not sure why I did this part and it probably can be removed.
			if (!dontdo && d) { // draw the dragging object again (twice but that's okay)
				if (d.isVoter) {
					d.draw2(self.ctx,self)
				} else if (d.isVoterCenter){
					if(! oneVoter) {
						d.draw(self.ctx,self)
					}
				} else {
					d.draw(self.ctx,self)
				}
			} else {
				if (flashydude) {
					if (flashydude.isVoter) {
						flashydude.draw2(self.ctx,self)
					} else {
						flashydude.draw(self.ctx,self)
					}
				}
			}
		}
			
		function drawModify() {
			if (model.showToolbar == "on") {
				self.modify.draw(self.ctx,self)
				
				if (self.modify.active) {
					if (self.up) {
						self.up.draw(self.ctx,self)
					}
					if (self.down) {
						self.down.draw(self.ctx,self)
					}
					self.right.draw(self.ctx,self)
				}

				self.viewMan.draw(self.ctx,self)
			}

		}
		
		function drawWinners() {
			if (!model.dontdrawwinners) {
				// draw text next to the winners

				// check how many winners there should be
				let winnersAllowed = 1
				if (model.checkMultiWinner(model.system)) {
					winnersAllowed = model.seats
				}

				for (var k = 0; k < model.district.length; k++) {
					var district = model.district[k]
					var result = district.result
					
					if(result && result.winners) {
						for (let wid of result.winners) {
							let c = model.candidatesById[wid]
							if (result.winners.length > winnersAllowed) {
								c.drawTie(self.ctx,self)
							} else {
								c.drawWin(self.ctx,self)
							}
						}
					}
				}
	
				// if(model.result && model.result.winners) {
				// 	var objWinners = model.result.winners.map(x => model.candidatesById[x])
				// 	if (objWinners.length > model.seats) {
				// 		for (i in objWinners) {
				// 			objWinners[i].drawTie(self.ctx,self)
				// 		}
				// 	} else {
				// 		for (i in objWinners) {
				// 			objWinners[i].drawWin(self.ctx,self)
				// 		}
				// 	}
				// }
	
			}
		}
		
		function setBorderColor() {
			if (model.result && model.useBorderColor) {
				self.canvas.style.borderColor = model.result.color;
				if (model.yeeon) self.canvas.style.borderColor = "#fff"
			}
		}
	}
}


function DistrictManager(model) {
	var self = this
	
	self.redistrict = function() {
		// calculate district lines

		// create data structure
		model.district = []
		for (var i = 0; i < model.nDistricts; i++) {
			model.district[i] = {
				voterPeople: [],
				candidates: [],
				i: i,
				parties: [],
				stages: {},
			}
			if (model.partyRule == 'leftright') {
				var numParties = 2
			} else {
				// for now, the number of votergroups is the number of parties
				var numParties = model.voterGroups.length || 1 // default to 1
			}
			for ( var j = 0; j < numParties; j++)  { 
				model.district[i].parties.push({voterPeople:[],candidates:[]})
			}
		}

		// new sorted list of all voters
		// still refers to original voterPerson objects.
		var voterPeopleSorted = model.voterSet.getAllVoters() 
		voterPeopleSorted.sort(function(a,b){return a.y - b.y})

		// assign voters equally to districts, and make lists of voters in districts
		var factor = model.nDistricts / model.voterSet.totalVoters
		var oldDistrict = 0
		var oldy = 0 // boundary starts here
		var firsty = [oldy]
		var lasty = []
		for (var i = 0; i < voterPeopleSorted.length; i++) {
			var voterPerson = voterPeopleSorted[i]

			// assign
			var d =  Math.floor(i * factor)
			voterPerson.iDistrict = d  // store district id with voters,
			
			// not used.. but we could refer to a voter's order of assignment to a district
			// voterPerson.iPointWithinDistrict = model.district[d].voterPeople.length 

			// fill district[] with references to voters.
			model.district[d].voterPeople.push(voterPerson)

			// fill district borders for use with candidates
			var y = voterPerson.y
			if (oldDistrict != d) {
				oldDistrict =  d
				firsty.push(y)
				lasty.push(y)
			}
			oldy = y
		}
		lasty.push(oldy)

		// calculate district borders
		var borders = []
		for (var i = 0; i < model.nDistricts - 1; i++) {
			var middle = ( firsty[i+1] + lasty[i] ) * .5
			borders.push(middle)
		}
		for (var i = 0; i < model.nDistricts; i++) {
			if (i == 0) {
				model.district[i].lowerBound = -Infinity
			} else {
				model.district[i].lowerBound = borders[i-1]
			}
			if (i == model.nDistricts - 1) {
				model.district[i].upperBound = Infinity
			} else {
				model.district[i].upperBound = borders[i]
			}
		}

		// put voters into parties
		for (var i = 0; i < voterPeopleSorted.length; i++) {
			var voterPerson = voterPeopleSorted[i]
			if (model.partyRule == 'leftright') {
				var iParty = ( voterPerson.x > model.size * .5 ) ? 1 : 0
			} else { // 'crowd'
				var iParty = voterPerson.iGroup
			}
			voterPerson.iParty = iParty  // easy, for now
			var d = voterPerson.iDistrict
			model.district[d].parties[iParty].voterPeople.push(voterPerson) // fill district.parties[i].voters with references to voters
		}
		
		// For each voter, this takes the index over all districts, and it gives the index within a district.
		model.districtIndexOfVoter = []
		for (var iDistrict = 0; iDistrict < model.nDistricts; iDistrict++) {
			var voterPeople = model.district[iDistrict].voterPeople
			for (var i = 0; i < voterPeople.length; i++) {
				var iAll = voterPeople[i].iAll
				model.districtIndexOfVoter[iAll] = i
			}
		}


		self.redistrictCandidates()
	}

	self.redistrictCandidates = function() {
		// fill candidates with info on district.
		for(var i=0; i<model.candidates.length; i++){
			var c = model.candidates[i]
			self.candidatePicksDistrict(c)
		}

		// fill district[] with info on candidates.
		self.districtsListCandidates()
	}

	self.candidatePicksDistrict = function(c) {
		// put candidate into correct district
		for (var i = 0; i < model.nDistricts; i++) {
			var uB = model.district[i].upperBound
			if (c.y < uB) {
				c.iDistrict = i
				break
			}
		}

		// put candidate into correct party
		if (model.partyRule == 'leftright') {
			c.iParty = ( c.x > model.size * .5 ) ? 1 : 0
		} else if (model.district[c.iDistrict].parties.length == 1){
			c.iParty = 0
		} else {
			var min = Infinity
			for ( var j = 0; j < model.voterGroups.length; j++){
				var dist2 = distF2(model, model.voterGroups[j], c)
				if (min > dist2) {
					min = dist2
					c.iParty = j
				}
			}
		}
	}
	self.districtsListCandidates = function() {
		// fill district[] with info on candidates.
		// reset
		for (var i = 0; i < model.nDistricts; i++) {
			var district = model.district[i]
			district.candidates = []
			district.candidatesById = {}
			district.preFrontrunnerIds = []
			for ( var j = 0; j < district.parties.length; j++)  {
				district.parties[j].candidates = []
			}
		}
		
		// assign candidates to districts' lists
		for(var i=0; i<model.candidates.length; i++){
			var c = model.candidates[i]
			model.district[c.iDistrict].candidates.push(c)
			model.district[c.iDistrict].candidatesById[c.id] = c
		}

		// assign frontrunners to districts' lists
		for(var i=0; i<model.preFrontrunnerIds.length; i++){
			var cid = model.preFrontrunnerIds[i]
			var c = model.candidatesById[cid]
			model.district[c.iDistrict].preFrontrunnerIds.push(cid)
		}

		// assign candidates to district party candidates
		for(var i=0; i<model.candidates.length; i++){
			var c = model.candidates[i]
			model.district[c.iDistrict].parties[c.iParty].candidates.push(c)
		}

	}

}

// helper
_pileVoters = function(model) {
	if (model.dimensions != "2D") {
		if (0) {
			// list all the voters
			// drop the voters
			// store the new positions
			var forward = true
	
			var betweenDist = 5
			var stackDist = 5
			var added = []
			var todo = []
	
			if (forward) {
				for (var m = 0; m < model.voterGroups.length; m++) {
					var points = model.voterGroups[m].points
					for (var i = 0; i < points.length; i++) {
						todo.push([m,i])
					}
				}
				// for (var i = 0 ; i < self.points.length; i++) {
				// 	todo.push(i)
				// }
			} else {
				// for (var i = self.points.length - 1 ; i >= 0; i--) {
				// 	todo.push(i)
				// }
			}
			var level = 1
			while (todo.length > 0) {
				for (var c = 0; c < todo.length; c++) {
					var m = todo[c][0]
					var i = todo[c][1]
					// look for collisions
					var collided = false
					for (var d = 0; d < added.length; d++) {
						var o = added[d][0]
						var k = added[d][1]
						x1 = model.voterGroups[o].points[k][0] + model.voterGroups[o].x
						x2 = model.voterGroups[m].points[i][0] + model.voterGroups[m].x
						xDiff = Math.abs(x1 - x2)
						if (xDiff < betweenDist) {
							collided = true
							break
						}
					}
					if (! collided) {
						model.voterGroups[m].points[i][2] = (level-1) * -stackDist
						added.push([m,i])
						todo.splice(c,1)
						c--
					}
				}
				level++
				var added = []
			}
		}else {
			// go through each voter and scale it and add to a background
			var stdev = []
			var amplitude = []
			var radius = []
			var halfwidth = []
			var halfheight = []
			for (var m = 0; m < model.voterGroups.length; m++) {
				var v = model.voterGroups[m]
				var points = v.points
				amp_factor = 70
				var u = 1.5
				if (!v.isGaussianVoters) {
					stdev[m] = 5
				} else if (v.crowdShape == "gaussian sunflower") {
					stdev[m] = v.stdev
				} else if (v.crowdShape == "circles") {
					radius[m] = v.radius
				} else if (v.crowdShape == "rectangles") {
					halfwidth[m] = v.halfwidth
					halfheight[m] = v.halfheight
				} else if (v.snowman) {
					if (v.disk == 3) {
						stdev[m] = u * 42 // 60
						radius[m] = 72
					} else if (v.disk == 2) {
						stdev[m] = u * 38 // 55
						radius[m] = 72
					} else if (v.disk == 1) {
						stdev[m] = u * 29 // 45
						radius[m] = 48
					}
				} else { // oldest method, disks
					if (v.disk == 3) {
						stdev[m] = 112
					} else if (v.disk == 2) {
						stdev[m] = u * 54 // 70
						radius[m] = 96
					} else if (v.disk == 1) {
						stdev[m] = u * 41 // 60
						radius[m] = 72
					}
				} 
				stdev[m] = stdev[m] * model.spread_factor_voters * .5
				radius[m] = radius[m] * model.spread_factor_voters * .5
				if (v.crowdShape == "gaussian sunflower") {
					amplitude[m] = v.points.length/stdev[m] * amp_factor
				} else if (v.crowdShape == "rectangles") {
						amplitude[m] = v.points.length/halfwidth[m] * amp_factor * .75
				} else if (v.disk) {
					if (!v.snowman && v.disk==3 && v.crowdShape != "circles") {
						amplitude[m] = v.points.length/stdev[m] * amp_factor
					} else {
						amplitude[m] = v.points.length/radius[m] * amp_factor
					}
				} 
				sum2 = 0
				max = 0
				for (var i = 0; i < v.points.length; i++) {
					var x = v.points[i][0]
					if (Math.abs(x) < 300) sum2 = sum2 + x ** 2
					if (max < x) max = x
				}
				sd = Math.sqrt(sum2/points.length)
				// console.log(sd)
				// console.log(stdev[m])
				// console.log(max)
				for (var i = 0; i < points.length; i++) {
					var x = v.points[i][0]
					var y = v.points[i][1]
					var back = 0
					for (var k = 0; k < m; k++) {
						var o = model.voterGroups[k]
						// add background
						if (o.crowdShape == "gaussian sunflower") {
							back -= gaussian( x , o.x-v.x , stdev[k] ) * amplitude[k]
						} else if (o.crowdShape == "rectangles") {
							back -= step( x , o.x-v.x , halfwidth[k] ) * amplitude[k]
						} else if (o.isSingleVoter) {
							// skip... ideally, single voters shouldn't have o.disk specified
						} else if (o.disk) {
							if (!o.snowman && o.disk==3 && o.crowdShape != "circles") {
								back -= gaussian( x , o.x-v.x , stdev[k] ) * amplitude[k]
							} else {
								back -= disk( x , o.x-v.x , radius[k]+5) * .5 * (amplitude[k] + 15)
							}
						} 
					}
					// add voters
					if (v.crowdShape == "gaussian sunflower") {
						v.points[i][2] = back + (_erf(y/stdev[m])-1) * .5 * gaussian(x,0,stdev[m]) * amplitude[m]
					} else if (v.crowdShape == "rectangles") {
						v.points[i][2] = back +  (y / halfheight[m] - 1) * .5 * amplitude[k]
					} else if (v.disk) {
						if (!v.snowman && v.disk==3 && v.crowdShape != "circles") {
							v.points[i][2] = back + (_erf(y/stdev[m])-1) * .5 * gaussian(x,0,stdev[m]) * amplitude[m]
						} else {
							if (1) {
								v.points[i][2] = back + ((y/Math.sqrt(radius[m] ** 2 - x ** 2))-1) * .25 * disk(x,0,radius[m] + 0) * amplitude[m]
							} else if (0) {
								v.points[i][2] = back + (intDisk0(y/(radius[m] + 0))-1) * .5 * disk(x,0,radius[m] + 0) * amplitude[m]
							} else {
								v.points[i][2] = back + (_erf(y/radius[m])-1) * .5 * disk(x,0,radius[m] + 5) * amplitude[m]
							}
						}
					} // don't need to put single voters there...
				}
			}
			function gaussian(x,mean,stdev) {
				return Math.exp(-( (x - mean)**2 / (2 * stdev ** 2))) * 1/Math.sqrt(2*Math.PI)
			}
			function disk(x,mean,stdev) {
				var inside = stdev ** 2 - (x - mean)**2
				return (inside > 0) ? Math.sqrt(inside)/stdev : 0
			}
			function intDisk(x,mean,stdev) {
				return (stdev ** 2 * (.5 * Math.asin(x/stdev) + .25 * Math.sin(2 * Math.asin(x/stdev)))) / (3.14 * .5)
			}
			function intDisk0(x) {
				if (x < -1) return 0
				if (x > 1) return 1
				return ((.5 * Math.asin(x) + .25 * Math.sin(2 * Math.asin(x)))) / (3.14 * .5) + .5
			}
			function step(x,mean,halfwidth) {
				var inside = halfwidth - Math.abs(x-mean)
				return (inside > 0) ? 1 : 0
			}
			
		}
	}
}

console.log('ding')