/****************************

SINGLETON CLASS on how to COUNT UP THE BALLOTS
and RENDER IT INTO THE CAPTION

*****************************/

var Election = {};


Election.score = function(district, model, options){

	options = _electionDefaults(options)
	var polltext = _beginElection(district,model,options,"score")
	let cans = district.stages[model.stage].candidates

	// Tally the approvals & get winner!
	var ballots = model.voterSet.getBallotsDistrict(district)

	var tally = _zeroTally(cans)
	for(var ballot of ballots){
		for(var candidate in ballot){
			tally[candidate] += ballot[candidate];
		}
	}


	var maxscore = 5

	var winners = _countWinner(tally);
	var result = _result(winners,model)
	var color = result.color

	if (options.sidebar) {

		// Caption
		var winner = winners[0];
		var text = "";
		text += "<span class='small'>";
		if ("Auto" == model.autoPoll) text += polltext;
		text += "<b>score as % of max possible: </b><br>";
		if (model.doTallyChart) {
			text += tallyChart(tally,cans,model,maxscore,ballots.length)
			text += "<br>";
		} else {
			for(var i=0; i<cans.length; i++){
				var c = cans[i].id;
				text += model.icon(c)+"'s score: "+_percentFormat(district, tally[c] / maxscore)+"<br>";
			}
		}
		if(!winner | winners.length>=2){
			// NO WINNER?! OR TIE?!?!
			text += _tietext(model,winners);
			// text = "<b>TIE</b> <br> <br>" + text;
		} else {
			text += "<br>";
			text += model.icon(winner)+" has the highest score, so...<br>";
			text += "</span>";
			text += "<br>";
			text += "<b style='color:"+color+"'>"+model.nameUpper(winner)+"</b> WINS";
			// text = "<b style='color:"+color+"'>"+model.nameUpper(winner)+"</b> WINS <br> <br>" + text;
		}

		result.text = text;
	}
	
	if (model.doTop2) var theTop2 = _sortTally(tally).slice(0,2)
	if (model.doTop2) result.theTop2 = theTop2
	return result;
};

function tallyChart(tally,cans,model,maxscore,nballots,opt) {

	opt = opt || {}
	if(opt.percent == undefined) opt.percent = true
	
	var distList = makeDistListFromTally(tally, cans, maxscore, nballots)
	var text = ""
	// text += tBarChart("score",distList,model,{differentDisplay: true})
	text += tBarChart("score",distList,model,opt)
	return text
}

function lineChart(collectTallies,cans,model,maxscore,nballots,opt) {
	
	opt = opt || {}
	if(opt.percent == undefined) opt.percent = true
	var text = ""
	var dls = []
	for (var i = 0; i < collectTallies.length; i++) {
		var tally = collectTallies[i]
		var distList = makeDistListFromTally(tally, cans, maxscore, nballots, {dontSort: true})
		// text += tBarChart("score",distList,model,{differentDisplay: true})
		dls.push(distList)
	}
	text += dLineChart("score",dls,model,opt)
	text += tBarChart("score",dls[dls.length-1],model,opt)
	return text
}



Election.star = function(district, model, options){

	options = _electionDefaults(options)
	var polltext = _beginElection(district,model,options,"score")	
	let cans = district.stages[model.stage].candidates
	
	var maxscore = 5

	// Tally the approvals & get winner!
	var ballots = model.voterSet.getBallotsDistrict(district)
	var tally = _zeroTally(cans)
	for(var ballot of ballots){
		for(var candidate in ballot){
			tally[candidate] += ballot[candidate];
		}
	}
	
	var frontrunners = [];

	for (var i in tally) {
	   frontrunners.push(i);
	}
	frontrunners.sort(function(a,b){return tally[b]-tally[a]})

	var aWins = 0;
	var bWins = 0;
	for(var k=0; k<ballots.length; k++){
		var ballot = ballots[k];
		if(ballot[frontrunners[0]]>ballot[frontrunners[1]]){
			aWins++; // a wins!
		} else if(ballot[frontrunners[0]]<ballot[frontrunners[1]]){
			bWins++; // b wins!
		}
	}

	if (bWins > aWins) {
		var winners = [frontrunners[1]]
	} else if (aWins > bWins) {
		var winners = [frontrunners[0]]
	} else {
		var winners = frontrunners // tie
	}
	var result = _result(winners,model)
	var color = result.color


	if (model.doTop2) var theTop2 = frontrunners.slice(0,2)
	if (model.doTop2) result.theTop2 = theTop2

	if (!options.sidebar) return result

	// NO WINNER?! OR TIE?!?!
	if(winners.length > 1){

		var text = "<b>TIE</b>";
		result.text = text;

	}else{

		// Caption
		var text = "";
		text += "<span class='small'>";
		if ("Auto" == model.autoPoll) text += polltext;
		text += "<b>pairwise winner of two highest average scores wins</b><br>";
		if (model.doTallyChart) {
			text += tallyChart(tally,cans,model,maxscore,ballots.length)
		} else {
			for(var i=0; i<cans.length; i++){
				var c = cans[i].id;
				text += model.icon(c)+":"+_percentFormat(district, tally[c] / maxscore)+"<br>";
			}	
		}
		if (frontrunners.length >= 2) {
			text += "<br>";
			text += "<b>Final Round between the top two:<br></b>";
			if (model.doTallyChart) {
				var runoffTally = {}
				runoffTally[frontrunners[0]] = aWins
				runoffTally[frontrunners[1]] = bWins
				text += tallyChart(runoffTally,cans,model,1,ballots.length)
			} else {
				text += model.icon(frontrunners[0])+_percentFormat(district, aWins)+". "+model.icon(frontrunners[1]) +_percentFormat(district, bWins) + "<br>";
			}
			text += "</span>";
		}
		text += "<br>";
		text += "<b style='color:"+color+"'>"+model.nameUpper(winners[0])+"</b> WINS";
		// text = "<b style='color:"+color+"'>"+model.nameUpper(winners[0])+"</b> WINS <br> <br>" + text;
		result.text = text;

	}

	return result;
};

Election.three21 = function(district, model, options){

	options = _electionDefaults(options)
	var polltext = _beginElection(district,model,options,"score")	
	let cans = district.stages[model.stage].candidates	
	
	var ballots = model.voterSet.getBallotsDistrict(district)

	// Create the tally
	var tallies = [];
	for (var level=0; level < 3; level++) {
		var tally = _zeroTally(cans);
		tallies.push(tally)
	}

	// Count 'em up
	for(var i=0; i<ballots.length; i++){
		var ballot = ballots[i]
		for(var candidate in ballot){
			tallies[ballot[candidate]][candidate] += 1;
		}
	}

	var semifinalists = [];

	for (var c of cans) {
	   semifinalists.push(c.id);
	}
	semifinalists.sort(function(a,b){return tallies[2][b]-tallies[2][a]})
	semifinalists = semifinalists.slice(0,3)

	var finalists = _jcopy(semifinalists)
	finalists.sort(function(a,b){return tallies[0][a]-tallies[0][b]})

	var aWins = 0;
	var bWins = 0;
	for(var k=0; k<ballots.length; k++){
		var ballot = ballots[k];
		if(ballot[finalists[0]]>ballot[finalists[1]]){
			aWins++; // a wins!
		} else if(ballot[finalists[0]]<ballot[finalists[1]]){
			bWins++; // b wins!
		}
	}


	if (bWins > aWins) {
		var winners = [finalists[1]]
	} else if (aWins > bWins) {
		var winners = [finalists[0]]
	} else {
		var winners = finalists // tie
	}
	var result = _result(winners,model)
	var color = result.color
	
	if (model.doTop2) var theTop2 = finalists.slice(0,2)
	if (model.doTop2) result.theTop2 = theTop2

	if (!options.sidebar) return result

	// NO WINNER?! OR TIE?!?!
	if(winners.length > 1){

		var text = "<b>TIE</b>";
		result.text = text;

	}else{

		// Caption
		var text = "";
		text += "<span class='small'>";
		if ("Auto" == model.autoPoll) text += polltext;
		// text += "Semifinalists: 3 most good. <br>Finalists: 2 least bad. <br>Winner: more preferred.<br><br>";
		text += "<b>Pick semifinalists:</b> 3 most good<br>";
		
		if (model.doTallyChart) {
			text += tallyChart(tallies[2],cans,model,1,ballots.length)
		} else {
			for(var i=0; i<semifinalists.length; i++){
				var c = semifinalists[i];
				text += model.icon(c)+"'s 'good': "+ _percentFormat(district, tallies[2][c]) +"<br>";
			}
		}
		text += "<br>";
		text += "<b>Pick finalists:</b> 2 least bad<br>";
		if (model.doTallyChart) {
			var semiTally = {}
			for(var i=0; i<semifinalists.length; i++){
				var c = semifinalists[i];
				semiTally[c] = tallies[0][c]
			}
			text += tallyChart(semiTally,cans,model,1,ballots.length,{distLine:true})
		} else {
			for(var i=0; i<finalists.length; i++){
				var c = finalists[i];
				text += model.icon(c)+"'s 'bad': "+_percentFormat(district, tallies[0][c])+"<br>";
			}
		}
		text += "<br>";
		text += "<b>Pick winner:</b> 1 more preferred<br>";
		if (model.doTallyChart) {
			var runoffTally = {}
			runoffTally[finalists[0]] = aWins
			runoffTally[finalists[1]] = bWins
			text += tallyChart(runoffTally,cans,model,1,ballots.length)
		} else {
			text += model.icon(finalists[0])+": "+_percentFormat(district, aWins)+"; "+model.icon(finalists[1]) +": "+_percentFormat(district, bWins)+", so...<br>";			
		}

		text += "</span>";
		text += "<br>";
		text += "<b style='color:"+color+"'>"+model.nameUpper(winners[0])+"</b> WINS";
		// text = "<b style='color:"+color+"'>"+model.nameUpper(winners[0])+"</b> WINS <br> <br>" + text;
		result.text = text;

	}

	return result;
};

Election.approval = function(district, model, options){

	options = _electionDefaults(options)
	var polltext = _beginElection(district,model,options,"approval")	
	let cans = district.stages[model.stage].candidates

	// Tally the approvals & get winner!
	var ballots = model.voterSet.getBallotsDistrict(district)
	var tally = _zeroTally(cans)
	for(var ballot of ballots){
		var approved = ballot.approved;
		for(var i=0; i<approved.length; i++) tally[approved[i]]++;
	}

	var winners = _countWinner(tally);

	var result = _result(winners,model)
	var color = result.color

	
	if (model.doTop2) var theTop2 = _sortTally(tally).slice(0,2)
	if (model.doTop2) result.theTop2 = theTop2

	

	if (!options.sidebar) return result

	// Caption
	var winner = winners[0];
	var text = "";
	text += "<span class='small'>";
	if ("Auto" == model.autoPoll) text += polltext;
	text += "<b>most approvals wins (%)</b><br>";
	if (model.doTallyChart) {
		text += tallyChart(tally,cans,model,1,ballots.length)
	} else {
		for(var i=0; i<cans.length; i++){
			var c = cans[i].id;
			text += model.icon(c)+" got "+_percentFormat(district, tally[c])+"<br>";
		}
	}
	if(!winner | winners.length>=2){
		// NO WINNER?! OR TIE?!?!
		text += _tietext(model,winners);
		// text = "<b>TIE</b> <br> <br>" + text;
	} else {
		text += "<br>";
		text += model.icon(winner)+" is most approved, so...<br>";
		text += "</span>";
		text += "<br>";
		text += "<b style='color:"+color+"'>"+model.nameUpper(winner)+"</b> WINS";
		// text = "<b style='color:"+color+"'>"+model.nameUpper(winner)+"</b> WINS <br> <br>" + text;
	}
	result.text = text;
	return result;
};

Election.condorcet = function(district, model, options){

	options = _electionDefaults(options)
	var polltext = _beginElection(district,model,options,"nopoll")	
	let cans = district.stages[model.stage].candidates

	var text = "";

	var ballots = model.voterSet.getBallotsDistrict(district)

	// Create the WIN tally
	var tallyWins = {}
	var tallyWinsOrTies = {}
	var tallyLosses = {}
	var beatsMe = {}
	var beatsOrTiesMe = {}
	for(var candidateID in model.candidatesById) {
		tallyWins[candidateID] = 0
		tallyWinsOrTies[candidateID] = 0
		tallyLosses[candidateID] = 0
		beatsMe[candidateID] = []
		beatsOrTiesMe[candidateID] = []
	}		

	// make a list of mouseover events
	let eventsToAssign = []

	if (options.sidebar) {
			
		text += "<span class='small'>";
		text += "<b>who wins each one-on-one?</b><br>";
		text += pairChart(ballots,district,model)
	}

	// For each combination... who's the better ranking?
	for(var i=0; i<cans.length-1; i++){
		var a = cans[i];
		for(var j=i+1; j<cans.length; j++){
			var b = cans[j];

			// Actually figure out who won.
			var aWins = 0;
			var bWins = 0;
			for(var k=0; k<ballots.length; k++){
				var rank = ballots[k].rank;
				if(rank.indexOf(a.id)<rank.indexOf(b.id)){
					aWins++; // a wins!
				}else{
					bWins++; // b wins!
				}
			}

			// WINNER?
			var winner = (aWins>bWins) ? a : b;
			var loser = (aWins<=bWins) ? a : b;
			var tie = aWins==bWins

			let eventID = 'pair_' + winner.id + '_' + loser.id + '_' + _rand5()
			let e = {
				eventID: eventID,
				f: pairDraw(model,district,winner.id,loser.id,tie)
			}
			eventsToAssign.push(e)

			text += '<div id="' + eventID + '">'
			if ( ! tie ) {
				tallyWins[winner.id]++;
				tallyWinsOrTies[winner.id]++;
				tallyLosses[loser.id]++;
				beatsMe[loser.id].push(winner.id)
				beatsOrTiesMe[loser.id].push(winner.id)
				// Text.
				var by,to;
				if(winner==a){
					by = aWins;
					to = bWins;
				}else{
					by = bWins;
					to = aWins;
				}
				text += model.icon(winner.id) + " beats " + model.icon(loser.id) + ", "+_percentFormat(district, by)+" to "+_percentFormat(district, to)+"<br>";
				// text += model.icon(a.id)+" vs "+model.icon(b.id)+": "+model.icon(winner.id)+" wins, "+_percentFormat(district, by)+" to "+_percentFormat(district, to)+"<br>";
			} else { //tie
				tallyWinsOrTies[a.id]++;
				tallyWinsOrTies[b.id]++;
				beatsOrTiesMe[a.id].push(b.id)
				beatsOrTiesMe[b.id].push(a.id)
				text += " TIE between " + model.icon(a.id)+" "+model.icon(b.id) + "<br>";
				// text += model.icon(a.id)+" vs "+model.icon(b.id)+": "+"TIE"+"<br>";
			}
			text += '</div>'


		}
	}

	// Was there one who won all?
	var topWinners = [];
	for(var id in tallyWins){
		if(tallyWins[id]==cans.length-1){
			topWinners.push(id);
		}
	}

	// was there one who lost none?
	if (topWinners.length === 0) {
		for(var id in tallyLosses){
			if(tallyLosses[id]==0){
				topWinners.push(id);
			}
		}
	}

	// if there are multiple, then they tied each other
	
	// if there are none, then there's a cycle
	// find the Schwartz set = nobody beats the set
	if (topWinners.length == 0) {
		// ties

		// sort list
		var idSorted = Object.keys(tallyWins).sort(function(x,y) {return -tallyWins[x]+tallyWins[y]}) // reverse?
		var indexOfId = {}
		for (var i = 0; i < idSorted.length; i++) indexOfId[idSorted[i]] = i
		var divider = 1
		for (var i = 0; i < divider; i++) {
			var b = beatsMe[idSorted[i]]
			for (var j = 0; j < b.length; j++) {
				divider = Math.max(divider, indexOfId[b[j]] + 1)
			}
		}
		topWinners = idSorted.slice(0,divider)
		var usedSchwartz = true
	}

	var result = _result(topWinners,model)
    var color = result.color
	if (model.doTop2) var theTop2 = _sortTally(tallyWins).slice(0,2)
	if (model.doTop2) result.theTop2 = theTop2
	if (!options.sidebar) return result

	var topWinner = topWinners[0];
	// Winner... or NOT!!!!
	text += "<br>";
	if (topWinners.length == 1) {
		if (usedSchwartz) {
			text += model.icon(topWinner)+" beats or ties all other candidates in one-on-one races.<br>";
		} else {
			text += model.icon(topWinner)+" beats all other candidates in one-on-one races.<br>";
		}
		text += "</span>";
		text += "<br>";
		text += "<b style='color:"+color+"'>"+model.nameUpper(topWinner)+"</b> WINS";
		// text = "<b style='color:"+color+"'>"+model.nameUpper(topWinner)+"</b> WINS <br> <br>" + text;
	}else if (topWinners.length >= 2) {
		for(var i=0; i<cans.length; i++){
			var c = cans[i].id;
			text += model.icon(c)+" got "+tallyWins[c]+" wins<br>";
		}
		text += "<br>";
		text += _tietext(model,topWinners);
		// text = "<b>TIE</b> <br> <br>" + text;
	} else {
		text += "NOBODY beats everyone else in one-on-one races.<br>";
		text += "</span>";
		text += "<br>";
		text += "THERE'S NO WINNER.<br>";
		text += "<b id='ohno'>OH NO.</b>";
	}

	// what's the loop?

	result.text = text;
	result.eventsToAssign = eventsToAssign

	return result;
};

function pairChart(ballots,district,model) {
	var text = ""
	text += "<span class='small'>"
	let opt = {entity:"winner",doSort:true,triangle:true,light:true}
	let hh = head2HeadTally(model, district,ballots)
	text += pairwiseTable(hh,district,model,opt)
	text += "</span><br>"
	return text
}

function squarePairChart(ballots,district,model) {
	var text = ""
	text += "<span class='small'>"
	let opt = {entity:"winner",light:true,diagonal:true}
	let hh = head2HeadTally(model, district,ballots)
	text += pairwiseTable(hh,district,model,opt)
	text += "</span><br>"
	return text
}

