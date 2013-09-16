

var ql = new QLearner(0.8);

ql.add(0,4,0);
ql.add(1,3,0);
ql.add(1,5,100);
ql.add(2,3,0);
ql.add(3,1,0);
ql.add(3,2,0);
ql.add(3,4,0);
ql.add(4,0,0);
ql.add(4,5,100);
ql.add(5,1,0);
ql.add(5,4,0);
ql.add(5,5,100);

ql.learn(500);

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

