

class Agent {
    static heroType = 1
    static emptyType = 0
    static foodType = 2
    static poisonType = 3

    constructor(row, column){
        this.row = row
        this.col = column
        this.lastCol = this.col
        this.lastRow = this.row
        this.color = 'black'
        this.type = this.heroType
        this.reward = 0
    }
    setPosition(row, col){
        this.lastCol = this.col
        this.lastRow = this.row
        this.row = row
        this.col = col
    }
    setColumn(col){
        this.lastCol = this.col
        this.col = col
    }
    setRow(row){
        this.lastRow = this.row
        this.row = row
    }
    randomAction(){
        let rand = Math.random()
        if (rand<0.33) return -1
        if (rand<0.67) return 0
        return 1
    }
}

class Food extends Agent {
    constructor(row, column){
        super(row, column)
        this.color = 'green'
        this.type = Agent.foodType
        this.reward = 1
    }
}

class Poison extends Food {
    constructor(row, column){
        super(row, column)
        this.color = 'gray'
        this.type = Agent.poisonType
        this.reward = -1
    }
}

class Empty extends Agent {
    constructor(row, column){
        super(row, column)
        this.color = 'white'
        this.type = Agent.emptyType
        this.reward = 0
    }
}

class Board {
    constructor(numRows, numColumns, density, foodPoisonRatio){
        this.numRows = numRows || 10;
        this.numColumns = numColumns || 10
        this.board = []
        this.foodPoisonRatio = foodPoisonRatio === undefined ? 0.5 : foodPoisonRatio
        this.density = density === undefined ? 0.67 : density
        this.exploration = 0.1
        this.visionRange = 1
    }

    /**
     * Populate the board with empty cells and initialize the game hero
     */
    init(){
        for (let r = 0; r < this.numRows; r++){
            let row = []
            for (let c = 0; c < this.numColumns; c++){
                row.push(new Empty(r, c))
            }
            this.board.push(row)
        }
        this.hero = new Agent(this.numRows-1, ~~(this.numColumns/2))
    }

    getAgent(row, col){
        return this.board[row][col]
    }

    /**
     * set an agent's position, updating the board as well
     */
    setPosition(agent, row, col){
        agent.setPosition(row, col)
        this.board[row][col] = agent
    }

    /**
     * increase the agent's row, and update the board
     */
    moveDown(agent){
        this.setPosition(agent, agent.row + 1, agent.col)
    }

    /**
     * Add more food and poison, replacing objects in first row
     */
    addMoreFood(){
        for (var col = 0; col < this.numColumns; col++){
            let agentType
            if (Math.random()<=this.density){
                agentType = Math.random() < this.foodPoisonRatio ? Food : Poison
            } else {
                agentType = Empty
            }
            let agent = new agentType(0, col)
            this.setPosition(agent, 0, col)
        }
    }
    moveFoodDown(){
        for (let row = this.numRows - 1; row > 0; row--){
            for (let col = 0; col < this.numColumns; col++){
                let agent = this.board[row-1][col]
                this.setPosition(agent, row, col)
            }
        }
    }

    /**
     * get a string representation of the objects in the width=3 x height=visionRange in front of the agent
     */
    getState(){
        let state = "S";
        const heroRow = this.hero.row
        const heroCol = this.hero.col
        const numRows = this.numRows
        const numCols = this.numColumns
        for (var dCol = -1; dCol <= 1 ; dCol++){
            for (var dRow = -this.visionRange; dRow <= -1 ; dRow++){
                let row = (heroRow + dRow + numRows) % numRows
                let col = (heroCol + dCol + numCols) % numCols
                state += this.getAgent(row, col).type
            }
        }
        return state;
    }

}

