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
  init: function() {
    this.requires('Actor, Color')
      .color('rgba(0,0,255,.7)');
  },
});

Crafty.c('Block', {
  init: function() {
    this.requires('Actor, Color')
      .color('#ADA96E');
  },
});

function overlap(lower1, upper1, lower2, upper2) {
  return Math.max(lower1, lower2) < Math.min(upper1, upper2);
}

Crafty.c('Movable', {
  init: function() {
    this.requires('Actor')
      .attr( { _movement: { x: 0, y: 0} });
  },

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
        if (entity !== undefined && them[i].obj != entity) continue;
        if (this.intersect(them[i].obj.x, them[i].obj.y, them[i].obj.w, them[i].obj.h)) {
          this.x -= this._movement.x;
          this._movement.x = 0;
          if (this.x < them[i].obj.x) {
            this.x = them[i].obj.x - this.w;
          } else {
            this.x = them[i].obj.x + them[i].obj.w;
          }
        }
      }
      this.y += this._movement.y - 0.01;

      for(var i = 0; i < them.length; i++) {
        if (entity !== undefined && them[i].obj != entity) continue;
        if (this.intersect(them[i].obj.x, them[i].obj.y, them[i].obj.w, them[i].obj.h)) {
          this.y -= this._movement.y;
          this._movement.y = 0;
          if (this.y < them[i].obj.y) {
            this._can_jump = true;
            this.y = them[i].obj.y - this.h;
          } else {
            this.y = them[i].obj.y + them[i].obj.h;
          }
        }
      }
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
    }).move().stopOn('Block').stopOn('Dude');
  },
});

Crafty.c('Dude', {
  init: function() {
    this.count=0;
    this.requires('Actor')
      .attr({w: Game.map_grid.tile.width, h: Game.map_grid.tile.height * 2});
    this.requires('Twoway2000, Color, Collision')
      .color('#817679');
  }
});
