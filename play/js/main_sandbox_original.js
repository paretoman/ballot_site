function sandbox(ui){

	var presetName = ui.presetName
	var preset = ui.preset
	var config = preset.config
    var basediv = document.querySelector("#" + presetName)
    // CREATE div stuff for sandbox
    function newDivOnBase(name) {
        var a = document.createElement("div");
        a.setAttribute("id", name);
        basediv.appendChild(a);
    }
    newDivOnBase("left")
    newDivOnBase("center")
	newDivOnBase("right")
	

	// Big update: Added pattern to the code: LOAD, CREATE, CONFIGURE, INIT, & UPDATE. LOAD loads the input or defaults.  CREATE makes an empty data structure to be used.  CONFIGURE adds all the input to the data structure.  INIT completes the data structure by doing steps that needed to use the data structure as input, and is otherwise similar to CONFIGURE.  UPDATE runs the actions, now that the data structure is complete.

	// LOAD DEFAULTS and INPUT
	var defaults = {
		system: "FPTP",
		candidates: 3,
		voters: 1,
		features: 1 // 1-basic, 2-voters, 3-candidates, 4-save
	}	
	var url = window.top.location.href;


	// CONFIGURE - configure data structures based on LOAD to be ready for INIT
	// in this case: config, initialConfig are the data structures.

	_fillInDefaults(config,defaults)
	///////////////////////////////////////////////////////////////
	// ACTUALLY... IF THERE'S DATA IN THE QUERY STRING, OVERRIDE //
	///////////////////////////////////////////////////////////////
	var _getParameterByName = function(name,url){
		name = name.replace(/[\[\]]/g, "\\$&");
		var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
		results = regex.exec(url);
		if (!results) return null;
		if (!results[2]) return '';
		return decodeURIComponent(results[2].replace(/\+/g, " "));
	};
	var modelData = _getParameterByName("m",url);
	if(modelData){
		// Parse!
		var data = JSON.parse(modelData);
		// Turn into initial config
		config = {
			features: 4,
			system: data.s,
			candidates: data.c.length,
			candidatePositions: data.c,
			voters: data.v.length,
			voterPositions: data.v,
			description: data.d
		};
	}
	var initialConfig = JSON.parse(JSON.stringify(config));


	var l = new Loader()
	// INIT - initialize all data structures
	l.onload = function(){

		////////////////////////
		// THE FRIGGIN' MODEL //
		////////////////////////

		// CREATE
			
		var ui = {}
		
		var model = new Model(presetName);
		ui.model = model
        model.createDOM()

		// CONFIGURE DEFAULTS
		model.optionsForElection = {sidebar:true, originalCaption:true}
		model.HACK_BIG_RANGE = true;
		model.theme = "Nicky"
		model.doOriginal = true
		model.ballotConcept = "off"

		// INIT
		ui.model = model
		model.initDOM()
		basediv.querySelector("#center").appendChild(model.dom);
		model.dom.removeChild(model.caption);
		basediv.querySelector("#right").appendChild(model.caption);
		model.caption.style.width = "";
		model.initPlugin = function(){
			// CREATE
			for(var i=0; i<config.candidates; i++) model.candidates.push(new Candidate(model))
			for(var i=0; i<config.voters; i++) model.voterGroups.push(new GaussianVoters(model))
			// CONFIGURE
			//     expand config to calculate some values to add to the model			
			//     load expanded config into the model
			//     configure writes to model and reads from config.  Sanity rule: configure does not read from model.
			_menuF("configure")   
			// INIT
			for (var i=0; i<model.candidates.length; i++) {
				model.candidates[i].init()
			}
			model.initMODEL()
			for (var i=0; i<model.voterGroups.length; i++) {
				model.voterGroups[i].init()
			}
			model.dm.redistrict()
			model.update()
		};

		// helper
		function _menuF(f) { // run function if it exists for each menu item
			for(var item in ui.menu ) {
				if (ui.menu[item][f]) ui.menu[item][f]()
			} 
		}
		
		//////////////////////////////////
		// BUTTONS - WHAT VOTING SYSTEM //
		//////////////////////////////////


		ui.menu = {}

		// Which voting system?
		ui.menu.systems = new function() { // "new function () {code}" means make an object "this", and run "code" in a new scope
			// I made a singleton class so we can use "self" instead of saying "systems" (or another button group name).  
			// This is useful when we want to make another button group and we copy and paste this code.
			// It might be better to make a class and then an instance, but I think this singleton class is easier.
			// single = function() {stuff}; var systems = new single()
			var self = this
			self.name = "systems"

			self.list = [
				{name:"FPTP", ballotType:"Plurality", election:Election.plurality, margin:4},
				{name:"IRV", ballotType:"Ranked", election:Election.irv},
				{name:"Borda", ballotType:"Ranked", election:Election.borda, margin:4},
				{name:"Condorcet", ballotType:"Ranked", election:Election.condorcet},
				{name:"Approval", ballotType:"Approval", election:Election.approval, margin:4},
				{name:"Score", ballotType:"Score", election:Election.score}
			];
			self.listByName = function() {
				var votingSystem = self.list.filter(function(system){
					return(system.name==config.system);
				})[0];
				return votingSystem;
			}
			self.onChoose = function(data){
				// LOAD INPUT
				config.system = data.name;
				// CONFIGURE
				self.configure()
				// UPDATE
				for(var i=0;i<model.voterGroups.length;i++){
					model.voterGroups[i].init()
				}
				model.dm.redistrict()
				model.update();
			};
			self.configure = function() {
				var s = self.listByName()
				model.election = s.election
				model.system = config.system;
				model.ballotType = s.ballotType
				for(var i=0;i<model.voterGroups.length;i++){
					model.voterGroups[i].typeVoterModel = s.ballotType
				}
			}
			self.select = function() {
				self.choose.highlight("name", config.system)
			}
			self.choose = new ButtonGroup({
				label: "what voting system?",
				width: 108,
				data: self.list,
				onChoose: self.onChoose
			});
			basediv.querySelector("#left").appendChild(self.choose.dom);
		}

		// How many voters?
		ui.menu.voters = new function() {
			var self = this
			self.list = [
				{name:"one", num:1, margin:5},
				{name:"two", num:2, margin:5},
				{name:"three", num:3},
			]
			self.onChoose = function(data){
				// LOAD INPUT
				config.voters = data.num;
				config.voterPositions = null
				// CREATE
				model.voterGroups = []
				for(var i=0; i<config.voters; i++) {
					model.voterGroups.push(new GaussianVoters(model))
				}
				// CONFIGURE
				self.configure()
				// INIT
				model.initMODEL()
				for(var i=0; i<model.voterGroups.length; i++) {
					model.voterGroups[i].init()
				}
				// UPDATE
        		model.dm.redistrict()
				model.update()
			};
			self.configure = function() {
				model.numOfVoters = config.voters;
				var num = config.voters;
				if (config.voterPositions) {
					for(var i=0; i<num; i++){
						var pos = config.voterPositions[i];
						Object.assign(model.voterGroups[i], {
							num:(4-num),
							x:pos[0], y:pos[1]
						})
						model.voterGroups[i].typeVoterModel = ui.menu.systems.listByName(config).ballotType // needs init
					}
				} else {
					var voterPositions;
					if(num==1){
						voterPositions = [[150,150]];
					}else if(num==2){
						voterPositions = [[150,100],[150,200]];
					}else if(num==3){
						voterPositions = [[150,115],[115,180],[185,180]];
					}

					var votingSystem = ui.menu.systems.list.filter(function(system){
						return(system.name==config.system);
					})[0];
					for(var i=0; i<num; i++){
						var pos = voterPositions[i];
						Object.assign(model.voterGroups[i], {
							disk:(4-num),
							x:pos[0], y:pos[1]
						})
						model.voterGroups[i].typeVoterModel = ui.menu.systems.listByName(config).ballotType // needs init
					}
				}
			}
			self.select = function() {
				self.choose.highlight("num", config.voters)
			}
			self.choose = new ButtonGroup({
				label: "how many groups of voters?",
				width: 70,
				data: self.list,
				onChoose: self.onChoose
			});
			basediv.querySelector("#left").appendChild(self.choose.dom);
		}

		if(initialConfig.features<2){ // VOTERS as feature.
			ui.menu.voters.choose.dom.hidden = true
		}
		
		// How many voters?
		ui.menu.candidates = new function() {
			var self = this
			self.list = [
				{name:"two", num:2, margin:4},
				{name:"three", num:3, margin:4},
				{name:"four", num:4, margin:4},
				{name:"five", num:5}
			];
			self.onChoose = function(data){
				// LOAD INPUT
				config.candidates = data.num;
				config.candidatePositions = null
				// CREATE
				model.candidates = []
				for(var i=0; i<config.candidates; i++) {
					model.candidates.push(new Candidate(model))
				}
				// CONFIGURE
				self.configure()
				// INIT
				for(var i=0; i<model.candidates.length; i++) {
					model.candidates[i].init()
				}
				model.initMODEL()
				// UPDATE
        		model.dm.redistrict()
				model.update()
			};
			self.configure = function() {
				model.numOfCandidates = config.candidates;
				// Candidates, in a circle around the center.
				var _candidateIcons = Object.keys(Candidate.graphicsByIcon["Default"])
				var num = config.candidates;
				if (config.candidatePositions) {
					for(var i=0; i<num; i++){
						var icon = _candidateIcons[i];
						Object.assign(model.candidates[i],{
							icon:icon,
							x:config.candidatePositions[i][0],
							y:config.candidatePositions[i][1]
						})
					}
				} else {
					var angle = 0;
					switch(num){
						case 3: angle=Math.TAU/12; break;
						case 4: angle=Math.TAU/8; break;
						case 5: angle=Math.TAU/6.6; break;
					}
					for(var i=0; i<num; i++){
						var r = 100;
						var x = 150 - r*Math.cos(angle);
						var y = 150 - r*Math.sin(angle);
						var icon = _candidateIcons[i];
						Object.assign(model.candidates[i],{
							icon:icon,
							x:x,
							y:y
						})
						angle += Math.TAU/num;
					}

				}
			}
			self.select = function() {
				self.choose.highlight("num", config.candidates)
			}
			self.choose = new ButtonGroup({
				label: "how many candidates?",
				width: 52,
				data: self.list,
				onChoose: self.onChoose
			});
			basediv.querySelector("#left").appendChild(self.choose.dom);
		}

		if(initialConfig.features<3){ // CANDIDATES as feature.
			ui.menu.candidates.choose.dom.hidden = true
		}

		//////////////////////////
		//////// RESET... ////////
		//////////////////////////

		ui.arena = {}
		ui.arena.reset = new function() {
			var self = this
			var resetDOM = document.createElement("div");
			basediv.appendChild(resetDOM);
			resetDOM.id = "reset";
			resetDOM.innerHTML = "reset";
			resetDOM.style.top = "340px";
			resetDOM.style.left = "350px";
			resetDOM.onclick = function(){
				
				// LOAD INITIAL CONFIG
				config = JSON.parse(JSON.stringify(initialConfig));
				// RESET = CREATE, CONFIGURE, INIT, & UPDATE
				model.reset()
				model.update()

				// Back to ol' UI
				updateUI();

			};
			self.dom = resetDOM
		}

		//////////////////////////////////
		/////// SAVE & SHARE, YO! ////////
		//////////////////////////////////

		ui.arena.desc = new function() { // Create a description up top
			var self = this
			var descDOM = document.createElement("div");
			descDOM.id = "description_container";
			var refNode = basediv.querySelector("#left");
			basediv.insertBefore(descDOM, refNode);
			var descText = document.createElement("textarea");
			descText.id = "description_text";
			
			containText = document.createElement("div");
			containText.id = "double_description_container";
			descDOM.appendChild(containText);
			containText.appendChild(descText);
			// yay.

			// yay.
			descText.value = initialConfig.description;
			self.dom = descDOM
			self.text = {}
			self.text.dom = descText
		}


		ui.arena.save = new function() { // Create a "save" button
			var self = this
			var saveDOM = document.createElement("div");
			saveDOM.id = "save";
			saveDOM.innerHTML = "save:";
			saveDOM.style.top = "460px";
			saveDOM.style.left = "120px";
			saveDOM.onclick = function(){
				_saveModel();
			};
			basediv.appendChild(saveDOM);
			self.dom = saveDOM
		}

		ui.arena.linkText = new function() { // The share link textbox
			var self = this
			var linkText = document.createElement("input");
			linkText.id = "savelink";
			linkText.placeholder = "[when you save your model, a link you can copy will show up here]";
			linkText.setAttribute("readonly", true);
			linkText.onclick = function(){
				linkText.select();
			};
			basediv.appendChild(linkText);
			self.dom = linkText
		}

		if(initialConfig.features<4){ // SAVE & SHARE as feature.
			// hide menus
			ui.arena.desc.dom.hidden = true
			ui.arena.desc.text.dom.hidden = true
			ui.arena.save.dom.hidden = true
			ui.arena.save.dom.style.display = "none"
			ui.arena.linkText.dom.hidden = true
		} else {
			// Move that reset button
			ui.arena.reset.dom.style.top = "460px";
			ui.arena.reset.dom.style.left = "0px";
		}
	
		///////////////////////////
		////// SAVE POSITION //////
		///////////////////////////

		// helpers
		ui.saveDrags = function(log){

			// Candidate positions
			var positions = [];
			for(var i=0; i<model.candidates.length; i++){
				var candidate = model.candidates[i];
				positions.push([
					Math.round(candidate.x),
					Math.round(candidate.y)
				]);
			}
			if(log) console.log("candidatePositions: "+JSON.stringify(positions));
			var candidatePositions = positions;

			// Voter positions
			positions = [];
			for(var i=0; i<model.voterGroups.length; i++){
				var voter = model.voterGroups[i];
				positions.push([
					Math.round(voter.x),
					Math.round(voter.y)
				]);
			}
			if(log) console.log("voterPositions: "+JSON.stringify(positions));
			var voterPositions = positions;

			// positions!
			return {
				candidatePositions: candidatePositions,
				voterPositions: voterPositions
			};

		};

		// SAVE & PARSE
		// ?m={s:[system], v:[voterPositions], c:[candidatePositions], d:[description]}
		var _saveModel = function(){

			// Data!
			var data = {};

			// System?
			data.s = config.system;
			console.log("voting system: "+data.s);

			// Positions...
			var positions = ui.saveDrags(true);
			data.v = positions.voterPositions;
			data.c = positions.candidatePositions; 

			// Description
			var description = basediv.querySelector("#description_text");
			data.d = description.value;
			console.log("description: "+data.d);

			// URI ENCODE!
			var uri = encodeURIComponent(JSON.stringify(data));

			// ALSO TURN IT INTO INITIAL CONFIG. _parseModel
			initialConfig = {
				features: 4,
				system: data.s,
				candidates: data.c.length,
				candidatePositions: data.c,
				voters: data.v.length,
				voterPositions: data.v
			};

			// Put it in the save link box!
        	var baseUrl = document.baseURI
			// var getUrl = window.location;
			// var baseUrl = getUrl.protocol + "//" + getUrl.host; //http://ncase.me/ballot
			// var restofurl = getUrl.pathname.split('/')
			// for (var i=1; i < restofurl.length - 1; i++) { //  /ballot/
			// 	if (restofurl[i] != "sandbox") {
			// 		baseUrl += "/" + restofurl[i];
			// 	}
			// }
			var link = baseUrl + "sandbox/original?m="+uri;
			var savelink = basediv.querySelector("#savelink");
			savelink.value = "saving...";
			setTimeout(function(){
				savelink.value = link;
			},750);

		};

		// UPDATE
		model.initPlugin(); 
		model.update()
		updateUI();  // Select the UI!
		function updateUI() {
			_menuF("select")
		};
	};



	// UPDATE - run actions
	l.load([
		"play/img/voter_face.png",
		"play/img/square.png",
		"play/img/triangle.png",
		"play/img/hexagon.png",
		"play/img/pentagon.png",
		"play/img/bob.png"
	]);
	// FUNNY HACK.
	setInterval(function(){
		var ohno = basediv.querySelector("#ohno");
		if(!ohno) return;
		var x = Math.round(Math.random()*10-5);
		var y = Math.round(Math.random()*10)+10;
		ohno.style.top = y+"px";
		ohno.style.left = x+"px";
	},10);

};