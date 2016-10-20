/* jshint forin:false, noarg:true, noempty:true, eqeqeq:true, bitwise:true, strict:true, loopfunc:true,
	undef:true, unused:true, curly:true, browser:true, indent:false, maxerr:50, jquery:true, node:true */

"use strict";

var Archonia = Archonia || { Axioms: {}, Cosmos: {}, Engine: {}, Essence: {}, Form: {} };

(function(Archonia) {

  var squareSize = 30;
  var relativePositions = [
    Archonia.Form.XY(0, -squareSize), Archonia.Form.XY(squareSize, -squareSize), Archonia.Form.XY(squareSize, 0),
    Archonia.Form.XY(squareSize, squareSize), Archonia.Form.XY(0, squareSize), Archonia.Form.XY(-squareSize, squareSize),
    Archonia.Form.XY(-squareSize, 0), Archonia.Form.XY(-squareSize, -squareSize)
  ];

  var populateMovementChoices = function(theArray, ix, direction) {
    if(
      (direction < 0 && relativePositions[ix].y < 0) ||
      (direction > 0 && relativePositions[ix].y > 0)) {
        for(var i = 0; i < Math.abs(direction); i++) { theArray.push(ix); }
    } else if(Math.abs(direction) !== 3) {
      // If we're not at maximum risk, allow for some
      // possibility of going the wrong vertical direction,
      // and of course, allow horizontal movement to
      // have more weight than the wrong vertical direction
      theArray.push(ix);

      if(relativePositions[ix].y === 0) { theArray.push(ix); }
    }
  };

Archonia.Form.Head = function(archon) {
  this.archon = archon;
  this.whenToIssueNextMoveOrder = 0;
  
  this.foodSearchAnchor = Archonia.Form.XY();
  this.currentFoodTarget =  Archonia.Form.XY();
  
  this.trail = new Archonia.Form.Cbuffer(8);

  this.encysted = false;
};

Archonia.Form.Head.prototype = {
  
  doWeRemember: function(p) {
    var weRememberIt = false;
    
    if(!this.trail.isEmpty()) {
      this.trail.forEach(function(ix, value) {
        if(p.equals(value)) { weRememberIt = true; return false; }
      });
    }

    return weRememberIt;
  },
  
  drawFoodSearchMemory: function() {
    var drawDebugLines = false;
    
    if(drawDebugLines) {
      var p1 = Archonia.Form.XY(), p2 = Archonia.Form.XY();
    
      if(!this.trail.isEmpty()) {
        var hue = 0, lightness = 50;
        this.trail.forEach(function(ix, value) {
          var color = 'hsl(' + hue + ', 100%, ' + lightness + '%)';
          
          p1.set(value.plus(-squareSize / 2, -squareSize / 2));
          p2.set(value.plus(squareSize / 2, -squareSize / 2));
          Archonia.Essence.Dbitmap.aLine(p1, p2, color);
        
          p2.set(value.plus(-squareSize / 2, squareSize / 2));
          Archonia.Essence.Dbitmap.aLine(p1, p2, color);

          p1.set(value.plus(squareSize / 2, squareSize / 2));
          Archonia.Essence.Dbitmap.aLine(p2, p1, color);
        
          p2.set(value.plus(squareSize / 2, -squareSize / 2));
          Archonia.Essence.Dbitmap.aLine(p1, p2, color);
          
          hue += 30; lightness -= 5;
        });
      }
    }
    
  },

  encystIf: function() {
    
    var t = this.getCardinalTemps();

    // Further down, we check whether our hunger should override our
    // temp considerations. If it does, we still want to store a
    // temp that indicates whether we're too hot or too cold. The
    // override lets us store a temp that's at the limit of our
    // tolerance. That way, if the delta gets too big, we'll
    // be ready for it, instead of waiting around for the signal buffer
    // to fill with bad temps
    var delta = null, deltaOverride = null;
    if(this.position.y < Archonia.Engine.game.centerY) {
      delta = t.bottom - this.genome.optimalTemp;
      deltaOverride = this.tempSignalScaleHi;
    } else {
      delta = t.top - this.genome.optimalTemp;
      deltaOverride = this.tempSignalScaleLo;
    }
    
    var h = this.weighEncystmentAgainstHunger(delta);
    if(h === 0) { this.temps.store(deltaOverride); }
    else { this.temps.store(delta); }

    var weWereEncysted = this.encysted;
    
    // We might have overridden the signal strength above, if we
    // determined that hunger is more important than a sunburn
    var s = this.temps.getSignalStrength();
    if(Math.abs(s) > this.genome.encystThreshold) { this.encysted = true; }
    else if(Math.abs(s) < this.genome.unencystThreshold) { this.encysted = false; }
  
    if(this.encysted) {

      if(!weWereEncysted) { console.log(this.archon.archoniaUniqueObjectId, "encyst", s.toFixed(4)); this.archon.encyst(); }

    } else if(weWereEncysted) {

      console.log(this.archon.archoniaUniqueObjectId, "unencyst", s.toFixed(4)); this.archon.unencyst();

    }

    return this.encysted;
  },
  
  evade: function(dangerousArchonsById) {
    var stillSensingThese = [], newlySensed = [], i = null;
    
    for(i = 0; i < dangerousArchonsById.length; i++) {
      var id = dangerousArchonsById[i];
      if(this.knownArchons.indexOf(id) < 0) {
        newlySensed.push(id);
      } else {
        stillSensingThese.push(id);
      }
    }
    
    this.knownArchons = stillSensingThese.concat(newlySensed);
    
    for(i = 0; i < this.knownArchons.length; i++) {
      var d = Archonia.Cosmos.Dronery.getArchonPosition(this.knownArchons[i]);
      var a = this.position.getAngleTo(d);
      var p = Archonia.Form.XY.fromPolar(25, a);
      Archonia.Essence.Dbitmap.rLine(this.position, p, 'red');
    }
    
    return newlySensed.length === 0;
  },
  
  getCardinalTemps: function() {
    // Get hot temps from my bottom and cold temps from my
    // top. This is because if we're at the top of the world,
    // the temp reading comes from out of bounds and it's
    // cold. We get trapped at the top waiting for it to
    // warm up, even in the heat of the day. Getting the low
    // temp from my top is just for aesthetic symmetry
    return {
      top: Archonia.Cosmos.Sun.getTemperature(relativePositions[0].plus(this.position)),
      bottom: Archonia.Cosmos.Sun.getTemperature(relativePositions[4].plus(this.position))
    };
  },
  
  getSunburnPlan: function() {
    var tooHot = false, tooCold = false, delta = null;
  
    var t = this.getCardinalTemps();
  
    // Get hot temps from my bottom and cold temps from my
    // top. This is because if we're at the top of the world,
    // the temp reading comes from out of bounds and it's
    // cold. We get trapped at the top waiting for it to
    // warm up, even in the heat of the day. Getting the low
    // temp from my top is just for aesthetic symmetry
    tooHot = t.bottom > this.genome.optimalTempHi;
    tooCold = t.top < this.genome.optimalTempLo;
    
    if(tooHot) { delta = t.bottom - this.genome.optimalTemp; }
    else if(tooCold) { delta = t.top - this.genome.optimalTemp; }
    
    return this.getSunburnRisk(delta);
  },
  
  getSunburnRisk: function(tempDelta) {
    // M = 1 means we're within optimal limits
    // M = 2 means we're outside optimal limits
    // M = 3 means we've pegged the signal processor
    var magnitude = null;
    if(tempDelta < this.tempSignalScaleLo || tempDelta > this.tempSignalScaleHi) { magnitude = 3; }
    else if(tempDelta < this.genome.optimalTempLo || tempDelta > this.genome.optimalTempHi) { magnitude = 2; }
    else { magnitude = 1; }
    
    return Math.sign(tempDelta) * magnitude;
  },
  
  hungryEnoughForSunburn: function(tempDelta) {
    return Math.abs(tempDelta) * this.genome.tempToleranceFactor < this.archon.goo.howHungryAmI();
  },
  
  launch: function(genome, legs, position) {
    this.archoniaUniqueObjectId = Archonia.Essence.archoniaUniqueObjectId++;

    this.genome = genome;
    this.legs = legs;
    this.position = position;
    this.firstTickAfterLaunch = true;
    this.knownArchons = [];
    this.headedForPrey = false;
    this.diningOnPrey = false;
    this.currentPrey = null;

    this.howLongBetweenMoves = 2 * this.genome.maxMVelocity;
    
    this.tempSignalScaleLo = this.genome.optimalTempLo - this.genome.tempRadius;
    this.tempSignalScaleHi = this.genome.optimalTempHi + this.genome.tempRadius;

    this.temps = new Archonia.Form.SignalSmoother(
      Math.floor(this.genome.tempSignalBufferSize), this.genome.tempSignalDecayRate,
      this.tempSignalScaleLo, this.tempSignalScaleHi
    );
  },
  
  prey: function(tastyArchonId) {
    var a = Archonia.Cosmos.Dronery.getArchonById(tastyArchonId);
    Archonia.Essence.Dbitmap.aLine(this.position, a.position, 'red');
    
    if(tastyArchonId !== this.currentPrey) {
      this.diningOnPrey = false; this.headedForPrey = false; this.currentPrey = tastyArchonId;
    }
    
    if(!this.diningOnPrey) {
      if(Archonia.Engine.game.physics.arcade.overlap(
        this.archon.sprite, a.sprite, null, null, this)) {
        this.legs.stop();
        this.archon.goo.eat(a);
        this.diningOnPrey = true;
      } else {
        if(!this.headedForPrey) {
          this.headedForPrey = true;
          this.legs.setTargetPosition(a.position, 0, 0);
        }
      }
    }
  },
  
  seekFood: function(restart) {
    var bestChoices = [], fallbacks = [], h = null, i = null, p = null;
    
    if(restart) { this.trail.reset(); this.foodSearchAnchor.set(this.position); }
    
    h = this.getSunburnPlan();
    
    for(i = 0; i < 8; i++) {
      p = relativePositions[i].plus(this.foodSearchAnchor);
      
      if(p.isInBounds()) {
        // If we can't find an old spot that we've forgotten,
        // we'll just take one that's in bounds
        fallbacks.push(Archonia.Form.XY(p));
        
        if(!this.doWeRemember(p)) { populateMovementChoices(bestChoices, i, h); }
      }
    }
    
    if(bestChoices.length > 0) {
      i = Archonia.Axioms.integerInRange(0, bestChoices.length);
      p = relativePositions[bestChoices[i]].plus(this.foodSearchAnchor);
    } else {
      i = Archonia.Axioms.integerInRange(0, fallbacks.length);
      p = fallbacks[i];
    }
  
    // This is where we're aiming; remember it so when we come back
    // into the move function, we can calculate our next move based on
    // where we intended to be, rather than where the legs might have put
    // us -- the legs don't typically get us to the specific target
    this.foodSearchAnchor.set(p);
  
    this.legs.setTargetPosition(p);
    
    this.trail.store(p);
  },
  
  standardMove: function(foodTarget) {
    var weWereEncysted = this.encysted;
    var foodIsInSight = !foodTarget.equals(0);
    var weWereEating = !this.currentFoodTarget.equals(0);

    if(!foodIsInSight) { this.currentFoodTarget.set(0); }
    
    if(!this.encysted && foodIsInSight) {
      if(!this.currentFoodTarget.equals(foodTarget)) {
        this.currentFoodTarget.set(foodTarget);
        this.legs.setTargetPosition(this.currentFoodTarget, 0, 0);
      }

      var drawDebugLines = false;
      if(drawDebugLines) {
        Archonia.Essence.Dbitmap.aLine(this.position, foodTarget, 'red');
      }
    }
    
    if((weWereEating && !foodIsInSight) || this.frameCount > this.whenToIssueNextMoveOrder) {
      var encysted = this.encystIf();
      
      if(!encysted && !foodIsInSight) {
        var restartFoodSearch = weWereEncysted || weWereEating || this.firstTickAfterLaunch;
        this.seekFood(restartFoodSearch);
      }

      this.whenToIssueNextMoveOrder = this.frameCount + this.howLongBetweenMoves;
    }

    // Do this at the end, after the food search has had a
    // chance to reset its trail, so I don't see a flicker --
    // I think, at least, that I'd see a flicker if we saw
    // that there is no food in sight but had not let the
    // seeker reset the trail
    if(!foodIsInSight) { this.drawFoodSearchMemory(); }

  },
  
  tick: function(frameCount, foodTarget, dangerousArchons, tastyArchonId) {
    this.frameCount = frameCount;
    
    if(tastyArchonId === null) {
      this.standardMove(foodTarget);
    } else {
      this.prey(tastyArchonId);
    }
    
    this.firstTickAfterLaunch = false;
  },
  
  weighEncystmentAgainstHunger: function(tempDelta) {
    if(tempDelta === null) {
      return 0;
    } else if(this.hungryEnoughForSunburn(tempDelta)) {
      // If my genes tell me my current hunger level is higher than
      // my need for good weather, then get out there and find some 
      return 0;
    } else {
      return Math.sign(tempDelta);
    }
  }
};

})(Archonia);
