/* jshint forin:false, noarg:true, noempty:true, eqeqeq:true, bitwise:true, strict:true, loopfunc:true,
	undef:true, unused:true, curly:true, browser:true, indent:false, maxerr:50, jquery:true, node:true */

"use strict";

var Archonia = Archonia || { Axioms: {}, Cosmos: {}, Engine: {}, Essence: {}, Form: {} };

(function() {
  
// This came straight from
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error
var BirthDefect = function(message) {
  this.message = message;
  var last_part = new Error().stack.match(/[^\s]+$/);
  this.stack = this.name + " at " + last_part;
};

BirthDefect.prototype = Object.create(Error.prototype);
BirthDefect.prototype.name = "BirthDefect";
BirthDefect.prototype.message = "";
BirthDefect.prototype.constructor = BirthDefect;

Archonia.Essence.BirthDefect = BirthDefect;

Archonia.Essence.hurl = function(e) {
  var throwException = false;
  
  if(e instanceof Archonia.Essence.BirthDefect || throwException || (typeof window === "undefined")) { throw e; }
  else { console.log("Debug exception " + e.message, e.stack); debugger; } // jshint ignore: line
};

})(Archonia);
