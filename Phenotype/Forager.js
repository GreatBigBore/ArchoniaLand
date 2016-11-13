/* jshint forin:false, noarg:true, noempty:true, eqeqeq:true, bitwise:true, strict:true, loopfunc:true,
	undef:true, unused:true, curly:true, browser:true, indent:false, maxerr:50, jquery:true, node:true */

"use strict";

var Archonia = Archonia || { Axioms: {}, Cosmos: {}, Engine: {}, Essence: {}, Form: {} };

(function(Archonia) {

  var yAxisRange = null;

var Forager = function(archon) {
  this.genome = archon.genome;
  this.state = archon.state;
  
  this.gnatfly = new Archonia.Form.Gnatfly(archon);
  
  if(yAxisRange === null) {
    yAxisRange = new Archonia.Form.Range(
      Archonia.Engine.game.world.centerY - Archonia.Axioms.gameRadius,
      Archonia.Engine.game.world.centerY + Archonia.Axioms.gameRadius
    );
  }
};

Forager.prototype = {
  computeFoodSearchState: function(tempSignal, hungerSignal) {
    var netTemp = Math.abs(tempSignal) * this.genome.tempToleranceMultiplier;
    var netHunger = hungerSignal * this.genome.hungerToleranceMultiplier;
    
    if(netTemp > netHunger) {
      // If temp wins, then we just go in the direction that gets us
      // closer to a temp signal of zero
      if(tempSignal > 0) { this.where = "randomDownOnly"; } else { this.where = "randomUpOnly"; }
      
    } else {
      var currentTemp = Archonia.Cosmos.TheAtmosphere.getTemperature(this.state.position);
      var scaledTemp = Archonia.Essence.centeredZeroRange.convertPoint(currentTemp, Archonia.Essence.worldTemperatureRange);
      var scaledY = Archonia.Essence.centeredZeroRange.convertPoint(this.state.position.y, yAxisRange);
      
      var upOk = true, downOk = true, stayCloseToManna = 1.25;
      
      if( // Hunger wins over temp threshold; here we're just trying to stay within manna growth range
        scaledTemp !== 0 && Math.sign(scaledTemp) !== Math.sign(scaledY) &&
        Math.abs(scaledTemp / scaledY) > stayCloseToManna
      ) { if(scaledTemp > 0) { upOk = false; } else { downOk = false; } }

      if(upOk && downOk) { this.where = "random"; }
      else if(upOk)      { this.where = "randomUpOnly"; }
      else               { this.where = "randomDownOnly"; }
    }
  },
  
  launch: function() {
    this.currentMannaTarget = null;
    this.where = "random";
    this.gnatfly.launch();
  },
  
  tick: function() {
    this.gnatfly.tick();
  }
};

Archonia.Form.Forager = Forager;

})(Archonia);
