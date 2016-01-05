'use strict';

var inherits = require('inherits');
var _ = require('lodash');
var View = require('./../../view');
var data = require('./data.js')

function Main(options) {
    View.apply(this, arguments);
}

inherits(Main, View);
module.exports = Main;

Main.prototype.template = require('./db.tpl');

Main.prototype.data = function () {
    return {
        dbs: data(100)
    };
}
