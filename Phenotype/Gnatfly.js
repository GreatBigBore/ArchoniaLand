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
  
var Gnatfly = function(archon, howManyTicksBetweenMoves) {
  if(howManyTicksBetweenMoves === undefined) { howManyTicksBetweenMoves = howManyTicksBetweenMoves_; }
  
  this.state = archon.state;
  this.genome = archon.genome;
  this.howManyTicksBetweenMoves = howManyTicksBetweenMoves;
  
  this.lastPosition = Archonia.Form.XY();
};

Gnatfly.prototype = {
  getDampedMovement: function() {
    var w = this.dampedSenseArray.getCurveWeight();
    var r = Archonia.Axioms.integerInRange(0, w);
    var s = this.dampedSenseArray.weightedSelect(r);
    
    return s;
  },
  
  getRawMovement: function() {
    var w = this.rawSenseArray.getCurveWeight();
    var r = Archonia.Axioms.integerInRange(0, w);
    var s = this.rawSenseArray.weightedSelect(r);
    
    return s;
  },
  
  launchToNextPosition: function() {
    var where = null;
    
    this.rawSenseArray.setMark();
    where = this.getRawMovement();

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
    
    this.rawSenseArray = new Archonia.Form.SenseArray(8);
    this.dampedSenseArray = new Archonia.Form.SenseArray(8);
    
    this.lastPosition.set(this.state.position);
  },
  
  sense: function() {
    var n = null, s = null, t = null, u = null;

    for(var i = 0; i < 8; i++) {
      var p = relativePositions[i].plus(this.state.position);

      n = null; // What we'll store in damped if out of bounds or no signal
      u = null; // What we'll store in raw if out of bounds

      if(p.isInBounds()) {
        t = Archonia.Cosmos.TheAtmosphere.getTemperature(p);
        u = Math.abs(this.genome.optimalTemp - t);
        
        this.tempSensors[i].store(t);
        
        if(this.tempSensors[i].signalAvailable()) {
          s = this.tempSensors[i].getSignalStrength();
          n = 1 - Math.abs(s);
        }

      } else {
        
        this.tempSensors[i].store(null);

      }

      this.dampedSenseArray.store(n);
      this.rawSenseArray.store(u);
    }
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
  }
};

Archonia.Form.Gnatfly = Gnatfly;

})(Archonia);
