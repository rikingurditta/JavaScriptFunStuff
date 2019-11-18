var EPSILON = "ε";

// abstract class for parsed regular expressions
class Regex {
	// get the NFA which accepts the strings matched by this regex
	getNFA() {
		throw new Error('Not implemented!');
	}
}


// parsed regular expression for a single symbol
class RESymbol extends Regex {
	// create a new symbol regex
	constructor(symbol) {
		super();
		if (symbol.length != 1) {
			throw Error("Not a symbol!");
		}
		this.symbol = symbol;
	}

	// get the NFA which accepts this regex's symbol 
	getNFA() {
		let reject = new NFAState(this.symbol + "0", {}, false);
		let accept = new NFAState(this.symbol + "1", {}, true);
		reject.addTransition(this.symbol, accept);
		let states = new NSet([reject, accept])
		return new NFA(reject, states);
	}
}


// parsed regular expression 
class RESequence extends Regex {
	// create a new sequence of regexes
	constructor(reList) {
		super();
		this.subs = reList;
	}

	// get the NFA which accepts this sequence of regexes
	getNFA() {
		if (this.subs.length == 0) {
			let s = new NFAState("empty sequence", {}, true);
			return new NFA(s, new NSet([s]));
		}
		// concatenate all NFAs in order to make NFA which accepts sequence
		let start = this.subs[0].getNFA();
		for (let i = 1; i < this.subs.length; i += 1) {
			start.append(this.subs[i].getNFA());
		}
		return start;
	}
}
