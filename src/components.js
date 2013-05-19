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

Crafty.c('Block', {
  init: function() {
    this.requires('Actor, Color, Solid')
      .color('#333');
  },
});

Crafty.c('Water', {
  init: function() {
    this.requires('Actor, Color')
      .color('#00f');
  },
});

Crafty.c('Ground', {
  init: function() {
    this.requires('Actor, Color, Solid')
      .color('#ADA96E');
  },
});

// move like this: http://craftyjs.com/api/Twoway.html
Crafty.c('Dude', {
  init: function() {
    this.count=0;
    this.requires('Actor, Twoway, Gravity, Color, Collision')
      .twoway(4, 0.2 * Game.map_grid.tile.height) // move pixels, jump speed (pixels...)
      .color('#817679')
      .gravity('Ground')
      .attr({w: Game.map_grid.tile.width, h: Game.map_grid.tile.height * 2})
      .stopOnSolids();
  },

  stopOnSolids: function() {
    this.onHit('Solid', this.stopMovement);
  },

  stopMovement: function() {
    if (this._movement) {
      this.x -= this._movement.x;
    }
  }
});
