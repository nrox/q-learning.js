

class Agent {
    constructor(row, column){
        this.row = row
        this.col = column
        this.lastCol = this.col
        this.lastRow = this.row
        this.color = 'black'
        this.type = 1
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
        this.type = 2
        this.reward = 1
    }
}

class Poison extends Food {
    constructor(row, column){
        super(row, column)
        this.color = 'yellow'
        this.type = 3
        this.reward = -1
    }
}

class Empty extends Agent {
    constructor(row, column){
        super(row, column)
        this.color = 'white'
        this.type = 0
        this.reward = 0
    }
}

class Score {
    constructor(){
        this.score = {};
    }
    update(agent){
        if (this.score[agent.type]===undefined) this.score[agent.type] = 0 
        this.score[agent.type]++
    }
}

class Board {
    constructor(numRows, numColumns, density, foodPoisonRatio){
        this.numRows = numRows || 10;
        this.numColumns = numColumns || 10
        this.board = []
        this.foodPoisonRatio = foodPoisonRatio === undefined ? 0.5 : foodPoisonRatio
        this.density = density === undefined ? 0.2 : density
        this.exploration = 0.2
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
     * get a string representation of the objects in the 3x3 square in front of the agent
     */
    getState(){
        let state = "S";
        for (var dCol = -1; dCol <= 1 ; dCol++){
            for (var dRow = -2; dRow < 0 ; dRow++){
                let row = (this.hero.row + dRow + this.numRows) % this.numRows
                let col = (this.hero.col + dCol + this.numColumns) % this.numColumns
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
        this.radius = Math.min(this.dx, this.dy)/2.5;
        this.pi2 = Math.PI * 2;
        this.fps = 60
    }
    init(){
        var canvas = document.getElementById(this.canvasId)
        this.canvasContext = canvas.getContext('2d')
    }
    drawAgent(agent, progress){
        if (progress===undefined) progress = 1.0
        let ctx = this.canvasContext
        let col = agent._col * progress + agent._lastCol * (1-progress)
        let row = agent._row * progress + agent._lastRow * (1-progress)
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
    /**
     * 
     * @param {*} duration transition time
     */
    draw(duration){
        const ctx = this.canvasContext
        const self = this
        const board = this.board
        let progress = 0
        const frames = this.fps * duration/1000.0
        const dt = Math.round(1000.0/this.fps)
        let frameCount = 0.0
        
        this.markAllForDrawing()
        drawProgress()

        function drawProgress(){
            progress = frameCount/frames
            ctx.clearRect ( 0 , 0 , self.canvasWidth , self.canvasHeight);
            for (var row = 0; row < board.numRows; row++){
                for (var col = 0; col < board.numColumns; col++){
                    let agent = board.getAgent(row, col)
                    if (agent instanceof Empty) continue;
                    self.drawAgent(agent, progress)
                }
            }
            self.drawAgent(board.hero, progress)
            if (frameCount++<frames){
                setTimeout(drawProgress, dt)
            }
        }
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

        //avoid going over borders
        if ((hero.col + action) < 0) {
            action = Math.max(0, action)
        }
        if ((hero.col + action) >= board.numColumns) {
            action = Math.min(0, action)
        }

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

        /*
        //some feedback on performance
        game.score[collidedWith]++;
        var summary = "<br />green==food: " + game.score[game.food];
        summary += "<br />gray=poison: " + game.score[game.poison];
        summary += "<br />poison/food: " + Math.round(100*game.score[game.poison]/game.score[game.food]) + "%";
        document.getElementById(game.scoreId).innerHTML = summary;
        game.draw();
        */
    }
}
