
function GameBoard(){
    this.canvasId = "canvas";
    this.scoreId = "score";

    this.canvasWidth = 300;
    this.canvasHeight = 300;
    this.width = 10; //cells
    this.height = 10; //cells
    this.board = [];
    this.empty = 0;
    this.agent = 1;
    this.foodPoisonRatio = 0.5;
    this.density = 0.1;
    this.food = 2;
    this.poison = 3;

    this.score = {};
    this.score[this.food] = 1;
    this.score[this.poison] = 1;
    this.score[this.empty] = 1;

    this.userAction = undefined;
    this.exploration = 0.2;
    this.canvasContext = undefined;

    this.colorDictionary = {};
    this.colorDictionary[this.food] = 'green';
    this.colorDictionary[this.empty] = 'white';
    this.colorDictionary[this.poison] = 'gray';
    this.colorDictionary[this.agent] = 'black';

    this.rewardDictionary = {};
    this.rewardDictionary[this.food] = 1;
    this.rewardDictionary[this.empty] = 0;
    this.rewardDictionary[this.poison] = -1;
    this.agentPosition = {
        line: this.height-1,
        column: ~~(this.width/2)
    };
    this.init();
}

GameBoard.prototype.init = function(){
    this.board = []; //the representation of the world
    for (var column = 0; column < this.width; column++){
        this.board.push([]);
        for (var line = 0; line < this.height; line++){
            this.board[column].push(this.empty);
        }
    }
    var canvas = document.getElementById(this.canvasId);
    this.canvasContext = canvas.getContext('2d');
};

GameBoard.prototype.setPosition = function(column){
    //set agents position
    column = (column + this.width) % this.width; //circular world
    this.agentPosition.column = column;
    this.board[column][this.agentPosition.line] = this.agent;
};

GameBoard.prototype.addMoreObjects = function(){
    //insert more food and poison
    for (var column = 0; column < this.width; column++){
        if (Math.random()<this.density){
            this.board[column][0] = Math.random() < this.foodPoisonRatio ? this.food : this.poison;
        } else {
            this.board[column][0] = this.empty;
        }
    }
    this.setPosition(this.agentPosition.column);
};

GameBoard.prototype.moveObjectsDown = function(){
    //advance objects position 1 cell down
    for (var line = this.height - 1; line > 0; line--){
        for (var column = 0; column < this.width; column++){
            this.board[column][line] = this.board[column][line-1];
        }
    }
};

GameBoard.prototype.currentState = function(){
    //get a string representation of the objects in the 3x3 square in front of the agent
    var state = "S";
    var line, column;
    for (var dcol = -1; dcol <= 1 ; dcol++){
        for (var dline = -3; dline < 0 ; dline++){
            line = (this.agentPosition.line + dline + this.height) % this.height;
            column = (this.agentPosition.column + dcol + this.width) % this.width;
            state += this.board[column][line];
        }
    }
    return state;
};

GameBoard.prototype.objectAt = function(column, line){
    return this.board[column][line];
};

GameBoard.prototype.randomAction = function(){
    //actions are -1,0,+1
    return ~~(Math.random() * 3) - 1;
};

GameBoard.prototype.draw = function(){
    var dx = this.canvasWidth/this.width;
    var dy = this.canvasHeight/this.height;
    var radius = Math.min(dx, dy)/2.5;
    var pi2 = Math.PI * 2;
    var context = this.canvasContext;
    context.clearRect ( 0 , 0 , this.canvasWidth , this.canvasHeight);

    for (var line = 0; line < this.height; line++){
        for (var column = 0; column < this.width; column++){
            if (this.board[column][line]===this.empty) continue;
            context.beginPath();
            context.arc(dx * (column + 0.5), dy * (line + 0.5), this.board[column][line]!==this.agent ? radius : radius*1.2, 0, pi2, false);
            context.fillStyle = this.colorDictionary[this.board[column][line]];
            context.fill();
            context.lineWidth = 2;
            context.strokeStyle = '#333333';
            context.stroke();
        }
    }
};

var game = new GameBoard();

var learner = new QLearner();

var sid = setInterval(step, 500);

function slow(){
    clearInterval(sid);
    sid = setInterval(step, 500);
}

function fast(){
    clearInterval(sid);
    sid = setInterval(step, 20);
}

function step(){
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