// PairElimination
Election.schulze = function(district, model, options){ // Pairs of candidates are sorted by their win margin.  Then we eliminate the weakest wins until there is a Condorcet winner.  A condorcet winner has 0 losses.

	options = _electionDefaults(options)
	var polltext = _beginElection(district,model,options,"nopoll")	
	let cans = district.stages[model.stage].candidates

	var reverseExplanation = true

	var text = "";

	var ballots = model.voterSet.getBallotsDistrict(district)

	
	if (options.sidebar) {
			
		text += "<span class='small'>";
		text += "<b>who wins each one-on-one?</b><br>";
		text += pairChart(ballots,district,model)
		
		if (reverseExplanation) {
			text += "<b>who lost the least, one-on-one?</b><br>";
		} else {
			text += "<b>who had the strongest wins, one-on-one?</b><br>";
		}
	}

	// Create the WIN tally
	var tally = {};
	var losses = {};
	for(var candidateID in model.candidatesById) tally[candidateID] = 0;
	for(var candidateID in model.candidatesById) losses[candidateID] = 0;

	// For each combination... who's the better ranking?
	pairs = []
	for(var i=0; i<cans.length-1; i++){
		var a = cans[i];
		for(var j=i+1; j<cans.length; j++){
			var b = cans[j];

			// Actually figure out who won.
			var aWins = 0;
			var bWins = 0;
			for(var k=0; k<ballots.length; k++){
				var rank = ballots[k].rank;
				if(rank.indexOf(a.id)<rank.indexOf(b.id)){
					aWins++; // a wins!
				}else{
					bWins++; // b wins!
				}
			}

			// WINNER?
			var winner = (aWins>bWins) ? a : b;
			var loser = (aWins>bWins) ? b : a;
			if (aWins != bWins) {
				tally[winner.id]++;
				losses[loser.id]++;

				// Text.
				var by,to;
				if(winner==a){
					by = aWins;
					to = bWins;
					pairs.push({winI:i,loseI:j,winN:aWins,loseN:bWins,margin:aWins-bWins,tie:false})
				}else{
					by = bWins;
					to = aWins;
					pairs.push({winI:j,loseI:i,winN:bWins,loseN:aWins,margin:bWins-aWins,tie:false})
				}
				//text += model.icon(a.id)+" vs "+model.icon(b.id)+": "+model.icon(winner.id)+" wins by "+by+" to "+to+"<br>";
			} else { //tie
				tally[a.id]++;
				tally[b.id]++;
				pairs.push({winI:i,loseI:j,winN:aWins,loseN:bWins,margin:aWins-bWins,tie:true})
				//text += model.icon(a.id)+" vs "+model.icon(b.id)+": "+"TIE"+"<br>";
			}
		}
	}

	// Was there one who won all????
	var topWinners = [];
	
	for(var id in tally){
		if(tally[id]==cans.length-1){
			topWinners.push(id);
		}
	}
	var unanimousWin = topWinners.length == 1
	

	pairs = pairs.sort(function(x,y) {return y.margin - x.margin}) // sort in descending order
		

	// if there was a tie, then try to break the tie
	if (! unanimousWin) {

		// switch to indexing the candidates by numbers instead of names
		var lossesI=[]
		for (var j = 0; j < cans.length; j++) {
			//lossesI[j] = losses[cans[j]]
			lossesI.push(losses[cans[j].id])
		}

		// find the Schwartz set
		schwartz = []

		// find the lowest loss candidates and add them to the schwarz set

		max3 = cans.length
		for(var j = 0; j < cans.length; j++){ // see who wins 
			if(lossesI[j]<max3){
				max3 = lossesI[j]
				schwartz = []
				schwartz.push(j)
			} else if (lossesI[j]==max3){
				schwartz.push(j)
			}
		}
		// add anybody that beat them (not tied)
		var jp
		for (var j = 0; j < pairs.length; j++) {
			jp = pairs[j]
			if ( schwartz.includes(jp.loseI) && ! jp.tie && ! schwartz.includes(jp.winI) ) {
				schwartz.push(jp.winI)
				j = -1 // restart loop
			}
		}
		schwartzFirst =  (Array.from(schwartz)).map(x => cans[x].id)
		



		var tieBreakerWinners = []
		for (var i = pairs.length - 1; i >= 0; i--) { // i represents the strongest pair to be eliminated
			

			if (! pairs[i].tie) {
				losses[cans[pairs[i].loseI].id] -- // eliminate loss
				lossesI[pairs[i].loseI] -- // eliminate loss
			}
			if (i > 0 && pairs[i].margin == pairs[i-1].margin) { // check if there is a tie for weakest win
				continue
			}


			// find the Schwartz set
			schwartz = []

			// find the lowest loss candidates and add them to the schwarz set

			max3 = cans.length
			for(var j = 0; j < cans.length; j++){ // see who wins 
				if(lossesI[j]<max3){
					max3 = lossesI[j]
					schwartz = []
					schwartz.push(j)
				} else if (lossesI[j]==max3){
					schwartz.push(j)
				}
			}
			// add anybody that beat them (not tied)
			var jp
			for (var j = 0; j < i; j++) { // don't look at pairs that are already eliminated
				jp = pairs[j]
				if ( schwartz.includes(jp.loseI) && ! jp.tie && ! schwartz.includes(jp.winI) ) {
					schwartz.push(jp.winI)
					j = -1 // restart loop
				}
			}
			
			// store schwartz set to display later
			pairs[i].schwartz = (Array.from(schwartz)).map(x => cans[x].id)

			// count losses

			var schwartzlosses = []
			for(var j = 0; j < cans.length; j++){ 
				schwartzlosses[j] = 0
			} 
		
			
			for (var j = 0; j < pairs.length; j++) { 
				jp = pairs[j]
				if ( schwartz.includes(jp.loseI) && ! jp.tie && schwartz.includes(jp.winI) ) {
					schwartzlosses[jp.loseI]++
				}
			}
			
			//////////////////////// doesn't work yet
			


			// finda winner in the Schwartz set

			for(var j in schwartz){ // see who wins 
				var guy = schwartz[j]
				if(lossesI[guy]==0){
					tieBreakerWinners.push(cans[guy].id);
				}
			}
			if (tieBreakerWinners.length > 0) break; // stop if someone won

		}
		topWinners = tieBreakerWinners
		var strongestElimination = i
	}



    var result = _result(topWinners,model)
    var color = result.color
	if (model.doTop2) var theTop2 = _sortTally(tally).slice(0,2)
	if (model.doTop2) result.theTop2 = theTop2
	if (!options.sidebar) return result
		
	if (unanimousWin) {
		text += model.icon(topWinners[0])+" beats all other candidates in one-on-one races.<br>";
	} else {
		schwartztext = ""
		for (var j in model.candidatesById) { // go through the candidate names in order and display the ones that are in the schwartz set.
			if( schwartzFirst.includes(j)) {
				schwartztext = schwartztext + model.icon(j)	
			}
		}
		schwartztext += " is Schwartz set.<br>"
		text += schwartztext
	}

	// add text
	for (var i in pairs) {
		if (reverseExplanation) i = pairs.length - i - 1
		var a = cans[pairs[i].winI]
		var b = cans[pairs[i].loseI]
		
		if (i >= strongestElimination) {
			var begintext = "<del>"
			var endtext = "</del><br>"
		} else {
			var begintext = ""
			var endtext = "<br>"
		}


		if (! unanimousWin) {
			schwartztext = ""
			if (pairs[i].hasOwnProperty("schwartz")) {
				for (var j in model.candidatesById) { // go through the candidate names in order and display the ones that are in the schwartz set.
					if( pairs[i].schwartz.includes(j)) {
						schwartztext = schwartztext + model.icon(j)	
					}
				}
				var extraspace = cans.length - pairs[i].schwartz.length
				var spaces = Math.round(extraspace * 3.4 + 0)
				for (var j = 0; j < spaces; j++) {
					schwartztext = schwartztext + "&nbsp;"
				}
				schwartztext += "&larr;"
			} else {
				var spacelength = Math.round(cans.length * 3.4 + 4)
				for (var j = 0; j < spacelength; j++) {
					schwartztext = schwartztext + "&nbsp;"
				}
			}
			begintext = schwartztext + begintext
		}

		if (pairs[i].tie) {
			if(reverseExplanation) {
				text += begintext + model.icon(a.id)+"&"+model.icon(b.id) + " tie" + endtext	
			} else {
				text += begintext + "Tie for " + model.icon(a.id)+"&"+model.icon(b.id) + endtext
				//text += model.icon(b.id)+" ties  "+model.icon(a.id) + endtext
			}
		} else {
			if(reverseExplanation) {
				text += begintext + model.icon(b.id)+" lost to "+model.icon(a.id)+" by " + _percentFormat(district, pairs[i].margin) + endtext
			} else {
				text += begintext + model.icon(a.id)+" beats "+model.icon(b.id)+" by " + _percentFormat(district, pairs[i].margin) + endtext	
			}
		}
		
	}

	// sort losses
	var sortedlosses = []
	for(var i = 0; i < cans.length; i++) sortedlosses.push({name:cans[i].id,losses:losses[cans[i].id]})
	sortedlosses.sort(function(a,b) {return a.losses - b.losses})

	text += "<br>";
	if (topWinners.length >= 2) {
		text += "<b>Eliminate the weakest losses until someone in the Schwartz set has 0 losses.</b><br>"
		for(var i=0; i<sortedlosses.length; i++){
			var c = sortedlosses[i].name;
			text += model.icon(c)+" got "+losses[c]+" strong losses<br>";
		}
		text += _tietext(model,topWinners);
		// text = "<b>TIE</b> <br> <br>" + text;
	} else if (topWinners.length == 0) { // this shouldn't happen
		text = "<b>TIE</b> <br> <br>" + text;
	} else {
		topWinner = topWinners[0]
		if (unanimousWin) {
			
		} else {
			text += "<b>Eliminate the weakest wins until someone in the Schwartz set has 0 losses.<br>"
			for(var i=0; i<sortedlosses.length; i++){
				var c = sortedlosses[i].name;
				text += model.icon(c)+" got "+losses[c]+" strong losses<br>";
			}
		}
		text += "</span>";
		text += "<br>";
		text += "<b style='color:"+color+"'>"+model.nameUpper(topWinner)+"</b> WINS";
		// text = "<b style='color:"+color+"'>"+model.nameUpper(topWinner)+"</b> WINS <br> <br>" + text;	
	}
	
	// what's the loop?

	result.text = text;

	return result;
};


function pairDraw(model,district,winid,loseid,tie,weightcopy,pastwinnerscopy) { // a function is returned, so that i has a new scope
	return function() {
		// we have a backup in the "general" stage
		// so we can edit the ballots directly

		// model.stage = "pair"
		// model.voterSet.copyDistrictBallotsToStage(district,"pair")
		// // I could also copy candidates over, but I don't need to.

		model.voterSet.copyDistrictBallotsToStage(district,"backup")

		// leave only the pair in the ballot
		for (let voterPerson of district.voterPeople) {
			voterPerson.stages[model.stage].ballot.rank = voterPerson.stages[model.stage].ballot.rank.filter(cid => [winid,loseid].includes(cid))
		}

		if (weightcopy) { // we should really use a proper data structure like .round (similar to .stage)
			var backupWC = []
			for(var j=0; j<district.voterPeople.length; j++){
				var v = district.voterPeople[j]
				backupWC[j] = model.voterGroups[v.iGroup].voterPeople[v.iPoint].weight
				let wini = model.candidatesById[winid].i
				let losei = model.candidatesById[loseid].i
				model.voterGroups[v.iGroup].voterPeople[v.iPoint].weight = weightcopy[j][wini][losei]
			}
		}


		model.dontdrawwinners = true

		// draw - the main action
		model.drawArenas()

		
		// restore backups
		model.dontdrawwinners = false
		
		if (weightcopy) {
			for(var j=0; j<district.voterPeople.length; j++){
				var v = district.voterPeople[j]
				model.voterGroups[v.iGroup].voterPeople[v.iPoint].weight = backupWC[j]
			}
		}

		// model.stage = "general"
		model.voterSet.loadDistrictBallotsFromStage(district,"backup")

		// also draw past winners
		
		if (weightcopy) {
			for (var i = 0; i < pastwinnerscopy.length; i++) {
				var p = pastwinnerscopy[i]
				model.candidatesById[p].draw(model.arena.ctx,model.arena)
				model.candidatesById[p].drawText("WON",model.arena.ctx,model.arena)
			}
		}
		// draw this pair's better half
		if (! tie) {
			model.candidatesById[winid].drawText("Better",model.arena.ctx,model.arena) 
		} else {
			model.candidatesById[winid].drawText("Tie",model.arena.ctx,model.arena) 
			model.candidatesById[loseid].drawText("Tie",model.arena.ctx,model.arena) 
		}
	}
}

// PairElimination
Election.minimax = function(district, model, options){ // Pairs of candidates are sorted by their win margin.  Then we eliminate the weakest wins until there is a Condorcet winner.  A condorcet winner has 0 losses.

	options = _electionDefaults(options)
	var polltext = _beginElection(district,model,options,"nopoll")	
	let cans = district.stages[model.stage].candidates
	var ballots = model.voterSet.getBallotsDistrict(district)

	var reverseExplanation = true

	
	var text = "";

	if (options.sidebar) {
			
		text += "<span class='small'>";
		text += "<b>who wins each one-on-one?</b><br>";
		text += pairChart(ballots,district,model)
		
		if (reverseExplanation) {
			text += "<b>who lost the least, one-on-one?</b><br>";
		} else {
			text += "<b>who had the strongest wins, one-on-one?</b><br>";
		}
	}


	// Create the WIN tally
	var tally = {};
	var losses = {};
	for(var i=0; i<cans.length; i++){ 
		cID = cans[i].id
		tally[cID] = 0
		losses[cID] = 0
	}

	// For each combination... who's the better ranking?
	pairs = []
	for(var i=0; i<cans.length-1; i++){
		var a = cans[i];
		for(var j=i+1; j<cans.length; j++){
			var b = cans[j];

			// Actually figure out who won.
			var aWins = 0;
			var bWins = 0;
			for(var k=0; k<ballots.length; k++){
				var rank = ballots[k].rank;
				if (options.ballotweight) {
					var inc = options.ballotweight[k][i][j]
				} else {
					var inc = 1
				}
				if(rank.indexOf(a.id)<rank.indexOf(b.id)){
					aWins+=inc; // a wins!
				}else{
					bWins+=inc; // b wins!
				}
			}

			// WINNER?
			var winner = (aWins>bWins) ? a : b;
			var loser = (aWins>bWins) ? b : a;
			if (aWins != bWins) {
				tally[winner.id]++;
				losses[loser.id]++;

				// Text.
				var by,to;
				if(winner==a){
					by = aWins;
					to = bWins;
					pairs.push({winI:i,loseI:j,winN:aWins,loseN:bWins,margin:aWins-bWins,tie:false})
				}else{
					by = bWins;
					to = aWins;
					pairs.push({winI:j,loseI:i,winN:bWins,loseN:aWins,margin:bWins-aWins,tie:false})
				}
				//text += model.icon(a.id)+" vs "+model.icon(b.id)+": "+model.icon(winner.id)+" wins by "+by+" to "+to+"<br>";
			} else { //tie
				tally[a.id]++;
				tally[b.id]++;
				pairs.push({winI:i,loseI:j,winN:aWins,loseN:bWins,margin:aWins-bWins,tie:true})
				//text += model.icon(a.id)+" vs "+model.icon(b.id)+": "+"TIE"+"<br>";
			}
		}
	}

	// Was there one who won all????
	var topWinners = [];
	
	for(var id in tally){
		if(tally[id]==cans.length-1){
			topWinners.push(id);
		}
	}
	var unanimousWin = topWinners.length == 1
	

	pairs = pairs.sort(function(x,y) {return y.margin - x.margin}) // sort in descending order
		

	// if there was a tie, then try to break the tie
	if (! unanimousWin) {
		var tieBreakerWinners = []
		for (var i = pairs.length - 1; i >= 0; i--) { // i represents the strongest pair to be eliminated
			
			if (! pairs[i].tie) {
				losses[cans[pairs[i].loseI].id] -- // eliminate loss
			}
			
			if (i > 0 && pairs[i].margin == pairs[i-1].margin) { // check if there is a tie for weakest win
				continue
			}
			
			for(var id in tally){ // see who wins
				if(losses[id]==0){
					tieBreakerWinners.push(id);
				}
			}
			if (tieBreakerWinners.length > 0) break; // stop if someone won
		}
		topWinners = tieBreakerWinners
		var strongestElimination = i
	}


    var result = _result(topWinners,model)
    var color = result.color
	if (model.doTop2) var theTop2 = _sortTally(tally).slice(0,2)
	if (model.doTop2) result.theTop2 = theTop2
	if (!options.sidebar) return result
		
	if (unanimousWin) {
		text += model.icon(topWinners[0])+" beats all other candidates in one-on-one races.<br>";
	}

	// add text
	var eventsToAssign = []
		
	for (var i in pairs) {
		if (reverseExplanation) i = pairs.length - i - 1
		var a = cans[pairs[i].winI]
		var b = cans[pairs[i].loseI]
		
		if (i >= strongestElimination) {
			var begintext = "<del>"
			var endtext = "</del> . weak<br>"
		} else {
			var begintext = ""
			var endtext = "<br>"
		}


		var eventID = 'pair_' + a.id + '_' + b.id + '_' + _rand5()
		if (options.round) eventID += '_round' + options.round
		eventID += '_district' + district.i
		text += '<div id="' + eventID + '" class="pair">' // onmouseover="showOnlyPair(' + a.id + ',' + b.id + ')">'
		
		if (options.ballotweight) {
			var weightcopy = _jcopy(options.ballotweight)
			var pastwinnerscopy = _jcopy(options.pastwinners)
		}

		eventsToAssign.push({eventID,f:pairDraw(model,district,a.id,b.id,pairs[i].tie,weightcopy,pastwinnerscopy)})
		if (pairs[i].tie) {
			if(reverseExplanation) {
				text += begintext + model.icon(a.id)+"&"+model.icon(b.id) + " tie" + endtext	
			} else {
				text += begintext + "Tie for " + model.icon(a.id)+"&"+model.icon(b.id) + endtext
				//text += model.icon(b.id)+" ties  "+model.icon(a.id) + endtext
			}
		} else {
			if(reverseExplanation) {
				text += begintext + model.icon(b.id)+" lost to "+model.icon(a.id)+" by " + _percentFormat(district, pairs[i].margin) + endtext
			} else {
				text += begintext + model.icon(a.id)+" beats "+model.icon(b.id)+" by " + _percentFormat(district, pairs[i].margin) + endtext	
			}
		}
		text += '</div>'
		
	}
	result.eventsToAssign = eventsToAssign

	// sort losses
	var sortedlosses = []
	for(var i = 0; i < cans.length; i++) sortedlosses.push({name:cans[i].id,losses:losses[cans[i].id]})
	sortedlosses.sort(function(a,b) {return a.losses - b.losses})

	text += "<br>";
	if (topWinners.length >= 2) {
		text += "<b>Eliminate the weakest losses until someone has 0 losses.</b><br>"
		for(var i=0; i<sortedlosses.length; i++){
			var c = sortedlosses[i].name;
			text += model.icon(c)+" got "+losses[c]+" strong losses<br>";
		}
		text += _tietext(model,topWinners);
		// text = "<b>TIE</b> <br> <br>" + text;
	} else if (topWinners.length == 1) {
		topWinner = topWinners[0]
		if (unanimousWin) {
			
		} else {
			text += "<b>Eliminate the weakest wins until someone has 0 losses.<br>"
			for(var i=0; i<sortedlosses.length; i++){
				var c = sortedlosses[i].name;
				text += model.icon(c)+" got "+losses[c]+" strong losses<br>";
			}
		}
		text += "</span>";
		text += "<br>";
		text += "<b style='color:"+color+"'>"+model.nameUpper(topWinner)+"</b> WINS";
		// text = "<b style='color:"+color+"'>"+model.nameUpper(topWinner)+"</b> WINS <br> <br>" + text;	
	} else {
		text += "No Candidates <br>"
	}
	
	// what's the loop?

	result.text = text;

	return result;
};

