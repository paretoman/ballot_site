
/////////////////////////////////////
/////////  VOTER MODELS  ////////////
/////////////////////////////////////

// sanity rules: class creation code cannot read attributes from model.

function VoterModel(model,type) {
	// 	super simple
	//  assign functions for later use
	
	var self = this
	type = type || 'Plurality'
	self.type = type

	GeneralVoterModel(model,self)
	InitVoterModel[type](model,self)

	self.castBallot = (voterPerson) => CastBallot[type](model, self, voterPerson)
	self.drawBallot = (voterPerson) => DrawBallot[type](model, self, voterPerson)
	self.drawTally = (voterPerson) => DrawTally[type](model, self, voterPerson)
	self.drawMap = (ctx, voterPerson) => DrawMap[type](ctx, model, self, voterPerson)
	self.drawMe = (ctx, voterPerson) => DrawMe[type](ctx, model, self, voterPerson)

	// self.crowd = new VoterCrowd[self.crowdType](model, self)

	// self.setType = function(type) { // don't really need this, just a shortcut
	// 	self.castBallotType = type
	// 	self.drawBallotType = type
	// 	self.drawTallyType = type
	// 	self.drawMeType = type
	// 	self.drawMapType = type
		
	// 	InitVoterModel[type](model,self)

	// 	// self.castBallot = new CastBallot[self.castBallotType](model, self)
	// 	// self.drawBallot = new DrawBallot[self.drawBallotType](model, self)
	// 	// self.drawTally = new DrawTally[self.drawTallyType](model, self)
	// 	// self.drawMap = new DrawMap[self.drawMapType](model, self)
	// 	// self.drawMe = new DrawMe[self.drawMeType](model, self)

	// 	self.castBallot = (voterPerson) => CastBallot[type](model, self, voterPerson)
	// 	self.drawBallot = (voterPerson) => DrawBallot[self.drawBallotType](model, self, voterPerson)
	// 	self.drawTally = (voterPerson) => DrawTally[self.drawTallyType](model, self, voterPerson)
	// 	self.drawMap = (ctx, voterPerson) => DrawMap[self.drawMapType](ctx, model, self, voterPerson)
	// 	self.drawMe = (ctx, voterPerson) => DrawMe[self.drawMeType](ctx, model, self, voterPerson)

	// 	// self.getBallot = CastBallot[self.castBallotType](model, self)
	// 	// self.textBallot = DrawBallot[self.drawBallotType](model, self)
	// 	// self.textTally = DrawTally[self.drawTallyType](model, self)
	// 	// self.drawBG = DrawMap[self.drawMapType](model, self)
	// 	// self.drawCircle = DrawMe[self.drawMeType](model, self)
	// }

	// self.setType(type) // Default
}

var InitVoterModel = {}

InitVoterModel.Score = function (model, voterModel) {

	voterModel.maxscore = 5;
	voterModel.minscore = 0;
	voterModel.radiusLast = []
	voterModel.radiusFirst = []
	voterModel.defaultMax = model.HACK_BIG_RANGE ? 61 * 4 : 25 * 4; // step: x<25, 25<x<50, 50<x<75, 75<x<100, 100<x
	if (model.doOriginal) {
		voterModel.filledCircles = false
	} else {
		voterModel.filledCircles = true // display scores with filled transparent circles rather than unfilled circles.
	}
}

InitVoterModel.Three = function (model,voterModel) {
	InitVoterModel.Score(model,voterModel)
	voterModel.maxscore = 2
	
}

InitVoterModel.Approval = function (model,voterModel) {
	InitVoterModel.Score(model,voterModel)
	voterModel.maxscore = 1
	voterModel.defaultMax = 200 // step: x<25, 25<x<50, 50<x<75, 75<x<100, 100<x

}

InitVoterModel.Ranked = function (model,voterModel) {
	voterModel.maxscore = 1; // borda may be different
}

InitVoterModel.Plurality = function (model,voterModel) {
	voterModel.maxscore = 1; // just for autopoll

}

var CastBallot = {}

CastBallot.Score = function (model,voterModel,voterPerson) {
	var x = voterPerson.x
	var y = voterPerson.y
	var strategy = voterPerson.strategy
	var iDistrict = voterPerson.iDistrict
	let district = model.district[iDistrict]
	var i = voterPerson.iPoint


// return function(x, y, strategy, iDistrict, i){
	var doStar =  model.checkDoStarStrategy(strategy)
	if (model.autoPoll == "Auto" && district.pollResults) {
		tally = district.pollResults

		var factor = voterPerson.poll_threshold_factor
		var max1 = 0
		for (var can in tally) {
			if (tally[can] > max1) max1 = tally[can]
		}
		var threshold = max1 * factor
		var voterAtStage = voterPerson.stages[model.stage]
		voterAtStage.maxPoll = max1
		voterAtStage.threshold = threshold // record keeping for later display
		var viable = []
		for (var can in tally) {
			if (tally[can] > threshold) viable.push(can)
		}
		voterAtStage.viable = _jcopy(viable) // record keeping for later display
	} else {
		viable = model.district[iDistrict].preFrontrunnerIds
	}
	var cans = model.district[iDistrict].stages[model.stage].candidates
	var scoresfirstlast = dostrategy(model,x,y,voterModel.minscore,voterModel.maxscore,strategy,viable,cans,voterModel.defaultMax,doStar,model.utility_shape)
	
	voterPerson.dottedCircle = scoresfirstlast.dottedCircle
	var scores = scoresfirstlast.scores

	// store info on voterPerson
	voterPerson.radiusFirst = scoresfirstlast.radiusFirst
	voterPerson.radiusLast = scoresfirstlast.radiusLast
	voterPerson.maphelp = scoresfirstlast.maphelp

	return {scores: scores}


}

CastBallot.Three = function (model,voterModel,voterPerson) {
	return CastBallot.Score(model,voterModel,voterPerson)
}

CastBallot.Approval = function (model,voterModel,voterPerson) {
	return CastBallot.Score(model,voterModel,voterPerson)	
}

CastBallot.Ranked = function (model,voterModel,voterPerson) {
	var x = voterPerson.x
	var y = voterPerson.y
	var strategy = voterPerson.strategy
	var iDistrict = voterPerson.iDistrict
	let district = model.district[iDistrict]
	var i = voterPerson.iPoint


	// Rank the peeps I'm closest to...
	var rank = [];
	var cans = model.district[iDistrict].stages[model.stage].candidates
	for(var j=0;j<cans.length;j++){
		var c = cans[j];
		rank.push(c.id);
	}
	rank = rank.sort(function(a,b){

		var c1 = model.candidatesById[a];
		// var x1 = c1.x-x;
		// var y1 = c1.y-y;
		// var d1 = x1*x1+y1*y1;
		var d1 = distF2(model,{x:x,y:y},c1)

		var c2 = model.candidatesById[b];
		// var x2 = c2.x-x;
		// var y2 = c2.y-y;
		// var d2 = x2*x2+y2*y2;
		var d2 = distF2(model,{x:x,y:y},c2)
		
		return d1-d2;

	});

	var considerFrontrunners =  (strategy != "normalize"  &&  strategy != "zero strategy. judge on an absolute scale.")
	if (considerFrontrunners && model.election == Election.irv && model.autoPoll == "Auto" && district.pollResults) {
		// we can do an irv strategy here

		voterPerson.truePreferences = _jcopy(rank)

		// so first figure out if our candidate is winning
		// should figure out how close we are to winning
		
		var tally = district.pollResults

		// who do we have first?
		var ourFirst = rank[0]

		
		var weLostElectability = ! _electable_all(ourFirst,tally.head2head,voterPerson)

		// are they viable?
		var viable = _findViable(model,tally.firstpicks,voterPerson)
		var weLostFirstChoices = ! viable.includes(ourFirst)

		// who was first?
		var weLostActually = ! tally.winners.includes(ourFirst)
		// var weLost = ! model.result.winners.includes(ourFirst)

		// var weLost = weLostElectability || weLostFirstChoices

		var weLost = weLostFirstChoices

		if ( weLost ) {
			// find out if our second choice could win head to head
			for (var i in rank) {
				var ourguy = rank[i]
				if (ourguy == winguy) {
					break // there is no better candidate, so let's just keep the same strategy
				}
				var ourguyWins = true
				for (var iwinguy in tally.winners) {
					var winguy = tally.winners[iwinguy]
					var ours = tally.head2head[ourguy][winguy]
					var theirs = tally.head2head[winguy][ourguy]
					if (theirs > ours) ourguyWins = false
				}
				if (ourguyWins) {
					// okay, we should vote for him first
					// probably, this could be improved to vote for more than just this guy first
					
					// bump ourguy into first on our ballot
					for (var j = i; j > 0; j--) {
						rank[j] = rank[j-1]
					}
					rank[0] = ourguy
					break
				}
			}
			// done changing rank
		}
	}

	// Ballot!
	return { rank:rank };

}


function _electable_all(ourCan,hh,voterPerson) {
	var cs = Object.keys(hh)
	var others = cs.filter(x => x !== ourCan)

	var badness = 1/voterPerson.poll_threshold_factor 

	// Which candidates are not defeated badly?
	let electable = true
	for (let b of others) {
		// check how badly we are defeated
		let howbad = hh[b][ourCan] / hh[ourCan][b]

		if (howbad > badness) {
			// this parameter can be changed.
			electable = false
		}
	}
	return electable
}

CastBallot.Plurality = function (model,voterModel,voterPerson) {
	var x = voterPerson.x
	var y = voterPerson.y
	var strategy = voterPerson.strategy
	var iDistrict = voterPerson.iDistrict
	let district = model.district[iDistrict]

	// first, make a list of all the candidates
	// if we're in a primary then consider electability (if there are polls)
	//   consider only viable candidates (if there are polls)
	//   find the closest candidate
	//   return
	// if we're in a general election then consider only viable candidates (if there are polls) 

	// make a list of all the candidates in this stage
	// if it's a primary, then only consider our party's candidates
	var cans = district.stages[model.stage].candidates

	var goodCans = cans
	
	if (district.primaryPollResults && model.stage == "primary") {

		// if we're in a primary 
		// then consider electability (if there are polls)
		if (model.doElectabilityPolls) {
			goodCans = _bestElectable(model, voterPerson)
		} else {
			// otherwise, only consider our party's candidates
			goodCans = district.parties[voterPerson.iParty].candidates
		}
	}

	// if we have a strategy, then
	var checkOnlyFrontrunners = (strategy!="zero strategy. judge on an absolute scale." && strategy!="normalize")
	if (checkOnlyFrontrunners) {

		//   consider only viable candidates (if there are polls, 
		if (district.pollResults && model.autoPoll == "Auto") { // Auto is here for safety
			var viable = _findViableFromSet(model, goodCans, district, voterPerson)

		} else if (model.autoPoll == "Manual") {  // manually set viable candidates, if we want to
			var viable = district.preFrontrunnerIds

		} else { // we're the first to take the polls, so any candidate is viable
			var viable = goodCans.map(c => c.id)
		}

		// but only if there is more than one viable candidate
		if (viable.length > 1) {
			goodCans = viable.map(cid => model.candidatesById[cid])
		}
	}

	// Who am I closest to?
	var closest = _findClosest(model,goodCans,x,y)

	// Vote for the CLOSEST
	return { vote:closest.id };

}

function _bestElectable(model, voterPerson) {
	let iDistrict = voterPerson.iDistrict
	let district = model.district[iDistrict]

	// check for defeats against other party's candidates
	let hh = district.primaryPollResults.head2head  // format hh[win][against] = numwins
	
	// What party do we belong to?
	// Check our group id
	var iMyParty = voterPerson.iParty
	var parties = district.parties

	// Which candidates not defeated badly?
	var electset = _electable(model,iMyParty,parties,hh)

	var voterAtStage = voterPerson.stages[model.stage]
	voterAtStage.electable = electset

	// if no candidates are electable
	if (electset.length == 0) {
		// find the most electable candidate
		// the one with the best "worst defeat"
		var electset = _mostElectable(iMyParty,parties,hh)
		
		voterAtStage.mostElectable = electset
	}

	return electset
}


function _electable(model,iMyParty,parties,hh) {
	// Which candidates are not defeated badly?
	var myParty = parties[iMyParty]
	var electset = []
	for (let a of myParty.candidates) {
		let electable = true
		for (let i = 0; i < parties.length; i++) {
			if (iMyParty !== i) {
				let party = parties[i]
				for (let b of party.candidates) {
					// check how badly we are defeated
					let howbad = hh[b.id][a.id] / hh[a.id][b.id]

					if (howbad > model.howBadlyDefeatedThreshold) { // 1.1 is default
						// this parameter can be changed.
						electable = false
					}
					
				}
			}
		}
		if (electable) {
			electset.push(a)
		}
	}
	return electset
}

function _mostElectable(iMyParty,parties,hh) {
	// find the most electable candidate
	// the one with the best "worst defeat"
	var myParty = parties[iMyParty]

	let mostelectable = {id:null};
	let leastbad = Infinity;
	for (let a of myParty.candidates) {
		let worstdefeat = 0
		for (let i = 0; i < parties.length; i++) {
			if (iMyParty !== i) {
				let party = parties[i]
				for (let b of party.candidates) {
					let howbad = hh[b.id][a.id] / hh[a.id][b.id]
					// also, find the most electable
					if (worstdefeat < howbad) { 
						worstdefeat = howbad
					}
				}
			}
		}
		if (leastbad > worstdefeat) {
			leastbad = worstdefeat
			mostelectable = a
		}
	}
	electset = [mostelectable]
	return electset
}

function _findClosest(model,electset,x,y) {
	var closest = {id:null};
	var closestDistance = Infinity;
	for(var j=0;j<electset.length;j++){
		let e = electset[j];
		var dist = distF2(model,{x:x,y:y},e)
		if(dist<closestDistance){
			closestDistance = dist;
			closest = e;
		}
	}
	return closest
}

function _findViableFromSet(model,cans, district, voterPerson) {
	let tally = district.pollResults
	tally = _tallyFromSet(cans, tally)
	var viable = _findViable(model,tally,voterPerson)
	return viable
}

function _tallyFromSet(electset, tally) {
	let oldtally = tally
	var tally = {}
	for (let e of electset) {
		tally[e.id] = oldtally[e.id] 
	}
	return tally
}


function _findViable(model,tally,voterPerson) {
	var factor = voterPerson.poll_threshold_factor
	var max1 = 0
	for (var can in tally) {
		if (tally[can] > max1) max1 = tally[can]
	}
	var threshold = max1 * factor
	
	var voterAtStage = voterPerson.stages[model.stage]
	voterAtStage.maxPoll = max1
	voterAtStage.threshold = threshold // record keeping for later display
	var viable = []
	for (var can in tally) {
		if (tally[can] > threshold) viable.push(can)
	}
	voterAtStage.viable = _jcopy(viable) // record keeping for later display
	return viable
}

function dostrategy(model,x,y,minscore,maxscore,strategy,preFrontrunnerIds,candidates,defaultMax,doStar,utility_shape) {
	
	// reference
	// {name:"O", realname:"zero strategy. judge on an absolute scale.", margin:4},
	// {name:"N", realname:"normalize", margin:4},
	// {name:"F", realname:"normalize frontrunners only", margin:4},
	// {name:"F+", realname:"best frontrunner", margin:4},
	// {name:"F-", realname:"not the worst frontrunner"}
	
	var lc = candidates.length
	var dottedCircle = false

	
	// find distances and ids //
	dista = []
	canAid = []
	for(var i=0; i<lc; i++){
		var c = candidates[i];
		var dist = distF(model,{x:x,y:y},c)
		dista.push(dist)
		canAid.push(c.id)
	}

	
	// find m and n (max and min) //
	
	
	if (strategy == "zero strategy. judge on an absolute scale.") {
		
		m = defaultMax
		n = 0

	} else {

		var lf = preFrontrunnerIds.length

		// identify important set
		var shortlist = []
		var ls
		if (strategy == "normalize" || lf == 0) { // exception for no frontrunners
			ls = lc
			for (var i = 0; i < lc; i++) {
				shortlist.push(i)
			}
		} else {
			ls = lf
			for (var i = 0; i < ls; i++) {
				var index = canAid.indexOf(preFrontrunnerIds[i])
				if (index > -1) {shortlist.push(index)}
			}	
		}

		// find min and max of shortlist
		var m=-1
		var n=Infinity
		var mi=null
		var ni=null
		for (var i_short = 0; i_short < ls; i_short++) {
			var i = shortlist[i_short]	
			var d1 = dista[i]
			if (d1 > m) {
				m = d1 // max
				mi = i
			}
			if (d1 < n) {
				n = d1 //min
				ni = i
			}
		}
	}

	if (strategy == "best frontrunner"){
		m=n
	} else if (strategy == "not the worst frontrunner") {
		n=m
		dottedCircle = true;
	}

	// assign scores //
	scores = {}
	if (utility_shape != "linear") {
		var f = utility_function(utility_shape)
		var m_inv = 1/m
		f_n = f(n*m_inv)
		f_m = f(1)
	}
	for(var i=0; i<lc; i++){
		var d1 = dista[i]
		if (d1 < n) {
			score = maxscore
		} else if (d1 >= m){ // in the case that the voter likes the frontrunner candidates equally, he just votes for everyone better
			score = minscore
		} else { // putting this last avoids m==n giving division by 0
			if (utility_shape == "linear") {
				frac = ( d1 - n ) / ( m - n )
			} else {
				frac = ( f(d1*m_inv) - f_n ) / ( f_m - f_n )
			}
			score = Math.floor(.5+minscore+(maxscore-minscore)*(1-frac))
		}
		scores[canAid[i]] = score
	}
	

	// adjust scores if necessary //

	if (strategy == "zero strategy. judge on an absolute scale.") {
		return {scores:scores, radiusFirst:n , radiusLast:m, dottedCircle:false}
	}
	


	// star exception
	//if (strategy == "starnormfrontrunners") {
	if (doStar) {
		decision = starStrategy(scores, shortlist, dista, canAid, maxscore, lc, utility_shape, strategy)
		scores = decision.scores
		var maphelp = decision.maphelp
	}


	// boundary condition correction
	// scores[canAid[mi]] = minscore
	scores[canAid[ni]] = maxscore

	// if there's just one frontrunner than set him last 
	// unless he's the closest to you
	if (lf==1 && strategy != "normalize") { 
		var n1 = n
		var n1i = ni
		for (var i = 0; i < lc; i++) {	
			var d1 = dista[i]
			if (d1 < n1) {
				n1 = d1 //min
				n1i = i
			}
		}
		if (shortlist[0] == n1i) {
			// he's closest
			dottedCircle = false
		} else {
			scores[canAid[shortlist[0]]] = minscore
			dottedCircle = true
		}
	}

	return {scores:scores, radiusFirst:n , radiusLast:m, dottedCircle:dottedCircle, maphelp:maphelp}
}


