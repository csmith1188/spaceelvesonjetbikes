class Match {
    constructor() {
        this.despawnTimer = 3600; // 1 minute
        this.ticks = -1;
        this.paused = false;
        this.map = new Map();
        this.bots = [];
        this.blocks = []; // Different from map blocks. Think pickups and dropped items
        this.runFunc = []; // A list of functions to run every step
        game.player.interface.drawFunc = []; // clear other interface draw functions
    }

    step() {
        if (!this.paused) {

            game.player.character.step(game.player.controller);

            //Put Bot player characters into a list
            let npcs = [];
            for (const npc in this.bots) {
                npcs.push(this.bots[npc].character);
            }

            for (const bot of this.bots) {
                bot.AI();
                bot.character.step(bot.controller);
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

            for (const e of this.bots) {
                if (e.cleanup && !e.active) {
                    //Remove npcs
                    this.npcs = this.npcs.filter(function (el) { return el != e; });
                }
            }

            // Run all runFunc
            for (const func of this.runFunc) {
                func();
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
}

/*
  #####                                #####
 #     # #####   ##   #####  #####    #     #  ####  #####  ###### ###### #    #
 #         #    #  #  #    #   #      #       #    # #    # #      #      ##   #
  #####    #   #    # #    #   #       #####  #      #    # #####  #####  # #  #
       #   #   ###### #####    #            # #      #####  #      #      #  # #
 #     #   #   #    # #   #    #      #     # #    # #   #  #      #      #   ##
  #####    #   #    # #    #   #       #####   ####  #    # ###### ###### #    #

*/
class Start_Screen extends Match {
    constructor() {
        super();
        this.map = new Map_Deathbox();
        this.name = "Start Screen";
        this.description = "The start screen.";
        this.setup();
    }

    setup = () => {
        game.player.character.active = false;
        this.map.blocks.push(new Block(
            allID++,
            new Vect3((this.map.w / 2) - 0, (this.map.h / 2) + 100, 0),
            new Vect3(0, 0, 0),
            { color: [101, 101, 101], colorSide: [201, 201, 201] }))
        game.player.camera.target = this.map.blocks[this.map.blocks.length - 1];
        // loop twice
        for (let i = 0; i < 2; i++) {
            this.bots.push(new Bot()) //Kevin / Jae'Sin
            this.bots[this.bots.length - 1].character = new Jetbike(
                allID++,
                new Vect3(Math.random() * this.map.w, Math.random() * this.map.h),
                this.bots[this.bots.length - 1],
                { name: getName(), team: 1, gfx: 'img/sprites/dark2', color: [0, 0, 255], muted: true }
            );
            this.bots[this.bots.length - 1].character.inventory.push(new Pistol());
            this.bots.push(new Bot()) //Kevin / Jae'Sin
            this.bots[this.bots.length - 1].character = new Jetbike(
                allID++,
                new Vect3(Math.random() * this.map.w, Math.random() * this.map.h),
                this.bots[this.bots.length - 1],
                { name: getName(), team: 0, gfx: 'img/sprites/dark1', color: [0, 128, 0], muted: true }
            );
            this.bots[this.bots.length - 1].character.inventory.push(new Pistol());
        }
        game.menu = game.menus.main;
    }

    step = () => {
        super.step();
        // counter number of bot characters on each team
        let team0 = 0;
        let team1 = 0;
        for (let i = 0; i < this.bots.length; i++) {
            if (this.bots[i].character.team == 0) team0++;
            if (this.bots[i].character.team == 1) team1++;
        }
        // if there are more bots on team 0 than team 1, add a bot to team 1
        if (team0 > team1) {
            this.bots.push(new Bot()) //Kevin / Jae'Sin
            this.bots[this.bots.length - 1].character = new Jetbike(
                allID++,
                new Vect3(Math.random() * this.map.w, Math.random() * this.map.h),
                this.bots[this.bots.length - 1],
                { name: getName(), team: 1, gfx: 'img/sprites/dark2', color: [0, 0, 255], muted: true }
            );
            this.bots[this.bots.length - 1].character.inventory.push(new Pistol());
        }
        // if there are more bots on team 1 than team 0, add a bot to team 0
        if (team1 > team0) {
            this.bots.push(new Bot()) //Kevin / Jae'Sin
            this.bots[this.bots.length - 1].character = new Jetbike(
                allID++,
                new Vect3(Math.random() * this.map.w, Math.random() * this.map.h),
                this.bots[this.bots.length - 1],
                { name: getName(), team: 0, gfx: 'img/sprites/dark1', color: [0, 0, 255], muted: true }
            );
            this.bots[this.bots.length - 1].character.inventory.push(new Pistol());
        }
    }

    draw() {
        // draw a vignette with a gradient
        let gradient = ctx.createRadialGradient(game.window.w / 2, game.window.h / 2, 0, game.window.w / 2, game.window.h / 2, game.window.w / 2);
        gradient.addColorStop(0, "rgba(20,0,20,0)");
        gradient.addColorStop(1, "rgba(20,0,20,1)");
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, game.window.w, game.window.h);
        // draw the title
        ctx.fillStyle = "#FFFFFF";
        ctx.font = "36px Jura";
        ctx.textAlign = "center";
        // first draw the text in black to create a shadow
        ctx.fillStyle = "#000000";
        ctx.fillText(`Space Elves on Jetbikes`, game.window.w / 2 + 2, game.window.h / 2 - 88);
        ctx.fillStyle = "#FFFFFF";
        // then draw the text in white
        ctx.fillText(`Space Elves on Jetbikes`, game.window.w / 2, game.window.h / 2 - 90);
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
        game.debug = true;

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
                new Vect3(128, 128, 64)));
            this.map.blocks.push(new Ammo_Plasma(
                allID++,
                new Vect3(Math.round(Math.random() * this.map.w), Math.round(Math.random() * this.map.h), 0),
                new Vect3(128, 128, 64)));
        }
        this.map.blocks.push(new WeaponPickup(
            allID++,
            new Vect3((this.map.w / 2) + 200, (this.map.h / 2), 0),
            new Vect3(0, 0, 0, { weapon: 'rifle', pickupDelay: 0 })));

        // this.bots.push(new Bot()) //Kevin / Jae'Sin
        // this.bots[this.bots.length - 1].character = new Jetbike(
        //     allID++,
        //     new Vect3((this.map.w / 2) - 1000, (this.map.h / 2) - 1000, 0),
        //     this.bots[this.bots.length - 1],
        //     { name: getName(), team: 1, gfx: 'img/sprites/dark2', color: [0, 0, 255] }
        // );
        // // add a pistol to the last bot's character's inventory
        // this.bots[this.bots.length - 1].character.inventory.push(new Pistol())

        this.map.blocks.push(new Block(
            allID++,
            new Vect3((this.map.w / 2) - 300, (this.map.h / 2) - 0, 0),
            new Vect3(128, 128, 64),
            { color: [101, 101, 101], colorSide: [201, 201, 201] }))
        // this.map.blocks[this.map.blocks.length - 1].HB.pos.z = 100;
    }
}

