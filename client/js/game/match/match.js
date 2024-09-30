class Match {
    constructor() {
        this.setup();
    }

    reset() {

    }

    setup() {
        this.ticks = -1;
        this.spmp = 'sp' // 'sp' single player, 'ss' split screen, 'mp' multiplayer
        this.paused = false;
        this.map = new Map();
        this.bots = [];
        this.blocks = []; // Different from map blocks. Think pickups and dropped items
        this.runFunc = []; // A list of functions to run every step
        game.player.interface.drawFunc = []; // clear other interface draw functions
        this.menus = {
            tooSmall: new Menu([], new Rect(0, 0, 350, 50), { text: 'Window too small to play.' }),
        }
        this.menu = null;
    }

    step() {
        if (!this.paused) {

            game.player.character.step();

            for (const bot of this.bots) {
                bot.AI();
                bot.character.step();
            }

            for (const block of this.map.blocks) {
                block.step();
            }

            for (const bullet of this.map.bullets) {
                bullet.step();
            }

            for (const debris of this.map.debris) {
                debris.step();
            }

            game.match.map.step();

            // Run all runFunc
            for (const func of this.runFunc) {
                func();
            }

            // Remove old bots
            for (const e of this.bots) {
                if (e.character.cleanup && !e.character.active && e.character.type != 'player') {
                    //Remove npcs
                    this.bots = this.bots.filter(function (el) { return el != e; });
                }
            }

            this.ticks++;

        }

        // for every menu in the player's interface
        for (const menu in game.player.interface.menus) {
            game.player.interface.menus[menu].step();
        }

    }

    draw() {

    }

    command(command) {
        let cmd = command.split(' ')[0];
        let args = command.split(' ').slice(1);
        switch (command) {
            case 'pause':
                this.paused = !this.paused;
                break;
            case 'menu':
                if (this.menu) {
                    this.menu = null;
                } else {
                    this.menu = this.menus.tooSmall;
                }
                break;
            case 'debug':
                game.debug.all = !game.debug.all;
                break;
            case 'reset':
                this.setup();
                break;
            case 'new_friend':
                // Friendly
                this.bots.push(new Bot()) //Big ounce / Loh'Ghan
                this.bots[this.bots.length - 1].character = new Character(
                    allID++,
                    new Vect3((this.map.w / 2), (this.map.h / 2)),
                    this.bots[this.bots.length - 1],
                    {
                        // target: null,
                        target: this.bots[this.bots.length - 1].character,
                        name: getName(), team: 0, gfx: 'img/sprites/dark1', color: [0, 255, 0],
                        hover: 16, airAccel: new Vect3(0.15, 0.15, 1),
                        runFunc: [
                            function () { }.bind(this.bots[this.bots.length - 1].character)
                        ]
                    }
                );
                this.bots[this.bots.length - 1].character.HB = new Cylinder(new Vect3(Math.round(Math.random() * this.map.w), Math.round(Math.random() * this.map.h), 0), 29, 37);
                let rand = Math.floor(Math.random() * 3);
                if (rand == 0) {
                    let rand = Math.floor(Math.random() * 4);
                    this.bots[this.bots.length - 1].character.inventory.push(new Pistol())
                    switch (rand) {
                        case 0:
                            this.bots[this.bots.length - 1].character.inventory.push(new Pistol())
                            break;
                        case 1:
                            this.bots[this.bots.length - 1].character.inventory.push(new Rifle())
                            break;
                        case 2:
                            this.bots[this.bots.length - 1].character.inventory.push(new Flamer())
                            break;
                        case 3:
                            this.bots[this.bots.length - 1].character.inventory.push(new Flamer())
                            break;
                    }
                    this.bots[this.bots.length - 1].character.item = Math.round(Math.random());
                }

            default:
                console.log('Command not recognized: ' + command);
        }
    }
}

