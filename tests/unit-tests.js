

describe("q-learner.js", () => {

    it ("random", ()=>{
        for (let i = 0; i < 100; i++){
            let number = generateRandom()
            expect(number >=0).toBe(true)
            expect(number < 1).toBe(true)
        }
    })

    it("Action", () => {
      let action = new Action("next", 1.2, "action")
      expect(action.name).toBe('action')
      expect(action.reward).toBe(1.2)
      expect(action.nextState).toBe("next")
    })

    it("State", () => {
        let state = new State("s")
        expect(state.name).toBe('s')
        expect(state.randomAction()).toBe(undefined, "When no action exist, randomAction() should return undefined")
        let a1 = state.addAction("next", 1.4, "a1")
        expect(state.randomAction()).toBe(a1, "When only one action exists, randomAction() should return that action.")
        let a2 = state.addAction("some", 1.0, "a2")
        let countA1 = 0
        let countA2 = 0
        let maxCount = 1000
        for (let i = 0; i < maxCount; i++){
            switch(state.randomAction()){
                case a1: countA1++; break;
                case a2: countA2++; break;
                default: fail("Random action should return one of existent actions.")
            }
        }
        expect(countA1 + countA2).toBe(maxCount)
        expect(countA1 > 0).toBe(true, `There is 1/${maxCount} chances of randomAction() not returning 1 of 2 actions and this test fail.`)
        expect(countA2 > 0).toBe(true, `There is 1/${maxCount} chances of randomAction() not returning 1 of 2 actions and this test fail.`)
    })

    it("QLearner.add action", () => {
        let learner = new QLearner
        let a1 = learner.add("s0","s1",1.0,"a1")
        expect(a1.name).toBe("a1")
        expect(a1.reward).toBe(1.0)
        expect(a1.nextState).toBe("s1")
    })

    it("QLearner.{addState, randomState)", () => {
        let learner = new QLearner
        expect(learner.randomState()).toBe(undefined)
        let s0 = learner.addState("s0")
        expect(learner.randomState()).toBe(s0)
    })

    it("QLearner.{setState, getState}", () => {
        let learner = new QLearner
        let s0 = learner.setState("s0")
        expect(s0 instanceof State).toBe(true)
        let s = learner.getState()
        expect(s).toBe(s0.name)
    })

    it("QLearner.optimalFutureValue", () => {
        let learner = new QLearner
        learner.add("from","to1", 1.0, "a1")
        learner.add("from","to2", -1.0, "a2")
        learner.add("from","to3", 2.0, "a3")
        let value = learner.optimalFutureValue("from")
        expect(value).toBe(2.0)
    })

    it("QLearner.runOnce", () => {
        let learner = new QLearner
        learner.setState("some")
        expect(learner.runOnce()).toBe(undefined)
        learner.add("from","to", 1.0, "a")
        learner.setState("from")
        let to = learner.runOnce();
        expect(to).not.toBe(undefined)
        expect(to.name).toBe("to")
    })

    it("QLearner.bestAction", () => {
        let learner = new QLearner
        learner.add("s0", "s1", 1.0, "a1")
        learner.add("s0", "s2", -1.0, "a2")
        learner.add("s0", "s3", 2.0, "a3")
        expect(learner.bestAction("s0")).toBe("a3")
    })

    it("QLearner.step", () => {
        let learner = new QLearner
        learner.add("s0", "s1", 0.0, "a1")
        learner.add("s1", "s2", 1.0, "a2")
        learner.setState("s0")
        let s = learner.step()
        expect(s.name).toBe("s1")
        expect(learner.currentState).toBe(s)
    })

    it("...", () => {
        expect(true).toBe(true)
    })

})
      
  
  