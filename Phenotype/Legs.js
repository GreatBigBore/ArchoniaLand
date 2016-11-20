/* jshint forin:false, noarg:true, noempty:true, eqeqeq:true, bitwise:true, strict:true, loopfunc:true,
  undef:true, unused:true, curly:true, browser:true, indent:false, maxerr:50, jquery:true, node:true */

"use strict";

var Archonia = Archonia || { Axioms: {}, Cosmos: {}, Engine: {}, Essence: {}, Form: {} };

(function(Archonia) {
  
  var throttle = 1;

Archonia.Form.Legs = function(archon) {

  this.state = archon.state;
  this.sprite = archon.sprite;

  this.running = false;
  this.maneuver = "";

  this.thetaToVelocity = null;
  this.thetaToTarget = null;
  this.targetPosition = Archonia.Form.XY();
  this.vectorPToTarget = Archonia.Form.XY();
  this.vectorVToTarget = Archonia.Form.XY();
  this.acceleration = Archonia.Form.XY();
  this.brakingVector = Archonia.Form.XY();
};

Archonia.Form.Legs.prototype = {
  accelerate: function() {
    this.state.velocity.add(this.acceleration);
    this.state.velocity.capMagnitude(this.maxMVelocity);
    
    if(!this.needCourseCorrection()) {
      this.maneuver = "holding course";
    }
  },
  
  areAnglesThisClose: function(howClose) {
    var t1 = Archonia.Axioms.robalizeAngle(this.thetaToVelocity);
    var t2 = Archonia.Axioms.robalizeAngle(this.thetaToTarget);
    
    return Archonia.Axioms.fuzzyEqual(t1, t2, howClose);
  },
  
  getBrakingDistance: function() {
    var m = this.state.velocity.getMagnitude();
    var d = Math.pow(m * throttle, 2) / (2 * this.maxMAcceleration);
    return d;
  },
  
  holdCourse: function() {
    this.accelerate();  // We're on course; keep accelerating to max mvel
    
    if(this.state.position.getDistanceTo(this.targetPosition) < this.getBrakingDistance()) {
      this.acceleration.normalize();
      this.acceleration.scalarMultiply(this.maxMAcceleration / (60 * throttle));
      
      this.closestApproach = this.state.position.getDistanceTo(this.targetPosition);
      this.maneuver = "landing";
    }

    if(this.state.position.getDistanceTo(this.targetPosition) > this.closestApproach) {
      this.state.velocity.set(0);
      this.running = false;
    } else {
      this.closestApproach = this.state.position.getDistanceTo(this.targetPosition);
    }
  },
  
  land: function() {
    var stop = false;
    var m = this.state.position.getSignedMagnitude();

    if(this.state.position.getDistanceTo(this.targetPosition) < this.acceleration.getMagnitude() * 2) {
      stop = true;
    } else {
      this.state.velocity.subtract(this.acceleration);
      
      var n = this.state.position.getSignedMagnitude();
      if(Math.sign(m) !== Math.sign(n)) { stop = true; }
    }
    
    if(this.state.position.getDistanceTo(this.targetPosition) > this.closestApproach) {
      stop = true;
    } else {
      this.closestApproach = this.state.position.getDistanceTo(this.targetPosition);
    }

    if(stop) { this.stop(); }
  },
  
  launch: function(maxMVelocity) {
    this.maxMVelocity = maxMVelocity;
    this.maxMAcceleration = Archonia.Axioms.maxForceOnBody / this.state.mass;
  },
  
  needCourseCorrection: function() {
    return !this.areAnglesThisClose(Math.PI / 180);
  },
  
  setTargetPosition: function(p) {
    this.running = true;
    this.maneuver = "correcting course";
    this.targetPosition.set(p);
    
    // So far, pointing in movement direction applies only to dragonfly
    if(this.sprite !== undefined) {
      var a = Archonia.Axioms.robalizeAngle(this.sprite.rotation) + Math.PI / 2;
      var b = Archonia.Axioms.computerizeAngle(a);
      if(this.state.velocity.equals(0)) { this.state.velocity.setPolar(50, b); }
    }
    
    this.previousThetaToVelocity = null;
    this.closestApproach = Number.MAX_VALUE;
  },
  
  stop: function() { this.state.velocity.set(0); this.running = false; },

  tick: function() {
    if(this.state.frameCount % throttle !== 0) { return; }
    if(this.running) {
      switch(this.maneuver) {
        case "correcting course": this.updateMotion(); break;
        case "holding course": this.holdCourse(); break;
        case "landing": this.land(); break;
      }
    }
    
    return this.running;
  },
  
  updateMotion: function() {
    // Vector from my current position to the target
    this.vectorPToTarget.set(this.targetPosition);
    this.vectorPToTarget.subtract(this.state.position);
    
    if(this.vectorPToTarget.fuzzyEqual(this.state.velocity, 10)) {
      this.closestApproach = this.state.position.getDistanceTo(this.targetPosition);
      this.maneuver = "holding course";
    }

    // Vector from my current velocity to the target; this is what
    // we would add to our velocity vector to give us a straight line
    // to the target, if we had no speed and acceleration constraints
    this.vectorVToTarget.set(this.vectorPToTarget);
    this.vectorVToTarget.subtract(this.state.velocity.timesScalar(throttle));

    // Angle between vectorP & vectorV
    this.thetaToVelocity = this.vectorVToTarget.getAngleFrom(0);
    this.thetaToTarget = this.vectorPToTarget.getAngleFrom(this.vectorVToTarget);
    
    this.acceleration.setPolar(this.maxMAcceleration, this.thetaToVelocity);
    this.acceleration.capMagnitude(this.maxMAcceleration);
    this.acceleration.scalarDivide(60 * throttle);

    this.accelerate();
  }
};

})(Archonia);
