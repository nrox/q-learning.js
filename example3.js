function GameBoard() {
    this.canvasId = "canvas";
    this.scoreId = "score";

    this.canvasWidth = 300;
    this.canvasHeight = 300;
    this.width = 15; //cells
    this.height = 15; //cells
    this.board = [];

    this.empty = 0;
    this.intruder = 1;
    this.citizen = 2;
    this.stay =3;

    this.density = 0.3;

    this.score = {};
    this.score[this.citizen] = 1;
    this.score[this.empty] = 1;

    this.userAction = undefined;
    this.exploration = 0.2;
    this.canvasContext = undefined;

    this.colorDictionary = {};
    this.colorDictionary[this.citizen] = 'green';
    this.colorDictionary[this.empty] = 'white';
    this.colorDictionary[this.intruder] = 'red';

    this.rewardDictionary = {};
    //collide with intruder
    this.rewardDictionary[this.intruder] = -100;
    //move to empty space
    this.rewardDictionary[this.empty] = -1;
    //stay in the same position
    this.rewardDictionary[this.stay] = 0;

    this.intruderPosition = {
        line: this.height - 1,
        column: ~~(this.width / 2)
    };

    this.timeStep = 0;

    this.init();
}


GameBoard.prototype.init = function () {
    this.board = []; //the representation of the world
    for (var column = 0; column < this.width; column++) {
        this.board.push([]);
        for (var line = 0; line < this.height; line++) {
            this.board[column].push(this.empty);
        }
    }
    var canvas = document.getElementById(this.canvasId);
    this.canvasContext = canvas.getContext('2d');
};

GameBoard.prototype.setPosition = function (column) {
    //set agents position
    column = (column + this.width) % this.width; //circular world
    this.intruderPosition.column = column;
    this.board[column][this.intruderPosition.line] = this.agent;
};


GameBoard.prototype.addGreens = function () {
    //insert more food and poison
    for (var line = 0; line < this.height; line++) {
        for (var column = 0; column < this.width; column++) {
            this.board[column][line] = (Math.random() < this.density) ? this.food : this.empty;
        }
    }
    this.setPosition(this.intruderPosition.column);
};

GameBoard.prototype.moveObjectsDown = function () {
    //advance objects position 1 cell down
    for (var line = this.height - 1; line > 0; line--) {
        for (var column = 0; column < this.width; column++) {
            this.board[column][line] = this.board[column][line - 1];
        }
    }
};

GameBoard.prototype.currentState = function () {
    //get a string representation of the objects in the 3x3 square in front of the agent
    var state = "S";
    var line, column;
    for (var dcol = -1; dcol <= 1; dcol++) {
        for (var dline = -3; dline < 0; dline++) {
            line = (this.intruderPosition.line + dline + this.height) % this.height;
            column = (this.intruderPosition.column + dcol + this.width) % this.width;
            state += this.board[column][line];
        }
    }
    return state;
};

GameBoard.prototype.objectAt = function (column, line) {
    return this.board[column][line];
};

GameBoard.prototype.randomAction = function () {
    //actions are -1,0,+1
    return ~~(Math.random() * 3) - 1;
};

GameBoard.prototype.draw = function () {
    var dx = this.canvasWidth / this.width;
    var dy = this.canvasHeight / this.height;
    var radius = Math.min(dx, dy) / 2.5;
    var pi2 = Math.PI * 2;
    var context = this.canvasContext;
    context.clearRect(0, 0, this.canvasWidth, this.canvasHeight);

    for (var line = 0; line < this.height; line++) {
        for (var column = 0; column < this.width; column++) {
            if (this.board[column][line] === this.empty) continue;
            context.beginPath();
            context.arc(dx * (column + 0.5), dy * (line + 0.5), this.board[column][line] !== this.agent ? radius : radius * 1.2, 0, pi2, false);
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

function slow() {
    clearInterval(sid);
    sid = setInterval(step, 500);
}

function fast() {
    clearInterval(sid);
    sid = setInterval(step, 20);
}

function step() {
    //memorize current state

    var currentState = game.currentState();
    //get some action
    var randomAction = game.randomAction();
    //and the best action
    var action = learner.bestAction(currentState);
    //if there is no best action try to explore
    if (action === null || action === undefined || (!learner.knowsAction(currentState, randomAction) && Math.random() < game.exploration)) {
        action = randomAction;
    }
    //action is a number -1,0,+1
    action = Number(action);
    //apply the action
    game.setPosition(game.intruderPosition.column + action);
    //get next state, compute reward
    game.moveObjectsDown();
    var collidedWith = game.objectAt(game.intruderPosition.column, game.intruderPosition.line);
    var reward = game.rewardDictionary[collidedWith];

    var nextState = game.currentState();
    learner.add(currentState, nextState, reward, action);

    //make que q-learning algorithm number of iterations=10 or it could be another number
    learner.learn(10);

    game.addGreens();

    //some feedback on performance
    game.score[collidedWith]++;

    updateSummary();

    game.draw();
}

function updateSummary() {
    var summary = "<br />green==food: " + game.score[game.food];
    summary += "<br />gray=poison: " + game.score[game.poison];
    summary += "<br />poison/food: " + Math.round(100 * game.score[game.poison] / game.score[game.food]) + "%";
    document.getElementById(game.scoreId).innerHTML = summary;
}






