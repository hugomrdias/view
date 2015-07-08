'use strict';

var _ = require('lodash');
var inherits = require('inherits');
var fastdom = require('fastdom');

var t = document.createElement('template');
var templateSupport = 'content' in t;

// utils
function strToFrag(strHTML){
    if( templateSupport ){
        var temp=document.createElement('template');
        temp.innerHTML=strHTML;
        return temp.content;
    }

    var parser = new DOMParser(),
    doc = parser.parseFromString(strHTML, "text/xml"),
    documentFragment = document.createDocumentFragment() ;
    documentFragment.appendChild( doc.documentElement );
    return documentFragment;
}

function View(options) {
    options = options || {};
    
    this.regions = [];
    this.root = null;
    this.count = 1;
    this.id = options.id || 'test';

    this.compiled = _.template(this.template);
    this.render();
}

module.exports = View;

View.prototype.data = function(){};

View.prototype.render = function() {
    //console.time('render')
    var el = document.createElement('div');
    el.id = this.id;
    el.className = 'box-view';
    el.appendChild(strToFrag(this.compiled(this.data())))
    this.root = el;
    //console.timeEnd('render')
}

View.prototype.refresh = function() {
    //console.time('refresh')
    /*var frag = strToFrag(this.compiled(this.data()));

    this.regions.forEach(function(region) {
        var node = frag.querySelector(region.selector);
        var children = node.childNodes;
        if (children.length === 0) {
            node.innerHTML = '';
        }
        region.instance.attach(node);
    }.bind(this));

    this.root.innerHTML = '';
    this.root.appendChild(frag);*/
    //console.timeEnd('refresh');
    this.root.innerHTML = this.compiled(this.data());
}

View.prototype.attach = function(container) {
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

View.prototype.region = function(view, selector) {
    var node = this.root.querySelector(selector);
    var children = node.childNodes;

    if (node) {
        var region = _.find(this.regions, {node: node});
        if (region) {
            var index = this.regions.indexOf(region);
            region.instance.destroy();
            if (index > -1) {
                this.regions[index] = {
                    selector: selector,
                    instance: view,
                    node: node
                };
            }
        } else {
            if (children.length === 0) {
                node.innerHTML = '';
            }
            this.regions.push({
                selector: selector,
                instance: view,
                node: node
            });
        }

        view.attach(node);
    } else {
        console.warn('couldn find node in this view')
    }
}
