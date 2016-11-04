/* jshint forin:false, noarg:true, noempty:true, eqeqeq:true, bitwise:true, strict:true, loopfunc:true,
	undef:true, unused:true, curly:true, browser:true, indent:false, maxerr:50, jquery:true, node:true */

"use strict";

var Archonia = Archonia || { Axioms: {}, Cosmos: {}, Engine: {}, Essence: {}, Form: {} };

(function(Archonia) {
  
var Atmosphere = function() {
  
};

Atmosphere.prototype = {
  getTemperature: function(where) {
    var sunEnergyLevel = Archonia.Cosmos.TheSun.getEnergyLevel();
    var desertHotspotTemp = 500;
    var desertColdspotTemp = -500;
    
    var hd = where.getDistanceTo(100, 100), cd = where.getDistanceTo(500, 500);
    var hotspotContribution = hd === 0 ? 0 : desertHotspotTemp / hd;
    var coldspotContribution = cd === 0 ? 0 : desertColdspotTemp / cd;
    
    return (sunEnergyLevel + hotspotContribution + coldspotContribution) / 3;
  }
};

Archonia.Cosmos.TheAtmosphere = { breathe: function() { Archonia.Cosmos.TheAtmosphere = new Atmosphere(); } };

})(Archonia);