function starStrategy(scores, shortlist, dista, canAid, maxscore, lc, utility_shape, strategy) {
	// put shortlist in order
	sortedShortlist = _jcopy(shortlist).sort( (i,k) => dista[i] - dista[k] ) // shortest distance first
	// use the shortlist to make a piece-wise linear function
	var ubScore = []
	var lbScore = []
	var tryScore = []
	var ns = sortedShortlist.length

	if (ns > maxscore + 1) {
		// start with normalized scores
		
		// make groups
		var groups = [] // list of list of indexes for candidates
		for (var i = 0; i <= maxscore ; i ++) {
			groups[i] = []
		}
		// add indexes to groups
		for ( var i = 0; i < ns ; i ++) {
			var score = scores[canAid[shortlist[i]]]
			groups[score].push(shortlist[i]) // candidate indices
		}
		// remove empty groups
		for (var i = maxscore; i >= 0 ; i --) {
			if (groups[i].length == 0) {
				groups.splice(i,1)
			}
		}

		// start loop of adding groups
		while (groups.length < maxscore + 1) {
			var spreadByGroup = []
			// find distance differences within groups
			for (var i = 0; i < groups.length ; i ++) {
				var gScores = groups[i].map( a => dista[a] )
				var maxa = gScores.reduce( (a, b) => Math.max(a, b) )
				var mina = gScores.reduce( (a, b) => Math.min(a, b) )
				spreadByGroup[i] = maxa - mina
			}
			// find the group with the biggest spread
			var imax = null
			var max = -1
			for (var i = 0; i < spreadByGroup.length ; i ++) {
				if (max < spreadByGroup[i]) {
					max = spreadByGroup[i]
					imax = i
				}
			}
			// find the middle of the group
			var maxGroup = groups[imax]
			var gScores = maxGroup.map( a => dista[a] )
			var maxa = gScores.reduce( (a, b) => Math.max(a, b) )
			var mina = gScores.reduce( (a, b) => Math.min(a, b) )
			var middle = ( maxa + mina ) * .5
			// split the group down the middle
			var upgroup = maxGroup.filter( a => dista[a] <= middle)
			var downgroup = maxGroup.filter( a => dista[a] > middle)
			// insert new groups
			var newGroups = []
			for (var i = 0; i < groups.length; i++) {
				if (i == imax) {
					newGroups.push(downgroup)
					newGroups.push(upgroup)
				} else {
					newGroups.push(groups[i])
				}
			}
			groups = newGroups
			// one cycle complete
			// check if there are enough groups
		}

		// we're done
		
		// assign scores to shortlist
		var canListTryScore = []
		for ( var i = 0 ; i < groups.length ; i ++) {
			var group = groups[i]
			for (var k of group) {
				canListTryScore[k] = i
			}
		}
		// group is a list of indices of candidates
		// tryScore is indexed by indices of the sortedList of candidates
		for (var k in sortedShortlist) {
			var cani = sortedShortlist[k] // candidate index
			tryScore[k] = canListTryScore[cani]
		}

		// summary of above
		// see if we can split up some groups
		// check the spread of each group
		// find the group with the biggest spread of distance
		// split the biggest group in two

	} else { // if (ns <= maxscore + 1) {

		// start at top
		var k = maxscore
		for ( var i = 0 ; i < ns ; i ++) {
			ubScore[i] = k
			k--
		}

		// start at bottom
		var k = 0 
		for ( var i = ns - 1 ; i >= 0 ; i --) {
			lbScore[i] = k
			k++
		}

		if (strategy == "best frontrunner") { // give lower bound scores
			for ( var i = 0 ; i < ns ; i ++) {
				tryScore[i] = lbScore[i]
			}			
		} else if (strategy == "not the worst frontrunner") { // give upper bound scores
			for ( var i = 0 ; i < ns ; i ++) {
				tryScore[i] = ubScore[i]
			}
			tryScore[ns-1] = 0 // zero score for worst frontrunner
		} else {
			// try to space candidates
			var k = maxscore
			for ( var i = 0 ; i < ns ; i ++) {
				var desiredScore = scores[canAid[sortedShortlist[i]]]
				if (ubScore[i] > desiredScore) {
					// we gave too good a score and we can lower the score
					k = desiredScore
				}
				if (lbScore[i] > k) { // did we go too low?
					k = lbScore[i] // use lower bound
				}
				tryScore[i] = k
				k--
			}
		}

	}

	// assign scores to shortlist
	for ( var i = 0 ; i < ns ; i ++) {
		scores[canAid[sortedShortlist[i]]] = tryScore[i]
	}

	// still need to assign scores to candidates outside the shortlist
	// so we've got a list of distances and scores. let's set up linear interpolation intervals.

	// first we set up breaks between scores

	var breaks = []

	var iclosest = sortedShortlist[0]
	var ifurthest = sortedShortlist[sortedShortlist.length-1]
	var dclosest = dista[iclosest]
	var dfurthest = dista[ifurthest]
		
	if (strategy == "best frontrunner") { 
		var d = dclosest * 1.001
		for (var i = 0; i < maxscore; i++ ) {
			breaks.push(d)
		}
	} else if (strategy == "not the worst frontrunner") { 
		var d = dfurthest * .999
		for (var i = 0; i < maxscore; i++ ) {
			breaks.push(d)
		}
	} else {
		for (var i = 0; i < maxscore; i++ ) {
			// assign default breaks
			var frac = (i+.5) / maxscore
			var d = dfurthest + frac * (dclosest - dfurthest) 
			breaks.push(d)
		}
	}

	// adjust breaks to match shortlist
	for (var i = 0; i < maxscore; i++ ) {
		// look at boundary between a score of i and i+1
		var db = breaks[i]
		var shi = i+1 // score on high side of break
		var slo = i

		// does the interval need to be adjusted?
		for ( var k = 0 ; k < ns ; k ++) { // check the shortlist
			var d = dista[sortedShortlist[k]]
			var s = tryScore[k]
			// check for push lower
			// if distance is further than break and score is higher than break would suggest, then push break closer
			// and opposite, too
			var dfurther = d > db
			var shigher = s >= shi
			var dcloser = d < db
			var slower = s <= slo
			if ( dfurther && shigher ) {
				db = d * 1.001 // put boundary just outside of this candidate
			} else if ( dcloser && slower ) {
				db = d * .999 // put boundary just in front of this candidate
			}
		}
		breaks[i] = db // store any adjustments
	}

	// remake beginning and ending intervals
	var intervals = []
	ivScore = []
	intervals.push(0)
	ivScore.push(maxscore)
	for (var i=breaks.length-1; i >= 0; i--) {
		intervals.push(breaks[i])
		ivScore.push(i+.5)
	}
	iLast = intervals[intervals.length-1]
	intervals.push(iLast*2)
	ivScore.push(0)

	var fillScore = []
	// var intervals = sortedShortlist.map( i => dista[i] ) // old way, kind of jerky
	for(var i=0; i<lc; i++){
		
		// first, find the interval this distance fits into
		var d1 = dista[i]
		var valEnd = intervals.find( x => x >= d1)
		var end = intervals.indexOf(valEnd)

		if (end == -1) {
			// too big distance, assign min score
			fillScore[i] = 0
		} else if (end == 0) {
			fillScore[i] = maxscore // easy
		} else {
			var start = Math.max(0,end-1)
			var s = intervals[start]
			var e = intervals[end]
			if (e === s) {
				// avoid dividing by zero
				var frac = 0
			} else {
				if (utility_shape == "linear") {
					frac = ( d1 - s ) / ( e - s )
				} else {
					var u = utility_function(utility_shape)
					frac = ( u(d1) - u(s) ) / ( u(e) - u(s) )
				}
			}
			// apply fraction 
			var ss = ivScore[start]
			var es = ivScore[end]
			fillScore[i] = Math.round( ss + (es-ss)*frac )
		}	
	}
	
	// assign scores to all candidates
	for ( var i = 0 ; i < lc ; i ++) {
		scores[canAid[i]] = fillScore[i]
	}

		
	if(0) { // old way

		// find best candidate and make sure that only he gets the best score
		var n1 = n
		var n1i = ni
		for (var i = 0; i < lc; i++) {	
			var d1 = dista[i]
			if (d1 < n1) {
				n1 = d1 //min
				n1i = i
			}
		}
		for (var i = 0; i < lc; i++) {	
			var c = canAid[i]
			if (scores[c]==maxscore && i!=n1i) {
				scores[c]=maxscore-1;
			}
		}
	}

	return {scores:scores, maphelp:{intervals:intervals,scores:ivScore}}
}


function utility_function(utility_shape) {
	if (utility_shape == "quadratic") {
		var f = x => x**2
	} else if (utility_shape == "log") {
		var f = x => Math.log(x+.1)
	} else { // "linear"
		var f = x => x // f is a function defined between 0 and 1 and increasing.
	}
	return f
}

function inverse_utility_function(utility_shape) {
	if (utility_shape == "quadratic") {
		var finv = x => Math.sqrt(x)
	} else if (utility_shape == "log") {
		var finv = x => Math.exp(x) - .1
	} else { // "linear"
		var finv = x => x
	}
	return finv
}

function distF(model,v,c) {
	return Math.sqrt(distF2(model,v,c))
}

function distF2(model,v,c) { // voter and candidate should be in order
	if (model.dimensions == "1D+B") {
		var dx = v.x - c.x
		if (1) {
			if (c.b == 0) return 2^30
			var f = 1/c.b * 2 * .5 ** c.b
			return dx*dx * f*f
		} else {
			// these are old
			var dy = c.y - (model.yDimOne + model.yDimBuffer)
			var a=9
			switch (a) {
				case 1: return Math.abs(dx*dy)
				case 2: return Math.abs(dx*dy*.1)
				case 3: return Math.abs(dx*dy*dy*.001)
				case 4:
					var adx = Math.abs(dx)
					var ady = Math.abs(dy)
					if (adx < 10 || ady < 10) return 0
					return (adx + ady)*2
				case 5:
					var adx = Math.abs(dx)
					var ady = Math.abs(dy)
					if (adx < 10 || ady < 10) {
						var balance = min(adx,ady) / 10
						return balance * (adx + ady)*2
					} 
					return (adx + ady)*2
				case 6:
					var adx = Math.abs(dx)
					var ady = Math.abs(dy)
					return (1/(1/adx+1/ady))**2 /// hmm forgot this square while making this function... so things are weird
				case 7:
					return (1/(1/(dx*dx)+100/(dy*dy))) ** 2
				case 8:
					var adx = Math.abs(dx)
					var ady = Math.abs(dy)
					return (11 / ( 1/adx + 10/ady )) ** 2
				case 9:
					var f = .2 * 2 ** (dy/30)
					return (Math.abs(dx) * f)**2 
				case 10:
					var adx = Math.abs(dx)
					var ady = Math.abs(dy)
					var bInv = ady/30
					return (adx * bInv)**2 
			}
		}
	} else if (model.dimensions == "1D") {
		var dx = v.x - c.x
		var f = 1/c.b * 2 * .5 ** c.b
		return dx*dx * f*f
	} else {
		var dx = v.x - c.x
		var dy = v.y - c.y
		var f = 1/c.b * 2 * .5 ** c.b 
		// f = 1 when c.b = 1
		// var f = .5 * 2 ** (1/c.b)
		return (dx*dx + dy*dy) * f*f
	}
}


var DrawMap = {}

DrawMap.Score = function (ctx, model,voterModel,voterPerson) {
	var x = voterPerson.xArena
	var y = voterPerson.yArena
	var strategy = voterPerson.strategy
	var iDistrict = voterPerson.iDistrict
	var ballot = voterPerson.stages[model.stage].ballot


	if (model.ballotConcept == "off") return

	var scorange = voterModel.maxscore - voterModel.minscore
	var step = (voterModel.radiusLast - voterModel.radiusFirst)/scorange;

	var nVoters = model.district[iDistrict].voterPeople.length

	// Draw big ol' circles.
	var lastDist = Infinity
	var f = utility_function(model.utility_shape)
	var finv = inverse_utility_function(model.utility_shape)

	

	if (model.doVoterMapGPU) {
		voterPerson.rad = []
		voterPerson.idxCan = []
	} else {
		var tempComposite = ctx.globalCompositeOperation
		// ctx.globalCompositeOperation = "source-over"
		// ctx.globalCompositeOperation = "multiply" // kinda cloudy
		// ctx.globalCompositeOperation = "screen"
		// ctx.globalCompositeOperation = "overlay"
		// ctx.globalCompositeOperation = "hue"
		ctx.globalCompositeOperation = "lighter"  // seems good
		// ctx.globalCompositeOperation = "darker" // compatibility issues
		// ctx.globalCompositeOperation = "lighten"
		// ctx.globalCompositeOperation = "darken" // not uniform 1,2,3
	}

	var doStar =  model.checkDoStarStrategy(strategy)

	for(var i=0;i<scorange;i++){
		//var dist = step*(i+.5) + voterModel.radiusFirst

		var frac = (1-(i+.5)/scorange)
		var worst = f(1)
		var best = f(voterPerson.radiusFirst/voterPerson.radiusLast)
		var x1 = finv(frac*(worst-best)+best)
		var dist = x1 * voterPerson.radiusLast

		if (doStar) {
			// use maphelp
			var m = voterPerson.maphelp
			var iv = m.intervals
			var sc = m.scores
			
			// we want to use our guiding scores to make maps
			var slo = sc.find( x => x <= i)
			var ilo = sc.indexOf( slo )
			var ihi = Math.max(ilo - 1,0)
			// hi and lo distances
			var dhi = iv[ihi]
			var dlo = iv[ilo]
			// hi and lo scores
			var shi = sc[ihi]
			var slo = sc[ilo]
			// interpolate to find boundary (and handle dividing by zero)
			var frac = (slo == shi) ? 0 : ( (i+.5) - slo) / (shi - slo)
			if (model.utility_shape == "linear") {
				dist = dlo + (dhi - dlo) * frac 
			} else {
				var f = utility_function(model.utility_shape)
				var finv = inverse_utility_function(model.utility_shape)
				var fdist = f(dlo) + (f(dhi) - f(dlo)) * frac
				dist = finv(fdist)
			}
			
		}
			
		if (model.doVoterMapGPU) {
			voterPerson.rad.push(dist)
			voterPerson.idxCan.push(0)
			continue
		}

		ctx.lineWidth = (i+5-scorange)*2 + 2;
		ctx.beginPath();
		ctx.arc(x*2, y*2, dist*2, 0, Math.TAU, false);
		if (voterModel.filledCircles) {
			ctx.fillStyle = '#000'
			ctx.strokeStyle = "#000";
			var invert = true // CAN CHANGE
			if (invert) {
				// draw district rectangle
				var donuts = true
				if (donuts) {
					if (lastDist == Infinity) {
						ctx.rect(0,0,ctx.canvas.width,ctx.canvas.height)
					} else {
						ctx.arc(x*2, y*2, lastDist*2, 0, Math.TAU, false);
					}
					lastDist = dist // copy
				} else {
					ctx.rect(0,0,ctx.canvas.width,ctx.canvas.height)
				}
			}
		} else {
			ctx.strokeStyle = "#888"
		}
		ctx.closePath()
		ctx.setLineDash([]);
		if (voterPerson.dottedCircle) ctx.setLineDash([5, 15]);
		if (voterModel.filledCircles) {
			var temp = ctx.globalAlpha
			// ctx.globalAlpha = .01
			// ctx.stroke();
			// ctx.globalAlpha = .1
			ctx.globalAlpha = 1 / scorange / nVoters 
			if (invert) {
				if (donuts) ctx.globalAlpha = Math.max(.002, 1 / nVoters * (scorange - i) / scorange) // donuts get lighter towards the center
				// .002 seems to be a limit
				ctx.fill("evenodd")
			} else {
				ctx.fill()
			}
			ctx.globalAlpha = temp
		} else {
			ctx.stroke()
		}
		if (voterPerson.dottedCircle) ctx.setLineDash([]);
	}
	ctx.globalCompositeOperation = tempComposite
	

}

DrawMap.Three = function (ctx, model,voterModel,voterPerson) {
	DrawMap.Score(ctx,model,voterModel,voterPerson)

}

DrawMap.Approval = function (ctx, model,voterModel,voterPerson) {
	DrawMap.Score(ctx,model,voterModel,voterPerson)
}


