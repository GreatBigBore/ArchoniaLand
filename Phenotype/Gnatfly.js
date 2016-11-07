/* jshint forin:false, noarg:true, noempty:true, eqeqeq:true, bitwise:true, strict:true, loopfunc:true,
	undef:true, unused:true, curly:true, browser:true, indent:false, maxerr:50, jquery:true, node:true */

"use strict";

var Archonia = Archonia || { Axioms: {}, Cosmos: {}, Engine: {}, Essence: {}, Form: {} };

(function(Archonia) {

  var overrideSignalBufferSize = 30;
  var howManyTicksBetweenMoves_ = 60;
  var squareSize = 30;
  var relativePositions = [
    Archonia.Form.XY(0, -squareSize), Archonia.Form.XY(squareSize, -squareSize), Archonia.Form.XY(squareSize, 0),
    Archonia.Form.XY(squareSize, squareSize), Archonia.Form.XY(0, squareSize), Archonia.Form.XY(-squareSize, squareSize),
    Archonia.Form.XY(-squareSize, 0), Archonia.Form.XY(-squareSize, -squareSize)
  ];
  
  var allEqual = function(values) {
    if(values.length > 0) {
      var first = values[0].weight;
      return values.findIndex(function(e) { return e.weight !== first; }) === -1;
    } else { debugger; }  // jshint ignore: line
  };
  
  var allNonNullsEqual = function(values) {
    if(values.length > 0) {
      var first = values.find(function(e) { return e.weight !== null; });
      if(first === undefined) { return true; }
      else { return values.findIndex(function(e) { return e.weight !== first.weight && e.weight !== null; }) === -1; }
    } else { debugger; }  // jshint ignore: line
  };
  
  var getMovement = function(weights) {
    var i = null, r = 0, s = null;
    
    for(i = 0, r = 0; i < weights.length; i++) { r += weights[i].weight; }
    
    s = Archonia.Axioms.integerInRange(0, r);

    for(i = 0; i < weights.length && s >= 0; i++) { s -= weights[i].weight; }
    
    return weights[i - 1].ix;
  };
  
  var liftAndSeparate = function(values) {
    // Which would mean that both the signal array and the temp
    // array are useless, probably both all zeros, which should
    // never happen
    if(allEqual(values)) { debugger; }  // jshint ignore: line
        
    var i = null, m = null, max = null, min = null, multiplier = null;
    
    if(!allNonNullsEqual(values)) {
      min = null;
      for(i = 0; i < values.length; i++) {
        if(values[i].weight !== null) { m = values[i].weight; if(min === null || (m > 0 && m < min)) { min = m; } }
      }
  
      // We should be able to count on the array not being all zeros,
      // as we checked for that at the beginning of this function.
      // Note that we're checking for < 1e-6, rather than < 0, because
      // sometimes we get rounding errors. Not a big deal to throw out
      // such large numbers, I hope
      for(i = 0; i < values.length; i++) {
        if(values[i].weight !== null) { values[i].weight -= min; if(values[i].weight < 1e-6) { values[i].weight = 0; } }
      }

      min = null; max = null;
      for(i = 0; i < values.length; i++) {
        if(values[i].weight !== null) {
          m = values[i].weight;
          if(min === null || (m > 0 && m < min)) { min = m; }
          if(max === null || (m > 0 && m > max)) { max = m; }
        }
      }
  
      // Should never happen -- if we subtract and get all zeros, it
      // would mean all the original values in the array were the
      // same, which we checked for at the beginning
      if(min === null) { debugger; }  // jshint ignore: line
      if(max === null) { debugger; }  // jshint ignore: line

      if(max === 0) {
        // All of the non-null entries had the same value at this point
        // they're all zero; make them equally likely to be chosen
        for(i = 0; i < values.length; i++) {
          if(values[i].weight !== null) { values[i].weight = 1; }
        }
      } else {
        // We have signal differences we can work with
        multiplier = 10 / max;        // This will make max exactly 10 times min
        for(i = 0; i < values.length; i++) {
          if(values[i].weight !== null) { values[i].weight *= multiplier; }
        }
      }
    }

    // Just to make it a clearly separate step; chop off the decimals
    for(i = 0; i < values.length; i++) { if(values[i].weight !== null) { values[i].weight = Math.ceil(values[i].weight); } }
  };
    

var Gnatfly = function(archon, howManyTicksBetweenMoves) {
  if(howManyTicksBetweenMoves === undefined) { howManyTicksBetweenMoves = howManyTicksBetweenMoves_; }
  
  this.state = archon.state;
  this.genome = archon.genome;
  this.howManyTicksBetweenMoves = howManyTicksBetweenMoves;
  
  this.lastPosition = Archonia.Form.XY();
};

Gnatfly.prototype = {
  doWeRemember: function(p) {
    var weRememberIt = false;
    
    if(!this.trail.isEmpty()) {
      this.trail.forEach(function(ix, value) {
        if(p.equals(value)) { weRememberIt = true; return false; }
      });
    }

    return weRememberIt;
  },
  
  drawGnatfly: function() {
    var drawDebugLines = false;

    if(drawDebugLines) {
      Archonia.Essence.Dbitmap.aLine(this.lastPosition, this.state.position, "green", 2);
    }
  },
  
  launchToNextPosition: function(senses) {
    var where = getMovement(senses);

    var r = Archonia.Form.XY(), s = Archonia.Form.XY();
    r.set(relativePositions[where].plus(this.state.position));
    s.set(r);
    
    // Just so they don't go around in straight lines all the time
    r = s.randomizedTo(squareSize * 2); if(!s.isInBounds()) { r.set(s); }
    this.state.targetPosition.set(r);
    this.lastPosition.set(this.state.position);
  },
  
  launch: function() {
    var i = null, lo = null, hi = null;
  
    lo = this.genome.optimalTempLo - this.genome.tempRadius; hi = this.genome.optimalTempHi + this.genome.tempRadius;

    this.tempSensors = [];
    for(i = 0; i < 8; i++) {
      this.tempSensors.push(new Archonia.Form.SignalSmoother(overrideSignalBufferSize, this.genome.tempSignalDecayRate, lo, hi));
    }

    lo = this.genome.reproductionThreshold - this.genome.birthMassAdultCalories; hi = 0;
  
    this.state.hungerSensor = new Archonia.Form.SignalSmoother(
      Math.floor(this.genome.hungerSignalBufferSize), this.genome.hungerSignalDecayRate, lo, hi
    );
  
    lo = 0; hi = Archonia.gameWidth;
    this.pollenSensors = [];
    for(i = 0; i < 8; i++) {
      this.pollenSensors.push(new Archonia.Form.SignalSmoother(
        Math.floor(this.genome.pollenSignalBufferSize), this.genome.pollenSignalDecayRate, lo, hi));
    }
    
    this.lastPosition.set(this.state.position);
  },
  
  sense: function() {
    var tempDeltas = [], temps = [ ], rawSenses = [ ], oneAdjusted = [ ], nullified = [ ],
        max = null, maxIx = null, m = null, n = null, s = null;

    for(var i = 0; i < 8; i++) {
      var p = relativePositions[i].plus(this.state.position);
      if(p.isInBounds()) {
        var t = Archonia.Cosmos.TheAtmosphere.getTemperature(p);
        this.tempSensors[i].store(t);
        temps.push({ weight: t.toFixed(4), ix: i });
        tempDeltas.push({ weight: Math.abs(this.genome.optimalTemp - t), ix: i });
      } else {
        this.tempSensors[i].store(null);
        temps.push({ weight: null, ix: i });
        tempDeltas.push({ weight: null, ix: i });
      }
      
      if(p.isInBounds()) {
        s = this.tempSensors[i].getSignalStrength();
        rawSenses.push({ weight: s, ix: i });
        oneAdjusted.push({ weight: (1 - Math.abs(s)).toFixed(4), ix: i });
      } else {
        rawSenses.push({ weight: null, ix: i });
        oneAdjusted.push({ weight: null, ix: i });
      }
      
      n = this.tempSensors[i].signalAvailable() && p.isInBounds() ? (1 - Math.abs(s)).toFixed(4) : null;
      nullified.push({ weight: n, ix: i });
      
      if(max === null || n > max) { max = n; maxIx = i; }
    }
    
    // Get the max delta
    max = null; maxIx = null;
    for(i = 0; i < 8; i++) {
      n = tempDeltas[i].weight;
      if(n !== null) { if(max === null || tempDeltas[i].weight > max) { max = tempDeltas[i].weight; maxIx = i; } }
    }
    
    // Now use that element's actual value to adjust the other elements
    n = tempDeltas[maxIx].weight;
    for(i = 0; i < 8; i++) { m = tempDeltas[i].weight; if(m !== null) { tempDeltas[i].weight = n - tempDeltas[i].weight; } }

    if(true || allEqual(nullified) || allNonNullsEqual(nullified)) {
      liftAndSeparate(tempDeltas);
      
      max = null;
      for(i = 0; i < 8; i++) {
        n = tempDeltas[i].weight;
        if(n !== null) { if(max === null || n > max) { max = n; maxIx = i; } }
      }
      
      return tempDeltas;
    } else {
      liftAndSeparate(nullified);

      max = null;
      for(i = 0; i < 8; i++) {
        n = nullified[i].weight;
        if(n !== null) { if(max === null || n > max) { max = n; maxIx = i; } }
      }
      
      return nullified;
    }
    
    return rawSenses;
  },
  
  tick: function() {
    if(this.state.firstTickAfterLaunch) {
      this.whenToIssueNextMove = 0;
    }

    if(this.state.frameCount > this.whenToIssueNextMove) {
      var senses = this.sense();
      this.launchToNextPosition(senses);
      this.whenToIssueNextMove = this.state.frameCount + this.howManyTicksBetweenMoves;
    }
    
    this.drawGnatfly();
  }
};

Archonia.Form.Gnatfly = Gnatfly;

})(Archonia);
