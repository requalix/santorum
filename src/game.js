// based on http://buildnewgames.com/introduction-to-crafty/

Game = {

  map_grid: {
    width:  20, // how many cells
    height: 10,
    tile: {
      width:  64, // pixels for each cell
      height: 64
    }
  },

  width: function() { return this.map_grid.width * this.map_grid.tile.width; },
  height: function() { return this.map_grid.height * this.map_grid.tile.height; },

  // Initialize and start our game
  start: function() {
    // Start crafty and set a background color so that we can see it's working
    Crafty.init(Game.width(), Game.height());
    Crafty.background('#bef');

    Crafty.e('Dude').at(5, 5);
    for(i=0;i<Game.map_grid.width;i++) {
      for(j=0;j<Game.map_grid.height;j++) {
        if(i==0 || i== Game.map_grid.width-1 || j== 0) {
          Crafty.e('Block').at(i,j);
        } else if(j==Game.map_grid.height-1 || j==Game.map_grid.height-2) {
          if ((i >= 7 && i<=14 ) && j == Game.map_grid.height - 2) {
            Crafty.e('Water').at(i,j);
          } else {
            Crafty.e('Block').at(i,j);
          }
        }
      }
    }
  }
}
