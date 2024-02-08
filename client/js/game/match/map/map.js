class Map {
    constructor(options) {
        this.tileSize = 48;
        this.tileSet = new Tileset({ generate: true });
        this.w = this.tileSize * this.tileSet.grid[0].length; //7200
        this.h = this.tileSize * this.tileSet.grid.length; //4800
        this.nodes = [];

        this.friction = {
            air: 0.01,
            ground: 0.1
        }

        this.gravity = 1;
        this.stopZone = 0.1;
        this.grace = 10;
        this.floor = 0;
        this.collideReflect = 0.2;

        this.mrsmithimg = 'data:image/webp;base64,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'

        this.bgimg = new Image();
        //this.bgimg.src = this.mrsmithimg;
        this.bgimg.src = "img/tiles/tile001.png";
        //this.bgimg.src = 'data:image/png;base64,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';

        this.blocks = [];
        this.lastBlock = () => { return this.blocks[this.blocks.length - 1]; }
        this.bullets = [];
        this.debris = [];

        this.lightValue = [0, 0, 24, 0.15];

        this.runFunc = []; // A list of functions to run during the step

        if (typeof options == 'object')
            for (const setting of Object.keys(options)) {
                if (this[setting] !== undefined)
                    this[setting] = options[setting];
            }

    }

    /*
                                   #     #               #     #
     #####  #    # # #      #####  ##    #   ##   #    # ##   ## ######  ####  #    #
     #    # #    # # #      #    # # #   #  #  #  #    # # # # # #      #      #    #
     #####  #    # # #      #    # #  #  # #    # #    # #  #  # #####   ####  ######
     #    # #    # # #      #    # #   # # ###### #    # #     # #           # #    #
     #    # #    # # #      #    # #    ## #    #  #  #  #     # #      #    # #    #
     #####   ####  # ###### #####  #     # #    #   ##   #     # ######  ####  #    #

    */
    buildNavMesh() {
        for (let x = 0; x < this.w / this.tileSize; x++) {
            for (let y = 0; y < this.h / this.tileSize; y++) {
                this.nodes.push(new Node(x * this.tileSize, y * this.tileSize), this.tileSize, this.tileSize);
                for (const block of game.match.map.blocks) {
                    if (this.nodes[this.nodes.length - 1].pos.collideCube(block.HB)) {
                        this.nodes[this.nodes.length - 1].pass = false;
                    } else {
                    }
                }
            }
        }
    }

    /*
  #####
 #     # ##### ###### #####
 #         #   #      #    #
  #####    #   #####  #    #
       #   #   #      #####
 #     #   #   #      #
  #####    #   ###### #

*/
    step() {

        for (const e of this.blocks) {
            if (e.cleanup && !e.active) {
                //Remove block
                this.blocks = this.blocks.filter(function (el) { return el != e; });
            }
        }

        for (const e of this.bullets) {
            if (e.cleanup && !e.active) {
                //Remove bullet
                this.bullets = this.bullets.filter(function (el) { return el != e; });
            }
        }

        for (const e of this.debris) {
            if (e.cleanup && !e.active) {
                //Remove bullet
                this.debris = this.debris.filter(function (el) { return el != e; });
            }
        }

        // Run all runFunc
        for (const func of this.runFunc) {
            func();
        }

    }

    /*

     #####  #####    ##   #    #
     #    # #    #  #  #  #    #
     #    # #    # #    # #    #
     #    # #####  ###### # ## #
     #    # #   #  #    # ##  ##
     #####  #    # #    # #    #

    */
    draw() {

        /*
           ___                      _     ___ _            _   _         _                                   _
          / __|_ _ ___ _  _ _ _  __| |   / __| |___  _    | | | |_ _  __| |___ _ _ __ _ _ _ ___ _  _ _ _  __| |
         | (_ | '_/ _ \ || | ' \/ _` |_  \__ \ / / || |_  | |_| | ' \/ _` / -_) '_/ _` | '_/ _ \ || | ' \/ _` |
          \___|_| \___/\_,_|_||_\__,_( ) |___/_\_\\_, ( )  \___/|_||_\__,_\___|_| \__, |_| \___/\_,_|_||_\__,_|
                                     |/           |__/|/                          |___/
        */
        //Ground
        ctx.fillStyle = "#333300";
        ctx.fillRect(0, 0, game.window.w, game.window.h);

        //If in 3D mode, draw the sky (This overdraws things past the horizon, even if visible)
        if (game.player.camera._3D) {
            ctx.fillStyle = "#8cb8ff";
            ctx.fillRect(0, 0, game.window.w, (game.window.h / 2) /* * (1 - game.player.camera.angle)) */);
        }

        // If in 3D mode, draw the underground (This overdraws things past the underground, even if visible)
        if (game.player.camera._3D) {
            ctx.fillStyle = "#281800";
            ctx.fillRect(0, (game.window.h / 2) /* +  ((game.window.h / 1)  * (game.player.camera.angle) ) */, game.window.w, game.window.h);
        }

        /*
          _____ _ _
         |_   _(_) |___ ___
           | | | | / -_|_-<
           |_| |_|_\___/__/

        */
        this.tileSet.draw();

        /*
          ___             _            ___  _     _        _
         | _ \___ _ _  __| |___ _ _   / _ \| |__ (_)___ __| |_ ___
         |   / -_) ' \/ _` / -_) '_| | (_) | '_ \| / -_) _|  _(_-<
         |_|_\___|_||_\__,_\___|_|    \___/|_.__// \___\__|\__/__/
                                               |__/
        */
        //Put Bot player characters into a list
        let npcs = [];
        for (const npc in game.match.bots) {
            npcs.push(game.match.bots[npc].character);
        }

        let renderList =
            [game.player.character, ...npcs, ...game.match.map.blocks, ...game.match.map.bullets, ...game.match.map.debris]
                .sort((a, b) => {
                    if (a.HB.pos.y < b.HB.pos.y + b.HB.pos.z) return -1;
                    if (a.HB.pos.y > b.HB.pos.y + b.HB.pos.z) return 1;
                    return 0;
                });
        for (const entity of renderList) {
            // if the entity is within the camera's viewable radius
            let compareX = game.player.camera.x - entity.HB.pos.x;
            let compareY = game.player.camera.y - entity.HB.pos.y;
            let horizonCalc = 0;
            if (game.player.camera._3D)
                horizonCalc = (game.window.h / 2) * (1 - game.player.camera.angle)
            if (game.player.camera.radius > Math.abs(compareX) && game.player.camera.radius > Math.abs(compareY) - horizonCalc)
                entity.draw(game.player.character); //THIS IS WHAT I HAVE BEEN LOOKING FOR
        }

        /*
          ___                         _                _                                   _
         | __|__  __ _   __ _ _ _  __| |  _  _ _ _  __| |___ _ _ __ _ _ _ ___ _  _ _ _  __| |
         | _/ _ \/ _` | / _` | ' \/ _` | | || | ' \/ _` / -_) '_/ _` | '_/ _ \ || | ' \/ _` |
         |_|\___/\__, | \__,_|_||_\__,_|  \_,_|_||_\__,_\___|_| \__, |_| \___/\_,_|_||_\__,_|
                 |___/                                          |___/
        */
        // Overdraw the sky as a gradient from the half of the top of the screen to the horizon to the horizon
        if (game.player.camera._3D) {
            let grd = ctx.createLinearGradient(
                0,
                (game.window.h / 4) * (1 - game.player.camera.angle),
                0,
                (game.window.h / 4) * (1 - game.player.camera.angle) + (game.window.h / 6) * (1 - game.player.camera.angle));
            grd.addColorStop(0, "rgba(140, 184, 255, 1)");
            grd.addColorStop(1, "rgba(140, 184, 255, 0)");
            ctx.fillStyle = grd;
            ctx.fillRect(0, 0, game.window.w, (game.window.h / 2) * (1 - game.player.camera.angle));
        }

        // overdraw the underground as a gradient from the bottom of the screen to the underground horizon
        if (game.player.camera._3D) {
            let grd = ctx.createLinearGradient(
                0,
                (game.window.h / 2) + ((game.window.h / 1) * (game.player.camera.angle)) + (game.window.h / 8) * (game.player.camera.angle),
                0,
                (game.window.h / 2) + ((game.window.h / 1) * (game.player.camera.angle))
            );
            grd.addColorStop(0, "rgba(40, 24, 0, 1)");
            // grd.addColorStop(0.5, "rgba(40, 24, 0, 0.5)");
            grd.addColorStop(1, "rgba(40, 24, 0, 0)");
            ctx.fillStyle = grd;
            ctx.fillRect(0, (game.window.h / 2) + ((game.window.h / 1) * (game.player.camera.angle)), game.window.w, game.window.h);
        }

        /*
             _     _
          __| |___| |__ _  _ __ _
         / _` / -_) '_ \ || / _` |
         \__,_\___|_.__/\_,_\__, |
                            |___/
        */
        //If debugging, show node grid
        if (game.debug)
            for (const node of this.nodes) {
                node.draw();
            }
    }

    /*

     #      #  ####  #    # ##### # #    #  ####
     #      # #    # #    #   #   # ##   # #    #
     #      # #      ######   #   # # #  # #
     #      # #  ### #    #   #   # #  # # #  ###
     #      # #    # #    #   #   # #   ## #    #
     ###### #  ####  #    #   #   # #    #  ####

    */
    lighting() {
        // ctx.globalCompositeOperation = "screen";
        ctx.fillStyle = `rgba(${this.lightValue[0]}, ${this.lightValue[1]}, ${this.lightValue[2]}, ${this.lightValue[3]})`
        ctx.fillRect(0, 0, game.window.w, game.window.h);
        // ctx.globalCompositeOperation = "source-over";
    }

}

