Crafty.scene(

    'Menu',

    // "constructor"
    function() {
        var menu_data = level_data['Menu'];
        grid_load_level(menu_data.level_data);

        Crafty.e('Title')
            .at(Game.map_grid.width/2 - 1, Game.map_grid.height/2 - 3);

        Crafty.e('StartText')
            .at(Game.map_grid.width/2 - 1, Game.map_grid.height/2)
            .bind('KeyUp', function(e) {
                if (e.key == Crafty.keys['1']) {
                    Crafty.audio.stop();
                    switch_level('Level1');
                } else if (e.key == Crafty.keys['2']) {
                    Crafty.audio.stop();
                    switch_level('Level2');
                }
            });
	
		Crafty.e('HelpText1')
			  .at(Game.map_grid.width/2 - 4, Game.map_grid.height/2 - 2);

		Crafty.e('HelpText2')
			  .at(Game.map_grid.width/2 - 4, Game.map_grid.height/2 - 1);

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
			
            Crafty.audio.play("menu", 1, 0.8);
    },

    // "destructor"
    function() {

    }
);

abs = Math.abs;
min = Math.min;

Crafty.scene(

  'Level1',

  // what happens when entering this level, e.g. construct the level
  function(){ 

    Game.gameOver = false;

    dudes = [];
    var level1_data = level_data['Level1'];
    grid_load_level(level1_data.level_data);

    Crafty.e('Player1')
          .at(level1_data.p1.col, level1_data.p1.row);

    Crafty.e('Player2')
          .at(level1_data.p2.col, level1_data.p2.row);

    // After 10 seconds, move the umbrella onto the field in a random location
    Crafty.e('Umbrella')
          .at(-1, -1)
          .timeout(function() {
                       var x = 1+Math.floor(Math.random()*(Game.map_grid.width-3));
                       var y = Game.map_grid.height-3;

                       // make the umbrella spawn far away from the players
                       var dist = 0;
                       for(var i=1; i<=Game.map_grid.width-2; ++i){
                         var tryDist = min(abs(dudes[0].x-Game.map_grid.tile.width*i),
                                           abs(dudes[1].x-Game.map_grid.tile.width*i));
                         if(tryDist > dist){
                           dist = tryDist;
                           x = i;
                         }
                       }

                       this.at(x, y);
                       this.recentre();
                   }, 10000);
		Crafty.audio.play("music", -1, 0.5);

    Crafty.e('Gun')
          .at(-1, -1)
          .timeout(function() {
                       var x = 1+Math.floor(Math.random()*(Game.map_grid.width-3));
                       var y = Game.map_grid.height-4;

                       // make the gun spawn far away from the players
                       var dist = 0;
                       for(var i=1; i<=Game.map_grid.width-2; ++i){
                         var tryDist = min(abs(dudes[0].x-Game.map_grid.tile.width*i),
                                           abs(dudes[1].x-Game.map_grid.tile.width*i));
                         if(tryDist > dist){
                           dist = tryDist;
                           x = i;
                         }
                       }

                       this.at(x, y);
                       this.recentre();
                   }, 1000);

    Crafty.e('Boots')
          .at(-1, -1)
          .timeout(function() {
                       var x = 1+Math.floor(Math.random()*(Game.map_grid.width-3));
                       var y = Game.map_grid.height-5;

                       // make the boots spawn far away from the players
                       var dist = 0;
                       for(var i=1; i<=Game.map_grid.width-2; ++i){
                         var tryDist = min(abs(dudes[0].x-Game.map_grid.tile.width*i),
                                           abs(dudes[1].x-Game.map_grid.tile.width*i));
                         if(tryDist > dist){
                           dist = tryDist;
                           x = i;
                         }
                       }

                       this.at(x, y);
                       this.recentre();
                   }, 7500);
    },

    // what happens when exiting this level, e.g. unbinding callbacks
    function(){

    }

);

