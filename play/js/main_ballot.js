
function main_ballot(ui){
	// See sandbox.js for documentation
	// main_ballot is a little different because there is no save button
	// Some variables in config cannot be changed by the user.
	// So, if we were going to save, then it would be good to not keep those in config.

	// The config is basically a text version of the model.
	// The model should store all its variables
	// and the model should always make decisions based on its own variables
	// because maybe those variables could change without updating the config
	// because some things happen internally in the model.

	// The only way the model can hook back into the ui is by providing a callback in main_ballot.
	// Otherwise, it is a one way street.
	// The config updates the model.
	// The model does not update the config.

	// The reason why some things are in start and others are not is that some need assets and others do not.
	// So, the ui.onload function could include more or less things before it, depending on how we want to laoad assets.
	// For instance, we could lazy load all the assets when they become required to draw on a button.



	// Summary of changes regarding thePlan: 
	// I added thePlan as a way to make changes to the ui.
	// It's like config but for the ui.
	// This is in development.
	// Maybe the one important change is with ui.menu.frun.createDOM
	// where I am able to make edits on the menu earlier in the code
	// because I can create the DOM later.
	
	
    if (ui == undefined) ui = {}
    ui.attach = new Attach(ui)
    // handle input
	ui.attach.handleInputMain()

	var model = new Model(ui.idModel)
	ui.model = model
	ui.attach.attachDOM(model)

    var config = {}
	var initialConfig = {}
	var thePlan = {}
	ui.config = config
	
	// load the config
	configBallot(config, initialConfig, ui.preset.config)
	
	// fix the plan
	// get the plan ready for use, if it isn't already.  
	// config is here because we still just use one variable config to set up two things, ui and model
	setPlan(thePlan,config)


	// really all the possibilities for the user experience are in these bind functions
	// the rest is just 
	// bind this plugin to the model
	bindBallotModel(ui,model,config)

	// sets up the menu functions before using them
	bindBallotMenu(ui,model,config)

	// here is an insertion point where you could edit the plan

	// starts ui, according to plan
	planUI(ui,thePlan)
	model.planModel()

    ui.onload = function(assets){  
		// this line of code could go up or down, depending on whether we really need to load assets
		// for example, createDOMB needs assets, and initDOM definitely needs assets
		
		
		createDOMB(ui,model) // doesn't depend on model
		createUIArenaB(ui,model,config,initialConfig) // doesn't depend on model
		 
		createMenuB(ui) // the parts that the depend on the model get re-done with onUpdate

		// INIT
		model.assets = assets // doesn't need to be run with start because assets don't change
		model.initPlugin(); // doesn't need initDOM or createDOMB internally because there are no settings on the ballot that change these
		
		if (ui.preset.update) ui.preset.update() // depends on the ui.menu being done (after createMenuB) // run some extra stuff specified by the preset
	
	
		// UPDATE
		model.update() // depends on the menu having been created: createMenuB()
		ui.selectMENU()
    }; 

	var l = new Loader()
	l.onload = ui.onload
	l.load(main_ballot.assets);




}

function configBallot(config,initialConfig, presetConfig){

	_copyAttributes(config, presetConfig)

	var translate = {
		Plurality:"FPTP",
		Ranked:"IRV",
		Approval:"Approval",
		Score:"Score"
	}
	config.system = config.system || translate[config.ballotType] || "FPTP"
	config.firstStrategy = config.firstStrategy || "zero strategy. judge on an absolute scale.";
	config.preFrontrunnerIds = config.preFrontrunnerIds || ["square","triangle"];
	config.doStarStrategy = config.doStarStrategy || false
	config.theme = config.theme || "Default"
	config.dimensions = config.dimensions || "2D"
	config.namelist = ""
	config.customNames = "No"

	// grandfather name for firstStrategy used only for main_ballot
	if (config.strategy != undefined) config.firstStrategy = config.strategy

	// make a copy of the config
	_copyAttributes(initialConfig,config)

}

function setPlan(thePlan,config) {
	thePlan.newWay = config.newWay || false
	thePlan.way1 = true
	thePlan.ballotType = config.ballotType  // it would also make it look nicer to separate config and plan
	thePlan.showChoiceOfStrategy = config.showChoiceOfStrategy || false
	thePlan.showChoiceOfFrontrunners = config.showChoiceOfFrontrunners || false
}


function planUI (ui,thePlan) {
	// binds UI to plan
	ui.newWay = thePlan.newWay
	ui.way1 = thePlan.way1
	ui.BallotType = window[thePlan.ballotType+"Ballot"]
	ui.showChoiceOfStrategy = thePlan.showChoiceOfStrategy
	ui.showChoiceOfFrontrunners = thePlan.showChoiceOfFrontrunners
}


