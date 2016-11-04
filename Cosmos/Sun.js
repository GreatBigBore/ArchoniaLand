/* jshint forin:false, noarg:true, noempty:true, eqeqeq:true, bitwise:true, strict:true, loopfunc:true,
	undef:true, unused:true, curly:true, browser:true, indent:false, maxerr:50, jquery:true, node:true */

/* global Phaser, tinycolor */

"use strict";

var Archonia = Archonia || { Axioms: {}, Cosmos: {}, Engine: {}, Essence: {}, Form: {} };

(function(Archonia) {
  
  var tempSwingRange = new Archonia.Form.Range(0, 500);
  var skyHueSwingRange = new Archonia.Form.Range(0, 180);
  
  var Year = function() {
    // Start the year in some random month, just for fun --
    // because the rest of this project is so serious
    this.skyHue = Archonia.Axioms.integerInRange(0, 360);
    
    this.season = Archonia.Engine.game.add.sprite(
      Archonia.Essence.gameCenter.x, Archonia.Essence.gameCenter.y,
      Archonia.Engine.game.cache.getBitmapData('archoniaSeasons')
    );
    
    this.season.scale.setTo(1, 1);
    this.season.anchor.setTo(0.5, 0.5);
    this.season.alpha = 0.1;
    this.season.visible = true;
  };
  
  Year.prototype = {
    skyHue: 0,
    
    setSeason: function() {
      var k = Math.floor(this.skyHue);
      var s = "hsl(" + k +  ", 100%, 50%)";
      var t = tinycolor(s);
      var h = t.toHex(false);
      
      this.season.tint = parseInt(h, 16);
      
      var n = null, p = null, q = null, r = null;
      
      n = Math.abs(k - 180);
      r = tempSwingRange.convertPoint(n, skyHueSwingRange);
      p = Archonia.Axioms.temperatureLo + r;
      q = Archonia.Axioms.temperatureHi - r;
      Archonia.Essence.worldTemperatureRange.set(p, q);
    },
    
    tick: function() { this.skyHue = (this.skyHue + 360 / Archonia.Axioms.daysPerYear) % 360; this.setSeason(); }
  };
  
  var Day = function(noonBells, theSun) {
    this.darkness = Archonia.Engine.game.add.sprite(
      Archonia.Essence.gameCenter.x, Archonia.Essence.gameCenter.y, Archonia.Engine.game.cache.getBitmapData('archoniaGoo')
    );

    var scale = Archonia.Axioms.gameWidth / Archonia.Axioms.archoniaGooRadius;
    this.darkness.scale.setTo(scale, scale); // Big enough to cover the world

    this.darkness.anchor.setTo(0.5, 0.5);
    this.darkness.alpha = Archonia.Axioms.darknessAlphaLo; // Note: dark sprite, so high alpha means dark world
    this.darkness.tint = 0;
    
    this.darkness.visible = true;

    this.darknessTween = Archonia.Engine.game.add.tween(this.darkness).to(
      {alpha: Archonia.Axioms.darknessAlphaHi}, Archonia.Axioms.dayLength, Phaser.Easing.Quartic.InOut, true, 0, -1, true
    );

    this.darknessTween.onLoop.add(noonBells, theSun);
  };
  
  Day.prototype = {
    darkness: null,
    darknessTween: null,
    dayNumber: null
  };
  
  var Sun = function() {
    // Haven't yet thought of a good place to put the desert. Its behavior
    // is intimately connected to the sun's movements, so this will work for now
    this.desert = Archonia.Engine.game.add.tileSprite(
      0, 0, Archonia.Axioms.gameWidth, Archonia.Axioms.gameHeight, 'floor'
    );

    // Note: add day/season sprites AFTER the desert, so
    // they'll come out on top in the z-order
    this.day = new Day(this.noonBells, this);
    this.year = new Year();
    
    this.shiftDesertFloor();
  };
  
  Sun.prototype = {
    halfDayNumber: 0,
    
    getTemperature: function() { return 0; },
    
    noonBells: function() {
      this.halfDayNumber++;

      if(this.halfDayNumber % 2 === 1) {
        this.year.tick();
        this.shiftDesertFloor();
      }
    },

    shiftDesertFloor: function() {
      this.desert.tilePosition.setTo(
        Archonia.Axioms.integerInRange(-1000, 0), Archonia.Axioms.integerInRange(-1000, 0)
      );
    }
  };
  
  Archonia.Cosmos.TheSun = { ignite: function() { Archonia.Cosmos.TheSun = new Sun(); } };
})(Archonia);