/*
      ::::::::      :::       :::   :::   ::::::::::            :::   :::    ::::::::  :::::::::  :::::::::: ::::::::
    :+:    :+:   :+: :+:    :+:+: :+:+:  :+:                  :+:+: :+:+:  :+:    :+: :+:    :+: :+:       :+:    :+:
   +:+         +:+   +:+  +:+ +:+:+ +:+ +:+                 +:+ +:+:+ +:+ +:+    +:+ +:+    +:+ +:+       +:+
  :#:        +#++:++#++: +#+  +:+  +#+ +#++:++#            +#+  +:+  +#+ +#+    +:+ +#+    +:+ +#++:++#  +#++:++#++
 +#+   +#+# +#+     +#+ +#+       +#+ +#+                 +#+       +#+ +#+    +#+ +#+    +#+ +#+              +#+
#+#    #+# #+#     #+# #+#       #+# #+#                 #+#       #+# #+#    #+# #+#    #+# #+#       #+#    #+#
########  ###     ### ###       ### ##########          ###       ###  ########  #########  ########## ########
*/

/*
 #######                  #     #
 #        ####  #####     #     #  ####  #    #  ####  #####
 #       #    # #    #    #     # #    # ##   # #    # #    #
 #####   #    # #    #    ####### #    # # #  # #    # #    #
 #       #    # #####     #     # #    # #  # # #    # #####
 #       #    # #   #     #     # #    # #   ## #    # #   #
 #        ####  #    #    #     #  ####  #    #  ####  #    #

*/
class Match_ForHonor extends Match {
    constructor() {
        super();
        this.map = new Map_Deathbox();
        this.name = "For Honor";
        this.description = "A duel to the death.";
        this.setup();
    }
    setup = () => {
        game.player.character = new Jetbike(
            allID++,
            new Vect3((this.map.w / 2), (this.map.h / 2) + 200, 0),
            game.player,
            { name: 'Cpt. Fabius', gfx: 'img/sprites/jetbike' });
        this.bots.push(new Player()) //Kevin / Jae'Sin
        this.bots[this.bots.length - 1].character = new Jetbike(
            allID++,
            new Vect3((this.map.w / 2) - 1000, (this.map.h / 2) - 1000, 0),
            this.bots[this.bots.length - 1],
            { name: getName(), team: 1, gfx: 'img/sprites/dark2', color: [0, 0, 255] }
        );
        this.bots[this.bots.length - 1].controller = new Controller();
        this.bots[this.bots.length - 1].name = 'Player 2';
        this.blocks.push(new Block(
            allID++,
            new Vect3((this.map.w / 2), (this.map.h / 2) - 0, 0),
            new Vect3(0, 0, 0),
            { solid: false, visible: false }));
        game.player.camera.target = this.blocks[this.blocks.length - 1];
        this.map.blocks.push(new WeaponPickup(
            allID++,
            new Vect3((this.map.w / 2) - 100, (this.map.h / 2), 0),
            new Vect3(0, 0, 0),
            { weapon: 'pistol', pickupDelay: 0 }));
        this.map.blocks.push(new WeaponPickup(
            allID++,
            new Vect3((this.map.w / 2), (this.map.h / 2), 0),
            new Vect3(0, 0, 0),
            { weapon: 'rifle', pickupDelay: 0 }));
        this.map.blocks.push(new WeaponPickup(
            allID++,
            new Vect3((this.map.w / 2) + 100, (this.map.h / 2), 0),
            new Vect3(0, 0, 0),
            { weapon: 'flamer', pickupDelay: 0 }));
    }
}

