
function main_ballot(ui){
	var preset = ui.preset
	var ballotType = preset.config.ballotType
	var presetName = ui.presetName

	var BallotType = window[ballotType+"Ballot"];

	var l = new Loader()
	l.onload = function(){

		// CREATE
		var model = new Model(presetName);
        model.createDOM()

		// CONFIGURE
		model.size = 250
		model.border = 2
		model.startAt1 = true
		model.theme = "Nicky"
		model.doOriginal = true

		// INIT
		model.initDOM()

		var basediv = document.querySelector("#" + presetName)
		basediv.appendChild(model.dom);
		model.initPlugin = function(){
			// CREATE
			model.voterGroups.push(new SingleVoter(model))
			model.candidates.push(new Candidate(model))
			model.candidates.push(new Candidate(model))
			model.candidates.push(new Candidate(model))
			// CONFIGURE
			Object.assign( model.voterGroups[0],{x: 81, y: 92, typeVoterModel: ballotType} )
			Object.assign( model.candidates[0],{x: 41, y: 50, icon:"square"} )
			Object.assign( model.candidates[1],{x:153, y: 95, icon:"triangle"} )
			Object.assign( model.candidates[2],{x:216, y:216, icon:"hexagon"} )
			model.firstStrategy = "zero strategy. judge on an absolute scale."
			// INIT
			model.candidates[0].init()
			model.candidates[1].init()
			model.candidates[2].init()
			model.initMODEL()
			model.voterManager.initVoters()
			// UPDATE
			if(ballotType=="Score") {
				model.voterGroups[0].voterModel.minscore = 1
			}
			model.dm.redistrict()
			model.update()
		};


		// CREATE A BALLOT
		var ballot = new BallotType(model);
		basediv.appendChild(ballot.dom);
		model.onUpdate = function(){
			ballot.update(model.voterGroups[0].voterPeople[0].stages[model.stage].ballot);
		};

		// UPDATE
		model.initPlugin();
		model.update()

	};

	l.load([
		
		// the peeps
		"play/img/voter_face.png",
		"play/img/square.png",
		"play/img/triangle.png",
		"play/img/hexagon.png",
		
		// Ballot instructions
		"play/img/ballot_fptp.png",
		"play/img/ballot_ranked.png",
		"play/img/ballot_approval.png",
		"play/img/ballot_range_original.png",

		// The boxes
		"play/img/ballot_box.png",
		"play/img/ballot_rate_original.png"

	]);

}