// CalculateMap.Ranked = function (ctx, model,voterModel,voterPerson) {
DrawMap.Ranked = function (ctx, model,voterModel,voterPerson) {
	var x = voterPerson.xArena
	var y = voterPerson.yArena
	var strategy = voterPerson.strategy
	var iDistrict = voterPerson.iDistrict
	var i = voterPerson.iPoint
	var ballot = voterPerson.stages[model.stage].ballot
	

	if (model.ballotConcept == "off") return

	if (model.doOriginal) {
		// RETINA
		x = x*2;
		y = y*2;
		// DRAW 'EM LINES
		for(var i=0; i<ballot.rank.length; i++){

			// Line width
			var lineWidth = ((ballot.rank.length-i)/ballot.rank.length)*8;

			// To which candidate...
			var rank = ballot.rank[i];
			var c = model.candidatesById[rank];
			var cc = model.arena.modelToArena(c)
			var cx = cc.x*2; // RETINA
			var cy = cc.y*2; // RETINA

			// Draw
			ctx.beginPath();
			ctx.moveTo(x,y);
			ctx.lineTo(cx,cy);
			ctx.lineWidth = lineWidth;
			ctx.strokeStyle = "#888";
			ctx.stroke();

		}

	} else if (model.system == "IRV" || model.system == "STV") {
		if (1) {
			if (ballot.rank.length == 0) return
			var candidate = model.candidatesById[ballot.rank[0]];
	
			// RETINA
			x = x*2;
			y = y*2;
			var cc = model.arena.modelToArena(candidate)
			var tx = cc.x*2;
			var ty = cc.y*2;
	
			// DRAW - Line
			ctx.beginPath();
			ctx.moveTo(x,y);
			ctx.lineTo(tx,ty);
			ctx.lineWidth = 8;
			ctx.strokeStyle = "#888";
			ctx.stroke();
	

		} else {
			var old = {}
			old.x = x
			old.y = y
			// DRAW 'EM LINES
			for(var i=0; i<ballot.rank.length; i++){
	
				// Line width
				var lineWidth = ((ballot.rank.length-i)/ballot.rank.length)*8;
	
				// To which candidate...
				var rank = ballot.rank[i];
				var c = model.candidatesById[rank];
				var cc = model.arena.modelToArena(c)
				var next = {}
				next.x = cc.x;
				next.y = cc.y;
	
				// Draw
				ctx.beginPath();
				ctx.moveTo(old.x*2,old.y*2);
				ctx.lineTo(next.x*2,next.y*2);
				ctx.lineWidth = lineWidth;
				ctx.strokeStyle = "#888";
				ctx.stroke();
				old = next
				ctx.setLineDash([5, 15]);
			}
			ctx.setLineDash([]);				
		}	
	} else if (model.useBeatMapForRankedBallotViz && model.system != "Borda") {
		// do nothing .. kind of a temporary bandage while I work out the visualization
	} else if (1) {
		
		if (model.system == "Borda") {
			var doColors = false
		} else {
			var doColors = true
		}

		me = {x:x, y:y}
		// var meArena = model.arena.modelToArena(me)
		var nVoters = model.district[iDistrict].voterPeople.length
		
		var tempComposite = ctx.globalCompositeOperation

		if (doColors) {
			var cmul = 1
			// ctx.globalCompositeOperation = "source-over"; cmul = 1 // maybe
			ctx.globalCompositeOperation = "multiply"; cmul = 1 // good , but colors are off
			// ctx.globalCompositeOperation = "screen"; cmul = 2 // interesting, bad
			// ctx.globalCompositeOperation = "overlay"; cmul = 2 // okay
			// ctx.globalCompositeOperation = "hue"; cmul = 1 // great for small numbers (best on color matching) but fails for large numbers
			// ctx.globalCompositeOperation = "lighter"; cmul = .4 // 1  // good for small number // bad for large number
			// ctx.globalCompositeOperation = "darker"; cmul = .5 // compatibility issues & order matters
			// ctx.globalCompositeOperation = "lighten"; cmul = 1 // kinda good for small numbers // bad because background too bright
			// ctx.globalCompositeOperation = "darken"; cmul = .3 // not uniform 1,2,3 // not dark enough
		} else {
			// ctx.globalCompositeOperation = "source-over"
			// ctx.globalCompositeOperation = "multiply" // kinda cloudy
			// ctx.globalCompositeOperation = "screen"
			// ctx.globalCompositeOperation = "overlay"
			// ctx.globalCompositeOperation = "hue"
			ctx.globalCompositeOperation = "lighter"  // seems good
			// ctx.globalCompositeOperation = "darker" // compatibility issues
			// ctx.globalCompositeOperation = "lighten"
			// ctx.globalCompositeOperation = "darken" // not uniform 1,2,3
		}
		var temp = ctx.globalAlpha
		var lastDist = Infinity
		var scorange = ballot.rank.length
		var winsAndLosses = false
		if (winsAndLosses) {

			var mult = 2 * cmul	
			ctx.globalAlpha = Math.max(.002, 1 * mult / nVoters / scorange) // donuts get lighter towards the center
			

			var nRanks = ballot.rank.length

			// list distances and fill colors
			var aDist = []
			var aFill = []
			for (var cid of ballot.rank) {
				c = model.candidatesById[cid]
				aDist.push(distF(model,me,c))
				aFill.push(c.fill)
			}

			// find mindpoints
			var aMidpoints = []
			for (var i = 0; i < nRanks - 1; i++) {
				aMidpoints.push( .5 * (aDist[i] + aDist[i+1]) )
			}

			// find boundaries of each zone
			var aZoneStart = []
			var aZoneEnd = []
			for (var i = 0; i < nRanks; i++) {
				if (i==0) {
					aZoneStart.push(0)
				} else {
					aZoneStart.push(aMidpoints[i-1])
				}
				if (i == nRanks) {
					aZoneEnd.push(Infinity)
				} else {
					aZoneEnd.push(aMidpoints[i])
				}
			}

			for (var i = 0; i < nRanks - 1; i++) {
				// notice bottom candidate gets no zones
				
				// set fill
				ctx.fillStyle = aFill[i]

				// make losing zone
				ctx.beginPath()
				ctx.arc(x*2, y*2, aZoneEnd[i]*2, 0, Math.TAU, false)
				ctx.rect(0,0,ctx.canvas.width,ctx.canvas.height)
				ctx.closePath()

				// draw other's losses
				ctx.fill("evenodd")
				var a = 4


				// make winning zone
				ctx.beginPath()
				ctx.arc(x*2, y*2, aZoneStart[i]*2, 0, Math.TAU, false)
				ctx.arc(x*2, y*2, aZoneEnd[i]*2, 0, Math.TAU, false)
				ctx.closePath()

				// draw wins
				var nWins = nRanks - i - 1
				if (0) {
					if (nWins > 0) {
						ctx.fill("evenodd")
					}
				} else {
					if (1) {
						ctx.fillStyle = "#fff"
					}
					for (var k = 0; k < nWins; k++) {
						ctx.fill("evenodd")
					}
				}

				
			}
		} else {
			if (model.doVoterMapGPU) {
				voterPerson.rad = []
				voterPerson.idxCan = []
			}
			for(var i=ballot.rank.length-1; i>=0; i--){

				// reverse order


				// Line width
				var lineWidth = ((ballot.rank.length-i)/ballot.rank.length)*8;

				// To which candidate...
				var rank = ballot.rank[i];
				var c = model.candidatesById[rank];
				// var cc = model.arena.modelToArena(c)

				// dist = Math.sqrt((meArena.x - cc.x) ** 2 + (meArena.y - cc.y) ** 2 )
				if (model.rankedVizBoundary === "atMidpoint" || model.rankedVizBoundary === "atLoser") {
					if (i <= ballot.rank.length-2) {
						var nextRank = ballot.rank[i+1];
						var nextC = model.candidatesById[nextRank];
						var distCurrent = distF(model,me,c)
						var distNext = distF(model,me,nextC)
						if (model.rankedVizBoundary === "atMidpoint") {
							var dist = .5 * (distCurrent + distNext)
						} else {
							var dist = distNext
						}
					} else {
						continue
					}
				} else if (model.rankedVizBoundary === "beforeWinner") {
					if (i >= 1) {
						var previousRank = ballot.rank[i-1];
						var previousC = model.candidatesById[previousRank];
						var distPrevious = distF(model,me,previousC)
					} else {
						var distPrevious = 0
					}
					var distCurrent = distF(model,me,c)
					var dist = .5 * (distCurrent + distPrevious)
				} else { // atWinner
					var dist = distF(model,me,c)
				}
				
				if (model.doVoterMapGPU) {
					voterPerson.rad.push(dist)
					if (doColors) {
						voterPerson.idxCan.push(c.i)
					} else {
						voterPerson.idxCan.push(0)
					}
					continue
				}

				ctx.beginPath();
				ctx.arc(x*2, y*2, dist*2, 0, Math.TAU, false);
				
				var invert = true // CAN CHANGE
				var donuts = true
				if (doColors) {
					donuts = false
				}
				if (invert) {
					if (donuts) {
						if (lastDist == Infinity) {
							ctx.rect(0,0,ctx.canvas.width,ctx.canvas.height)
						} else {
							ctx.arc(x*2, y*2, lastDist*2, 0, Math.TAU, false);
						}
						lastDist = dist // copy
					} else {
						ctx.rect(0,0,ctx.canvas.width,ctx.canvas.height)
					}
					ctx.closePath()
				}

				if (doColors) {
					ctx.fillStyle = c.fill
				} else {
					ctx.fillStyle = '#000'
				}
				ctx.strokeStyle = "#000";
				
				// ctx.setLineDash([]);

				var doLines = false
				if (doLines) {
					ctx.globalAlpha = .01
					ctx.stroke()
				}
				if (doColors) {
					var mult = 2 * cmul
				} else {
					var mult = 1
				}				
				if (donuts) {
					ctx.globalAlpha = Math.max(.002, 1 * mult / nVoters * (i+1) / scorange) // donuts get lighter towards the center
				} else {
					ctx.globalAlpha = Math.max(.002, 1 * mult / nVoters / scorange) // donuts get lighter towards the center
				}
				if (invert) {
					// .002 seems to be a limit
					ctx.fill("evenodd")
				} else {
					ctx.fill()
				}

			}
		}
		if (0) {
			// final circle in the middle... hmm doesn't seem to make much difference.
			if (doColors) { 
				ctx.fillStyle = 'white'
				ctx.beginPath();
				ctx.arc(x*2, y*2, dist*2, 0, Math.TAU, false);
				ctx.closePath()
				ctx.fill()
			}
		}
		ctx.globalCompositeOperation = tempComposite
		ctx.globalAlpha = temp
	} 
	if (model.pairwiseMinimaps == "auto" && _pickRankedDescription(model).doPairs) {
		// customization
		var lineWidth = 1
		var connectWidth = 1
		var sizeCircle = 15
		var connectCandidates = false
		var minimap = true
		var bimetalLine = (true && !minimap) || true
		var regularLine = false

		var rankByCandidate = []
		var sortedCans = []
		for(var i=0; i<ballot.rank.length; i++){
			var rank = ballot.rank[i];
			var c = model.candidatesById[rank];
			sortedCans.push(c)
			rankByCandidate[c.i] = i
		}
		for(var i = 0; i < sortedCans.length; i++) {
			for (var k = 0; k < i; k++) {
				var c1 = model.arena.modelToArena(sortedCans[i])
				c1.fill = sortedCans[i].fill
				var c2 = model.arena.modelToArena(sortedCans[k])
				c2.fill = sortedCans[k].fill
				var win = rankByCandidate[sortedCans[k].i] > rankByCandidate[sortedCans[i].i]
					
				if (connectCandidates) {
					ctx.setLineDash([5, 45]);
					ctx.beginPath();
					ctx.moveTo(c1.x*2,c1.y*2);
					ctx.lineTo(c2.x*2,c2.y*2);
					ctx.lineWidth = connectWidth;
					ctx.strokeStyle = "#888";
					ctx.stroke();
					ctx.setLineDash([]);
				}
				// draw halfway line
				var length = 10
				mid = {}
				mid.x = (c1.x + c2.x)*.5
				mid.y = (c1.y + c2.y)*.5
				var mag = Math.sqrt((c1.y-c2.y) **2 + (c1.x-c2.x)**2)
				unit = {}
				unit.x = (c1.x - c2.x) / mag
				unit.y = (c1.y - c2.y) / mag
				var start = {}
				start.x = mid.x + unit.y * length
				start.y = mid.y - unit.x * length
				var stop = {}
				stop.x = mid.x - unit.y * length
				stop.y = mid.y + unit.x * length
				if (bimetalLine) {
					ctx.beginPath();
					ctx.moveTo((start.x+lineWidth*unit.x)*2,(start.y+lineWidth*unit.y)*2);
					ctx.lineTo((stop.x+lineWidth*unit.x)*2,(stop.y+lineWidth*unit.y)*2);
					ctx.lineWidth = lineWidth*5;
					ctx.strokeStyle = c1.fill;
					ctx.stroke();

					ctx.beginPath();
					ctx.moveTo((start.x-lineWidth*unit.x)*2,(start.y-lineWidth*unit.y)*2);
					ctx.lineTo((stop.x-lineWidth*unit.x)*2,(stop.y-lineWidth*unit.y)*2);
					ctx.lineWidth = lineWidth*5;
					ctx.strokeStyle = c2.fill;
					ctx.stroke();
				}
				if (regularLine) {
					ctx.beginPath();
					ctx.moveTo(start.x*2,start.y*2);
					ctx.lineTo(stop.x*2,stop.y*2);
					ctx.lineWidth = lineWidth;
					ctx.strokeStyle = "#888";
					ctx.stroke();
				}

				if (minimap) {
					if (win) {
						var fill = c1.fill
					} else {
						var fill = c2.fill
					}
					var factor = 7
					var miniSize = 8
					var circle = {}
					circle.x = (mid.x * factor + x) / (factor + 1)
					circle.y = (mid.y * factor + y) / (factor + 1)
					
					var temp = ctx.globalAlpha
					ctx.globalAlpha = temp * .8
					ctx.fillStyle = fill
					ctx.moveTo(circle.x*2,circle.y*2);
					ctx.beginPath();
					ctx.arc(circle.x*2, circle.y*2, miniSize, 0, Math.TAU, false);
					// ctx.lineTo(circle.x*2,circle.y*2);
					ctx.closePath();
					ctx.fill();
					ctx.lineWidth = lineWidth;
					ctx.strokeStyle = "#888";
					ctx.stroke();
					ctx.globalAlpha = temp
				} else {
					if (win) {
						var offset = 1
					} else {
						var offset = -1
					}
					var circle = {}
					circle.x = mid.x + unit.x * offset * sizeCircle * .5
					circle.y = mid.y + unit.y * offset * sizeCircle * .5
					
					var temp = ctx.globalAlpha
					ctx.globalAlpha = temp * .3
					ctx.fillStyle = "#000";
					ctx.beginPath();
					ctx.moveTo(circle.x*2,circle.y*2);
					ctx.arc(circle.x*2, circle.y*2, sizeCircle, 0, Math.TAU, false);
					ctx.lineTo(circle.x*2,circle.y*2);
					ctx.closePath();
					ctx.fill();
					ctx.globalAlpha = temp
				}
			}
		}
	}

}

DrawMap.Plurality = function (ctx, model,voterModel,voterPerson) {
	var x = voterPerson.xArena
	var y = voterPerson.yArena
	var strategy = voterPerson.strategy
	var iDistrict = voterPerson.iDistrict
	var i = voterPerson.iPoint
	var ballot = voterPerson.stages[model.stage].ballot

	
	if (model.ballotConcept == "off") return

	var candidate = model.candidatesById[ballot.vote];
	
	if (candidate === undefined) return // just in case

	// RETINA
	x = x*2;
	y = y*2;
	var cc = model.arena.modelToArena(candidate)
	var tx = cc.x*2;
	var ty = cc.y*2;

	// DRAW - Line
	ctx.beginPath();
	ctx.moveTo(x,y);
	ctx.lineTo(tx,ty);
	ctx.lineWidth = 8;
	ctx.strokeStyle = "#888";
	ctx.stroke();


}

var DrawMe = {}

DrawMe.Score = function (ctx, model,voterModel,voterPerson) {
	var x = voterPerson.xArena
	var y = voterPerson.yArena
	var size = voterPerson.size
	var ballot = voterPerson.stages[model.stage].ballot
	var weight = voterPerson.weight


	// There are #Candidates*5 slices
	// Fill 'em in in order -- and the rest is gray.
	var totalSlices = model.candidates.length*(voterModel.maxscore-voterModel.minscore);
	var leftover = totalSlices;
	var slices = [];
	totalScore = 0;
	for(var i=0; i<model.candidates.length; i++){
		var c = model.candidates[i];
		var cID = c.id;
		if (ballot.scores[cID] == undefined) continue
		var score = ballot.scores[cID] - voterModel.minscore;
		leftover -= score;
		if (model.allCan || score > 0) {
			slices.push({
				num: score,
				fill: c.fill
			});
		}
		totalScore += score
	}
	totalSlices = totalScore
	// Leftover is gray
	// slices.push({
	// 	num: leftover,
	// 	fill: "#bbb"
	// });
	// FILL 'EM IN


	if (model.drawSliceMethod == "circleBunch") {
		_drawCircleCollection(model, ctx, x, y, size, slices, totalSlices,voterModel.maxscore);
	} else if (model.drawSliceMethod == "barChart") {
		_drawVoterBarChart(model, ctx, x, y, size, slices, totalSlices,voterModel.maxscore);
	} else {
		if(totalScore==0){
			_drawBlank(model, ctx, x, y, size);
			return;
		}
		_drawSlices(model, ctx, x, y, size, slices, totalSlices);
	}



}

DrawMe.Three = function (ctx, model,voterModel,voterPerson) {
	DrawMe.Score(ctx, model,voterModel,voterPerson)

}