/*
 ######                              #     #
 #     # ###### #####  #    #  ####  ##   ##   ##   #####  ####  #    #
 #     # #      #    # #    # #    # # # # #  #  #    #   #    # #    #
 #     # #####  #####  #    # #      #  #  # #    #   #   #      ######
 #     # #      #    # #    # #  ### #     # ######   #   #      #    #
 #     # #      #    # #    # #    # #     # #    #   #   #    # #    #
 ######  ###### #####   ####   ####  #     # #    #   #    ####  #    #

*/
class DebugMatch extends Match {
    constructor() {
        super();
        this.map = new Map();
        this.name = "Debug Match";
        this.description = "A match for debugging purposes.";
        this.setup();
    }

    setup = () => {
        game.debug.all = true;
        game.player.camera._3D = true;
        game.player.camera.angle = 0.5;
        game.player.character = new Jetbike(
            allID++,
            new Vect3((this.map.w / 2), (this.map.h / 2), 0),
            game.player,
            { name: 'Cpt. Fabius', gfx: 'img/sprites/jetbike' });
        game.player.camera.target = game.player.character;
        for (let i = 0; i < 5; i++) {
            this.map.blocks.push(new Ammo_Ballistic(
                allID++,
                new Vect3(Math.round(Math.random() * this.map.w), Math.round(Math.random() * this.map.h), 0),
                new Vect3(128, 128, 64))
            );
            this.map.blocks.push(new Ammo_Plasma(
                allID++,
                new Vect3(Math.round(Math.random() * this.map.w), Math.round(Math.random() * this.map.h), 0),
                new Vect3(128, 128, 64))
            );
        }
        this.map.blocks.push(new WeaponPickup(
            allID++,
            new Vect3((this.map.w / 2) + 200, (this.map.h / 2), 0),
            new Vect3(0, 0, 0, { weapon: 'rifle', pickupDelay: 0 }))
        );

        // this.bots.push(new Bot()) //Kevin / Jae'Sin
        // this.bots[this.bots.length - 1].character = new Jetbike(
        //     allID++,
        //     new Vect3((this.map.w / 2) - 1000, (this.map.h / 2) - 1000, 0),
        //     this.bots[this.bots.length - 1],
        //     { name: getName(), team: 1, gfx: 'img/sprites/dark2', color: [0, 0, 255] }
        // );
        // // add a pistol to the last bot's character's inventory
        // this.bots[this.bots.length - 1].character.inventory.push(new Pistol())

        // this.command('new_friend');

        this.map.blocks.push(new Block(
            allID++,
            new Vect3((this.map.w / 2) - 300, (this.map.h / 2) - 0, 0),
            new Vect3(128, 128, 64),
            { color: [101, 101, 101], colorSide: [201, 201, 201], imgFile: 'img/tiles/wall_top.png', imgFileSide: 'img/tiles/wall_side.png' }))
        // this.map.blocks[this.map.blocks.length - 1].HB.pos.z = 100;

        this.map.buildNavMesh();
    }

    draw() {

        // //FPS Information
        // ctx.fillStyle = "#FFFFFF";
        // ctx.font = '12px Jura';
        // ctx.fillText(game.fps, 200, 120);
        // ctx.fillText(game.fpsAVG, 200, 140);
        // // Set up some basic styling
        // ctx.strokeStyle = 'green';
        // ctx.fillStyle = 'green';
        // ctx.lineWidth = 2;

        // //draw transparent background behind fps bar
        // ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
        // ctx.fillRect(10, 100, 180, 60);
        // // Draw the FPS graph line
        // ctx.beginPath();
        // for (let i = 0; i < game.frameList.length; i++) {
        //     const fpsValue = Math.min(game.frameList[i], 60); // Cap FPS to avoid spikes
        //     const x = 10 + (i / (game.frameList.length - 1)) * 180;
        //     const y = 100 + (fpsValue / 60) * 60; // Scale FPS to height
        //     if (i === 0) {
        //         ctx.moveTo(x, y);
        //     } else {
        //         ctx.lineTo(x, y);
        //     }
        // }
        // ctx.stroke();
        // document.getElementById("debugger").style.display = "block";
    }
}