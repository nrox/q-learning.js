function GameBoard() {
    this.ballRadius = 10;
    this.dx = 5;
    this.dy = -5;
    this.paddleHeight = 10;
    this.paddleWidth = 75;
    this.init();
    this.point = 0;
}

GameBoard.prototype.init = function () {
    var canvas = document.getElementById("myCanvas");
    this.ctx = canvas.getContext("2d");
    this.x = canvas.width / 2;
    this.y = canvas.height - 30;
    this.canvasWidth = canvas.width
    this.canvasHeight = canvas.height
    this.paddleX = Math.round((canvas.width - this.paddleWidth) / 2) - (Math.round((canvas.width - this.paddleWidth) / 2) % 100);
}


GameBoard.prototype.setPaddleX = function (x) {
    if (this.paddleX + x * 50 >= 0 && this.paddleX + x * 50 < this.canvasWidth - this.paddleWidth)
        this.paddleX = this.paddleX + x * 50;
}

GameBoard.prototype.drawBall = function (x, y) {
    this.ctx.beginPath();
    this.ctx.arc(x, y, this.ballRadius, 0, Math.PI * 2);
    this.ctx.fillStyle = "#0095DD";
    this.ctx.fill();
    this.ctx.closePath();
}

GameBoard.prototype.drawPaddle = function () {
    this.ctx.beginPath();
    this.ctx.rect(this.paddleX, this.canvasHeight - this.paddleHeight, this.paddleWidth, this.paddleHeight);
    this.ctx.fillStyle = "#0095DD";
    this.ctx.fill();
    this.ctx.closePath();
}

GameBoard.prototype.currentState = function () {
    var state = "S";
    state += Math.round(this.paddleX) + '' + this.x + '' + this.y + '' + this.dx + '' + this.dy;
    return state;
}
GameBoard.prototype.randomAction = function () {
    return ~~(Math.random() * 3) - 1;;
};

GameBoard.prototype.draw = function () {
    var context = this.ctx;
    this.point = 0.9 - (Math.abs(this.x - (this.paddleX + this.paddleWidth / 2))) / 1000;
    context.clearRect(0, 0, this.canvasWidth, this.canvasHeight);
    this.drawBall(this.x, this.y);
    this.drawPaddle();
    if (this.x + this.dx > this.canvasWidth - this.ballRadius || this.x + this.dx < this.ballRadius) {
        this.dx = -this.dx;
    }
    if (this.y + this.dy < this.ballRadius) {
        this.dy = -this.dy;
    }
    else if (this.y + this.dy > this.canvasHeight - this.ballRadius) {
        if (this.x > this.paddleX && this.x < this.paddleX + this.paddleWidth) {
            this.dy = -this.dy;
            this.point = Math.abs(this.x - this.paddleX);
        }
        else {
            this.point = -(Math.abs(this.x - this.paddleX));
            this.x = this.canvasWidth / 2;
            this.y = this.canvasHeight - 30;
            this.dx = 5;
            this.dy = -5;
            this.paddleX = Math.round((this.canvasWidth - this.paddleWidth) / 2) - (Math.round((this.canvasWidth - this.paddleWidth) / 2) % 100);
        }
    }

    this.x += this.dx;
    this.y += this.dy;
}

var game = new GameBoard();
var learner = new QLearner();

var sid = setInterval(step, 10);
var Fail = 0;
var success = 0;
var taps = 0;
var lastplot = 0
var maxtaps = 0;
var padding = 20;
var retrievedObject = localStorage.getItem('learner');


var canvas = document.getElementById("curve");
var ctx = canvas.getContext("2d");
ctx.beginPath();
ctx.moveTo(padding, 0);
ctx.lineTo(padding, canvas.height);
ctx.stroke();
ctx.moveTo(0, canvas.height - padding);
ctx.lineTo(canvas.width, canvas.height - padding);
ctx.stroke();

function save() {
    localStorage.setItem('learner', JSON.stringify(learner));
}
function retrieve() {
    learner = localStorage.getItem('learner');
}
function step() {
    var currentState = game.currentState();
    var action = learner.bestAction(currentState);
    var randomAction = game.randomAction();
    if (action === null || action === undefined || (!learner.knowsAction(currentState, randomAction))) {
        action = randomAction;
    }
    game.setPaddleX(action);
    game.draw()
    if (game.point >= 1) {
        success += 1;
        taps++;
    }
    else if (game.point < 0) {
        Fail += 1;
        taps = 0;
        console.log(currentState + '  action  ' + learner.bestAction(currentState) + '  Fail ' + game.point + ' Point')
    }

    if (taps > maxtaps) {
        maxtaps = taps;
    }
    var nextState = game.currentState();
    learner.add(currentState, nextState, game.point, action);
    learner.learn(100);
    graph(success, Fail);
    var summary = "<br />Success: " + success;
    summary += "<br />Fail: " + Fail;
    summary += "<br>Success Rate: " + Math.round(100 * success / (success + Fail)) + "%";
    summary += "<br />Continuous Points: " + taps;
    summary += "<br />Maximum Continuous Points: " + maxtaps;
    document.getElementById('score').innerHTML = summary;
}
function graph(success, Fail) {

    var ctx = canvas.getContext("2d");
    var x = success + Fail;
    var plot = canvas.height - Math.round(100 * success / x) * ((canvas.height + padding) / 100)
    if (x > canvas.width) {
        x = x - canvas.width;
    }
    if (lastplot < plot) {
        ctx.fillStyle = "#F44336";
        ctx.fillRect(x + padding, plot, 1, 1);
        ctx.fill();
        ctx.closePath();
    }
    else {
        ctx.fillStyle = "#8BC34A";
        ctx.fillRect(x + padding, plot, 1, 1);
        ctx.fill();
        ctx.closePath();
    }
    lastplot = plot;
}

function slow() {
    clearInterval(sid);
    sid = setInterval(step, 50);
}

function fast() {
    clearInterval(sid);
    sid = setInterval(step, 1);
}