DrawMe.Approval = function (ctx, model,voterModel,voterPerson) {
	var x = voterPerson.xArena
	var y = voterPerson.yArena
	var size = voterPerson.size
	var ballot = voterPerson.stages[model.stage].ballot
	var weight = voterPerson.weight


	var slices = [];
	var numApproved = 0

	// Draw 'em slices
	if (model.allCan) {
		for(var candidate of model.candidates) {
			var approved = ballot.scores[candidate.id]
			if (approved) {
				slices.push({ num:1, fill:candidate.fill });
				numApproved ++
			} else {
				slices.push({ num:0, fill:candidate.fill });
			}
		}
	} else {
		for(var candidate of model.candidates) {
			var approved = ballot.scores[candidate.id]
			if (approved) {
				slices.push({ num:1, fill:candidate.fill });
				numApproved ++
			}
		}
	}
	

	if (model.drawSliceMethod == "circleBunch") {
		_drawCircleCollection(model, ctx, x, y, size, slices, slices.length,voterModel.maxscore);
	} else if (model.drawSliceMethod == "barChart") {
		_drawVoterBarChart(model, ctx, x, y, size, slices, slices.length,voterModel.maxscore);
	} else {
		if(numApproved==0){
			_drawBlank(model, ctx, x, y, size);
			return;
		}
		_drawSlices(model, ctx, x, y, size, slices, numApproved);
	}



}

DrawMe.Ranked = function (ctx, model,voterModel,voterPerson) {
	var x = voterPerson.xArena
	var y = voterPerson.yArena
	var size = voterPerson.size
	var ballot = voterPerson.stages[model.stage].ballot
	var weight = voterPerson.weight
	var iDistrict = voterPerson.iDistrict


	if (typeof weight === 'undefined') weight = 1
	var slices = [];
	var n = ballot.rank.length;
	if (n==0) {
		var totalSlices = 1
		slices.push({ num:1, fill:"#bbb" })
	} else if(n==2) {
		var totalSlices = 1
		var rank = ballot.rank[0];
		var candidate = model.candidatesById[rank];
		slices.push({ num:1, fill:candidate.fill })
	} else {

		var totalSlices = (n*(n+1))/2; // num of slices!

		var orderByCandidate = (model.drawSliceMethod == "barChart" && model.system == "Borda")
		if (orderByCandidate) var slicesById = {}
		
		for(var i=0; i<ballot.rank.length; i++){
			var rank = ballot.rank[i];
			var candidate = model.candidatesById[rank];
			var slice = { num:(n-i), fill:candidate.fill }
			slices.push(slice);
			if (orderByCandidate) slicesById[candidate.id] = slice
		}
		
		if (orderByCandidate) {
			for(var [i,c] of Object.entries(model.district[iDistrict].stages[model.stage].candidates)){
				slices[i] = slicesById[c.id]
			}
		}
	}
	if (model.drawSliceMethod == "barChart") {
		if (model.system == "Borda") {
			_drawVoterBarChart(model, ctx, x, y, size, slices, totalSlices, slices.length);
		} else if (model.system == "IRV" || model.system == "STV") {
			if (model.squareFirstChoice) {
				_drawIRVStack(model, ctx, x, y, size, slices, totalSlices * 1/Math.max(weight,.000001));
			} else {
				_drawRankList(model, ctx, x, y, size, slices, totalSlices * 1/Math.max(weight,.000001));
			}
		} else {
			if (model.pairOrderByCandidate) {
				if (n==2) {
					ballot_sub = {rank: [ballot.rank[0]]}
					_drawPairTableByCandidate(model, ctx, x, y, size, ballot_sub, weight)
				} else {
					_drawPairTableByCandidate(model, ctx, x, y, size, ballot, weight)
				}
			} else { // order by rank
				_drawRankList(model, ctx, x, y, size, slices, totalSlices * 1/Math.max(weight,.000001));
			}
		}
	} else {
		if (0) {
			_drawSlices(model, ctx, x, y, size * Math.sqrt(weight), slices, totalSlices);
		} else {
			_drawSlices(model, ctx, x, y, size, slices, totalSlices * 1/Math.max(weight,.000001));
		}
	}


}

DrawMe.Plurality = function (ctx, model,voterModel,voterPerson) {
	var x = voterPerson.xArena
	var y = voterPerson.yArena
	var size = voterPerson.size
	var ballot = voterPerson.stages[model.stage].ballot

	// RETINA
	x = x*2;
	y = y*2;

	// What fill?
	if (ballot.vote == null) {
		var fill = '#bbb'
		// return
	} else {
		var fill = model.candidatesById[ballot.vote].fill;
	}
	ctx.fillStyle = fill;
	ctx.strokeStyle = 'rgb(0,0,0)';
	ctx.lineWidth = 1; // border

	// Just draw a circle.
	ctx.beginPath();
	ctx.arc(x, y, size, 0, Math.TAU, true);
	ctx.fill();
	if (model.checkDrawCircle()) {ctx.stroke();}


}

function _drawPairTableByCandidate(model, ctx, x, y, size, ballot, weight) {
	x = x * 2
	y = y * 2
	size = size * 2
	// background stroke
	_centeredRectStroke(ctx,x,y,size,size)

	var districtCandidateIDs = []
	for (var c of model.candidates) {
		if (ballot.rank.includes(c.id)) districtCandidateIDs.push(c.id)
	}

	var n = ballot.rank.length
	pairtable = {}
	for (var i=0; i < n; i++) {
		var cid = ballot.rank[i]
		pairtable[cid] = {}
		pairtable[cid][cid] = cid
	}
	for (var i = 0; i < n; i++) {
		var cidWin = ballot.rank[i]
		for (var k = i + 1; k < n; k++) {
			var cidLose = ballot.rank[k]
			pairtable[cidWin][cidLose] = cidWin
			pairtable[cidLose][cidWin] = cidWin
		}
	}
	// now draw table
	size = size * Math.sqrt(weight)
	var sizeSquare = size / n
	var yaxis = _lineVertical(n,size)
	var xaxis = _lineHorizontal(n,size)
	for (var i = 0; i < n; i++) {
		for (var k = 0; k < n; k++) {
			icid = districtCandidateIDs[i]
			kcid = districtCandidateIDs[k]
			var cid = pairtable[icid][kcid]
			var fill = model.candidatesById[cid].fill
			var xp = x + xaxis[i][0]
			var yp = y + yaxis[k][1]
			_centeredRect(ctx,xp,yp,sizeSquare,sizeSquare,fill)
		}
	}



}

function _drawIRVStack(model, ctx, x, y, size, slices, totalSlices) {


	x = x * 2
	y = y * 2
	size = size * 2
	var maxscore = slices.length
	var extraspace = .5 // how much extra space the stack at the bottom should use.  - as a fraction.

	let noLastRank = true
	if (noLastRank && slices.length !== 1) {
		slices.pop()
		maxscore --
	}

	// special case looks weird
	if (maxscore == 2) {
		extraspace = .25
	}
	if (maxscore == 1) {
		extraspace = 0
	}

	// draw top slice
	_centeredRect(ctx,x,y,size,size,slices[0].fill)
	slices.shift() // remove top slice

	var yaxis = _lineVertical( slices.length, size * extraspace ) 

	var sizeSquare = size * extraspace  / (maxscore-1)
	for(var i in slices){
		var point = yaxis[i]
		var slice = slices[i]
		var xp = x
		var yp = y + .5 * (1+extraspace) * size + point[1]
		_centeredRect(ctx,xp,yp,size,sizeSquare,slice.fill)
	}
	// _centeredRectStroke(ctx,x,y*1.25,size,size*1.5,'#888')
	// _centeredRectStroke(ctx,x,y,size,size,'#888')

	//draw outline
	_centeredRectStroke(ctx,x,y+size*(.5*extraspace),size,size*(1+extraspace))
	_centeredRectStroke(ctx,x,y,size,size)

}

function _drawRankList(model, ctx, x, y, size, slices, totalSlices) {
	x = x * 2
	y = y * 2
	size = size * 2
	var maxscore = model.candidates.length

	if (model.system == "IRV") { // not used anymore
		var extra = slices.length / 3
		for (var i = 0; i < extra; i++) slices.unshift(slices[0])
	}

	if (model.allCan) {
		var yaxis = _lineVertical(slices.length, size) // points of main spiral
	} else {
		var yaxis = _lineVertical(model.candidates.length, size) // points of main spiral
	}
	var sizeSquare = size / maxscore
	var subRects = false
	_centeredRectStroke(ctx,x,y,size,size,'#888')
	for(var i in slices){
		var point = yaxis[i]
		var slice = slices[i]
		if (subRects) {
			// sub collection
			var xaxis = _lineHorizontal(slice.num, size) // points of yaxis
			for (var subpoint of xaxis) {
				var xp = x + point[0] + subpoint[0]
				var yp = y + point[1] + subpoint[1] 
				_centeredRect(ctx, xp, yp, sizeSquare,sizeSquare, slice.fill)
			}
		} else {
			var xp = x + point[0]
			var yp = y + point[1]
			// _drawRing(ctx,xp/2,yp/2,subsize)
			// _centeredRectStroke(ctx,xp,yp,sizeSquare * slice.num,sizeSquare)
			if (model.system == "IRV") { // not used anymore
				_centeredRect(ctx,xp,yp,size,sizeSquare,slice.fill)
			} else {
					
				xp = x + point[1]
				yp = y + .5 * size
				var sx = sizeSquare
				var sy = sizeSquare * slice.num
				
				_bottomRect(ctx,xp,yp,sx,sy,slice.fill)
				xp = x + .5 * size
				yp = y + point[1]
				var sx = sizeSquare * slice.num
				var sy = sizeSquare
				_rightRect(ctx,xp,yp,sx,sy,slice.fill)
			}
			// _drawSlices(model, ctx, xp/2, yp/2, subsize, [slice], maxscore)
		}
	}

}

function _drawVoterBarChart(model, ctx, x, y, size, slices, totalSlices, maxscore) {
	x = x * 2
	y = y * 2
	size = size * 2
	if (model.allCan) {

		var xaxis = _lineHorizontal(slices.length, size) // points of main spiral
	} else {
		var xaxis = _lineHorizontal(slices.length, size) // points of main spiral
	}
	var sizex = size / slices.length
	var sizey = size / maxscore
	var subRects = false
	_centeredRectStroke(ctx,x,y,size,size)
	for(var i in slices){
		var point = xaxis[i]
		var slice = slices[i]
		if (subRects) {
			// sub collection
			var yaxis = _lineVertical(slice.num, size) // points of yaxis
			for (var subpoint of yaxis) {
				xp = x + point[0] + subpoint[0]
				yp = y + point[1] + subpoint[1] 
				_centeredRect(ctx, xp, yp, sizex,sizey, slice.fill)
			}
		} else {
			xp = x + point[0]
			yp = y + point[1]
			// _drawRing(ctx,xp/2,yp/2,subsize)
			_centeredRectStroke(ctx,xp,yp,sizex,sizey * slice.num)
			_centeredRect(ctx,xp,yp,sizex,sizey * slice.num,slice.fill)
			// _drawSlices(model, ctx, xp/2, yp/2, subsize, [slice], maxscore)
		}
	}
}

function _lineHorizontal(num,size) {
	var points = [];
	var step = size / num
	for (var count = 0; count < num; count++) {
		var x = (count+.5) * step - .5 * size
		points.push([x,0])
	}
	return points
}

function _lineVertical(num,size) {
	var points = [];
	var step = size / num
	for (var count = 0; count < num; count++) {
		var y = (count+.5) * step - .5 * size
		points.push([0,y])
	}
	return points
}

function _centeredRect(ctx, x, y, sizex, sizey, fill) {
	ctx.fillStyle = fill;
	ctx.beginPath()
	ctx.rect(x - sizex * .5, y - sizey * .5, sizex, sizey)
	ctx.closePath()
	ctx.fill();
}

function _bottomRect(ctx, x, y, sizex, sizey, fill) {
	ctx.fillStyle = fill;
	ctx.beginPath()
	ctx.rect(x - sizex * .5, y - sizey, sizex, sizey)
	ctx.closePath()
	ctx.fill();
}

function _rightRect(ctx, x, y, sizex, sizey, fill) {
	ctx.fillStyle = fill;
	ctx.beginPath()
	ctx.rect(x - sizex, y - sizey * .5, sizex, sizey)
	ctx.closePath()
	ctx.fill();
}

function _centeredRectStroke(ctx, x, y, sizex, sizey, color) {
	color = color || 'black'
	ctx.strokeStyle = color;
	ctx.lineWidth = 1;
	ctx.beginPath()
	ctx.rect(x - sizex * .5, y - sizey * .5, sizex, sizey)
	ctx.closePath()
	ctx.stroke();
}

function _drawCircleCollection(model, ctx, x, y, size, slices, totalSlices, maxscore) {
	x = x * 2
	y = y * 2

	if (model.allCan) {
		var mainspiral = _spiral(slices.length, size) // points of main spiral
	} else {
		var mainspiral = _spiral(model.candidates.length, size) // points of main spiral
	}
	var subsize = size / Math.sqrt(model.candidates.length) // sub spiral is per candidate
	var subSpirals = false
	if (subSpirals) {
		var pointsize = subsize / Math.sqrt(maxscore) // each score gets a point
		subsize -= pointsize
	}
	for(var i in slices){
		var point = mainspiral[i]
		var slice = slices[i]
		if (subSpirals) {
			// sub collection
			var subspiral = _spiral(slice.num, subsize) // points of subspiral
			for (var subpoint of subspiral) {
				xp = x + point[0] + subpoint[0]
				yp = y + point[1] + subpoint[1] 
				_simpleCircle(ctx, xp, yp, pointsize, slice.fill)
			}
		} else {
			xp = x + point[0]
			yp = y + point[1]
			_drawRing(ctx,xp/2,yp/2,subsize)
			_simpleCircle(ctx,xp,yp,subsize,'#ccc')
			_drawSlices(model, ctx, xp/2, yp/2, subsize, [slice], maxscore)
		}
	}
}

function _simpleCircle(ctx, x, y, size, fill) {
	ctx.fillStyle = fill;
	ctx.beginPath()
	ctx.arc(x, y, size, 0, Math.TAU, false);
	ctx.closePath()
	ctx.fill();
}

function _spiral(num,size) {
	var points = [];
	var angle = 0;
	var _radius = 0;
	var _radius_norm = 0;
	var _spread_factor = size * 1
	var theta = Math.TAU * .5 * (3 - Math.sqrt(5))
	var center = {x:0,y:0}
	for (var count = 0; count < num; count++) {
		angle = theta * count
		_radius_norm = Math.sqrt((count+.5)/num)
		_radius = _radius_norm * _spread_factor

		var x = Math.cos(angle)*_radius  + 150 ;
		var y = Math.sin(angle)*_radius  + 150 ;
		points.push([x,y]);
		center.x += x
		center.y += y
	}
	center.x /= num
	center.y /= num
	for (var point of points) {
		point[0] -= center.x
		point[1] -= center.y
	}
	return points
}

function _drawSlices(model, ctx, x, y, size, slices, totalSlices){

	// RETINA
	x = x*2;
	y = y*2;
	//size = size*2;

	// GO AROUND THE CLOCK...
	var startingAngle = -Math.TAU/4;
	var endingAngle = 0;
	for(var i=0; i<slices.length; i++){

		slice = slices[i];

		// Angle!
		var sliceAngle = slice.num * (Math.TAU/totalSlices);
		endingAngle = startingAngle+sliceAngle;

		// Just draw an arc, clockwise.
		ctx.fillStyle = slice.fill;
		ctx.beginPath();
		ctx.moveTo(x,y);
		ctx.arc(x, y, size, startingAngle, endingAngle, false);
		ctx.lineTo(x,y);
		ctx.closePath();
		ctx.fill();

		// For next time...
		startingAngle = endingAngle;

	}
	
	if (model.checkDrawCircle()) {
		// Just draw a circle.	
		_drawRing(ctx,x/2,y/2,size)	
	}

};

function _drawRing(ctx, x, y, size) {

		// RETINA
		x = x*2;
		y = y*2;
		// Just draw a circle.		
		ctx.strokeStyle = 'rgb(0,0,0)';
		ctx.lineWidth = 1; // border
		ctx.beginPath();
		ctx.arc(x, y, size, 0, Math.TAU, true);
		ctx.closePath();
		ctx.stroke();
}

function _drawThickRing(ctx, x, y, size) {

	// RETINA
	x = x*2;
	y = y*2;
	// Just draw a circle.		
	ctx.strokeStyle = 'rgb(50,50,50)';
	ctx.lineWidth = 3; // border
	ctx.beginPath();
	ctx.arc(x, y, size, 0, Math.TAU, true);
	ctx.moveTo(x+size-8,y)
	ctx.arc(x, y, size-8, 0, Math.TAU, true);
	// ctx.arc(x, y, size, 0, 0, true);
	ctx.closePath();
	ctx.fillStyle = 'white'
	ctx.fill('evenodd')
	ctx.stroke();
}

function _drawBlank(model, ctx, x, y, size){
	var slices = [{ num:1, fill:"#bbb" }];
	_drawSlices(model, ctx, x, y, size, slices, 1);
};

var DrawBallot = {}

DrawBallot.Score = function (model,voterModel,voterPerson) {
	var ballot = voterPerson.stages[model.stage].ballot
	var district = model.district[voterPerson.iDistrict]
	var cans = district.stages[model.stage].candidates

	var text = ""
	var scoreByCandidate = []
	for(var i = 0; i < cans.length; i++) {
		scoreByCandidate[i] = ballot.scores[cans[i].id]
	}

	var rTitle = `
	Give EACH candidate a score<br>
	<em><span class="small">from 0 (hate 'em) to 5 (love 'em)</span></em>
	`
	text += htmlBallot(model,rTitle,scoreByCandidate,cans)
	return text


}

