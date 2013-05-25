// The Grid component allows an element to be located
//  on a grid of tiles
Crafty.c('Grid', {
  init: function() {
    this.attr({
      w: Game.map_grid.tile.width,
      h: Game.map_grid.tile.height
    })
  },
  // Locate this entity at the given position on the grid
  at: function(x, y) {
    if (x === undefined && y === undefined) {
      return { x: this.x/Game.map_grid.tile.width, y: this.y/Game.map_grid.tile.height }
    } else {
      this.attr({ x: x * Game.map_grid.tile.width, y: y * Game.map_grid.tile.height });
      return this;
    }
  }
});

// An "Actor" is an entity that is drawn in 2D on canvas
// via our logical coordinate grid
Crafty.c('Actor', {
  init: function() {
    this.requires('2D, Canvas, Grid');
  },
});

Crafty.c('Water', {

  waterLevel: 4,

  init: function() {
    this.requires('Actor, Color')
      .color('rgba(0,0,255,.7)');
  },

  // Level 4 is the default, and the entire block is water
  // Level 0 is no water what so ever
  // Scales linearly inbetween
  setLevel: function(_level) {
    this.waterLevel = _level;
    Crafty.e('Block').at(0,0)
      .setP(this.x, this.y + (this.waterLevel * this.h / 4));
    return this;
  }
});

Crafty.c('Block', {
  init: function() {
    this.requires('Actor, Color')
      .color('#ADA96E');
  },

  setP: function(_x,_y) {
    this.x = _x;
    this.y = _y;
  }
});

Crafty.c('Cloud', {

  // variables
  wind: 0,

  init: function() {
    this.requires('Actor, Color')
      .color('#CCCCCC')
      // make rain
      .bind('EnterFrame', function() {
        if(Math.random() < 0.1){
          var x = this.x + Math.random()*(this.w - Game.map_grid.tile.width/8); // subtract width of rain droplet
          var y = this.y + this.h + 1; // start the rain slightly below the cloud, doesn't really matter since it can't collide with it anyway
          Crafty.e('RainDroplet')
            .initP(x,y)
            .initV(wind,10);
        }
      });
  },

  setWind: function(_wind) {
    wind = _wind;
  }
});

function overlap(lower1, upper1, lower2, upper2) {
  return Math.max(lower1, lower2) < Math.min(upper1, upper2);
}

Crafty.c('Movable', {
  init: function() {
    this.requires('Actor')
      .attr( { _movement: { x: 0, y: 0} });
  },

  // attributes
  gravity: 0.2,

  move: function() {
    return this.bind('EnterFrame', function() {
      this.x += this._movement.x;
      this.y += this._movement.y;
      this._movement.y += this.gravity;
    });
  },

  stopOn: function(what, entity) {
    return this.onHit(what, function(them) {

      // first check all x...
      this.y -= this._movement.y - 0.01;
      for(var i = 0; i < them.length; i++) {
        if (entity !== undefined && them[i].obj != entity) 
          continue;
        if (this.intersect(them[i].obj.x, them[i].obj.y, them[i].obj.w, them[i].obj.h)) {
          this.x -= this._movement.x;
          this._movement.x = 0;
        /* Got rid of this, so character doesn't bounce to the side of things anymore
         * I have not seen any bugs so far
          if (this.x < them[i].obj.x) {
            this.x = them[i].obj.x - this.w;
          } else {
            this.x = them[i].obj.x + them[i].obj.w;
          }
        */
        }
      }
      this.y += this._movement.y - 0.01;

      var yMoving = (this._movement.y > 6) && !this._can_jump;
      var yVel = this._movement.y;
      var makeASplash = 0;
      for(var i = 0; i < them.length; i++) {
        if (entity !== undefined && them[i].obj != entity)
          continue;
        if (this.intersect(them[i].obj.x, them[i].obj.y, them[i].obj.w, them[i].obj.h)) {
          // case land on the ground
          if (this.y < them[i].obj.y) {
            this._can_jump = true;
            this.y = them[i].obj.y - this.h;
            if(yMoving)
              makeASplash = 1;
          // case hit your head on the roof
          } else {
            this.y = them[i].obj.y + them[i].obj.h;
          }
          this._movement.y = 0;
        }
      }
      if(makeASplash)
        this.trigger('stopCallback', yVel);
    });
  }
});

Crafty.c('Twoway2000', {

  // attributes:
  speed: 8, // when push left and right how many pixels per frame to move
  jump_speed: 10, // how many pixels per frame up should we go

  init: function() {
    this.requires('Movable').
      attr( {
        _can_jump: true
      });
  },

  twoway2000: function(left, right, jump, splash) {
    return this.bind('EnterFrame', function() {
      if (!!Crafty.keydown[left]) {
        this._movement.x = -this.speed;
      }
      if (!!Crafty.keydown[right]) {
        this._movement.x = this.speed;
      }
      if (!!Crafty.keydown[splash]) {
        if(!this._can_jump)
          this._movement.y = 64;
      }
      if (!Crafty.keydown[left] && !Crafty.keydown[right]) {
        this._movement.x = 0;
      }
      if (this._movement.y) {
        this._can_jump = false;
      }
    }).bind('KeyDown', function(e) {
      if (e.key == jump) {
        if (this._can_jump) {
          this._can_jump = false;
          this._movement.y -= this.jump_speed;
        }
      }
    }).move()
    .stopOn('Block')
    // .stopOn('Dude'); // Commented out to prevent one player standing on another and blocking them from
    // playing
  },
});

