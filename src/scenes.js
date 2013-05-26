Crafty.scene(

    'Menu',

    // "constructor"
    function() {

        Crafty.e('Title')
            .at(Game.map_grid.width/2 - 1, Game.map_grid.height/2 - 2);

        Crafty.e('StartText')
            .at(Game.map_grid.width/2 - 1, Game.map_grid.height/2)
            .bind('KeyUp', function(e) {
                if (e.key == Crafty.keys['ENTER']) {
                    Crafty.scene('Level1');
                }
            });


        // attach help above players heads
        Crafty.e('P1Help')
            .at(Game.map_grid.width/2 - 7, Game.map_grid.height/2);

        Crafty.e('P2Help')
            .at(Game.map_grid.width/2 + 5, Game.map_grid.height/2);


        grid_load_level(menu_data.level_data);
        
        // TODO refactor players as components themselves
        Crafty.e('Dude').at(menu_data.p1.col, menu_data.p1.row)
          .twoway2000(Crafty.keys['A'], Crafty.keys['D'], Crafty.keys['W'], Crafty.keys['S'])
          .color('#583726').setId('Player1');

        Crafty.e('Dude').at(menu_data.p2.col, menu_data.p2.row)
          .twoway2000(Crafty.keys['LEFT_ARROW'], Crafty.keys['RIGHT_ARROW'], Crafty.keys['UP_ARROW'], Crafty.keys['DOWN_ARROW'])
          .color('#f6bda9').setId('Player2');
    },

    // "destructor"
    function() {

    }
);


Crafty.scene(

  'Level1',

  // what happens when entering this level, e.g. construct the level
  function(){ 

    Game.gameOver = false;

    Crafty.e('Dude').at(level1_data.p1.col, level1_data.p1.row)
      .twoway2000(Crafty.keys['A'], Crafty.keys['D'], Crafty.keys['W'], Crafty.keys['S'])
      .color('#583726').setId('Player1');

    Crafty.e('Dude').at(level1_data.p2.col, level1_data.p2.row)
      .twoway2000(Crafty.keys['LEFT_ARROW'], Crafty.keys['RIGHT_ARROW'], Crafty.keys['UP_ARROW'], Crafty.keys['DOWN_ARROW'])
      .color('#f6bda9').setId('Player2');

   grid_load_level(level1_data.level_data);

    // After 10 seconds, move the umbrella onto the field in a random location
   Crafty.e('Umbrella')
       .at(-1, -1)
       .recentre()
       .timeout(function() {
                   var x = 1+Math.floor(Math.random()*(Game.map_grid.width-3));
                   var y = Game.map_grid.height-3;
                   this.at(x, y);
               }, 10000);

  },

  // what happens when exiting this level, e.g. unbinding callbacks
  function(){

  }

);

// helper functions
function grid_load_level(grid) {
    for(var row = 0; row < Game.map_grid.height; row++) {
        for(var col = 0; col < Game.map_grid.width; col++) {
            var tile = grid[row][col];
            switch (tile) {
                case 'wall':
                    Crafty.e('Block').at(col, row);
                    break;
                case 'sky':
                    break;
                case 'cloud':
                    Crafty.e('Cloud').at(col, row).setWind(0);
                    break;
                default:
                    if (tile >= 0 && tile <= 4) {
                        // water
                        Crafty.e('Water').at(col, row).setLevel(parseInt(tile, 10));
                    } else {
                        console.log('unknown data');
                    }
                    break;
            }
        }
    }
}
