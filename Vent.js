/* jshint forin:false, noarg:true, noempty:true, eqeqeq:true, bitwise:true, strict:true, loopfunc:true,
	undef:true, unused:true, curly:true, browser:true, indent:false, maxerr:50, jquery:true, node:true */

/* global Phaser, tinycolor */

"use strict";

var Archonia = Archonia || { Axioms: {}, Cosmos: {}, Engine: {}, Essence: {}, Form: {} };

(function(Archonia) {

  var TweenColor = function(vent, hsl) {
    this.vent = vent;
    this.tinycolor = null;
  
    this.h = 0;
    this.s = 0;
    this.L = 0;
  
    this.start(hsl);
  };

  TweenColor.prototype = {
    getColor: function() {
      this.hslString = "hsl(" + this.h + ", " + Math.floor(this.s) + "%, " + Math.floor(this.L) + "%)";
      return parseInt(tinycolor(this.hslString).toHex(), 16);
    },
  
    start: function(hslString) {
      var hsl = tinycolor(hslString).toHsl();
      this.h = hsl.h; this.s = hsl.s * 100; this.L = hsl.l * 100;
    
      this.tween = Archonia.Engine.game.add.tween(this).to(
          { L: 35 }, 5 * 1000, Phaser.Easing.Sinusoidal.InOut, true, 0, -1, true
      );
      
      var _this = this;
      setInterval(function() {
        _this.vent.tint = _this.getColor();
      }, 1);
    },
  };
  
  var Vent = function() {
    Archonia.Essence.BitmapFactory.makeBitmap("archoniaVent");
    
    var a = Archonia.Engine.game.add.sprite(0, 0, Archonia.Engine.game.cache.getBitmapData('archoniaVent')
    );

    this.vent = Archonia.Engine.game.add.sprite(
      Archonia.Essence.gameCenter.x, Archonia.Essence.gameCenter.y, Archonia.Engine.game.cache.getBitmapData('archoniaGoo')
    );
    
    this.vent.addChild(a);

    a.anchor.setTo(0.5, 0.5);
    a.scale.setTo(1, 1);
    
    this.vent.scale.setTo(1, 1);
    this.vent.anchor.setTo(0.5, 0.5);
    this.vent.alpha = 1;
    
    a.tint = 0;
    
    this.vent.visible = true;
    
    Archonia.Cosmos.Sun.darknessTween = Archonia.Engine.game.add.tween(Archonia.Cosmos.Sun.darkness).to(
      {alpha: Archonia.Axioms.darknessAlphaLo}, Archonia.Axioms.dayLength, Archonia.Cosmos.Sun.easingFunction, true, 0, -1, true
    );
    
    this.colorHandler = new TweenColor(this.vent, "hsl(0, 100%, 50%)");
  };
  
  Vent.prototype = {
    
  };
  
  Archonia.Cosmos.TheVent = { start: function() { Archonia.Cosmos.TheVent = new Vent(); } };
  
})(Archonia);