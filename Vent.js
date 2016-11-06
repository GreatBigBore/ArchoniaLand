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
          { L: 25 }, 5 * 1000, Phaser.Easing.Quartic.InOut, true, 0, -1, true
      );
      
      var _this = this;
      setInterval(function() { _this.sprite.tint = _this.getColor(); }, 60);
    },
  };
  
  var Vent = function() {
    this.phaserSetup();
    this.archoniaSetup();
  };
  
  Vent.prototype = {
    state: {
      archonUniqueId: "Vent",
      firstTickAfterLaunch: true,
      frameCount: 0,
      position: null,
      targetPosition: new Archonia.Form.TargetPosition(),
      velocity: null,
      whenToRespin: 0
    },
    
    archoniaSetup: function() {
      this.state.position = new Archonia.Form.Archonoid(this.sprite.body.center);
      this.state.velocity = new Archonia.Form.Archonoid(this.sprite.body.velocity);
      this.antwalk = new Archonia.Form.Antwalk(this, 480); this.antwalk.launch();
      this.legs = new Archonia.Form.Legs(this); this.legs.launch(5, 1);
    },
    
    getPollenLevel: function(where) {
      return this.state.position.getDistanceTo(where);
    },
    
    phaserSetup: function() {
      Archonia.Essence.BitmapFactory.makeBitmap("archoniaVent");
    
      var a = Archonia.Engine.game.add.sprite(0, 0, 'vent'/*Archonia.Engine.game.cache.getBitmapData('archoniaVent'*/);

      var x = Archonia.Axioms.integerInRange(Archonia.Axioms.goddamnedLeft, Archonia.Axioms.goddamnedRight);
      var y = Archonia.Axioms.integerInRange(Archonia.Axioms.goddamnedTop, Archonia.Axioms.goddamnedBottom);
      this.sprite = Archonia.Engine.game.add.sprite(x, y, Archonia.Engine.game.cache.getBitmapData('archoniaGoo'));
    
      this.sprite.addChild(a);
    
      Archonia.Engine.game.physics.arcade.enable(this.sprite);

      a.anchor.setTo(0.5, 0.5);
      a.scale.setTo(1, 1);
      a.scale.setTo(0.6, 0.6);
    
      this.sprite.scale.setTo(0.4, 0.4);
      this.sprite.anchor.setTo(0.5, 0.5);
      this.sprite.alpha = 1;
      this.sprite.body.angularVelocity = 1;
    
      a.tint = 0;
    
      this.sprite.visible = true;
      this.colorHandler = new TweenColor(this.sprite, "hsl(60, 100%, 50%)");
    },
    
    tick: function() {
      if(this.state.frameCount > this.state.whenToRespin) {
        
        if(this.sprite.body.angularVelocity === 0) {
          var directions = [ -1, 0, 1 ];
          var i = Archonia.Axioms.integerInRange(0, 3);
          var v = directions[i];
          this.sprite.body.angularVelocity = v * 5;
        } else {
          this.sprite.body.angularVelocity = 0;
        }

        this.state.whenToRespin = this.state.frameCount + Archonia.Axioms.integerInRange(0, 600);
          
      }

      this.state.frameCount++;
      this.antwalk.tick(true, "random");
      this.legs.tick(); }
  };
  
  Archonia.Cosmos.TheVent = { start: function() { Archonia.Cosmos.TheVent = new Vent(); } };
  
})(Archonia);