"use strict";

const generateRandom = new Math.seedrandom()

class Action {
    constructor(nextState, reward, name){
        this.nextState = nextState;
        this.reward = reward;
        this.name = name;
    }
}

class State {
    constructor(name){
        this.name = name
        this.actions = {}
        this.actionsList = []
    }
    addAction(nextState, reward, name){
        let action = new Action(nextState, reward, name)
        this.actions[name] = action
        this.actionsList.push(action)
        return action
    }
    randomAction = () => {
        let index = Math.floor(this.actionsList.length * generateRandom())
        return this.actionsList[index]
    }
}

class QLearner {

    /**
     * 
     * @param {number} gamma The discount factor 
     * @param {number} alpha The learning rate 
     */
    constructor(gamma, alpha){
        this.gamma = gamma || 0.8
        this.alpha = alpha || 0.8
        this.qValuesTable = {}
        this.states = {}
        this.statesList = []
        this.currentState = null
    }

    /**
     * Add an action from (state) to (state), with a predefined reward.
     */
    add(from, to, reward, actionName){
        if (!this.states[from]) this.addState(from)
        if (!this.states[to]) this.addState(to)
        this.setReward(from, actionName, reward)
        return this.states[from].addAction(to, reward, actionName)
    }
    addState(name){
        let state = new State(name);
        this.states[name] = state;
        this.statesList.push(state);
        return state;
    }
    setState(name){
        this.currentState = this.states[name] || new State(name)
        return this.currentState
    }
    getState(){
        return this.currentState && this.currentState.name
    }
    randomState(){
        let index = Math.floor(this.statesList.length * generateRandom())
        return this.statesList[index]
    }

    /**
     * The maximum reward achievable from the state, by looking at the rewards table.
     */
    optimalFutureValue(state){
        let qValues = this.qValuesTable[state]
        let max = 0
        for (let action in qValues){
            if (qValues.hasOwnProperty(action)){
                max = Math.max(max, qValues[action] || 0)
            }
        }
        return max;
    }

    /**
     * If there are defined rewards for the action, from the state.
     */
    knowsAction(state, action){
        return (this.qValuesTable[state] || {}).hasOwnProperty(action)
    }

    /**
     * From current state, apply the action (name), and set the action's next state as current state.
     */
    applyAction(name){
        let actionObject = this.states[this.currentState.name].actions[name];
        if (actionObject){
            this.currentState = this.states[actionObject.nextState];
        }
        return actionObject && this.currentState;
    }

    /**
     * Get the best action from the state (name), which is the one with immediate best reward.
     * During the selection process, if states have the same reward, choose one with probability 50%.
     */
    bestAction(state){
        let qValues = this.qValuesTable[state] || {}
        let bestAction = null;
        for (let action in qValues){
            if (qValues.hasOwnProperty(action)){
                if (!bestAction){
                    bestAction = action
                } else if ((qValues[action] == qValues[bestAction]) && (generateRandom()>0.5)){
                    bestAction = action
                } else if (qValues[action] > qValues[bestAction]){
                    bestAction = action
                }
            }
        }
        return bestAction
    }

    /**
     * From current state, choose the best action and apply it, 
     * doing a transition for the next state and setting this as currentState
     */
    runOnce(){
        let bestActionName = this.bestAction(this.currentState.name);
        if (!bestActionName) return undefined
        let action = this.states[this.currentState.name].actions[bestActionName];
        if (action){
            this.currentState = this.states[action.nextState];
        }
        return action && this.currentState;
    }

    /**
     * Set a reward (Q-Value) for performing the action from a state
     */
    setReward(stateName, actionName, reward){
        if(!this.qValuesTable[stateName]) this.qValuesTable[stateName] = {}
        this.qValuesTable[stateName][actionName] = reward
    }

    /**
     * Do a single learning step from current state.
     */
    step(){
        //set current state randomly if not defined
        if(!this.currentState) this.currentState = this.randomState()
        if (!this.currentState) return null;        
        let state = this.currentState

        //get some action from current state
        let action = state.randomAction();
        if (!action) return null;

        //rewards is a map {state#: {action#: reward, ...}, ...}
        let reward = (action.reward || 0) + this.gamma * this.optimalFutureValue(action.nextState)
        this.setReward(state.name,action.name, reward)
        this.currentState = this.states[action.nextState]
        return this.currentState
    }

    /**
     * From the current state, apply the learning process #steps
     */
    learn(steps){
        steps = Math.max(1, steps || 0)
        while (steps--){
            this.currentState = this.randomState()
            this.step()
        }
    }
}