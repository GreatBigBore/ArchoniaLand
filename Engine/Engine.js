/* jshint forin:false, noarg:true, noempty:true, eqeqeq:true, bitwise:true, strict:true, loopfunc:true,
	undef:true, unused:true, curly:true, browser:true, indent:false, maxerr:50, jquery:true, node:true */

/* global Phaser */

"use strict";

var Archonia = Archonia || { Axioms: {}, Cosmos: {}, Engine: {}, Essence: {}, Form: {} };

(function(Archonia) {
  
  var frameCount = 0;

  Archonia.Engine = {
    mouseUp: true,
    
    create: function() {
      Archonia.Essence.archoniaUniqueObjectId = 0;
      
      Archonia.Engine.game.physics.startSystem(Phaser.Physics.ARCADE);

      Archonia.Engine.cursors = Archonia.Engine.game.input.keyboard.createCursorKeys();
      Archonia.Engine.game.input.onUp.add(Archonia.Engine.onMouseUp, Archonia.Engine);
      Archonia.Engine.game.input.onDown.add(Archonia.Engine.onMouseDown, Archonia.Engine);
      
      Archonia.Engine.letThereBeALoggingMechanism();
      Archonia.Engine.letThereBeRanges();
      Archonia.Engine.letThereBeBitmaps();
      Archonia.Engine.letThereBeElements();
      Archonia.Engine.letThereBeLivingThings();
    },

    handleClick: function(/*pointer*/) {
      Archonia.Cosmos.barf = true;
    },
    
    letThereBeALoggingMechanism: function() {
      Archonia.Essence.Logger.initialize(1000);
      Archonia.Essence.renderSchedule = [];
    },
    
    letThereBeBitmaps: function() {
      Archonia.Engine.TheBitmapFactory.start();
      Archonia.Cosmos.Sea = Archonia.Engine.TheBitmapFactory.makeBitmap('archoniaSea');
      Archonia.Cosmos.Seasons = Archonia.Engine.TheBitmapFactory.makeBitmap('archoniaSeasons');
      Archonia.Engine.Goo = Archonia.Engine.TheBitmapFactory.makeBitmap('archoniaGooArchonia');
      Archonia.Engine.SensorGoo = Archonia.Engine.TheBitmapFactory.makeBitmap('archoniaGooButton');
      Archonia.Engine.SensorGoo = Archonia.Engine.TheBitmapFactory.makeBitmap('archoniaGooSensor');
      Archonia.Engine.SensorGoo = Archonia.Engine.TheBitmapFactory.makeBitmap('archoniaGooVent');
      Archonia.Engine.Dbitmap = Archonia.Engine.TheBitmapFactory.makeBitmap('debug');
    },
    
    letThereBeElements: function() {
      Archonia.Cosmos.TheSun.ignite();
      Archonia.Cosmos.TheAtmosphere.breathe();
    },
    
    letThereBeLivingThings: function() {
      Archonia.Cosmos.Genomery.start();
      Archonia.Cosmos.FamilyTree = new Archonia.Cosmos.FamilyTree();
      Archonia.Cosmos.TheVent.start();
      Archonia.Cosmos.Archonery.start();
    },
    
    letThereBeRanges: function() {
      Archonia.Essence.archonMassRange = new Archonia.Form.Range(0, 10);
      Archonia.Essence.archonTolerableTempRange = new Archonia.Form.Range(50, 200);
      Archonia.Essence.archonSizeRange = new Archonia.Form.Range(0.07, 0.125);
      Archonia.Essence.hueRange = new Archonia.Form.Range(240, 0);	// Blue (240) is cold/small range, Red (0) is hot/large range
      Archonia.Essence.darknessRange = new Archonia.Form.Range(Archonia.Axioms.darknessAlphaHi, Archonia.Axioms.darknessAlphaLo);
      Archonia.Essence.oneToZeroRange = new Archonia.Form.Range(1, 0);
      Archonia.Essence.worldTemperatureRange = new Archonia.Form.Range(Archonia.Axioms.temperatureLo, Archonia.Axioms.temperatureHi);
      Archonia.Essence.yAxisRange = new Archonia.Form.Range(Archonia.Axioms.gameHeight, 0);
      Archonia.Essence.zeroToOneRange = new Archonia.Form.Range(0, 1);
      Archonia.Essence.centeredZeroRange = new Archonia.Form.Range(-1, 1);
      Archonia.Essence.gameDistanceRange = new Archonia.Form.Range(0, Archonia.Axioms.gameHypoteneuse);
    },
    
    onMouseDown: function(/*pointer*/) {
      Archonia.Engine.mouseUp = false;
    },

    onMouseUp: function(pointer) {
      if(!Archonia.Engine.mouseUp) { Archonia.Engine.mouseUp = true; Archonia.Engine.handleClick(pointer); }
    },

    preload: function() {
      Archonia.Engine.game.load.image('shelter', 'assets/shelter.png');
      Archonia.Engine.game.load.image('toothy', 'assets/toothy.png');
      Archonia.Engine.game.load.image('vent', 'assets/urchin.png');
      Archonia.Engine.game.load.image('floor', 'assets/floor4.png');
      Archonia.Engine.game.load.image('flare', 'assets/flare.png');
    },
    
    render: function() {
      for(var i = 0; i < Archonia.Essence.renderSchedule.length; i++) {
        var c = Archonia.Engine.game.debug.context;
        var s = Archonia.Essence.renderSchedule[i];
        
        switch(s.what) {
        case "line":
          c.strokeStyle = s.strokeStyle; c.lineWidth = s.lineWidth;
          c.beginPath(); c.moveTo(s.from.x, s.from.y); c.lineTo(s.to.x, s.to.y); c.stroke();
          break;

        case "cSquare":
          c.strokeStyle = s.strokeStyle; c.lineWidth = s.lineWidth;
          c.beginPath(); c.rect(s.ul.x, s.ul.y, s.dimension, s.dimension); c.stroke();
          break;

        case "rectangle":
          c.fillStyle = s.fillStyle;
          c.fillRect(s.topLeft.x, s.topLeft.y, s.widthHeight.x, s.widthHeight.y);
          break;
        }
      }
    },
    
    start: function() {
      Archonia.Engine.game = new Phaser.Game(Archonia.Axioms.gameWidth, Archonia.Axioms.gameHeight, Phaser.WEBGL);

      Archonia.Engine.game.state.add('Archonia', Archonia.Engine, false);
      Archonia.Engine.game.state.add('Extinction', { create: function() { console.log("They're all dead, and you're a terrible person"); } }, false);

      Archonia.Engine.game.state.start('Archonia');
    },
    
    update: function() {
      frameCount++;
      
      try {
        Archonia.Engine.Dbitmap.bm.clear();
      
        Archonia.Cosmos.Archonery.tick();
        Archonia.Cosmos.TheVent.tick();
      } catch(e) { console.log(e.stack); debugger; }  // jshint ignore: line
    }
    
  };
  
})(Archonia);

if(typeof window === "undefined") {

  module.exports = Archonia.Engine;

} else {
  
  window.onload = function() { Archonia.Engine.start(); };

}
