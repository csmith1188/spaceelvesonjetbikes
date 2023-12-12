//Variables
let canvas;
let ctx;
//Create Game variables

let gameLoop;
let game;
let allID = 0;
let ticks = 0;


/*
      ::::::::  :::::::::: ::::::::::: :::    ::: :::::::::
    :+:    :+: :+:            :+:     :+:    :+: :+:    :+:
   +:+        +:+            +:+     +:+    +:+ +:+    +:+
  +#++:++#++ +#++:++#       +#+     +#+    +:+ +#++:++#+
        +#+ +#+            +#+     +#+    +#+ +#+
#+#    #+# #+#            #+#     #+#    #+# #+#
########  ##########     ###      ########  ###
*/

window.onload = function () {
    canvas = document.getElementById("game-canvas");
    ctx = canvas.getContext("2d");

    setupInputs();

    //Game
    game = new Game();
    game.debug = false;

    game.match = new Match();
    game.match.map = new Map();

    //Player
    game.player = new Player();
    game.player.character = new Character(allID++, (game.match.map.w / 2), (game.match.map.h / 2), game.player);
    game.player.camera = new Camera({ target: game.player.character });

    // makeGame(['blocks']);
    game.match.map.blocks.push(new Block(allID++, (game.match.map.w / 2), (game.match.map.h / 2), 0, 32, 32, 100, { color: '#333333', colorSide: '#666666' }))

    game.match.map.buildNavMesh();

    //start game loop
    //Run the step() function every 16ms (60fps)
    gameLoop = setInterval(step, 16);

    draw();

}

/*
      :::::::: ::::::::::: :::::::::: :::::::::
    :+:    :+:    :+:     :+:        :+:    :+:
   +:+           +:+     +:+        +:+    +:+
  +#++:++#++    +#+     +#++:++#   +#++:++#+
        +#+    +#+     +#+        +#+
#+#    #+#    #+#     #+#        #+#
########     ###     ########## ###
*/

function step() {
    // The next two lines will always max screen
    game.window.h = window.innerHeight;
    game.window.w = window.innerWidth;
    game.player.camera.radius = Math.sqrt((game.window.w / 2) ** 2 + (game.window.h / 2) ** 2)

    canvas.width = game.window.w;
    canvas.height = game.window.h;

    //Put Bot player characters into a list
    let npcs = [];
    for (const npc in game.match.bots) {
        npcs.push(game.match.bots[npc].character);
    }

    if (!game.paused) {

        game.match.step();
        game.match.map.step();

        //Do all collision. It has to be in this order, or else pads/blocks won't activate for players and npcs
        for (const block of game.match.map.blocks) {
            block.collide([game.player.character, ...npcs, ...game.match.map.blocks])
        }
        for (const missile of game.match.map.missiles) {
            missile.collide([game.player.character, ...npcs, ...game.match.map.blocks])
        }
        for (const debris of game.match.map.debris) {
            debris.collide([game.player.character, ...npcs, ...game.match.map.debris])
        }
        game.player.character.collide([...npcs, ...game.match.map.blocks, ...game.match.map.debris])
        for (const npc of npcs) {
            npc.collide([game.player.character, ...npcs, ...game.match.map.blocks, ...game.match.map.debris])
        }

        //Do all steps and movement
        game.player.controller.read();
        game.player.character.step(game.player.controller);
        for (const bot of game.match.bots) {
            bot.AI();
            bot.character.step(bot.controller);
        }
        for (const block of game.match.map.blocks) {
            block.step();
        }
        for (const missile of game.match.map.missiles) {
            missile.step();
        }
    } else {
        game.player.controller.read();

    }

    // Move camera to next sensible target when player character is inactive or missing
    if (!game.player.character.active) {
        game.gameover = true;
        if (game.player.character.lastColNPC)
            if (game.player.character.lastColNPC.active)
                game.player.camera.target = game.player.character.lastColNPC
            else
                for (const npc of npcs) {
                    if (npc.active && npc.team == game.player.character.team)
                        game.player.camera.target = npc
                }
        if (!game.player.camera.target)
            for (const npc of npcs) {
                if (npc.active)
                    game.player.camera.target = npc
            }
    }

    //Update Camera Position
    if (game.player.camera.target) {
        game.player.camera.x = game.player.camera.target.HB.pos.x;
        game.player.camera.y = game.player.camera.target.HB.pos.y;
    }

    //Draw game
    draw();
    ticks++;
}

/*
      :::::::::  :::::::::      :::     :::       :::
     :+:    :+: :+:    :+:   :+: :+:   :+:       :+:
    +:+    +:+ +:+    +:+  +:+   +:+  +:+       +:+
   +#+    +:+ +#++:++#:  +#++:++#++: +#+  +:+  +#+
  +#+    +#+ +#+    +#+ +#+     +#+ +#+ +#+#+ +#+
 #+#    #+# #+#    #+# #+#     #+#  #+#+# #+#+#
#########  ###    ### ###     ###   ###   ###
*/

