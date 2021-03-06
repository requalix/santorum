Crafty.sprite(64,"assets/character1_spritemap.png",{p1right:[0,0,1,2],p1left:[1,0,1,2]});
Crafty.sprite(64,"assets/character2_spritemap.png",{p2right:[0,0,1,2],p2left:[1,0,1,2]});
Crafty.sprite(64,"assets/groundmap.png",{
  lgrass: [0,0],
  mgrass: [1,0],
  rgrass: [2,0],
  ground: [3,0]
});
Crafty.sprite(32,"assets/umbrella.png",{umbrella:[0,0,3,1]});
Crafty.sprite(32,"assets/water_pistol_spritemap.png",{rightgun:[0,0,3,1],leftgun:[3,0,3,1]});
Crafty.sprite(32,"assets/boots.png", {leftboots:[0,0,3,2],rightboots:[3,0,3,2]});

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
    this.requires('Actor, Color, mgrass')
      .color('rgba(0,0,0,0)');
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
        if(Math.random() < 0.05){
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
  gravity: 0.4,

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
  jump_speed: 14, // how many pixels per frame up should we go

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
        if(!this._can_jump && this._movement.y > -this.jump_speed*3/4)
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
		  Crafty.audio.play("jump");
          this._can_jump = false;
          this._movement.y -= this.jump_speed;
        }
      }
    }).move()
    .stopOn('Block')
    .stopOn('Dude'); // Commented out to prevent one player standing on another and blocking them from playing
  },
});

var MAX_HEALTH = 4000;
var DRIP_RATE = 2*MAX_HEALTH;
var SPLASH_DAMAGE = 100; // damage caused by being hit by a splash
var dudes = [];
Crafty.c('Dude', {

  // attributes:
  id: null,
  health: MAX_HEALTH,
  dripCounter: 0,
  _hasBoots: false,

  init: function() {
    dudes.push(this);
    this.count=0;
/*
    Crafty.e('HealthBar')
      .setCreator(this);
*/
    this
      .requires('Actor')
      .attr({w: Game.map_grid.tile.width, h: Game.map_grid.tile.height * 2, z: -2})
      .requires('Twoway2000, Color, Collision')
      .color('rgba(0,0,0,0)')
      .bind('stopCallback', function(yVel){
        if(this.hit('Water').length > 0){
          this.detectEnterWater(yVel);
        }
      })
      .bind('EnterFrame', function(){ 
          if (this._movement.x < 0) {
            this._facing = 'L';
            this.sprite(1,0,1,2);
            if (this.gun != null) {
              this.gun._facing = 'L';
              this.gun.sprite(3, 0, 3, 1);
            }
          }
          if (this._movement.x > 0) {
            this._facing = 'R';
            this.sprite(0,0,1,2);
            if (this.gun != null) {
              this.gun._facing = 'R';
              this.gun.sprite(0, 0, 3, 1);
            }
          }
        //console.log('Dude._globalZ = ', this._globalZ);
        this.dripCounter += MAX_HEALTH - this.health;
        while(this.dripCounter >= DRIP_RATE){
          this.dripCounter -= DRIP_RATE;
          var x = this.x + Math.random()*(this.w - Game.map_grid.tile.width/8); // subtract width of water droplet
          var y = this.y + Math.random()*Math.random()*this.h; // favour generating at the top, IMO better effect
          var v = 8*(MAX_HEALTH-this.health)/MAX_HEALTH; // nice effect, wetter you are the harder the drops poor off you
          Crafty.e('WaterDroplet')
            .initP(x,y)
            .initV(this._movement.x/2,this._movement.y+v);
        }
      });
  },

  detectEnterWater: function(yVel) {
    puddles = this.hit('Water');
    var shallowestPool = 5;
    for(var i=0; i<puddles.length; ++i)
      // there should be a better way to test if the object is 'Water'
      if(puddles[i].obj.waterLevel !== undefined){
        if(puddles[i].obj.waterLevel < shallowestPool)
          shallowestPool = puddles[i].obj.waterLevel;
      }
    if(0 < shallowestPool && shallowestPool < 5)
      this.makeSplashs(shallowestPool, yVel);
  },

  makeSplashs: function(shallowestPool, yVel) {
    for(var i=0; i<shallowestPool; ++i){
      // boots make for bigger splashes
      var dBoots = 0;
      if(this._hasBoots)
        dBoots = 5;
      // only if the player pressed the make splash button to accelerate downwards rapidly
      var dx = (7+i+dBoots)*(yVel+60)/120;
      var dy = (-5.5-i)*(yVel+60)/120;
      Crafty.e('Splash')
        .initP(this.x-Game.map_grid.width/4-Game.map_grid.width, this.y+this.h-((shallowestPool+1.1)*Game.map_grid.tile.height/4))
        .initV(-dx, dy)
        .setCreator(this.id);
      Crafty.e('Splash')
        .initP(this.x+this.w+Game.map_grid.width/4, this.y+this.h-((shallowestPool+1.1)*Game.map_grid.tile.height/4))
        .initV(dx, dy)
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
        if (this.__name=="Player1") {
            Crafty.e('asdfLoseGameText')._owner=this;
        }
        if (this.__name=="Player2") {
            Crafty.e('arrowLoseGameText')._owner=this;
        }
        this.timeout(function(){
		  Crafty.audio.stop();
          switch_level('Menu');
        }, 2000);
      }
    }
  },

});

