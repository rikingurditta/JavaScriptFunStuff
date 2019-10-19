class NFAState {
	// A class for a state in a nondeterministic finite automaton


	// create a new state, which is either accepting or non-accepting
	constructor(name, transitionDict, accepting) {
		this.name = name;
		this.transitionDict = transitionDict;
		this.accepting = accepting;
	}


	transition(symbol) {
		return transitionDict[symbol];
	}


	// return whether or not this state is accepting
	result() {
		return accepting;
	}


	addTransition(symbol, state) {
		if (symbol in this.transitionDict) {
			this.transitionDict[symbol].add(state);
		} else {
			this.transitionDict[symbol] = new Set([state]);
		}
	}
}