// PairElimination
Election.rankedPairs = function(district, model, options){ // Pairs of candidates are sorted by their win margin.  Then we eliminate the weakest wins until there is a Condorcet winner.  A condorcet winner has 0 losses.

	options = _electionDefaults(options)
	var polltext = _beginElection(district,model,options,"nopoll")	
	let cans = district.stages[model.stage].candidates

	var reverseExplanation = false

	var text = "";

	var ballots = model.voterSet.getBallotsDistrict(district)
	
	if (options.sidebar) {
			
		text += "<span class='small'>";
		text += "<b>who wins each one-on-one?</b><br>";
		text += pairChart(ballots,district,model)
		
		if (reverseExplanation) {
			text += "<b>who lost the least, one-on-one?</b><br>";
		} else {
			text += "<b>who had the strongest wins, one-on-one?</b><br>";
		}
	}

	// Create the WIN tally
	var tally = {};
	var losses = {};
	for(var candidateID in model.candidatesById) tally[candidateID] = 0;
	for(var candidateID in model.candidatesById) losses[candidateID] = 0;

	// For each combination... who's the better ranking?
	pairs = []
	for(var i=0; i<cans.length-1; i++){
		var a = cans[i];
		for(var j=i+1; j<cans.length; j++){
			var b = cans[j];

			// Actually figure out who won.
			var aWins = 0;
			var bWins = 0;
			for(var k=0; k<ballots.length; k++){
				var rank = ballots[k].rank;
				if(rank.indexOf(a.id)<rank.indexOf(b.id)){
					aWins++; // a wins!
				}else{
					bWins++; // b wins!
				}
			}

			// WINNER?
			var winner = (aWins>bWins) ? a : b;
			var loser = (aWins>bWins) ? b : a;
			if (aWins != bWins) {
				tally[winner.id]++;
				losses[loser.id]++;

				// Text.
				var by,to;
				if(winner==a){
					by = aWins;
					to = bWins;
					pairs.push({winI:i,loseI:j,winN:aWins,loseN:bWins,margin:aWins-bWins,tie:false})
				}else{
					by = bWins;
					to = aWins;
					pairs.push({winI:j,loseI:i,winN:bWins,loseN:aWins,margin:bWins-aWins,tie:false})
				}
				//text += model.icon(a.id)+" vs "+model.icon(b.id)+": "+model.icon(winner.id)+" wins by "+by+" to "+to+"<br>";
			} else { //tie
				tally[a.id]++;
				tally[b.id]++;
				pairs.push({winI:i,loseI:j,winN:aWins,loseN:bWins,margin:aWins-bWins,tie:true})
				//text += model.icon(a.id)+" vs "+model.icon(b.id)+": "+"TIE"+"<br>";
			}
		}
	}

	// Was there one who won all????
	var topWinners = [];
	
	for(var id in tally){
		if(tally[id]==cans.length-1){
			topWinners.push(id);
		}
	}
	var unanimousWin = topWinners.length == 1
	

	pairs = pairs.sort(function(x,y) {return y.margin - x.margin}) // sort in descending order
		

	// if there was a tie, then try to break the tie
	if (! unanimousWin) {
		var showdead = true // option: should we show the dead candidates?
		var tieBreakerWinners = []
		var hadawin = new Set()
		var dead = new Set()
		var surviving = new Set()
		var survivedq = function (w3) {
			if (! dead.has(w3)) { // this guy hasn't lost yet, so make sure he's in the survivor list
				surviving.add(w3)
			}
			return
		}
		for (var i = 0; i < pairs.length; i++) { // i represents the strongest pair to be eliminated
			var w3 = pairs[i].winI
			var l3 = pairs[i].loseI
			if (pairs[i].tie) {
				survivedq(w3)
				survivedq(l3)
			} else if (surviving.size == 1 && surviving.has(l3) && dead.has(w3)) { 
				// check if there is a conflict 
				// if we're about to remove our last survivor, don't do it
				pairs[i].conflict = true
			} else {
				dead.add(l3)
				surviving.delete(l3)
				survivedq(w3)
			}
			pairs[i].survivors = (Array.from(surviving)).map(x => cans[x].id)
			if (showdead) pairs[i].dead = (Array.from(dead)).map(x => cans[x].id)
		}
		topWinners = (Array.from(surviving)).map(x => cans[x].id)
	}




	
    var result = _result(topWinners,model)
    var color = result.color
	if (model.doTop2) var theTop2 = _sortTally(tally).slice(0,2)
	if (model.doTop2) result.theTop2 = theTop2

	if (!options.sidebar) return result
		
	if (unanimousWin) {
		text += model.icon(topWinners[0])+" beats all other candidates in one-on-one races.<br>";
	}

	// add text

	if (! unanimousWin) {
		text += "(also, cross out the conflicts)<br>";
		text += "(left list: had a win & no loss)<br>"
		var keepShowingSurvivors = true
	}
	for (var i in pairs) {
		if (reverseExplanation) i = pairs.length - i - 1
		var a = cans[pairs[i].winI]
		var b = cans[pairs[i].loseI]
		
		if (pairs[i].conflict) {
			var begintext = "<del>"
			var endtext = "</del><br>" // "conflict"
		} else {
			var begintext = ""
			var endtext = "<br>"
		}
		if (! unanimousWin) { // this is the block that shows the survivors
			survivorstext = ""
			if (keepShowingSurvivors) {
				for (var ic in pairs[i].survivors) {
					var c = pairs[i].survivors[ic]
					survivorstext = survivorstext + model.icon(c)
				}
				if (showdead) {
					survivorstext = survivorstext + ">"
					var deadtext = ""
					for (var ic in pairs[i].dead) {
						var c = pairs[i].dead[ic]
						deadtext = model.icon(c) + deadtext
					}
					survivorstext = survivorstext + deadtext
					var extraspace = cans.length - pairs[i].survivors.length - pairs[i].dead.length
					survivorstext = survivorstext + "&nbsp;&nbsp;&nbsp;"
				} else {
					var extraspace = cans.length - pairs[i].survivors.length
				}
				if (pairs[i].survivors.length == 1 && pairs[i].dead.length + 1 == cans.length) keepShowingSurvivors = false
				
				var spaces = Math.round(extraspace * 3.4 + 0)
				for (var j = 0; j < spaces; j++) {
					survivorstext = survivorstext + "&nbsp;"
				}
			} else {
				var spacelength = Math.round(cans.length * 3.4 + 6)
				for (var j = 0; j < spacelength; j++) {
					survivorstext = survivorstext + "&nbsp;"
				}
			}
			begintext = survivorstext + begintext
		}
		
		if (pairs[i].tie) {
			if(reverseExplanation) {
				text += begintext + model.icon(a.id)+"&"+model.icon(b.id) + " tie" + endtext	
			} else {
				text += begintext + "Tie for " + model.icon(a.id)+"&"+model.icon(b.id) + endtext
				//text += model.icon(b.id)+" ties  "+model.icon(a.id) + endtext
			}
		} else {
			if(reverseExplanation) {
				text += begintext + model.icon(b.id)+" lost to "+model.icon(a.id)+" by " + _percentFormat(district, pairs[i].margin) + endtext
			} else {
				text += begintext + model.icon(a.id)+" beats "+model.icon(b.id)+" by " + _percentFormat(district, pairs[i].margin) + endtext	
			}
		}
		
	}

	text += "<br>";
	if (topWinners.length >= 2) {
		text += _tietext(model,topWinners);
		// text = "<b>TIE</b> <br> <br>" + text;
	} else if (topWinners.length == 1) {
		topWinner = topWinners[0]
		text += "</span>";
		text += "<br>";
		text += "<b style='color:"+color+"'>"+model.nameUpper(topWinner)+"</b> WINS";
		// text = "<b style='color:"+color+"'>"+model.nameUpper(topWinner)+"</b> WINS <br> <br>" + text;	
	} else {
		text += "<br> No Candidates <br>"
	}
	
	// what's the loop?

	result.text = text;

	return result;
};

Election.rbvote = function(district, model, options){ // Use the RBVote from Rob Legrand

	
	options = _electionDefaults(options)
	_beginElection_rbvote(district,model)
	let cans = district.stages[model.stage].candidates

	if (model.checkRunTextBallots()) {
		// var filler = {candidates:[]}
		// result = _check01(filler,model)
		// if (! result.good) return result
		var text = "<span class='small'>";
		rbvote.setreturnstring() // tell rbvote that we might want return strings (unless we're not doing the sidebar)
		document.rbform = {
			rvote:{
				value:model.textBallotInput
			},
			tiebreak:{
				value:""
			},
			ignore:{
				value: ""
			},
			reverse:{
				checked: false
			}
		}
		if (! rbvote.readvotes()) return
		resultRB = model.rbelection(options.sidebar) // e.g. result = rbvote.calctide() // having a sidebar display means we want to construct explanation strings

		if (resultRB.str) { // e.g. when the sidebar is on
			// replace some of the html in the output of rbvote to make it match the style of betterballot
			var rbvote_string = (resultRB.str).replace("style.css","./play/css/rbvote.css").replace()
			rbvote_string = rbvote_string.replace('<th rowspan="5">for</th>',)
			text += rbvote_string
		}
		text += "</span>";
		result = {text:text};
	
		return result;
	}

	var reverseExplanation = false

	
	result = _check01(district,model)
	if (! result.good) return result

	var text = "";

	var ballots = model.voterSet.getBallotsDistrict(district)

	
	if (options.sidebar) {
			
		text += "<span class='small'>";
		text += "<b>who wins each one-on-one?</b><br>";
		text += pairChart(ballots,district,model)
	}

	rbvote.setreturnstring() // tell rbvote that we might want return strings (unless we're not doing the sidebar)
	rbvote.readballots(ballots,district,model)
	resultRB = model.rbelection(options.sidebar) // e.g. result = rbvote.calctide() // having a sidebar display means we want to construct explanation strings
	


	topWinners = [resultRB.winner]



    var result = _result(topWinners,model)
    var color = result.color

	if (!options.sidebar) return result 
	
	// replace some of the html in the output of rbvote to make it match the style of betterballot
	var rbvote_string = (resultRB.str).replace("style.css","./play/css/rbvote.css").replace()
	var intext = []
	var outtext = []
	for(var i = model.candidates.length - 1; i >= 0; i--) {
		var c = model.candidates[i]
		var t = '[^{](' + c.id + ")"
		intext.push(t)
		outtext.push(model.icon(c.id))
	}
	// var outtext = Object.keys(model.candidatesById).map(x => model.icon(x))
	for (var i in intext) {
		
		rbvote_string = rbvote_string.replace(new RegExp(intext[i],"g"), (match, $1) => {
			return match.slice(0,1) + outtext[i]
		})
		// rbvote_string = rbvote_string.replace(new RegExp(intext[i],"g"),outtext[i])
	}
	rbvote_string = rbvote_string.replace('<th rowspan="5">for</th>',)

	text += rbvote_string
	topWinner = topWinners[0]
	text += "</span>";
	text += "<br>";
	text += "<b style='color:"+color+"'>"+model.nameUpper(topWinner)+"</b> WINS";
	// text = "<b style='color:"+color+"'>"+model.nameUpper(topWinner)+"</b> WINS <br> <br>" + text;	

	result.text = text;

	return result;
};

Election.rrv = function(district, model, options){

	options = _electionDefaults(options)
	var polltext = _beginElection(district,model,options,"nopoll")	
	let cans = district.stages[model.stage].candidates

	var numreps = model.seats
	var maxscore = 5

	if (options.sidebar) {
		var text = ""
		var history = {}
		history.rounds = []
		var v =  model.voterSet.getDistrictVoterArray(district)
		history.v = v
		history.seats = numreps
		history.maxscore = maxscore
		model.round = -1
	}

	var invmaxscore = 1/maxscore
	var ballots = model.voterSet.getBallotsDistrict(district)
	var ballotweight = []
	var ballotsum = []
	for(var i=0; i<ballots.length; i++){
		ballotweight[i] = 1
		ballotsum[i] = 0
	}
	var resolved = false
	var tallies = []
	var winnerslist = []
	
	var candidates = [];
	for(var i=0; i<cans.length; i++){
		candidates.push(cans[i].id);
	}
	
	for(var j=0; j<numreps;j++) {
		// Tally the approvals & get winner!
		var tally = _zeroTally(cans)
		for(var i=0; i<ballots.length; i++){
			var ballot = ballots[i]
			for(var k=0; k<candidates.length; k++){
				var candidate = candidates[k];
				tally[candidate] += ballot[candidate] * ballotweight[i]
			}
		}
		tallies.push(tally)
		
		var winners = _countWinner(tally);
		var winner = winners[0] // really we should have a tree of scenarios form here because a whole different group can be chosen from a tiebreaker TODO
		winnerslist.push(winner)
		

		//reweight
		for(var i=0; i<ballots.length; i++){
			var ballot = ballots[i]
			var votetotal = tally[winner]
			ballotsum[i] += ballot[winner] 
			ballotweight[i] = 1/(1+ballotsum[i]*invmaxscore)
		}

		if (options.sidebar) {
			var roundHistory = {
				winners:[model.candidatesById[winner].i],
				q:_jcopy(ballotweight),
				tally:tally
			}
			history.rounds.push(roundHistory)

		}
		
		// remove winner from candidates
		candidates.splice(candidates.indexOf(winner),1)
	}

	var result = _result(winnerslist.concat().sort(),model)

	if (options.sidebar) {

		// Caption
		var text = "";
		for(j=0; j<winnerslist.length;j++){
			text += '<div id="district'+district.i+'round' + (j+1) + '" class="round">'
			text += "<span class='small'>";
			text += "Round " + (j+1);
			var tally = tallies[j]
			var winner = winnerslist[j];
			if (j>0) text += "<br><b>After votes go to winner,</b>"
			text += "<br><b>score as %:</b><br>";
			if (model.doTallyChart) {
				text += tallyChart(tally,cans,model,maxscore,ballots.length)
			} else {
				for(var i=0; i<cans.length; i++){
					var c = cans[i].id;
					//text += model.icon(c)+"'s score: "+((tally[c]/district.voterPeople.length).toFixed(2))+" out of 5.00<br>";
					text += model.icon(c)+": "+_percentFormat(district, tally[c] / maxscore)
					if (winner == c) text += " &larr;"//" <--"
					text += "<br>";
				}
			}
			var color = _colorsWinners([winner],model)[0]
			text += "";
			//text += model.icon(winner)+" has the highest score, so...";
			text += "";
			text += '<br>'
			text += "<b style='color:"+color+"'>"+model.nameUpper(winner)+"</b> WINS <br>";
			// text = "<b style='color:"+color+"'>"+model.nameUpper(winner)+"</b> WINS <br>" + text;
			text += "</span>";
			text += '</div>'
			text += '<br>'
		}
	
		if(options.sidebar) {
			text += '<div id="district'+district.i+'round' + (winnerslist.length+1) + '" class="round">'
			text += "Final Winners:";
			text += "<br>";
			for(var j=0; j<winnerslist.length; j++){
				var c = winnerslist[j]
				text += model.icon(c)+" ";
			}
			text += "<br>";
			text += "<br>";
			text += '</div>'
			
			result.history = history
			result.eventsToAssign = [] // we have an interactive caption
			result.text = text;
			
			// attach caption hover functions
			for (var i=0; i < winnerslist.length+1; i++) {
				var cbDraw = function(i) { // a function is returned, so that i has a new scope
					return function() {
						model.round = i+1
						model.drawArenas()
						model.round = -1
					}
				}
				var e = {
					eventID: "district"+district.i+"round" + (i+1),
					f: cbDraw(i)
				}
				result.eventsToAssign.push(e)
			}
		}

	}

	// if (model.doTop2) var theTop2 = _sortTally(tally).slice(0,2)  
	if (model.doTop2) var theTop2 = winnerslist.slice(0,2)  /// TODO: see if this actually works 
	if (model.doTop2) result.theTop2 = theTop2

	return result;
};

Election.rav = function(district, model, options){

	options = _electionDefaults(options)
	var polltext = _beginElection(district,model,options,"nopoll")	
	let cans = district.stages[model.stage].candidates
	
	var numreps = model.seats
	var maxscore = 1

	if (options.sidebar) {
		var text = ""
		var history = {}
		history.rounds = []
		var v =  model.voterSet.getDistrictVoterArray(district)
		history.v = v
		history.seats = numreps
		history.maxscore = maxscore
		model.round = -1
	}

	var invmaxscore = 1/maxscore
	var ballots = model.voterSet.getBallotsDistrict(district)
	var ballotweight = []
	var ballotsum = []
	for(var i=0; i<ballots.length; i++){
		ballotweight[i] = 1
		ballotsum[i] = 0
	}
	var resolved = false
	var tallies = []
	var winnerslist = []
	
	var candidates = [];
	for(var i=0; i<cans.length; i++){
		candidates.push(cans[i].id);
	}
	
	for(var j=0; j<numreps;j++) {
		// Tally the approvals & get winner!
		var tally = _zeroTally(cans)
		for(var i=0; i<ballots.length; i++){
			var ballot = ballots[i]
			var approved = ballot.approved;
			for(var k=0; k<approved.length; k++) {
				if (candidates.includes(approved[k])) {
					tally[approved[k]] += ballotweight[i];
				}
			}
		}
		tallies.push(tally)
		
		var winners = _countWinner(tally);
		var winner = winners[0] // really we should have a tree of scenarios form here because a whole different group can be chosen from a tiebreaker TODO
		winnerslist.push(winner)
		

		//reweight
		for(var i=0; i<ballots.length; i++){
			var ballot = ballots[i]
			var approved = ballot.approved;
			if (approved.includes(winner)) {
				ballotsum[i]++
				ballotweight[i] = 1/(1+ballotsum[i]*invmaxscore)
			}
		}

		if (options.sidebar) {
			var roundHistory = {
				winners:[model.candidatesById[winner].i],
				q:_jcopy(ballotweight),
				tally:tally
			}
			history.rounds.push(roundHistory)

		}
		
		// remove winner from candidates
		candidates.splice(candidates.indexOf(winner),1)
	}

	var result = _result(winnerslist.concat().sort(),model)

	if (options.sidebar) {

		// Caption
		var text = "";
		for(j=0; j<winnerslist.length;j++){
			text += '<div id="district'+district.i+'round' + (j+1) + '" class="round">'
			text += "<span class='small'>";
			text += "Round " + (j+1);
			var tally = tallies[j]
			var winner = winnerslist[j];
			if (j>0) text += "<br><b>After votes go to winner,</b>"
			text += "<br><b>score as %:</b><br>";
			if (model.doTallyChart) {
				text += tallyChart(tally,cans,model,maxscore,ballots.length)
			} else {
				for(var i=0; i<cans.length; i++){
					var c = cans[i].id;
					//text += model.icon(c)+"'s score: "+((tally[c]/district.voterPeople.length).toFixed(2))+" out of 5.00<br>";
					text += model.icon(c)+": "+_percentFormat(district, tally[c])
					if (winner == c) text += " &larr;"//" <--"
					text += "<br>";
				}   
            }
			var color = _colorsWinners([winner],model)[0]
			text += "";
			//text += model.icon(winner)+" has the highest score, so...";
			text += "";
			text += '<br>'
			text += "<b style='color:"+color+"'>"+model.nameUpper(winner)+"</b> WINS <br>";
			// text = "<b style='color:"+color+"'>"+model.nameUpper(winner)+"</b> WINS <br>" + text;
			text += "</span>";
			text += '</div>'
			text += '<br>'
		}
	
		if(options.sidebar) {
			text += '<div id="district'+district.i+'round' + (winnerslist.length+1) + '" class="round">'
			text += '</span>'
			text += "Final Winners:";
			text += "<br>";
			for(var j=0; j<winnerslist.length; j++){
				var c = winnerslist[j]
				text += model.icon(c)+" ";
			}
			text += "<br>";
			text += "<br>";
			text += '</div>'
		}

		result.history = history
		result.text = text;
		// attach caption hover functions
		result.eventsToAssign = [] // we have an interactive caption
		for (var i=0; i < winnerslist.length+1; i++) {
			var cbDraw = function(i) { // a function is returned, so that i has a new scope
				return function() {
					model.round = i+1
					model.drawArenas()
					model.round = -1
				}
			}
			var e = {
				eventID: "district"+district.i+"round" + (i+1),
				f: cbDraw(i)
			}
			result.eventsToAssign.push(e)
		}
	}

	// if (model.doTop2) var theTop2 = _sortTally(tally).slice(0,2)  
	if (model.doTop2) var theTop2 = winnerslist.slice(0,2)  /// TODO: see if this actually works 
	if (model.doTop2) result.theTop2 = theTop2

	return result;
};