Crafty.scene(

  'Level2',

  // what happens when entering this level, e.g. construct the level
  function(){ 

    Game.gameOver = false;

    dudes = [];
    var level2_data = level_data['Level2'];
    grid_load_level(level2_data.level_data);

    Crafty.e('Player1')
          .at(level2_data.p1.col, level2_data.p1.row);

    Crafty.e('Player2')
          .at(level2_data.p2.col, level2_data.p2.row);

    // A cell is ok to spawn a pickup iff 
    // it is sky with a wall at most 3 cells below, and nothing but sky inbetween
    var levelMap = level2_data.level_data;
    var ok = [];
    for(var x=0; x<Game.map_grid.width; ++x){
      ok[x] = [];
      for(var y=0; y<Game.map_grid.height; ++y)
        ok[x][y] = false;
    }
    for(var x=0; x<Game.map_grid.width; ++x)
      for(var y=Game.map_grid.height-1; y>=0; --y){
        ok[x][y] = false;
        if(levelMap[y][x] != 'sky')
          continue;
        for(var k=1; k<=3 && y+k<Game.map_grid.height; ++k)
          if(!ok[x][k+y]){
            if(levelMap[k+y][x] == 'wall')
              ok[x][y] = true;
            break;
          }
      }

    // After 10 seconds, move the umbrella onto the field in a location farthest from the 2 players
    Crafty.e('Umbrella')
          .at(-1, -1)
          .timeout(function() {
              var x=-1;
              var y=-1;
              var dist=0;
              for(var xx=0; xx<Game.map_grid.width; ++xx)
                for(var yy=0; yy<Game.map_grid.height; ++yy)
                  if(ok[xx][yy]){
                    var tryDist = min(abs(dudes[0].x-Game.map_grid.tile.width*xx) + abs(dudes[0].y-Game.map_grid.tile.height*yy),
                                       abs(dudes[1].x-Game.map_grid.tile.width*xx) + abs(dudes[1].y-Game.map_grid.tile.height*yy));
                    if(tryDist > dist){
                      dist = tryDist;
                      x = xx;
                      y = yy;
                    }
                  }
              ok[x][y] = false; // the other pickups cannot now be placed here
              this.at(x,y);
              this.recentre();
          }, 10000);

		Crafty.audio.play("music", -1, 0.5);

    Crafty.e('Gun')
          .at(-1, -1)
          .timeout(function() {
              var x=-1;
              var y=-1;
              var dist=0;
              for(var xx=0; xx<Game.map_grid.width; ++xx)
                for(var yy=0; yy<Game.map_grid.height; ++yy)
                  if(ok[xx][yy]){
                    var tryDist = min(abs(dudes[0].x-Game.map_grid.tile.width*xx) + abs(dudes[0].y-Game.map_grid.tile.height*yy),
                                       abs(dudes[1].x-Game.map_grid.tile.width*xx) + abs(dudes[1].y-Game.map_grid.tile.height*yy));
                    if(tryDist > dist){
                      dist = tryDist;
                      x = xx;
                      y = yy;
                    }
                  }
              ok[x][y] = false; // the other pickups cannot now be placed here
              this.at(x,y);
              this.recentre();
           }, 15000);

    Crafty.e('Boots')
          .at(-1, -1)
          .timeout(function() {
              var x=-1;
              var y=-1;
              var dist=0;
              for(var xx=0; xx<Game.map_grid.width; ++xx)
                for(var yy=0; yy<Game.map_grid.height; ++yy)
                  if(ok[xx][yy]){
                    var tryDist = min(abs(dudes[0].x-Game.map_grid.tile.width*xx) + abs(dudes[0].y-Game.map_grid.tile.height*yy),
                                       abs(dudes[1].x-Game.map_grid.tile.width*xx) + abs(dudes[1].y-Game.map_grid.tile.height*yy));
                    if(tryDist > dist){
                      dist = tryDist;
                      x = xx;
                      y = yy;
                    }
                  }
              ok[x][y] = false; // the other pickups cannot now be placed here
              this.at(x,y);
              this.recentre();
            }, 7500);
    },

    // what happens when exiting this level, e.g. unbinding callbacks
    function(){

    }

);

// helper functions

/**
 * This function reads in a grid from the editor
 * and creates the appropriate craft blocks
 */
function grid_load_level(grid) {
    for(var row = 0; row < Game.map_grid.height; row++) {
        for(var col = 0; col < Game.map_grid.width; col++) {
            var tile = grid[row][col];
            switch (tile) {
                case 'wall':
                    __x = 3;
                    if(row!=0 && grid[row-1][col]=='sky'){
                      __x = 1;
                      if(col!=Game.map_grid.width-1 && grid[row][col+1]=='sky')
                        __x = 2;
                      if(col!=0 && grid[row][col-1]=='sky')
                        __x = 0;
                    }
                    Crafty.e('Block')
                      .at(col, row)
                      .sprite(__x,0);
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
