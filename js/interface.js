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
            'speedMulti': { 'min': 0, 'max': 1, 'step': 0.05, 'value': this.player.character.speedMulti },
            'maxSpeed': { 'min': 0, 'max': 100, 'step': 0.5, 'value': this.player.character.maxSpeed },
            'frictionMulti': { 'min': 0.8, 'max': 1, 'step': 0.001, 'value': this.player.character.frictionMulti }
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
                'change',
                () => { this.player.character[debugKey] = newSlider.value; console.log(debugKey, newSlider.value) },
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
                aimX = (aimX / distance) * 75;
                aimY = (aimY / distance) * 75;
                //Draw the crosshair at the point
                //(in this case, the center of the screen plus the normalized distance)
                ctx.drawImage(this.xhair, (game.window.w / 2) + aimX - 8, (game.window.h / 2) + aimY - 8, 16, 16);
                // Sniper Xhair
                // ctx.drawImage(this.xhair, (game.window.w / 2) + (aimX * 2) - 16, (game.window.h / 2) + (aimY * 2) - 16, 32, 32);
            }
        }
    }

}