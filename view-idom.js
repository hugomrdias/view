'use strict';

var _ = require('lodash');
var inherits = require('inherits');
var idom = require('incremental-dom');
var patch = idom.patch;
var open = idom.elementOpen;
var close = idom.elementClose;
var v = idom.elementVoid;
var text = idom.text;

function View(options) {
    options = options || {};
    this.root = null;
    this.options = options;

    this.count = 0;
}

module.exports = View;

View.prototype.data = function() {};

View.prototype.attributes = function() {
    return {};
}

View.prototype.setAttributes = function() {
    var attrs = _.extend({}, _.result(this, 'attributes'));
    for (var attr in attrs) {
        attr in this.root ? this.root[attr] = attrs[attr] : this.root.setAttribute(attr, attrs[attr]);
    }
}

View.prototype.template = function(data) {
    var count = this.count += 1;
    _.each(_.range(10), function(i) {
        open('div', i, ['class', 'box'], 'id', 'box-' + i);
        text(count % 100);
        close('div');
    }, this);
};

View.prototype.render = function() {
    if (this.root === null) {
        this.root = document.createElement(_.result(this, 'tagName', 'div'));
        this.setAttributes()
    }

    patch(this.root, this.template.bind(this), this.data);
}

View.prototype.attach = function(container) {
    this.render();
    container.appendChild(this.root);
}

View.prototype.remove = function() {
    if (this.root.parentNode) {
        this.root.parentNode.removeChild(this.root);
    } else {
        console.warn('Why are you removing if you didnt attach ?? ');
    }
}

View.prototype.destroy = function() {
    this.remove();
    this.root = null;
}