DrawBallot.Three = function (model,voterModel,voterPerson) {

	var text = DrawBallot.Score(model,voterModel,voterPerson)
	return text.replace("5 (love 'em)","2 (love 'em)")

}

DrawBallot.Approval = function (model,voterModel,voterPerson) {
	var ballot = voterPerson.stages[model.stage].ballot
	var district = model.district[voterPerson.iDistrict]
	var cans = district.stages[model.stage].candidates
	
	var spotsById = []
	for ( var i = 0; i < cans.length; i++) {
		var cid = cans[i].id
		spotsById[cid] = i
	}
	

	var approvedByCandidate = []
	for(var i = 0; i < cans.length; i++) {
		approvedByCandidate.push("&#x2800;")
	}
	for(var candidate of model.candidates) {
		var approved = ballot.scores[candidate.id]
		if (approved) {
			var spot = spotsById[candidate.id]
			approvedByCandidate[spot] = "&#x2714;"
		}
	}

	var text = ""
	var rTitle = `
	Who do you approve of?<br>
	<em><span class="small">(pick as MANY as you like)</span></em>
	`
	text += htmlBallot(model,rTitle,approvedByCandidate,cans)
	return text
	

}

DrawBallot.Ranked = function (model,voterModel,voterPerson) {
	var ballot = voterPerson.stages[model.stage].ballot
	var district = model.district[voterPerson.iDistrict]
	var cans = district.stages[model.stage].candidates

	var text = ""

	var spotsById = []
	for ( var i = 0; i < cans.length; i++) {
		var cid = cans[i].id
		spotsById[cid] = i
	}

	var rankByCandidate = []
	for(var i=0; i<ballot.rank.length; i++){
		var rank = ballot.rank[i];
		var spot = spotsById[rank]
		rankByCandidate[spot] = i + 1
	}

	var rTitle = `
	Rank in order of your choice:<br>
	<em><span class="small">(1=1st choice, 2=2nd choice, etc...)</span></em>
	`
	text += htmlBallot(model,rTitle,rankByCandidate,cans)
	return text

}

DrawBallot.Plurality = function (model,voterModel,voterPerson) {
	var ballot = voterPerson.stages[model.stage].ballot
	var district = model.district[voterPerson.iDistrict]
	var cans = district.stages[model.stage].candidates

	if (model.stage == "primary") {
		cans = district.parties[voterPerson.iParty].candidates
	}

	var text = ""
	var onePickByCandidate = []
	for(var i = 0; i < cans.length; i++) {
		var cid = cans[i].id
		if (cid == ballot.vote) {
			onePickByCandidate.push("&#x2714;")
		} else {
			onePickByCandidate.push("&#x2800;")
		}
	}

	var rTitle = `
	Who's your favorite candidate?<br>
	<em><span class="small">(pick ONLY one)</span></em>
	`
	text += htmlBallot(model,rTitle,onePickByCandidate,cans)
	return text

}

var DrawTally = {}

DrawTally.Score = function (model,voterModel,voterPerson) {
	var ballot = voterPerson.stages[model.stage].ballot
	var district = model.district[voterPerson.iDistrict]
	var cans = district.stages[model.stage].candidates
	
	var system = model.system
	
	// todo: star preferences
	var text = ""

	if(cans.length == 0) return text

	if (voterModel.say) text += "<span class='small' style> Vote: </span> <br />" 
	cIDs = Object.keys(ballot.scores).sort(function(a,b){return -(ballot.scores[a]-ballot.scores[b])}) // sort descending

	if (0){
		for(var i=0; i < cIDs.length; i++){
			cID = cIDs[i]
			var score = ballot.scores[cID]
			text += model.icon(cID) + ":" + score
			text += "<br />"
		}
	}
	if (0){
		for(var i=0; i < cIDs.length; i++){
			cID = cIDs[i]
			var score = ballot.scores[cID]
			for (var j=0; j < score; j++) {
				text += model.icon(cID) + " "
			}
			text += "<br />"
		}
	}
	if (1) {
		var distList = voterPerson.distList
		text += tBarChart("score",distList,model,{differentDisplay: true})
		text += `<br>`
		
	}
	if (system == "STAR") {
		
		text += "<span class='small'>"
		text += " Pair Preferences:  <br />"
		text += "<pre>" 
		for(var i=1; i<cIDs.length; i++){
			text += ""
			for(var j=0; j<i; j++){
				if (j>0) text += "  "
				text += model.icon(cIDs[j])
				if (ballot.scores[cIDs[j]] > ballot.scores[cIDs[i]]) {
					text += ">"
				} else text += "="
				text += model.icon(cIDs[i])
			} 
			// 01  
			// 02  12
			// 03  13  23
			text += "</span>"
			text += "<br />"
			text += "<br />"
		}
		text += "</pre>"
		text += pairChart([ballot], district, model)
		text += squarePairChart([ballot], district, model)
	}
	return text
	

}

DrawTally.Three = function (model,voterModel,voterPerson) {
	var ballot = voterPerson.stages[model.stage].ballot
	
	var text = ""
	cIDs = Object.keys(ballot.scores).sort(function(a,b){return -(ballot.scores[a]-ballot.scores[b])}) // sort descending
	if (0){
		if (voterModel.say) text += "<span class='small' style> Vote: </span> <br />" 
		for(var i in cIDs){
			cID = cIDs[i]
			var score = ballot.scores[cID]
			text += model.icon(cID) + ":" + score
			text += "<br />"
		}
	}
	if (1) {
		var distList = voterPerson.distList
		text += tBarChart("score",distList,model,{differentDisplay: true})
		text += `<br>`
		
	}
	groups = [[],[],[]]
	for (cID in ballot.scores) {
		var score = ballot.scores[cID]
		groups[score].push(cID)
	}
	text +=  "<pre><span class='small' style>   Good:</span>" 
	var good = groups[2]
	for (i in good) {
		text += model.icon(good[i])
	}
	text +=  "<br />"
	text +=  "<br />"
	text += "<span class='small' style>Not Bad:</span>" 
	for (i in good) {
		text += model.icon(good[i])
	}
	var okay = groups[1]
	for (i in okay) {
		text += model.icon(okay[i])
	}
	text += "</pre>"
	text += "<br>"
	if(0) {
		text += "<br /> preferences:<br />"
		for(var i = 2; i > -1; i--){
			if (i<2) text += ">"
			for(j in groups[i]){
				text += model.icon(groups[i][j])
			}
		}
	}
	
	text += "<span class='small'>"
	text += " Pair Preferences:  <br />"
	text += "<pre>" 
	for(var i=1; i<cIDs.length; i++){
		text += ""
		for(var j=0; j<i; j++){
			if (j>0) text += "  "
			text += model.icon(cIDs[j])
			if (ballot.scores[cIDs[j]] > ballot.scores[cIDs[i]]) {
				text += ">"
			} else text += "="
			text += model.icon(cIDs[i])
		} 
		// 01  
		// 02  12
		// 03  13  23
		text += "</span>"
		text += "<br />"
		text += "<br />"
	}
	text += "</pre>"
	return text
	

}

DrawTally.Approval = function (model,voterModel,voterPerson) {
	var ballot = voterPerson.stages[model.stage].ballot

	var text = ""
	if (voterModel.say) text += "<span class='small' style> Approved </span> <br />" 
	
	if (0) {
		for(var candidate of model.candidates) {
			var approved = ballot.scores[candidate.id]
			if (approved) {
				text += model.icon(candidate)
				text += "<br />"
			}
		}
	}
	if (1) {
		var distList = voterPerson.distList
		text += tBarChart("score",distList,model,{differentDisplay: true})
		text += `</span><br>`
		
	}
	return text
	

}

DrawTally.Ranked = function (model,voterModel,voterPerson) {
	var voterAtStage = voterPerson.stages[model.stage]
	var ballot = voterAtStage.ballot
	var district = model.district[voterPerson.iDistrict]

	var system = model.system
	var rbsystem = model.rbsystem
	// todo: star preferences
	var text = ""
	var eventsToAssign = []

	var pick = _pickRankedDescription(model)

	if(system=="RBVote" && rbsystem=="Bucklin") {
		// put a 1 in each ranking
		text += "<pre>"
		// text += "    1 2 3 4 5"
		text += "   "
		for(var i=0; i<ballot.rank.length; i++) {
			text += " " + (i+1)
		}
		text += "<br />"
		text += "<br />"
		for(var i=0; i<ballot.rank.length; i++) {
			text += model.icon(ballot.rank[i])
			text += "  "
			for(var j=0; j<ballot.rank.length; j++) {
				if (j>0) text += " "
				if (i==j) {
					text += "1"
				} else {
					text += "0"
				}
			}
			text += "<br />"
		}
		text += "</pre>"		
	}

	if (pick.doChain || pick.doPairs) {
		text += "<span class='small' style> Preferences: </span> <br />" 
		for(var i=0; i<ballot.rank.length; i++){
			if (i>0) text += " > "
			var candidate = ballot.rank[i];
			text += model.icon(candidate)
		}
		text += "<br />"
		text += "<br />"
	}

	if (pick.message != "") {
		text += "<span class='small' style>"
		text += pick.message
		text += "</span>"
		text += "<br />"
		text += "<br />"
	}	

	if (pick.doPairs) {
		if(0){
			text += "<span class='small'>"
			// text += "Pair Preferences:  <br />" 
			for(var i=1; i<ballot.rank.length; i++){
				text += "<span style='float:left'>"
				for(var j=0; j<ballot.rank.length-i; j++){
					if (j>0) text += "&nbsp;&nbsp;&nbsp;&nbsp;"
					text += model.icon(ballot.rank[j]) + ">"
					text += model.icon(ballot.rank[j+i])
				} 
				// 01  12
				// 02  13
				text += "</span>"
				text += "<br />"
			}
			text += "</span>"
		}
		if (0) {
			text += "<span class='small'> Pair Preferences:  <br /><pre>" 
			for(var i=1; i<ballot.rank.length; i++){
				text += "<span style='float:left'>"
				for(var j=1; j<i; j++){
					text += "   "
				}
				for(var j=0; j<ballot.rank.length-i; j++){
					if (j>0) text += " "
					text += model.icon(ballot.rank[j]) + ">"
					text += model.icon(ballot.rank[j+i])
				} 
				// 01  12
				// 02  13
				text += "</span>"
				text += "<br />"
				text += "<br />"
			}
			text += "</pre></span>"
		}
		if(1){
			
			text += "<span class='small'>"
			// text += " Pair Preferences:  <br />"
			text += "<pre>" 
			for(var i=1; i<ballot.rank.length; i++){
				text += ""
				let iid = ballot.rank[i]
				for(var j=0; j<i; j++){
					let jid = ballot.rank[j]
					
					let eventID = 'tallypair_' + iid + '_' + jid + '_' + _rand5()
					let e = {
						eventID: eventID,
						f: pairDraw(model,district,jid,iid,false)
					}
					eventsToAssign.push(e)

					text += '<span id="' + eventID + '">'

					if (j>0) text += "  "
					text += model.icon(jid) + ">"
					text += model.icon(iid)

					text += "</span>"
				} 
				// 01  
				// 02  12
				// 03  13  23
				text += "<br />"
				text += "<br />"
			}
			text += "</span>"
			text += "</pre>"
		}
		if(1) {
			text += pairChart([ballot], district, model)
			text += squarePairChart([ballot], district, model)
		}
	}

	if (pick.doPoints) {
		if (voterModel.say) text += "<span class='small' style> Points: </span><br />" 
		if (1) {
			text += tBarChart("score", voterPerson.distList ,model,{differentDisplay:true})
		} else {
			var numCandidates = ballot.rank.length
			for(var i=0; i<ballot.rank.length; i++){
				var candidate = ballot.rank[i];
				var score = numCandidates - i
				for (var j=0; j < score; j++) {
					text += model.icon(candidate) 
				}
				text += "<br />"
			}
		}
	}

	model.tallyEventsToAssign = eventsToAssign
	return text
	
}

function _pickRankedDescription(model) {
		
	// var onlyPoints = ["Borda"]
	// var onlyPointsRB = ["Baldwin","Borda"]
	// var noPreferenceChainRB = ["Black"]
	// var onlyPreferenceChain = ["IRV","STV"]
	// var onlyPreferenceChainRB = ["Bucklin","Carey","Coombs","Hare"]
	// var onlyPairsRB = ["Copeland","Dodgson",]
	regular = {
		"IRV": 			{doChain:true , doPairs:false, doPoints:false, message:"Only tally the top choice during elimination rounds."},
		"Borda": 		{doChain:false, doPairs:false, doPoints:true , message:""},
		"Minimax": 		{doChain:false, doPairs:true , doPoints:false, message:"These preferences are tallied by pairs."},
		"Schulze": 		{doChain:false, doPairs:true , doPoints:false, message:"These preferences are tallied by pairs."},
		"RankedPair":	{doChain:false, doPairs:true , doPoints:false, message:"These preferences are tallied by pairs."},
		"Condorcet":	{doChain:false, doPairs:true , doPoints:false, message:"These preferences are tallied by pairs."},
		"STV": 			{doChain:true , doPairs:false, doPoints:false, message:"Only tally the top choice during elimination rounds."}
	}
		
	rb = {
		"Baldwin":	{doChain:true , doPairs:false, doPoints:true , message:"Points are assigned in each elimination round.  In round 1, they are as follows:"},
		"Black":	{doChain:true , doPairs:true , doPoints:true , message:"These preferences are tallied by pairs. <br /><br /> If there is no Condorcet winner, then borda points are used."},
		"Borda":	{doChain:false, doPairs:false, doPoints:true , message:""},
		"Bucklin":	{doChain:false, doPairs:false, doPoints:false, message:"Round 1: only count 1's.  <br /> Round 2: include 1's and 2's.  <br /> Keep including more until approval gets above 50%."},
		"Carey":	{doChain:true , doPairs:false, doPoints:false, message:"Only tally the top choice during elimination rounds."},
		"Coombs":	{doChain:true , doPairs:false, doPoints:false, message:"Only tally the bottom choice during elimination rounds."},
		"Copeland":	{doChain:false, doPairs:true , doPoints:false, message:"These preferences are tallied by pairs."},
		"Dodgson":	{doChain:false, doPairs:true , doPoints:false, message:"These preferences are tallied by pairs."},
		"Hare":		{doChain:true , doPairs:false, doPoints:false, message:"Only tally the top choice during elimination rounds."},
		"Nanson":	{doChain:true , doPairs:false, doPoints:true , message:"Points are assigned in each elimination round.  In round 1, they are as follows:"},
		"Raynaud":	{doChain:false, doPairs:true , doPoints:false, message:"These preferences are tallied by pairs."},
		"Schulze":	{doChain:false, doPairs:true , doPoints:false, message:"These preferences are tallied by pairs."},
		"Simpson":	{doChain:false, doPairs:true , doPoints:false, message:"These preferences are tallied by pairs."},
		"Small":	{doChain:false, doPairs:true , doPoints:false, message:"These preferences are tallied by pairs."},
		"Tideman":	{doChain:false, doPairs:true , doPoints:false, message:"These preferences are tallied by pairs."}
	}
	if (model.system=="RBVote") {
		var pick = rb[model.rbsystem]
	} else {
		var pick = regular[model.system]
	}
	if (pick == undefined) {
		pick = {
			doChain: false,
			doPairs: false,
			doPoints: false,
			message: "Not yet implemented."
		}
	}
	return pick
}

DrawTally.Plurality = function (model,voterModel,voterPerson) {
	var ballot = voterPerson.stages[model.stage].ballot

	var text = ""
	if (voterModel.say) text += "<span class='small' style> One vote for </span> " 
	if (ballot.vote) text += model.icon(ballot.vote)
	return text
}

