// based on http://buildnewgames.com/introduction-to-crafty/

// global variables
var level1_data;
var menu_data;

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

    menu_data = get_level('menu');
    level1_data = get_level('1');
	
	// import audio
	Crafty.audio.add("jump", "sounds/jump.wav");
	Crafty.audio.add("music", "sounds/music.mp3");
	Crafty.audio.add("menu", "sounds/menu.mp3");

    // WARNING: whichever level gets loaded first sets the craft area size
    // we will probably want to change this at some point!
    Crafty.init(Game.width(), Game.height());
    Crafty.background('#bef');

    Crafty.scene('Menu');

    //Crafty.scene('Level1');

  }
}

//helper functions


function get_level(url) {
    // get level data
   var level_data = $.ajax( {  url: url,
                               type: 'GET',
                               dataType: 'json',
                               async: false
                             }).responseText;

   level_data = JSON.parse(level_data);
   Game.map_grid.width = level_data.cols;
   Game.map_grid.height = level_data.rows;

   return level_data;
}
