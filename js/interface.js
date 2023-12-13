class Interface {
    constructor(player) {
        this.player = player;
        this.xhair = new Image();
        this.xhair.src = 'img/sprites/xhair.png';
        this.hud = {
            barW: 48
        }
    }

    createDebug() {
        let characterSliders = {
            'angle': { 'min': 0, 'max': 1, 'step': 0.05, 'value': this.player.camera.angle }
        };
        this.player.debugBox = document.createElement('div');
        this.player.debugBox.id = 'debugger';
        for (const debugKey in characterSliders) {
            let newSlider = document.createElement('input');
            newSlider.classList.add('debugSlider');
            newSlider.type = 'range';
            for (const debugProp in characterSliders[debugKey]) {
                newSlider[debugProp] = characterSliders[debugKey][debugProp];
            }
            newSlider.addEventListener(
                'input',
                () => { this.player.camera[debugKey] = newSlider.value; console.log(debugKey, newSlider.value) },
                false
            );
            this.player.debugBox.appendChild(newSlider);
        }
        document.body.appendChild(this.player.debugBox);
    }

    drawHUD() {
        if (this.player.character.active) {

            let compareX = this.player.camera.x - this.player.character.x;
            let compareY = this.player.camera.y - this.player.character.y;

            ctx.fillStyle = "#000000";
            if (game.debug) {
                ctx.font = '12px consolas';
                ctx.fillText(this.player.character.x, 10, 150);
                ctx.fillText(this.player.character.y, 10, 160);
            }

            // Map locators
            ctx.fillStyle = "#FF0000";
            ctx.fillRect((this.player.camera.x / game.match.map.w) * game.window.w - 3, 0, 6, 6);
            ctx.fillRect((this.player.camera.x / game.match.map.w) * game.window.w - 3, game.window.h - 6, 6, 6);
            ctx.fillStyle = "#0000FF";
            ctx.fillRect(0, (this.player.camera.y / game.match.map.h) * game.window.h - 3, 6, 6);
            ctx.fillRect(game.window.w - 6, (this.player.camera.y / game.match.map.h) * game.window.h - 3, 6, 6);

            //Background

            //Health Bar

            //power bar

            //Speed bar


            //Crosshair
            if (!game.paused) {
                //aimX is the mouse coordinates minus the this.player coordinates
                //likewise with aimY (I calculated this elsewhere)
                let aimX = this.player.controller.aimX;
                let aimY = this.player.controller.aimY;
                //find the distance from this.player to mouse with pythagorean theorem
                let distance = ((aimX ** 2) + (aimY ** 2)) ** 0.5;
                //Normalize the dimension distance by the real distance (ratio)
                //Then multiply by the distance of the out circle
                aimX = (aimX / distance);
                aimY = (aimY / distance);
                // Set the distance for the other images
                const aimRad = 75;

                // Calculate the angles for the additional images (+10% and -10%)
                const angle = Math.atan2(aimY, aimX);
                const anglePlus10Percent = angle + game.player.character.accuracy;
                const angleMinus10Percent = angle - game.player.character.accuracy;

                // Calculate positions for the additional images
                const aimXPlus10Percent = Math.cos(anglePlus10Percent) * aimRad;
                const aimYPlus10Percent = Math.sin(anglePlus10Percent) * aimRad;

                const aimXMinus10Percent = Math.cos(angleMinus10Percent) * aimRad;
                const aimYMinus10Percent = Math.sin(angleMinus10Percent) * aimRad;

                // Draw the original image
                ctx.drawImage(this.xhair, (game.window.w / 2) + aimX * aimRad - 8, (game.window.h / 2) + aimY * aimRad - 8 - (this.player.character.HB.height / 2), 16, 16);

                // Draw the image at +10%
                // ctx.drawImage(this.xhair, (game.window.w / 2) + aimXPlus10Percent - 8, (game.window.h / 2) + aimYPlus10Percent - 8 - (this.player.character.HB.height / 2), 16, 16);

                // Draw the image at -10%
                // ctx.drawImage(this.xhair, (game.window.w / 2) + aimXMinus10Percent - 8, (game.window.h / 2) + aimYMinus10Percent - 8 - (this.player.character.HB.height / 2), 16, 16);


                // Sniper Xhair
                // ctx.drawImage(this.xhair, (game.window.w / 2) + (aimX * 2) - 16, (game.window.h / 2) + (aimY * 2) - 16, 32, 32);
            }
        }
    }

}