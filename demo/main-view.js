'use strict';

var inherits = require('inherits');
var _ = require('lodash');
var View = require('./../view.js');

function Main(options) {
    View.apply(this, arguments);
    this.cid = 'main';
    this.tagName = 'span';
    this.attributes = {
        id   : 'main',
        class: 'main'
    }

    //this.events = {
    //    //'click .main'        : 'handleRegion',
    //    'click .region': function (e) {
    //        console.log(this.template, e);
    //    }
    //}
}

inherits(Main, View);
exports.Main = Main;

Main.prototype.template = _.template('<div><%= name %></div><div id="region" class="region"></div>');

Main.prototype.data = function () {
    return {
        name: 'guga'
    }
}

Main.prototype.addViews = function (add) {
    //var view = new Content();
    _.each(_.range(100), function (index) {

        add(new Content({
            data: {n: index}
        }), '.region');
    });
}

Main.prototype.events = function () {
    return {
        //'click .main'        : 'handleRegion',
        'click .region': function (e) {
            console.log(this.template, e);
        }
    }
}

//Main.prototype.beforeRender = function (frag) {
//    console.log('before', this.cid, frag.querySelector('.region').getBoundingClientRect());
//}
//
//Main.prototype.afterRender = function () {
//    console.log('after', this.cid, this.root.querySelector('.region').getBoundingClientRect());
//}

// subview 1
function Content(options) {
    View.apply(this, arguments);
    this.data = options.data;
    this.cid = 'content';
}

inherits(Content, View);
exports.Content = Content;
Content.prototype.template = _.template('<div><%=n %></div>');
//Content.prototype.beforeRender = function (frag) {
//    console.log('before', this.cid, frag.firstChild.getBoundingClientRect());
//}
//
//Content.prototype.afterRender = function () {
//    console.log('after', this.cid, this.root.firstChild.getBoundingClientRect());
//
//    var nested = this.root.firstChild.getBoundingClientRect().width;
//    var parent = this.root.parentNode.getBoundingClientRect().width;
//    if(nested !== parent){
//        console.error('ERRROOOOOOOrr')
//    }
//}

// subview 2
function Content2() {
    this.count = 0;
    this.events = {
        'click #click': 'handle'
    }
    this.tagName = 'span';
    this.attributes = {
        id   : 'Content2',
        class: 'Content2'
    }
    View.apply(this, arguments);
}

inherits(Content2, View);
exports.Content2 = Content2;

Content2.prototype.template = _.template('<div id="click"><%= name %></div>');

Content2.prototype.data = function () {
    this.count += 1;
    return {
        name: this.count
    }
}

Content2.prototype.handle = function (e) {
    console.log(this.template, e);
}
