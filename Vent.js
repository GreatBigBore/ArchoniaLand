/* jshint forin:false, noarg:true, noempty:true, eqeqeq:true, bitwise:true, strict:true, loopfunc:true,
	undef:true, unused:true, curly:true, browser:true, indent:false, maxerr:50, jquery:true, node:true */

"use strict";

var Archonia = Archonia || { Axioms: {}, Cosmos: {}, Engine: {}, Essence: {}, Form: {} };

(function(Archonia) {
  
  var pollenThreshold = 3000;
  
  var Vent = function() {
    this.phaserSetup();
    this.archoniaSetup();
  };
  
  Vent.prototype = {
    state: {
      archonUniqueId: "Vent",
      firstTickAfterLaunch: true,
      frameCount: 0,
      mass: 1,
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
      this.legs = new Archonia.Form.Legs(this); this.legs.launch(5, 1);
      this.antwalk = new Archonia.Form.Antwalk(this, 480); this.antwalk.launch();
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
          this.tweenColor.setHue(0); this.state.producingPollen = false; return 0;
        }
      }
      else { this.state.nectarReserves -= calories; return calories; }
    },
    
    phaserSetup: function() {
      Archonia.Engine.TheBitmapFactory.makeBitmap("archoniaVent");
    
      var a = Archonia.Engine.game.add.sprite(0, 0, 'vent');

      var x = Archonia.Axioms.integerInRange(Archonia.Axioms.goddamnedLeft, Archonia.Axioms.goddamnedRight);
      var y = Archonia.Axioms.integerInRange(Archonia.Axioms.goddamnedTop, Archonia.Axioms.goddamnedBottom);
      this.sprite = Archonia.Engine.game.add.sprite(x, y, Archonia.Engine.game.cache.getBitmapData('archoniaGooVent'));
    
      this.sprite.addChild(a);
    
      Archonia.Engine.game.physics.arcade.enable(this.sprite);

      a.anchor.setTo(0.5, 0.5);
      a.scale.setTo(1, 1);
      a.scale.setTo(0.3, 0.3);
    
      this.sprite.scale.setTo(0.75, 0.75);
      this.sprite.anchor.setTo(0.5, 0.5);
      this.sprite.alpha = 1;
      this.sprite.body.angularVelocity = 1;
    
      a.tint = 0;
    
      this.sprite.visible = true;
      this.tweenColor = new Archonia.Engine.TweenColorVent(this.sprite, "hsl(0, 100%, 50%)");
    },
    
    tick: function() {
      this.state.nectarReserves++;
      this.state.nectarReserves *= 1 + (0.05 / 60);
      if(this.state.nectarReserves > pollenThreshold) {
        this.state.producingPollen = true;
      }
      
      if(this.state.producingPollen) {
        if(this.state.nectarReserves > pollenThreshold * 1.5) { this.tweenColor.setHue(100); }
        else if(this.state.nectarReserves > pollenThreshold) { this.tweenColor.setHue(60); }
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
      this.legs.tick();
      this.tweenColor.tick();
    }
  };
  
  Archonia.Cosmos.TheVent = { start: function() { Archonia.Cosmos.TheVent = new Vent(); } };
  
})(Archonia);