Crafty.c('Player1', {
    init: function() {
          this.requires('Dude, p1right')
              .twoway2000(Crafty.keys['A'],
                          Crafty.keys['D'],
                          Crafty.keys['W'],
                          Crafty.keys['S'])
          //    .color('#583726')
              .setId('Player1');

          this.__name = 'Player1';
          }
});

Crafty.c('Player2', {
    init: function() {
          this.requires('Dude, p2left')
              .twoway2000(Crafty.keys['LEFT_ARROW'],
                          Crafty.keys['RIGHT_ARROW'],
                          Crafty.keys['UP_ARROW'],
                          Crafty.keys['DOWN_ARROW'])
         //     .color('#f6bda9')
              .setId('Player2');

          this.__name = 'Player2';
          }
});

Crafty.c('Umbrella', {
  init: function() {
    this
      .requires('Actor, umbrella')
      .requires('Color, Collision')
      .color('rgba(0,0,0,0)')
      .onHit('Dude', function(objs) {
        for(var i=0; i<objs.length; ++i){
          Crafty.e('UmbrellaInUse')
            .setCreator(objs[i].obj);
          this.destroy();
        }
      });
  },

  // when created with the 'at' method, the umbrella will sit at the top left of the cell, we don't want this
  recentre: function() {
    this.x += Game.map_grid.tile.width/4;
    this.y += Game.map_grid.tile.height/4;
    return this;
  }
});

Crafty.c('UmbrellaInUse', {

  init: function() {
    this
      .requires('Actor, umbrella')
      .attr({w: Game.map_grid.tile.width * 3/2, h: Game.map_grid.tile.height/2})
      .requires('Twoway2000, Color, Collision')
      .color('rgba(0,0,0,0)')
      .bind('EnterFrame', function(){
        this.x = this._creator.x - Game.map_grid.tile.width/4; // Center the umbrella over the owner
        this.y = this._creator.y - this.h;
      });
  },

  setCreator: function(creator){
    this._creator = creator;
    if(firstPickupUmbrella){
      firstPickupUmbrella = false;
      Crafty.e('firstPickupUmbrellaText')
          .at(this._creator.x, this._creator.y - 2)
          .setOwner(this._creator);
    } 
  }

});

Crafty.c('Boots', {
  init: function() {
    this
      .requires('Actor, leftboots')
      //.attr({w: Game.map_grid.tile.width/2, h: Game.map_grid.tile.height/2})
      .requires('Color, Collision')
      .color('rgba(0,0,0,0)')
      .onHit('Dude', function(objs) {
        for(var i=0; i<objs.length; ++i){
          objs[i].obj.boots =
          Crafty.e('BootsInUse')
            .setCreator(objs[i].obj);
          if (objs[i].obj._facing == 'L') {
            objs[i].obj.boots.sprite(3,0,3,2);
            objs[i].obj.boots._facing = 'L';
          }
          if (objs[i].obj._facing == 'R') {
            objs[i].obj.boots.sprite(0,0,3,2);
            objs[i].obj.boots._facing = 'R';
          }
          this.destroy();
        }
      });
  },

  // when created with the 'at' method, the umbrella will sit at the top left of the cell, we don't want this
  recentre: function() {
    this.x += Game.map_grid.tile.width/4;
    this.y += Game.map_grid.tile.height/4;
    return this;
  }
});

