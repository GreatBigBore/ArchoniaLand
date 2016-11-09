/* jshint forin:false, noarg:true, noempty:true, eqeqeq:true, bitwise:true, strict:true, loopfunc:true,
	undef:true, unused:true, curly:true, browser:true, indent:false, maxerr:50, jquery:true, node:true */

"use strict";

var Archonia = Archonia || { Axioms: {}, Cosmos: {}, Engine: {}, Essence: {}, Form: {} };

(function(Archonia) {
  
  var contrastScale = 10;
  var contrastExponent = 2;
  
var SenseArray = function(howManyPoints) {
  this.signalPoints = new Array(howManyPoints);
  this.nextSignalPoint = 0;
  this.howManyPoints = howManyPoints;
  
  for(var i = 0; i < howManyPoints; i++) { this.signalPoints[i] = null; }
};

SenseArray.prototype = {
  ceil: function() {
    for(var i = 0; i < this.signalPoints.length; i++) { this.signalPoints[i] = Math.ceil(this.signalPoints[i]); }
  },
  
  contrastify: function() {
    var chop = function() {
      var min = this.getMin();
      for(var i = 0; i < this.signalPoints.length; i++) {
        if(this.signalPoints[i] !== null) {
          this.signalPoints[i] -= min;
          if(this.signalPoints[i] < 1e-6) { this.signalPoints[i] = 0; }
        }
      }
      
      return this.signalIsAvailable();
    };
    
    var invert = function() {
      var max = this.getMax();
      for(var i = 0; i < this.signalPoints.length; i++) {
        if(this.signalPoints[i] !== null) { this.signalPoints[i] = max - this.signalPoints[i]; }
      }
      
      return this.signalIsAvailable();
    };
    
    var scale = function() {
      var i = null;
      
      if(this.signalIsFlat()) {
        // If the signal is flat, it's possible all the points are at zero.
        // We need to set all the non-nulls to 1 so our selector will get a random
        // one, instead of just grabbing the first element every time
        for(i = 0; i < this.signalPoints.length; i++) {
          if(this.signalPoints[i] !== null) { this.signalPoints[i] = 1; }
        }
      } else {
        // Note: if the signal is not flat, then max can't be zero; divide is ok
        var max = this.getMax();
        for(i = 0; i < this.signalPoints.length; i++) {
          if(this.signalPoints[i] !== null) { this.signalPoints[i] *= contrastScale / max; }
        }
      }
    };
    
    var contrastify = function() {
      var max = this.getMax();
      for(var i = 0; i < this.signalPoints.length; i++) {
        if(this.signalPoints[i] !== null) {
          this.signalPoints[i] = Math.pow(this.signalPoints[i], contrastExponent) / Math.pow(max, contrastExponent - 1);
        }
      }
    };
    
    if(invert.call(this)) {
      chop.call(this);
      scale.call(this);
      contrastify.call(this);
      return true;
    } else {
      return false;
    }
  },
  
  getCurveWeight: function() {
    var i = null, r = null;
    for(i = 0, r = 0; i < this.signalPoints.length; i++) {
      if(this.signalPoints[i] !== null) { r += this.signalPoints[i]; }
    }
    
    return r;
  },

  getMax: function() {
    for(var i = 0, max = null; i < this.signalPoints.length; i++) {
      var weight = this.signalPoints[i];
      if(weight > 0 && (max === null || weight > max)) { max = weight; }
    }
    
    return max;
  },

  getMin: function() {
    for(var i = 0, min = null; i < this.signalPoints.length; i++) {
      var weight = this.signalPoints[i];
      if(weight > 0 && (min === null || weight < min)) { min = weight; }
    }

    return min;
  },
  
  setMark: function() {
    if(this.signalIsAvailable) {
      this.contrastify();
      this.ceil();
      return true;
    } else { 
      return false;
    }
  },
  
  signalIsAvailable: function() { return !this.signalIsFlat(); },
  
  signalIsFlat: function() {
    var first = this.signalPoints.find(function(e) { return e !== null; });
    
    // Didn't find any non-null value; that counts as flat
    if(first === undefined) { return true; }
    
    // Found non-null; it's flat iff all the non-null values are the same
    else { var f = this.signalPoints.findIndex(function(e) { return e !== first && e !== null; }) === -1; return f;}
  },
  
  store: function(value) {
    this.signalPoints[this.nextSignalPoint] = value;
    this.nextSignalPoint = (this.nextSignalPoint + 1) % this.howManyPoints;
  },
  
  weightedSelect: function(randomValue) {
    var c = null, d = null, f = null, i = null;

    f = this.signalPoints.find(function(e) { return e !== null && e > 0; });

    if(f === undefined) {
      // If all we have are nulls and zeros, put 1s wherever
      // we have zeros, to make all of them equally likely and
      // so we won't just go through the zeros and always pick 7
      for(i = 0; i < this.signalPoints.length; i++) { if(this.signalPoints[i] === 0) { this.signalPoints[i] = 1; } }
    }
    
    // Now check whether we're in danger of going out of bounds
    for(i = 0, c = 0; i < this.signalPoints.length; i++) { if(this.signalPoints[i] !== null) { c++; } }

    if(c <= 3) {
      // We're too close to a boundary; choose the direction that
      // gets us back in bounds. Easy enough: set everything else
      // to zero and return the ix of the one that had the highest
      // signal
      for(i = 0, c = null; i < this.signalPoints.length; i++) {
        if(this.signalPoints[i] !== null) {
          if(c === null || this.signalPoints[i] > c) { c = this.signalPoints[i]; d = i; }
        }
      }
      
      for(i = 0; i < this.signalPoints.length; i++) { this.signalPoints[i] = 0; }

      this.signalPoints[d] = 1; // No randomness; take this one
      return d;
      
    } else {
    
      for(i = 0; i < this.signalPoints.length && randomValue >= 0; i++) {
        randomValue -= this.signalPoints[i];
      }

      return i - 1;
    }
  }
};

Archonia.Form.SenseArray = SenseArray;

})(Archonia);
