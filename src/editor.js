// constants (that may more not truly be constants)
var NUM_COLS;
var NUM_ROWS;
var GRID_LINE_WIDTH = 1;
var WATER = "#0000FF";
var SKY = "#bef"
var WALL = "#ADA96E";
var CLOUD = "#CCCCCC";

var solid_colors = ["water", "wall", "sky", "cloud"];
var color_lookup = [WATER, WALL, SKY, CLOUD];

// globals
var canvas;
var context;
var vertical_cell_size;
var horizontal_cell_size;
var mouse_down = false;
var current_tile;
var grid;
var water_level = 4;    //default is 4, entire block is water

var p1_spawn = { row: 0, col: 0 };
var p2_spawn = { row: 0, col: 0 };

$(window).load(main);

function main() {
    init();
    register_callbacks();
    load_level(initial_level);
    dump_level();
    draw_grid();
    draw_grid(); // makes lines thicker!
    draw_grid(); // makes lines thicker!
    draw_grid(); // makes lines thicker!
}

function init() {
    canvas = $("#editor_canvas")[0];
    context = canvas.getContext("2d");
}

function register_callbacks() {
    $("#editor_canvas").mousedown(function (e) {
        mouse_down = true;
        draw(e);
    });
    
    $("#editor_canvas").mouseup(function () {
            mouse_down = false;
            draw_grid();
    });
    
    $("#editor_canvas").mousemove(function (e) {
        draw(e);
    });
    
    $("#resize_button").click(function() {
        init();
    });
    
    $("#fill_button").click(fill_entire_grid);

    $("#water_button").click(function () { set_current_tile("water"); });
    $("#wall_button").click(function () { set_current_tile("wall"); });
    $("#sky_button").click(function () { set_current_tile("sky"); });
    $("#cloud_button").click(function () { set_current_tile("cloud"); });
    $("#player1_spawn_button").click(function () { set_current_tile("p1_spawn"); });
    $("#player2_spawn_button").click(function () { set_current_tile("p2_spawn"); });

    $("#water_level").change(function(e) {
        water_level = e.target.value;
        update_status_text();
    });
    
    $("#save_button").click(dump_level);
    $("#load_button").click(load_level);
}

function update_status_text() {
    var s = current_tile;
    if (current_tile == "water") {
        s += " " + water_level;
    }
    set_status_text(s);
}

function set_status_text(text) {
    $("#status_text").val(text);
}

function set_current_tile(tile) {
    current_tile = tile;
    update_status_text();
}

function draw_grid() {
    var oldStyle = context.fillStyle;
    context.fillStyle="#000000";

    // horizontal lines
    for (var i = 1; i < NUM_ROWS; ++i) {
        context.fillRect(0, i * (vertical_cell_size + GRID_LINE_WIDTH), canvas.width, GRID_LINE_WIDTH);
    }

    // vertical lines
    for (var j = 1; j < NUM_COLS; ++j) {
        context.fillRect(j * (horizontal_cell_size + GRID_LINE_WIDTH), 0, GRID_LINE_WIDTH, canvas.height);
    }

    context.font = horizontal_cell_size.toString() + "px Arial";
    context.fillText("1", p1_spawn.x * (horizontal_cell_size + GRID_LINE_WIDTH), p1_spawn.y);
    context.fillText("2", p2_spawn.x * (horizontal_cell_size + GRID_LINE_WIDTH), p2_spawn.y);

    context.fillStyle = oldStyle;
}

function fill_cell(x, y) {
    var index = $.inArray(current_tile, solid_colors);
    if (index > -1) {
        context.fillStyle = color_lookup[index];
        var height = vertical_cell_size;
        var y_start = y * (vertical_cell_size + GRID_LINE_WIDTH)+1;
        if (current_tile == "water") {
            height *= (water_level / 4);
        }
        context.fillRect(x * (horizontal_cell_size + GRID_LINE_WIDTH)+1, 
                         y_start, horizontal_cell_size, height);
    }
    if (current_tile != "p1_spawn" && current_tile != "p2_spawn") {
        grid[y][x] = current_tile != "water" ? current_tile : water_level;
    }
    if (current_tile == "p1_spawn") {
        p1_spawn.row = y;
        p1_spawn.col = x;
    }
    if (current_tile == "p2_spawn") {
        p2_spawn.row = y;
        p2_spawn.col = x;
    }
    draw_grid();
}