Crafty.c('BootsInUse', {

  init: function() {
    this
      .requires('Actor')
      // .attr({w: Game.map_grid.tile.width * 3/2, h: Game.map_grid.tile.height/2})
      .requires('leftboots')
      .requires('Twoway2000, Color, Collision')
      .color('rgba(0,0,0,0)')
      .bind('EnterFrame', function(){
        if (this._creator._facing == 'L') {
          this.sprite(3,0,3,2);
        }
        if (this._creator._facing == 'R') {
          this.sprite(0,0,3,2);
        }
        this.x = this._creator.x - Game.map_grid.tile.width/4; // Center the umbrella over the owner
        this.y = this._creator.y + this._creator.h - this.h;
      });
  },

  setCreator: function(creator){
    creator._hasBoots = true;
    this._creator = creator;
    if(firstPickupBoots){
      firstPickupBoots = false;
      Crafty.e('firstPickupBootsText')
          .at(this._creator.x, this._creator.y - 2)
          .setOwner(this._creator);
    }
    return this;
  }

});

Crafty.c('Gun', {
  init: function() {
    this
      .requires('Actor, Color, rightgun')
      .attr({w: 57, h: 27})
      .requires('Collision')
      .color('rgba(0,0,0,0)')
      .onHit('Dude', function(objs) {
        for(var i=0; i<objs.length; ++i){
          objs[i].obj.gun =
            Crafty.e('GunInUse')
              .setCreator(objs[i].obj);

          if (objs[i].obj._facing == 'L') {
            objs[i].obj.gun.sprite(3,0,3,1);
            objs[i].obj.gun._facing = 'L';
          }
          if (objs[i].obj._facing == 'R') {
            objs[i].obj.gun.sprite(0,0,3,1);
            objs[i].obj.gun._facing = 'R';
          }

          this.destroy();
        }
      });
  },

  // when created with the 'at' method, the umbrella will sit at the top left of the cell, we don't want this
  recentre: function() {
    this.x += Game.map_grid.tile.width/4;
    this.y += Game.map_grid.tile.height/4;
    return this;
  }
});

var SHOOT_FREQUENCY = 10;
var SHOOT_COUNT = 35;
Crafty.c('GunInUse', {

  /* Variables
   * _shoot
   * _shotsLeft
   * _facing
   * _creator
   */

  init: function() {
    this
      .requires('Actor, Color, rightgun')
      // .attr({w: 27, h: 27})
      .attr({_facing: 'L', _shoot: 0, _shotsLeft: SHOOT_COUNT})
      .requires('Twoway2000, Collision')
      .color('rgba(0,0,0,0)')
      .bind('EnterFrame', function(){

        // move the image to the appropriate position
        this.x = this._creator.x - Game.map_grid.tile.width/4; // Center the umbrella over the owner
        this.y = this._creator.y + this._creator.h/2 - this.h;

        // shoot every now and then
        if(++this._shoot == SHOOT_FREQUENCY){

          // create the shot
          var initX = this.x - Game.map_grid.width/2;
          var initDx = -20;
          if(this._facing == 'R'){
            initX = this.x + this.w + Game.map_grid.width/2;
            initDx = 20;
          }
          Crafty.e('Splash')
            .initP(initX, this.y)
            .initV(initDx, 0)
            .setCreator(this._creator);

          // handle shot counters
          this._shoot = 0;
          if(--this._shotsLeft == 0) {
            this._creator.gun=null;
            this.destroy();
          }

        }
      });
  },

  setCreator: function(creator){
    this._creator = creator;
    if(firstPickupGun){
      firstPickupGun = false;
      Crafty.e('firstPickupGunText')
          .at(this._creator.x, this._creator.y - 2)
          .setOwner(this._creator);
    } 
    return this;
  }

});

Crafty.c('HealthBar', {
  
  creator: null,

  init: function() {
    this
      .requires('Actor')
      .attr({w: Game.map_grid.tile.width, h: 0, z: 5})
      .requires('Twoway2000, Color, Collision')
      .color('#7777ff')
      .bind('EnterFrame', function(){
        if(creator !== null){
          //console.log('HealthBar._globalZ = ', this._globalZ);
          this.x = creator.x;
          this.h = (MAX_HEALTH-creator.health)/MAX_HEALTH;
          this.y = creator.y + creator.h - this.h;
        }
      });
  },

  setCreator: function(_creator){
    creator = _creator;
  }
  
});