/*
      ::::    :::  ::::::::  :::::::::  ::::::::::
     :+:+:   :+: :+:    :+: :+:    :+: :+:
    :+:+:+  +:+ +:+    +:+ +:+    +:+ +:+
   +#+ +:+ +#+ +#+    +:+ +#+    +:+ +#++:++#
  +#+  +#+#+# +#+    +#+ +#+    +#+ +#+
 #+#   #+#+# #+#    #+# #+#    #+# #+#
###    ####  ########  #########  ##########
*/
class Node {
    constructor(x, y, w, h) {
        this.pos = new Rect(x, y, w, h)
        this.pass = true;
    }

    draw() {
        if (this.pass)
            ctx.strokeStyle = "#0000FF"
        else
            ctx.strokeStyle = "#FF0000"
        let compareX = game.player.camera.x - this.pos.x;
        let compareY = game.player.camera.y - this.pos.y;
        if (game.player.camera.radius > Math.max(Math.abs(compareX), Math.abs(compareY))) {
            ctx.lineWidth = 0.2;
            if (game.player.camera._3D)
                ctx.strokeRect(
                    game.window.w / 2 - compareX,
                    game.window.h / 2 - (compareY * game.player.camera.angle),
                    this.pos.w,
                    this.pos.h * game.player.camera.angle
                );
            else
                ctx.strokeRect(game.window.w / 2 - compareX, game.window.h / 2 - compareY, this.pos.w, this.pos.h);

        }
    }
}

