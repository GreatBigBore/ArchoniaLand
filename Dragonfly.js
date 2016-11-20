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
      mass: 1,
      position: null,
      velocity: null
    },
    
    archoniaSetup: function() {
      this.state.position = new Archonia.Form.Archonoid(this.sprite.body.center);
      this.state.velocity = new Archonia.Form.Archonoid(this.sprite.body.velocity);
      this.legs = new Archonia.Form.Legs(this); this.legs.launch(120);
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
      
      var moving = this.legs.tick();
      
      if(moving) {
        this.sprite.rotation = Archonia.Axioms.computerizeAngle(
          Archonia.Axioms.robalizeAngle(this.state.velocity.getAngleTo(0)) + Math.PI / 2
        );
      }
    }
  };
  
  Archonia.Cosmos.Dragonfly = { start: function() { Archonia.Cosmos.Dragonfly = new Dragonfly(); } };
  
})(Archonia);