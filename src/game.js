// based on http://buildnewgames.com/introduction-to-crafty/
var level_data;

Game = {

  map_grid: {
    width:  0, // how many cells
    height: 0, // init at zero to check what we do later works
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

    // get level 1 data
   level_data = $.ajax( {  url: '1',
                               type: 'GET',
                               dataType: 'json',
                               async: false
                             }).responseText;

   level_data = JSON.parse(level_data);
   Game.map_grid.width = level_data.cols;
   Game.map_grid.height = level_data.rows;

    // Start crafty and set a background color so that we can see it's working
    Crafty.init(Game.width(), Game.height());
    Crafty.background('#bef');

    Crafty.scene('Menu');

    Crafty.scene('Level1');

  }
}
