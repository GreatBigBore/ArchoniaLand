/* jshint forin:false, noarg:true, noempty:true, eqeqeq:true, bitwise:true, strict:true, loopfunc:true,
	undef:true, unused:true, curly:true, browser:true, indent:false, maxerr:50, jquery:true, node:true */

"use strict";

var Archonia = Archonia || { Axioms: {}, Cosmos: {}, Engine: {}, Essence: {}, Form: {} };

(function(Archonia) {

  var yAxisRange = null;

var Forager = function(archon) {
  this.genome = Archonia.Cosmos.Genomery.makeGeneCluster(archon, "forager");
  this.state = archon.state;
  
  this.antwalk = new Archonia.Form.Antwalk(archon);
  
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
      var currentTemp = Archonia.Cosmos.Sun.getTemperature(this.state.position);
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
  },
  
  tick: function() {
    var mannaInSight = this.state.sensedSkinnyManna.length > 0;
    
    if(mannaInSight) {
      var ix = this.state.sensedSkinnyManna.findIndex(
        function(m) { return m.archoniaUniqueObjectId === this.currentMannaTarget; }, this
      );
      
      if(ix === -1) {
        var archonMass = Archonia.Essence.getArchonMass(this.state);
        var optimalTemp = this.genome.optimalTemp;
        var p = this.state.position;
        
        this.state.sensedSkinnyManna.sort(function(a, b) {

          var aTempCost = Archonia.Essence.getTempCost(a, archonMass, optimalTemp);
          var bTempCost = Archonia.Essence.getTempCost(b, archonMass, optimalTemp);
          
          if(aTempCost === bTempCost) {
            return p.getDistanceTo(a) < p.getDistanceTo(b);
          } else {
            return aTempCost < bTempCost;
          }

        });
        
        ix = 0;
      }
      
      var bestManna = this.state.sensedSkinnyManna[ix];
      this.currentMannaTarget = bestManna.archoniaUniqueObjectId;
      this.state.targetPosition.set(bestManna, 0, 0);

    }
    
    // We don't really have to tick antwalk every time, but it
    // allows me to not have to maintain any state on his behalf
    this.antwalk.tick(!mannaInSight);
  }
};

Archonia.Form.Forager = Forager;

})(Archonia);
