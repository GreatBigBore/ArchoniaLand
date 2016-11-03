/* jshint forin:false, noarg:true, noempty:true, eqeqeq:true, bitwise:true, strict:true, loopfunc:true,
	undef:true, unused:true, curly:true, browser:true, indent:false, maxerr:50, jquery:true, node:true */

/* global Phaser, tinycolor */

"use strict";

var Archonia = Archonia || { Axioms: {}, Cosmos: {}, Engine: {}, Essence: {}, Form: {} };

(function(Archonia) {

  var TweenColor = function(sprite, hsl) {
    this.sprite = sprite;
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
        _this.sprite.tint = _this.getColor();
      }, 1);
    },
  };
  
  var Vent = function() {
    Archonia.Essence.BitmapFactory.makeBitmap("archoniaVent");
    
    var a = Archonia.Engine.game.add.sprite(0, 0, 'vent'/*Archonia.Engine.game.cache.getBitmapData('archoniaVent'*/);

    this.sprite = Archonia.Engine.game.add.sprite(
      Archonia.Essence.gameCenter.x, Archonia.Essence.gameCenter.y, Archonia.Engine.game.cache.getBitmapData('archoniaGoo')
    );
    
    this.sprite.addChild(a);
    
    Archonia.Engine.game.physics.arcade.enable(this.sprite);

    a.anchor.setTo(0.5, 0.5);
    a.scale.setTo(1, 1);
    a.scale.setTo(0.6, 0.6);
    
    this.sprite.scale.setTo(0.4, 0.4);
    this.sprite.anchor.setTo(0.5, 0.5);
    this.sprite.alpha = 1;
    
    a.tint = 0;
    
    this.sprite.visible = true;
    
    Archonia.Cosmos.Sun.darknessTween = Archonia.Engine.game.add.tween(Archonia.Cosmos.Sun.darkness).to(
      {alpha: Archonia.Axioms.darknessAlphaLo}, Archonia.Axioms.dayLength, Archonia.Cosmos.Sun.easingFunction, true, 0, -1, true
    );
    
    this.colorHandler = new TweenColor(this.sprite, "hsl(0, 100%, 50%)");
  };
  
  Vent.prototype = {
    
  };
  
  Archonia.Cosmos.TheVent = { start: function() { Archonia.Cosmos.TheVent = new Vent(); } };
  
})(Archonia);