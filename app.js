'use strict';

var _ = require('lodash');
var inherits = require('inherits');
var View = require('./view.js');
var IDomView = require('./view-idom.js');
var Views = require('./demo/main-view.js');

/*
 *  Observe
 */
var observer = new MutationObserver(function (mutations) {
    // For the sake of...observation...let's output the mutation to console to see how this all works
    mutations.forEach(function (mutation) {
        var removed = mutation.removedNodes;
        var added = mutation.addedNodes;

        if (removed.length > 0) {
            console.log('Remove : ', mutation.target, removed.length, removed)
        }

        if (added.length > 0) {
            console.log('Add : ', mutation.target, added.length, added)
        }

        //console.log(mutation);
    });
});

// Notify me of everything!
var observerConfig = {
    attributes   : false,
    childList    : true,
    characterData: false,
    subtree      : true
};

// Node, config
// In this case we'll listen to all changes to body and child nodes
var targetNode = document.getElementById('app');

//observer.observe(targetNode, observerConfig);

// // SETUP
// var boxes;
// var container = document.getElementById('app');
// var legend = document.getElementById('timing');
// var init = function() {
//     boxes = _.map(_.range(1), function(i) {
//         var box = new IDomView();
//         box.attach(container);
//         return box;
//     });
// };

// var animate = function() {
//     for (var i = 0, l = boxes.length; i < l; i++) {
//         boxes[i].render();
//     }
// };

// window.timeout = null;
// window.totalTime = null;
// window.loopCount = null;
// var update = function() {
//     var startDate = new Date();
//     animate()
//     var endDate = new Date();
//     totalTime += endDate - startDate;
//     loopCount++;
//     if (loopCount % 20 === 0) {
//         legend.textContent = 'Performed ' + loopCount + ' iterations in ' + totalTime + ' ms (average ' + (totalTime / loopCount).toFixed(2) + ' ms per loop).';
//     }

//     window.requestAnimationFrame(update);
// };

// init();
// window.requestAnimationFrame(update);

//var view = new Views.Main();
//var content = new Views.Content();
//var content2 = new Views.Content2();

//view.view(content, '.region');
//view.region(content2, '.region');
//view.attach(document.getElementById('app'));
// view.region(content, '#region');
// view.region(content2, '.region');
//view.render(true)
//view.render(true)
//view.render(true)
//console.log(view.regions)
//

var db = require('./demo/dbmonster/db.js');
var view = new db();
//view.attach(document.getElementById('app'))

function update() {
    view.render()
    window.requestAnimationFrame(update);
    //setTimeout(function () {
    //   update()
    //},0)
}
//update();

var tpl = require('idom-template');
var idom = require('incremental-dom');

tpl.registerHelper('my-console', function (attrs) {
    console.log(attrs);
});
var render = tpl.compile(document.getElementById('i-template').innerHTML, idom);
console.log(render);
var data = {
    content: 'guga'
};


idom.patch(document.getElementById('app'), function () {
    render(data)
});
// setTimeout(function() {
//     //content2.render();
//     //view.render();
// }, 2000)

// setTimeout(function() {
// }, 2000)
