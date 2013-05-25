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

  // set this to true when one of the players has won, prevents the other player from dying also
  // due to things like rain, or still active splash
  gameOver: false,

  width: function() { return this.map_grid.width * this.map_grid.tile.width; },
  height: function() { return this.map_grid.height * this.map_grid.tile.height; },

  // Initialize and start our game
  start: function() {

    // Start crafty and set a background color so that we can see it's working
    Crafty.init(Game.width(), Game.height());
    Crafty.background('#bef');

    Crafty.scene('Level1');

  }
}