function GeneralVoterModel(model,voterModel) {
	voterModel.say = false
	voterModel.toTextV = function(voterPerson) {
		if (0) {
			return `<div id="paper">` + voterModel.drawBallot(voterPerson) + "</div>" + voterModel.textTally(voterPerson) 
		} else {
			return voterModel.toText(voterPerson,"V")
		}

	}
	voterModel.toTextH = function(voterPerson) {
		return voterModel.toText(voterPerson,"H")
	}
	voterModel.toText = function(voterPerson,direction) {


		// setup //

		var makeIcons = x => x ? x.map(a => model.icon(a)) : ""
		var makeIconsCan = x => x ? x.map(a => model.icon(a.id)) : ""

		// voters
		var voterAtStage = voterPerson.stages[model.stage]

		// candidates
		var cans = model.district[voterPerson.iDistrict].stages[model.stage].candidates
		if (model.stage == "primary") {
			var district = model.district[voterPerson.iDistrict]
			cans = district.parties[voterPerson.iParty].candidates
		}

		// distances
		var distList = makeDistList(model,voterPerson,voterAtStage,cans)
		voterPerson.distList = distList // just pass it along.. maybe do this part better

		var tableHead = `
			<table class="main2" border="1">
			<tbody>
			<tr>
			<td class="tallyText">
			`
		var tableFoot = `
			</td>
			</tr>
			</tbody>
			</table>
			`
		// writing //
		
		var tablewrap = false
		var text = ''
		var part1 = voterModel.drawBallot(voterPerson)


		var part2 = `
		<table class="main2" border="1">
		<tbody>
		<tr>
		<td class="tallyText">
		<span class="small">
		This is how your vote counts:
		</span>
		<br> <br>
		#2
		</td>
		</tr>
		</tbody>
		</table>`.replace("#2",voterModel.drawTally(voterPerson))

		var text3 = `
		Why did you vote this way? <br>
		<br>
		`

		text3 += `
		Your strategy was: <br>
		<b>${voterPerson.realNameStrategy}</b> <br>
		<br>
		`

		var didStarStrategy = model.system == "STAR" && voterPerson.strategy != "zero strategy. judge on an absolute scale."
		var doNormalize = voterPerson.strategy == "normalize"
		if (didStarStrategy) {
			text3 += `
			And because we're using <b>STAR</b>, you tried to distinguish between ${ (doNormalize) ? "candidates" : "frontrunners" } for the final round ${ (doNormalize) ? "" : "and then fill in everybody else in between those scores" }. <br>
			<br>
			`
		}
		
		var consideredElectability = model.stage == "primary" && model.doElectabilityPolls
		if (consideredElectability) {
			text3 += `
			You also considered <b>electability</b>. <br>
			<br>
			`
		}



		// if (model.ballotType == "Score" || model.ballotType == "Approval") {
		// 	text3 += `
		// 	You gave the following scores: <br>
		// 	`
		// 	text3 += tBarChart("score",distList,model,{differentDisplay: true})
		// 	text3 += `<br>`
		// }

		if (model.utility_shape !== "linear") {
			text3 += `
			This is your perceived distance from each candidate using a <b>${model.utility_shape}</b> utility function: <span class="percent">(as % of your perceived distance of the arena width)</span><br>
			`
			text3 += tBarChart("nUNorm",distList,model,{distLine:true})
			// for (var d of distList) {
			// 	text3 += `
			// 	${makeIconsCan([d.c])}: <b>${Math.round(d.uNorm*100)}</b> <br>
			// 	`
			// }
			text3 += `<br>`
		}

		text3 += `
		This is your perceived utility for each candidate: <span class="percent">(100% minus perceived distance)</span> <br>`
		text3 += tBarChart("uNorm",distList,model)
		text3 += `
		<br>`

		text3 += `
		This is your distance from each candidate: <span class="percent">(as % of arena width)</span> <br>
		`
		text3 += tBarChart("dNorm",distList,model,{distLine:true})
		// for (var d of distList) {
		// 	text3 += `
		// 	${makeIconsCan([d.c])}: <b>${Math.round(d.dist/model.size*100)}</b> <br>
		// 	`
		// }
		text3 += `<br>`
		
        var not_f = ["zero strategy. judge on an absolute scale.","normalize"]
		var f_strategy = ! not_f.includes(voterPerson.strategy)
		var showPollExplanation = f_strategy

		if (consideredElectability) {
			if (voterAtStage.electable && voterAtStage.electable.length > 0) {
				text3 += `
				In the primary, you picked from the candidates that you considered electable: <br>
				${makeIconsCan(voterAtStage.electable)} <br>
				<br>
				`
				showPollExplanation = false
				if (voterAtStage.electable.length > 2) {
					if ( voterAtStage.viable) {
						text3 += `
						Also, you considered who among these electable candidates was viable. <br>
						<br>
						`
						// text3 += `
						// Also, you considered who among these electable candidates was viable: <br>
						// ${makeIcons(voterAtStage.viable)} <br>
						// <br>
						// `
						showPollExplanation = true
					}
				}
			} else {
				text3 += `
				In the primary, no candidates seemed electable, so you picked the one that was most electable: <br>
				${makeIconsCan(voterAtStage.mostElectable)} <br>
				<br>
				`
				showPollExplanation = false
			}
			text3 += `
			(Candidates were considered electable in head-to-head polls if they won or if the other candidate didn't get 
			<b>${_textPercent(model.howBadlyDefeatedThreshold - 1)}</b>
			more votes.) <br>
			<br>
			`
		}

		
		var district = model.district[voterPerson.iDistrict]
		var maxscore = model.voterGroups[0].voterModel.maxscore

		if ( showPollExplanation ) {
			if (model.autoPoll == "Manual") {
				text3 += `
				and these candidates were manually selected as frontrunners: <br>
				${makeIcons(model.preFrontrunnerIds)} <br>
				<br>
				`
			} else {
				text3 += `
				and you saw these candidates as frontrunners: <br>
				${makeIcons(voterAtStage.viable)} <br>
				<br>
				`
				if (model.system == "IRV") {
					var tp = voterPerson.truePreferences 
					var rank = voterAtStage.ballot.rank
					var didCompromise = rank[0] != tp[0]
					if (didCompromise) {
						text3 += `
						Your didn't feel your favorite was viable, so you looked at head-to-head polls and picked someone who could beat the winner.  Your true preferences were:  <br>
						${makeIcons(tp).join(' > ')} <br>
						<br>
						so you compromised and went with: <br>
						${makeIcons(rank).join(' > ')} <br>
						<br>
						`
					}
				}
				text3 += `
				You based your list of viable candidates on your personal feeling that a candidate needed this fraction of the leading frontrunner's votes to be viable: <br>
				<b>${_textPercent(voterPerson.poll_threshold_factor)}</b> <br>
				<br>
				and you saw that the leading frontrunner had <br>
				<b>${_percentFormat(district,voterAtStage.maxPoll / maxscore)}</b> <br>
				<br>
				so, you only saw candidates with votes above this threshold as viable: <br>
				<b>${_percentFormat(district,voterAtStage.threshold / maxscore)}</b> <br>
				<br>
				`
			}
		}
		
		var part3 = `
		<table class="main2" border="1">
		<tbody>
		<tr>
		<td class="tallyText">
		<span class="small">
		#3
		</span>
		</td>
		</tr>
		</tbody>
		</table>`.replace("#3",text3)

		
		var part4 = ''
		
	// alternative form of ballot

		if (model.ballotType == "Ranked" || model.ballotType == "Score" || model.ballotType == "Approval" || model.ballotType == "Three") {
			part4 += tableHead
			part4 += `
			<span class="small">
			Alternative form of ballot:
			</span>
			`
			part4 += tBarChart("score",distList,model,{differentDisplay: true,bubbles:true})
			part4 += `<br>`
			part4 += tableFoot
		}
		if (model.ballotType == "Ranked") {
			part4 += tableHead
			part4 += `
			<span class="small">
			Visualization of ballot:
			</span>
			`
			part4 += tBarChart("score",distList,model,{differentDisplay: true,distLine:true})
			part4 += `<br>`
			part4 += tableFoot
		}


		if (tablewrap) {
			text += `<table id="paper">
			<tbody>
			<tr>
			`
			text += `<td valign="top">`
			text += part1
			text += `</td>`
			if (direction=="V") {
				text += '</tr><tr>'
			}
			text += `<td valign="top">`
			text += part2
			text += `</td>`
			text += `
			</tr>
			</tbody>
			</table>`
		} else {
			text += `
			<div id="paper">
			<div>
			` + part1 + `
			</div>
			<div>
			` + part2 + `
			</div>
			<div>
			` + part3 + `
			</div>
			<div>
			` + part4 + `
			</div>
			</div>`
		}
		return text
	}
}


function makeDistList(model,voterPerson,voterAtStage,cans,opt) {
	opt = opt || {}
	opt.dontSort = opt.dontSort || false
	opt.noBallot = opt.noBallot || false

	var distList = []
	var uf = utility_function(model.utility_shape)
	for (var i = 0; i < cans.length; i++) {
		var c = cans[i]
		var dist = distF(model,{x:voterPerson.x, y:voterPerson.y}, c)
		var distSet =  {
			i:i,
			c:c,
			dist: dist,
			dNorm: dist / model.size,
			nUtility: uf(dist),
			nUNorm: uf(dist) / uf(model.size),
			uNorm: 1-uf(dist) / uf(model.size),
		}
		if (opt.noBallot) {

		} else if (model.ballotType == "Score" || model.ballotType == "Three") {
			var maxscore = model.voterGroups[0].voterModel.maxscore
			distSet.maxscore = maxscore
			distSet.score = voterAtStage.ballot.scores[c.id] / maxscore
			distSet.scoreDisplay = voterAtStage.ballot.scores[c.id]
		} else if (model.ballotType == "Approval") {
			distSet.maxscore = 1
			distSet.score = voterAtStage.ballot.scores[c.id]
			distSet.scoreDisplay = distSet.score
		} else if (model.ballotType == "Ranked") {
			if (model.system == "Borda") {
				var rank = voterAtStage.ballot.rank.indexOf(c.id) + 1
				var maxpoints = voterAtStage.ballot.rank.length
				var points = maxpoints - rank
				distSet.scoreDisplay = points
				distSet.score = points / maxpoints
			} else {
				distSet.scoreDisplay = (voterAtStage.ballot.rank.indexOf(c.id) + 1)
				distSet.score = distSet.scoreDisplay / voterAtStage.ballot.rank.length
			}
		}
		distList.push(distSet)
	
	}
	
	var doSort = ! opt.dontSort
	if (doSort) {
		distList.sort(function(a,b) {return a.dist - b.dist})
		for (var i = 0; i < distList.length; i++) {
			distList[i].iSort = i // we might want to show these by the sorted order
		}
	}

	return distList
}

function makeDistListFromTally(tally, cans, maxscore, nballots,opt) {
	opt = opt || {}
	opt.dontSort = opt.dontSort || false

	var distList = []
	
	var k = 0
	for (var i = 0; i < cans.length; i++) {
		var c = cans[i]
		if (tally[c.id] !== undefined) {
			var distSet =  {
				i:k,
				c:c,
				cid:c.id,
				score: tally[c.id] / maxscore / nballots,
				scoreDisplay: tally[c.id] / maxscore,
				maxscore: maxscore,
			}
			distList.push(distSet)
			k++
		}
	}
	
	var doSort = ! opt.dontSort
	if (doSort) {
		distList.sort(function(a,b) {return a.score - b.score})
		for (var i = 0; i < distList.length; i++) {
			distList[i].iSort = i // we might want to show these by the sorted order
		}
	}

	return distList
}

function tBarChart(measure,distList,model,opt) {
	opt = opt || {}
	opt.differentDisplay = opt.differentDisplay || false
	opt.sortOrder = opt.sortOrder || false
	opt.distLine = opt.distLine || false
	opt.bubbles = opt.bubbles || false
	opt.percent = opt.percent || false

	var text = ""

	// helper
	var makeIconsCan = x => x ? x.map(a => model.icon(a.id)) : ""

	// sortOrder = true
	if (opt.differentDisplay) {
		var mult = 1
		var display = measure + "Display"
	} else {
		var mult = 100
		var display = measure // default display to measurement
	}
	
	// option for vertical dimenison.. 0 to turn off.
	vertdim = 1;

	// dot plot from 0 to 150
	// border at 100 * 220 / 141 = 156 
	// also the .5 em margins and padding help center the icons.
	var w1 = 156
	var w2 = 200
	var ncans = distList.length
	text += `<div style=' position: relative; width: ${ (1) ? w2 : w2-4}px; height: ${Math.max( 1 , vertdim * ncans )}em; border: ${ (1) ? 0 : 2}px solid #ccc; padding: .25em 0;'>`
	text += `<div style=' position: relative; width: ${ (1) ? w1 : w1-4}px; height: ${Math.max( 1 , vertdim * ncans )}em; border: 0px solid #ccc; border-right: ${(opt.bubbles) ? 0 : 1}px dashed #ccc; padding: 0 ${ (1) ? 0 : .5}em;'>`
	distList.reverse()
	for (var d of distList) {
		var iV = (opt.sortOrder) ? d.iSort : d.i
		var y = iV*vertdim
		var x = Math.round(d[measure]*w1)
		if (opt.distLine) {
			text += `
			<div style=' position: absolute; top: ${y + .5}em; width: ${x}px; background-color: #ccc; height: 2px; opacity: .8; '>
			</div>
			<img src="play/img/voter.png" style=' position: absolute; top: ${y}em; left:0; '/>
			`
		} else if (opt.bubbles) {
			text += `
			<div style=' position: absolute; top: ${y}em; left: ${0+2}px; white-space: nowrap;'>
			${makeIconsCan([d.c])} <br>
			</div>
			`
			var nbubbles = (model.ballotType == "Ranked") ? ncans : d.maxscore+1
			for (var k=0; k < nbubbles; k++) {
				var km = k
				if (model.ballotType == "Ranked") {
					km ++
				}
				var kx = (k+1) * Math.min( (w2-4-13)/ncans, 20 ) - 5
				var back = (d[display] == km) ? "#555" : "white"
				text += `<div class="circle" style=' position: absolute; top: ${y}em; left: ${kx}px; background-color:${back};'>
				</div>
				<div style=' position: absolute; top: ${y-.05}em; left: ${kx+3}px; color: #ccc; '>
				<span style=' font-size:${(km > 9 ) ? 50 : 80}%; vertical-align: middle;' >
				${km}
				</span>
				</div>
				`
			}
			continue
		} else {
			text += `
			<div style=' position: absolute; top: ${y}em; width: ${x}px; left: 0; background-color: ${d.c.fill}; height: 1em; opacity: .8;'>
			</div>
			`
		}
		var f = x => x
		if (opt.percent) f = x => _textPercent(x/100)
		text += `
		<div style=' position: absolute; top: ${y}em; left: ${x+2}px; white-space: nowrap;'>
		${makeIconsCan([d.c])}: <b>${f(Math.round(d[display] * mult))}</b> <br>
		</div>
		`
	}
	distList.reverse()
	text += `
	</div>
	</div>
	`
	return text
}

function dLineChart(measure,dls,model,opt) {
	opt = opt || {}

	var text = ""

	// helper
	var makeIconsCan = x => x ? x.map(a => model.icon(a.id)) : ""

	// dot plot from 0 to 150
	// border at 100 * 220 / 141 = 156 
	// also the .5 em margins and padding help center the icons.
	var w1 = 156
	var w2 = 200
	var npolls = dls.length
	var yscale = 20
	var h1 = Math.max( 1 , npolls-1 ) * yscale // pixels
	var ncans = dls[0].length
	text += `<div style=' position: relative; width: ${w1}px; height: ${h1}px; padding: .25em 0;'>`
	text += `<div style=' position: relative; width: ${w1}px; height: ${h1}px; border: 1px dashed #ccc; border-left: 0px dashed #ccc; padding: 0 0em;'>`
	text += `<svg id="pollChart" viewBox="0 0 ${w1} ${h1}" xmlns="http://www.w3.org/2000/svg">`
	for (var k = 0; k < ncans; k++) {
		for (var i = 0; i < dls.length; i++) {
			var dl = dls[i]
			var d = dl[k]
			var color = d.c.fill
			var y2 = i * yscale
			var x2 = d[measure]*w1
			if (i > 0) {
				text += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${color}" stroke-width="5" opacity=".8" />`
			}
			var y1 = y2
			var x1 = x2
		}
	}
	text += `</svg>`
	text += `
	</div>
	</div>
	`
	return text
}


function htmlBallot(model,rTitle,textByCandidate,cans) {
	var text = ""
	var tTitle = `
	<table class="main" border="1">
	<tbody>
	<tr>
	<th class="main">
	#title
	</th>
	</tr>
	<tr>
	<td class="main">
	<table class="canList" border="0">
	<tbody>
	`
	text += tTitle.replace("#title",rTitle)

	tRow = `
	<tr>
	<td>
	<table class="num">
	<tbody>
	<tr>
	<td class="num">#num</td>
	</tr>
	</tbody>
	</table>
	</td>
	<td class="nameLabel">#name</td>
	</tr>
	`		
	for(var i=0; i < cans.length; i++) {
		var c = cans[i]
		var num = textByCandidate[i]
		if (model.theme == "Letters") {
			// icon is same as name
			var name = model.icon(c.id) //+ " <b style='color:"+c.fill+"'>" + model.nameUpper(c.id) + "</b>"
		} else {
			var name = model.icon(c.id) + " <span class='nameLabelName' style='color:"+c.fill+"'>" + model.nameUpper(c.id) + "</span>"
		}
		text += tRow.replace("#num",num).replace("#name",name)	
	}
	text += `
	</tbody>
	</table>
	</td>
	</tr>
	</tbody>
	</table>
	`
	return text
}

/////////////////////////////////////////
/////////  Voter Objects     ////////////
/////////////////////////////////////////

// sanity rules: class creation code cannot read attributes from model.

function VoterPerson(model,voterModel) {
	// all the data on a person you'd like to know

	var self = this
	_addAttributes(self,{
		isVoterPerson: true,
		x: undefined,
		y: undefined,
		xArena: undefined,
		yArena: undefined,
		strategy: undefined,
		iPoint: undefined,
		iGroup: undefined,
		iAll: undefined,
		iDistrict: undefined,
		iParty: undefined,
		weight: undefined,
		// ballotType: voterModel.type,
		// voterModel: voterModel,
		stages: {},
	})
}

