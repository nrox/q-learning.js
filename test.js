

var ql = new QLearner(0.8);

var s;

s = ql.addState(0);
s.addAction(4);

s = ql.addState(1);
s.addAction(3);
s.addAction(5, 100);

s = ql.addState(2);
s.addAction(3);

s = ql.addState(3);
s.addAction(1);
s.addAction(2);
s.addAction(4);

s = ql.addState(4);
s.addAction(0);
s.addAction(3);
s.addAction(5, 100);

s = ql.addState(5);
s.addAction(1);
s.addAction(4);
s.addAction(5, 100);

ql.learn(100);

setInterval(function(){
    var cur = ql.currentState;
    var st = ql.runOnce();
    if (cur==st) return;
    setStateDiv(st.name);
}, 1500);

function setStateDiv(state){
    $('.state').css('background-color', 'white');
    $('[state="' + state + '"]').css('background-color', 'orange');
}

function addStateDiv(state){
    var $state = $('<div />',{
        state: state,
        'class': 'state'
    });
    $state.on('click', function(){
        ql.setState(state);
        setStateDiv(state);
    });
    $state.text(state);
    $('body').append($state);
}

for (var i = 0; i <= 5; i++){
    addStateDiv(i);
}

