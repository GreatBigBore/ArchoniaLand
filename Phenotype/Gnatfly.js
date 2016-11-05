/* jshint forin:false, noarg:true, noempty:true, eqeqeq:true, bitwise:true, strict:true, loopfunc:true,
	undef:true, unused:true, curly:true, browser:true, indent:false, maxerr:50, jquery:true, node:true */

"use strict";

var Archonia = Archonia || { Axioms: {}, Cosmos: {}, Engine: {}, Essence: {}, Form: {} };

(function(Archonia) {

  var howManyTicksBetweenMoves_ = 60;
  var squareSize = 30;
  var relativePositions = [
    Archonia.Form.XY(0, -squareSize), Archonia.Form.XY(squareSize, -squareSize), Archonia.Form.XY(squareSize, 0),
    Archonia.Form.XY(squareSize, squareSize), Archonia.Form.XY(0, squareSize), Archonia.Form.XY(-squareSize, squareSize),
    Archonia.Form.XY(-squareSize, 0), Archonia.Form.XY(-squareSize, -squareSize)
  ];
  
  var getMovement = function(weights) {
    var i = null, r = 0, s = null;

    for(i = 0, r = 0; i < weights.length; i++) { r += weights[i].weight; }
    
    s = Archonia.Axioms.integerInRange(0, r);

    for(i = 0; i < weights.length && s >= 0; i++) { s -= weights[i].weight; }

    return weights[i - 1].ix;
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
      this.tempSensors.push(new Archonia.Form.SignalSmoother(8, this.genome.tempSignalDecayRate, lo, hi));
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
    var a = null, c = null, i = null, m = Number.MAX_VALUE, p = null, q = null, senses = [ ];
    
    // We make the numbers big so we can later subtract some
    // fixed value from them and cause them to be proportionally
    // further apart. For example, if we get a bunch of signals like
    // .0251 .0252 .0249 .0253 .0250 .0270
    // They're proportionally really close together, so we end up
    // wandering aimlessly. So we multiply them hugely,
    // get some averages, then subtract the lowest value from all
    // of them, like this: 25100, 25200, 24900, 25300, 25000, 27000, then
    // (25100 - 24900), (25200 - 24900), etc., ending up with
    // 200, 300, 0, 400, 100, 2100 -- proportionally much further apart,
    // and far more useful for choosing our general direction
    var multiplier = 1e6;
    
    for(i = 0, q = 0; i < 8; i++) {
      p = relativePositions[i].plus(this.state.position);
      
      if(p.isInBounds()) {
        this.tempSensors[i].store(Archonia.Cosmos.TheAtmosphere.getTemperature(p));
        this.pollenSensors[i].store(Archonia.Cosmos.TheVent.getPollenLevel(p));
        
        if(this.tempSensors[i].signalAvailable() && this.pollenSensors[i].signalAvailable()) {
          var tempSignal = this.tempSensors[i].getSignalStrength();
          var pollenSignal = this.pollenSensors[i].getSignalStrength() * 0.75;
        
          tempSignal = 1 - Math.abs(tempSignal);
          if(pollenSignal > 0.5) { pollenSignal = 1 - pollenSignal; }

          c = (tempSignal + pollenSignal) / 2;

          if(c * multiplier < m) { m = Math.floor(c * multiplier); }
          senses.push({ weight: Math.floor(c * multiplier), ix: i });
        }
      } else {
        this.tempSensors[i].reset(); this.pollenSensors[i].reset();
      }
    }
    
    a = 0;
    if(this.state.frameCount > 60 * 5) {
      for(i = 0; i < senses.length; i++) { senses[i].weight -= m; a += senses[i].weight; }
    }

    if(a === 0) { senses = []; for(i = 0; i < 8; i++) { senses.push({ weight: 1, ix: i }); } }
    else { for(i = 0; i < senses.length; i++) { senses[i].weight = Math.floor(senses[i].weight / 1e4); } }

    return senses;
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
