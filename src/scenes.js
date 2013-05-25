Crafty.scene(

  'Level1',

  // what happens when entering this level, e.g. construct the level
  function(){ 

    Game.gameOver = false;

    Crafty.e('Dude').at(4, 5)
      .twoway2000(Crafty.keys['A'], Crafty.keys['D'], Crafty.keys['W'], Crafty.keys['S'])
      .color('#583726').setId('Player1');

    Crafty.e('Dude').at(5, 5)
      .twoway2000(Crafty.keys['LEFT_ARROW'], Crafty.keys['RIGHT_ARROW'], Crafty.keys['UP_ARROW'], Crafty.keys['DOWN_ARROW'])
      .color('#f6bda9').setId('Player2');

    for(i=0;i<Game.map_grid.width;i++) {
      for(j=0;j<Game.map_grid.height;j++) {
        if(i==0 || i== Game.map_grid.width-1 || j==0) {
          if(j==0 && i!=0 && i!=Game.map_grid.width-1)
            Crafty.e('Cloud').at(i,j).setWind(0);
          else
            Crafty.e('Block').at(i,j);
        } else if(j==Game.map_grid.height-1 || j==Game.map_grid.height-2) {
          if ((i >= 7 && i<=14 ) && j == Game.map_grid.height - 2) {
            Crafty.e('Water').at(i,j).setLevel(2+(i%3));
          } else {
            Crafty.e('Block').at(i,j);
          }
        }
      }
    }

    // Hacky - I create a dummy block under one that already exists in order to construct the timeout function
    // After 10 seconds, create an umbrella at a random location
    Crafty.e('Block').at(0,0).timeout(function(){
      var x = 1+Math.floor(Math.random()*(Game.map_grid.width-3));
      var y = Game.map_grid.height-3;
      Crafty.e('Umbrella')
        .at(x, y)
        .recentre();
    }, 10000);

  },

  // what happens when exiting this level, e.g. unbinding callbacks
  function(){

  }

);
