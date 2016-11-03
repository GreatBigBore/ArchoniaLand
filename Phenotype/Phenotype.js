/* jshint forin:false, noarg:true, noempty:true, eqeqeq:true, bitwise:true, strict:true, loopfunc:true,
	undef:true, unused:true, curly:true, browser:true, indent:false, maxerr:50, jquery:true, node:true */

"use strict";

var Archonia = Archonia || { Axioms: {}, Cosmos: {}, Engine: {}, Essence: {}, Form: {} };

(function(Archonia) {
  
var Archonoid = function(archonite) { this.archonite = archonite; Archonia.Form.XY.call(this); };

Archonoid.prototype = Object.create(Archonia.Form.XY.prototype);
Archonoid.prototype.constructor = Archonoid;

Object.defineProperty(Archonoid.prototype, 'x', {
  get: function x() { return this.archonite.x; },
  set: function x(v) { this.archonite.x = v; }
});

Object.defineProperty(Archonoid.prototype, 'y', {
  get: function y() { return this.archonite.y; },
  set: function y(v) { this.archonite.y = v; }
});

Archonia.Form.Archonoid = Archonoid;

})(Archonia);