function draw(e) {
    if (mouse_down === true) {
        var pos = pos_to_coord(e);
        fill_cell(pos.x, pos.y);
    }
}

function pos_to_coord(e) {
    return {
        x: Math.floor(e.offsetX / (horizontal_cell_size + GRID_LINE_WIDTH)),
        y: Math.floor(e.offsetY / (vertical_cell_size + GRID_LINE_WIDTH))
    };
}

function fill_entire_grid() {
    for (var x = 0; x < NUM_COLS; ++x) {
        for (var y = 0; y < NUM_ROWS; ++y) {
            fill_cell(x, y);
        }
    }
}

function dump_level() {
    var level = "";

    for (var row = 0; row < NUM_ROWS; ++row) {
        for (var col = 0; col < NUM_COLS; ++col) {
            var tile = grid[row][col];
            var char;
            switch(tile) {
                case "wall":
                    char = ".";
                break;
                case "sky":
                    char = " ";
                break;
                case "cloud":
                    char = "c";
                break;
                default:
                    if (tile >= 0 && tile <= 4) {
                        char = tile;
                    } else {
                        console.log("somethign broke, recommend restarting page");
                    }
                break;
            }
            level += char;
        }
        level += "\n";
    }

    var jsonlevel = {
        rows: NUM_ROWS,
        cols: NUM_COLS,
        p1: p1_spawn,
        p2: p2_spawn,
        level_data: level
    };

    $("#io").val(JSON.stringify(jsonlevel));
}

function load_level() {
    var level = $("#io").val();
    load_level_from_str(level);
}

function load_level_from_str(input_json) {

    var jsonlevel = JSON.parse(input_json);
    load_level(jsonlevel);
}

function load_level(jsonlevel) {
    NUM_ROWS = jsonlevel.rows;
    NUM_COLS = jsonlevel.cols;
    p1_spawn = jsonlevel.p1;
    p2_spawn = jsonlevel.p2;
    var level = jsonlevel.level_data;
    
    $("#io")[0].rows = NUM_ROWS;
    $("#io")[0].cols = NUM_COLS;

    vertical_cell_size = (canvas.height - GRID_LINE_WIDTH * NUM_ROWS - 1) / NUM_ROWS;
    horizontal_cell_size = (canvas.width - GRID_LINE_WIDTH * NUM_COLS - 1) / NUM_COLS;
    
    grid = new Array(NUM_ROWS);
    
    set_current_tile("wall");
    for (var row = 0; row < NUM_ROWS; ++row) {
        grid[row] = new Array(NUM_COLS);
        for (var col = 0; col < NUM_COLS; ++col) {
            fill_cell(col, row);
        }
    }

    var i = 0;

    for (var row = 0; row < NUM_ROWS; ++row) {
        for (var col = 0; col < NUM_COLS; ++col) {
            var tile = level[i];
            while (tile == "\n") {
                ++i;
                tile = level[i];
            }
            var entry;
            switch(tile) {
                case " ":
                    entry = "sky";
                break;
                case ".":
                    entry = "wall";
                break;
                case "c":
                    entry = "cloud";
                break;
                default:
                    // assume water
                    if (tile >= 0 && tile <= 4) {
                        entry = "water";
                        water_level = tile;
                    } else {
                        console.log("wtf you doin, giving me incorrect data!?");
                    }
                break;
            }
            set_current_tile(entry);
            fill_cell(col, row);
            i++;
        }
    }
}

var initial_level = { rows: 10,
cols: 20,
p1: {row: 7, col: 2},
p2: {row: 7, col: 3},
level_data: "\
....................\n\
.                  .\n\
.                  .\n\
.                  .\n\
.                  .\n\
.                  .\n\
.                  .\n\
.                  .\n\
.......34234234.....\n\
....................\n"
};