function draw() {
    //Clear the canvas 
    ctx.fillStyle = "#333300";
    ctx.fillRect(0, 0, game.window.w, game.window.h);

    //Draw Map
    game.match.map.draw(game.player.character);

    //Put Bot player characters into a list
    let npcs = [];
    for (const npc in game.match.bots) {
        npcs.push(game.match.bots[npc].character);
    }

    let renderList =
        [game.player.character, ...game.match.map.blocks, ...game.match.map.missiles, ...game.match.goals, ...game.match.map.debris, ...npcs]
            .sort((a, b) => {
                if (a.y + a.z < b.y + b.z) return -1;
                if (a.y + a.z > b.y + b.z) return 1;
                return 0;
            });
    for (const entity of renderList) {
        entity.draw(game.player.character);
    }

    //Draw Map Lighting
    game.match.map.lighting();

    //Draw HUD
    game.player.interface.drawHUD();

    //Draw Controller HUD
    game.player.controller.draw();
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

function makeGame(type) {

    if (type.includes('aitest')) {
        game.match.bots.push(new Bot()) //Kevin
        game.match.bots[game.match.bots.length - 1].character = new Character(allID++, (game.match.map.w / 2) + 1000, (game.match.map.h / 2) - 1000, game.match.bots[game.match.bots.length - 1], { target: game.player.character, nameTag: 'Jaysin', gfx: 'img/sprites/dark2', team: 1 });
    }
}

class Vect2 {
    constructor(x, y) {
        this.x = x || 0;
        this.y = y || 0;
    }
    compare(target) {
        let xd = target.x - this.x;
        let yd = target.y - this.y;
        let dist2 = Math.sqrt(xd ** 2 + yd ** 2);
        return {
            angle2: new Vect3(xd / dist2, yd / dist2, 0),
            difference: new Vect3(xd, yd, zd),
            distance2: dist2,
        }
    }
}

class Vect3 extends Vect2 {
    constructor(x, y, z) {
        super(x, y)
        this.z = z || 0;
    }
    compare(target) {
        let xd = target.x - this.x;
        let yd = target.y - this.y;
        let zd = target.z - this.z;
        let dist2 = Math.sqrt(xd ** 2 + yd ** 2);
        let dist3 = Math.sqrt(xd ** 2 + yd ** 2 + zd ** 2);
        return {
            angle2: new Vect3(xd / dist2, yd / dist2, 0),
            angle3: new Vect3(xd / dist3, yd / dist3, zd / dist3),
            difference: new Vect3(xd, yd, zd),
            distance2: dist2,
            distance3: dist3
        }
    }
}

class Rect {
    constructor(x, y, w, h) {
        this.x = x || 0;
        this.y = y || 0;
        this.w = w || 0;
        this.h = h || 0;
    }
    center() {
        return {
            x: this.x + (this.w / 2),
            y: this.y + (this.h / 2)
        }
    }
    collideRect(collider) {
        if (this.x < collider.x + collider.w && this.x + this.w > collider.x)
            if (this.y < collider.y + collider.h && this.y + this.h > collider.y)
                return true
        return false
    }
}

class Circle {
    constructor(x, y, r) {
        this.x = x || 0;
        this.y = y || 0;
        this.r = r || 0;
    }
}

class Cube {
    constructor(origin, volume) {
        this.pos = origin;
        this.volume = volume;
        this.end = new Vect3(origin.x + volume.x, origin.y + volume.y, origin.z + volume.z);
    }
    half() {
        return new Vect3(this.volume.x / 2, this.volume.y / 2, this.volume.z / 2)
    }
    center() {
        return new Vect3(this.pos.x + (this.volume.x / 2), this.pos.x + (this.volume.y / 2), this.pos.x + (this.volume.z / 2))
    }
}

class Cylinder {
    constructor(origin, radius, height) {
        this.pos = origin;
        this.radius = radius;
        this.height = height;
    }
    collide(c) {
        if (c instanceof Rect) {
            testX = this.pos.x;
            testY = this.pos.y;

            //Find edge to check
            if (this.pos.x < c.pos.x) testX = c.pos.x;
            else if (this.pos.x > c.pos.x + c.volume.x) testX = c.volume.x + c.volume.x;
            if (this.pos.y < c.pos.y) testY = c.pos.y;
            else if (this.pos.y > c.pos.y + c.volume.y) testy = c.volume.y + c.volume.y;

            let distX = this.pos.x - textX;
            let distY = this.pos.y - textY;
            let distance = Math.sqrt(distX ** 2 + distY ** 2);

            if (distance <= this.radius)
                return true;
            return false;
        } else if (c instanceof Cube) {
            let testX = this.pos.x;
            let testY = this.pos.y;

            //Find edge to check
            if (this.pos.x < c.pos.x) testX = c.pos.x;
            else if (this.pos.x > c.pos.x + c.volume.x) testX = c.pos.x + c.volume.x;
            if (this.pos.y < c.pos.y) testY = c.pos.y;
            else if (this.pos.y > c.pos.y + c.volume.y) testY = c.pos.y + c.volume.y;

            let distX = this.pos.x - testX;
            let distY = this.pos.y - testY;
            let distance = Math.sqrt(distX ** 2 + distY ** 2);

            if (distance <= this.radius)
                // if (!this.pos.z >= c.pos.z + c.volume.z && !this.pos.z + this.height <= c.pos.z)
                return true;
            return false;
        } else if (c instanceof Circle) {

        } else if (c instanceof Cylinder) {

        } else {

        }
    }
}