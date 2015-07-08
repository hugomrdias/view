'use strict';

var _  = require('lodash');
var inherits = require('inherits');
var View = require('./view.js');

/*
 *	Observe
 */
 var observer = new MutationObserver(function(mutations) {
	// For the sake of...observation...let's output the mutation to console to see how this all works
	mutations.forEach(function(mutation) {
		var removed = mutation.removedNodes;
		var added = mutation.addedNodes;

		if(removed.length > 0 ){
			console.log('Remove : ', mutation.target, removed.length, removed)
		}

		if(added.length > 0 ){
			console.log('Add : ' , mutation.target, added.length, added)
		}
		//console.log(mutation);
	});    
});
 
// Notify me of everything!
var observerConfig = {
	attributes: false, 
	childList: true, 
	characterData: false,
	subtree: true 
};
 
// Node, config
// In this case we'll listen to all changes to body and child nodes
var targetNode = document.getElementById('app');
//observer.observe(targetNode, observerConfig);

// Sub view 1
function Content() {
    View.apply(this, arguments);
}

inherits(Content, View);
Content.prototype.template = '<div>Content</div>';
//var content = new Content({id: 'content'});

// subview 2
function Content2() {
    View.apply(this, arguments);
}

inherits(Content2, View);
Content2.prototype.template = '<div>Content2</div>';
//var content2 = new Content2({id: 'content2'});

// Main View 
function Main(options){
	View.apply(this, arguments);
	this.count = 0;
	this.number = options.number;
}
inherits(Main, View);
Main.prototype.data = function() {
	var count = this.count += 1;
	return {
            top: Math.sin(count / 10) * 10,
            left: Math.cos(count / 10) * 10,
            color: (count) % 255,
            content: count % 100,
            number : this.number
        }
};
Main.prototype.template = document.getElementById('template').textContent;

// SETUP
var boxes;
var container = document.getElementById('app');
var legend = document.getElementById('timing');
var init = function() {
    boxes = _.map(_.range(100), function(i) {
        var box = new Main({number: i});
        box.attach(container);
        return box;
    });
};


var animate = function() {
    for (var i = 0, l = boxes.length; i < l; i++) {
      boxes[i].refresh();
    }
};


window.timeout = null;
window.totalTime = null;
window.loopCount = null;
var update = function() {
    var startDate = new Date();
    for (var i = 0, l = boxes.length; i < l; i++) {
       boxes[i].refresh();
    }
    var endDate = new Date();
    totalTime += endDate - startDate;
    loopCount++;
    if (loopCount % 20 === 0) {
        legend.textContent = 'Performed ' + loopCount + ' iterations in ' + totalTime + ' ms (average ' + (totalTime / loopCount).toFixed(2) + ' ms per loop).';
    }
    window.requestAnimationFrame(update);
};


init();
window.requestAnimationFrame(update);

//var view = new Main({number: 0});

//view.region(content2, '#region');
//view.attach(document.getElementById('app'));
//view.region(content, '#region');

/*setTimeout(function() {
    view.refresh();
}, 1000)*/

//var region = document.getElementById('region');

//region.removeChild(region.firstChild);