/*
 #######
 #        ####  #####  ###### #    # ###### #####
 #       #    # #    # #      #    # #      #    #
 #####   #    # #    # #####  #    # #####  #    #
 #       #    # #####  #      #    # #      #####
 #       #    # #   #  #       #  #  #      #   #
 #        ####  #    # ######   ##   ###### #    #
*/
class Match_ForEver extends Match {
    constructor() {
        super();
        this.map = new Map_FieldCity();
        this.name = "Forever";
        this.description = "Survive against the endless waves of enemies.";
        this.waves = 0;
        this.waveTime = 2700; // 1 wave every 45 seconds  
        this.setup();
    }

    setup() {
        game.player.character = new Jetbike(
            allID++,
            new Vect3((this.map.w / 2), (this.map.h / 2) + 200),
            game.player,
            { name: 'Cpt. Fabius', gfx: 'img/sprites/jetbike' });
        game.player.camera.target = game.player.character

        /*
          ___
         | _ \_____ __ _____ _ _ _  _ _ __ ___
         |  _/ _ \ V  V / -_) '_| || | '_ (_-<
         |_| \___/\_/\_/\___|_|  \_,_| .__/__/
                                     |_|
        */
        for (let i = 0; i < 10; i++) {
            this.map.blocks.push(new Ammo_Ballistic(
                allID++,
                new Vect3(Math.round(Math.random() * this.map.w), Math.round(Math.random() * this.map.h), 0),
                new Vect3(128, 128, 64),
                { livetime: this.waveTime, dying: true }))
            this.map.blocks.push(new Ammo_Plasma(
                allID++,
                new Vect3(Math.round(Math.random() * this.map.w), Math.round(Math.random() * this.map.h), 0),
                new Vect3(128, 128, 64),
                { livetime: this.waveTime, dying: true }))
            this.map.blocks.push(new HealthPickup(
                allID++,
                new Vect3(Math.round(Math.random() * this.map.w), Math.round(Math.random() * this.map.h), 0),
                new Vect3(128, 128, 64),
                { livetime: this.waveTime, dying: true }))
        }

    }

