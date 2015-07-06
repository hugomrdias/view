'use strict';

var _  = require('lodash');
var inherits = require('inherits');
var View = require('./view.js');

function Content() {
    View.apply(this, arguments);
}

inherits(Content, View);
Content.prototype.template = '<div>Content</div>';
var content = new Content({force:true});

function Content2() {
    View.apply(this, arguments);
}

inherits(Content2, View);
Content2.prototype.template = '<div>Content2</div>';
var content2 = new Content2({force:false});

var view = new View();

view.region(content, '#region');
view.region(content2, '#region');
view.attach(document.getElementById('app'));

// view.region(content, '#region');

setInterval(function() {
    view.refresh();
}, 1000)

// setTimeout(function(){
//     view.remove();
// }, 4000);