Election.borda = function(district, model, options){

	options = _electionDefaults(options)
	var polltext = _beginElection(district,model,options,"nopoll")	
	let cans = district.stages[model.stage].candidates

	// Tally the approvals & get winner!
	var numcan = cans.length
	var ballots = model.voterSet.getBallotsDistrict(district)
	var tally = _zeroTally(cans)
	for(var ballot of ballots){
		for(var i=0; i<numcan; i++){
			var candidate = ballot.rank[i];
			tally[candidate] += numcan - i - 1; // reverse the rank and subtract 1 because nobody's going to rank their least favorite.
		}
	}
	var winners = _countWinner(tally);
	var result = _result(winners,model)
	var color = result.color

	if (model.doTop2) var theTop2 = _sortTally(tally).slice(0,2)
	if (model.doTop2) result.theTop2 = theTop2
	if (!options.sidebar) return result

	// Caption
	var text = "";
	text += "<span class='small'>";
	// text += "<b>higher score is better</b><br>";
	if (model.doTallyChart) {
		text += tallyChart(tally,cans,model,numcan-1,ballots.length)
	} else {
		for(var i=0; i<cans.length; i++){
			var c = cans[i].id;
			text += model.icon(c)+"'s total score: "+tally[c]+" = "+_percentFormat(district, tally[c] / (numcan-1))+"<br>";
		}	
	}
	if(winners.length>=2){
		// NO WINNER?! OR TIE?!?!
		text += _tietext(model,winners);
		// text = "<b>TIE</b> <br> <br>" + text;
	}else{
		var winner = winners[0];
		text += "<br>";
		text += model.icon(winner)+" has the <i>highest</i> score, so...<br>";
		text += "</span>";
		text += "<br>";
		text += "<b style='color:"+color+"'>"+model.nameUpper(winner)+"</b> WINS";
		// text = "<b style='color:"+color+"'>"+model.nameUpper(winner)+"</b> WINS <br> <br>" + text;
	}
	result.text = text;
	return result;
};

Election.irv = function(district, model, options){

	options = _electionDefaults(options)
	var polltext = _beginElection(district,model,options,"irv")	
	let cans = district.stages[model.stage].candidates

	var drawFlows = (model.ballotConcept != "off") && ( ! options.yeefast )
	if (drawFlows) {
		var transfers = []
		var coalitions = []
		var topChoice = []
		var coalitionInRound = []
		var lastlosers = []
		var losers = []
		var tallies = []
		var continuing = []
	}
	var ballots = model.voterSet.getBallotsDistrict(district)
	cBallots = _jcopy(ballots)

	var text = "";
	if (options.sidebar) text += "<span class='small'>";

	text += polltext;
	var resolved = null;
	var roundNum = 1;

	var candidates = [];
	var startingCandidates = []
	for(var i=0; i< cans.length; i++){
		var cid = cans[i].id
		candidates.push(cid);
		startingCandidates.push(cid)
	}
	var loserslist = []

	if(options.sidebar) {
		// var ov = model.voterGroups // original voters
		// var temp = JSON.parse(JSON.stringify(model.voterGroups)) // save the voters before changing them
		// model.voterGroups = temp
		// var vt = []
		// for (var i=0; i<model.voterGroups.length; i++) {
		// 	vt[i]=[]
		// 	for (varj=0; j < model.voterGroups[i].voterPeople.length; j++)
		// 	vt[i][j] = []
		// 	Object.create(model.voterGroups[i].ballots) // new copy
		// }
		// model.voterGroups = vt
		// // model.voterGroups = model.voterGroups.map( x => Object.create(x)) // new copy
	}
	while(!resolved){

		// There are three stages,
		// 1. Tallying votes
		// 2. Deciding whether to continue
		// 3. Eliminating candidates

		// 1. Tally

		// Tally first choices
		var pre_tally = _zeroTally(cans)
		for(var ballot of cBallots){
			var top = ballot.rank[0]; // just count #1
			pre_tally[top]++;
		}

		// Filter
		// ONLY list the remaining candidates
		var tally = {};
		for(var i=0; i<candidates.length; i++){
			var cID = candidates[i];
			tally[cID] = pre_tally[cID];
		}

		// Explanation Text
		if (options.sidebar) 
		{
			text += "<b>round "+roundNum+":</b><br>";
			text += "who's voters' top choice?<br>";
			if (model.doTallyChart) {
				text += tallyChart(tally,cans,model,1,ballots.length)
			} else {
				for(var i=0; i<candidates.length; i++){
					var c = candidates[i];
					text += model.icon(c)+":"+_percentFormat(district, tally[c])
					if(i<candidates.length-1) text+=", ";
				}   
            }
			text += "<br>";
		}

		if (drawFlows) {

			// find top choices 
			topChoice[roundNum-1] = cBallots.map(x => x.rank[0])

			// count coalition members
			coalitionInRound[roundNum-1] = {}
			for(var i=0; i<candidates.length; i++){
				var cid = candidates[i];
				coalitionInRound[roundNum-1][cid] = {}
				for (var m = 0; m < startingCandidates.length; m++) {
					var cid2 = startingCandidates[m]
					coalitionInRound[roundNum-1][cid][cid2] = 0
				}
			}
			// for all the ballots
			// add to their current top choice's coalition
			for(var k=0; k<cBallots.length; k++){
				cid = cBallots[k].rank[0]
				first = topChoice[0][k]
				coalitionInRound[roundNum-1][cid][first] ++
			}
			tallies.push(_jcopy(tally))
		}


		// 2. DECIDE WHETHER TO CONTINUE

		// Do they have more than 50%?
		var winners = _countWinner(tally);
		var winner = winners[0];
		var ratio = tally[winner] / district.voterPeople.length;
		var option100 = model.opt.irv100
		if (option100) {
			if (candidates.length == 1) {
				resolved = "done";
				if (options.sidebar) text += model.icon(winner)+" is the last candidate standing<br>";
				break;
			}
			
		} else 	if(ratio>0.5){
			if (winners.length >= 2) {	// won't happen bc ratio > .5	
				resolved = "tie"; 
				break;
			}
			resolved = "done";
			if (options.sidebar) text += model.icon(winner)+" has more than 50%<br>";
			break;
		}
		// Otherwise... runoff...
		var losers = _countLoser(tally);
		var loser = losers[0];
		if (model.opt.breakEliminationTiesIRV && losers.length > 1) {

			loser = losers[Math.floor(losers.length * Math.random())]

			if (options.sidebar) {
				for (var li = 0; li < losers.length ; li++ ) {
					cid = losers[li]
					text += model.icon(cid)
				}
				text += " tie during elimination.<br>"
				text += model.icon(loser) + " chosen to lose by tiebreaker.<br>"
			}

			losers = [loser]
		}
		if (losers.length >= candidates.length) {
			resolved = "tie"; 
			break;
		}
		if (0 && candidates.length > 2 && candidates.length - losers.length === 1) {
			// There's only one candidate left
			if (options.sidebar) text += model.icon(winner)+" wins because the others tied in this elimination round.<br>";
			break;
		}
		loserslist = loserslist.concat(losers)

		if (drawFlows) {

			// keep a list of the most recent losers
			lastlosers = losers


			// assign coalitions for the losers
			for (var li = 0; li < losers.length ; li++ ) {
				cid = losers[li]
				var coalition = {
					id: cid,
					list: coalitionInRound[roundNum-1][cid]
				}
				coalitions.push(coalition)
			}

		}

		// 3. ELIMINATE
		
		//text += "nobody's more than 50%. ";

		if (drawFlows) {transfers[roundNum-1] = []}

		for (var li = 0; li < losers.length ; li++ ) {
			loser = losers[li];
			if (options.sidebar) text += "eliminate loser, "+model.icon(loser)+".<br>";

			// REMOVE THE LOSER
			candidates.splice(candidates.indexOf(loser), 1); // remove from candidates...
			for(var i=0; i<cBallots.length; i++){ // remove from ballots
				var ranking = cBallots[i].rank;
				var loserIndex = ranking.indexOf(loser)
				ranking.splice(loserIndex, 1); 		
			}

		}
		if (drawFlows) {
			// calculate transferred voters
			for (var li = 0; li < losers.length ; li++ ) {
				loser = losers[li];

				// make empty data structure for losing candidate
				transfer = {from:loser, flows:{}}
				for (var k = 0; k < candidates.length; k++) {
					var cid = candidates[k]
					transfer.flows[cid] = {}
					for (var m = 0; m < startingCandidates.length; m++) {
						var cid2 = startingCandidates[m]
						transfer.flows[cid][cid2] = 0
					}
				}

				for(var i=0; i<cBallots.length; i++){
					var old = topChoice[roundNum-1][i]
					if (old === loser) {
						var first = topChoice[0][i]
						var now = cBallots[i].rank[0];
						transfer.flows[now][first] ++
					}
				}
				transfers[roundNum-1].push(transfer)

				continuing.push(_jcopy(candidates))
			}
		}
		roundNum++
		if (options.sidebar) text += "<br>"
	
	}

	if (drawFlows) {

	}

	if (model.doTop2 || drawFlows) {
		// add the rest of the candidates to the list of "losers"
		loserslist = loserslist.concat(_sortTallyRev(tally))
	}

	if (model.doTop2) {
		var ll = loserslist.length
		var theTop2 = loserslist.slice(ll-1,ll).concat(loserslist.slice(ll-2,ll-1))
	}
	
	
	var result = _result(winners,model)
	var color = result.color

	if (model.doTop2) result.theTop2 = theTop2

	if (drawFlows) {

		// add the rest of the candidates onto the end of the loserslist
		// and find their coalitions
		for(var i=0; i<candidates.length; i++){
			var cid = candidates[i];
			
			if (1) {
				var rounds = coalitionInRound.length
				var coalition = {
					id: cid,
					list: coalitionInRound[rounds-1][cid]
				}
			} else {
				var coalition = {id: cid, list:{}}
				for (var m = 0; m < startingCandidates.length; m++) {
					var cid2 = startingCandidates[m]
					coalition.list[cid2] = 0
				}
	
				// record the coalition
				for(var k=0; k<cBallots.length; k++){
					var ranking = cBallots[k].rank;
					if (ranking[0] === cid) {
						first = topChoice[0][k]
						coalition.list[first] ++
					}	
				}
			}
			coalitions.push(coalition)
		}

		result.loserslist = loserslist
		result.canIdByDecision = loserslist
		result.transfers = transfers
		result.topChoice = topChoice
		result.coalitions = coalitions
		result.lastlosers = lastlosers
		result.nBallots = cBallots.length
		result.tallies = tallies
		result.continuing = continuing
	}

	// district.pollResults = undefined // clear polls for next time

	if (!options.sidebar) return result

	if (resolved == "tie") {
		text += _tietext(model,winners);
		// text = "<b>TIE</b> <br> <br>" + text;
	} else {
		// END!
		text += "</span>";
		text += "<br>";
		text += "<b style='color:"+color+"'>"+model.nameUpper(winner)+"</b> WINS";
		// text = "<b style='color:"+color+"'>"+model.nameUpper(winner)+"</b> WINS <br> <br>" + text;	
	}

	result.text = text;

	return result;
};

Election.stv = function(district, model, options){

	options = _electionDefaults(options)
	var polltext = _beginElection(district,model,options,"nopoll")	
	let cans = district.stages[model.stage].candidates

	var numreps = model.seats
	
	var drawFlows = (model.ballotConcept != "off") && ( ! options.yeefast )
	if (drawFlows) {
		var transfers = []
		var coalitions = []
		var topChoice = []
		var coalitionInRound = []
		var lastlosers = []
		var losers = []
		var canIdByDecision = []
		var tallies = []
		var continuing = []
		var won = []
	}

	if (options.sidebar) {
		var text = ""
		var history = {}
		history.rounds = []
		var v =  model.voterSet.getDistrictVoterArray(district)
		history.v = v
		history.seats = numreps
		history.maxscore = 5
		model.round = -1
	}

	var quota = 1/(numreps+1)

	if (options.sidebar) {
		var quotapercent = Math.round(quota * 100)
		var text = "";
		text += "<span class='small'>";
		text += "Find " + numreps + " winners.<br>"
		text += "Set quota at 1/(1+" + numreps + ") = " + quotapercent + "%.<br><br>"
		
		var hsid = "hide-show-detail-" + _rand5()

		if (0) {
			text += `<button onclick='var x = document.getElementById("${hsid}");
			if (x.style.display === "none") {
				x.style.display = "block";
			} else {
				x.style.display = "none";
			};'
			">Hide/show detailed results</button>`
		}
		text += `<div id="${hsid}" >` // style="display:none;"
	}
	var resolved = null;
	var roundNum = 1;

	var candidates = [];
	var startingCandidates = []
	for(var i=0; i<cans.length; i++){
		var cid = cans[i].id
		candidates.push(cid);
		startingCandidates.push(cid)
	}
	var loserslist = []
	var winnerslist = []
	var ballots = model.voterSet.getBallotsDistrict(district)
	var cBallots = _jcopy(ballots)
	var ballotweight = []
	for(var i=0; i<cBallots.length; i++){
		ballotweight[i] = 1
	}
	while(!resolved){

		
		if (options.sidebar) {
			
					
			var stillin = []
			for (var i=0; i<candidates.length; i++) {
				stillin.push(model.candidatesById[candidates[i]].i)
			}

			var roundHistory = {
				q:_jcopy(ballotweight),
				ballots:_jcopy(cBallots),
				stillin: stillin
			}

			text += '<div id="district'+district.i+'round' + (roundNum) + '" class="round">'
			text += "<b>round "+roundNum+":</b><br>";
			text += "who's voters' top choice?<br>";
		}

		var pre_tally = _zeroTally(cans)
		for(var i=0; i<cBallots.length; i++){
			var ballot = cBallots[i]
			var first = ballot.rank[0]; // just count #1
			pre_tally[first] += ballotweight[i];
		}

		// ONLY tally the remaining candidates...
		var tally = {};
		for(var i=0; i<candidates.length; i++){
			var cID = candidates[i];
			tally[cID] = pre_tally[cID];
		}

		if (options.sidebar) {
			// Say 'em...
			if (model.doTallyChart) {
				text += tallyChart(tally,cans,model,1,ballots.length)
			} else {
				for(var i=0; i<candidates.length; i++){
					var c = candidates[i];
					// text += model.icon(c)+":"+Math.round(tally[c]);
					text += model.icon(c)+":"+_percentFormat(district,tally[c]);
					
					if(i<candidates.length-1) text+=",<br>";
				}   
            }
			text += "<br>";
		}


		if (drawFlows) {

			// find top choices 
			topChoice[roundNum-1] = []
			for(var i=0; i<cBallots.length; i++){
				var top = cBallots[i].rank[0];
				topChoice[roundNum-1][i] = top
			}

			// count coalition members
			coalitionInRound[roundNum-1] = {}
			for(var i=0; i<candidates.length; i++){
				var cid = candidates[i];
				coalitionInRound[roundNum-1][cid] = {}
				for (var m = 0; m < startingCandidates.length; m++) {
					var cid2 = startingCandidates[m]
					coalitionInRound[roundNum-1][cid][cid2] = 0
				}
			}
			// for all the ballots
			// add to their current top choice's coalition
			for(var k=0; k<cBallots.length; k++){
				cid = cBallots[k].rank[0]
				first = topChoice[0][k]
				coalitionInRound[roundNum-1][cid][first] += ballotweight[k]
			}
			tallies.push(_jcopy(tally))
		}


		// 2. DECIDE WHETHER TO CONTINUE

		// Do they have more than 50%?
		var winners = _countWinner(tally);
		var winner = winners[0];  // there needs to be a better tiebreaker here. TODO
		var ratio = tally[winner]/district.voterPeople.length;
		
		// show all the transfers if the 100% option is chosen
		var option100 = model.opt.irv100
		var lastwin = numreps - winnerslist.length == 1 // this could be the last winner
		var oneleft = candidates.length == 1 // there is only one candidate left
		var wait = option100 && lastwin & !oneleft // don't name the last winner unless he's the only one left
		
		if(ratio>quota && ! wait){
			// if (winners.length >= 2) {	// won't happen bc ratio > .5	
			// 	resolved = "tie"; 
			// 	break;
			// }
			reweight = 1-quota/ratio
			winnerslist.push(winner)
			
			if (options.sidebar) {
				text += model.icon(winner)+" has more than " + quotapercent + "%<br>";
				text += "select winner, "+model.icon(winner)+".<br><br>";
			}

			if (drawFlows) {
				var coalition = {
					id: winner,
					list: coalitionInRound[roundNum-1][winner]
				}
				coalitions.push(coalition)
			}
	
			// 3. Remove winner from candidates

			candidates.splice(candidates.indexOf(winner), 1); // remove from candidates...
			// var ballots = model.voterSet.getBallotsDistrict(district)
			for(var i=0; i<cBallots.length; i++){
				var rank = cBallots[i].rank;
				if (rank[0] === winner) {
					ballotweight[i] *= reweight
				}
				rank.splice(rank.indexOf(winner), 1); // REMOVE THE winner
			}
			if (drawFlows) {
				canIdByDecision = canIdByDecision.concat(winner)
				var transferFrom = [winner]
			}

			if (winnerslist.length == numreps) {
				resolved = "done"

				break
			}
			if (candidates.length == 0) break
		} else {
			winners = []
			winner = null
			// Otherwise... runoff...
			var losers = _countLoser(tally);
			var loser = losers[0];
			if (model.opt.breakEliminationTiesIRV && losers.length > 1) {
				loser = losers[Math.floor(losers.length * Math.random())]
				losers = [loser]
			}
			if (losers.length >= candidates.length) {
				resolved = "tie"; 
				winnerslist = winnerslist.concat(losers)
				var tiedlosers = losers
				break;
			}
			loserslist = loserslist.concat(losers)
			if (drawFlows) canIdByDecision = canIdByDecision.concat(losers)

			if (drawFlows) {

				// keep a list of the most recent losers
				lastlosers = losers
	
	
				// assign coalitions for the losers
				for (var li = 0; li < losers.length ; li++ ) {
					cid = losers[li]
					var coalition = {
						id: cid,
						list: coalitionInRound[roundNum-1][cid]
					}
					coalitions.push(coalition)
				}
	
			}
	
			// 3. ELIMINATE
			
			//text += "nobody's more than 50%. ";
			

			for (var li = 0; li < losers.length ; li++ ) {
				loser = losers[li];
				
				if (options.sidebar) {
					text += "eliminate loser, "+model.icon(loser)+".<br>";
				}
				candidates.splice(candidates.indexOf(loser), 1); // remove from candidates...
				for(var i=0; i<cBallots.length; i++){
					var ranking = cBallots[i].rank;
					var loserIndex = ranking.indexOf(loser)
					ranking.splice(loserIndex, 1); // REMOVE THE LOSER		
				}
			}
			var transferFrom = losers
		}
		

		if (drawFlows) {
			// calculate transferred voters
			
			transfers[roundNum-1] = []

			for (var li = 0; li < transferFrom.length ; li++ ) {
				from = transferFrom[li];

				// make empty data structure for losing candidate
				transfer = {from:from, flows:{}}
				for (var k = 0; k < candidates.length; k++) {
					var cid = candidates[k]
					transfer.flows[cid] = {}
					for (var m = 0; m < startingCandidates.length; m++) {
						var cid2 = startingCandidates[m]
						transfer.flows[cid][cid2] = 0
					}
				}

				for(var i=0; i<cBallots.length; i++){
					var old = topChoice[roundNum-1][i]
					if (old === from) {
						var first = topChoice[0][i]
						var now = cBallots[i].rank[0];
						transfer.flows[now][first] += ballotweight[i]
					}
				}
				transfers[roundNum-1].push(transfer)
                continuing.push(_jcopy(candidates))
                won.push(_jcopy(winnerslist))
			}
		}


		if (candidates.length == 0) {
			// we ran out of candidates, everybody won already
			resolved = "done"
			break
		}

		// And repeat!
		roundNum++;  // TODO: clarify what the round number means, w.r.t ties

		if (options.sidebar) {
			
			roundHistory.tally = tally
			roundHistory.ballots = _jcopy(cBallots)
			if (winner) {
				roundHistory.winners = [model.candidatesById[winner].i]
			} else {
				roundHistory.winners = []
			}
			history.rounds.push(roundHistory)

			text += "<br>"
			text += '</div>'
		}
	}
	
	if (options.sidebar) {
			
		roundHistory.tally = tally
		roundHistory.ballots = _jcopy(cBallots)
		if (winner) {
			roundHistory.winners = [model.candidatesById[winner].i]
		} else {
			roundHistory.winners = []
		}
		history.rounds.push(roundHistory)

		text += "<br>"
		text += '</div>'
		text += '</div>'

		// push out a final reweight just to evaluate how well the method worked
		if (1) {
			var stillin = []
			for (var i=0; i<candidates.length; i++) {
				stillin.push(model.candidatesById[candidates[i]].i)
			}

			var roundHistory = {
				q:_jcopy(ballotweight),
				ballots:_jcopy(cBallots),
				stillin: stillin
			}

			var pre_tally = _zeroTally(cans)
			for(var i=0; i<cBallots.length; i++){
				var ballot = cBallots[i]
				var f1 = ballot.rank[0]; // just count #1
				pre_tally[f1] += ballotweight[i];
			}
	
			// ONLY tally the remaining candidates...
			var tally = {};
			for(var i=0; i<candidates.length; i++){
				var cID = candidates[i];
				tally[cID] = pre_tally[cID];
			}

			
			var winners = _countWinner(tally);
			var winner = winners[0];  // there needs to be a better tiebreaker here. TODO

			roundHistory.tally = tally
			roundHistory.ballots = _jcopy(cBallots)
			if (winner) {
				roundHistory.winners = [model.candidatesById[winner].i]
			} else {
				roundHistory.winners = []
			}
			history.rounds.push(roundHistory)
			
		}
	}
	
	if (options.sidebar) {
		text += '</div>'
	}

	winners = winnerslist.sort() 

	if (model.doTop2) { /// TODO: see if this actually works
		loserslist = loserslist.concat(_sortTallyRev(tally))
		var ll = loserslist.length
		var theTop2 = loserslist.slice(ll-1,ll).concat(loserslist.slice(ll-2,ll-1))
	}
	
	
	var result = _result(winners,model)
	var color = result.color
	if (model.doTop2) result.theTop2 = theTop2

	
	if (drawFlows) {

		// add the rest of the candidates onto the end of the list of candidates sorted by decision order
		// and find their coalitions
		for(var i=0; i<candidates.length; i++){
			var cid = candidates[i];
			canIdByDecision.push(cid)
			
			if (1) {
				var rounds = coalitionInRound.length
				var coalition = {
					id: cid,
					list: coalitionInRound[rounds-1][cid]
				}
			} else {
				var coalition = {id: cid, list:{}}
				for (var m = 0; m < startingCandidates.length; m++) {
					var cid2 = startingCandidates[m]
					coalition.list[cid2] = 0
				}
	
				// record the coalition
				for(var k=0; k<cBallots.length; k++){
					var ranking = cBallots[k].rank;
					if (ranking[0] === cid) {
						first = topChoice[0][k]
						coalition.list[first] ++
					}	
				}
			}
			coalitions.push(coalition)
		}

		result.loserslist = loserslist
		result.canIdByDecision = canIdByDecision
		result.transfers = transfers
		result.topChoice = topChoice
		result.coalitions = coalitions
		result.lastlosers = lastlosers
		result.nBallots = cBallots.length
		result.tallies = tallies
		result.continuing = continuing
		result.won = won
	}

	if (options.sidebar) {
		text += '<div id="district'+district.i+'round' + (roundNum+1) + '" class="round">'
		if (resolved == "tie") {
			text += _tietext(model,tiedlosers);
			// text = "<b>TIE</b> <br> <br>" + text;
		} 
		text = "<br>" + text
		for (var i in winners) {
			var winner = winners[i]
			var color = _colorsWinners([winner],model)[0]
			// END!
			text += "</span>";
			text += "<br>";
			text += "<b style='color:"+color+"'>"+model.nameUpper(winner)+"</b> WINS";
			// text = "<b style='color:"+color+"'>"+model.nameUpper(winner)+"</b> WINS <br>" + text;	
		}
		text += '</div>'
	
		result.history = history
		result.eventsToAssign = [] // we have an interactive caption
		result.text = text;
		
		// attach caption hover functions
		for (var i=0; i < roundNum+1; i++) {
			var cbDraw = function(i) { // a function is returned, so that i has a new scope
				return function() {
					model.round = i+1
					model.drawArenas()
					model.round = -1
				}
			}
			var e = {
				eventID: "district"+district.i+"round" + (i+1),
				f: cbDraw(i)
			}
			result.eventsToAssign.push(e)
		}
	}

	return result;
};

