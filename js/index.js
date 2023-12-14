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
    game.match.map.blocks.push(new Block(allID++, (game.match.map.w / 2) + 32, (game.match.map.h / 2) + 32, 0, 32, 32, 64, { color: '#333333', colorSide: '#666666' }))
    game.match.map.blocks.push(new Block(allID++, (game.match.map.w / 2) - 72, (game.match.map.h / 2) - 36, 0, 32, 128, 128, { color: '#333333', colorSide: '#666666' }))

    game.match.bots.push(new Bot()) //Kevin
    game.match.bots[game.match.bots.length - 1].character = new Character(
        allID++,
        (game.match.map.w / 2) + 100,
        (game.match.map.h / 2) - 100,
        game.match.bots[game.match.bots.length - 1],
        // { target: game.player.character, nameTag: 'Jaysin', gfx: 'img/sprites/dark2', team: 1 }
        { target: game.player.character, nameTag: 'Jaysin', team: 1 }
    );


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
    // ctx.fillStyle = "#000000";
    // ctx.fillRect(0, 0, game.window.w, game.window.h);

    //Draw Map
    game.match.map.draw(game.player.character);

    //Put Bot player characters into a list
    let npcs = [];
    for (const npc in game.match.bots) {
        npcs.push(game.match.bots[npc].character);
    }

    let renderList =
        [game.player.character, ...npcs, ...game.match.map.blocks, ...game.match.map.missiles]
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