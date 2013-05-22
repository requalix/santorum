var level_data;
Crafty.scene(

  'Level1',

  // what happens when entering this level, e.g. construct the level
  function(){ 

    Crafty.e('Dude').at(4, 5)
      .twoway2000(Crafty.keys['A'], Crafty.keys['D'], Crafty.keys['W'], Crafty.keys['S'])
      .color('#583726').setId('Player1');

    Crafty.e('Dude').at(5, 5)
      .twoway2000(Crafty.keys['LEFT_ARROW'], Crafty.keys['RIGHT_ARROW'], Crafty.keys['UP_ARROW'], Crafty.keys['DOWN_ARROW'])
      .color('#f6bda9').setId('Player2');

   $.ajax({url: "1",
           type: "GET",
           dataType: "text",
           success: function (data) { level_data = data; },
           async: false
   });

   var i = 0;
   for(var row = 0; row < Game.map_grid.height; row++) {
      for(var col = 0; col < Game.map_grid.width; col++) {
        while (level_data[i] == "\n") {
            i++;
        }
        var tile = level_data[i];
        switch (tile) {
            case ".":
                Crafty.e('Block').at(col, row);
                break;
            case " ":
                break;
            default:
                if (tile >= 0 && tile <= 4) {
                    // water
                    Crafty.e('Water').at(col, row).setLevel(tile);
                } else {
                    console.log("unknown data")
                }
                break;
        }
        i++;
      }
    }

  },

  // what happens when exiting this level, e.g. unbinding callbacks
  function(){

  }

);
