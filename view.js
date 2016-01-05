'use strict';

var _ = require('lodash');
var t = document.createElement('template');
var templateSupport = 'content' in t;
var delegateEventSplitter = /^(\S+)\s*(.*)$/;
var parser = new DOMParser();
var noop = function () {
};

// Caches a local reference to `Element.prototype` for faster access.
var ElementProto = (typeof Element !== 'undefined' && Element.prototype) || {};

// Find the right `Element#matches` for IE>=9 and modern browsers.
var matchesSelector = ElementProto.matches ||
    ElementProto.webkitMatchesSelector ||
    ElementProto.mozMatchesSelector ||
    ElementProto.msMatchesSelector ||
    ElementProto.oMatchesSelector ||

        // Make our own `Element#matches` for IE8
    function (selector) {
        // Use querySelectorAll to find all elements matching the selector,
        // then check if the given element is included in that list.
        // Executing the query on the parentNode reduces the resulting nodeList,
        // (document doesn't have a parentNode).
        var nodeList = (this.parentNode || document).querySelectorAll(selector) || [];
        return ~indexOf(nodeList, this);
    };

// utils
function strToFrag(strHTML) {
    if (templateSupport) {
        t = document.createElement('template');
        t.innerHTML = strHTML;
        return t.content;
    } else {
        var documentFragment = document.createDocumentFragment();
        var doc = parser.parseFromString(strHTML, 'text/xml');
        documentFragment.appendChild(doc.documentElement);
        return documentFragment;
    }
}

function addView(view, selector) {
    var index = _.findIndex(this.views, function (subview) {
        return subview.instance === view;
    });

    if (index > -1) {
        return;
    } else {
        this.views.push({
            selector: selector,
            instance: view
        });
    }
}

function View(options) {
    options = options || {};
    this.cid = _.uniqueId('view_');
    this.options = options;
    this.regions = [];
    this.views = [];
    this.root = null;
    this.raf = null;
    this.compiled = this.template;
}

module.exports = View;

View.prototype.data = noop;

View.prototype.template = noop;

View.prototype.attributes = noop;

View.prototype.addViews = noop;

View.prototype.beforeRender = null;

View.prototype.afterRender = null;

View.prototype.setAttributes = function () {
    var attrs = _.extend({}, _.result(this, 'attributes'));
    for (var attr in attrs) {
        attr in this.root ? this.root[attr] = attrs[attr] : this.root.setAttribute(attr, attrs[attr]);
    }
}

View.prototype.render = function (force) {
    window.cancelAnimationFrame(this.raf);
    // reset all sub views
    //this.cleanViews();
    //console.debug('Render ' + this.cid, this.views);
    if (this.root === null) {
        //console.log(this.cid, 'render with root');
        this.root = document.createElement(_.result(this, 'tagName', 'div'));
        this.setAttributes();
        this.delegateEvents();
        this.addViews.call(this, addView.bind(this));
    }

    this.root.innerHTML = '';
    if (force && this.root !== null) {
        this.cleanViews();
        this.addViews.call(this, addView.bind(this));
    }

    var frag = strToFrag(this.compiled(_.result(this, 'data', {})));
    this.views.forEach(function (view) {
        var node = frag.querySelector(view.selector);
        if (node) {
            view.instance.attach(node);
        } else {
            //debugger;
            console.warn(this.cid + ' - no node found for view selector: ' + view.selector);
        }
    }.bind(this));

    this.regions.forEach(function (region) {
        var node = frag.querySelector(region.selector);
        if (node) {
            region.node = node;
            region.instance.attach(node, true);
        }
    }.bind(this));

    if(this.beforeRender){
        this.beforeRender(frag)
    }

    this.root.appendChild(frag);

    if(this.afterRender){
        this.raf = window.requestAnimationFrame(this.afterRender.bind(this));
    }
    return this;
}

View.prototype.attach = function (container, force) {
    if (!this.root) {
        this.render()
    }

    if (force) {
        container.innerHTML = '';
    }

    container.appendChild(this.root);
    return this;
}

View.prototype.remove = function () {
    if (this.root && this.root.parentNode) {
        this.root.parentNode.removeChild(this.root);
    } else {
        console.warn(this.cid + ' - Why are you removing if you didnt attach ?? ');
    }
}

View.prototype.destroy = function () {
    console.warn(this.cid + ' - DESTROY ', this.template)
    window.cancelAnimationFrame(this.raf);
    this.remove();
    this.cleanViews();
    this.root = null;
}

View.prototype.region = function (view, selector) {
    var node;
    var children;

    if (this.root) {
        node = this.root.querySelector(selector);
        if (node) {
            var region = _.find(this.regions, {node: node});

            if (region) {
                // bail out if its the same instance
                if (region.instance === view) {
                    return;
                }

                // swap the region for this node
                var index = this.regions.indexOf(region);
                region.instance.destroy();
                if (index > -1) {
                    this.regions[index] = {
                        selector: selector,
                        instance: view,
                        node    : node
                    };
                }
            } else {
                // add region for this node
                this.regions.push({
                    selector: selector,
                    instance: view,
                    node    : node
                });
            }

            // attach region view to the node
            view.attach(node, true);
        } else {
            console.warn('couldn find node in this view with select : ' + selector)
        }
    } else {
        var regionIndex = _.findIndex(this.regions, function (region) {
            return region.instance === view;
        });
        var selectorIndex = _.findIndex(this.regions, function (region) {
            return region.selector === selector;
        });

        // same instance ignore
        if (regionIndex > -1) {
            return;
        } else {
            // same selector swap
            if (selectorIndex > -1) {
                this.regions[selectorIndex].instance.destroy();
                this.regions[selectorIndex] = {
                    selector: selector,
                    instance: view,
                    node    : null
                }
            } else {
                // The view isnt rendered yet so just add the region without attaching
                this.regions.push({
                    selector: selector,
                    instance: view,
                    node    : null
                });
            }
        }
    }
}

View.prototype.cleanViews = function () {
    this.views.forEach(function (view) {
        view.instance.destroy();
    });
    this.views = [];
}

View.prototype.delegateEvents = function () {
    var events = _.result(this, 'events', {});

    for (var key in events) {
        var method = events[key];
        if (!_.isFunction(method)) method = this[method];
        if (!method) continue;
        var match = key.match(delegateEventSplitter);
        this.delegate(match[1], match[2], method.bind(this));
    }

    return this;
};

View.prototype.delegate = function (eventName, selector, listener) {
    if (typeof selector === 'function') {
        listener = selector;
        selector = null;
    }
    var root = this.root;
    var handler = selector ? function (e) {
        var node = e.target || e.srcElement;
        for (; node && node != root; node = node.parentNode) {
            if (matchesSelector.call(node, selector)) {
                e.delegateTarget = node;
                listener(e);
            }
        }
    } : listener;

    this.root.addEventListener(eventName, handler, false);
}
