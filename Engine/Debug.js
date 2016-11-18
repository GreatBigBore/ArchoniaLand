/* jshint forin:false, noarg:true, noempty:true, eqeqeq:true, bitwise:true, strict:true, loopfunc:true,
  undef:true, unused:true, curly:true, browser:true, indent:false, maxerr:50, jquery:true, node:true */

"use strict";

var Archonia = Archonia || { Axioms: {}, Cosmos: {}, Engine: {}, Essence: {}, Form: {} };

(function(Archonia) {
  
  var Debug = function() {
    this.bm = Archonia.Engine.game.debug.bitmap;
    this.ctx = Archonia.Engine.game.debug.context;
    
  };
  
  Debug.prototype = {
    
    aLine: function(from, to, style, width) {
      Archonia.Engine.game.debug.text("Debugging", 25, 25);

      if(style === undefined) { style = 'white'; }
      if(width === undefined) { width = 1; }
      
      this.ctx.strokeStyle = style; this.ctx.lineWidth = width;

      this.ctx.beginPath(); this.ctx.moveTo(from.x, from.y); this.ctx.lineTo(to.x, to.y); this.ctx.stroke();
    },
    
    rLine: function(from, to, style, width) {
      this.aLine(from, to.plus(from), style, width);
    },
    
    text: function(text, where) {
      Archonia.Engine.game.debug.text(text, where.x, where.y);
    }
    
  };
  
  Archonia.Engine.Debug = { start: function() { Archonia.Engine.Debug = new Debug(); } };

})(Archonia);
