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
    // game.match.map.postLoad();

    //Player
    game.player = new Player();
    game.player.character = new Character(allID++, (game.match.map.w / 2), (game.match.map.h / 2), game.player);
    game.player.camera = new Camera({ target: game.player.character });

    // makeGame(['aitest', 'randommap']);
    makeGame(['blocks']);


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
    game.player.camera.radius = Math.sqrt((game.window.w / 2)**2 + (game.window.h / 2)**2)

    canvas.width = game.window.w;
    canvas.height = game.window.h;

    //Put Bot player characters into a list
    let npcs = [];
    for (const npc in game.match.bots) {
        npcs.push(game.match.bots[npc].character);
    }

    //Handle goals and collisions
    for (const goal of game.match.goals) {
        if (game.match.goalIndex >= game.match.goals.length) {
            game.match.goalIndex = 0;
            game.match.lapEnd = ticks;
            if (game.player.best.lap == 0 || game.player.best.lap > game.match.lapEnd - game.match.lapStart) game.player.best.lap = game.match.lapEnd - game.match.lapStart;
            game.match.lapStart = ticks;
        }
        goal.activeGoal = false;
        if (game.match.goals.indexOf(goal) == game.match.goalIndex)
            goal.activeGoal = true;
        goal.collide([game.player.character, ...npcs])
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
        for (const debris of game.match.map.debris) {
            if (debris.active)
                debris.step();
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
        game.player.camera.x = game.player.camera.target.x;
        game.player.camera.y = game.player.camera.target.y;
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

    if (type.includes('pool')) {
        game.match.map.blocks.push(new PolyBlock(allID++, (game.match.map.w / 2), (game.match.map.h / 2), { coords: [[0, 200], [300, 500], [0, 800], [-300, 500]], splash: '#ccccee', color: '#3366ff' }))
        game.match.map.blocks.push(new PolyBlock(allID++, (game.match.map.w / 2), (game.match.map.h / 2), { coords: [[0, 800], [300, 1100], [0, 1400], [-300, 1100]], splash: '#ccccee', color: '#3366ff' }))
    }
    if (type.includes('randommap')) {
        // Random Map
        for (let i = 0; i < 100; i++) {
            let tempx = (Math.floor(Math.random() * (game.match.map.w / 48)) * 48) + 24
            let tempy = (Math.floor(Math.random() * (game.match.map.h / 48)) * 48) + 24
            let tempw = (Math.ceil(Math.random() * 2) * 48)
            let temph = (Math.ceil(Math.random() * 2) * 48)
            game.match.map.blocks.push(new Block(allID++, tempx, tempy, { color: '#333333', colorSide: '#666666', w: tempw, h: temph, d: 64 }))
        }
        for (let i = 0; i < 25; i++) {
            let tempx = (Math.floor(Math.random() * (game.match.map.w / 48)) * 48) + 24
            let tempy = (Math.floor(Math.random() * (game.match.map.h / 48)) * 48) + 24
            game.match.map.blocks.push(new JumpPad(allID++, tempx, tempy, { color: '#FF6600' }))
        }
        for (let i = 0; i < 25; i++) {
            let tempx = (Math.floor(Math.random() * (game.match.map.w / 48)) * 48) + 24
            let tempy = (Math.floor(Math.random() * (game.match.map.h / 48)) * 48) + 24
            game.match.map.blocks.push(new SpeedPad(allID++, tempx, tempy, { color: '#9999FF' }))
        }
        for (let i = 0; i < 25; i++) {
            let tempx = (Math.floor(Math.random() * (game.match.map.w / 48)) * 48) + 24
            let tempy = (Math.floor(Math.random() * (game.match.map.h / 48)) * 48) + 24
            game.match.map.blocks.push(new AmmoPickup(allID++, tempx, tempy))
        }
        for (let i = 0; i < 25; i++) {
            let tempx = (Math.floor(Math.random() * (game.match.map.w / 48)) * 48) + 24
            let tempy = (Math.floor(Math.random() * (game.match.map.h / 48)) * 48) + 24
            game.match.map.blocks.push(new AmmoPickup(allID++, tempx, tempy, { ammoType: 'flamer', ammoAmount: 25, color: "#FFFF00" }))
        }
        for (let i = 0; i < 10; i++) {
            let tempx = (Math.floor(Math.random() * (game.match.map.w / 48)) * 48) + 24
            let tempy = (Math.floor(Math.random() * (game.match.map.h / 48)) * 48) + 24
            game.match.map.blocks.push(new HealthBlock(allID++, tempx, tempy, { color: '#660000', healthCollide: -2 }))
        }
        for (let i = 0; i < 20; i++) {
            let tempx = (Math.floor(Math.random() * (game.match.map.w / 48)) * 48) + 24
            let tempy = (Math.floor(Math.random() * (game.match.map.h / 48)) * 48) + 24
            game.match.map.blocks.push(new HealthBlock(allID++, tempx, tempy, { color: '#006600', healthCollide: 1, powerCollide: 2 }))
        }
    }
    if (type.includes('track')) {
        // Race Track
        game.match.goals.push(new Goal(allID++, (game.match.map.w / 2) - 24, (game.match.map.h / 2) - 1000, { color: '#000066', colorActive: '#0000FF', w: 24, h: 144 }))
        game.match.goals.push(new Goal(allID++, (game.match.map.w / 2) - 500, (game.match.map.h / 2) - 1000, { color: '#000066', colorActive: '#0000FF', w: 24, h: 144 }))
        game.match.goals.push(new Goal(allID++, (game.match.map.w / 2) - 1000, (game.match.map.h / 2) - 1000, { color: '#000066', colorActive: '#0000FF', w: 24, h: 144 }))
        game.match.goals.push(new Goal(allID++, (game.match.map.w / 2) - 1250, (game.match.map.h / 2) - 500, { color: '#000066', colorActive: '#0000FF', w: 144, h: 24 }))
        game.match.goals.push(new Goal(allID++, (game.match.map.w / 2) - 1000, (game.match.map.h / 2), { color: '#000066', colorActive: '#0000FF', w: 144, h: 24 }))
        game.match.goals.push(new Goal(allID++, (game.match.map.w / 2) - 1250, (game.match.map.h / 2) + 750, { color: '#000066', colorActive: '#0000FF', w: 144, h: 24 }))
        game.match.goals.push(new Goal(allID++, (game.match.map.w / 2) - 1000, (game.match.map.h / 2) + 1000, { color: '#000066', colorActive: '#0000FF', w: 24, h: 144 }))
        game.match.goals.push(new Goal(allID++, (game.match.map.w / 2) - 500, (game.match.map.h / 2) + 750, { color: '#000066', colorActive: '#0000FF', w: 24, h: 144 }))
        game.match.goals.push(new Goal(allID++, (game.match.map.w / 2), (game.match.map.h / 2) + 1000, { color: '#000066', colorActive: '#0000FF', w: 24, h: 144 }))
        game.match.goals.push(new Goal(allID++, (game.match.map.w / 2) + 500, (game.match.map.h / 2) + 750, { color: '#000066', colorActive: '#0000FF', w: 24, h: 144 }))
        game.match.goals.push(new Goal(allID++, (game.match.map.w / 2) + 1000, (game.match.map.h / 2) + 1000, { color: '#000066', colorActive: '#0000FF', w: 24, h: 144 }))
        game.match.goals.push(new Goal(allID++, (game.match.map.w / 2) + 1250, (game.match.map.h / 2) + 750, { color: '#000066', colorActive: '#0000FF', w: 144, h: 24 }))
        game.match.goals.push(new Goal(allID++, (game.match.map.w / 2) + 1000, (game.match.map.h / 2), { color: '#000066', colorActive: '#0000FF', w: 144, h: 24 }))
        game.match.goals.push(new Goal(allID++, (game.match.map.w / 2) + 1250, (game.match.map.h / 2) - 500, { color: '#000066', colorActive: '#0000FF', w: 144, h: 24 }))
        game.match.goals.push(new Goal(allID++, (game.match.map.w / 2) + 1000, (game.match.map.h / 2) - 1000, { color: '#000066', colorActive: '#0000FF', w: 24, h: 144 }))
        game.match.goals.push(new Goal(allID++, (game.match.map.w / 2) + 500, (game.match.map.h / 2) - 1000, { color: '#000066', colorActive: '#0000FF', w: 24, h: 144 }))
        game.match.goals.push(new Goal(allID++, (game.match.map.w / 2) + 24, (game.match.map.h / 2) - 1000, { color: '#000066', colorActive: '#0000FF', w: 24, h: 144 }))

        // game.match.bots.push(new NPC(allID++, (game.match.map.w / 2) + 1000, (game.match.map.h / 2), { target: game.match.goals[0], nameTag: 'Rais', team: 0, gfx: 'img/sprites/dark1' })) //racer

        // game.player.camera.target = game.match.bots[game.match.bots.length - 1] //race-vision
    }
    if (type.includes('blocks')) {
        // Random Blocks
        for (let i = 0; i < 100; i++) {
            let tempx = (Math.floor(Math.random() * (game.match.map.w / 48)) * 48) + 24
            let tempy = (Math.floor(Math.random() * (game.match.map.h / 48)) * 48) + 24
            let tempw = (Math.ceil(Math.random() * 2) * 48)
            let temph = (Math.ceil(Math.random() * 2) * 48)
            game.match.map.blocks.push(new Block(allID++, tempx, tempy, { color: '#333333', colorSide: '#666666', w: tempw, h: temph, d: 64 }))
        }
    }

    if (type.includes('waves')) {
        game.match.map.blocks.push(new Wave(allID++, 0, (game.match.map.h / 2), { color: '#aaaaFF', w: 100, h: game.match.map.h, xspeed: 6, dxspeed: 6, repeat: true, startDelay: 0 }))
        game.match.map.blocks.push(new Wave(allID++, 0, (game.match.map.h / 2), { color: '#aaaaFF', w: 100, h: game.match.map.h, xspeed: 6, dxspeed: 6, repeat: true, startDelay: 300 }))
        game.match.map.blocks.push(new Wave(allID++, 0, (game.match.map.h / 2), { color: '#aaaaFF', w: 100, h: game.match.map.h, xspeed: 6, dxspeed: 6, repeat: true, startDelay: 360 }))
    }
    if (type.includes('lonewarrior')) {
        game.match.map.runFuncs.push(() => {
            if (ticks % 1600 == 0) {
                let tempx = Math.floor(Math.random() * game.match.map.w);
                let tempy = Math.floor(Math.random() * game.match.map.h);
                game.match.bots.push(new NPC(allID++, tempx, tempy, { item: Math.round(Math.random()), target: game.player.character, nameTag: 'Kevin' + allID, gfx: 'img/sprites/dark2' })) //Kevin
            }
        })
    }
    if (type.includes('ramps')) {
        game.match.map.blocks.push(new Wave(allID++, 7200 / 4, (game.match.map.h / 2), { color: '#aaaaFF', w: 100, h: 400 }))
        game.match.map.blocks.push(new Wave(allID++, 7200 / 2, (game.match.map.h / 2), { color: '#aaaaFF', w: 100, h: 400 }))
        game.match.map.blocks.push(new Wave(allID++, 7200 / 4 + 7200 / 2, (game.match.map.h / 2), { color: '#aaaaFF', w: 100, h: 400 }))
    }
    if (type.includes('dummy')) {
        game.match.bots.push(new NPC(allID++, (game.match.map.w / 2) + 100, (game.match.map.h / 2) - 100, { active: false, cleanup: false, target: game.player.character, nameTag: 'Kevin', gfx: 'img/sprites/dark2' })) //Kevin
    }
    if (type.includes('2v2')) {
        game.match.bots.push(new NPC(allID++, (game.match.map.w / 2) + 1000, (game.match.map.h / 2) - 1000, { target: game.player.character, nameTag: 'Jaysin', gfx: 'img/sprites/dark2' })) //Kevin
        game.match.bots.push(new NPC(allID++, (game.match.map.w / 2) + 1000, (game.match.map.h / 2) + 1000, { target: game.match.bots[game.match.bots.length - 2], nameTag: 'Jason', gfx: 'img/sprites/dark2' })) //Kevin
        game.match.bots.push(new NPC(allID++, (game.match.map.w / 2) - 1000, (game.match.map.h / 2) - 1000, { color: '#006600', target: game.player.character, nameTag: 'Logan', team: 0 })) //Anti-Kevin
    }
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
    constructor(origin, width) {
        this.pos = origin;
        this.width = width;
        this.end = new Vect3(origin.x + width.x, origin.y + width.y, origin.z + width.z);
    }
    half() {
        return new Vect3(this.width.x / 2, this.width.y / 2, this.width.z / 2)
    }
    center() {
        return new Vect3(this.pos.x + (this.width.x / 2), this.pos.x + (this.width.y / 2), this.pos.x + (this.width.z / 2))
    }
}

class Cylinder {
    constructor(origin, radius, height) {
        this.pos = origin;
        this.radius = radius;
        this.height = height;
    }
}