/* jshint forin:false, noarg:true, noempty:true, eqeqeq:true, bitwise:true, strict:true, loopfunc:true,
	undef:true, unused:true, curly:true, browser:true, indent:false, maxerr:50, jquery:true, node:true */

"use strict";

var Archonia = Archonia || { Axioms: {}, Cosmos: {}, Engine: {}, Essence: {}, Form: {} };

(function(Archonia) {

var archonUniqueId = 0;
var archonPool = [];

var breed = function(parent) {
  var archon = getArchon();

  try { launchArchon(archon, parent); }
  catch(e) {
    if(e instanceof Archonia.Essence.BirthDefect) {
      console.log("Birth defect: " + e.message); archon.die();
    } else {
      Archonia.Essence.hurl(e);
    }
  }
};

var getArchon = function() {
  var archon = null;
  
  for(var i = 0; i < archonPool.length; i++) {
    var a = archonPool[i];
    if(a.available) { archon = a; break; }
  }
  
  if(archon === null) {
    archon = new Archonia.Form.Archon();
    archonPool.push(archon);
  }
  
  return archon;
};

var getArchonById = function(archonId) {
  var archon = archonPool.find(function(e) {
    return e.state.archonUniqueId === archonId;
  });
  
  return archon;
};

var launchArchon = function(archon, parent) {
  archon.state.archonUniqueId = archonUniqueId++; archon.launch(parent);
};

Archonia.Cosmos.Archonery = {
  acceptSoul: function(archonUniqueId) {
    getArchonById(archonUniqueId).die();
  },
  
  breed: function(parentId) { var p = getArchonById(parentId); breed(p); },
  
  feed: function(/*diner*/) { console.log("feed"); },
  
  getArchonById: function(id) { return getArchonById(id); },
  
  start: function() {
    Archonia.Cosmos.momentOfCreation = true;

    Archonia.Cosmos.Dronery.start();
    for(var i = 0; i < Archonia.Axioms.archonCount; i++) { breed(); }

    Archonia.Cosmos.momentOfCreation = false;
  },
  
  tick: function() {
    Archonia.Cosmos.Dronery.tick();
    for(var i = 0; i < archonPool.length; i++) { if(archonPool[i].hasLaunched) { archonPool[i].tick(); } }
  }
};

})(Archonia);
