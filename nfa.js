var EPSILON = "ε";


class NSet extends Set {
	// check if two sets are equal, i.e. they have the same elements
	equals(set2) {
		if (this.size != set2.size) {
			return false;
		}
		this.forEach(function(item) {
			if (!set2.has(item)) {
				return false;
			}
		});
		let set1 = this;
		set2.forEach(function(item) {
			if (!set1.has(item)) {
				return false;
			}
		});
		return true;
	}


	// return a new set with all the elements from both sets
	union(set2) {
		return new NSet([...this, ...set2]);
	}


	// mutate this set to add all elements of set2
	addAll(set2) {
		let set1 = this;
		set2.forEach((item) => this.add(item));
	}
}


class NFAState {
	// A class for a state in a nondeterministic finite automaton


	// create a new state, which is either accepting or non-accepting
	constructor(name, transitionDict, accepting) {
		this.name = name;
		this.transitionDict = transitionDict;
		this.accepting = accepting;
	}


	// return the states that are reached by transitioning based on symbol
	transition(symbol) {
		if (!(symbol in this.transitionDict)) {
			this.transitionDict[symbol] = new NSet();
		}
		return this.transitionDict[symbol];
	}


	// return whether or not this state is accepting
	result() {
		return this.accepting;
	}


	// add a transition rule for this state
	addTransition(symbol, state) {
		if (symbol in this.transitionDict) {
			this.transitionDict[symbol].add(state);
		} else {
			this.transitionDict[symbol] = new NSet([state]);
		}
	}
}


class NFA {
	// a class for a nondeterministic finite automaton


	// create a new NFA, whose starting state is start
	constructor(start) {
		this.start = start;
	}


	// check if an accept state is reached by this NFA after transitioning based on w
	checkString(w) {
		// return whether or not w is accepted
		let states = new NSet([this.start])
		// do initial epsilon transitions get to all starting states
		states = this.doAllEpsilonTransitions(states);

		let nextStates = new NSet();

		for (let i = 0; i < w.length; i += 1) {
			// transition based on current symbol
			nextStates = this.transitionStates(states, w[i]);

			// add epsilon transition for current states to nextStates
			nextStates.addAll(this.transitionStates(states, EPSILON));

			// do all possible epsilon transitions
			nextStates = this.doAllEpsilonTransitions(nextStates);

			states = nextStates;
		}
		// console.log(this.stateNames(states));

		// if any state is an accepting state, then the NFA accepts the string
		let accepting = false;
		states.forEach(function(state) {
			if (state.result()) {
				accepting = true;
			}
		});
		return accepting;
	}

	// transition all states in given set based on given symbol
	transitionStates(states, symbol) {
		// return set of states reached
		let nextStates = new NSet();
		states.forEach(function(state) {
			nextStates.addAll(state.transition(symbol));
		});
		return nextStates;
	}


	// do epsilon transitions until no new state is reached
	doAllEpsilonTransitions(states) {
		// return states (arg) as well as all states reached by doing all possible epsilon transitions
		// does not mutate states
		// e.g. if the NFA is qO -e-> q1 -e-> q2 and states is {q0}, return {q0, q1, q2}
		let tempStates = new NSet();
		while (!tempStates.equals(states)) {
			tempStates = states;
			states = states.union(this.transitionStates(states, EPSILON));
		}
		return states;
	}

	// return set with names of all states
	stateNames(states) {
		let names = new NSet();
		states.forEach(
			(state) => names.add(state.name));
		return names;
	}
}



// example NFA, which accepts /1*(0011*|011*)*/
// var q0 = new NFAState("q0", {}, true);
// var q1 = new NFAState("q1", {}, false);
// var q2 = new NFAState("q2", {}, false);
// q0.addTransition("0", q1);
// q0.addTransition("1", q0);
// q0.addTransition(EPSILON, q1);
// q1.addTransition("0", q2);
// q1.addTransition("1", q1);
// q2.addTransition("1", q0);
// let nfa = new NFA(q0);

// console.log(nfa.checkString("1") + " should be true");
// console.log(nfa.checkString("1001111111011") + " should be true");
// console.log(nfa.checkString("101101110010011001") + " should be true");
// console.log(nfa.checkString("100100") + " should be false");
// console.log(nfa.checkString("100100011") + " should be false");