Crafty.c('Splash', {

  // attributes:
  gravity: 0.25,
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
            Crafty.audio.play('damage');
            objs[i].obj.dealDamage(SPLASH_DAMAGE);
            this.destroy();
          }
      })
      .move().attr({ _movement: {x: 0, y: 0}, gravity: 0.25 });
      Crafty.audio.play('splash');
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
  gravity: 0.25,

  init: function() {
    this.requires('Actor')
      .attr({w: Game.map_grid.tile.width/8, h: Game.map_grid.tile.height/8});
    this.requires('Color, Collision, Movable')
      .color('rgba(0,0,255,.5)')
      .onHit('Block', function(){ return this.destroy(); })
      .move().attr({ _movement: {x: 0, y: 0}, gravity: 0.25 });
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
  DAMAGE_TO_PLAYER: 20,
  gravity: 0.0, // my preference is for this to not have gravity, to move uniformly, feel free to change

  init: function() {
    this.requires('Actor')
      .attr({w: Game.map_grid.tile.width/8, h: Game.map_grid.tile.height/8});
    this.requires('Color, Collision, Movable')
      .color('rgba(0,0,255,.5)')
      .onHit('Block', function(){ return this.destroy(); })
      .onHit('UmbrellaInUse', function(){ return this.destroy(); })
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

Crafty.c('Title', {

    init: function() {
        this.requires('Text, Grid, 2D, Canvas')
            .textFont({'size': '50px', family: 'Courier'})
            .text('_SANTORUM_');
    }

});

Crafty.c('StartText', {

    init: function() {
        this.requires('Text, Grid, 2D, Canvas')
            .text('Press 1 or 2 to select level')
            .textFont({'size': '20px', family: 'Courier'});
    }

});

Crafty.c('HelpText1', {

    init: function() {
        this.requires('Text, Grid, 2D, Canvas')
            .text('Splash your opponent the most to win!')
            .textFont({'size': '20px', family: 'Courier'});
    }

});
Crafty.c('HelpText2', {

    init: function() {
        this.requires('Text, Grid, 2D, Canvas')
            .text('Use down whilst in the air to super splash.')
            .textFont({'size': '20px', family: 'Courier'});
    }

});

Crafty.c('FloatyHelp', {

    _dxText: 0,
    _dyText: 0,

    init: function() {
        this.requires('Text, Grid, 2D, Canvas')
            .bind('EnterFrame', function() {
                  if (this._owner !== null) {
                      var pos = this._owner.at();
                      this.at(pos.x+this._dxText, pos.y-2+this._dyText);
                  }
            });
    },

    setOwner: function(owner) {
        this._owner = owner;
    }

});

Crafty.c('P1Help', {

    init: function() {
        this.requires('FloatyHelp')
            .text('WASD')
            .textFont({'size': '20px', family: 'Courier'});
    }

});

Crafty.c('P2Help', {

    init: function() {
        this.requires('FloatyHelp')
            .text('Arrow keys')
            .textFont({'size': '20px', family: 'Courier'});
    }

});

Crafty.c('firstPickupGunText', {

    init: function() {
        this.requires('FloatyHelp')
            .text('Use left and right to choose direction for gun to fire.')
            .textFont({'size': '20px', family: 'Courier'})
            .timeout(function() {
              this.destroy();
            }, 3000);
        this._dxText = -5;
    }

});

Crafty.c('firstPickupUmbrellaText', {

    init: function() {
        this.requires('FloatyHelp')
            .text('The umbrella will prevent rain from damaging you.')
            .textFont({'size': '20px', family: 'Courier'})
            .timeout(function() {
              this.destroy();
            }, 3000);
        this._dxText = -5;
        this._dyText = -1;
    }

});

Crafty.c('firstPickupBootsText', {

    init: function() {
        this.requires('FloatyHelp')
            .text('Boots make for bigger better splash\'s.')
            .textFont({'size': '20px', family: 'Courier'})
            .timeout(function() {
              this.destroy();
            }, 3000);
        this._dxText = -5;
        this._dyText = -2;
    }

});

Crafty.c('asdfLoseGameText', {

    init: function() {
        this.requires('FloatyHelp')
            .text('WASD you lose ahhahahahahahaha go home and dry off')
            .textFont({'size': '20px', family: 'Courier'})
            .timeout(function() {
              this.destroy();
            }, 3000);
        this._dxText = -5;
    }
});

Crafty.c('arrowLoseGameText', {

    init: function() {
        this.requires('FloatyHelp')
            .text('Arrow keys you lose ahhahahahahahaha go home and dry off')
            .textFont({'size': '20px', family: 'Courier'})
            .timeout(function() {
              this.destroy();
            }, 3000);
        this._dxText = -5;
    }

});