Election.quotaMinimax = function(district, model, options){

	options = _electionDefaults(options)
	var polltext = _beginElection(district,model,options,"nopoll")	
	let cans = district.stages[model.stage].candidates

	var numreps = model.seats

	var pairEventsToAssign = []

	if (options.sidebar) {
		var text = ""
		var history = {}
		history.rounds = []
		var v =  model.voterSet.getDistrictVoterArray(district)
		history.v = v
		history.seats = numreps
		history.maxscore = 5
		model.round = -1
	}

	var quota = 1/numreps

	if (options.sidebar) {
		var quotapercent = Math.round(quota * 100)
		var text = "";
		text += "<span class='small'>";
		text += "Find " + numreps + " winners.<br>"
		text += "Set quota at 1/" + numreps + " = " + quotapercent + "%.<br><br>"
	}

	var candidates = [];
	for(var i=0; i<cans.length; i++){
		candidates.push(cans[i].id);
	}
	var winnerslist = []
	var ballots = model.voterSet.getBallotsDistrict(district)
	var cBallots = _jcopy(ballots)	
	var oldballots = _jcopy(ballots)
	var ballotweight = []
	var numcan = cans.length
	for(var i=0; i<cBallots.length; i++){
		ballotweight[i] = []
		for(var j=0; j < cans.length; j++) {
			ballotweight[i][j] = []
			for(var k=0; k < cans.length; k++) {
				ballotweight[i][j][k] = 1
			}
		}
	}
	var all1 = _jcopy(ballotweight)
	var ballotcounted = _jcopy(all1)


	
	// 	model.stage = "working"
	// 	model.voterSet.copyDistrictBallotsToStage(district,"working")
	// var workingCandids = district.stages[model.stage].candidates
	var oldCandidates = cans
	district.stages[model.stage].candidates = _jcopy(oldCandidates)
	for ( var roundNum = 1; roundNum <= numreps; roundNum++) {

		
		if (options.sidebar) {
			
					
			var stillin = []
			for (var i=0; i<candidates.length; i++) {
				stillin.push(model.candidatesById[candidates[i]].i)
			}

			var roundHistory = {
				q:_jcopy(ballotweight),
				ballots:_jcopy(cBallots),
				stillin: stillin
			}

			text += '<div id="district'+district.i+'round' + (roundNum) + '" class="round">'
			text += "<b>round "+roundNum+":</b><br>";
			if (roundNum>1) {
				text += "Since we already counted the winner's supporters, only count the remaining votes.<br>";
			} 
		}

		var tempOptions = _jcopy(options) // send new options to minimax
		tempOptions.ballotweight = ballotweight
		tempOptions.round = roundNum
		tempOptions.pastwinners = winnerslist
		tempOptions.justCount = true
		// need to change candidates
		var roundResult = Election.minimax(district, model,tempOptions)


		pairEventsToAssign = pairEventsToAssign.concat(roundResult.eventsToAssign)
		
		var winners = roundResult.winners
		var winner = winners[0];  // there needs to be a better tiebreaker here. TODO
		winnerslist.push(winner)
		
		if (options.sidebar) {
			text += '</div>'
			text += roundResult.text
		}


		if (options.sidebar) {
			
			roundHistory.tally = tally
			roundHistory.ballots = _jcopy(cBallots)
			if (winner) {
				roundHistory.winners = [model.candidatesById[winner].i]
			} else {
				roundHistory.winners = []
			}
			history.rounds.push(roundHistory)
			// text += '</div>'
			text += "<br>"
		}
		
		
		var support = []
		for(var j=0; j < numcan; j++) {
			support[j] = []
			for(var k=0; k < numcan; k++) {
				support[j][k] = 0
			}
		}

		var sequential = false
		if (sequential) {
			// add up support for the winner
			for(var i=0; i<cBallots.length; i++){
				var rank = cBallots[i].rank;
				var winpos = rank.indexOf(winner)
				for(j=0; j<ballotweight[i].length; j++) {
					for(k=0; k<ballotweight[i][j].length; k++) {
						if (j==k) continue // skip
						var jr = rank.indexOf(oldCandidates[j].id)
						var kr = rank.indexOf(oldCandidates[k].id)
						if (jr >= winpos && kr >= winpos) {
							support[j][k] += ballotweight[i][j][k]
						}
					}
				}
			}
			// figure out how much to reweight
			reweight = []
			for(var j=0; j < numcan; j++) {
				reweight[j] = []
				for(var k=0; k < numcan; k++) {
					var ratio = support[j][k] / (roundNum * quota * cBallots.length)
					// reweight[j][k] = Math.max(0,1-ratio)
					if (ratio == 0) {
						reweight[j][k] = 1
					} else {
						reweight[j][k] = Math.max(0,1-1/ratio)
					}
				}
			}
			// reweight and eliminate winner
			for(var i=0; i<cBallots.length; i++){
				var rank = cBallots[i].rank;
				var winpos = rank.indexOf(winner)
				for(j=0; j<ballotweight[i].length; j++) {
					for(k=0; k<ballotweight[i][j].length; k++) {
						if (j==k) continue // skip
						var jr = rank.indexOf(oldCandidates[j].id)
						var kr = rank.indexOf(oldCandidates[k].id)
						if (jr >= winpos && kr >= winpos) {
							ballotweight[i][j][k] *= reweight[j][k]
						}
					}
				}
				rank.splice(rank.indexOf(winner), 1); // REMOVE THE winner
			}
		} else {
			// add up support for a the winning candidates so far
			for(var i=0; i<oldballots.length; i++){
				var rank = oldballots[i].rank;
				for(j=0; j<ballotweight[i].length; j++) {
					for(k=0; k<ballotweight[i][j].length; k++) {
						if (j==k) continue // skip
						var jr = rank.indexOf(oldCandidates[j].id)
						var kr = rank.indexOf(oldCandidates[k].id)
						var add = 0
						for (var l=0; l<winnerslist.length;l++){
							var w = winnerslist[l]
							var winpos = rank.indexOf(w)
							if (jr >= winpos && kr >= winpos) {
								add = 1
							}
						}
						ballotcounted[i][j][k] = add
						support[j][k] += add
					}
				}
			}
			// figure out how much to reweight
			// if there is a lot of support for the winning candidates, then the voters can still have positive weight.
			// if there is zero support for the winners, then the voters are at full weight.
			reweight = []
			for(var j=0; j < numcan; j++) {
				reweight[j] = []
				for(var k=0; k < numcan; k++) {
					var ratio = support[j][k] / (roundNum * quota * cBallots.length)
					if (ratio == 0) {
						reweight[j][k] = 1
					} else {
						reweight[j][k] = Math.max(0,1-1/ratio) // don't let reweighting go negative
					}
				}
			}
			ballotweight = _jcopy(all1)
			// reweight and eliminate winner
			for(var i=0; i<cBallots.length; i++){
				var rank = cBallots[i].rank;
				var winpos = rank.indexOf(winner)
				for(j=0; j<ballotweight[i].length; j++) {
					for(k=0; k<ballotweight[i][j].length; k++) {
						if (ballotcounted[i][j][k]) {
							ballotweight[i][j][k] = reweight[j][k]
						}
					}
				}
				rank.splice(rank.indexOf(winner), 1); // REMOVE THE winner
			}
		}
		var cids = [] // candidate id's
		for (var i=0; i < candidates.length; i++) {
			cids.push(candidates[i].id)
		}
		candidates.splice(cids.indexOf(winner), 1); // remove from candidates...

	}
	district.stages[model.stage].candidates = oldCandidates
	
	if (options.sidebar) {
		
		roundHistory.tally = tally
		roundHistory.ballots = _jcopy(cBallots)
		if (winner) {
			roundHistory.winners = [model.candidatesById[winner].i]
		} else {
			roundHistory.winners = []
		}
		history.rounds.push(roundHistory)

		text += "<br>"
		text += '</div>'

		// push out a final reweight just to evaluate how well the method worked
		if (0) {
			var stillin = []
			for (var i=0; i<candidates.length; i++) {
				stillin.push(model.candidatesById[candidates[i]].i)
			}

			var roundHistory = {
				q:_jcopy(ballotweight),
				ballots:_jcopy(cBallots),
				stillin: stillin
			}

			var pre_tally = _zeroTally(cans)
			for(var i=0; i<cBallots.length; i++){
				var ballot = cBallots[i]
				var f1 = ballot.rank[0]; // just count #1
				pre_tally[f1] += ballotweight[i];
			}
			
			// ONLY tally the remaining candidates...
			var tally = {};
			for(var i=0; i<candidates.length; i++){
				var cID = candidates[i];
				tally[cID] = pre_tally[cID];
			}

			
			var winners = _countWinner(tally);
			var winner = winners[0];  // there needs to be a better tiebreaker here. TODO

			roundHistory.tally = tally
			roundHistory.ballots = _jcopy(cBallots)
			if (winner) {
				roundHistory.winners = [model.candidatesById[winner].i]
			} else {
				roundHistory.winners = []
			}
			history.rounds.push(roundHistory)
			
		}
	}
	
	// TODO: fill in last votes

	if (options.sidebar) {
		text += '</div>'
	}

	winners = winnerslist.sort() 

	if (model.doTop2) { /// TODO: see if this actually works
		loserslist = loserslist.concat(_sortTallyRev(tally))
		var ll = loserslist.length
		var theTop2 = loserslist.slice(ll-1,ll).concat(loserslist.slice(ll-2,ll-1))
	}
	
	
	var result = _result(winners,model)
	var color = result.color

	if (model.doTop2) result.theTop2 = theTop2

	if (options.sidebar) {
		text += '<div id="district'+district.i+'round' + (roundNum) + '" class="round">'
		text = "<br>" + text
		for (var i in winners) {
			var winner = winners[i]
			var color = _colorsWinners([winner],model)[0]
			// END!
			text += "</span>";
			text += "<br>";
			// text += "<b style='color:"+color+"'>"+model.nameUpper(winner)+"</b> WINS";
			// text = "<b style='color:"+color+"'>"+model.nameUpper(winner)+"</b> WINS <br>" + text;	
		}
		text += '</div>'
	
		result.history = history
		result.eventsToAssign = [] // we have an interactive caption
		result.text = text;
		
		// attach caption hover functions
		for (var i=0; i < roundNum; i++) {
			var cbDraw = function(i) { // a function is returned, so that i has a new scope
				return function() {
					model.round = i+1
					model.drawArenas()
					model.round = -1
				}
			}
			var e = {
				eventID: "district"+district.i+"round" + (i+1),
				f: cbDraw(i)
			}
			result.eventsToAssign.push(e)
		}
		// attach more
		for (var i=0; i < pairEventsToAssign.length; i++) {
			var e = pairEventsToAssign[i]
			result.eventsToAssign.push(e)
		}
	}

	return result;
};

Election.quotaApproval = function(district, model, options){

	options = _electionDefaults(options)
	var polltext = _beginElection(district,model,options,"nopoll")	
	let cans = district.stages[model.stage].candidates
	
	var v = model.voterSet.getDistrictVoterArray(district)

	var seats = model.seats
	var winners = []
	var winnersIndexes = []
	
	if (options.sidebar) {
		var text = ""
		text += "<span class='small'>";
		var history = {}
		history.rounds = []
		history.v = v
		history.seats = seats
		history.maxscore = 1
		model.round = -1
	}

	var q = []
	for (var i=0; i < v.length; i++) {
		q.push(1)
	}
	for (var n = 0; n < cans.length; n++) {
		if (winners.length >= seats) {
			break
		}
		var tally = []
		for (var k = 0; k < cans.length; k++) {
			tally[k] = 0
		}
		for (var i = 0; i < v.length; i++) {
			var b = v[i].b
			var quota = Math.max(q[i],0)
			
			for (var k = 0; k < b.length; k++) {
				if (winnersIndexes.includes(k)) continue
				if (b[k] == 1) {
					// add up the number of votes
					tally[k] += quota
				}
			}
		}
		if(options.sidebar) {
			text += '<div id="district'+district.i+'round' + (n+1) + '" class="round">'
			text += "Round " + (n+1);
			text += "<br>";
			if (model.doTallyChart) {
				var cidTally = {}
				for(var i=0; i<cans.length; i++){
					var cid = cans[i].id;
					cidTally[cid] = tally[i]
				}   
				text += tallyChart(cidTally,cans,model,1,v.length)
			} else {
				for(var i=0; i<cans.length; i++){
					var c = cans[i].id;
					text += model.icon(c)+" got "+_percentFormat(district, tally[i])+"<br>";
				}   
            }
			text += "<br>";
			text += '</div>'
		}
		// who won this round?
		var roundWinners = _countWinner(tally) // need to exclude twice-winners
		if (model.opt.breakWinTiesMultiSeat) {
			roundWinners = roundWinners[Math.floor(Math.random() * roundWinners.length)]
			roundWinners = [roundWinners]
		}
		roundWinners = roundWinners.map(x => Number(x))
		roundWinners.forEach(x => winnersIndexes.push(Number(x)))
		roundWinnersId = roundWinners.map( x => cans[x].id)
		roundWinnersId.forEach(x => winners.push(x))

		// subtract off the quota
		for (var i=0; i < roundWinners.length; i++) {
			var winnerIndex = roundWinners[i]
			var sum = tally[winnerIndex]
			var rep = v.length / sum / seats
			for (var k=0; k < v.length; k++) { 
				var b = v[k].b
				if (b[winnerIndex]) { // if this voter voted for this candidate
					q[k] -= rep // we could just multiply by b[wI]
				}
			}
		}
		if (options.sidebar) {
			var roundHistory = {
				winners: roundWinners,
				q:q,
				tally:tally
			}
			history.rounds.push(roundHistory)
		}
	}

	
	if(options.sidebar) {
		text += '<div id="district'+district.i+'round' + (n+1) + '" class="round">'
		text += "Final Winners:";
		text += "<br>";
		for(var i=0; i<winners.length; i++){
			var c = winners[i]
			text += model.icon(c)+" ";
		}
		text += "<br>";
		text += "<br>";
		text += '</div>'
	}
	
	var result = _result(winners,model)
	if (options.sidebar) {
		result.history = history
		
		result.text = text

		result.eventsToAssign = [] // we have an interactive caption
		// attach caption hover functions
		for (var i=0; i < n+1; i++) {
			var cbDraw = function(i) { // a function is returned, so that i has a new scope
				return function() {
					model.round = i+1
					model.drawArenas()
					model.round = -1
				}
			}
			var e = {
				eventID: "district"+district.i+"round" + (i+1),
				f: cbDraw(i)
			}
			result.eventsToAssign.push(e)
		}
	}
	return result
}

