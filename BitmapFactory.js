/* jshint forin:false, noarg:true, noempty:true, eqeqeq:true, bitwise:true, strict:true, loopfunc:true,
	undef:true, unused:true, curly:true, browser:true, indent:false, maxerr:50, jquery:true, node:true */

"use strict";

var Archonia = Archonia || { Axioms: {}, Cosmos: {}, Engine: {}, Essence: {}, Form: {} };

if(typeof window === "undefined") {
  var Phaser = require('./test/support/Phaser.js');
  Archonia.Engine.game = new Phaser.Game();
  
  Archonia.Axioms = require('./Axioms.js');
}

(function(Archonia) {
  
  Archonia.Essence.Bitmap = function(bm) {
    this.bm = bm;
    this.cx = bm.ctx;
  };
  
  Archonia.Essence.Bitmap.prototype = {
    aLine: function(from, to, style, width) {
      if(style === undefined) { style = 'rgb(255, 255, 255)'; }
      if(width === undefined) { width = 1; }

      this.cx.strokeStyle = style;
      this.cx.lineWidth = width;

      this.cx.beginPath();
      this.cx.moveTo(from.x, from.y);
      this.cx.lineTo(to.x, to.y);
      this.cx.stroke();
    },
    
    cSquare: function(center, dimension, style, width) {
      var ul = center.minus(dimension / 2, dimension / 2);
      
      this.cx.strokeStyle = style;
      this.cx.lineWidth = width;

      this.cx.beginPath();
      this.cx.rect(ul.x, ul.y, dimension, dimension);
      this.cx.stroke();
    },
  
    rLine: function(from, relativeTo, style, width) {
      this.aLine(from, relativeTo.plus(from), style, width);
    }
  };
  
  Archonia.Essence.BitmapFactory = {
    
    archoniaVent: function() {
      var bm = Archonia.Engine.game.add.bitmapData(100, 100);
      var cx = bm.context;

      var g = cx.createRadialGradient(50, 50, 1, 50, 50, 50);

      g.addColorStop(0.00, 'hsla(0, 0%, 0%, 0)');
      g.addColorStop(1.00, 'hsla(0, 0%, 0%, 1)');

      cx.fillStyle = g;
      bm.circle(50, 50, 50);

      bm.update();
      Archonia.Engine.game.cache.addBitmapData('archoniaVent', bm);
    
      return new Archonia.Essence.Bitmap(bm);
    },
    
    archoniaSea: function() {
      var bm = Archonia.Engine.game.add.bitmapData(Archonia.Axioms.gameWidth, Archonia.Axioms.gameHeight);
      
      bm.draw('floor', 0, 0, 1600, 1600);
    
      return new Archonia.Essence.Bitmap(bm);
    },
  
    archoniaSeasons: function() {
      var bm = Archonia.Engine.game.add.bitmapData(Archonia.Axioms.gameWidth, Archonia.Axioms.gameHeight);
      var cx = bm.context;

      cx.fillStyle = 'white';
      cx.fillRect(0, 0, Archonia.Axioms.gameWidth, Archonia.Axioms.gameHeight);

      Archonia.Engine.game.cache.addBitmapData('archoniaSeasons', bm);
    
      return new Archonia.Essence.Bitmap(bm);
    },
  
    archoniaGoo: function() {
      var bm = Archonia.Engine.game.add.bitmapData(Archonia.Axioms.archoniaGooDiameter, Archonia.Axioms.archoniaGooDiameter);
      var cx = bm.context;

      cx.beginPath();

      bm.circle(
        Archonia.Axioms.archoniaGooRadius, Archonia.Axioms.archoniaGooRadius,
        Archonia.Axioms.archoniaGooRadius, 'rgba(255, 255, 255, 1)'
      );

      cx.fill();
      
      Archonia.Engine.game.cache.addBitmapData('archoniaGoo', bm);
    
      return new Archonia.Essence.Bitmap(bm);
    },
  
    archoniaSensorGoo: function() {
      var bm = Archonia.Engine.game.add.bitmapData(Archonia.Axioms.archoniaGooDiameter, Archonia.Axioms.archoniaGooDiameter);
      var cx = bm.context;

      cx.beginPath();

      bm.circle(
        Archonia.Axioms.archoniaGooRadius, Archonia.Axioms.archoniaGooRadius,
        Archonia.Axioms.archoniaGooRadius, 'hsla(240, 100%, 50%, 0.01)'
      );

      cx.fill();

      Archonia.Engine.game.cache.addBitmapData('archoniaSensorGoo', bm);
    
      return new Archonia.Essence.Bitmap(bm);
    },
  
    debug: function() {
      var bm = Archonia.Engine.game.add.bitmapData(Archonia.Axioms.gameWidth, Archonia.Axioms.gameHeight);
      var cx = bm.context;

      cx.fillStyle = 'rgba(255, 255, 255, 1)';
      cx.strokeStyle = 'rgba(255, 255, 255, 1)';

      Archonia.Engine.game.add.image(0, 0, bm);

      return new Archonia.Essence.Bitmap(bm);
    },
    
    makeBitmap: function(type) {
      return Archonia.Essence.BitmapFactory[type]();
    }
    
  };
})(Archonia);

if(typeof window === "undefined") {
  module.exports = Archonia.Essence.BitmapFactory;
}
