q-learning.js
=============

Q-Learning Algorithm in JavaScript

It's based on this tutorial: [A Painless Q-Learning Tutorial](http://mnemstudio.org/path-finding-q-learning-tutorial.htm).

This belongs to a set of AI algorithms in JS to be used by [assemblino.js](https://github.com/nrox/assemblino.js).

This algorithm is suitable to search, path finding, control, as it retains in memory an heuristics to achieve the goal, from
 any reachable discrete state.

Demo
-----

[Example 1: basic](http://nrox.github.io/q-learning.js/example1.html)

[Example 2: game agent](http://nrox.github.io/q-learning.js/example2.html)

[Example 3: learning to keep distance](http://nrox.github.io/q-learning.js/example3.html)


Usage Example
=======

Learning
------

The argument to the constructor is the gamma parameter. Default 0.5

    var learner = new QLearner(0.8);


Add transitions like this:

     learner.add(fromState, toState, reward, actionName);

In this last expression, if fromState or toState do not exist they are added automatically. If no reward is know pass
*undefined*, if actionName is not important leave it undefined.

If no reward is known and actionName is not important:

    learner.add(fromState, toState);

Reward is known and actionName is not important:

    learner.add(fromState, toState, reward);

Reward is not known and actionName is important

    learner.add(fromState, toState, undefined, actionName);

States and actions set, then make it learn. The argument is the number of iterations.

    learner.learn(1000);

Running
-------

To use what the learner *knows*. Set an initial state

    learner.setState('s0');

then call to choose the best action and automatically apply it.

    learner.runOnce();

and get the next state with

    var cur = learner.getState();

or get the best action:

    var ba = learner.bestAction();

or run it until it stays in the same state, or solution.

    var current = null;
    while (current!==learner.getState()){
        current = learner.getState();
        learner.runOnce();
    }


