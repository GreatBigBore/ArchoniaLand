/* jshint forin:false, noarg:true, noempty:true, eqeqeq:true, bitwise:true, strict:true, loopfunc:true,
	undef:true, unused:true, curly:true, browser:true, indent:false, maxerr:50, jquery:true, node:true */

/* global Phaser */

"use strict";

var Archonia = Archonia || { Axioms: {}, Cosmos: {}, Engine: {}, Essence: {}, Form: {} };
var tinycolor = tinycolor || {};

(function(Archonia) {
  
var Drone = function(archon, dronoid) {
  this.genome = Archonia.Cosmos.Genomery.makeGeneCluster(archon, "drone");

  this.state = archon.state;
  this.sensor = dronoid;
  this.avatar = dronoid.getChildAt(0);
  this.button = dronoid.getChildAt(1);

  // The actual values are set in launch
  this.optimalTempRange = new Archonia.Form.Range(0, 1);
  
  this.tweenColor = new TweenColor(this);
};

Drone.prototype = {
  decohere: function() { this.sensor.kill(); this.avatar.kill(); this.button.kill(); },
  
  launch: function(archonUniqueId, sensorScale, x, y) {
    console.log("There are " + Archonia.Cosmos.Dronery.countDrones() + " fireflies alive");
    this.sensor.archonUniqueId = archonUniqueId;
    
    this.optimalTempRange.set(this.genome.optimalTempLo, this.genome.optimalTempHi);

    this.sensor.alpha = 0;
    this.avatar.alpha = 0;
    this.button.alpha = 0;

    this.sensor.reset(x, y, 100);
    this.avatar.reset(0, 0, 100);
    this.button.reset(0, 0, 100);

    var avatarScale = 0.05;
    var buttonScale = avatarScale * 5;

    this.sensor.scale.setTo(sensorScale, sensorScale);
    this.sensor.anchor.setTo(0.5, 0.5);
    this.sensor.alpha = 1;
  
    this.avatar.scale.setTo(avatarScale, avatarScale);
    this.avatar.anchor.setTo(0.5, 0.5);
    this.avatar.alpha = 1;
  
    this.button.scale.setTo(buttonScale, buttonScale);
    this.button.anchor.setTo(0.5, 0.5);
    this.button.alpha = 1;
  },
  
  tick: function() {
    this.avatar.tint = this.genome.color;

    var temp = null, clampedTemp = null;
    
    temp = Archonia.Cosmos.TheAtmosphere.getTemperature(this.state.position);
  	clampedTemp = Archonia.Axioms.clamp(temp, this.genome.optimalTempLo, this.genome.optimalTempHi);

  	var hue = Archonia.Essence.hueRange.convertPoint(clampedTemp, this.optimalTempRange);
  	var hsl = 'hsl(' + Math.floor(hue) + ', 100%, 50%)';

    if(temp < this.genome.optimalTempLo || temp > this.genome.optimalTempHi) {
      this.tweenColor.start(hsl);
      
      this.button.tint = this.tweenColor.getColor();
      //if(this.state.archonUniqueId === 0) { console.log(this.tweenColor.hslString)}
    } else {
      this.tweenColor.stop(this);
      
    	var rgb = tinycolor(hsl).toHex();

    	this.button.tint = parseInt(rgb, 16);
    }
  }
};

var TweenColor = function(drone) {
  this.drone = drone;
  this.tweening = false;
  this.tinycolor = null;
  
  this.h = 0;
  this.s = 0;
  this.L = 0;
  
  this.tween = null;
};

TweenColor.prototype = {
  getColor: function() {
    this.hslString = "hsl(" + this.h + ", " + Math.floor(this.s) + "%, " + Math.floor(this.L) + "%)";
    return parseInt(tinycolor(this.hslString).toHex(), 16);
  },
  
  onComplete: function(_this) { _this.tweening = false; },
  
  start: function(hslString) {
    if(!this.tweening) {
      //console.log("Start with " + hslString);
      var hsl = tinycolor(hslString).toHsl();
      this.h = hsl.h; this.s = hsl.s * 100; this.L = hsl.l * 100;
      
      var c = (this.h < 120) ? 60 : 180;
      
      this.tween = Archonia.Engine.game.add.tween(this).to(
          { h: c }, 0.5 * 1000, Phaser.Easing.Sinusoidal.InOut, true, 0, -1, true
        );
  
      this.tween.onComplete.add(this.onComplete);

      this.tweening = true;
    }
  },
  
  stop: function() { if(this.tweening) { this.tween.stop(); this.tweening = false; } }
};

var spritePools = { sensors: null, avatars: null, buttons: null };

var constructDronoids = function() {
	spritePools.sensors.forEach(function(s) {
    var a = spritePools.avatars.getChildAt(0);
    var b = spritePools.buttons.getChildAt(0);

    s.addChild(a); s.addChild(b);
    s.avatar = a; s.button = b;

    s.inputEnabled = true;
    s.input.enableDrag();
    s.events.onDragStart.add(function(s) { var a = getArchonById(s.archonUniqueId); a.toggleMotion(); } );
	});
};

var getArchonById = function(id) { return Archonia.Cosmos.Archonery.getArchonById(id); };

var getDronoid = function() {
  var d = spritePools.sensors.getFirstDead();
  if(d === null) { throw new Error("No more dronoids in pool"); } else { return d; }
};

var handleOverlaps = function() {
  Archonia.Engine.game.physics.arcade.overlap(
    spritePools.sensors, Archonia.Cosmos.TheVent.sprite, Archonia.Cosmos.Archonery.senseVent
  );
};

var setupSpritePools = function() {
	var setupPool = function(whichPool) {
    var image = null;
    
    switch(whichPool) {
      case "sensors": image = Archonia.Engine.game.cache.getBitmapData("archoniaGooSensor"); break;
      case "buttons": image = Archonia.Engine.game.cache.getBitmapData("archoniaGooButton"); break;
      case "avatars": image = Archonia.Engine.game.cache.getBitmapData("archoniaGooButton"); break;
    }

		spritePools[whichPool] = Archonia.Engine.game.add.group();
	  spritePools[whichPool].createMultiple(
      Archonia.Axioms.archonPoolSize, image, 0, false
    );
	};

	setupPool('sensors');
	setupPool('avatars', 'flare');
	setupPool('buttons');

  Archonia.Engine.game.physics.enable(spritePools.sensors, Phaser.Physics.ARCADE);
};

Archonia.Cosmos.Dronery = {
  countDrones: function() { return spritePools.sensors.countLiving(); },
  getDrone: function(archon) { var dronoid = getDronoid(); return new Drone(archon, dronoid); },
  start: function() { setupSpritePools(); constructDronoids(); },
  tick: function() { handleOverlaps(); }
};

})(Archonia);

if(typeof window === "undefined") {
  module.exports = Archonia.Cosmos.Dronery;
}