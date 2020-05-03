

describe("q-learner.js", () => {

    it("Action", () => {
      let action = new Action("next", 1.2, "action")
      expect(action.actionName).toBe('action')
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
        let maxCount = 10000
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
})
      
  
  