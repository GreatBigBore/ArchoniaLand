/* jshint forin:false, noarg:true, noempty:true, eqeqeq:true, bitwise:true, strict:true, loopfunc:true,
	undef:true, unused:true, curly:true, browser:true, indent:false, maxerr:50, jquery:true, node:true */

"use strict";

var Archonia = Archonia || { Axioms: {}, Cosmos: {}, Engine: {}, Essence: {}, Form: {} };

if(module !== undefined) {
    Archonia.Essence = require('./Essence.js');
}

(function(Archonia) {

Archonia.Form.FamilyTree = function() {
  this.everyone = {
    'god': { parentId: 'none', myChildren: [] }
  };
};

Archonia.Form.FamilyTree.prototype = {
  addMe: function(myId, idOfMyParent) {
    if(myId === undefined || idOfMyParent === undefined) {
        throw new Archonia.Essence.BirthDefect("IDs missing");
    }
    
    if(!this.everyone.hasOwnProperty(idOfMyParent)) {
      throw new Error("Parent unknown");
    }
    
    if(this.everyone.hasOwnProperty(myId)) {
      throw new Error("Child already in roster");
    }

    // Add me to the roster of everyone who ever lived
    this.everyone[myId] = { myId: myId, parentId: idOfMyParent, myChildren: [] };
    
    // Add me to my parent's list of children
    this.everyone[idOfMyParent].myChildren.push(myId);
  },
  
  getDegreeOfRelatedness: function(lhs, rhs) {
    var lhsAncestry  = [], rhsAncestry = [], i = null, commonAncestor = null, relatedness = null;
    
    for(i = lhs; i !== 'none'; i = this.everyone[i].parentId) { lhsAncestry.push(i); }
    for(i = rhs; i !== 'none'; i = this.everyone[i].parentId) { rhsAncestry.push(i); }
    
    for(i = 0; i < lhsAncestry.length; i++) {
        commonAncestor = rhsAncestry.indexOf(lhsAncestry[i]);
        if(commonAncestor !== -1) { break; }
    }
    
    if(commonAncestor === -1 || commonAncestor === null) {
        throw new Error("Couldn't find common ancestor for " + lhs + " and " + rhs);
    }
    
    return i + commonAncestor;
  },
  
  getLineage: function(myId) {
    var currentId = myId;
    var lineage = [];

    do {
      currentId = this.everyone[currentId].parentId;
      lineage.push(currentId);
      
    } while(currentId !== 'god');
    
    return lineage;
  }
};
  
})(Archonia);

if(module !== undefined) {
    module.exports = Archonia.Form.FamilyTree;
}