Election.quotaScore = function(district, model, options){

	options = _electionDefaults(options)
	var polltext = _beginElection(district,model,options,"nopoll")	
	let cans = district.stages[model.stage].candidates
	
	var v = model.voterSet.getDistrictVoterArray(district)

	var seats = model.seats
	var winners = []
	var winnersIndexes = []
	var maxscore = model.voterGroups[0].voterModel.maxscore
	
	if (options.sidebar) {
		var text = ""
		text += "<span class='small'>";
		var history = {}
		history.rounds = []
		history.v = v
		history.seats = seats
		history.maxscore = maxscore
		model.round = -1
	}

	var q = []
	for (var i=0; i < v.length; i++) {
		q.push(1)
	}
	for (var n = 0; n < cans.length; n++) {
		if (winners.length >= seats) {
			break
		}
		var tally = []
		for (var k = 0; k < cans.length; k++) {
			tally[k] = 0
		}
		for (var i = 0; i < v.length; i++) {
			var b = v[i].b
			var quota = Math.max(q[i],0)
			
			for (var k = 0; k < b.length; k++) {
				if (winnersIndexes.includes(k)) continue
				// add up the number of votes
				tally[k] += quota * b[k] / maxscore
			}
		}
		if(options.sidebar) {
			text += '<div id="district'+district.i+'round' + (n+1) + '" class="round">'
			text += "Round " + (n+1);
			text += "<br>";
			if (model.doTallyChart) {
				var cidTally = {}
				for(var i=0; i<cans.length; i++){
					var cid = cans[i].id;
					cidTally[cid] = tally[i]
				}   
				text += tallyChart(cidTally,cans,model,1,v.length)
			} else {
				for(var i=0; i<cans.length; i++){
					var c = cans[i].id;
					text += model.icon(c)+" got "+_percentFormat(district, tally[i])+"<br>";
				}
            }
			text += "<br>";
			text += '</div>'
		}
		// who won this round?
		var roundWinners = _countWinner(tally) // need to exclude twice-winners
		if (model.opt.breakWinTiesMultiSeat) {
			roundWinners = roundWinners[Math.floor(Math.random() * roundWinners.length)]
			roundWinners = [roundWinners]
		}
		roundWinners = roundWinners.map(x => Number(x))
		roundWinners.forEach(x => winnersIndexes.push(Number(x)))
		roundWinnersId = roundWinners.map( x => cans[x].id)
		roundWinnersId.forEach(x => winners.push(x))

		// subtract off the quota
		for (var i=0; i < roundWinners.length; i++) {
			var winnerIndex = roundWinners[i]
			var sum = tally[winnerIndex]
			var rep = v.length / sum / seats
			for (var k=0; k < v.length; k++) { 
				var b = v[k].b
				q[k] -= rep * b[winnerIndex] / maxscore // we could just multiply by b[wI]
			}
		}
		if (options.sidebar) {
			var roundHistory = {
				winners: roundWinners,
				q:q,
				tally:tally
			}
			history.rounds.push(roundHistory)
		}
	}

	
	if(options.sidebar) {
		text += '<div id="district'+district.i+'round' + (n+1) + '" class="round">'
		text += "Final Winners:";
		text += "<br>";
		for(var i=0; i<winners.length; i++){
			var c = winners[i]
			text += model.icon(c)+" ";
		}
		text += "<br>";
		text += "<br>";
		text += '</div>'
	}
	
	var result = _result(winners,model)
	if (options.sidebar) {
		result.history = history
		
		result.text = text

		result.eventsToAssign = [] // we have an interactive caption
		// attach caption hover functions
		for (var i=0; i < n+1; i++) {
			var cbDraw = function(i) { // a function is returned, so that i has a new scope
				return function() {
					model.round = i+1
					model.drawArenas()
					model.round = -1
				}
			}
			var e = {
				eventID: "district"+district.i+"round" + (i+1),
				f: cbDraw(i)
			}
			result.eventsToAssign.push(e)
		}
	}
	return result
}


Election.phragmenMax = function(district, model, options){

	return lpGeneral(_solvePhragmenMax,district,model,options)

}

function lpGeneral(_solver,district,model,options) {

	options = _electionDefaults(options)
	var polltext = _beginElection(district,model,options,"score")
	let cans = district.stages[model.stage].candidates

	// Tally the approvals & get winner!
	var ballots = model.voterSet.getBallotsDistrict(district)

	if (cans.length == 0 || ballots.length == 0) return _result([],model)

	var b = _getBallotsAsB(ballots, cans)

	var phragmenResult = _solver(b,model.seats)
	district.stages[model.stage].lpResult = phragmenResult.results

	var winners = _getWinnersFromPhragmenResult(phragmenResult,cans)

	var maxscore = 5

	// var winners = _countWinner(tally);
	var result = _result(winners,model)
	var color = result.color

	var text = "";
	if (options.sidebar) {
		text += "<span class='small'>";
	}
	if (0 && options.sidebar) {

		// Caption
		var winner = winners[0];
		if ("Auto" == model.autoPoll) text += polltext;
		text += "<b>score as % of max possible: </b><br>";
		for(var i=0; i<cans.length; i++){
			var c = cans[i].id;
			text += model.icon(c)+"'s score: "+_percentFormat(district, tally[c] / maxscore)+"<br>";
		}
	}
		
	if (options.sidebar) {
		if(!winner | winners.length>=2){
			// NO WINNER?! OR TIE?!?!
			text += _tietext(model,winners);
			// text = "<b>TIE</b> <br> <br>" + text;
		} else {
			text += "<br>";
			text += model.icon(winner)+" has the highest score, so...<br>";
			text += "</span>";
			text += "<br>";
			text += "<b style='color:"+color+"'>"+model.nameUpper(winner)+"</b> WINS";
			// text = "<b style='color:"+color+"'>"+model.nameUpper(winner)+"</b> WINS <br> <br>" + text;
		}

		result.text = text;
	}
	
	if (model.doTop2) var theTop2 = _sortTally(tally).slice(0,2)
	if (model.doTop2) result.theTop2 = theTop2
	return result;
};


function _getBallotsAsB(ballots,cans) {
	var b = []
	for(var i = 0; i < ballots.length; i++ ){
		var ballot = ballots[i]
		b[i] = []
		for(var k = 0; k < cans.length; k++){
			var cid = cans[k].id
			b[i][k] = ballot[cid]
		}
	}
	return b
}

function _solvePhragmenMax(b,seats) {

	// doesn't work right now due to limitations of the solver.

	var lb = true

	var nk = b[0].length
	var ni = b.length
	var nw = seats

	var con = {}
	var va = {}
	var ints = {}

	var kset = []
	for (var k = 0; k < nk; k++) {
		kset.push(k)
	}
	var iset = []
	for (var i = 0; i < ni; i++) {
		iset.push(i)
	}

	// variables x for selection of candidates
	for (var k of kset) {
		va['x' + k] = {}
	}

	// candidate is either selected or not, 1 or 0
	for (var k of kset) {
		con['x' + k] = {"max": 1}
		va['x' + k]['x' + k] = 1
		ints['x' + k] = 1
	}

	// n winners
	con["winners"] = {"equal": nw}
	for (var k of kset) {
		va['x' + k]['winners'] = 1
	}
	
	// variables for representation assignment
	for (var k of kset) {
		for (var i of iset) {
			va["y" + i + "_" + k] = {}
			// con["y" + i + "_" + k] =  {"min": 0} 		// no negative assignment allowed
			// va["y" + i + "_" + k]["y" + i + "_" + k] = 1 // no negative assignment allowed
		}
	}

	// support must be the same for all winning candidates
	for (var k of kset) {
		con['xby' + k] = {"equal": 0}
		va['x' + k]["xby" + k] = ni / seats // 1
		for (var i of iset) {
			va["y" + i + "_" + k]["xby" + k] = -b[i][k] * .2
			// va["y" + i + "_" + k]["xby" + k] = -1 // or.. same assignment level for all winning candidates
		}
	}

	// find upper bound of assignment level for voters
	va["z"] = {}
	for (var i of iset) {
		con["zoy" + i] = {"min": 0},
		va["z"]["zoy" + i] = 1
		for (var k of kset) {
			va["y" + i + "_" + k]["zoy" + i] = -1
			// va["y" + i + "_" + k]["zoy" + i] = -b[i][k] // or.. find ub of support level
		}
	}

	// minimize highest assignment level
	var solver = window.solver,
	results,
	model = {
		"optimize": "z",
		"opType": "min",
		"constraints": con,
		"variables": va,
		"ints": ints,
		"options": {
			"tolerance": 0.05
		}
	};

	// put lower bound on assignment level
	if (lb) {
		va["w"] = {}
		for (var i of iset) {
			con["woy" + i] = {"max": 0},
			va["w"]["woy" + i] = 1
			for (var k of kset) {
				va["y" + i + "_" + k]["woy" + i] = -1
			}
		}

		// minimize difference between upper and lower bounds
		va["d"] = {}
		con["dzw"] = {"equal": 0}
		va["z"]["dzw"] = 1
		va["d"]["dzw"] = -1
		va["w"]["dzw"] = -1
		
		model.optimize = "d"
	}

	console.log(model)
	results = solver.Solve(model);
	console.log(results)
	var canResult = []
	for (var k = 0; k < nk; k++) {
		canResult[k] = results['x' + k]
	}

	var phragmenResult = { results:results, canResult:canResult}

	return phragmenResult
}

// for reference regarding above
// model = {
//   "optimize": "z",
//   "opType": "min",
//   "constraints": {
// 	  "zoyI": {"min": 0},
// 	  "xbyK": {"equal": 0},
// 	  "winners": {"equal": 1},
// 	  "xK": {"max": 1},
// 	  // "yIK": {"max": 1},
// 	  "yIK": {"min": 0},
//   },
//   "variables": {
// 	  "z": {
// 		  "zoyI": 1,
// 	  },
// 	  "yIK": {
// 		  "zoyI": -1,
// 		  "xbyK": -b11,
// 	  },
// 	  "xK": {
// 		  "xbyK": 1,
// 		  // "xI": 1,
// 		  "winners":1,
// 	  },
//   },
//   "ints": {
// 	  "xK": 1,
//   }
// };


function _getWinnersFromPhragmenResult(phragmenResult,cans) {
	var winners = []
	for (var k = 0; k < cans.length; k++) {
		if (phragmenResult.canResult[k] == 1) {
			winners.push(cans[k].id)
		}
	}
	return winners
} 

Election.equalFacilityLocation = function(district, model, options){

	var result = lpGeneral(_solveEqualFacilityLocation,district,model,options)

	var lpr = district.stages[model.stage].lpResult
	var maxscore = model.voterGroups[0].voterModel.maxscore
	var numvoters = district.voterPeople.length
	var comboScore = lpr.result / maxscore / numvoters
	
	var makeIcons = x => x ? x.map(a => model.icon(a)) : ""

	if (options.sidebar) {
		var text = "";
		text += `
		<span class='small'>
		The computer has determined that with a total combined score of 
		<b>${_textPercent(comboScore)}</b>, the winners are 
		${makeIcons(result.winners)}
		<span>
		`
		result.text = text
		
	}
	return result

}

function _solveEqualFacilityLocation(b,seats) {

	var nk = b[0].length
	var ni = b.length
	var nw = seats

	var con = {}
	var va = {}
	var ints = {}

	var kset = []
	for (var k = 0; k < nk; k++) {
		kset.push(k)
	}
	var iset = []
	for (var i = 0; i < ni; i++) {
		iset.push(i)
	}

	// variables x for selection of candidates
	for (var k of kset) {
		va['x' + k] = {}
	}

	// candidate is either selected or not, 1 or 0
	for (var k of kset) {
		con['x' + k] = {"max": 1}
		va['x' + k]['x' + k] = 1
		ints['x' + k] = 1
	}
	

	// n winners
	con["winners"] = {"equal": nw}
	for (var k of kset) {
		va['x' + k]['winners'] = 1
	}
	
	// variables for representation assignment
	for (var k of kset) {
		for (var i of iset) {
			va["y" + i + "_" + k] = {}
			// con["y" + i + "_" + k] =  {"min": 0} 		// no negative assignment allowed
			// va["y" + i + "_" + k]["y" + i + "_" + k] = 1 // no negative assignment allowed
		}
	}

	// voter is either assigned to a candidate or not, 1 or 0
	for (var k of kset) {
		for (var i of iset) {
			con["y" + i + "_" + k] = {"max": 1}
			va["y" + i + "_" + k]["y" + i + "_" + k] = 1
			ints["y" + i + "_" + k] = 1
		}
	}

	// voters are assigned exactly once
	for (var i of iset) {
		con["y" + i] = {"equal":1}
		for (var k of kset) {
			va["y" + i + "_" + k]["y" + i] = 1
		}
	}





	// assignments must be the same for all winning candidates
	// within rounding error
	lbSumY = Math.floor( ni / seats )
	ubSumY = Math.ceil( ni / seats )
	for (var k of kset) {
		con['lyx' + k] = {"min": 0} // lower bound
		con['uyx' + k] = {"max": 0} // upper bound
		va['x' + k]["lyx" + k] = -lbSumY
		va['x' + k]["uyx" + k] = -ubSumY
		for (var i of iset) {
			va["y" + i + "_" + k]["lyx" + k] = 1 // -b[i][k] * .2
			va["y" + i + "_" + k]["uyx" + k] = 1
			// va["y" + i + "_" + k]["xby" + k] = -1 // or.. same assignment level for all winning candidates
		}
	}


	if (1) {
		va["z"] = {}
		for (var i of iset) {
			for (var k of kset) {
				va["y" + i + "_" + k]["z"] = b[i][k]
			}
		}
	} else {
		// this doesn't work, we have to set variables to contribute directly to the objective.  It's a limitation of the solver, it seems.
		// find upper bound of assignment level for voters
		con["zby"] = {"equal": 0},
		va["z"] = {}
		va["z"]["zby"] = -1
		for (var i of iset) {
			for (var k of kset) {
				va["y" + i + "_" + k]["zby"] = 6-b[i][k]
				// va["y" + i + "_" + k]["zby" + i] = -b[i][k] // or.. find ub of support level
			}
		}
	}


	// minimize highest assignment level
	var solver = window.solver,
	results,
	model = {
		"optimize": "z",
		"opType": "max",
		"constraints": con,
		"variables": va,
		"ints": ints,
		"options": {
			"tolerance": 0.05
		}
	};

	console.log(model)
	results = solver.Solve(model);
	console.log(results)
	var canResult = []
	for (var k = 0; k < nk; k++) {
		canResult[k] = results['x' + k]
	}

	var phragmenResult = { results:results, canResult:canResult}

	return phragmenResult
}

Election.toptwo = function(district, model, options){ // not to be confused with finding the top2 in a poll, which I already made as a variable

	options = _electionDefaults(options)
	var polltext = _beginElection(district,model,options,"plurality")	
	let cans = district.stages[model.stage].candidates

	// Tally the approvals & get winner!
	var ballots = model.voterSet.getBallotsDistrict(district)
	var tally1 = _zeroTally(cans)
	for(var ballot of ballots){
		tally1[ballot.vote]++;
	}
	var sortedtally = _sortTally(tally1)
	var toptwo = sortedtally.slice(0,2)
	
	// ties.  Who matched the scores of the top two? (I'm not sure of the official way to break ties.)
	var winningscores = toptwo.map(x => tally1[x])
	toptwo = sortedtally.filter(x => winningscores.includes(tally1[x]))
	
	// only do 2 candidates
	model.stage = "runoff"
	district.stages["runoff"] = {candidates: cans.filter( x => toptwo.includes(x.id))  }
	
	model.updateDistrictBallots(district);

	var ballots2 = model.voterSet.getBallotsDistrict(district)
	var tally = _zeroTally(cans)
	for(var ballot of ballots2){
		tally[ballot.vote]++;
	}

	model.stage = "general" // set to general for display purposes
	model.voterSet.loadDistrictBallotsFromStage(district,"general")


	var winners = _countWinner(tally);
	var result = _result(winners,model)
	var color = result.color

	if (model.doTop2) var theTop2 = _sortTally(tally).slice(0,2)
	if (model.doTop2) result.theTop2 = theTop2

	
	district.pollResults = undefined // clear polls for next time

	if (!options.sidebar) return result

	// Caption
	var winner = winners[0];
	var text = "";
	text += "<span class='small'>";
	if ("Auto" == model.autoPoll) text += polltext;
	text += "<b>top two move to 2nd round</b><br>";
	if (model.doTallyChart) {
		text += tallyChart(tally1,cans,model,1,ballots.length)
	} else {
		for(var i=0; i<cans.length; i++){
			var c = cans[i].id;
			text += model.icon(c)+" got "+_percentFormat(district, tally1[c])+"<br>";
		}	
	}
	text += "<br><b>2nd round</b><br>";
	if (model.doTallyChart) {
		var tally2 = {}
		for (var cid of toptwo) {
			tally2[cid] = tally[cid]
		}
		text += tallyChart(tally2,cans,model,1,ballots.length)
		text += "<br>";
	} else {
		for(var i=0; i<cans.length; i++){
			var c = cans[i].id;
			if (toptwo.includes(c)) text += model.icon(c)+" got "+_percentFormat(district, tally[c])+"<br>";
		}
	}
	// Caption text for winner, or tie
	if (winners.length == 1) {
		if(options.sidebar){
			text += "<br>";
			text += model.icon(winner)+" has the most votes, so...<br>";
		}
		text += "</span>";
		text += "<br>";
		text += "<b style='color:"+color+"'>"+model.nameUpper(winner)+"</b> WINS";
		// text = "<b style='color:"+color+"'>"+model.nameUpper(winner)+"</b> WINS <br> <br>" + text;
	} else {
		text += _tietext(model,winners);
		// text = "<b>TIE</b> <br> <br>" + text;
	}
	result.text = text;
	return result
};