/*
      :::::::::: ::::::::::: :::::::::: :::        :::::::::          :::::::: ::::::::::: ::::::::::: :::   :::
     :+:            :+:     :+:        :+:        :+:    :+:        :+:    :+:    :+:         :+:     :+:   :+:
    +:+            +:+     +:+        +:+        +:+    +:+        +:+           +:+         +:+      +:+ +:+
   :#::+::#       +#+     +#++:++#   +#+        +#+    +:+        +#+           +#+         +#+       +#++:
  +#+            +#+     +#+        +#+        +#+    +#+        +#+           +#+         +#+        +#+
 #+#            #+#     #+#        #+#        #+#    #+#        #+#    #+#    #+#         #+#        #+#
###        ########### ########## ########## #########          ######## ###########     ###        ###
*/
class Map_FieldCity extends Map {
    constructor(options) {
        super(options);
        this.startBlocks = 50;
        if (typeof options == 'object')
            for (const setting of Object.keys(options)) {
                if (this[setting] !== undefined)
                    this[setting] = options[setting];
            }
        
        this.mrsmithimg = 'data:image/webp;base64,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'
        
        //Credit to Mr.Smith for teaching me about dictionaries. We never would have come this far without them.

        this.mapData = {
            blocks: [
                {
                    id: 1,
                    position: {
                        x: 400,
                        y: 0,
                        z: 400
                    },
                    size: {
                        width: 200,
                        length: 200,
                        height: 10
                    },
                    images: {
                        top: "img/tiles/wall_top.png",
                        side: "img/tiles/wall_side.png"
                    }
                }
            ]
        };

        this.setup();
    }

