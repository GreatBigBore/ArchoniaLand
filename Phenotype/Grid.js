/* jshint forin:false, noarg:true, noempty:true, eqeqeq:true, bitwise:true, strict:true, loopfunc:true,
	undef:true, unused:true, curly:true, browser:true, indent:false, maxerr:50, jquery:true, node:true */

"use strict";

var Archonia = Archonia || { Axioms: {}, Cosmos: {}, Engine: {}, Essence: {}, Form: {} };

(function(Archonia) {

var XY = Archonia.Form.XY;

var gridletSize = 30;

var gridPositions = [
  XY(0, -gridletSize), XY(gridletSize, -gridletSize), XY(gridletSize, 0),
  XY(gridletSize, gridletSize), XY(0, gridletSize), XY(-gridletSize, gridletSize),
  XY(-gridletSize, 0), XY(-gridletSize, -gridletSize)
];
  
var Grid = function(archon) {
  this.gridlets = [ ];
  for(var i = 0; i < 8; i++) { this.gridlets.push(new Gridlet(gridPositions[i])); }
  
  this.position = archon.state.position;
  this.genome = archon.genome;
};

Grid.prototype = {
  combineCurves: function(curves) {
    var combined = new Array(gridPositions.length); combined.fill(-1);
    
    for(var i = 0; i < curves.length; i++) {
      var currentCurve = curves[i].s;
      var currentMultiplier = curves[i].g;
      
      for(var j = 0; j < gridPositions.length; j++) {
        var input = currentCurve[j];

        if(input === null) { combined[j] = null; }
        else {
          input *= currentMultiplier;
          
          if(combined[j] === -1) { combined[j] = input; }
          else { combined[j] += input; }
        }
      }
    }
    
    return combined;
  },
  
  getCurveWeight: function(curve) {
    var i = null, r = null;
    for(i = 0, r = 0; i < curve.length; i++) {
      if(curve[i] !== null) { r += curve[i]; }
    }
    
    return r;
  },
  
  getSignalCurve: function() {
    var t = { s: this.getSignalCurveTemp(), g: this.genome.tempToleranceMultiplier };
    var p = { s: this.getSignalCurvePollen(), g: this.genome.pollenToleranceMultiplier };
    var c = this.combineCurves([ t, p ]);
    var b = this.stayInBounds(c);
    var d = Archonia.Essence.normalizeCurve(b);
    
    return d;
  },
  
  getSignalCurvePollen: function() {
    var a = [ ];

    for(var i = 0; i < gridPositions.length; i++) {
      var g = this.gridlets[i];
      var p = g.getSignalPollen(this.position);

      a.push(p);
    }
    
    return a;
  },
  
  getSignalCurveTemp: function() {
    var a = [ ];

    for(var i = 0; i < gridPositions.length; i++) {
      var g = this.gridlets[i];
      var t = g.getSignalTemp(this.position);

      a.push(t);
    }
    
    return a;
  },
  
  stayInBounds: function(curve) {
    var isAllNull = curve.find(function(e) { return e !== null; }) === undefined;
    
    if(isAllNull) {
      var closestToCenter = null, i = null, ix = null;
      for(i = 0; i < gridPositions.length; i++) {
        var d = this.gridlets[i].getDistance(this.position,
          Archonia.Engine.game.world.centerX, Archonia.Engine.game.world.centerY
        );
        
        if(closestToCenter === null || d < closestToCenter) { closestToCenter = d; ix = i; }
      }
      
      console.log("centering", this.position.toString());
      
      curve[ix] = 1;  // All nulls; set this so we'll aim for world center
    }
    
    return curve;
  }
};

var Gridlet = function(positionRelativeToCenter) {
  this.positionRelativeToCenter = positionRelativeToCenter;
};

Gridlet.prototype = {
  getSignalPollen: function(center) {
    var p = this.aPosition(center);
    
    return p.isInBounds() ? Archonia.Cosmos.TheVent.getPollenLevel(p) : null;
  },
  
  getDistance: function(center, x, y) {
    return this.aPosition(center).getDistanceTo(x, y);
  },
  
  getSignalTemp: function(center) {
    var p = this.aPosition(center);
    
    if(p.isInBounds()) {
      var t = Archonia.Cosmos.TheAtmosphere.getTemperature(p);
      var u = Math.abs(t - Archonia.Axioms.temperatureHi);
      var v = Archonia.Essence.zeroToOneRange.convertPoint(u, Archonia.Essence.worldTemperatureRange);
    
      return v;
    } else {
      return null;
    }
  },
  
  aPosition: function(center) { return this.positionRelativeToCenter.plus(center); }
};

Archonia.Form.Grid = Grid;
Archonia.Essence.gridPositions = gridPositions;
Archonia.Essence.gridletSize = gridletSize;

})(Archonia);
