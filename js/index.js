//Variables
let canvas;
let ctx;
//Create Game variables

let gameLoop;
let game;
let allID = 0;
let ticks = 0;
let lastTimestamp = 0;
let fps = 0;

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
    ctx.imageSmoothingEnabled = false;

    setupInputs();

    //Game
    game = new Game();
    game.debug = false;

    //Player
    game.player = new Player();

    game.match = new DebugMatch();
    // game.match = new Start_Screen();
    // game.match = new Match_ForEver();
    // game.match = new Match_ForHonor();

    game.match.map.buildNavMesh();

    //start game loop
    //Run the step() function every 16ms (60fps)
    gameLoop = setInterval(step, 16);

    draw();

    // game.match.map.debris.push(new Buff(allID++,0,0,8,8,4,0,{target: game.player.character, color: [0,0,255], colorSide: [0,0,128]}))

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

    // Advance the game's master tick counter
    ticks++;

    // The next two lines will always max screen
    game.window.h = window.innerHeight;
    game.window.w = window.innerWidth;
    game.player.camera.radius = Math.sqrt((game.window.w / 2) ** 2 + (game.window.h / 2) ** 2)

    canvas.width = game.window.w;
    canvas.height = game.window.h;

    if (!game.paused) {

        game.player.controller.read();

        game.match.step();

        game.match.ticks++;

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

    //Performance Check
    const currentTimestamp = performance.now();
    const elapsedMilliseconds = currentTimestamp - lastTimestamp;
    fps = Math.round(1000 / elapsedMilliseconds);

    // Update last timestamp
    lastTimestamp = currentTimestamp;

    //Draw game
    draw();

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

    // game.player.camera.angle = sineAnimate(0.5, 0.01) + 0.5;

    //Clear the canvas 
    // ctx.fillStyle = "#000000";
    // ctx.fillRect(0, 0, game.window.w, game.window.h);

    //Draw Map
    game.match.map.draw(game.player.character);

    //Draw Map Lighting
    game.match.map.lighting();

    //Draw HUD
    game.player.interface.drawHUD();

    //Draw Controller HUD
    game.player.controller.draw();

}