function VoterSet(model) {
	var self = this
	self.allVoters = undefined
	self.totalVoters = undefined
	// self.crowds = [] // not ready yet
	// self.districts = []
	self.newCrowd = function() {
		var voterPeople = []
		// self.crowds.push({voterPeople:voterPeople})
		return voterPeople
	}
	self.init = function() {
		// list voters
		// Information about where to find the voters in the groups AKA model.voterGroups[]
		self.allVoters = []
		var j = 0
		for (var i = 0; i < model.voterGroups.length; i++) {
			for (var k = 0; k < model.voterGroups[i].voterPeople.length; k++) {
				var voterPerson = model.voterGroups[i].voterPeople[k]
				voterPerson.iGroup = i
				voterPerson.iAll = j
				// voterPerson.iPont = k
				self.allVoters.push(voterPerson)
				j++
			}
		}
		self.totalVoters = self.allVoters.length
	}

	self.getAllVoters = function() {
		// a shallow copy of self.allVoters
		var copyAll = []
		for (var voterPerson of self.allVoters) {
			copyAll.push(voterPerson)
		}
		return copyAll

	}
	self.getBallotsDistrict = function(district){
		var ballots = [];
		for(var i=0; i<district.voterPeople.length; i++){
			var v = district.voterPeople[i]
			var b = model.voterGroups[v.iGroup].voterPeople[v.iPoint].stages[model.stage].ballot
			ballots = ballots.concat(b);
		}
		return ballots;
	};
	self.getBallotsCrowdAndDistrict = function(iCrowd,district) {
		var ballots = [];
		for(var i=0; i<district.voterPeople.length; i++){
			var v = district.voterPeople[i]
			if (v.iGroup == iCrowd) {
				// var b = self.crowds[iCrowd].voterPeople[v.iPoint].stages[model.stage].ballot
				var b = model.voterGroups[iCrowd].voterPeople[v.iPoint].stages[model.stage].ballot
				ballots.push(b)
			}
		}
		return ballots;
	}
	self.getBallotsPartyAndDistrict = function(iParty,district) {
		var ballots = [];
		var voterPeople = district.parties[iParty].voterPeople
		for(var i=0; i<voterPeople.length; i++){
			var voterPerson = voterPeople[i]
			var b = voterPerson.stages[model.stage].ballot
			ballots.push(b)
		}
		return ballots
	}
	self.getBallotsCrowd = function(iCrowd) {
		var voterPeople = model.voterGroups[iCrowd].voterPeople
		var ballots = []
		for (var voterPerson of voterPeople) {
			ballots.push(voterPerson.stages[model.stage].ballot)
		}
		return ballots
	}
	
	self.getVoterArrayXY = function() {
		// returns an array of all the voters and their distinguishing info

		var vs = []
		for (var i = 0; i < model.voterGroups.length; i++) {
			var voterGroup = model.voterGroups[i]
			var points = voterGroup.points
			var xGroup = voterGroup.x
			var yGroup = voterGroup.y
			for (var k = 0; k < points.length; k++) {
				var v = {
					x:  points[k][0] + xGroup,
					y:  points[k][1] + yGroup
				}
				vs.push(v)
			}
		}
		return vs
	}
	
	self.getDistrictVoterArray = function(district) {
		// only for voters of a district

		// returns an array of all the voters and their distinguishing info
	
		var vs = []
		for (var i = 0; i < model.voterGroups.length; i++) {
			var voterGroup = model.voterGroups[i]
			var points = voterGroup.points
			var xGroup = voterGroup.x
			var yGroup = voterGroup.y
			var ballots = model.voterSet.getBallotsCrowd(i)
			for (var k = 0; k < points.length; k++) {
				var v = {
					x:  points[k][0] + xGroup,
					y:  points[k][1] + yGroup,
					b: [],
					iDistrict: voterGroup.voterPeople[k].iDistrict,
				}
				for (var m = 0; m < model.candidates.length; m++) {
					v.b[m] = 0 // zero out all the counts
				}

				if (v.iDistrict !== district.i) { // the only difference from the regular function
					// vs.push(v)
					continue
				}

				// var optByDist = model.byDist
				var optByDist = false
				if (optByDist) {

					var uf = utility_function(model.utility_shape)
					for (var n = 0; n < model.candidates.length; n++) {
						var c = model.candidates[n]
						var dist = distF(model,{x:v.x, y:v.y}, c)
						// dNorm: dist / model.size,
						// nUtility: uf(dist),
						// nUNorm: uf(dist) / uf(model.size),
						var uNorm = 1-uf(dist) / uf(model.size)
						v.b[n] = uNorm
					}
					vs.push(v)

				} else if (model.ballotType == "Approval") { // not yet fully functional TODO
					var ballot = ballots[k]
					for (var n = 0; n < model.candidates.length; n++) {
						var id = model.candidates[n].id
						v.b[n] = ballot.scores[id] || 0
					}
					vs.push(v)
				} else if (model.ballotType == "Score") {
					var ballot = ballots[k]
					for (var n = 0; n < model.candidates.length; n++) {
						var id = model.candidates[n].id
						v.b[n] = ballot.scores[id] || 0
					}
					vs.push(v)
				} else if (model.ballotType == "Ranked") {
					var ballot = ballots[k]
					for (var n=0; n<ballot.rank.length; n++) {
						var cid = ballot.rank[n]
						var ci = model.candidatesById[cid].i
						// v.b[ci] = n+1
						v.b[n] = ci
					}
					vs.push(v)
					
				} else {
					vs.push(v)
				}
			}
		}
		return vs
	}

	self.getVoterArray = function() {
		// returns an array of all the voters and their distinguishing info
		
		var all = []
		for (var district of model.district) {
			var some = self.getDistrictVoterArray(district)
			all = all.concat(some)
		}
		return all
	}

	self.getArrayAttr = function(a) {
		// returns an array of all the voters and their distinguishing info
		var s = []
		for (var voterGroup of model.voterGroups) {
			for (var voterPerson of voterGroup.voterPeople) {
				s.push( voterPerson[a] )
			}
		}
		return s
	}

	self.updateBallots = function() {
		for (var voterGroup of model.voterGroups) {
			self.updateCrowdBallots(voterGroup)
		}
	}
	self.updateCrowdBallots = function(crowd) {
		for(var voterPerson of crowd.voterPeople){
			self.updatePersonBallot(voterPerson)
		}
	}
	self.updateCrowdDistrictBallots = function(crowd,district) {
		for(var voterPerson of crowd.voterPeople){
			if (voterPerson.iDistrict == district.i) {
				self.updatePersonBallot(voterPerson)
			}
		}
	}
	self.updateDistrictBallots = function(district) {
		for(var voterPerson of district.voterPeople){
			self.updatePersonBallot(voterPerson)
		}
	}
	self.updatePersonBallot = function(voterPerson) {
		var voterModel = model.voterGroups[voterPerson.iGroup].voterModel
		voterPerson.stages[model.stage] = {}
		var ballot = voterModel.castBallot(voterPerson)
		// store ballot for current stage
		self.loadPersonBallot(voterPerson, ballot)
	}
	self.loadDistrictBallotsFromStage = function(district,stage) {
		for(var voterPerson of district.voterPeople){
			var ballot = voterPerson.stages[stage].ballot
			self.loadPersonBallot(voterPerson, ballot)
		}			
	}
	self.copyDistrictBallotsToStage = function(district,stage) {
		for (let voterPerson of district.voterPeople) {
			voterPerson.stages[stage] = {ballot: _jcopy(voterPerson.stages[model.stage].ballot)}
		}
	}
	self.loadPersonBallot = function(voterPerson, ballot) {

		if (voterPerson.stages[model.stage] == undefined) {
			var stageInfo = {}
			stageInfo[model.stage] = {ballot:ballot}
			_addAttributes(voterPerson.stages, stageInfo)
		} else {
			_addAttributes(voterPerson.stages[model.stage], {ballot:ballot})
		}
	}

}

function VoterCrowd(model) {
	var self = this;
	Draggable.call(self);
	
	_fillVoterDefaults(self)
	self.voterGroupType = undefined
	self.size = undefined
	
	self.typeVoterModel = 'Plurality'
	self.voterModel = undefined

	self.voterPeople = model.voterSet.newCrowd() // voterPeople will reference the data in voterSet
	self.points = [[0,0]];

	self.img = new Image();  // use the face
	self.img.src = "play/img/voter_face.png";

	self.drawBackAnnotation = function(x,y,ctx) {}
	self.drawAnnotation = function(x,y,ctx) {}; // TO IMPLEMENT

	self.initVoterModel = function() {

		self.voterModel = new VoterModel(model,self.typeVoterModel)

	}
	self.initVoterSet = function() {

		// make a voterPerson for each point
		self.voterPeople.length = 0
		for(var i=0; i<self.points.length; i++){
			var voterPerson = new VoterPerson(model,self.voterModel)
			voterPerson.iPoint = i
			voterPerson.weight = 1
			self.voterPeople.push(voterPerson)
		}
		
		model.voterSet.init()
		self.updateVoterSet()
	}
	self.updateVoterSet = function() {

		for(var i=0; i<self.points.length; i++){
			var p = self.points[i];
			var x = self.x + p[0];
			var y = self.y + p[1];
			var voterPerson = self.voterPeople[i]
			voterPerson.x = x
			voterPerson.y = y
		}
	}
	self.updateBallots = function() {
		model.voterSet.updateCrowdBallots(self)
	}
	self.updateDistrictBallots = function(district) {
		model.voterSet.updateCrowdDistrictBallots(self,district)
	}
}

function _fillVoterDefaults(self) {
	// a helper for configuring 

	_fillInDefaults(self,{ 
		// FIRST group in expVoterPositionsAndDistributions
		vid: 0,
		snowman: false,
		x_voters: false,
		crowdShape: "Nicky circles",
		// SECOND group in "exp_addVoters"
		// same for all voter groups in model
		preFrontrunnerIds:["square","triangle"],
		doTwoStrategies: false,
		spread_factor_voters: 1,
		// could vary between voters
		secondStrategy: "zero strategy. judge on an absolute scale.",
		percentSecondStrategy: 0,
		group_count: 50,
		group_spread: 190,
		isVoter: true
	})
}

function GaussianVoters(model){ // this config comes from addVoters in main_sandbox

	var self = this;
	VoterCrowd.call(self,model)
	self.isGaussianVoters = true
	self.voterGroupType = "GaussianVoters"
	self.disk = 3
	self.size = 30
	
	self.init = function() {
		self.initVoterModel()
		self.initPoints()
		self.initVoterSet()
	}

	self.updatePeople = function() {

		self.updateVoterSet()

		self.strategyPick()

	}

	self.initPoints = function () {
		// puts the voters into position
				
		// HACK: larger grab area
		// self.radius = 50;
		if (self.crowdShape == "Nicky circles") {
			// SPACINGS, dependent on NUM
			var spacings = [0, 12, 12, 12, 12, 20, 30, 50, 100];
			if (self.snowman) {
				if (self.vid == 0) {
					spacings.splice(3)
				} else if (self.vid == 1) {
					spacings = [0,12,12,12]
				} else if (self.vid == 2) {
					spacings.splice(4)
				}
				//spacings.splice(2+self.vid)
			} else if(self.disk==1){
				spacings.splice(4);
			} else if(self.disk==2){
				spacings.splice(5);
			} else if (self.disk==3){
				spacings = [0, 10, 11, 12, 15, 20, 30, 50, 100];
			}
			
			// Create 100+ points, in a Gaussian-ish distribution!
			var points = [[0,0]];
			self.points = points;
			var _radius = 0,
				_RINGS = spacings.length;
			for(var i=1; i<_RINGS; i++){

				var spacing = spacings[i];
				_radius += spacing;

				var circum = Math.TAU*_radius;
				var num = Math.floor(circum/(spacing-1));
				if (self.snowman && self.vid == 1 && i==3){
					num = 10
				}

				// HACK TO MAKE IT PRIME - 137 VOTERS
				//if(i==_RINGS-1) num += 3;

				var err = 0.01; // yeah whatever
				for(var angle=0; angle<Math.TAU-err; angle+=Math.TAU/num){
					var x = Math.cos(angle)*_radius  * self.spread_factor_voters;
					var y = Math.sin(angle)*_radius  * self.spread_factor_voters;
					points.push([x,y]);
				}

			}
		} else if (self.crowdShape == "circles") {

			var _spread_factor = 2 * Math.exp(.01*self.group_spread) / 20
			var space = 12 * self.spread_factor_voters * _spread_factor

			self.group_count_h = self.group_count_h || 5
			var numRings = self.group_count_h / 2
			var odd = self.group_count_h % 2

			var points = [[0,0]]
			if (odd) points = []

			for(var i=(odd)?0:1; i<=numRings; i++){

				var radius = i * space
				if (odd) radius += .5 * space
				
				var symmetry = true
				if (symmetry) {
					var num = (i + odd*.5) * 6
					var dAngle = Math.TAU/num
	
					for(var k = 0; k < num; k++){
						var angle = k * dAngle
						var x = Math.sin(angle)*radius 
						var y = -Math.cos(angle)*radius
						points.push([x,y])
					}
				} else { // the old way
					var circum = Math.TAU*radius
					var num = Math.floor(circum/(space-1))
						
					var dAngle = Math.TAU/num

					for(var k = 0; k < num; k++){
						var angle = k * dAngle
						var x = Math.cos(angle)*radius 
						var y = Math.sin(angle)*radius
						points.push([x,y])
					}
				}
			}
			self.group_count = points.length
			self.radius = radius // last radius
			self.points = points
			
		} else if (self.crowdShape == "rectangles") {

			var _spread_factor = 2 * Math.exp(.01*self.group_spread) / 20
			var space = 12 * self.spread_factor_voters * _spread_factor

			self.group_count_vert = self.group_count_vert || 5
			self.group_count_h = self.group_count_h || 5
			
			var numRings = self.group_count_h / 2
			var vNumRings = self.group_count_vert / 2
			var points = []


			for (var i=-numRings+.5; i<numRings; i++) {
				for (var k=-vNumRings+.5; k<vNumRings; k++) {
					var x = space * i
					var y = space * k
					points.push([x,y])
				}
			}
			self.group_count = points.length
			self.halfwidth = (numRings+.5) * space
			self.halfheight = (vNumRings+.5) * space
			self.points = points
			
		} else if (self.crowdShape == "gaussian sunflower" ) {
			var points = [];
			self.points = points;
			var angle = 0;
			var _radius = 0;
			var _radius_norm = 0;
			var _spread_factor = 2 * Math.exp(.01*self.group_spread) * Math.sqrt(self.group_count/20) // so the slider is exponential
			self.stdev = _spread_factor * 1.38
			var theta = Math.TAU * .5 * (3 - Math.sqrt(5))
			for (var count = 0; count < self.group_count; count++) {
				angle = theta * count
				if (0) {
					_radius_norm = Math.sqrt(1-(count+.5)/self.group_count)
					_radius = _erfinv(_radius_norm) * _spread_factor
					self.stdev = _spread_factor
				} else {
					_radius_norm = 1-(count+.5)/self.group_count
					_radius = Math.sqrt(-2*Math.log(1-_radius_norm)) * self.stdev * .482
					// _radius = Math.sqrt(_radius_norm) * self.stdev * .482
				}
				var x = Math.cos(angle)*_radius  * self.spread_factor_voters;
				var y = Math.sin(angle)*_radius  * self.spread_factor_voters;
				points.push([x,y]);
			}
			self.points = points
		}
		if (0 && (model.dimensions == "1D+B" || model.dimensions == "1D")) {

			var build1 = false
			var forward = true
			if (build1) { // cool method doesn't work
				for (var i = 0; i < self.points.length; i++) {
				// for (var i = self.points.length - 1; i >= 0; i--) {
					points[i][0] = self.points[i][0]
					points[i][1] = 0
					var diameter2 = 30
					var yNewUp, yNewDown
					var yMax = 0
					var yMin = 10000
					var noneighbors = true
					// for (var k = self.points.length - 1; k > i; k--) {
					for (var k = 0; k < i; k++) {
						xDiff2 = (points[k][0] - points[i][0])**2
						if (xDiff2 < diameter2) {
							noneighbors = false
							yDiff = Math.sqrt(diameter2-xDiff2)
							yNewUp = yDiff + points[k][1]
							yNewDown = - yDiff + points[k][1]
							if (yNewUp > yMax) {
								yMax = yNewUp
							}
							if (yNewDown < yMin) {
								yMin = yNewDown
							}
						}
					}
					if (noneighbors) {
						yChoose = 0
					} else if (yMin > 0) {
						var yChoose = yMin
					} else {
						var yChoose = yMax
					}
					points[i][1] = yChoose
				}
				
				for (var i = 0; i < points.length; i++) {
					points[i][1] = -points[i][1]
				}
				self.points = points
			} else {
				var betweenDist = 5
				var stackDist = 5
				var added = []
				var todo = []
				if (forward) {
					for (var i = 0 ; i < self.points.length; i++) {
						todo.push(i)
					}
				} else {
					for (var i = self.points.length - 1 ; i >= 0; i--) {
						todo.push(i)
					}
				}
				var level = 1
				while (todo.length > 0) {
					for (var c = 0; c < todo.length; c++) {
						var i = todo[c]
						// look for collisions
						var collided = false
						for (var d = 0; d < added.length; d++) {
							var k = added[d]
							xDiff = Math.abs(self.points[k][0] - self.points[i][0])
							if (xDiff < betweenDist) {
								collided = true
								break
							}
						}
						if (! collided) {
							self.points[i][2] = (level-1) * -stackDist
							added.push(i)
							todo.splice(c,1)
							c--
						}
					}
					level++
					var added = []
				}

			}
		}
		
	}

	self.strategyPick = function() {
		
		//randomly assign voter strategy based on percentages, but using the same seed each time
		// from http://davidbau.com/encode/seedrandom.js
		Math.seedrandom('hi');
		
		for(var i=0; i<self.points.length; i++){
			if (0) { // two ways to choose which voters use secondStrategy
				var r1 = Math.random() * 99.8 + .1;
			} else {
				if (!self.x_voters) {
					var r1 = (1861*i) % 100 + .5;
				} else {
					var r1 = (34*i) % 100 + .5;
				}
			}	
			if (r1 < self.percentSecondStrategy && self.doTwoStrategies) { 
				var strategy = model.secondStrategy // yes
				var realNameStrategy = model.realNameSecondStrategy
			} else {
				var strategy = model.firstStrategy; // no e.g. 
				var realNameStrategy = model.realNameFirstStrategy
			}
			
			// choose the threshold of voters for polls
			var r_11 = Math.random() * 2 - 1 
			
			var voterPerson = self.voterPeople[i]
			var gauss = _erfinv(r_11) * .2 + model.centerPollThreshold // was .5
			voterPerson.poll_threshold_factor = Math.min(1, gauss)

			voterPerson.strategy = strategy
			voterPerson.realNameStrategy = realNameStrategy
		}
	}

        
	// DRAW!
	self.draw0 = function(ctx){
		if (model.showVoters) {
			setPositionAndSizeGaussian()

			if (model.ballotVis && ! model.visSingleBallotsOnly) {

				_drawMap(ctx)
			}
		}
	}
	self.draw1 = function(ctx){

		if (model.voterIcons == "off") return
		if (model.showVoters) {

			setPositionAndSizeGaussian()

			_drawMe(ctx)
		}
	}
	self.draw2 = function(ctx){
		if ( model.voterCenterIcons == "on") {
			_drawCenter(ctx)
		}
	}

	function _drawMap(ctx) {
		temp = ctx.globalAlpha
		ctx.globalAlpha = .2
		for(var voterPerson of self.voterPeople){
			self.voterModel.drawMap(ctx, voterPerson)
		}
		ctx.globalAlpha = temp
	}

	function _drawMe(ctx){
		for(var voterPerson of self.voterPeople){
			if (model.voterIcons == "dots") {
				var x = voterPerson.xArena
				var y = voterPerson.yArena
				_drawDot( 2, x, y, ctx)
			} else if (model.voterIcons == "top") {
				var x = voterPerson.xArena
				var y = voterPerson.yArena
				var circlesize = voterPerson.size
				var iDistrict = voterPerson.iDistrict
				var c = _findClosestCan(x,y,iDistrict,model)
				_drawCircleFill(x,y,circlesize,c.fill,ctx,model)
			} else {
				self.voterModel.drawMe(ctx, voterPerson)
			}
		}
	}

	function _drawCenter(ctx) {

		 // Don't draw a individual group under a votercenter, which looks weird.
		// if(model.voterCenter && model.voterGroups.length == 1) return
		// I guess this fixed something.. at some point.. but not anymore

		// Circle!
		var size = self.size;
		
		var s = model.arena.modelToArena(self)
		var x = s.x
		var y = s.y

		//self.voterModel.drawCircle(ctx, self.x, self.y, size, ballot);
		if(self.highlight) var temp = ctx.globalAlpha
		if(self.highlight) ctx.globalAlpha = 0.8
		self.drawBackAnnotation(x*2,y*2,ctx)
		
		if (model.voterIcons != "off") {
			if (model.voterIcons == "dots") {
				_drawDot(4, x, y, ctx)
			} else {

				// _drawBlank(model, ctx, x, y, size)
				// _drawRing(ctx,x,y,self.size)
				_drawThickRing(ctx,x,y,size)
				
				// Face!
				// ctx.drawImage(self.img, x*2-size, y*2-size, size*2, size*2);
		
				// Number ID
				var textsize = 20
				ctx.textAlign = "center";
				
				if(model.voterGroups.length != 1) {
					_drawStroked(self.vid+1,x*2+0*textsize,y*2+0*textsize,textsize,ctx);
				}
			}				
	
		}
		self.drawAnnotation(x*2,y*2,ctx)
		if(self.highlight) ctx.globalAlpha = temp
	};
	self.draw = function(ctx){
		self.draw1(ctx)
		self.draw2(ctx)
	};
	
	function setPositionAndSizeGaussian() {
		var circlesize = 10
		for(var i=0; i<self.points.length; i++){
			var p = self.points[i];
			var s = model.arena.modelToArena(self)
			var x = s.x + p[0];
			if (model.dimensions == "2D") {
				var y = s.y + p[1];
			} else {
				var y = s.y + p[2];
				circlesize = 6
			}

			var voterPerson = self.voterPeople[i]
			_addAttributes( voterPerson, {
				xArena:x,
				yArena:y,
				size:circlesize,
			})
		}
	}

}

