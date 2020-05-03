

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
        this.density = density === undefined ? 0.1 : density
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
    currentState(){
        let state = "S";
        for (var dCol = -1; dCol <= 1 ; dCol++){
            for (var dRow = -3; dRow < 0 ; dRow++){
                let row = (this.hero.row + dRow + this.numRows) % this.numRows;
                let col = (this.hero.col + dCol + this.numColumns) % this.numColumns;
                state += this.getAgent(row, col).type;
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
    }
    init(){
        var canvas = document.getElementById(this.canvasId)
        this.canvasContext = canvas.getContext('2d')
    }
    drawAgent(agent){
        let ctx = this.canvasContext
        ctx.beginPath();
        ctx.arc(this.dx * (agent.col + 0.5), this.dy * (agent.row + 0.5), this.radius, 0, this.pi2, false);
        ctx.fillStyle = agent.color;
        ctx.fill();
        ctx.lineWidth = 2;
        ctx.strokeStyle = '#333333';
        ctx.stroke();
    }
    draw(fps, duration){
        var context = this.canvasContext;
        context.clearRect ( 0 , 0 , this.canvasWidth , this.canvasHeight);
    
        for (var row = 0; row < this.board.numRows; row++){
            for (var col = 0; col < this.board.numColumns; col++){
                let agent = this.board.getAgent(row, col)
                console.log(agent)
                if (agent instanceof Empty) continue;
                this.drawAgent(agent)
            }
        }
    }

}


var game = new Board();

var learner = new QLearner(0.2, 0.5);

var sid = setInterval(step, 500);

function slow(){
    clearInterval(sid);
    sid = setInterval(step, 500);
}

function fast(){
    clearInterval(sid);
    sid = setInterval(step, 20);
}

function init(){

}

function step(){

}

function stepBack(){
    //memorize current state

    var currentState = game.currentState();
    //get some action
    var randomAction = game.randomAction();
    //and the best action
    var action = learner.bestAction(currentState);
    //if there is no best action try to explore
    if (action===null || action === undefined || (!learner.knowsAction(currentState, randomAction) && Math.random()<game.exploration)){
        action = randomAction;
    }
    //action is a number -1,0,+1
    action = Number(action);
    //apply the action
    game.setPosition(game.agentPosition.column + action);
    //get next state, compute reward
    game.moveObjectsDown();
    var collidedWith = game.objectAt(game.agentPosition.column, game.agentPosition.line);
    var reward = game.rewardDictionary[collidedWith];

    var nextState = game.currentState();
    learner.add(currentState, nextState, reward, action);

    //make que q-learning algorithm number of iterations=10 or it could be another number
    learner.learn(10);

    game.addMoreObjects();

    //some feedback on performance
    game.score[collidedWith]++;
    var summary = "<br />green==food: " + game.score[game.food];
    summary += "<br />gray=poison: " + game.score[game.poison];
    summary += "<br />poison/food: " + Math.round(100*game.score[game.poison]/game.score[game.food]) + "%";
    document.getElementById(game.scoreId).innerHTML = summary;
    game.draw();
}







