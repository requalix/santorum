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

        grid_load_level(menu_data.level_data);

        dudes = [];
        
        var p1 = Crafty.e('Player1')
              .at(menu_data.p1.col, menu_data.p1.row);

        var p2 = Crafty.e('Player2')
              .at(menu_data.p2.col, menu_data.p2.row);

        // attach help above players heads
        Crafty.e('P1Help')
            .at(Game.map_grid.width/2 - 7, Game.map_grid.height/2)
            .setOwner(p1);

        Crafty.e('P2Help')
            .at(Game.map_grid.width/2 + 5, Game.map_grid.height/2)
            .setOwner(p2);
    },

    // "destructor"
    function() {

    }
);

function abs(x){ if(x>=0) return x; return -x; }
function min(x,y){ if(x<y) return x; return y; }

Crafty.scene(

  'Level1',

  // what happens when entering this level, e.g. construct the level
  function(){ 

    Game.gameOver = false;

    dudes = [];

    Crafty.e('Player1')
          .at(level1_data.p1.col, level1_data.p1.row);

    Crafty.e('Player2')
          .at(level1_data.p2.col, level1_data.p2.row);

    grid_load_level(level1_data.level_data);

    // After 10 seconds, move the umbrella onto the field in a random location
    Crafty.e('Umbrella')
          .at(-1, -1)
          .timeout(function() {
                       var x = 1+Math.floor(Math.random()*(Game.map_grid.width-3));
                       var y = Game.map_grid.height-3;

                       // make the umbrella spawn far away from the players
                       var dist = 0;
                       for(var i=1; i<=Game.map_grid.width-2; ++i){
                         var tryDist = min(abs(dudes[0].x-Game.map_grid.tile.width*i), abs(dudes[1].x-Game.map_grid.tile.width*i));
                         if(tryDist > dist){
                           dist = tryDist;
                           x = i;
                         }
                       }

                       this.at(x, y);
                       this.recentre();
                   }, 10000);

    Crafty.e('Gun')
          .at(-1, -1)
          .timeout(function() {
                       var x = 1+Math.floor(Math.random()*(Game.map_grid.width-3));
                       var y = Game.map_grid.height-4;

                       // make the gun spawn far away from the players
                       var dist = 0;
                       for(var i=1; i<=Game.map_grid.width-2; ++i){
                         var tryDist = min(abs(dudes[0].x-Game.map_grid.tile.width*i), abs(dudes[1].x-Game.map_grid.tile.width*i));
                         if(tryDist > dist){
                           dist = tryDist;
                           x = i;
                         }
                       }

                       this.at(x, y);
                       this.recentre();
                   }, 15000);

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
