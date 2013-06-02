// based on http://buildnewgames.com/introduction-to-crafty/

// global variables
var firstPickupUmbrella = true;
var firstPickupGun = true;
var firstPickupBoots = true;
var level_data = [];

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

    // import audio
    Crafty.audio.add("jump", "sounds/jump.wav");
    Crafty.audio.add("splash", "sounds/splash1.wav");
    Crafty.audio.add("damage", "sounds/take_damage1.wav");
    Crafty.audio.add("music", "sounds/music.mp3");
    Crafty.audio.add("menu", "sounds/menu.mp3");

    switch_level('Menu');
  }
}

//helper functions

/**
 * GETs the level 'name' initialises crafty to the correct size
 * then loads that scene.
 * BUG: Changing level size to something bigger later does not
 * work, so preferably make all levels the same size
 */
function switch_level(name) {
    level_data[name] = get_level(name);
    Crafty.init(Game.width(), Game.height());
    Crafty.background('#bef');
    Crafty.scene(name);
}

/**
 * Does the GET request via AJAX then sets the Game
 * map_grid dimensions
 */
function get_level(url) {
    // get level data
   var level_data = $.ajax( {  url: url,
                               type: 'GET',
                               dataType: 'json',
                               async: false
                             })
                     .responseText;

   level_data = JSON.parse(level_data);
   Game.map_grid.width = level_data.cols;
   Game.map_grid.height = level_data.rows;

   return level_data;
}