function createDOMB(ui,model) {
	// This is what the ui is all about.  It makes the DOM.

	// CREATE div stuff
	model.createDOM()

	ui.dom.left = newDivOnBase("b-left")
	ui.dom.right = newDivOnBase("b-right")
	function newDivOnBase(name) {
		var a = document.createElement("div");
		a.setAttribute("id", name);
		ui.dom.basediv.appendChild(a);
		return a
	}

	ui.dom.left.appendChild(model.dom);
	
	// CREATE A BALLOT
	if (ui.newWay) { // build ui
		if (ui.way1) {
			ui.dom.caption = document.createElement("div");
			ui.dom.caption.id = "caption";
			ui.dom.right.appendChild(ui.dom.caption)
		}
	} else {
		ui.dom.ballot = new ui.BallotType(model);
		ui.dom.right.appendChild(ui.dom.ballot.dom)
	}


}

function bindBallotMenu(ui,model,config) {

	// the ui is a model that plugs into Model
	// it needs an update
	// and an init
	// and those functions go into bindModel
	// so these menu items may also need .update() and .draw()

	ui.menu = {}

	ui.menu.strategy = {}

	var strategyOn = [
		{name:"O", realname:"zero strategy. judge on an absolute scale.", margin:4},
		{name:"N", realname:"normalize", margin:4},
		{name:"F", realname:"normalize frontrunners only", margin:4},
		{name:"F+", realname:"best frontrunner", margin:4},
		{name:"F-", realname:"not the worst frontrunner"}
	];
	// old ones
	// {name:"FL", realname:"justfirstandlast", margin:4},
	// {name:"T", realname:"threshold"},
	// {name:"SNTF", realname:"starnormfrontrunners"}
	var onChooseVoterStrategyOn = function(data){
		config.firstStrategy = data.realname;
		model.firstStrategy = config.firstStrategy
		model.voterGroups[0].firstStrategy = config.firstStrategy;
		model.update();

	};
	ui.menu.strategy.createDOM = function() {
		ui.menu.strategy.chooseVoterStrategyOn = new ButtonGroup({
			label: "which strategy?",
			width: 42,
			data: strategyOn,
			onChoose: onChooseVoterStrategyOn
		});
	}

	ui.menu.frun = {}

	function _iconButton(id) {
		return "<span class='buttonshape'>"+model.icon(id)+"</span>"
	}
	var frunMakelist = function() {
		var a = []
		for (var i=0; i < model.candidates.length; i++) {
			var c = model.candidates[i]
			a.push({
				name:_iconButton(c.id),
				realname:c.id,
				margin:4
			})
		}
		if (a.length > 0) a[a.length-1].margin = 0
		return a
	}
	
	var onChooseFrun = function(data){

		// update config...
		// no reset...
		if (data.isOn) {
			if (!config.preFrontrunnerIds.includes(data.realname) ) {config.preFrontrunnerIds.push(data.realname)}
		} else {
			var index = config.preFrontrunnerIds.indexOf(data.realname);
			if (index > -1) {
				config.preFrontrunnerIds.splice(index, 1);
			}
		}
		model.preFrontrunnerIds = config.preFrontrunnerIds
		for (var i=0; i<model.voterGroups.length; i++) {
			model.voterGroups[i].preFrontrunnerIds = config.preFrontrunnerIds
		}
		model.dm.districtsListCandidates()
		model.update();

	};
	ui.menu.frun.createDOM = function() {
		// This is an important change.  It allows the user to put this whole bindBallotMenu function earlier in the code's logic
		// That allows the coder to put more information into the menu item's section of code,
		// which makes the code easier to read.
		ui.menu.frun.chooseFrun = new ButtonGroup({
			label: "who are the frontrunners?",
			width: 42,
			makeData: frunMakelist, // this depends on the model
			onChoose: onChooseFrun,
			isCheckbox: true
		});
	}
	ui.menu.frun.redraw = function() {
		// we redraw these buttons because calls to model.icon might use a placeholder for an image when it's loading
		if(ui.showChoiceOfFrontrunners) {
			 // needed to call model.icon again for placeholders
			ui.menu.frun.chooseFrun.redraw()
		}
	}

	ui.selectMENU = function(){
		if(ui.menu.strategy.chooseVoterStrategyOn) ui.menu.strategy.chooseVoterStrategyOn.highlight("realname", config.firstStrategy);
		if(ui.menu.frun.chooseFrun) ui.menu.frun.chooseFrun.highlight("realname", config.preFrontrunnerIds);
	};

}

function createMenuB(ui) {
	// depends on the model

	if(ui.showChoiceOfStrategy) {
		ui.menu.strategy.createDOM()
		ui.dom.left.appendChild(ui.menu.strategy.chooseVoterStrategyOn.dom);
	}
	if(ui.showChoiceOfFrontrunners) {
		ui.menu.frun.createDOM()
		ui.dom.left.appendChild(ui.menu.frun.chooseFrun.dom);
	}
}
	
