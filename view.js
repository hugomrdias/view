'use strict';

var _ = require('lodash');
var inherits = require('inherits');
var parser = new DOMParser();

function View(options) {
    options = options || {};

    this.regions = [];
    this.root = null;
    this.container = null;
    this.count = 1;

    this.force = true;

    if (_.has(options, 'force') && options.force === false) {
        this.force = false;
    }

    this.render();
}

module.exports = View;

View.prototype.template = '<div id="region">REGION</div><div><%=test1%></div><div><%=count %></div>';

View.prototype.data = function() {
    this.count += 1;
    return {
        test1: 'guga',
        count: this.count
    };
}

View.prototype.render = function() {
    var el = document.createElement('div');
    this.compiled = _.template(this.template);
    el.innerHTML = this.compiled(this.data());
    this.root = el;

    _.each(this.regions, function(region) {
        region.instance.attach(this.root.querySelector(region.selector));
    }, this);
}

View.prototype.refresh = function() {
    var doc = parser.parseFromString(this.compiled(this.data()), 'text/html');
    this.root.innerHTML = '';

    _.each(this.regions, function(region) {
         region.instance.attach(doc.body.querySelector(region.selector));
     }, this);

    while (doc.body.firstChild) {
        this.root.appendChild(doc.body.firstChild)
    };
}

View.prototype.attach = function(container) {
    // if (this.container) {
    // console.error('already attached to container: check below');
    // console.info(this.container)
    // } else {
    //
    this.container = container;
    if (this.force) {
        container.innerHTML = '';
    }

    container.appendChild(this.root);

    // }
}

View.prototype.remove = function() {
    if (this.container) {
        this.container.removeChild(this.root);
    } else {
        console.warn('Why are you removing if you didnt attach ?? ');
    }
}

View.prototype.destroy = function() {
    this.remove();
    this.root = null;
    this.container = null;
    console.log('DESTROY');
}

View.prototype.region = function(view, selector) {
    var node = this.root.querySelector(selector);
    var force = view.force;
    if (node) {
        var region = _.find(this.regions, {selector: selector});
        if (region && force) {
            var index = this.regions.indexOf(region);
            region.instance.destroy();
            if (index > -1) {
                this.regions[index] = {
                    selector: selector,
                    instance: view
                };
            }
        } else {
            this.regions.push({
                selector: selector,
                instance: view
            });
        }

        view.attach(node);
    } else {
        console.warn('couldn find node in this view')
    }
}
