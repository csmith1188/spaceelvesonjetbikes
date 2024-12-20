class Game {
    constructor() {
        this.window = {
            w: 900,
            h: 600,
            cx: this.w / 2,
            cy: this.h / 2,
        }
        this.gameView = {
            w: 900,
            h: 600,
            cx: this.w / 2,
            cy: this.h / 2,
        }
        this.paused = false;
        this.awaitingInput = false;
        this.menu = null;
        this.debug = {
            all: false,
            fps: true,
            trackers: true,
            trackList: []
        }
        this.allID = 0;
        this.menus = {
            pause: new Menu_Pause([], new Rect(0, 0, 170, 170)),
            awaitingInput: new Menu_Awaiting([], new Rect(0, 0, 350, 50)),
            main: new Menu_Main([], new Rect(0, 50, 170, 210))
        }
        this.player = new Player();
        this.ticks = 0;
        this.deltaTime = 0;
        this.lastTimestamp = 0;
        this.fps = 0;
        this.fpsAVG = 0;
        this.frameList = [];
        listenLastDevice();
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

    step() {
        //calculate deltatime
        let now = performance.now();
        this.deltaTime = now - this.lastTimestamp;
        this.fps = Math.round(1000 / this.deltaTime);
        if (this.debug) {
            this.frameList.push(this.deltaTime);
            if (this.frameList.length > 60) {
                this.frameList.shift();
                let sum = 0;
                for (let i = 0; i < this.frameList.length; i++) {
                    sum += this.frameList[i];
                }
                this.fpsAVG = Math.round(1000 / (sum / this.frameList.length));
            }
        }
        this.deltaTime /= 16;
        this.lastTimestamp = now;

        // // Update last timestamp
        // this.lastTimestamp = currentTimestamp;

        // Advance the game's master tick counter
        this.ticks++;

        // The next two lines will always max screen
        this.window.w = window.innerWidth;
        this.window.h = window.innerHeight;
        this.gameView.w = Math.min(window.innerWidth, 1920);
        this.gameView.h = Math.min(window.innerHeight, 1080);

        canvas.width = this.gameView.w;
        canvas.height = this.gameView.h;

        this.player.camera.radius = Math.sqrt((this.window.w / 2) ** 2 + (this.window.h / 2) ** 2)

        this.checkInput();

        this.player.controller.read(); // Read the input from the main player

        // If the game is waiting for a controller to press a button
        if (this.awaitingInput) {
            this.menus.awaitingInput.step(); // Show the input menu
        }

        // If the game is paused
        else if (this.paused) {
            this.menus.pause.step(); // Show the pause menu
        }

        // If the game is not paused and all controllers have been assigned, play the match
        else {

            if (this.menu) {
                this.menu.step(); // Show the main menu
            }

            for (const bot of this.match.bots) {
                bot.controller.read(); // Read the input from every player and bot
            }

            this.match.step(); // Then step the match
        }

        this.player.camera.update(); // Update the camera

        //Draw game
        this.draw();

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

    draw() {
        if (this.awaitingInput) {
            this.menus.awaitingInput.draw("Awaiting Controller Input...\n" + this.awaitingInput);
        } else {

            //Draw Map
            this.match.map.draw(this.player.character);

            //Draw Map Lighting
            this.match.map.lighting();

            //Draw Match
            this.match.draw();

            //Draw each HUD
            for (const bot of [this.player, ...this.match.bots]) {
                if (bot.interface)
                    bot.interface.drawHUD();
            }

            //Draw Controller HUD
            for (const bot of [this.player, ...this.match.bots]) {
                if (bot.controller)
                    bot.controller.draw();
            }

            if (this.menu)
                this.menu.draw();
        }

        if (this.paused)
            this.menus.pause.draw();


        // this.scanLines();


    }

    scanLines() {
        // Function to draw CRT interlace effect (scanlines)
        const lineHeight = 2; // Height of each scanline

        // Determine whether to draw odd or even lines based on the game tick
        const isOddFrame = game.ticks % 2 === 0;

        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';

        // Draw solid black lines on either odd or even rows
        for (let y = isOddFrame ? 0 : lineHeight; y < canvas.height; y += lineHeight * 2) {
            ctx.fillRect(0, y, canvas.width, lineHeight);
        }


        // Function to add noise
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;

        for (let i = 0; i < data.length; i += 4) {
            const noise = Math.random() * 50 - 25; // Add random noise between -25 and 25
            data[i] += noise;     // Red
            data[i + 1] += noise; // Green
            data[i + 2] += noise; // Blue
        }

        ctx.putImageData(imageData, 0, 0);
    }

    checkInput() {
        for (const player of [this.player, ...this.match.bots]) {
            if (player.controller.type == "controller") {
                this.awaitingInput = player.name;
                if (lastDevice == null)
                    // for each connected gamepad, add an event listener to check for input
                    for (const gamepad of navigator.getGamepads()) {
                        if (gamepad)
                            if (gamepad.buttons.some(button => button.pressed))
                                lastDevice = gamepad.index;
                    }
                if (lastDevice !== null) {
                    for (const other of [this.player, ...this.match.bots]) {
                        if (other.controller.type == lastDevice || other.controller.gamepadIndex === lastDevice) {
                            lastDevice = null;
                            return;
                        }
                    }

                    // if the lastDevice was keyboard, touch, pad or something else
                    if (lastDevice == "keyboard") {
                        player.controller = new Keyboard(player);
                    } else if (lastDevice == "touch") {
                        player.controller = new Touch(player);
                    } else {
                        player.controller = new GamePad(player, lastDevice);
                    }
                    lastDevice = null;
                    this.awaitingInput = false;
                }
                break;
            }
        }
    }
}