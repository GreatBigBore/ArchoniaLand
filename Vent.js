/* jshint forin:false, noarg:true, noempty:true, eqeqeq:true, bitwise:true, strict:true, loopfunc:true,
	undef:true, unused:true, curly:true, browser:true, indent:false, maxerr:50, jquery:true, node:true */

/* global Phaser, tinycolor */

"use strict";

var Archonia = Archonia || { Axioms: {}, Cosmos: {}, Engine: {}, Essence: {}, Form: {} };

(function(Archonia) {
  
  var pollenThreshold = 3000;

  var TweenColor = function(sprite) {
    this.sprite = sprite;
    this.tinycolor = null;
    this.hueTween = null;
    this.targetHue = 60;
    this.hueQueue = [ ];
  
    this.h = this.targetHue;
    this.s = 100;
    this.L = 50;
  
    this.startLumaPulse();
  };

  TweenColor.prototype = {
    getColor: function() {
      this.hslString = "hsl(" + Math.floor(this.h) + ", " + Math.floor(this.s) + "%, " + Math.floor(this.L) + "%)";
      return parseInt(tinycolor(this.hslString).toHex(), 16);
    },
    
    setHue_: function() {
      if(this.hueTween === null && this.hueQueue.length > 0) {
        this.targetHue = this.hueQueue.shift();
        
        this.hueTween = Archonia.Engine.game.add.tween(this).to(
          { h: this.targetHue }, 2 * 1000, Phaser.Easing.Sinusoidal.In, true, 0, 0, false
        );
  
        this.hueTween.onComplete.add(function(colorHandler) {
          colorHandler.h = colorHandler.targetHue; colorHandler.hueTween = null;
        });
      }
    },
    
    setHue: function(hueValue) {
      if(hueValue !== this.targetHue && this.hueQueue.indexOf(hueValue) === -1) {
        this.hueQueue.push(hueValue);
      }
    },
  
    startLumaPulse: function() {
      this.tween = Archonia.Engine.game.add.tween(this).to(
          { L: 25 }, 5 * 1000, Phaser.Easing.Quartic.InOut, true, 0, -1, true
      );
      
      var _this = this;
      setInterval(function() { _this.sprite.tint = _this.getColor(); _this.setHue_(); }, 120); },
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
      nectarReserves: 500,  // Calories
      position: null,
      producingPollen: false,
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
      if(this.state.producingPollen) {
        // Pollen level is the inverse of the distance, so
        // the closer you are to the source, the higher the level
        var p = this.state.position.getDistanceTo(where);
        var q = Archonia.Axioms.gameHypoteneuse - p;
        var r = Archonia.Essence.zeroToOneRange.convertPoint(q, Archonia.Essence.gameDistanceRange);
      
        return r;
      } else { return 0; }
    },
    
    giveNectar: function() {
      var calories = 50 / 60; // 50 cal per second
      if(this.state.nectarReserves - calories < 0) {
        if(this.state.producingPollen) {
          this.colorHandler.setHue(0); this.state.producingPollen = false; return 0;
        }
      }
      else { this.state.nectarReserves -= calories; return calories; }
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
      this.colorHandler = new TweenColor(this.sprite);
    },
    
    tick: function() {
      this.state.nectarReserves++;
      this.state.nectarReserves *= 1 + (0.02 / 60);
      if(this.state.nectarReserves > pollenThreshold) {
        this.state.producingPollen = true;
      }
      
      if(this.state.producingPollen) {
        if(this.state.nectarReserves > pollenThreshold * 1.5) { this.colorHandler.setHue(100); }
        else if(this.state.nectarReserves > pollenThreshold) { this.colorHandler.setHue(60); }
      }
      
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