    setup = () => {
        /*  _      _    _   ___ _         _
           /_\  __| |__| | | _ ) |___  __| |__ ___
          / _ \/ _` / _` | | _ \ / _ \/ _| / /(_-<
         /_/ \_\__,_\__,_| |___/_\___/\__|_\_\/__/*/

        for (let i = 0; i < this.mapData.blocks.length; i++) {
            let block = this.mapData.blocks[i];
            console.log(block);
            let position = new Vect3(block.position.x, block.position.z, block.position.y);
            let size = new Vect3(block.size.width, block.size.length, block.size.height);
            let images = { imgFile: block.images.top, imgFileSide: block.images.side }

            this.blocks.push(new Block(
                allID++,
                position, //x y z
                size, // W L H
                images))
        }
    }
}

class Map_Deathbox extends Map {
    constructor() {
        super();
        this.setup();
    }

    setup() {
        this.w = 48 * 40; // 1872
        this.h = 48 * 22; // 1056
        this.tileSet = new Tileset({ size: { x: 40, y: 22 }, generate: true });
        /*
            _      _    _   ___ _         _
           /_\  __| |__| | | _ ) |___  __| |__ ___
          / _ \/ _` / _` | | _ \ / _ \/ _| / /(_-<
         /_/ \_\__,_\__,_| |___/_\___/\__|_\_\/__/
        
        */
        // for (let i = 0; i < 10; i++) {
        //     let ran1 = function () { return Math.floor(Math.random() * 3) + 1 }
        //     let ran2 = function () { return Math.floor(Math.random() * 3) + 1 }
        //     let ran3 = function () { return Math.floor(Math.random() * 3) + 1 }
        //     this.blocks.push(new Block(
        //         allID++,
        //         new Vect3(Math.round(Math.random() * this.w), Math.round(Math.random() * this.h), 0),
        //         new Vect3(ran1() * 48, ran2() * 48, ran3() * 48),
        //         { imgFile: 'img/tiles/wall_top.png', imgFileSide: 'img/tiles/wall_side.png' }))
        // }

        let mapCX = this.w / 2;
        let mapCY = this.h / 2;

        let opts = { imgFile: 'img/tiles/wall_top.png', imgFileSide: 'img/tiles/wall_side.png' }

        this.blocks.push(new Block(
            allID++,
            new Vect3(mapCX - 700, mapCY + 30, 0),
            new Vect3(this.tileSize, 200, 128),
            opts))
        this.blocks.push(new Block(
            allID++,
            new Vect3(mapCX + 700, mapCY - 230, 0),
            new Vect3(this.tileSize, 200, 128),
            opts))
        // horizontal wall in top left quadrant of map
        this.blocks.push(new Block(
            allID++,
            new Vect3(mapCX - 500, mapCY - 230, 0),
            new Vect3(500, this.tileSize, 128),
            opts));
        // horizontal wall in bottom right quadrant of map
        this.blocks.push(new Block(
            allID++,
            new Vect3(mapCX, mapCY + 230, 0),
            new Vect3(500, this.tileSize, 128),
            opts));
        // square short wall in bottom left quadrant of map
        this.blocks.push(new Block(
            allID++,
            new Vect3(mapCX - 400, mapCY + 230, 0),
            new Vect3(this.tileSize * 2, this.tileSize * 2, this.tileSize),
            opts));
        // square short wall in top right quadrant of map
        this.blocks.push(new Block(
            allID++,
            new Vect3(mapCX + 400 - (this.tileSize * 2), mapCY - 230 - (this.tileSize), 0),
            new Vect3(this.tileSize * 2, this.tileSize * 2, this.tileSize),
            opts));
        // push into the blocks array a block across the bottom of the map
        this.blocks.push(new Block(
            allID++,
            new Vect3(0, this.h, 0),
            new Vect3(this.w, this.tileSize, this.tileSize),
            opts))
        // push into the blocks array a block across the top of the map
        this.blocks.push(new Block(
            allID++,
            new Vect3(0, -this.tileSize, 0),
            new Vect3(this.w, this.tileSize, this.tileSize),
            opts))
        // push into the blocks array a block across the left of the map
        this.blocks.push(new Block(
            allID++,
            new Vect3(0, 0, 0),
            new Vect3(this.tileSize, this.h, this.tileSize),
            opts))
        // push into the blocks array a block across the right of the map
        this.blocks.push(new Block(
            allID++,
            new Vect3(this.w - this.tileSize, 0, 0),
            new Vect3(this.tileSize, this.h, this.tileSize),
            opts))

        // this.buildNavMesh();

    }
}

