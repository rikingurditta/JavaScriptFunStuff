var EPSILON = "ε";

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
			this.transitionDict[symbol] = new Set();
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
			this.transitionDict[symbol] = new Set([state]);
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
		let states = new Set([this.start])
		// do initial epsilon transitions get to all starting states
		states = this.doAllEpsilonTransitions(states);

		let nextStates = new Set();

		for (let i = 0; i < w.length; i += 1) {
			// transition based on current symbol
			nextStates = this.transitionStates(states, w[i]);

			// add epsilon transition for current states to nextStates
			let epsilonStates = this.transitionStates(states, EPSILON);
			nextStates = setUnion(nextStates, epsilonStates);

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
		let nextStates = new Set();
		states.forEach(function(state) {
			nextStates = setUnion(nextStates, state.transition(symbol));
		});
		return nextStates;
	}


	// do epsilon transitions until no new state is reached
	doAllEpsilonTransitions(states) {
		// return states (arg) as well as all states reached by doing all possible epsilon transitions
		// does not mutate states
		// e.g. if the NFA is qO -e-> q1 -e-> q2 and states is {q0}, return {q0, q1, q2}
		let tempStates = new Set();
		while (!setEq(tempStates, states)) {
			tempStates = states;
			let epsilonStates = this.transitionStates(states, EPSILON);
			states = setUnion(states, epsilonStates);
		}
		return states;
	}

	// return set with names of all states
	stateNames(states) {
		let names = new Set();
		states.forEach(function(state) {
			names.add(state.name);
		});
		return names;
	}
}


// check if two sets are equal, i.e. they have the same elements
function setEq(set1, set2) {
	if (set1.size != set2.size) {
		return false;
	}
	set1.forEach(function(item) {
		if (!set2.has(item)) {
			return false;
		}
	});
	set2.forEach(function(item) {
		if (!set1.has(item)) {
			return false;
		}
	});
	return true;
}


// return a new set with all the elements from both sets
function setUnion(set1, set2) {
	return new Set([...set1, ...set2]);
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
