"use strict";

class Action {
    constructor(nextState, reward, actionName){
        this.nextState = nextState;
        this.reward = reward;
        this.actionName = actionName;
    }
}
class State {
    constructor(name){
        this.name = name
        this.actions = {}
        this.actionsList = []
    }
    addAction(nextState, reward, actionName){
        let action = new Action(nextState, reward, actionName)
        this.actions[actionName] = action
        this.actionsList.push(action)
        return action
    }
    randomAction = () => {
        let index = Math.floor(this.actionsList.length * Math.random())
        return this.actionsList[index]
    }

}