function _erfinv(x){ // from https://stackoverflow.com/a/12556710
	var z;
	var a  = 0.147;                                                   
	var the_sign_of_x;
	if(0==x) {
		the_sign_of_x = 0;
	} else if(x>0){
		the_sign_of_x = 1;
	} else {
		the_sign_of_x = -1;
	}

	if(0 != x) {
		var ln_1minus_x_sqrd = Math.log(1-x*x);
		var ln_1minusxx_by_a = ln_1minus_x_sqrd / a;
		var ln_1minusxx_by_2 = ln_1minus_x_sqrd / 2;
		var ln_etc_by2_plus2 = ln_1minusxx_by_2 + (2/(Math.PI * a));
		var first_sqrt = Math.sqrt((ln_etc_by2_plus2*ln_etc_by2_plus2)-ln_1minusxx_by_a);
		var second_sqrt = Math.sqrt(first_sqrt - ln_etc_by2_plus2);
		z = second_sqrt * the_sign_of_x;
	} else { // x is zero
		z = 0;
	}
	return z;
}

function _erf(x) {
	var z;
	const ERF_A = 0.147; 
	var the_sign_of_x;
	if(0==x) {
		the_sign_of_x = 0;
		return 0;
	} else if(x>0){
		the_sign_of_x = 1;
	} else {
		the_sign_of_x = -1;
	}

	var one_plus_axsqrd = 1 + ERF_A * x * x;
	var four_ovr_pi_etc = 4/Math.PI + ERF_A * x * x;
	var ratio = four_ovr_pi_etc / one_plus_axsqrd;
	ratio *= x * -x;
	var expofun = Math.exp(ratio);
	var radical = Math.sqrt(1-expofun);
	z = radical * the_sign_of_x;
	return z;
}

function _drawDot(diameter,x,y,ctx) {
	ctx.fillStyle = '#333'
	// ctx.strokeStyle = '#333'
	ctx.lineWidth = 1

	// Just draw a circle.
	ctx.beginPath()
	ctx.arc(x*2,y*2, diameter, 0, Math.TAU, false)
	ctx.fill()
	// ctx.stroke()
}

function SingleVoter(model){

	var self = this;
	VoterCrowd.call(self,model)
	self.isSingleVoter = true
	self.voterGroupType = "SingleVoter"
	self.size = 20

	self.init = function () {

		self.initVoterModel()
		self.initVoterSet()

		self.voterPerson = self.voterPeople[0] // shorthand
		
	}

	self.updatePeople = function() {

		self.updateVoterSet()

		var voterPerson = self.voterPeople[0]

		voterPerson.poll_threshold_factor = .6

		voterPerson.strategy = model.firstStrategy
		voterPerson.realNameStrategy = model.realNameFirstStrategy

	}

	// DRAW!
	self.draw = function(ctx){
		self.draw1(ctx)
		self.draw2(ctx)
	};
	self.draw0 = function(ctx) {
		setPositionAndSizeSingle()

		_drawMap(ctx)

    }
	self.draw1 = function(ctx) {
		setPositionAndSizeSingle()
		
		_drawBack(ctx)

	}
	self.draw2 = function(ctx){
		setPositionAndSizeSingle()

		_drawMe(ctx)

	}

    function setPositionAndSizeSingle() {
        var s = model.arena.modelToArena(self)
        _addAttributes(self.voterPerson, {
            xArena:s.x,
            yArena:s.y,
            size:self.size,
        })
    }
	function _drawMap (ctx) {
		if (model.ballotVis) self.voterModel.drawMap(ctx, self.voterPerson);
	}
	function _drawBack(ctx) {
        var x = self.voterPerson.xArena
        var y = self.voterPerson.yArena

		if(self.highlight) var temp = ctx.globalAlpha
		if(self.highlight) ctx.globalAlpha = 0.8
		// Background, for showing HOW the decision works...
		self.drawBackAnnotation(x*2,y*2,ctx)
		if(self.highlight) ctx.globalAlpha = temp
	}
	function _drawMe(ctx){
        var x = self.voterPerson.xArena
		var y = self.voterPerson.yArena
		
		if (model.arena.mouse.pressed && model.arena.mouse.dragging == self && ! model.doOriginal){
			self.voterPerson.size *= 2
		}
        var size = self.voterPerson.size

		if(self.highlight) var temp = ctx.globalAlpha
		if(self.highlight) ctx.globalAlpha = 0.8
		// Circle!
		if (model.voterIcons == "circle") {
            
			self.voterModel.drawMe(ctx, self.voterPerson)


			// Face!
			var scoreTypeMethod =  (model.ballotType == "Score" || model.ballotType == "Approval" || model.ballotType == "Three")
			if (scoreTypeMethod && model.drawSliceMethod == "circleBunch") {

				_drawRing(ctx,x,y,size)
				_simpleCircle(ctx,x*2,y*2,size,'#ccc')
				self.voterModel.drawMe(ctx, self.voterPerson)
	
			} else if (scoreTypeMethod && model.drawSliceMethod == "barChart") {
				self.voterModel.drawMe(ctx, self.voterPerson)
			} else if (model.ballotType == "Ranked" && model.drawSliceMethod == "barChart") {
				self.voterModel.drawMe(ctx, self.voterPerson)
				if (model.system != "Borda") {
					size = size*2;
					ctx.drawImage(self.img, x*2 -size/2, y * 2 -size/2, size, size);
				}
			} else {
				_drawRing(ctx,x,y,size)
				self.voterModel.drawMe(ctx, self.voterPerson)
				size = size*2;
				ctx.drawImage(self.img, x*2 -size/2, y*2-size/2, size, size);
			}
		} else if (model.voterIcons == "top") {
            var iDistrict = voterPerson.iDistrict
			var c = _findClosestCan(x,y,iDistrict,model)
			_drawCircleFill(x,y,size,c.fill,ctx,model)
		} else if (model.voterIcons == "dots") {
			_drawDot(2, x, y, ctx)
		} 
		
			
		self.drawAnnotation(x*2,y*2,ctx)
		if(self.highlight) ctx.globalAlpha = temp
    }
    
}

function _findClosestCan(x,y,iDistrict,model) {
	
	var closest = {id:null};
	var closestDistance = Infinity;
	var cans = model.district[iDistrict].stages[model.stage].candidates
	for(var c of cans){
		var dist = distF2(model,{x:x,y:y},c)
		if(dist<closestDistance){
			closestDistance = dist;
			closest = c;
		}
	}
	return closest
}

function _drawCircleFill(x,y,size,fill,ctx,model) {
	x = x*2;
	y = y*2;
	ctx.fillStyle = fill;
	ctx.strokeStyle = 'rgb(0,0,0)';
	ctx.lineWidth = 1

	ctx.beginPath()
	ctx.arc(x, y, size, 0, Math.TAU, true)
	ctx.fill()
	if (model.checkDrawCircle()) ctx.stroke()
}

function VoterCenter(model){

	var self = this;
	Draggable.call(self);
	
	// LOAD
	self.id = "voterCenter";
	self.isVoterCenter = true;
	self.size = 30;
	self.points = [[0,0]];
	self.img = new Image();  // use the face
	var oldway
	if (oldway) {
		self.img.src = "play/img/voter_face.png";
	} else {
		self.img.src = "play/img/center.png";
	}
	self.findVoterCenter = function(){ // calculate the center of the voter groups
		// UPDATE
		var mean = findMean()

		var method = model.median_mean // 1,2,3
		// 1 is the mean
		// 2 is the geometric median
		// 3 is a 1-d median along 4 projections
		// 4 is a 1-d median along 2 projections
		// 5 is 2 medians using the usual median method

		if (method == 1) {
			return mean
		} else if (method == 5) {
			var median = findMedianOrthogonal()
			return median
		} else { // try to find geometric median ... still thinking about whether this is a good idea.
				
			if (method == 2) {
				var distancemeasure = function(xd,yd) {
					return Math.sqrt(xd*xd+yd*yd)
				}
			} else if (method == 3) {
				var distancemeasure = function(xd,yd) {
					return Math.abs(xd) + Math.abs(yd) + Math.abs(xd+yd) + Math.abs(xd-yd)
				}
			} else if (method == 4) {
				var distancemeasure = function(xd,yd) {
					return Math.abs(xd) + Math.abs(yd)// + Math.abs(xd+yd) + Math.abs(xd-yd)
				}
			}

			var median = geometricMedian(mean,distancemeasure)
			return median

		} 
	}
	function findMean() {
		var x = 0
		var y = 0
		var totalnumbervoters = 0
		for(var i=0; i<model.voterGroups.length; i++){
			var voterGroup = model.voterGroups[i]
			var numbervoters = voterGroup.points.length
			x += voterGroup.x * numbervoters
			y += voterGroup.y * numbervoters
			totalnumbervoters += numbervoters
		}
		x/=totalnumbervoters
		y/=totalnumbervoters
		return {x:x, y:y}
	}
	
	function findMedianOrthogonal() {
		xvals = []
		yvals = []
		for(i=0; i<model.voterGroups.length; i++){
			voterGroup = model.voterGroups[i]
			for(m=0; m<voterGroup.points.length; m++) {
				point = voterGroup.points[m]
				xvals.push(point[0]+voterGroup.x)
				yvals.push(point[1]+voterGroup.y)
			}
		}
		x = median(xvals)
		y = median(yvals)
		return {x:x, y:y}
	}

	var median = function(values) {

		values.sort( function(a,b) {return a - b;} );

		var half = Math.floor(values.length/2);

		if(values.length % 2)
			return values[half];
		else
			return (values[half-1] + values[half]) / 2.0;
	}

	function geometricMedian(mean, distancemeasure) {

		var x = mean.x
		var y = mean.y

		// first for centers
		var d, voterGroup, yv,xv,xd,yd,itnv,moved,xt,yt,j,i,dg,m,point
		
		d = 0
		for(i=0; i<model.voterGroups.length; i++){
			voterGroup = model.voterGroups[i]
			xv = voterGroup.x
			yv = voterGroup.y
			xd = xv - x
			yd = yv - y
			d += distancemeasure(xd,yd) * voterGroup.voterPeople.length // d is total distance, not average
		}
		if (0) {
			for (var a = 200; a > .1; ) {
				xt = [x-a,x+a,x-a,x+a] // try these points
				yt = [y-a,y-a,y+a,y+a]
				moved = false
				for (j in xt) {
					xg = xt[j] // the guess
					yg = yt[j]
					// calculate distance
					dg=0
					for(i=0; i<model.voterGroups.length; i++){
						voterGroup = model.voterGroups[i]
						xv = voterGroup.x
						yv = voterGroup.y
						xd = xv - xg
						yd = yv - yg
						dg += distancemeasure(xd,yd) * voterGroup.voterPeople.length
					}
					if (dg < d) { // we found a better point
						d=dg * 1
						x=xg * 1
						y=yg * 1
						moved = true
					}
				}
				if(!moved) a*=.5
			}
		}
		// now we do it again for all the individual points within the voter group
		
		var voterPeople = model.voterSet.allVoters
		var guess = {x:x, y:y}
		return numericApproxGeometricMedian(voterPeople, guess, distancemeasure)
	}


	self.update = function() {// do the center voter thing
		// UPDATE
		var recenter = self.findVoterCenter()
		self.x = recenter.x
		self.y = recenter.y
	}
	self.drag = function() {
		var oldcenter = self.findVoterCenter()
		var changecenter = {x:self.x - oldcenter.x, y:self.y - oldcenter.y}
		for(var i=0; i<model.voterGroups.length; i++){
			model.voterGroups[i].x += changecenter.x
			model.voterGroups[i].y += changecenter.y
		}
	}

	// DRAW!
	self.drawBackAnnotation = function(x,y,ctx) {}
	self.drawAnnotation = function(x,y,ctx) {}; // TO IMPLEMENT
	self.draw = function(ctx){
		// UPDATE
		var s = model.arena.modelToArena(self)
		var x = s.x*2;
		var y = s.y*2;
		size = self.size
		if(self.highlight) var temp = ctx.globalAlpha
		if(self.highlight) ctx.globalAlpha = 0.8

		if (model.voterIcons != "off") {
			
			self.drawBackAnnotation(x,y,ctx)
			if (model.voterIcons == "dots") {
				_drawDot(5, s.x, s.y, ctx)
			} else {
				if (oldway) {
					_drawBlank(model, ctx, s.x, s.y, size);
					_drawRing(ctx,s.x,s.y,self.size)
					
					// Face!
					size = size*2;
					ctx.drawImage(self.img, x-size/2, y-size/2, size, size);
	
				} else {
					size = size*2;

					_drawThickRing(ctx,x/2,y/2,size/2*.7)

					// ctx.drawImage(self.img, x-size/2, y-size/2, size, size);
	
				}
			}
			self.drawAnnotation(x,y,ctx)
		}

		if(self.highlight) ctx.globalAlpha = temp
	};

}

function numericApproxGeometricMedian(voterPeople, guess, distancemeasure) {
	var x = guess.x
	var y = guess.y

	d=0

	for (var voterPerson of voterPeople) {
		xv = voterPerson.x
		yv = voterPerson.y
		xd = xv - x
		yd = yv - y
		d += distancemeasure(xd,yd)
	}

	for (var a = 200; a > .1; ) {
		xt = [x-a,x+a,x-a,x+a] // try these points
		yt = [y-a,y-a,y+a,y+a]
		moved = false
		for (j in xt) {
			xg = xt[j] // the guess
			yg = yt[j]
			// calculate distance
			dg=0
			for (var voterPerson of voterPeople) {
				xv = voterPerson.x
				yv = voterPerson.y
				xd = xv - xg
				yd = yv - yg
				dg += distancemeasure(xd,yd)
			}
			if (dg < d) { // we found a better point
				d=dg * 1
				x=xg * 1
				y=yg * 1
				moved = true
			}
		}
		if(!moved) a*=.5
	}
	return {x:x, y:y}
}