    /*
      __  __      _        _
     |  \/  |__ _(_)_ _   | |   ___  ___ _ __
     | |\/| / _` | | ' \  | |__/ _ \/ _ \ '_ \
     |_|  |_\__,_|_|_||_| |____\___/\___/ .__/
                                        |_|
    */
    step() {
        super.step();
        if (game.player.character.active && game.match.ticks % this.waveTime == 0) {
            this.waves++; // 1 wave every 60 seconds

            /*
              ___                _
             | __|_ _  ___ _ __ (_)___ ___
             | _|| ' \/ -_) '  \| / -_|_-<
             |___|_||_\___|_|_|_|_\___/__/

            */
            for (let i = 0; i < Math.ceil(this.waves / 2); i++) {
                this.bots.push(new Bot()) //Kevin / Jae'Sin
                this.bots[this.bots.length - 1].character = new Jetbike(
                    allID++,
                    new Vect3(Math.round(Math.random() * this.map.w), Math.round(Math.random() * this.map.h), 0),
                    this.bots[this.bots.length - 1],
                    {
                        target: game.player.character,
                        // target: this.bots[this.bots.length - 1].character,
                        name: getName(), team: 1, gfx: 'img/sprites/dark2', color: [0, 0, 255],
                    }
                );
                let rand = Math.floor(Math.random() * 4);
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
                        this.bots[this.bots.length - 1].character.inventory.push(new Lance())
                        break;
                }
                this.bots[this.bots.length - 1].character.item = Math.round(Math.random());
            }

            /*
              ___
             | _ \_____ __ _____ _ _ _  _ _ __ ___
             |  _/ _ \ V  V / -_) '_| || | '_ (_-<
             |_| \___/\_/\_/\___|_|  \_,_| .__/__/
                                         |_|
            */
            for (let i = 0; i < 5; i++) {
                this.map.blocks.push(new Ammo_Ballistic(
                    allID++,
                    new Vect3(Math.round(Math.random() * this.map.w), Math.round(Math.random() * this.map.h), 0),
                    new Vect3(128, 128, 64),
                    { livetime: this.waveTime * 3, dying: true }))
                this.map.blocks.push(new Ammo_Plasma(
                    allID++,
                    new Vect3(Math.round(Math.random() * this.map.w), Math.round(Math.random() * this.map.h), 0),
                    new Vect3(128, 128, 64),
                    { livetime: this.waveTime * 3, dying: true }))
                this.map.blocks.push(new HealthPickup(
                    allID++,
                    new Vect3(Math.round(Math.random() * this.map.w), Math.round(Math.random() * this.map.h), 0),
                    new Vect3(128, 128, 64),
                    { livetime: this.waveTime * 3, dying: true }))
            }

            // Random weapon pickup in the middle of the map
            let rand = Math.floor(Math.random() * 4);
            switch (rand) {
                case 0:
                    this.map.blocks.push(new WeaponPickup(
                        allID++,
                        new Vect3((this.map.w / 2), (this.map.h / 2), 0),
                        new Vect3(0, 0, 0),
                        { weapon: 'pistol', pickupDelay: 0, livetime: this.waveTime * 3, dying: true }))
                    break;
                case 1:
                    this.map.blocks.push(new WeaponPickup(
                        allID++,
                        new Vect3((this.map.w / 2), (this.map.h / 2), 0),
                        new Vect3(0, 0, 0),
                        { weapon: 'rifle', pickupDelay: 0, livetime: this.waveTime * 3, dying: true }))
                    break;
                case 2:
                    this.map.blocks.push(new WeaponPickup(
                        allID++,
                        new Vect3((this.map.w / 2), (this.map.h / 2), 0),
                        new Vect3(0, 0, 0),
                        { weapon: 'flamer', pickupDelay: 0, livetime: this.waveTime * 3, dying: true }))
                    break;
                case 3:
                    this.map.blocks.push(new WeaponPickup(
                        allID++,
                        new Vect3((this.map.w / 2), (this.map.h / 2), 0),
                        new Vect3(0, 0, 0),
                        { weapon: 'lance', pickupDelay: 0, livetime: this.waveTime * 3, dying: true }))
                    break;
            }

            /*
              ___    _             _
             | __| _(_)___ _ _  __| |___
             | _| '_| / -_) ' \/ _` (_-<
             |_||_| |_\___|_||_\__,_/__/

            */
            if (game.match.ticks % this.waveTime * 2 == 0) {
                let spawns = (this.waves > 1) ? Math.floor(this.waves / 4) : 1;
                for (let i = 0; i < spawns; i++) {
                    // Friendly
                    this.bots.push(new Bot()) //Big ounce / Loh'Ghan
                    this.bots[this.bots.length - 1].character = new Character(
                        allID++,
                        new Vect3((this.map.w / 2), (this.map.h / 2)),
                        this.bots[this.bots.length - 1],
                        {
                            target: null,
                            // target: this.bots[this.bots.length - 1].character,
                            name: getName(), team: 0, gfx: 'img/sprites/dark1', color: [0, 255, 0],
                            hover: 16, airAccel: new Vect3(0.15, 0.15, 1),
                            runFunc: [
                                function () { }.bind(this.bots[this.bots.length - 1].character)
                            ]
                        }
                    );
                    this.bots[this.bots.length - 1].character.HB = new Cylinder(new Vect3(Math.round(Math.random() * this.map.w), Math.round(Math.random() * this.map.h), 0), 29, 37);
                    let rand = Math.floor(Math.random() * 4);
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
            }
        }

        /*
          ___        _            _     __  __      _      _
         | _ \___ __| |_ __ _ _ _| |_  |  \/  |__ _| |_ __| |_
         |   / -_|_-<  _/ _` | '_|  _| | |\/| / _` |  _/ _| ' \
         |_|_\___/__/\__\__,_|_|  \__| |_|  |_\__,_|\__\__|_||_|

        */
        if (!game.player.character.active) {
            if (game.match.bots.length) {
                // loop through all the bots and mute their characters
                for (let i = 0; i < game.match.bots.length; i++) {
                    game.match.bots[i].character.muted = true;
                }
                game.player.camera.target = game.match.bots[0].character; // set camera to first bot
            }
            if (game.player.controller.buttons.inventory1.current)
                game.match = new Match_ForEver();
        }
    }

