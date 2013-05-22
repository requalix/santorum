// constants (that may more not truly be constants)
var NUM_COLS;
var NUM_ROWS;
var GRID_LINE_WIDTH = 1;
var WATER = "#0000FF";
var SKY = "#bef"
var WALL = "#ADA96E";

var solid_colors = ["water", "wall", "sky"];
var color_lookup = [WATER, WALL, SKY];

// globals
var context;
var canvas;
var vertical_cell_size;
var horizontal_cell_size;
var mouse_down = false;
var current_tile;
var grid;
var water_level = 4;    //default is 4, entire block is water

$(window).load(main);

function main() {
    init();
    register_callbacks();
    draw_grid();
    draw_grid(); // makes lines thicker!
    draw_grid(); // makes lines thicker!
    draw_grid(); // makes lines thicker!
    load_level_from_str(initial_level);
}

function init() {
    NUM_COLS = $("#map_width").val();
    NUM_ROWS = $("#map_height").val();
    
    $("#io")[0].rows = NUM_ROWS;
    $("#io")[0].cols = NUM_COLS;

    canvas = $("#editor_canvas")[0]
    context = canvas.getContext("2d");

    set_current_tile("wall");
    vertical_cell_size = (canvas.height - GRID_LINE_WIDTH * NUM_ROWS - 1) / NUM_ROWS;
    horizontal_cell_size = (canvas.width - GRID_LINE_WIDTH * NUM_COLS - 1) / NUM_COLS;
    
    grid = new Array(NUM_ROWS);
    
    for (var row = 0; row < NUM_ROWS; ++row) {
        grid[row] = new Array(NUM_COLS);
        for (var col = 0; col < NUM_COLS; ++col) {
            set_current_tile("wall");
            fill_cell(col, row);
        }
    }
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
            //y_start += (vertical_cell_size * (4-water_level)/4);
        }
        context.fillRect(x * (horizontal_cell_size + GRID_LINE_WIDTH)+1, 
                         y_start, horizontal_cell_size, height);
    } else {
        console.log("o shit this is not good");
    }
    grid[y][x] = current_tile != "water" ? current_tile : water_level;
    draw_grid();
}

function draw(e) {
    if (mouse_down === true) {
        var pos = pos_to_coord(e);
        fill_cell(pos.x, pos.y);
    }
}

function pos_to_coord(e) {
    // e.offset(X|Y)
    var ret = new Object();
    ret.x = Math.floor(e.offsetX / (horizontal_cell_size + GRID_LINE_WIDTH));
    ret.y = Math.floor(e.offsetY / (vertical_cell_size + GRID_LINE_WIDTH));
    return ret;
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
    $("#io").val(level);
}

function load_level() {
    var level = $("#io").val();
    loadl_level_from_str(level);
}

function load_level_from_str(level) {
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

var initial_level = "\
....................\n\
.                  .\n\
.                  .\n\
.                  .\n\
.                  .\n\
.                  .\n\
.                  .\n\
.                  .\n\
.......34234234.....\n\
....................\n\
"