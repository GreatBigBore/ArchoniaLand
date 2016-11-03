/* jshint forin:false, noarg:true, noempty:true, eqeqeq:true, bitwise:true, strict:true, loopfunc:true,
  undef:true, unused:true, curly:true, browser:true, indent:false, maxerr:50, jquery:true, node:true */

"use strict";

var Archonia = Archonia || { Axioms: {}, Cosmos: {}, Engine: {}, Essence: {}, Form: {} };

if(typeof window === "undefined") {
  Archonia.Essence = require('./Essence.js');
  Archonia.Form.XY = require('./Minions/XY.js').XY;
}

(function(Archonia) {

Archonia.Form.Legs = function(archon) {

  this.state = archon.state;

  this.damper = 10;
  this.damperDecay = 0.1;
  this.running = false;
  this.nextUpdate = 0;
  
  this.targetType = null;
  this.targetPosition = Archonia.Form.XY();
  this.targetVelocity = Archonia.Form.XY();
  this.targetAngle = null;
};

Archonia.Form.Legs.prototype = {
  drift: function() {
    this.running = false;
  },
  
  launch: function(maxMVelocity, maxMAcceleration) {
    this.maxMVelocity = maxMVelocity; this.maxMAcceleration = maxMAcceleration;
  },
  
  reflect: function(vertical) {
    this.running = true;
    var fromZero = Archonia.Axioms.robalizeAngle(this.state.velocity.getAngleFrom(0));
    var theta = null;
    
    if(vertical) {
      if(this.state.velocity.x > 0) {

        theta = (3 * Math.PI / 2) - fromZero;
        this.setTargetAngle(theta);

      } else  if(this.state.velocity.x < 0) {

        theta = (3 * Math.PI / 2) + fromZero;
        this.setTargetAngle(theta);

      }
    }
  },
  
  rotate: function(angle) {
    // Angle from zero, not from the world center, because
    // we're talking velocity here, not position
    var theta = this.state.velocity.getAngleTo(0);
    
    theta = Archonia.Axioms.robalizeAngle(theta) + angle;
    
    this.targetType = 'angle';
    this.running = true;
    this.targetAngle = Archonia.Axioms.computerizeAngle(theta);
  },
  
  setTargetAngle: function(a) {
    this.targetType = 'angle';
    this.running = true;
    this.targetAngle = Archonia.Axioms.computerizeAngle(a);
  },
  
  setTargetPosition: function(p, damper, damperDecay) {
    if(damper === undefined) { damper = 10; }
    if(damperDecay === undefined) { damperDecay = 0; }
    
    this.currentMVelocity = this.maxMVelocity;
    
    this.damper = damper; this.damperDecay = damperDecay;

    // Force update on next tick, in case we're in the middle of a maneuver
    this.nextUpdate = 0;

    this.targetType = 'point';
    this.running = true;
    this.targetPosition.set(p);
  },
  
  setTargetVelocity: function(v) {
    this.currentMVelocity = this.maxMVelocity;

    // Force update on next tick, in case we're in the middle of a maneuver
    this.nextUpdate = 0;

    this.targetType = 'velocity';
    this.running = true;
    this.targetVelocity.set(v);
  },
  
  stop: function() { this.running = false; this.state.velocity.set(0); },

  tick: function() {
    var p = this.state.targetPosition.get();
    if(p) {
      if(p.equals(0)) { this.drift(); }
      else { this.setTargetPosition(p); }
    }

    this.state.targetPosition.clear();
    
    if(this.running && this.state.frameCount > this.nextUpdate) {
      this.updateMotion();
      this.nextUpdate = this.state.frameCount + this.damper;
    }
  },
  
  updateMotion: function() {
    if(!this.running) { return; }
    
    this.damper -= this.damperDecay; if(this.damper < 0) { this.damper = 0; }

    var optimalDeltaV = Archonia.Form.XY();

    if(this.targetType === 'point') {
      
      // Get the target into the same frame of reference as my
      // velocity vector. To do so, we need to get the angle between 
      // my vector and the distance vector from me to the target
    
      // This is the vector from my velocity to the target position
      optimalDeltaV.set(this.targetPosition.minus(this.state.position).plus(this.state.velocity));

    } else if(this.targetType === 'angle') {
      
      this.targetVelocity = Archonia.Form.XY.fromPolar(this.maxMVelocity, this.targetAngle);
      optimalDeltaV.set(this.state.velocity.minus(this.targetVelocity));
      
    } else if(this.targetType === 'velocity') {
      
      optimalDeltaV.set(this.state.velocity.minus(this.targetVelocity));

    } else {
      Archonia.Essence.hurl(new Error("Bad target type"));
    }
    
    // The magnitude of that vector
    var optimalDeltaM = optimalDeltaV.getMagnitude();
    
    // And finally, the angle between my velocity and the
    // vector from me to the target
    var thetaToTarget = optimalDeltaV.getAngleFrom(0);
    
    // The optimal mVelocity from me to the target is, of
    // course, the magnitude of the vector, that is, a magnitude
    // that gets me there instantly. Obviously that doesn't
    // work, so I have to get there in increments based
    // on my current mVelocity -- which we always set, at
    // the beginning of each maneuver, to our maximum mVelocity,
    // and we change it only when we near the end of the
    // maneuver, to slow down so we don't end up circling
    // the target for all eternity

    // As long as our desired mVelocity is greater than our
    // current mVelocity (which we always set to max at the
    // beginning of each maneuver), we need to keep going into
    // our update
    if(optimalDeltaM > this.currentMVelocity) { this.needUpdate = true; }
    
    // The best we can do on this iteration, based on our current mVelocity
    var curtailedM = Math.min(optimalDeltaM, this.currentMVelocity);
    
    // Point me to the target with my maximum possible mVelocity
    var curtailedV = Archonia.Form.XY.fromPolar(curtailedM, thetaToTarget);

    // Now we have the best possible vector that our max mVelocity
    // will allow. But now we have to curtail it further to comply
    // with our maximum mAcceleration
    var bestDeltaV = curtailedV.minus(this.state.velocity);
    var bestDeltaM = bestDeltaV.getMagnitude();

    if(bestDeltaM > this.maxMAcceleration) {
      this.needUpdate = true;
    
      bestDeltaV.scalarMultiply(this.maxMAcceleration / bestDeltaM);
    }
    
    this.state.velocity.add(bestDeltaV);

    if(this.state.velocity.getMagnitude() > this.maxMVelocity) {
      this.state.velocity.normalize();
      this.state.velocity.scalarMultiply(this.maxMVelocity);
    }
    
    // Note: doing it this way means we're never actually setting
    // a target position, even though I've called one of the
    // functions setTargetPosition(). This way, it's more like we're
    // aiming at the target, but not bothering to aim super-carefully
    // or slow down when we get there
    if(!this.needUpdate) { this.drift(); }  // We've reached our target velocity
  }
};

})(Archonia);

if(typeof window === "undefined") {
  module.exports = Archonia.Form.Legs;
}