function createUIArenaB(ui,model,config,initialConfig) {
	//////////////////////////
	//////// RESET... ////////
	//////////////////////////

	// CREATE A RESET BUTTON
	var resetDOM = document.createElement("div");
	resetDOM.id = "reset";
	resetDOM.innerHTML = "reset";
	resetDOM.onclick = function(){
		// LOAD
		_copyAttributes(config, initialConfig)
		// CREATE, CONFIGURE, INIT
		if (ui.preset.update) ui.preset.update() // depends on the ui.menu being done (after createMenuB) // run some extra stuff specified by the preset
		model.reset()
		// UPDATE
		model.update()
		// UPDATE
		ui.selectMENU()
		
	};
	ui.dom.left.appendChild(resetDOM);
}

function bindBallotModel(ui,model,config) {

	model.planModel = function() {
		// LOAD
		model.size = 250
		model.border = 2
		model.ballotType = config.ballotType
		model.system = config.system
		model.newWay = ui.newWay
	}

	model.initPlugin = function(){

		model.initDOM()
		
		// CREATE
		model.voterGroups.push(new SingleVoter(model))
		model.candidates.push(new Candidate(model))
		model.candidates.push(new Candidate(model))
		model.candidates.push(new Candidate(model))
		model.voterCenter = new VoterCenter(model)
		// CONFIGURE
		Object.assign( model.candidates[0],{x: 41, y: 50, icon:"square"} )
		Object.assign( model.candidates[1],{x:153, y: 95, icon:"triangle"} )
		Object.assign( model.candidates[2],{x:216, y:216, icon:"hexagon"} )
		Object.assign( model.voterGroups[0],    {x: 81, y: 92, typeVoterModel: model.ballotType,
			firstStrategy: config.firstStrategy,
			preFrontrunnerIds: config.preFrontrunnerIds} )
		model.preFrontrunnerIds = config.preFrontrunnerIds;
		model.firstStrategy = config.firstStrategy
		model.doStarStrategy = config.doStarStrategy;
		model.theme = config.theme
		model.dimensions = config.dimensions
		model.customNames = config.customNames
		model.namelist = config.namelist.split("\n")
		// INIT
		model.candidates[0].init()
		model.candidates[1].init()
		model.candidates[2].init()
		model.initMODEL()
		model.voterGroups[0].init()
		model.dm.redistrict()

	};

	model.onInitModel = function() {
		
		if(ui.showChoiceOfStrategy) {
			ui.menu.frun.chooseFrun.init()
			ui.selectMENU()
		}
	}

	_insertFunctionAfter( model,"onUpdate", function() {
		
		
		if (model.voterGroups.length == 0) return
		var ballot = model.voterGroups[0].voterPeople[0].ballot // just pick the first ballot to show
		if (model.newWay) {
			// onDraw
		} else {
			ui.dom.ballot.update(ballot);
		}

	})


	model.onDraw = function(){
		
		var ready = model.nLoading == 0 ||  ! model.placeHolding
		// ready to replace
		// two different ways to replace the image


		if ( ready ) {

			// 1 : call draw again
			ui.menu.frun.redraw()
		}


		if (model.voterGroups.length == 0) return
		if (model.voterGroups[0].voterGroupType == "GaussianVoters") return
		if (model.newWay) {
			var text = model.voterGroups[0].voterModel.toTextH(model.voterGroups[0].voterPeople[0].ballot);
			if ( ready ) {

				// 2 : replace the Placeholder
				text = text.replace(/\^Placeholder{(.*?)}/g, (match, $1) => {
					return model.icon($1)
				});  // https://stackoverflow.com/a/49262416

				
				if (ui.way1) {
					ui.dom.caption.innerHTML = text
				} else {
					ui.dom.right.innerHTML = text
				}
			}
		}
	}


}




main_ballot.assets = [
	
	// the peeps
	"play/img/voter_face.png",

	"play/img/square.png",
	"play/img/triangle.png",
	"play/img/hexagon.png",
	"play/img/pentagon.png",
	"play/img/bob.png",

	"play/img/square.svg",
	"play/img/triangle.svg",
	"play/img/hexagon.svg",
	"play/img/pentagon.svg",
	"play/img/bob.svg",

	"play/img/blue_bee.png",
	"play/img/yellow_bee.png",
	"play/img/red_bee.png",
	"play/img/green_bee.png",
	"play/img/orange_bee.png",

	// plus
	"play/img/plusCandidate.png",
	"play/img/plusOneVoter.png",
	"play/img/plusVoterGroup.png",

	// Ballot instructions
	"play/img/ballot5_fptp.png",
	"play/img/ballot5_ranked.png",
	"play/img/ballot5_approval.png",
	"play/img/ballot5_range.png",

	// The boxes
	"play/img/ballot5_box.png",
	"play/img/ballot_rate.png",
	"play/img/ballot_three.png"

];