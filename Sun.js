/* jshint forin:false, noarg:true, noempty:true, eqeqeq:true, bitwise:true, strict:true, loopfunc:true,
	undef:true, unused:true, curly:true, browser:true, indent:false, maxerr:50, jquery:true, node:true */

/* global tinycolor */

"use strict";

var Archonia = Archonia || { Axioms: {}, Cosmos: {}, Engine: {}, Essence: {}, Form: {} };

if(typeof window === "undefined") {
  var Phaser = require('./test/support/Phaser.js');
  Archonia.Engine.game = new Phaser.Game();
  
  Archonia.Axioms = require('./Axioms.js');
  Archonia.Essence = require('./Essence.js');
  Archonia.Essence.BitmapFactory = require('./BitmapFactory.js');
  Archonia.Form.Range = require('./Minions/Range.js');
  Archonia.Form.XY = require('./Minions/XY.js').XY;

  Archonia.Cosmos.Sea = Archonia.Essence.BitmapFactory.makeBitmap('archoniaGoo');
}

(function(Archonia) {
  
  var tempSwingRange = new Archonia.Form.Range(0, 500);
  var skyHueSwingRange = new Archonia.Form.Range(0, 180);
  
  Archonia.Cosmos.Year = {
    seasonalSkyHue: 0,
    
    setSeason: function() {
      var k = Math.floor(Archonia.Cosmos.Year.seasonalSkyHue);
      var s = "hsl(" + k +  ", 100%, 50%)";
      var t = tinycolor(s);
      var h = t.toHex(false);
      
      Archonia.Cosmos.Year.season.tint = parseInt(h, 16);
      
      var n = null, p = null, q = null, r = null;
      
      n = Math.abs(k - 180);
      r = tempSwingRange.convertPoint(n, skyHueSwingRange);
      p = Archonia.Axioms.temperatureLo + r;
      q = Archonia.Axioms.temperatureHi - r;
      Archonia.Essence.worldTemperatureRange.set(p, q);
    },
    
    start: function() {
      // Start the year in some random month, just for fun --
      // because the rest of this project is so serious
      Archonia.Cosmos.Year.seasonalSkyHue = Archonia.Axioms.integerInRange(0, 360);
      
      Archonia.Cosmos.Year.season = Archonia.Engine.game.add.sprite(
        Archonia.Essence.gameCenter.x, Archonia.Essence.gameCenter.y,
        Archonia.Engine.game.cache.getBitmapData('archoniaSeasons')
      );
      
      Archonia.Cosmos.Year.season.scale.setTo(1, 1);  // could make this bitmap smaller; come back to it
      Archonia.Cosmos.Year.season.anchor.setTo(0.5, 0.5);
      Archonia.Cosmos.Year.season.alpha = 0.1;
      Archonia.Cosmos.Year.season.visible = true;

     /* Archonia.Cosmos.Sun.dailyarknessTween = Archonia.Engine.game.add.tween(Archonia.Cosmos.Year.season).to(
        {alpha: 1}, Archonia.Axioms.dayLength, Archonia.Cosmos.Sun.easingFunction, true, 0, -1, true
      );*/
    },
    
    tick: function() { Archonia.Cosmos.Year.setSeason(); }
  };
  
  Archonia.Cosmos.Sun = {
    darkness: null,
    darknessTween: null,
    dayNumber: null,
    easingFunction: Phaser.Easing.Quartic.InOut,
  
    getStrength: function() {
      // We have to clamp it because the actual sprite alpha can go slightly
      // negative when it's supposed to stop at zero.
      return Archonia.Axioms.clamp(
        Archonia.Essence.zeroToOneRange.convertPoint(Archonia.Cosmos.Sun.darkness.alpha, Archonia.Essence.darknessRange), 0, 1
      );
    },
    
    getTemperature: function() { return 0; },
    
    getWorldColorRange: function() { return new Archonia.Form.Range(0, 1); },
    
    ignite: function() {
      Archonia.Cosmos.Sun.darkness = Archonia.Engine.game.add.sprite(
        Archonia.Essence.gameCenter.x, Archonia.Essence.gameCenter.y, Archonia.Engine.game.cache.getBitmapData('archoniaGoo')
      );

      var scale = Archonia.Axioms.gameWidth / Archonia.Axioms.archoniaGooRadius;
      Archonia.Cosmos.Sun.darkness.scale.setTo(scale, scale); // Big enough to cover the world

      Archonia.Cosmos.Sun.darkness.anchor.setTo(0.5, 0.5);
      Archonia.Cosmos.Sun.darkness.alpha = Archonia.Axioms.darknessAlphaLo; // Note: dark sprite, so high alpha means dark world
      Archonia.Cosmos.Sun.darkness.tint = parseInt(tinycolor('hsl(0, 0%, 0%').toHex(), 16);
      
      Archonia.Cosmos.Sun.darkness.visible = true;

      Archonia.Cosmos.Sun.darknessTween = Archonia.Engine.game.add.tween(Archonia.Cosmos.Sun.darkness).to(
        {alpha: Archonia.Axioms.darknessAlphaHi}, Archonia.Axioms.dayLength, Archonia.Cosmos.Sun.easingFunction, true, 0, -1, true
      );
  
      Archonia.Cosmos.Sun.halfDayNumber = 0;  // Creation happens at midnight

      Archonia.Essence.worldColorRange = Archonia.Cosmos.Sun.getWorldColorRange();
      
      /*Archonia.Cosmos.Sun.darknessTween.onLoop.add(function() {
        Archonia.Axioms.archonia.archons.dailyReport(this.Archonia.Cosmos.Sun.dayNumber++);
      }, this);*/

      Archonia.Cosmos.Sun.darknessTween.onLoop.add(function() {
        Archonia.Cosmos.Sun.halfDayNumber++;

        if(Archonia.Cosmos.Sun.halfDayNumber % 2 === 1) {
          Archonia.Cosmos.Year.seasonalSkyHue += 360 / Archonia.Axioms.daysPerYear;
          
          if(Archonia.Cosmos.Year.seasonalSkyHue > 360) { Archonia.Cosmos.Year.seasonalSkyHue = 0; }
      
          Archonia.Cosmos.Desert.tilePosition.setTo(
            Archonia.Axioms.integerInRange(-1000, 0), Archonia.Axioms.integerInRange(-1000, 0)
          );
        }
      });
    }
  };
})(Archonia);

if(typeof window === "undefined") {
  module.exports = Archonia.Cosmos.Sun;
}