class Tileset {
    constructor(options) {
        this.tileSize = 48;
        this.grid = [[]];
        this.generate = false;
        this.size = new Vect2(100, 100);
        if (typeof options == 'object')
            for (const setting of Object.keys(options)) {
                if (this[setting] !== undefined)
                    this[setting] = options[setting];
            }
        if (this.generate) {
            this.randomGrid(this.size);
        }
    }

    randomGrid = (size) => {
        for (let y = 0; y < size.y; y++) {
            this.grid.push([]);
            for (let x = 0; x < size.x; x++) {
                // 1 in 20 chance of not getting grass
                let ran = Math.floor(Math.random() * 20);
                if (ran == 0) ran = Math.floor(Math.random() * 6)
                else ran = 0;
                this.grid[y].push(
                    ['G', 'B', 'D', 'T', 'E']
                    [ran]
                );
            }
        }
    }

    draw = () => {
        // For every column that the map can make from the total space
        let count = 0;
        const rows = this.grid.length
        for (let y = 0; y < rows; y++) {
            let compareY = game.player.camera.y - (y * this.tileSize);
            //For every row
            const cols = this.grid[y].length
            for (let x = 0; x < cols; x++) {
                let compareX = game.player.camera.x - (x * this.tileSize);
                //If the tile is within the camera's viewable radius and the horizon
                // TODO: horizon count doesn't actually line up with the horizon. sky overdraws it
                let horizonCalc = 0;
                if (game.player.camera._3D)
                    horizonCalc = (game.window.h / 2) * (1 - game.player.camera.angle)
                //getting the absolute value of compareX and compareY is just getting the distance between the player and the tile in question
                if (game.player.camera.radius > Math.abs(compareX) && game.player.camera.radius > Math.abs(compareY) - horizonCalc) {
                    count++;
                    let tileIMG = this.decodeTile(this.grid[y][x]);
                    // Adjust y and h if 3D draw mode
                    if (game.player.camera._3D)
                        ctx.drawImage(
                            tileIMG,
                            game.window.w / 2 - compareX,
                            game.window.h / 2 - (compareY * game.player.camera.angle),
                            this.tileSize,
                            this.tileSize * game.player.camera.angle
                        );
                    //Otherwise, draw normally
                    else
                        ctx.drawImage(
                            tileIMG,
                            game.window.w / 2 - compareX,
                            game.window.h / 2 - compareY,
                            this.tileSize,
                            this.tileSize
                        );
                }
            }
        }
        //console.log("Drew a total of " + count + " tiles");
    }

    decodeTile = (tile) => {
        switch (tile) {
            case 'G':
                return tiles.G;
                break;
            case 'B':
                return tiles.B;
                break;
            case 'D':
                return tiles.D;
                break;
            case 'T':
                return tiles.T;
                break;
            case 'E':
                return tiles.E;
                break;
            default:
                return tiles.G;
                break;
        }
    }
}

const tiles = (() => {
    list = {
        //'G': 'img/tiles/tile001.png',
        'G': 'data:image/webp;base64,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',
        'B': 'img/tiles/tile002.png',
        'D': 'img/tiles/tile003.png',
        'T': 'img/tiles/tile004.png',
        'E': 'img/tiles/tile005.png'
    }

    //for every tile in the list, replace the value with a new image object whose source is the value
    for (const tile in list) {
        let path = list[tile];
        list[tile] = new Image();
        list[tile].src = path;
    }

    return list;
})();