class CanvasPainter {
    constructor(board){
        this.board = board
        this.canvasId = "canvas"
        this.scoreId = "score"
        this.canvasWidth = 300
        this.canvasHeight = 300
        this.userAction = undefined
        this.canvasContext = undefined
        this.dx = this.canvasWidth/this.board.numColumns;
        this.dy = this.canvasHeight/this.board.numRows;
        this.radius = Math.round(Math.min(this.dx, this.dy)/2.5);
        this.pi2 = Math.PI * 2;
        this.fps = 60
    }
    init(){
        var canvas = document.getElementById(this.canvasId)
        this.canvasContext = canvas.getContext('2d')
    }
    markForDrawing(agent){
        agent._row = agent.row
        agent._col = agent.col
        agent._lastRow = agent.lastRow
        agent._lastCol = agent.lastCol
    }
    markAllForDrawing(){
        let board = this.board
        for (var row = 0; row < board.numRows; row++){
            for (var col = 0; col < board.numColumns; col++){
                let agent = board.getAgent(row, col)
                if (agent instanceof Empty) continue;
                this.markForDrawing(agent)
            }
        }
        this.markForDrawing(board.hero)
    }
    drawAgent(agent, progress){
        if (progress===undefined) progress = 1.0
        let ctx = this.canvasContext

        //circular world
        let _lastCol = agent._lastCol 
        if (agent._col == 0 && agent._lastCol == (this.board.numColumns-1)){
            _lastCol = -1
        } else if (agent._col == (this.board.numColumns-1) && agent._lastCol ==0){
            _lastCol = this.board.numColumns
        }

        //new objects
        let _lastRow = agent._lastRow 
        if (agent._row == 0 && agent._lastRow == 0){
            _lastRow = -1
        } 

        let col = agent._col * progress + _lastCol * (1-progress)
        let row = agent._row * progress + _lastRow * (1-progress)
        ctx.beginPath();
        const x = Math.round(this.dx * (col + 0.5))
        const y = Math.round(this.dy * (row + 0.5))
        ctx.arc(x, y, this.radius, 0, this.pi2, false);
        ctx.fillStyle = agent.color;
        ctx.fill();
        ctx.lineWidth = 2;
        ctx.strokeStyle = '#333333';
        ctx.stroke();
    }
    /**
     * @param {long} duration transition time ms
     */
    draw(duration){
        const startTime = new Date().getTime()
        const ctx = this.canvasContext
        const self = this
        const board = this.board
        const dt = Math.round(1000.0/this.fps)
        this.markAllForDrawing()

        drawProgress()

        function drawProgress(){
            const elapsed =  new Date().getTime()-startTime
            let progress = Math.min(1, elapsed/duration)
            ctx.clearRect( 0 , 0 , self.canvasWidth , self.canvasHeight);
            for (var row = 0; row < board.numRows; row++){
                for (var col = 0; col < board.numColumns; col++){
                    let agent = board.getAgent(row, col)
                    if (agent instanceof Empty) continue;
                    self.drawAgent(agent, progress)
                }
            }
            self.drawAgent(board.hero, progress)
            if (progress < 1){
                setTimeout(drawProgress, dt)
            }
        }
    }
}

class Score {

    constructor(){
        this.table = {}
        this.total = 0
        this.elementId = "score"
    }
    update(agent){
        if (agent instanceof Empty) return
        if (this.table[agent.type]===undefined) this.table[agent.type] = 0 
        this.table[agent.type]++
        this.total++
    }
    show(){
        const food = this.table[Agent.foodType] || 0
        const poison = this.table[Agent.poisonType] || 0
        let summary = "<br />green==food : " + food
        summary +=    "<br />gray==poison: " + poison
        summary +=    "<br />poison/total: " + Math.round(100*poison/(this.total||1)) + "%";
        document.getElementById(this.elementId).innerHTML = summary
    }
}

class Controller {
    constructor(){
        this.exploration = 0.01
        let board = new Board
        board.init()
        this.board = board
        this.painter = new CanvasPainter(board)
        this.painter.init()
        this.learner = new QLearner(0.1, 0.9)
        this.score = new Score
    }

    draw(duration){
        this.painter.draw(duration)
    }
    step(){
        
        const board = this.board
        const learner = this.learner
        const hero = board.hero

        //memorize current state
        const currentState = board.getState()

        //and the best action
        let action = learner.bestAction(currentState);

        //if there is no best action try to explore
        if ((action==undefined) || (learner.getQValue(currentState, action) <= 0) || (Math.random()<this.exploration)) {
            action = hero.randomAction()
        }

        //action is a number -1,0,+1
        action = Number(action)

        //apply the action
        board.setPosition(hero, hero.row, (hero.col + action + board.numColumns) % board.numColumns);
        
        //get next state, compute reward
        board.moveFoodDown();

        const collidedWith = board.getAgent(hero.row, hero.col)
        const reward = collidedWith.reward;

        const nextState = board.getState();
        learner.add(currentState, nextState, reward, action);

        //make que q-learning algorithm number of iterations=10 or it could be another number
        learner.learn(100);

        board.addMoreFood()
        board.currentState = nextState

        this.score.update(collidedWith)
        this.score.show()
       
    }
}
