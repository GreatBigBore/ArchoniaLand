/* jshint forin:false, noarg:true, noempty:true, eqeqeq:true, bitwise:true, strict:true, loopfunc:true,
	undef:true, unused:true, curly:true, browser:true, indent:false, maxerr:50, jquery:true, node:true */

"use strict";

var Archonia = Archonia || { Axioms: {}, Cosmos: {}, Engine: {}, Essence: {}, Form: {} };

(function(Archonia) {
  
  var Dragonfly = function() {
    this.phaserSetup();
    this.archoniaSetup();
  };
  
  Dragonfly.prototype = {
    state: {
      archonUniqueId: "Dragonfly",
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
      this.antwalk = new Archonia.Form.Antwalk(this, 60); this.antwalk.launch();
      this.legs = new Archonia.Form.Legs(this); this.legs.launch(45, 15);
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
      var x = Archonia.Axioms.integerInRange(Archonia.Axioms.goddamnedLeft, Archonia.Axioms.goddamnedRight);
      var y = Archonia.Axioms.integerInRange(Archonia.Axioms.goddamnedTop, Archonia.Axioms.goddamnedBottom);
      this.sprite = Archonia.Engine.game.add.sprite(x, y, 'dragonfly');
    
      Archonia.Engine.game.physics.arcade.enable(this.sprite);

      this.sprite.scale.setTo(1, 1);
      this.sprite.anchor.setTo(0.5, 0.5);
      this.sprite.alpha = 1;
      this.sprite.body.angularVelocity = 0;
      this.sprite.visible = true;
    },
    
    tick: function() {
      this.state.frameCount++;
      this.antwalk.tick(true, "random");
      this.legs.tick();
      
      if(this.state.frameCount % 1 === 0) {
        this.sprite.rotation = Archonia.Axioms.computerizeAngle(
          Archonia.Axioms.robalizeAngle(Math.atan2(this.state.velocity.y, this.state.velocity.x)) - Math.PI / 2
        );
      }
    }
  };
  
  Archonia.Cosmos.Dragonfly = { start: function() { Archonia.Cosmos.Dragonfly = new Dragonfly(); } };
  
})(Archonia);