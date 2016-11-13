/* jshint forin:false, noarg:true, noempty:true, eqeqeq:true, bitwise:true, strict:true, loopfunc:true,
	undef:true, unused:true, curly:true, browser:true, indent:false, maxerr:50, jquery:true, node:true */

"use strict";

var Archonia = Archonia || { Axioms: {}, Cosmos: {}, Engine: {}, Essence: {}, Form: {} };

(function(Archonia) {

var Archon = function() {
  this.hasLaunched = false;
  
  this.setupState();

  Archonia.Cosmos.Genomery.genomifyMe(this); // No inheritance here; just getting a skeleton genome
  
  this.drone = Archonia.Cosmos.Dronery.getDrone(this);

  this.state.position = new Archonia.Form.Archonoid(this.drone.sensor.body.center);
  this.state.velocity = new Archonia.Form.Archonoid(this.drone.sensor.body.velocity);

  this.goo = new Archonia.Form.Goo(this);
  this.legs = new Archonia.Form.Legs(this);
  this.forager = new Archonia.Form.Forager(this);
};

Archon.prototype = {
  decohere: function() {
    this.drone.decohere();
    this.available = true;
    this.hasLaunched = false;
  },
  
  die: function() {
    console.log(this.state.archonUniqueId, "decohere");
    this.decohere();  // For now; I'll come back to rotting corpses later
  },

  launch: function(myParentArchon) {
    this.available = false;
    this.hasLaunched = true;
    this.state.firstTickAfterLaunch = true;
    this.state.touched = false;
    this.state.eat = false;
  
    this.state.frameCount = Archonia.Axioms.integerInRange(0, 60);

    Archonia.Cosmos.Genomery.inherit(this, myParentArchon);

    this.forager.launch();
    this.legs.launch(this.genome.maxMVelocity, this.genome.maxMAcceleration);
    this.goo.launch();

    var x = null, y = null;

    if(myParentArchon === undefined) {
      x = Archonia.Axioms.integerInRange(20, Archonia.Engine.game.width - 20);
      y = Archonia.Axioms.integerInRange(20, Archonia.Engine.game.height - 20);

      this.myParentArchonId = 0;
      Archonia.Cosmos.FamilyTree.addMe(this.state.archonUniqueId, 'god');
    } else {
      x = myParentArchon.state.position.x; y = myParentArchon.state.position.y;

      this.state.position.set(myParentArchon.position);
      this.state.velocity.set(myParentArchon.velocity).timesScalar(-1);
      this.myParentArchonId = myParentArchon.state.archonUniqueId;
  
      Archonia.Cosmos.FamilyTree.addMe(this.state.archonUniqueId, myParentArchon.state.archonUniqueId);
    }

    // This used to come from the genome, but for now, it's only for fireflies,
    // and I want them to stay small
    var sensorScale = 1;
    this.drone.launch(this.state.archonUniqueId, sensorScale, x, y);
  },
  
  senseVent: function() {
    this.state.touchingVent = true;
  },
  
  setupState: function() {
    this.state = {
      adultCalorieBudget: null,
      archonUniqueId: null,
      beingPoisoned: null,
      eat: null,
      embryoCalorieBudget: null,
      encysted: null,
      firstTickAfterLaunch: null,
      frameCount: null,
      hungerInput: null,
      larvalCalorieBudget: null,
      position: null,
      sensedArchons: null,
      sensedSkinnyManna: null,
      targetPosition: new Archonia.Form.TargetPosition(),
      tempInput: null,
      touchingVent: null,
      velocity: null,
      where: Archonia.Form.XY(),
    };
  },

  startTween: function() {},

  tick: function() {
    this.state.frameCount++;
    
    if(this.state.position.getDistanceTo(Archonia.Cosmos.TheVent.state.position) < 50) {
      var calories = Archonia.Cosmos.TheVent.giveNectar();
      this.goo.eat({calories: calories});
    }
    
    this.state.touchingVent = false; // Sensor will turn this back on if still touching

    this.forager.tick();
    this.goo.tick();
    this.legs.tick();
    this.drone.tick();

    this.state.firstTickAfterLaunch = false;
  },

  toggleMotion: function() { if(this.moving) { this.legs.stop(); } this.moving = !this.moving; }
};

Archonia.Form.Archon = Archon;

})(Archonia);

if(typeof window === "undefined") {
  module.exports = Archonia.Form.Archon;
}