var MAX_HEALTH = 2000;
var DRIP_RATE = 10*MAX_HEALTH;
Crafty.c('Dude', {

  // attributes:
  id: null,
  health: MAX_HEALTH,
  dripCounter: 0,

  init: function() {
    this.count=0;
    this
      .requires('Actor')
      .attr({w: Game.map_grid.tile.width, h: Game.map_grid.tile.height * 2})
      .requires('Twoway2000, Color, Collision')
      .color('#817679')
      .bind('stopCallback', function(yVel){
        console.log('detectEnterWater');
        if(this.hit('Water').length > 0){
          this.detectEnterWater(yVel);
        }
      })
      .bind('EnterFrame', function(){ 
        this.dripCounter += MAX_HEALTH - this.health;
        if(this.dripCounter >= DRIP_RATE){
          this.dripCounter -= DRIP_RATE;
          var x = this.x + Math.random()*(this.w - Game.map_grid.tile.width/8); // subtract width of water droplet
          var y = this.y + Math.random()*Math.random()*this.h; // favour generating at the top, IMO better effect
          Crafty.e('WaterDroplet')
            .initP(x,y)
            .initV(0,0);
        }
      });
  },

  detectEnterWater: function(yVel) {
    puddles = this.hit('Water');
    var shallowestPool = 5;
    for(var i=0; i<puddles.length; ++i)
      // there should be a better way to test if the object is 'Water'
      if(puddles[i].obj.waterLevel !== undefined){
        console.log('depth = ', puddles[i].obj.waterLevel);
        if(puddles[i].obj.waterLevel < shallowestPool)
          shallowestPool = puddles[i].obj.waterLevel;
      }
    if(shallowestPool !== 5)
      console.log('shallowestPool = ', shallowestPool);
    if(shallowestPool < 5)
      this.makeSplashs(shallowestPool, yVel);
  },

  makeSplashs: function(shallowestPool, yVel) {
    for(var i=0; i<shallowestPool; ++i){
      // only if the player pressed the make splash button to accelerate downwards rapidly
      Crafty.e('Splash')
        .initP(this.x+this.w/2, this.y+this.h-32)
        .initV((-7-i)*(yVel+60)/120, (-7-i)*(yVel+60)/120)
        .setCreator(this.id);
      Crafty.e('Splash')
        .initP(this.x+this.w/2, this.y+this.h-32)
        .initV((7+i)*(yVel+60)/120, (-7-i)*(yVel+60)/120)
        .setCreator(this.id);
    }
  },

  setId: function(name) {
    this.id = name;
    return this;
  },

  dealDamage: function(damage) {
    if(!Game.gameOver){
      this.health -= damage;
      if(this.health <= 0){
        Game.gameOver = true;
        this.color('#0000ff');
      }
    }
  },

});

Crafty.c('Splash', {

  // attributes:
  DAMAGE_TO_PLAYER: 100,
  gravity: 0.2,
  creator: null,

  init: function() {
    this.requires('Actor')
      .attr({w: Game.map_grid.tile.width/4, h: Game.map_grid.tile.height/4});
    this.requires('Color, Collision, Movable')
      .color('#0000ff')
      .onHit('Block', function(){ return this.destroy(); })
      .onHit('Dude', function(objs) {
        for(var i=0; i<objs.length; ++i)
          if(objs[i].obj.id != this.creator){
            objs[i].obj.dealDamage(this.DAMAGE_TO_PLAYER);
            this.destroy();
          }
      })
      .move().attr({ _movement: {x: 0, y: 0}, gravity: 0.2 });
  },

  setCreator: function(_creator){
    this.creator = _creator;
  },

  initP: function(_x, _y){
    this.x = _x;
    this.y = _y;
    return this;
  },

  initV: function(_x, _y){
    if(this._movement){
      this._movement.x = _x;
      this._movement.y = _y;
    }
    return this;
  }

});

Crafty.c('WaterDroplet', {

  // attributes
  gravity: 0.2,

  init: function() {
    this.requires('Actor')
      .attr({w: Game.map_grid.tile.width/8, h: Game.map_grid.tile.height/8});
    this.requires('Color, Collision, Movable')
      .color('#0000ff')
      .onHit('Block', function(){ return this.destroy(); })
      .move().attr({ _movement: {x: 0, y: 0}, gravity: 0.2 });
  },

  initP: function(_x, _y){
    this.x = _x;
    this.y = _y;
    return this;
  },

  initV: function(_x, _y){
    if(this._movement){
      this._movement.x = _x;
      this._movement.y = _y;
    }
    return this;
  }

});

Crafty.c('RainDroplet', {

  // attributes
  DAMAGE_TO_PLAYER: 5,
  gravity: 0.0, // my preference is for this to not have gravity, to move uniformly, feel free to change

  init: function() {
    this.requires('Actor')
      .attr({w: Game.map_grid.tile.width/8, h: Game.map_grid.tile.height/8});
    this.requires('Color, Collision, Movable')
      .color('#0000ff')
      .onHit('Block', function(){ return this.destroy(); })
      .onHit('Water', function(){ return this.destroy(); })
      .onHit('Dude', function(objs) {
        for(var i=0; i<objs.length; ++i){
          objs[i].obj.dealDamage(this.DAMAGE_TO_PLAYER);
          this.destroy();
        }
      })
      .move().attr({ _movement: {x: 0, y: 0}, gravity: 0.0 }); // my preference is for this to not have gravity, to move uniformly, feel free to change
  },

  initP: function(_x, _y){
    this.x = _x;
    this.y = _y;
    return this;
  },

  initV: function(_x, _y){
    if(this._movement){
      this._movement.x = _x;
      this._movement.y = _y;
    }
    return this;
  }

});


