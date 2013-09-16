function State(name){
    this.name = name;
    this.actions = {};
    this.actionsList = [];
}

State.prototype.addAction = function (nextState, reward, actionName){
    var action =  {
        name: actionName===undefined ? nextState : actionName,
        nextState: nextState,
        reward: reward
    };
    this.actionsList.push(action);
    this.actions[action.name] = action;
};

State.prototype.randomAction = function(){
     return this.actionsList[~~(this.actionsList.length * Math.random())];
};

function QLearner(gamma){
    this.gamma = gamma || 0.8;
    this.rewards = {};
    this.states = {};
    this.statesList = [];
    this.currentState = null;
}

QLearner.prototype.add = function (from, to, reward, actionName){
    if (!this.states[from]) this.addState(from);
    if (!this.states[to]) this.addState(to);
    this.states[from].addAction(to, reward, actionName);
};

QLearner.prototype.addState = function (name){
    var state = new State(name);
    this.states[name] = state;
    this.statesList.push(state);
    return state;
};

QLearner.prototype.setState = function (name){
    this.currentState = this.states[name];
    return this.currentState;
};

QLearner.prototype.getState = function (){
    return this.currentState && this.currentState.name;
};

QLearner.prototype.randomState = function(){
    return this.statesList[~~(this.statesList.length * Math.random())];
};

QLearner.prototype.optimalFutureValue = function(state){
    var stateRewards = this.rewards[state];
    var max = 0;
    for (var action in stateRewards){
        if (stateRewards.hasOwnProperty(action)){
            max = Math.max(max, stateRewards[action] || 0);
        }
    }
    return max;
};

QLearner.prototype.step = function (){
    this.currentState || (this.currentState = this.randomState());
    var action = this.currentState.randomAction();
    if (!action) return null;
    this.rewards[this.currentState.name] || (this.rewards[this.currentState.name] = {});
    this.rewards[this.currentState.name][action.name] = (action.reward || 0) + this.gamma * this.optimalFutureValue(action.nextState);
    return this.currentState = this.states[action.nextState];
};

QLearner.prototype.learn = function(steps){
    steps = Math.max(1, steps || 0);
    while (steps--){
        this.currentState = this.randomState();
        this.step();
    }
};

QLearner.prototype.bestAction = function(state){
    var stateRewards = this.rewards[state] || {};
    var bestAction = null;
    for (var action in stateRewards){
        if (stateRewards.hasOwnProperty(action)){
            if (!bestAction){
                bestAction = action;
            } else if ((stateRewards[action] == stateRewards[bestAction]) && (Math.random()>0.5)){
                bestAction = action;
            } else if (stateRewards[action] > stateRewards[bestAction]){
                bestAction = action;
            }
        }
    }
    return bestAction;
};

QLearner.prototype.knowsAction = function(state, action){
    return (this.rewards[state] || {}).hasOwnProperty(action);
};

QLearner.prototype.applyAction = function(actionName){
    var actionObject = this.states[this.currentState.name].actions[actionName];
    if (actionObject){
        this.currentState = this.states[actionObject.nextState];
    }
    return actionObject && this.currentState;
};

QLearner.prototype.runOnce = function(){
    var best = this.bestAction(this.currentState.name);
    var action = this.states[this.currentState.name].actions[best];
    if (action){
        this.currentState = this.states[action.nextState];
    }
    return action && this.currentState;
};