Election.pluralityWithPrimary = function(district, model, options){

	options = _electionDefaults(options)
	var polltext = _beginElection_pluralityWithPrimary(district,model,options)
	let cans = district.stages[model.stage].candidates
	
	// Look at each voter group and get tallies for all the candidates
	let ptallies = _getBallotsAndTallyPrimary(district, model, function(tally, ballot){
		tally[ballot.vote]++;
	});
	
	// Who won each primary?
	let pwinners = []
	for (var i in ptallies) {
		let tally = ptallies[i]
		pwinners = pwinners.concat(_countWinner(tally))
	}

	// Now we vote in the general election.
	// only do 2 candidates
	model.stage = "general"
	var cans2 = cans.filter( x => pwinners.includes(x.id))
	district.stages["general"] = {candidates: cans2 }

	
	if ( ! options.justCount ) {
		// fresh polls for general election
		district.pollResults = undefined
		var generalPollText = runPoll(district,model,options,"plurality")

		model.updateDistrictBallots(district);
	}
	
	var ballots2 = model.voterSet.getBallotsDistrict(district)
	var tally = _zeroTally(cans2)
	for(var ballot of ballots2){
		tally[ballot.vote]++;
	}
	
	// return original candidates and update voters' ballots 
	model.stage = "primary" // for display purposes

	// cleanup
	// clear the old poll results. we're done with casting ballots.
	district.pollResults = undefined
	district.primaryPollResults = undefined



	var winners = _countWinner(tally);
	var result = _result(winners,model)
	var color = result.color
	if (model.doTop2) var theTop2 = _sortTally(tally).slice(0,2)
	if (model.doTop2) result.theTop2 = theTop2
	if (!options.sidebar) return result

	// Caption
	var winner = winners[0];
	var text = "";
	text += polltext
	text += "<span class='small'>";
	for (let i in ptallies) {
		var tally1 = ptallies[i]
		let totalPeopleInPrimary = district.parties[i].voterPeople.length
		var ip1 = i*1+1
		text += "<b>primary for group " + ip1 + ":</b><br>";
		var pwin = _countWinner(tally1)
		
		if (model.doTallyChart) {
			text += tallyChart(tally1,cans,model,1,totalPeopleInPrimary)
		} else {
			for(let k=0; k<cans.length; k++){
				let c = cans[k]
				let cid = c.id
				if (district.parties[i].candidates.includes(c)) {
					text += model.icon(cid)+" got "+_primaryPercentFormat(tally1[cid], totalPeopleInPrimary);
					if (pwin.includes(cid)) text += " &larr;"
					text += "<br>"
				}
			}	
		}
		text += "<br>"
	}
	text += "<b>general election:</b><br>";

	if (pwinners.length == 1) {
		text += "There was only one nominee. Win by default.<br>"
	}

	text += generalPollText

	if (model.doTallyChart) {
		text += tallyChart(tally,cans,model,1,ballots2.length)
	} else {
		for(var i=0; i<cans.length; i++){
			var c = cans[i].id;
			if (pwinners.includes(c)) text += model.icon(c)+" got "+_percentFormat(district, tally[c])+"<br>";
		}
	}
	// Caption text for winner, or tie
	if (winners.length == 1) {
		if(options.sidebar){
			text += "<br>";
			text += model.icon(winner)+" has most votes, so...<br>";
		}
		text += "</span>";
		text += "<br>";
		text += "<b style='color:"+color+"'>"+model.nameUpper(winner)+"</b> WINS";
		// text = "<b style='color:"+color+"'>"+model.nameUpper(winner)+"</b> WINS <br> <br>" + text;
	} else {
		text += _tietext(model,winners);
		// text = "<b>TIE</b> <br> <br>" + text;
	}
	result.text = text;
	return result
}

function _beginElection(district,model,options,polltype) {
	
	district.stages = {}
	model.stage = "general"
	district.stages["general"] = {candidates: district.candidates }

	var polltext = ""

	if ( ! options.justCount ) {

		if ("Auto" == model.autoPoll && ! options.dontpoll && polltype !== "nopoll") {
			district.pollResults = undefined 
			polltext += runPoll(district,model,options,polltype)
		}

		model.updateDistrictBallots(district)

	}

	return polltext
}

function _beginElection_pluralityWithPrimary(district,model,options) {

	district.stages = {}
	model.stage = "primary"
	district.stages["primary"] = {candidates: district.candidates}
	
	polltext = ""
	// Take polls and vote
	if ( ! options.justCount ) {
		district.primaryPollResults = undefined
		polltext += runPrimaryPoll(district,model,options,"plurality")
		district.pollResults = undefined
		polltext += runPoll(district,model,options,"plurality")
	
		model.updateDistrictBallots(district)
	}
	return polltext
}

function _beginElection_rbvote(district,model) {

	district.stages = {}
	model.stage = "general"
	district.stages["general"] = {candidates: district.candidates }
	model.updateDistrictBallots(district)
}

Election.plurality = function(district, model, options){

	options = _electionDefaults(options)
	var polltext = _beginElection(district,model,options,"plurality")
	let cans = district.stages[model.stage].candidates
	

	// if (model.primaries == "Yes"){
	// 	Election.pluralityWithPrimary(model, options)
	// 	return
	// }
	var result = {}
	
	// Tally the approvals & get winner!
	var ballots = model.voterSet.getBallotsDistrict(district)
	var tally = _zeroTally(cans)
	for(var ballot of ballots){
		tally[ballot.vote]++;
	}
	var winners = _countWinner(tally);
	var result = _result(winners,model)
    var color = result.color
	
	if (model.doTop2) var theTop2 = _sortTally(tally).slice(0,2)
	if (model.doTop2) result.theTop2 = theTop2
	if (!options.sidebar) {
		return result
	}


	// Caption
	var winner = winners[0];

	if(options.verbose) {
		text = "<span class='small'>";
		for(var i=0; i<cans.length; i++){
			var c = cans[i].id;
			text += model.icon(c)+": "+tally[c];
			text+=" votes";
			if(i<cans.length-1) text+=", ";
		}
		text += "</span>";
		text += "<br>";
		text += "<b style='color:"+color+"'>"+model.nameUpper(winner)+"</b> WINS";
		
		result.text = text;
		return result
	} else if (options.original) {
		text = "<span class='small'>";
		for(var i=0; i<cans.length; i++){
			var c = cans[i].id;
			text += c+": "+tally[c];
			if(i<cans.length-1) text+=", ";
		}
		text += "</span>";
		text += "<br>";
		text += "<b style='color:"+color+"'>"+model.nameUpper(winner)+"</b> WINS";
		
		result.text = text;
		return result

	}
	var text = "";
	text += "<span class='small'>";
	if ("Auto" == model.autoPoll) text += polltext;
	text += "<b>most votes wins</b><br>";
	if (model.doTallyChart) {
		text += tallyChart(tally,cans,model,1,ballots.length)
		text += "<br>";
	} else {
		for(var i=0; i<cans.length; i++){
			var c = cans[i].id;
			text += model.icon(c)+" got "+_percentFormat(district, tally[c])+"<br>";
		}
	}
	// Caption text for winner, or tie
	if (winners.length == 1) {
		if(options.sidebar){
			text += "<br>";
			text += model.icon(winner)+" has most votes, so...<br>";
		}
		text += "</span>";
		text += "<br>";
		text += "<b style='color:"+color+"'>"+model.nameUpper(winner)+"</b> WINS";
		// text = "<b style='color:"+color+"'>"+model.nameUpper(winner)+"</b> WINS <br> <br>" + text;
	} else {
		text += _tietext(model,winners);
		// text = "<b>TIE</b> <br> <br>" + text;
	}
	result.text = text;

	return result
};


// HELPERS:

function _electionDefaults(options) {
	options = options || {}
	_fillInDefaults(options, {
		justCount: false,
		dontpoll: false,
	})
	return options
}

function head2HeadTally(model,district,ballots) {

	var cans = district.stages[model.stage].candidates

	head2head = {}
	// For each combination... who's the better ranking?
	for(var i=0; i<cans.length; i++){
		var a = cans[i];
		head2head[a.id] = {}
		for(var j=0; j<cans.length; j++){
			var b = cans[j];
			// How many votes did A get?
			var aWins = 0;
			for(var m=0; m<ballots.length; m++){
				var rank = ballots[m].rank;
				if(rank.indexOf(a.id)<rank.indexOf(b.id)){
					aWins++; // a wins!
				}
			}
			head2head[a.id][b.id] = aWins
		}
	}
	return head2head
}

function runPoll(district,model,options,electiontype){

	// check to see if there is a need for polling

	if ( ! model.checkRunPoll() ) return ""

	var cans = district.stages[model.stage].candidates

	polltext = ""


	if (options.sidebar) {
		polltext += '<span class="small" >'
		if (electiontype=="irv") {
			polltext += "A low-risk strategy in IRV is to look at who wins and make a compromise if you're not winning.  Voters look down their ballot and pick the first one that defeats the current winner head to head."
			polltext += " <br> <br>"
			polltext += "Reporting results is done with both head-to-head and instant runoff tallies."
			polltext += " <br> <br>"
			polltext += "<b>Here are polls for first preferences: </b></br>"
			// this strategy could be further refined by voting for people who will be eliminated but who we like better
		} else {
			polltext += "<b>polling for viable candidates: </b><br>";
			//polltext += "<b>(score > " + (100*threshold/district.voterPeople.length).toFixed(0) + " = half max)</b><br>"
		}
	}

	var lastTally = {}
	var collectTallies = []
	for (var k=0;k<5;k++) { // do the polling many times
			
		// get polling information
		model.updateDistrictBallots(district);

		
		// count the votes in the poll
		var ballots = model.voterSet.getBallotsDistrict(district)

		if (electiontype == "score") {
			// Tally
			var tally = _zeroTally(cans)
			for(var ballot of ballots){
				for(var candidate in ballot){
					tally[candidate] += ballot[candidate];
				}
			}
		} else if (electiontype=="approval"){ 
			// Tally the approvals & get winner!
			var tally = _zeroTally(cans)
			for(var ballot of ballots){
				var approved = ballot.approved;
				for(var i=0; i<approved.length; i++) tally[approved[i]]++;
			}
		} else if (electiontype=="plurality"){
			var tally = _zeroTally(cans)
			for(var ballot of ballots){
				tally[ballot.vote]++;
			}
		} else if (electiontype=="irv"){

			// for the report, get the first preferences
			var tally = _zeroTally(cans)
			for(var ballot of ballots){
				var first = ballot.rank[0]; // just count #1
				tally[first]++;
			}

			var options2 = {dontpoll:true, sidebar:true, justCount:true}
			var result = Election.irv(district,model,options2) // do an IRV election to find out who wins
			var winners = result.winners

			if (1) {
				/// Get really good polling results.
				temp1 = district.pollResults // doing a poll without strategy.  not sure if this would work
				district.pollResults = undefined
				
				model.updateDistrictBallots(district);
				
				var ballots2 = model.voterSet.getBallotsDistrict(district)
				let head2head = head2HeadTally(model, district,ballots2)
				district.pollResults = temp1
			} else {
				let head2head = head2HeadTally(model, district,ballots)
			}
			
			var results = {head2head:head2head, firstpicks:tally, winners:winners}

		}
		
		if (electiontype == 'irv') {
			district.pollResults = results
		} else {
			district.pollResults = tally
		}

		if(options.sidebar) {
			
			
			if (model.stage == "primary") {
				let ptallies = _getBallotsAndTallyPrimary(district, model, function(tally, ballot){
					tally[ballot.vote]++;
				});
				collectTallies.push(ptallies)
			} else {
			
				if (model.doTallyChart) {
					collectTallies.push(_jcopy(tally))
				} else {
					for(var i=0; i<cans.length; i++){
						var c = cans[i].id;
						if (electiontype == "irv"){
							polltext += model.icon(c)+""+_padAfter(3,_percentFormat(district, tally[c]) + ". ") + " "
						}else {
							polltext += model.icon(c)+""+ _padAfter(3,_percentFormat(district, tally[c]/model.voterGroups[0].voterModel.maxscore) + ".") + " "
							//if (tally[c] > threshold) polltext += " &larr;"//" <--"
							//polltext += "<br>"
						}
					}
					polltext += "<br>"
				}
			}
		}
				
		// end of one poll

		// check if the results are the same as the previous poll, then quit if they are the same
		if (_isEquivalent(lastTally,tally)) {
			break
		}
		// update last tally
		lastTally = _jcopy(tally)

	}

	// not yet needed
	district.stages[model.stage].pollResults = district.pollResults

	if (options.sidebar) {
		var maxscore = model.voterGroups[0].voterModel.maxscore
		if (model.stage == "primary") {
			for (let i in collectTallies[0]) {	
				text = ""
				text += "<span class='small'>";
				var ip1 = i*1+1
				text += "<b>group " + ip1 + ":</b><br>";
				
				let totalPeopleInPrimary = district.parties[i].voterPeople.length
				text += `${collectTallies.length} rounds of polling<br>`
				if (model.doTallyChart) {
					var partyCollect = []
					for (var ptallies of collectTallies) {
						var tally1 = ptallies[i]
						partyCollect.push(tally1)
					}
					text += lineChart(partyCollect,cans,model,maxscore,totalPeopleInPrimary)
					text += "<br>"
				} else {
					for (var ptallies of collectTallies) {
						var tally1 = ptallies[i]
						var pwin = _countWinner(tally1)
						for(let k=0; k<cans.length; k++){
							let c = cans[k]
							let cid = c.id
							if (district.parties[i].candidates.includes(c)) {
								
								text += model.icon(cid)+""+ _padAfter(3,_primaryPercentFormat(tally1[cid]/model.voterGroups[0].voterModel.maxscore, totalPeopleInPrimary) + ".") + " "
							}
						}
						text += "<br>"
					}
				}
				polltext += text
			}
		} else if (model.doTallyChart) {
			polltext += `${collectTallies.length} rounds of polling<br>`
			var nballots = district.voterPeople.length
			polltext += lineChart(collectTallies,cans,model,maxscore,nballots)
		}
	}

	if (options.sidebar){
		polltext += "</span><br>"
		// model.draw() // not sure why this was here
	}

	
	if ( cans.length < 3 ) return "" // don't show poll text if the poll was not interesting

	return polltext
}


function cellText(model,opt,hh,a,b) {
	var pairText1 = pairText(model,opt,hh,a,b)
	var winnerColor1 = winnerColor(hh,a,b)
	var margin1 = margin(hh,a,b)
	if (opt.light) {
		var cellText = `<td style='background-color:${winnerColor1}; opacity: ${margin1*.5 + .5};'><div class='nameLabelName' >${pairText1}</div></td>`
	} else {
		var cellText = "<td><span class='nameLabelName' style='color:"+winnerColor1+"'>" + pairText1 + "</span></td>"
	}
	// row += '<td bgcolor="' + winnerColor + '">' + cellText + '</td>'
	return cellText
}

function winnerColor(hh,a,b) {
	let win = hh[a.id][b.id]
	let loss = hh[b.id][a.id]
	
	var winnerColor = (win == loss) ? "#ccc" : (win > loss) ? a.fill : b.fill
	return winnerColor
}


function margin(hh,a,b) {
	let win = hh[a.id][b.id]
	let loss = hh[b.id][a.id]
	
	var margin = Math.abs(win - loss) / (win + loss)
	return margin
}

function pairText(model,opt,hh,a,b) {
	let win = hh[a.id][b.id]
	let loss = hh[b.id][a.id]
	if (opt.entity == "winner") {
		let winnerTally = Math.max(win,loss)
		var frac = winnerTally / (win+loss)
	} else { // opt.entity == "row"
		// let pairText = win + '-' + loss
		// let pairText = win
		var frac = win / (win+loss)
	}
	// var pairText = Math.round(100*frac)
	var pairText = _textPercent(frac)
	return pairText
}

function strategyTable(district,model,opt) {

	let a = district.parties[0].candidates
	let b = district.parties[1].candidates
	let text = ""
	let header = `
	<table class="strategyTable">
	<tbody>
	<tr>
	<th>
	${ (opt.entity == "row") ? "+" : " " }
	</th>
	`
	for (let i = 0; i < b.length; i++) {
		header += '<th>' + model.icon(b[i].id) + '</th>'
	}
	header += '</tr>'

	text += header

	let hh = district.primaryPollResults.head2head

	for (let k = 0; k < a.length; k++) {
		let row = "<tr>"
		row += '<td>' + model.icon(a[k].id) + '</td>'
		for (let i = 0; i < b.length; i++) {
			row += cellText(model,opt,hh,a[k],b[i])
		}
		row += "</tr>"

		text += row
	}

	let footer = "</body></table>"
	
	text += footer
	
	return text
}

function pairwiseTable(hh,district,model,opt) {

	let cans = district.stages[model.stage].candidates
	

	if (opt.doSort) {
		var a = cans.map( x => x ) // copy
		a.sort( (a,b) => hh[b.id][a.id] - hh[a.id][b.id] ) // might be kinda random for cycles
	} else {
		var a = cans
	}

	let text = ""
	text += `<table class="strategyTable"><tbody>`
	
	var square = opt.triangle == undefined
	if (square) {
		let header = `
		<tr>
		<th> 
		${ (opt.entity == "row") ? "+" : " " }
		</th>
		`
		for (let i = 0; i < a.length; i++) {
			header += '<th>' + model.icon(a[i].id) + '</th>'
		}
		header += '</tr>'
	
		text += header
	}

	for (let k = 0; k < a.length; k++) {
		let row = "<tr>"
		if (square) {
			row += '<td>' + model.icon(a[k].id) + '</td>'
		}
		for (let i = 0; i < a.length; i++) {
			if (i === k) {
				if (opt.triangle) {
					row += '<td style="text-align:center;">' + model.icon(a[k].id) + ' </td>'
				} else {
					if (opt.diagonal) {
						row += `<td style='background-color:${a[k].fill}; '> </td>`
					} else {
						row += '<td> </td>'
					}
				}
			} else if (opt.triangle && i > k) {
				row += '<td> </td>' // skip
			} else {
				row += cellText(model,opt,hh,a[k],a[i])
			}
		}
		row += "</tr>"

		text += row
	}

	let footer = "</body></table>"
	
	text += footer
	
	return text
}


var runPrimaryPoll = function(district,model,options,electiontype){

	// do head to head polling to find electable candidates

	let polltext = ""
	district.primaryPollResults = {}

	let numParties = district.parties.length
	if (! model.doElectabilityPolls || numParties < 2) {
		return ""
	}

	if (options.sidebar) {
		polltext += "<span class='small'>"
		polltext += "<b>polling for electable candidates: </b><br>";
	}

	// ask voters to cast ranked ballots
	var ballots = []
	let rankedVM = new VoterModel(model,"Ranked")
	for (let voterPerson of district.voterPeople) {
		let ballot = rankedVM.castBallot(voterPerson)
		ballots.push(ballot)
	}

	// tally the ranked ballots
	let head2head = head2HeadTally(model,district,ballots)
	district.primaryPollResults.head2head = head2head

	// not yet needed
	district.stages[model.stage].primaryPollResults = district.primaryPollResults
	

	// display results
	if(options.sidebar) {
		// let opt = {entity:"row"}
		let opt = {entity:"winner",light:true}
		// let opt = {entity:"winner",doSort:true,triangle:true,light:true}
		if (opt.entity == "row") {
			polltext += "Vote % for Row Nominee<br>"
		} else { // opt.entity == "winner"
			polltext += "Vote % for Winning Nominee<br>"
		}
		
		let hh = district.primaryPollResults.head2head
		if (numParties == 2) {
			polltext += strategyTable(district,model,opt)
		} else {
			polltext += pairwiseTable(hh,district,model,opt)
		}

		polltext += "</span><br>"
	}
	
	return polltext
}

function _zeroTally(cans) {
	// Create the tally
	var tally = {};
	for (let c of cans) {
		tally[c.id] = 0
	}
	return tally
}

var _getBallotsAndTallyPrimary = function(district, model, tallyFunc){

	var primaries_tallies = []
	// look at only the candidates in the party

	var numParties = district.parties.length
	for ( var j = 0; j < numParties; j++){
		let ballots = model.voterSet.getBallotsPartyAndDistrict(j,district)
		var tally = {}
		var candidates = district.parties[j].candidates
		for (let c of candidates) {
			tally[c.id] = 0
		}
		for(let ballot of ballots){
			tallyFunc(tally, ballot)
		}
		primaries_tallies.push(tally)
	}
	return primaries_tallies
}

var _countWinner = function(tally){

	// TO DO: TIES as an array?!?! // attempted

	var highScore = -1;
	var winners = [];

	for(var candidate in tally){
		var score = tally[candidate];
		if(score>highScore) {
			winners = [];
		}
		if(score>=highScore){
			highScore = score;
			winners.push(candidate);
		}
	}

	return winners;

}

var _sortTally = function(tally){
	
	var frontrunners = [];

	for (var i in tally) {
	   frontrunners.push(i);
	}
	frontrunners.sort(function(a,b){return tally[b]-tally[a]})
	
	return frontrunners
}

var _sortTallyRev = function(tally){
	
	var frontrunners = [];

	for (var i in tally) {
	   frontrunners.push(i);
	}
	frontrunners.sort(function(a,b){return -tally[b]+tally[a]})
	
	return frontrunners
}