    draw() {
        super.draw();

        /*
           ___                  __  __         _       ___
          / __|__ _ _ __  ___  |  \/  |___  __| |___  | _ ) __ _ _ _  _ _  ___ _ _
         | (_ / _` | '  \/ -_) | |\/| / _ \/ _` / -_) | _ \/ _` | ' \| ' \/ -_) '_|
          \___\__,_|_|_|_\___| |_|  |_\___/\__,_\___| |___/\__,_|_||_|_||_\___|_|

        */
        if (game.match.ticks < 240) {
            let alpha = 1 - (game.match.ticks) / 240;
            //first draw the text in black to create a shadow
            ctx.fillStyle = "rgba(0,0,0," + alpha + ")";
            ctx.font = "30px Jura";
            ctx.textAlign = "center";
            ctx.fillText(this.name, game.window.w / 2 + 2, game.window.h / 2 - 138);
            ctx.font = "20px Jura";
            ctx.fillText(this.description, game.window.w / 2 + 2, game.window.h / 2 - 98);
            //then draw the text in white
            ctx.fillStyle = "rgba(255,255,255," + alpha + ")";
            ctx.font = "30px Jura";
            ctx.textAlign = "center";
            ctx.fillText(this.name, game.window.w / 2, game.window.h / 2 - 140);
            ctx.font = "20px Jura";
            ctx.fillText(this.description, game.window.w / 2, game.window.h / 2 - 100);
        }


        /*
          ___     _            __                 _      _    _ _ _   _
         |_ _|_ _| |_ ___ _ _ / _|__ _ __ ___    /_\  __| |__| (_) |_(_)___ _ _  ___
          | || ' \  _/ -_) '_|  _/ _` / _/ -_)  / _ \/ _` / _` | |  _| / _ \ ' \(_-<
         |___|_||_\__\___|_| |_| \__,_\__\___| /_/ \_\__,_\__,_|_|\__|_\___/_||_/__/

        */
        // Score
        if (game.player.character.active) {
            // loop through all the bots and count enemies
            let enemies = 0;
            for (let i = 0; i < game.match.bots.length; i++) {
                if (game.match.bots[i].character.team != game.player.character.team) enemies++;
            }
            let matchBox = new Vect2((game.window.w / 2) - 150, game.window.h - 280);
            ctx.textAlign = "left";
            ctx.font = '16px Jura';
            // first draw the text lines in black to create a shadow
            ctx.fillStyle = "#000000";
            ctx.fillText(`Wave:  ${game.match.waves}`, matchBox.x + 2, matchBox.y + 52);
            ctx.fillText(`Enemy: ${enemies}`, matchBox.x + 2, matchBox.y + 72);
            ctx.fillText(`Next: ${Math.floor((game.match.waveTime / 60)) - Math.floor((game.match.ticks % game.match.waveTime) / 60)}`, matchBox.x + 2, matchBox.y + 92);
            // then draw the text lines in white            
            ctx.fillStyle = "#FFFFFF";
            ctx.fillText(`Wave:  ${game.match.waves}`, matchBox.x, matchBox.y + 50);
            ctx.fillText(`Enemy: ${enemies}`, matchBox.x, matchBox.y + 70);
            ctx.fillText(`Next: ${Math.floor((game.match.waveTime / 60)) - Math.floor((game.match.ticks % game.match.waveTime) / 60)}`, matchBox.x, matchBox.y + 90);
        }


        // Waves when dead

        if (!game.player.character.active && !game.paused) {
            // draw number of waves to center of screen
            ctx.fillStyle = "#FFFFFF";
            ctx.font = "36px Jura";
            ctx.textAlign = "center";
            // first draw the text in black to create a shadow
            ctx.fillStyle = "#000000";
            ctx.fillText(`Waves: ${game.match.waves}`, game.window.w / 2 + 2, game.window.h / 2 + 2);
            ctx.fillStyle = "#FFFFFF";
            // then draw the text in white
            ctx.fillText(`Waves: ${game.match.waves}`, game.window.w / 2, game.window.h / 2);
            // draw restart prompt
            let promptButton;
            switch (game.player.controller.type) {
                case 'keyboard':
                    promptButton = 'Q';
                    break;
                case 'touch':
                    promptButton = 'Weapon';
                    break;
                case 'gamepad':
                    promptButton = 'X';
                    break;
                default:
                    promptButton = 'Weapon';
                    break;
            }
            ctx.font = "20px Jura";
            ctx.textAlign = "center";
            // first draw the text in black to create a shadow
            ctx.fillStyle = "#000000";
            ctx.fillText(`Press [ ${promptButton} ] to restart`, game.window.w / 2 + 2, game.window.h / 2 + 42);
            ctx.fillStyle = "#FFFFFF";
            // then draw the text in white
            ctx.fillText(`Press [ ${promptButton} ] to restart`, game.window.w / 2, game.window.h / 2 + 40);
            if (game.player.controller.type == 'touch') {
                let img = new Image();
                img.src = 'img/sprites/inventory/sword_inactive.png';
                ctx.drawImage(img, (game.window.w / 2) - 150, game.window.h - 64, 64, 64);
            }
        }
    }
}