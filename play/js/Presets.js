// This is only used by original.html and sandbox/original.html
// old way
function loadpreset (ui)  {

	// if we don't already have a ui.presetName, generate one
	// then look it up
	
	// ui.presetName: for the presets
	// ui.idModel : for the divs.  This is

	if (ui.presetName == "switch") {
		return	
	}

	// clumsy grandfather
	if (typeof(ui) == "string") {
		ui = {
			presetName:ui,
			idModel:ui,
		}
	}

	if(ui.quick != undefined) {
		ui.presetName = ui.quick
		ui.idModel = ui.quick
	}
	
	// default presetName
	if (ui.presetName == undefined ) {
		ui.presetName = "sandbox"
		// then we will end up skipping down to the bottom
	}

	_lookupPreset(ui)
	return ui
}

// new way
function _lookupPreset(ui) {

	// load the preset corresponding to the ui.presetName

	// e.g. loadpreset( {id:"sandbox"} )

	// input:
	// ui.presetName
	
	// output: additional attributes
	// ui.preset.config
	// ui.preset.update
	// ui.presetName (is generated if not provided)


	// defaults
	var config = {}
	var update = () => null
	var uiType = "election"
	

	// helpers
	var update_original = function () {
		ui.menu.systems.choose.buttons.forEach(x => x.dom.hidden = (["FPTP", "IRV", "Borda", "Condorcet", "Approval", "Score"].includes(x.dom.innerHTML)) ? false : true)
		ui.menu.systems.choose.buttons.forEach(x => x.dom.style.marginRight = "4px")
		ui.menu.systems.choose.buttons.forEach(x => x.dom.style.width = "106px")

		ui.menu.nVoterGroups.choose.buttons.forEach(x => x.dom.hidden = (["1", "2", "3"].includes(x.dom.innerHTML)) ? false : true)
		ui.menu.nCandidates.choose.buttons.forEach(x => x.dom.hidden = (["two", "three", "four", "five"].includes(x.dom.innerHTML)) ? false : true)
	}
	
	// configurations
	
	if (ui.presetName == "sandbox") {
		uiType = "sandbox"
		if (1) {
			config = {
				configversion: "2.5",
				ballotType: "Plurality",
				candidatePositions: [[92,69],[210,70],[245,182],[149,250],[55,180]],
				voterPositions: [[150,150]],
				dimensions: "2D",
				system: "FPTP",
				hidegearconfig: false,
				secondStrategies: [],
				percentSecondStrategy: [0,0,0,0,0,0,0,0,0,0],
				voter_group_count: [91,50,50,50,50,50,50,50,50,50],
				voter_group_spread: [230,190,190,190,190,190,190,190,190,190],
				sandboxsave: true,
				featurelist: ["systems","nVoterGroups","nCandidates"],
				description: "",
				keyyee: "newcan",
				snowman: false,
				x_voters: false,
				oneVoter: false,
				rbsystem: "Tideman",
				numOfCandidates: 5,
				numVoterGroups: 2,
				xNumVoterGroups: 4,
				nVoterGroupsRealName: "Two Groups",
				spread_factor_voters: 2,
				arena_size: 300,
				median_mean: 1,
				theme: "Letters",
				utility_shape: "linear",
				colorChooser: "pick and generate",
				colorSpace: "hsluv with dark",
				arena_border: 2,
				preFrontrunnerIds: ["square","triangle"],
				autoPoll: "Auto",
				firstStrategy: "zero strategy. judge on an absolute scale.",
				secondStrategy: "normalize frontrunners only",
				doTwoStrategies: false,
				yeefilter: [true,true,true,true,true],
				computeMethod: "ez",
				pixelsize: 60,
				candidateSerials: [0,1,2,3,4],
				voterGroupTypes: ["GaussianVoters"],
				voterGroupX: [false],
				voterGroupSnowman: [false],
				voterGroupDisk: [3],
				crowdShape: ["circles"],
				seats: 3,
				candidateB: [1,1,1,1,1],
				nDistricts: 1,
				votersAsCandidates: false,
				visSingleBallotsOnly: false,
				ballotVis: true,
				customNames: "No",
				namelist: "",
				menuVersion: "2",
				stepMenu: "vote",
				menuLevel: "normal",
				doFeatureFilter: false,
				yeeon: false,
				beatMap: "auto",
				kindayee: "newcan",
				ballotConcept: "auto",
				roundChart: "auto",
				sidebarOn: "on",
				lastTransfer: "off",
				voterIcons: "circle",
				candidateIconsSet: ["image","note"],
				pairwiseMinimaps: "off",
				textBallotInput: "",
				doTextBallots: false,
				behavior: "stand",
				showToolbar: "on",
				rankedVizBoundary: "atMidpoint",
				doElectabilityPolls: true,
				partyRule: "crowd",
				doFilterSystems: false,
				filterSystems: [],
				doFilterStrategy: true,
				includeSystems: ["choice","pair","score"],
				showPowerChart: true,
				putMenuAbove: false,
				scoreFirstStrategy: "normalize",
				choiceFirstStrategy: "zero strategy. judge on an absolute scale.",
				pairFirstStrategy: "zero strategy. judge on an absolute scale.",
				scoreSecondStrategy: "normalize frontrunners only",
				choiceSecondStrategy: "normalize frontrunners only",
				pairSecondStrategy: "zero strategy. judge on an absolute scale.",
				useBeatMapForRankedBallotViz: true,
				centerPollThreshold: 0.7,
				group_count_vert: [null],
				group_count_h: [10],
				voterCenterIcons: "on",
				doMedianDistViz: false,
			}
		} else {
			config = {
				description: "",
				features: 4,
				system: "FPTP",
				candidates: 5,
				voters: 1,
				doFullStrategyConfig: true,
				doTwoStrategies: false,
				doPercentFirst: false,
				arena_size: 300,
				arena_border: 2,
				spread_factor_voters: 2,
				firstStrategy: "normalize",
				secondStrategy: "normalize frontrunners only",
				autoPoll: "Auto",
				visSingleBallotsOnly: false,
				theme: "Letters",
				menuVersion: "2",
				doFeatureFilter: false,
				yeeon: false,
				rankedVizBoundary: "atMidpoint",
				stepMenu: "vote",
				includeSystems: ["choice","pair","score"],
				// configversion: 2.5, // should stay at latest version
			}
		}
	} else if (ui.presetName == "sandbox_original") {
		uiType = "sandbox original"
		config = {
			description: "[type a description for your model here. for example...]\n\nLook, it's the whole shape gang! Steven Square, Tracy Triangle, Henry Hexagon, Percival Pentagon, and last but not least, Bob.",
			features: 4,
			system: "FPTP",
			candidates: 5,
			voters: 1
		}
		update = update_original
	} else if (ui.presetName == "election1") {
		uiType = "election"
		update = update_original
		config = {

			features: 1,
			system: "FPTP",

			candidates: 3,
			candidatePositions: [
				[50, 125],
				[250, 125],
				[280, 280]
			],

			voters: 1,
			voterPositions: [
				[155, 125]
			]
		}
	} else if (ui.presetName == "election2") {
		uiType = "election"
		update = update_original
		config = {

			features: 1,
			system: "IRV",

			candidates: 3,
			candidatePositions: [
				[41, 271],
				[257, 27],
				[159, 65]
			],

			voters: 1,
			voterPositions: [
				[257, 240]
			]


		}
	} else if (ui.presetName == "election3") {
		uiType = "election"
		update = update_original
		config = {

			features: 1,

			system: "Borda",

			candidates: 3,
			candidatePositions: [
				[173, 150],
				[275, 150],
				[23, 150]
			],
			//candidates: 4,
			//candidatePositions: [[174,175],[271,266],[23,149],[23,23]],

			voters: 1,
			voterPositions: [
				[232, 150]
			]
			// voterPositions: [[226,230]]

		}
	} else if (ui.presetName == "election4") {
		uiType = "election"
		update = update_original
		config = {
			features: 2,
			system: "Condorcet",
			candidates: 3,
			voters: 3
		}
	} else if (ui.presetName == "election5") {
		uiType = "election"
		update = update_original
		config = {

			features: 2,
			system: "Borda",

			candidates: 3,
			candidatePositions: [
				[40, 115 + 10],
				[177, 185 + 10],
				[224, 118 + 10]
			],

			voters: 2,
			voterPositions: [
				[75, 120 + 10],
				[225, 120 + 10]
			]

		}
	} else if (ui.presetName == "election6") {
		uiType = "election"
		config = {

			system: "Score",
			strategy: "normalize",

			candidates: 3,
			candidatePositions: [
				[50, 125],
				[250, 125],
				[280, 280]
			],

			voters: 1,
			voterPositions: [
				[155, 125]
			]

		}
	} else if (ui.presetName == "election7") {
		uiType = "election"
		config = {
			featurelist: ["percentSecondStrategy"],
			percentSecondStrategy: [90, 0, 0],

			system: "Score",

			candidates: 3,
			candidatePositions: [
				[150 - 30, 150],
				[150 + 130, 150],
				[150 + 50, 150]
			],

			voters: 1,
			voterPositions: [
				[150, 150]
			],
			secondStrategy: "normalize",
			firstStrategy: "zero strategy. judge on an absolute scale."

		}
	} else if (ui.presetName == "election8") {
		uiType = "election"
		config = {

			candidatePositions: [
				[100, 150],
				[200, 150],
				[150,250]
			],
			voterPositions: [
				[100, 150],
				[200, 150]
			],
			system: "Score",
			candidates: 2,
			voters: 2,
			preFrontrunnerIds: ["square", "hexagon"],
			featurelist: ["percentSecondStrategy"],
			sandboxsave: false,
			hidegearconfig: false,
			description: "",
			percentSecondStrategy: ["70", "49", 0],
			snowman: false,
			firstStrategy: "zero strategy. judge on an absolute scale.",
			secondStrategy: "normalize",
			keyyee: "off",
			features: undefined,
			doPercentFirst: undefined,
			doFullStrategyConfig: undefined,

		}
	} else if (ui.presetName == "election9") {
		uiType = "election"
		config = {

			features: 3,
			doPercentFirst: true,
			system: "Score",

			candidates: 3,

			voters: 2,
			voterPositions: [
				[200, 160],
				[100, 160]
			],
			secondStrategy: "normalize",
			percentSecondStrategy: [50, 50],
			doFullStrategyConfig: true

		}
	} else if (ui.presetName == "election10") {
		uiType = "election"
		config = {
			/*
				features:3,
				doPercentFirst:true,
				system: "Approval",

				candidates: 3,
				candidatePositions: [[150-25,150-20],
									 [150+20,150-20],
									 [150,150+75]],
				
				voters: 3,
				voterPositions: [[150,150-70],
									 [150,150+10],
									 [150,150+90]],
				secondStrategies: ["normalize frontrunners only","normalize frontrunners only","normalize frontrunners only"],
				percentSecondStrategy: [100,100,100],
				preFrontrunnerIds: ['square','triangle','hexagon'],
				doFullStrategyConfig: true
				*/

			candidatePositions: [
				[121, 149],
				[118, 170],
				[194, 159]
			],
			voterPositions: [
				[116, 121],
				[116, 184],
				[195, 155]
			],
			system: "Approval",
			candidates: 3,
			voters: 3,
			secondStrategy: "best frontrunner",
			percentSecondStrategy: [18, 22, 92],
			preFrontrunnerIds: ["square", "triangle", "hexagon"],
			featurelist: ["percentSecondStrategy"],
			sandboxsave: false,
			hidegearconfig: false,
			description: "",
			snowman: true,
			firstStrategy: "normalize",
			keyyee: "off",
			kindayee: "off",
			features: undefined,
			doPercentFirst: undefined,
			doFullStrategyConfig: undefined
		}
	} else if (ui.presetName == "election11") {
		uiType = "election"
		config = {
			/*
				features:1,
				doPercentFirst:true,
				system: "Approval",

				candidates: 3,
				candidatePositions: [[150-25,150-20],
									 [150+20,150-20],
									 [150,150+75]],
				
				voters: 3,
				voterPositions: [[150,150-70],
									 [150,150+10],
									 [150,150+90]],
				secondStrategies: ["best frontrunner","best frontrunner","best frontrunner"],
				percentSecondStrategy: [0,100,100],
				preFrontrunnerIds: ['square','triangle','hexagon'],
				doFullStrategyConfig: true,
				firstStrategy: "normalize"
				*/

			candidatePositions: [
				[121, 149],
				[118, 170],
				[194, 159]
			],
			voterPositions: [
				[116, 121],
				[116, 184],
				[195, 155]
			],
			system: "Approval",
			candidates: 3,
			voters: 3,
			secondStrategy: "best frontrunner",
			percentSecondStrategy: [18, 22, 92],
			preFrontrunnerIds: ["square", "triangle", "hexagon"],
			featurelist: ["percentSecondStrategy", "systems"],
			sandboxsave: false,
			hidegearconfig: false,
			description: "",
			snowman: true,
			firstStrategy: "normalize",
			keyyee: "off",
			kindayee: "off",
			features: undefined,
			doPercentFirst: undefined,
			doFullStrategyConfig: undefined
		}
	} else if (ui.presetName == "election12") {
		uiType = "election"
		config = {
			/*
				features:3,
				doPercentFirst:true,
				system: "IRV",

				candidates: 4,
				candidatePositions: [[150-25,150-20],
									 [150+20,150-20],
									 [150,150+75],
									 [150+0,150+10]],
				
				voters: 3,
				voterPositions: [[150,150-70],
									 [150,150+10],
									 [150,150+90]],
				secondStrategies: ["normalize frontrunners only","normalize frontrunners only","normalize frontrunners only"],
				percentSecondStrategy: [100,100,100],
				preFrontrunnerIds: ['square','triangle','hexagon']
				*/

			candidatePositions: [
				[145, 155],
				[184, 153],
				[106, 157]
			],
			voterPositions: [
				[150, 150]
			],
			system: "IRV",
			candidates: 3,
			voters: 1,
			preFrontrunnerIds: ["square", "triangle", "hexagon"],
			featurelist: ["systems"],
			sandboxsave: false,
			hidegearconfig: false,
			description: "",
			snowman: false,
			firstStrategy: "zero strategy. judge on an absolute scale.",
			keyyee: "off",
			features: undefined,
			doPercentFirst: undefined,
			doFullStrategyConfig: undefined,
		}
	} else if (ui.presetName == "election13") {
		uiType = "election"
		config = {
			/*
				features:3,
				doPercentFirst:true,
				system: "STAR",

				candidates: 3,
				candidatePositions: [[150-25,150-20],
									 [150+20,150-20],
									 [150,150+75]],
				
				voters: 3,
				voterPositions: [[150,150-70],
									 [150,150+10],
									 [150,150+90]],
				secondStrategies: ["starnormfrontrunners","starnormfrontrunners","starnormfrontrunners"],
				percentSecondStrategy: [100,100,100],
				preFrontrunnerIds: ['square','triangle','hexagon']
				*/

			candidatePositions: [
				[121, 149],
				[118, 170],
				[194, 159]
			],
			voterPositions: [
				[116, 121],
				[116, 184],
				[195, 155]
			],
			system: "STAR",
			candidates: 3,
			voters: 3,
			secondStrategy: "best frontrunner",
			percentSecondStrategy: [18, 22, 92],
			preFrontrunnerIds: ["square", "triangle", "hexagon"],
			featurelist: ["percentSecondStrategy"],
			sandboxsave: false,
			hidegearconfig: false,
			description: "",
			snowman: true,
			firstStrategy: "normalize",
			keyyee: "off",
			kindayee: "off",
			features: undefined,
			doPercentFirst: undefined,
			doFullStrategyConfig: undefined
		}
	} else if (ui.presetName == "election14") {
		uiType = "election"
		config = {
			/*
				features:3,
				doPercentFirst:true,
				system: "3-2-1",

				candidates: 3,
				candidatePositions: [[150-25,150-20],
									 [150+20,150-20],
									 [150,150+75]],
				
				voters: 3,
				voterPositions: [[150,150-70],
									 [150,150+10],
									 [150,150+90]],
				secondStrategies: ["starnormfrontrunners","starnormfrontrunners","starnormfrontrunners"],
				percentSecondStrategy: [100,100,100],
				preFrontrunnerIds: ['square','triangle','hexagon']
				*/

			candidatePositions: [
				[121, 149],
				[118, 170],
				[194, 159]
			],
			voterPositions: [
				[116, 121],
				[116, 184],
				[195, 155]
			],
			system: "3-2-1",
			candidates: 3,
			voters: 3,
			secondStrategy: "best frontrunner",
			percentSecondStrategy: [18, 22, 92],
			preFrontrunnerIds: ["square", "triangle", "hexagon"],
			featurelist: ["percentSecondStrategy"],
			sandboxsave: false,
			hidegearconfig: false,
			description: "",
			snowman: true,
			firstStrategy: "normalize",
			keyyee: "off",
			kindayee: "off",
			features: undefined,
			doPercentFirst: undefined,
			doFullStrategyConfig: undefined
		}
	} else if (ui.presetName == "election15") {
		uiType = "election"
		config = {
			candidatePositions: [
				[92, 69],
				[210, 70],
				[245, 182],
				[149, 250],
				[55, 180]
			],
			voterPositions: [
				[150, 150]
			],
			description: "",
			features: undefined,
			system: "FPTP",
			candidates: 5,
			voters: 1,
			doFullStrategyConfig: undefined,
			doPercentFirst: undefined,
			featurelist: ["systems", "voters", "candidates", "percentSecondStrategy", "secondStrategy", "percentSecondStrategy", "firstStrategy", "frontrunners", "poll", "yee"],
			sandboxsave: true,
			hidegearconfig: false,
			preFrontrunnerIds: ["square"],
			secondStrategy: "zero strategy. judge on an absolute scale.",
			percentSecondStrategy: [0, 0, 0],
			snowman: false,
			firstStrategy: "zero strategy. judge on an absolute scale.",
			keyyee: "pentagon",
			kindayee: "can",
		}


	} else if (ui.presetName == "election16") {
		uiType = "election"
		config = {
			candidatePositions: [
				[76, 147],
				[151, 144],
				[211, 145]
			],
			voterPositions: [
				[187, 188]
			],
			system: "Approval",
			// candidates: 3,
			// voters: 1,
			// doTwoStrategies: false,
			arena_size: 300,
			// arena_border: 0,
			// spread_factor_voters: 2,
			firstStrategy: "normalize",
			// secondStrategy: "normalize frontrunners only",
			// snowman: false,
			// x_voters: false,
			// median_mean: 1,
			oneVoter: true,
			featurelist: [],
			// sandboxsave: true,
			hidegearconfig: true,
			// preFrontrunnerIds: ["square","triangle"],
			// secondStrategies: ["zero strategy. judge on an absolute scale.","zero strategy. judge on an absolute scale.","zero strategy. judge on an absolute scale.","zero strategy. judge on an absolute scale.","zero strategy. judge on an absolute scale.","zero strategy. judge on an absolute scale.","zero strategy. judge on an absolute scale.","zero strategy. judge on an absolute scale.","zero strategy. judge on an absolute scale.","zero strategy. judge on an absolute scale."],
			// percentSecondStrategy: [0,0,0,0,0,0,0,0,0,0],
			// voter_group_count: ["200",50,50,50,50,50,50,50,50,50],
			// voter_group_spread: ["237",190,190,190,190,190,190,190,190,190],
			// keyyee: "off",
			// yeefilter: ["square","triangle","hexagon","pentagon","bob"],
			// computeMethod: "ez",
			// pixelsize: 12,
			// kindayee: "off",
			// configversion: 1,
			// features: undefined,
			// doPercentFirst: undefined,
			// doFullStrategyConfig: undefined,
			// autoPoll: "Manual",
		}


	} else if (ui.presetName == "election17") {
		uiType = "election"
		config = {
			candidatePositions: [
				[76, 147],
				[151, 144],
				[211, 145]
			],
			voterPositions: [
				[197, 199]
			],
			// description: "",
			system: "Approval",
			// candidates: 3,
			// voters: 1,
			// doTwoStrategies: false,
			arena_size: 300,
			// arena_border: 0,
			// spread_factor_voters: 2,
			firstStrategy: "normalize frontrunners only",
			// secondStrategy: "normalize frontrunners only",
			// snowman: false,
			// x_voters: false,
			// median_mean: 1,
			oneVoter: true,
			featurelist: ["frontrunners"],
			putMenuAbove: true,
			// sandboxsave: true,
			hidegearconfig: true,
			preFrontrunnerIds: ["triangle", "hexagon"]
			// secondStrategies: ["zero strategy. judge on an absolute scale.","zero strategy. judge on an absolute scale.","zero strategy. judge on an absolute scale.","zero strategy. judge on an absolute scale.","zero strategy. judge on an absolute scale.","zero strategy. judge on an absolute scale.","zero strategy. judge on an absolute scale.","zero strategy. judge on an absolute scale.","zero strategy. judge on an absolute scale.","zero strategy. judge on an absolute scale."],
			// percentSecondStrategy: [0,0,0,0,0,0,0,0,0,0],
			// voter_group_count: ["200",50,50,50,50,50,50,50,50,50],
			// voter_group_spread: ["237",190,190,190,190,190,190,190,190,190],
			// keyyee: "off",
			// yeefilter: ["square","triangle","hexagon","pentagon","bob"],
			// computeMethod: "ez",
			// pixelsize: 12,
			// filename: "sandbox.html",
			// presethtmlname: "sandbox.html",
			// kindayee: "off",
			// configversion: 1,
			// features: undefined,
			// doPercentFirst: undefined,
			// doFullStrategyConfig: undefined,
			// autoPoll: "Manual",
		}



	} else if (ui.presetName == "election18") {
		uiType = "election"
		config = {
			candidatePositions: [
				[76, 147],
				[151, 144],
				[211, 145]
			],
			voterPositions: [
				[155, 217]
			],
			// description: "",
			system: "Approval",
			// candidates: 3,
			// voters: 1,
			// doTwoStrategies: false,
			arena_size: 300,
			// arena_border: 0,
			// spread_factor_voters: 2,
			firstStrategy: "normalize frontrunners only",
			// secondStrategy: "normalize frontrunners only",
			// snowman: false,
			// x_voters: false,
			// median_mean: 1,
			// oneVoter: false,
			featurelist: [],
			// sandboxsave: true,
			hidegearconfig: true,
			// preFrontrunnerIds: ["square","triangle"],
			// secondStrategies: ["zero strategy. judge on an absolute scale.","zero strategy. judge on an absolute scale.","zero strategy. judge on an absolute scale.","zero strategy. judge on an absolute scale.","zero strategy. judge on an absolute scale.","zero strategy. judge on an absolute scale.","zero strategy. judge on an absolute scale.","zero strategy. judge on an absolute scale.","zero strategy. judge on an absolute scale.","zero strategy. judge on an absolute scale."],
			// percentSecondStrategy: [0,0,0,0,0,0,0,0,0,0],
			// voter_group_count: ["200",50,50,50,50,50,50,50,50,50],
			// voter_group_spread: ["237",190,190,190,190,190,190,190,190,190],
			// keyyee: "off",
			// yeefilter: ["square","triangle","hexagon","pentagon","bob"],
			// computeMethod: "ez",
			// pixelsize: 12,
			// filename: "sandbox.html",
			// presethtmlname: "sandbox.html",
			// kindayee: "off",
			// configversion: 1,
			autoPoll: "Auto",
			// features: undefined,
			// doPercentFirst: undefined,
			// doFullStrategyConfig: undefined,
		}


	} else if (ui.presetName == "election19") {
		uiType = "election"
		config = {
			candidatePositions: [
				[76, 147],
				[145, 142],
				[211, 145]
			],
			voterPositions: [
				[176, 193]
			],
			system: "FPTP",
			// candidates: 3,
			// voters: 1,
			// doTwoStrategies: false,
			arena_size: 300,
			// arena_border: 0,
			// spread_factor_voters: 2,
			firstStrategy: "normalize",
			// secondStrategy: "normalize frontrunners only",
			// snowman: false,
			// x_voters: false,
			// median_mean: 1,
			oneVoter: true,
			featurelist: [],
			// sandboxsave: true,
			hidegearconfig: true,
			// preFrontrunnerIds: ["square","triangle"],
			// secondStrategies: ["zero strategy. judge on an absolute scale.","zero strategy. judge on an absolute scale.","zero strategy. judge on an absolute scale.","zero strategy. judge on an absolute scale.","zero strategy. judge on an absolute scale.","zero strategy. judge on an absolute scale.","zero strategy. judge on an absolute scale.","zero strategy. judge on an absolute scale.","zero strategy. judge on an absolute scale.","zero strategy. judge on an absolute scale."],
			// percentSecondStrategy: [0,0,0,0,0,0,0,0,0,0],
			// voter_group_count: ["200",50,50,50,50,50,50,50,50,50],
			// voter_group_spread: ["237",190,190,190,190,190,190,190,190,190],
			// keyyee: "off",
			// yeefilter: ["square","triangle","hexagon","pentagon","bob"],
			// computeMethod: "ez",
			// pixelsize: 12,
			// kindayee: "off",
			// configversion: 1,
			// features: undefined,
			// doPercentFirst: undefined,
			// doFullStrategyConfig: undefined,
			// autoPoll: "Manual",
		}


	} else if (ui.presetName == "election20") {
		uiType = "election"
		config = {
			candidatePositions: [
				[76, 147],
				[145, 142],
				[211, 145]
			],
			voterPositions: [
				[176, 193]
			],
			system: "FPTP",
			// candidates: 3,
			// voters: 1,
			// doTwoStrategies: false,
			arena_size: 300,
			// arena_border: 0,
			// spread_factor_voters: 2,
			firstStrategy: "normalize frontrunners only",
			// secondStrategy: "normalize frontrunners only",
			// snowman: false,
			// x_voters: false,
			// median_mean: 1,
			oneVoter: true,
			featurelist: [],
			// sandboxsave: true,
			hidegearconfig: true,
			preFrontrunnerIds: ["square", "hexagon"],
			// secondStrategies: ["zero strategy. judge on an absolute scale.","zero strategy. judge on an absolute scale.","zero strategy. judge on an absolute scale.","zero strategy. judge on an absolute scale.","zero strategy. judge on an absolute scale.","zero strategy. judge on an absolute scale.","zero strategy. judge on an absolute scale.","zero strategy. judge on an absolute scale.","zero strategy. judge on an absolute scale.","zero strategy. judge on an absolute scale."],
			// percentSecondStrategy: [0,0,0,0,0,0,0,0,0,0],
			// voter_group_count: ["200",50,50,50,50,50,50,50,50,50],
			// voter_group_spread: ["237",190,190,190,190,190,190,190,190,190],
			// keyyee: "off",
			// yeefilter: ["square","triangle","hexagon","pentagon","bob"],
			// computeMethod: "ez",
			// pixelsize: 12,
			// kindayee: "off",
			// configversion: 1,
			// features: undefined,
			// doPercentFirst: undefined,
			// doFullStrategyConfig: undefined,
			// autoPoll: "Manual",
		}


	} else if (ui.presetName == "election21") {
		uiType = "election"
		config = {
			candidatePositions: [
				[76, 147],
				[143, 144],
				[211, 145]
			],
			voterPositions: [
				[138, 175]
			],
			// description: "",
			system: "FPTP",
			// // candidates: 3,
			// voters: 1,
			// doTwoStrategies: false,
			arena_size: 300,
			// arena_border: 0,
			spread_factor_voters: 2,
			firstStrategy: "normalize frontrunners only",
			// secondStrategy: "normalize frontrunners only",
			// snowman: false,
			// x_voters: false,
			// median_mean: 1,
			// oneVoter: false,
			featurelist: ["frontrunners"],
			putMenuAbove: true,
			// sandboxsave: true,
			hidegearconfig: true,
			preFrontrunnerIds: ["square", "hexagon"],
			// // secondStrategies: ["zero strategy. judge on an absolute scale.","zero strategy. judge on an absolute scale.","zero strategy. judge on an absolute scale.","zero strategy. judge on an absolute scale.","zero strategy. judge on an absolute scale.","zero strategy. judge on an absolute scale.","zero strategy. judge on an absolute scale.","zero strategy. judge on an absolute scale.","zero strategy. judge on an absolute scale.","zero strategy. judge on an absolute scale."],
			// percentSecondStrategy: [0,0,0,0,0,0,0,0,0,0],
			// voter_group_count: ["200",50,50,50,50,50,50,50,50,50],
			// voter_group_spread: ["237",190,190,190,190,190,190,190,190,190],
			// keyyee: "off",
			// yeefilter: ["square","triangle","hexagon","pentagon","bob"],
			// computeMethod: "ez",
			// pixelsize: 12,
			// filename: "sandbox.html",
			// presethtmlname: "sandbox.html",
			// kindayee: "off",
			// configversion: 1,
			// features: undefined,
			// doPercentFirst: undefined,
			// doFullStrategyConfig: undefined,
			// autoPoll: "Manual",
		}


	} else if (ui.presetName == "election22") {
		uiType = "election"
		config = {
			candidatePositions: [
				[76, 147],
				[143, 144],
				[211, 145]
			],
			voterPositions: [
				[138, 175]
			],
			// description: "",
			system: "Approval",
			// // candidates: 3,
			// voters: 1,
			// doTwoStrategies: false,
			arena_size: 300,
			// arena_border: 0,
			spread_factor_voters: 2,
			firstStrategy: "normalize frontrunners only",
			// secondStrategy: "normalize frontrunners only",
			// snowman: false,
			// x_voters: false,
			// median_mean: 1,
			// oneVoter: false,
			featurelist: ["systems", "voters", "firstStrategy", "autoPoll","frontrunners","poll"],
			// sandboxsave: true,
			hidegearconfig: false,
			preFrontrunnerIds: ["square", "hexagon"],
			// // secondStrategies: ["zero strategy. judge on an absolute scale.","zero strategy. judge on an absolute scale.","zero strategy. judge on an absolute scale.","zero strategy. judge on an absolute scale.","zero strategy. judge on an absolute scale.","zero strategy. judge on an absolute scale.","zero strategy. judge on an absolute scale.","zero strategy. judge on an absolute scale.","zero strategy. judge on an absolute scale.","zero strategy. judge on an absolute scale."],
			// percentSecondStrategy: [0,0,0,0,0,0,0,0,0,0],
			// voter_group_count: ["200",50,50,50,50,50,50,50,50,50],
			// voter_group_spread: ["237",190,190,190,190,190,190,190,190,190],
			// keyyee: "off",
			// yeefilter: ["square","triangle","hexagon","pentagon","bob"],
			// computeMethod: "ez",
			// pixelsize: 12,
			// filename: "sandbox.html",
			// presethtmlname: "sandbox.html",
			// kindayee: "off",
			// configversion: 1,
			// features: undefined,
			// doPercentFirst: undefined,
			// doFullStrategyConfig: undefined,
			autoPoll: "Auto",
		}


	} else if (ui.presetName == "election23") {
		uiType = "election"
		config = {
			candidatePositions: [
				[76, 147],
				[143, 144],
				[211, 145]
			],
			voterPositions: [
				[138, 175]
			],
			system: "Approval",
			arena_size: 300,
			spread_factor_voters: 2,
			firstStrategy: "normalize frontrunners only",
			featurelist: [],
			hidegearconfig: true,
			preFrontrunnerIds: ["square", "hexagon"],
			autoPoll: "Auto",
			// configversion: 1,
			// candidates: 3,
			// voters: 1,
			// snowman: false,
			// x_voters: false,
			// median_mean: 1,
			// arena_border: 2,
			// oneVoter: false,
			// features: undefined,
			// sandboxsave: true,
			// doPercentFirst: undefined,
			// doFullStrategyConfig: undefined,
			// secondStrategies: ["zero strategy. judge on an absolute scale.","zero strategy. judge on an absolute scale.","zero strategy. judge on an absolute scale.","zero strategy. judge on an absolute scale.","zero strategy. judge on an absolute scale.","zero strategy. judge on an absolute scale.","zero strategy. judge on an absolute scale.","zero strategy. judge on an absolute scale.","zero strategy. judge on an absolute scale.","zero strategy. judge on an absolute scale."],
			// description: "",
			// percentSecondStrategy: [0,0,0,0,0,0,0,0,0,0],
			// voter_group_count: [50,50,50,50,50,50,50,50,50,50],
			// voter_group_spread: [190,190,190,190,190,190,190,190,190,190],
			// secondStrategy: "zero strategy. judge on an absolute scale.",
			// doTwoStrategies: true,
			keyyee: "mean",
			// yeefilter: ["square","triangle","hexagon","pentagon","bob"],
			// computeMethod: "ez",
			// pixelsize: 60,
			// filename: "election22.html",
			// presethtmlname: "election22.html",
			kindayee: "center",
		}


	} else if (ui.presetName == "election24") {
		uiType = "election"
		config = {
			candidatePositions: [
				[78, 187],
				[44, 54],
				[218, 204]
			],
			voterPositions: [
				[150, 150]
			],
			// description: "",
			system: "Approval",
			// candidates: 3,
			// voters: 1,
			// doTwoStrategies: false,
			arena_size: 300,
			arena_border: 0,
			// spread_factor_voters: 1,
			firstStrategy: "normalize frontrunners only",
			// secondStrategy: "normalize frontrunners only",
			autoPoll: "Auto",
			// configversion: 1,
			// snowman: false,
			// x_voters: false,
			// median_mean: 1,
			// oneVoter: false,
			featurelist: [],
			// sandboxsave: true,
			hidegearconfig: true,
			// preFrontrunnerIds: ["square","triangle"],
			// secondStrategies: ["zero strategy. judge on an absolute scale.","zero strategy. judge on an absolute scale.","zero strategy. judge on an absolute scale.","zero strategy. judge on an absolute scale.","zero strategy. judge on an absolute scale.","zero strategy. judge on an absolute scale.","zero strategy. judge on an absolute scale.","zero strategy. judge on an absolute scale.","zero strategy. judge on an absolute scale.","zero strategy. judge on an absolute scale."],
			// percentSecondStrategy: [0,0,0,0,0,0,0,0,0,0],
			// voter_group_count: [50,50,50,50,50,50,50,50,50,50],
			// voter_group_spread: [190,190,190,190,190,190,190,190,190,190],
			keyyee: "triangle",
			// yeefilter: ["square","triangle","pentagon","bob","hexagon"],
			// computeMethod: "ez",
			pixelsize: 30,
			// filename: "sandbox.html",
			// presethtmlname: "sandbox.html",
			kindayee: "can",
			// features: undefined,
			// doPercentFirst: undefined,
			// doFullStrategyConfig: undefined,
		}


	} else if (ui.presetName == "election25") {
		uiType = "election"
		config = {
			candidatePositions: [
				[75, 184],
				[264, 102],
				[219, 180]
			],
			voterPositions: [
				[149, 174]
			],
			// description: "",
			system: "FPTP",
			// candidates: 3,
			// voters: 1,
			doTwoStrategies: true,
			// arena_size: 300,
			arena_border: 0,
			spread_factor_voters: 2,
			firstStrategy: "normalize frontrunners only",
			secondStrategy: "zero strategy. judge on an absolute scale.",
			// snowman: false,
			// x_voters: false,
			// median_mean: 1,
			// oneVoter: false,
			featurelist: [],
			// sandboxsave: true,
			hidegearconfig: true,
			preFrontrunnerIds: ["square", "hexagon"],
			// secondStrategies: ["zero strategy. judge on an absolute scale.","zero strategy. judge on an absolute scale.","zero strategy. judge on an absolute scale.","zero strategy. judge on an absolute scale.","zero strategy. judge on an absolute scale.","zero strategy. judge on an absolute scale.","zero strategy. judge on an absolute scale.","zero strategy. judge on an absolute scale.","zero strategy. judge on an absolute scale.","zero strategy. judge on an absolute scale."],
			percentSecondStrategy: ["27", 0, 0, 0, 0, 0, 0, 0, 0, 0],
			// voter_group_count: ["200",50,50,50,50,50,50,50,50,50],
			// voter_group_spread: ["237",190,190,190,190,190,190,190,190,190],
			keyyee: "triangle",
			// yeefilter: ["square","triangle","hexagon","pentagon","bob"],
			// computeMethod: "ez",
			pixelsize: 12,
			// filename: "sandbox.html",
			// presethtmlname: "sandbox.html",
			kindayee: "can",
			// configversion: 1,
			// features: undefined,
			// doPercentFirst: undefined,
			// doFullStrategyConfig: undefined,
			// autoPoll: "Manual",
		}


	} else if (ui.presetName == "election26") {
		uiType = "election"
		config = {
			candidatePositions: [
				[40, 132],
				[142, 169],
				[200, 157],
				[101, 180],
				[227, 117]
			],
			voterPositions: [
				[53, 144],
				[231, 152]
			],
			// description: "",
			system: "+Primary",
			candidates: 5,
			voters: 2,
			// doTwoStrategies: false,
			// arena_size: 300,
			// arena_border: 0,
			spread_factor_voters: 2,
			firstStrategy: "normalize",
			// secondStrategy: "normalize frontrunners only",
			// snowman: false,
			// x_voters: false,
			// median_mean: 1,
			// oneVoter: false,
			featurelist: [],
			// sandboxsave: true,
			hidegearconfig: true,
			preFrontrunnerIds: ["square", "hexagon"],
			// secondStrategies: ["zero strategy. judge on an absolute scale.","zero strategy. judge on an absolute scale.","zero strategy. judge on an absolute scale.","zero strategy. judge on an absolute scale.","zero strategy. judge on an absolute scale.","zero strategy. judge on an absolute scale.","zero strategy. judge on an absolute scale.","zero strategy. judge on an absolute scale.","zero strategy. judge on an absolute scale.","zero strategy. judge on an absolute scale."],
			// percentSecondStrategy: ["53",0,0,0,0,0,0,0,0,0],
			// voter_group_count: ["200",50,50,50,50,50,50,50,50,50],
			// voter_group_spread: ["237",190,190,190,190,190,190,190,190,190],
			// keyyee: "off",
			// yeefilter: ["square","triangle","hexagon","pentagon","bob"],
			// computeMethod: "ez",
			// pixelsize: 12,
			// filename: "sandbox.html",
			// presethtmlname: "sandbox.html",
			// kindayee: "off",
			// configversion: 1,
			// features: undefined,
			// doPercentFirst: undefined,
			// doFullStrategyConfig: undefined,
			// autoPoll: "Manual",
		}


	} else if (ui.presetName == "election27") {
		uiType = "election"
		config = {
			candidatePositions: [
				[92, 69],
				[210, 70],
				[245, 182],
				[149, 250],
				[55, 180]
			],
			voterPositions: [
				[101, 189],
				[148, 91],
				[195, 202]
			],
			// description: "[type a description for your model here. for example...]\n\nLook, it's the whole shape gang! Steven Square, Tracy Triangle, Henry Hexagon, Percival Pentagon, and last but not least, Bob.",
			// features: undefined,
			system: "Minimax",
			candidates: 5,
			voters: 3,
			// doFullStrategyConfig: undefined,
			// doTwoStrategies: false,
			// doPercentFirst: undefined,
			arena_size: 300,
			arena_border: 0,
			spread_factor_voters: 1,
			// firstStrategy: "normalize",
			// secondStrategy: "normalize frontrunners only",
			// autoPoll: "Auto",
			// configversion: 1,
			// snowman: false,
			// x_voters: false,
			// median_mean: 1,
			// utility_shape: "linear",
			// oneVoter: false,
			featurelist: [],
			// sandboxsave: true,
			hidegearconfig: true
			// preFrontrunnerIds: ["square","triangle"],
			// secondStrategies: ["zero strategy. judge on an absolute scale.","zero strategy. judge on an absolute scale.","zero strategy. judge on an absolute scale.","zero strategy. judge on an absolute scale.","zero strategy. judge on an absolute scale.","zero strategy. judge on an absolute scale.","zero strategy. judge on an absolute scale.","zero strategy. judge on an absolute scale.","zero strategy. judge on an absolute scale.","zero strategy. judge on an absolute scale."],
			// percentSecondStrategy: [0,0,0,0,0,0,0,0,0,0],
			// voter_group_count: [50,50,50,50,50,50,50,50,50,50],
			// voter_group_spread: [190,190,190,190,190,190,190,190,190,190],
			// keyyee: "off",
			// yeefilter: ["square","triangle","hexagon","pentagon","bob"],
			// computeMethod: "ez",
			// pixelsize: 60,
			// filename: "sandbox.html",
			// presethtmlname: "sandbox.html",
		}

	} else if (ui.presetName == "election28") {
		uiType = "election"
		config = {
			candidatePositions: [
				[92, 69],
				[210, 70],
				[245, 182],
				[149, 250],
				[55, 180]
			],
			voterPositions: [
				[101, 189],
				[148, 91],
				[195, 202]
			],
			// description: "[type a description for your model here. for example...]\n\nLook, it's the whole shape gang! Steven Square, Tracy Triangle, Henry Hexagon, Percival Pentagon, and last but not least, Bob.",
			// features: undefined,
			system: "RankedPair",
			candidates: 5,
			voters: 3,
			// doFullStrategyConfig: undefined,
			// doTwoStrategies: false,
			// doPercentFirst: undefined,
			arena_size: 300,
			arena_border: 0,
			spread_factor_voters: 1,
			// firstStrategy: "normalize",
			// secondStrategy: "normalize frontrunners only",
			// autoPoll: "Auto",
			// configversion: 1,
			// snowman: false,
			// x_voters: false,
			// median_mean: 1,
			// utility_shape: "linear",
			// oneVoter: false,
			featurelist: [],
			// sandboxsave: true,
			hidegearconfig: true
			// preFrontrunnerIds: ["square","triangle"],
			// secondStrategies: ["zero strategy. judge on an absolute scale.","zero strategy. judge on an absolute scale.","zero strategy. judge on an absolute scale.","zero strategy. judge on an absolute scale.","zero strategy. judge on an absolute scale.","zero strategy. judge on an absolute scale.","zero strategy. judge on an absolute scale.","zero strategy. judge on an absolute scale.","zero strategy. judge on an absolute scale.","zero strategy. judge on an absolute scale."],
			// percentSecondStrategy: [0,0,0,0,0,0,0,0,0,0],
			// voter_group_count: [50,50,50,50,50,50,50,50,50,50],
			// voter_group_spread: [190,190,190,190,190,190,190,190,190,190],
			// keyyee: "off",
			// yeefilter: ["square","triangle","hexagon","pentagon","bob"],
			// computeMethod: "ez",
			// pixelsize: 60,
			// filename: "sandbox.html",
			// presethtmlname: "sandbox.html",
		}
	} else if (ui.presetName == "election29") {
		uiType = "election"
		config = {
			candidatePositions: [
				[92, 69],
				[210, 70],
				[245, 182],
				[149, 250],
				[55, 180]
			],
			voterPositions: [
				[101, 189],
				[148, 91],
				[195, 202]
			],
			// description: "[type a description for your model here. for example...]\n\nLook, it's the whole shape gang! Steven Square, Tracy Triangle, Henry Hexagon, Percival Pentagon, and last but not least, Bob.",
			// features: undefined,
			system: "Schulze",
			candidates: 5,
			voters: 3,
			// doFullStrategyConfig: undefined,
			// doTwoStrategies: false,
			// doPercentFirst: undefined,
			arena_size: 300,
			arena_border: 0,
			spread_factor_voters: 1,
			// firstStrategy: "normalize",
			// secondStrategy: "normalize frontrunners only",
			// autoPoll: "Auto",
			// configversion: 1,
			// snowman: false,
			// x_voters: false,
			// median_mean: 1,
			// utility_shape: "linear",
			// oneVoter: false,
			featurelist: [],
			// sandboxsave: true,
			hidegearconfig: true
			// preFrontrunnerIds: ["square","triangle"],
			// secondStrategies: ["zero strategy. judge on an absolute scale.","zero strategy. judge on an absolute scale.","zero strategy. judge on an absolute scale.","zero strategy. judge on an absolute scale.","zero strategy. judge on an absolute scale.","zero strategy. judge on an absolute scale.","zero strategy. judge on an absolute scale.","zero strategy. judge on an absolute scale.","zero strategy. judge on an absolute scale.","zero strategy. judge on an absolute scale."],
			// percentSecondStrategy: [0,0,0,0,0,0,0,0,0,0],
			// voter_group_count: [50,50,50,50,50,50,50,50,50,50],
			// voter_group_spread: [190,190,190,190,190,190,190,190,190,190],
			// keyyee: "off",
			// yeefilter: ["square","triangle","hexagon","pentagon","bob"],
			// computeMethod: "ez",
			// pixelsize: 60,
			// filename: "sandbox.html",
			// presethtmlname: "sandbox.html",
		}
	} else if (ui.presetName == "election30") {
		uiType = "election"
		config = {
			candidatePositions: [
				[92, 69],
				[210, 70],
				[245, 182],
				[149, 250],
				[55, 180]
			],
			voterPositions: [
				[101, 189],
				[148, 91],
				[195, 202]
			],
			// description: "[type a description for your model here. for example...]\n\nLook, it's the whole shape gang! Steven Square, Tracy Triangle, Henry Hexagon, Percival Pentagon, and last but not least, Bob.",
			// features: undefined,
			system: "RBVote",
			rbsystem: "Schulze",
			candidates: 5,
			voters: 3,
			// doFullStrategyConfig: undefined,
			// doTwoStrategies: false,
			// doPercentFirst: undefined,
			arena_size: 300,
			arena_border: 0,
			spread_factor_voters: 1,
			// firstStrategy: "normalize",
			// secondStrategy: "normalize frontrunners only",
			// autoPoll: "Auto",
			// configversion: 1,
			// snowman: false,
			// x_voters: false,
			// median_mean: 1,
			// utility_shape: "linear",
			// oneVoter: false,
			featurelist: [],
			// sandboxsave: true,
			hidegearconfig: true
			// preFrontrunnerIds: ["square","triangle"],
			// secondStrategies: ["zero strategy. judge on an absolute scale.","zero strategy. judge on an absolute scale.","zero strategy. judge on an absolute scale.","zero strategy. judge on an absolute scale.","zero strategy. judge on an absolute scale.","zero strategy. judge on an absolute scale.","zero strategy. judge on an absolute scale.","zero strategy. judge on an absolute scale.","zero strategy. judge on an absolute scale.","zero strategy. judge on an absolute scale."],
			// percentSecondStrategy: [0,0,0,0,0,0,0,0,0,0],
			// voter_group_count: [50,50,50,50,50,50,50,50,50,50],
			// voter_group_spread: [190,190,190,190,190,190,190,190,190,190],
			// keyyee: "off",
			// yeefilter: ["square","triangle","hexagon","pentagon","bob"],
			// computeMethod: "ez",
			// pixelsize: 60,
			// filename: "sandbox.html",
			// presethtmlname: "sandbox.html",
		}

	} else if (ui.presetName == "election31") {
		uiType = "election"
		config = {

			features: 1,
			system: "FPTP",

			candidates: 3,
			candidatePositions: [
				[50, 125],
				[250, 125],
				[280, 280]
			],

			voters: 1,
			voterPositions: [
				[155, 125]
			],
			hidegearconfig: true,
			theme: "Letters",

		}
		update = function () {
			ui.menu.systems.choose.buttons.forEach(x => x.dom.hidden = (["FPTP", "Condorcet", "Approval", "Score"].includes(x.dom.innerHTML)) ? false : true)
		}
	} else if (ui.presetName == "elect_bees") {
		uiType = "election"
		config = {
			candidatePositions: [
				[92, 69],
				[210, 70],
				[245, 182],
				[149, 250],
				[55, 180]
			],
			voterPositions: [
				[150, 150],
			],
			candidates: 5,
			theme: "Bees",
			// featurelist: ["yee"],
			featurelist: [],
			hidegearconfig: true,
			keyyee: "mean",
			pixelsize: 30,
			kindayee: "center",
		}

	} else if (ui.presetName == "elect_quotaApproval") {
		uiType = "election"
		config = {
			candidatePositions: [
				[92, 69],
				[210, 70],
				[245, 182],
				[149, 250],
				[55, 180]
			],
			voterPositions: [
				[150, 150],
			],
			candidates: 5,
			// dimensions:"1D+B",
			dimensions:"2D",
			system: "QuotaApproval",
			hidegearconfig: true,
		}

	} else if (ui.presetName == "elect_try") {
		uiType = "election"
		config = {
			candidatePositions: [
				[92, 69],
				[210, 70],
				[245, 182],
				[149, 250],
				[55, 180]
			],
			voterPositions: [
				[150, 150],
			],
			candidates: 5,
			// dimensions:"1D",
			dimensions:"2D",
			nDistricts:5,
			system: "FPTP",
			hidegearconfig: true,
			theme:"Letters",
			configversion: 2.3
		}

	} else if (ui.presetName == "ballot1") {
		uiType = "ballot"
		config = {
			ballotType: "Plurality"
		}

	} else if (ui.presetName == "ballot2") {
		uiType = "ballot"
		config = {
			ballotType: "Ranked",
			system: "IRV"
		}

	} else if (ui.presetName == "ballot3") {
		uiType = "ballot"
		config = {
			ballotType: "Approval"
		}

	} else if (ui.presetName == "ballot4") {
		uiType = "ballot-election"
		config = {
			ballotType: "Score"
		}

	} else if (ui.presetName == "ballot5") {
		uiType = "ballot-election"
		config = {
			ballotType: "Score",
			firstStrategy: "normalize"
		}
	} else if (ui.presetName == "ballot6") {
		uiType = "ballot"
		config = {
			ballotType: "Score",
			firstStrategy: "best frontrunner",
			preFrontrunnerIds: ["square", "triangle"],
			showChoiceOfFrontrunners: true,
			showChoiceOfStrategy: true
		}
	} else if (ui.presetName == "ballot7") {
		uiType = "ballot"
		config = {
			ballotType: "Score",
			firstStrategy: "not the worst frontrunner",
			showChoiceOfFrontrunners: true
		}
	} else if (ui.presetName == "ballot8") {
		uiType = "ballot-election"
		config = {
			ballotType: "Score",
			firstStrategy: "normalize frontrunners only",
			preFrontrunnerIds: ["square", "triangle"],
			showChoiceOfFrontrunners: true,
			showChoiceOfStrategy: true
		}
	} else if (ui.presetName == "ballot9") {
		uiType = "ballot-election"
		config = {
			ballotType: "Score",
			firstStrategy: "normalize frontrunners only",
			preFrontrunnerIds: ["square", "triangle"],
			showChoiceOfFrontrunners: true,
			doStarStrategy: true
		}
	} else if (ui.presetName == "ballot10") {
		uiType = "ballot-election"
		config = {
			ballotType: "Three",
			firstStrategy: "normalize frontrunners only",
			preFrontrunnerIds: ["square", "triangle"],
			showChoiceOfFrontrunners: true,
			doStarStrategy: true
		}
	} else if (ui.presetName == "ballot11") {
		uiType = "ballot-election"
		config = {
			ballotType: "Score",
			firstStrategy: "best frontrunner",
			preFrontrunnerIds: ["square", "triangle"],
			showChoiceOfFrontrunners: true,
			showChoiceOfStrategy: true
		}
	} else if (ui.presetName == "ballot12") {
		uiType = "ballot-election"
		config = {
			ballotType: "Score",
			firstStrategy: "not the worst frontrunner",
			preFrontrunnerIds: ["square", "triangle"],
			showChoiceOfFrontrunners: true,
			showChoiceOfStrategy: true
		}
	} else if (ui.presetName == "ballot13") {
		uiType = "ballot"
		config = {
			ballotType: "Plurality",
			system: "FPTP",
			newWay: true
		}

	} else if (ui.presetName == "ballot14") {
		uiType = "ballot"
		config = {
			ballotType: "Ranked",
			system: "RankedPair",
			newWay: true
		}

	} else if (ui.presetName == "ballot15") {
		uiType = "ballot"
		config = {
			ballotType: "Approval",
			newWay: true
		}

	} else if (ui.presetName == "ballot16") {
		uiType = "ballot"
		config = {
			ballotType: "Score",
			newWay: true
		}

	} else if (ui.presetName == "ballot17") {
		uiType = "ballot"
		config = {
			ballotType: "Ranked",
			system: "IRV",
			newWay: true
		}
	}

	ui.preset = {
		config: config,
		update: update,
	}
	ui.uiType = uiType

	return ui
}