var _countLoser = function(tally){

	// TO DO: TIES as an array?!?!

	var lowScore = Infinity;
	var winner = null;

	for(var candidate in tally){
		var score = tally[candidate];
		if(score<lowScore) {
			winners = [];
		}
		if(score<=lowScore){
			lowScore = score;
			winners.push(candidate);
		}
	}
	return winners;
}

var _colorsWinners = function(winners,model){
	return winners.map( x => (x) ? model.candidatesById[x].fill : "" );
}

function _oneColor(colors){
	if (colors.length > 1) {
		return "#ccc"; // grey
	} else {
		return colors[0]
	}
}

function _result(winners,model) {
	result = {}
    var colors = _colorsWinners(winners,model)
    var color = _oneColor(colors)
    result.winners = winners
    result.colors = colors
    result.color = color
	return result
}


function _tietext(model,winners) {
	text = "";
	for ( var i=0; i < winners.length; i++) {
		if(i) {
			text += " and ";
		} 
		text += model.icon(winners[i]); 
	}
	text += " tie<br>";
	text += "</span>";
	text += "<br>";	
	text += "<b>TIE</b>";
	return text;
}

function _percentFormat(district,count) {
	var f = count/(district.voterPeople.length)
	return _textPercent(f)
}

function _primaryPercentFormat(count,total) {
	var f = count/total
	return _textPercent(f)
}

function _textPercent(f) {
	var a = "" + (100 * f).toFixed(0)
	var dopadding = false
	if (dopadding) {
		for (var i = a.length; i < 2; i ++) {
			a = "&nbsp;&nbsp;" + a
		}	
	}
	a += "<span class='percent'>%</span>"
	return a
}

function _padBefore(padding,a){
	for (var i = a.length; i < padding; i ++) {
		a = "&nbsp;&nbsp;" + a
	}	
	return a
}
function _padAfter(padding,a){
	for (var i = a.length; i < padding; i ++) {
		a = a + "&nbsp;&nbsp;"
	}	
	return a
}

function _drawBars(iDistrict, arena, model, round) {
	// sort the voters
	// according to x

	var v = model.getSortedVoters()
	// get only the sorted voters for this district.
	v = v.filter(x => x.iDistrict == iDistrict)
	var v2 = []
	// draw only the district's voters
	model.districtIndexOfVoter = []
	for (var i = 0; i < v.length; i++) {
		model.districtIndexOfVoter[model.district[iDistrict].voterPeople[i].iAll] = i
	}

	// There are two sorts here... one for all voters and one for the district
	// we want to use the one for all voters... and we want to get data that is based on the one for the districtq[]
	// definitions
	//   q[iAll] or q[iDistSort]
	//   district[].voterPeople[iDistSort]
	//   iAll = district[].voterPeople[iDistSort].iAll
	//   v[iTSP]
	//   iAll = orderOfVoters[iTSP]
	//   iDistSort = model.districtIndexOfVoter[iAll]


	// for votes cast, draw rectangles
	var lineHeight = 6
	var width = arena.canvas.width 
	// need to make a rectangle for displaying.
	var widthRectangle = width / v.length
	var heightRectangle = Math.min(300 / model.candidates.length, 300/10)
	
	if (0) { // do later
		for (var i = 0; i < v.length; i++) {
			var b = v[i].b
			for (var k = 0; k < b.length; k++) {
				if (b[k] == 1) {

					var left = Math.round(i * widthRectangle)
					var right = Math.round((i+1) * widthRectangle)

					var top = Math.round((k+1/2) * heightRectangle - lineHeight / 2)
					var bottom = Math.round((k+1/2) * heightRectangle + lineHeight / 2)
					
					var color = model.candidates[k].fill
					arena.ctx.fillStyle = color
					arena.ctx.fillRect(left,top,right-left,bottom-top)
					arena.ctx.fill()
				}
			}
		}
	}


	heightRectangle = 100


	
	if (model.showPowerChart) {
			
		// draw background for quota and build
		var base = 600
		var left = 0
		var right = width
		var top = base - heightRectangle
		var bottom = base
		if (0) {
			var color = "#492"
			arena.ctx.fillStyle = color
		} else {
			var g = arena.ctx.createLinearGradient(0,top,0,bottom)
			g.addColorStop(0,"#ccc")
			g.addColorStop(1,"black")
			arena.ctx.fillStyle = g
		}
		arena.ctx.fillRect(left,top,right-left,bottom-top)
		//arena.ctx.fill()
	}

	
	// calculate quota and build
	var w = model.result.winners
	var seats = model.seats//w.length // how many seats there are to fill.... just count the number of winners
	var q = []
	var build = []
	for (var i=0; i < v.length; i++) {
		q.push(1)
		build.push(0)
	}

	var baralpha = .8
	arena.ctx.globalAlpha = baralpha


	if (model.system == "STV") {
		var hacknum = 1
	} else {
		var hacknum = 0
	}
	for (var r=0; (round == -1 && r < model.result.history.rounds.length-hacknum) || (round > -1 && r < round-1); r++) {
		var thisround = model.result.history.rounds[r]
		var w = thisround.winners
		if (w.length == 0) continue
		for (var i=0; i < w.length; i++) {
			// how many people voted for each winner?
			var winnerIndex = w[i]
			if (model.system == "STV") {
				var tally = thisround.tally
				var sum = tally[model.candidates[winnerIndex].id] // TODO doublecheck
			} else {
				var sum = 0
				for (var k=0; k < v.length; k++) {
					var b = v[k].b
					var support = b[winnerIndex] / model.result.history.maxscore
					sum += support // add the vote to the candidate
				}
			}
			var rep = v.length / sum / seats

			for (var k=0; k < v.length; k++) { // subtract the winners from each voter's quota
				
				if (model.system == "STV") {
					var b = v[k].b
					for (var m = 0; m < b.length; m++) {
						var c = b[m]
						if (thisround.stillin.includes(c)) break
						// go through the list of people the voter voted for in order until we get to one that is still in the race
					}
					if (c == winnerIndex) {
						var support = thisround.q[model.districtIndexOfVoter[model.orderOfVoters[k]]]
					} else {
						var support = 0
					}
				} else { // a scoring system
					var b = v[k].b
					var support = b[winnerIndex] / model.result.history.maxscore
				}
			
				if (support > 0) {
					// draw the build

					
					if (model.showPowerChart) {
			
						var left = Math.round(k * widthRectangle)
						var right = Math.round((k+1) * widthRectangle)
						var top = Math.round(base-(build[k] + rep*support) * heightRectangle)
						var bottom = Math.round(base-build[k] * heightRectangle)
						var bucket = Math.round(base- heightRectangle) // where the shadows start

						// white background for bar
						arena.ctx.globalAlpha = 1
						arena.ctx.fillStyle = "white"
						arena.ctx.fillRect(left,top,right-left,bottom-top)
						arena.ctx.fill()
						arena.ctx.globalAlpha = baralpha

						var color = model.candidates[winnerIndex].fill
						arena.ctx.fillStyle = color

						var greyedout = .2
						if (bottom > bucket) { // bottom is in bucket
							if (top < bucket) { // top is out of bucket
								arena.ctx.fillRect(left,bucket,right-left,bottom-bucket)
								arena.ctx.fill()
								arena.ctx.globalAlpha = greyedout
								arena.ctx.fillRect(left,top,right-left,bucket-top)
								arena.ctx.fill()
							} else { // entirely in bucket
								arena.ctx.fillRect(left,top,right-left,bottom-top)
								arena.ctx.fill()
							}
						} else { // entirely out of bucket
							arena.ctx.globalAlpha = greyedout
							arena.ctx.fillRect(left,top,right-left,bottom-top)
							arena.ctx.fill()
						}
						arena.ctx.globalAlpha = baralpha
					}

					// calculate the next step
					q[k] -= rep*support
					build[k] += rep*support
				}
			}
		}
	}
			
	arena.ctx.globalAlpha = 1

	if (0){ // don't draw the weight.. for now
		if (model.system == "RRV" || model.system == "RAV") {
			var startpos = 450
			// draw the quota
			for (var i=0; i < q.length; i++) {
				var quota = Math.max(q[i],0)
				if (r==0) {
					var quota = 1
				} else {
					var quota = Math.max(model.result.history.rounds[r-1].q[model.districtIndexOfVoter[model.orderOfVoters[i]]],0)
				}
				var left = Math.round(i * widthRectangle)
				var right = Math.round((i+1) * widthRectangle)
				var top = Math.round(startpos - 1 * heightRectangle)
				var bottom = Math.round(startpos - (1-quota) * heightRectangle)
				arena.ctx.fillStyle = "#ccc"
				arena.ctx.fillRect(left,top,right-left,bottom-top)
				arena.ctx.fill()
	
			}
			// draw line at bottom
			var yLine = bottom
			var ctx = arena.ctx
			ctx.beginPath();
			ctx.moveTo(0,yLine*2);
			ctx.lineTo(ctx.canvas.width,yLine*2);
			ctx.lineWidth = 2;
			ctx.strokeStyle = "#888";
			ctx.stroke();
	
			_drawStroked("Weight",70,400,40,arena.ctx)
		}
		
	}
	
	if (model.showPowerChart) {
	
		_drawStroked("Power",10,480,40,arena.ctx,"start")

	}





	
	// draw votes for each candidate in this round
	var pos = 170
	heightRectangle = 30	
	
	heightRectangle = Math.min(200 / model.candidates.length, 200/5)
	

	if (model.system == "STV") {
		var rowFunction = "rounds"
		// var rowFunction = "candidates"

		// use order
		// use order with history
		// use calculations from before, in the voting system
		// grey out the ones that were eliminated that we voted for
		
		if (round == -1) {
			var r = model.result.history.rounds.length - 1
		} else {
			var r = round - 1
		}


		if (rowFunction == "rounds") {
			// loop through all the rounds we want to see
			for (var m = 0	; m <= r; m++) {
				var thisround = model.result.history.rounds[m]

				// who is still in the race
				var stillin = thisround.stillin

				// for each voter
				for (var i = 0; i < v.length; i++) {
					var b = v[i].b
					if (r==0) {
						var quota = 1
					} else {
						var quota = thisround.q[model.districtIndexOfVoter[model.orderOfVoters[i]]]
					}

					// find who we are voting for
					for (var k = 0; k < b.length; k++) {
						var c = b[k]
						if (stillin.includes(c)) {
							var color = model.candidates[c].fill
							break
						}
					}

					// determine where to draw
					var left = Math.round(i * widthRectangle)
					var right = Math.round((i+1) * widthRectangle)
					var middle = Math.round(pos+(m+quota*1) * heightRectangle)
					var middle2 = Math.round(pos+(m+1-quota) * heightRectangle)
					var top = Math.round(pos+(m) * heightRectangle)
					var bottom = Math.round(pos+(m+1) * heightRectangle)

					// draw candidate color
					arena.ctx.fillStyle = color
					arena.ctx.fillRect(left,top,right-left,bottom-top)
					arena.ctx.fill()
					
					// draw amount of support
					arena.ctx.fillStyle = "white"
					supportMethod = "useTransparency"
					if (supportMethod == "useTransparency") {
						arena.ctx.globalAlpha = 1-quota
						var width = right-left
						var height = bottom-top
						arena.ctx.fillRect(left,top,width,height)
					} else { // "useVertical"
						arena.ctx.globalAlpha = .7
						var topdown = true
						if (topdown) {
							arena.ctx.fillRect(left,middle,right-left,bottom-middle)
						} else {
							arena.ctx.fillRect(left,top,right-left,middle2-top)
						}
					}
									
					arena.ctx.globalAlpha = 1
				}

			}
		} else {
			var thisround = model.result.history.rounds[r]
	
			var stillin = thisround.stillin
			// who is still in the race
			for (var i = 0; i < v.length; i++) {
				var b = v[i].b
				if (r==0) {
					var quota = 1
				} else {
					var quota = thisround.q[model.districtIndexOfVoter[model.orderOfVoters[i]]]
				}
	
				for (var k = 0; k < b.length; k++) {
					var c = b[k]
					// determine where to draw
					var left = Math.round(i * widthRectangle)
					var right = Math.round((i+1) * widthRectangle)
	
					var middle = Math.round(pos+(c+quota*1) * heightRectangle)
					var middle2 = Math.round(pos+(c+1-quota) * heightRectangle)
					var top = Math.round(pos+(c) * heightRectangle)
					var bottom = Math.round(pos+(c+1) * heightRectangle)
					
					var color = model.candidates[c].fill
					if (stillin.includes(c)) {
						// draw support in color
					} else {
						// draw support in grey
						// var color = "#ccc"
						middle = top // just solid grey, no quota stuff
					}
	
					arena.ctx.fillStyle = color
					arena.ctx.fillRect(left,top,right-left,bottom-top)
					arena.ctx.fill()
					
					arena.ctx.globalAlpha = .7
					arena.ctx.fillStyle = "white"
					if (1) {
						arena.ctx.fillRect(left,middle,right-left,bottom-middle)
					} else {
						arena.ctx.fillRect(left,top,right-left,middle2-top)
					}
									
					arena.ctx.globalAlpha = 1
	
					if (stillin.includes(c)) {
						break
						// go through the list of people the voter voted for in order until we get to one that is still in the race
					}
				}
			}
	

		}


	} else {
		
		// var rowFunction = "rounds"
		var rowFunction = "candidates"

		if (rowFunction == "rounds") {
			heightRectangle /= (r+1)
			for (var m = 0	; m <= r; m++) {
						
				for (var i = 0; i < v.length; i++) {
					var b = v[i].b
					if (model.system == "QuotaApproval" || model.system == "QuotaScore") { // workaround for now
						var quota = Math.max(q[i],0)
					} else {
						if (m==0) {
							var quota = 1
						} else {
							var quota = Math.max(model.result.history.rounds[m-1].q[model.districtIndexOfVoter[model.orderOfVoters[i]]],0)
						}
					}
					
					for (var k = 0; k < b.length; k++) {
						
						var support = b[k] / model.result.history.maxscore
						if (support > 0) {
							var left = Math.round(i * widthRectangle)
							var right = Math.round((i+1) * widthRectangle)
			
							var interleaveCandidates = false
							if (interleaveCandidates) {
								var g = m * b.length + k
							} else {
								var g = m + k * (r+1)
							}
							var middle = Math.round(pos+(g+quota*support) * heightRectangle)
							var middle2 = Math.round(pos+(g+1-quota) * heightRectangle)
							var top = Math.round(pos+(g) * heightRectangle)
							var useHeight = true
							if (useHeight) { // for STV, support = 1
								var bottom = Math.round(pos+(g+support) * heightRectangle)
							} else {
								var bottom = Math.round(pos+(g+1) * heightRectangle)
							}
							
							var color = model.candidates[k].fill
							arena.ctx.fillStyle = color
							arena.ctx.fillRect(left,top,right-left,bottom-top)
							arena.ctx.fill()
							
							// draw amount of support
							arena.ctx.fillStyle = "white"
							supportMethod = "useTransparency"
							if (supportMethod == "useTransparency") {
								arena.ctx.globalAlpha = (1-quota) * support
								var width = right-left
								var height = bottom-top
								arena.ctx.fillRect(left,top,width,height)
							} else { // "useVertical"
								arena.ctx.globalAlpha = .7
								var topdown = true
								if (topdown) {
									arena.ctx.fillRect(left,middle,right-left,bottom-middle)
								} else {
									arena.ctx.fillRect(left,top,right-left,middle2-top)
								}
							}
											
							arena.ctx.globalAlpha = 1
						}
					}
				}
			}

		} else {
			for (var i = 0; i < v.length; i++) {
				var b = v[i].b
				if (model.system == "QuotaApproval" || model.system == "QuotaScore") { // workaround for now
					var quota = Math.max(q[i],0)
				} else {
					if (r==0) {
						var quota = 1
					} else {
						var quota = Math.max(model.result.history.rounds[r-1].q[model.districtIndexOfVoter[model.orderOfVoters[i]]],0)
					}
				}
				
				for (var k = 0; k < b.length; k++) {
					
					var support = b[k] / model.result.history.maxscore
					if (support > 0) {
						var left = Math.round(i * widthRectangle)
						var right = Math.round((i+1) * widthRectangle)
		
						var middle = Math.round(pos+(k+quota*support) * heightRectangle)
						var middle2 = Math.round(pos+(k+1-quota) * heightRectangle)
						var top = Math.round(pos+(k) * heightRectangle)
						var bottom = Math.round(pos+(k+support) * heightRectangle)
						
						var color = model.candidates[k].fill
						arena.ctx.fillStyle = color
						arena.ctx.fillRect(left,top,right-left,bottom-top)
						arena.ctx.fill()
						
							// draw amount of support
							arena.ctx.fillStyle = "white"
							// var supportMethod = "useTransparency"
							var supportMethod = "useVertical"
							if (supportMethod == "useTransparency") {
								arena.ctx.globalAlpha = (1-quota) * support
								var width = right-left
								var height = bottom-top
								arena.ctx.fillRect(left,top,width,height)
							} else { // "useVertical"
								arena.ctx.globalAlpha = .7
								var topdown = true
								if (topdown) {
									arena.ctx.fillRect(left,middle,right-left,bottom-middle)
								} else {
									arena.ctx.fillRect(left,top,right-left,middle2-top)
								}
							}
										
						arena.ctx.globalAlpha = 1
					}
				}
			}
		}
	
	}

	// labels
	if (rowFunction == "rounds") {
		_drawStroked("Votes by Round",10,150,40,arena.ctx,"start")
	} else {
		_drawStroked("Votes",10,150,40,arena.ctx,"start")
	}
	
}

function _percentileToX(percentile,model) {
	var v = model.getSortedVoters()
	if (v.length == 0) return 0
	var indexPercentile = (v.length-1) * percentile/100 // fine tuning TODO
	// linear interpolation
	var indexLeft = Math.floor(indexPercentile)
	var frac = indexPercentile - indexLeft
	var indexRight = indexLeft + 1
	indexRight = Math.min(indexRight,v.length-1)
	var left = v[indexLeft].x
	var right = v[indexRight].x
	var xNew = left + frac * (right - left)
	return xNew
}

function _percentileToY(percentile,model) {
	var v = model.getSortedVoters()
	if (v.length == 0) return 0
	var indexPercentile = (v.length-1) * percentile/100 // fine tuning TODO
	// linear interpolation
	var indexLeft = Math.floor(indexPercentile)
	var frac = indexPercentile - indexLeft
	var indexRight = indexLeft + 1
	indexRight = Math.min(indexRight,v.length-1)
	var left = v[indexLeft].y
	var right = v[indexRight].y
	var yNew = left + frac * (right - left)
	return yNew
}

function _xToPercentile(x,model) {
	var v = model.getSortedVoters()
	if (v.length == 0) return 0
	for (var k = 0; k < v.length; k++) {
		if (x < v[k].x) break
	}
	var iLeft = k - 1
	iLeft = Math.max(iLeft,0)
	var iRight = k
	iRight = Math.min(iRight,v.length-1)
	var left = v[iLeft].x
	var right = v[iRight].x
	if (right == left) {
		var frac = 1
	} else {
		var frac = (x - left) / (right - left)
	}
	var indexP = iLeft + frac * (iRight - iLeft)
	var percentile =  indexP / v.length * 100
	return percentile
}

_check01 = function(district,model) {
	let cans = district.stages[model.stage].candidates

	result = {good:false}
	if (cans.length === 0) {
	    result = _result([],model)
		result.text = "Nobody ran.";
	} else if (cans.length === 1) {
	    result = _result([cans[0].id],model)
		result.text = "Uncontested.";
	} else {
		result.good = true
	}
	return result
}