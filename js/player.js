class Player {
    constructor() {
        this.character;
        this.controller;
        this.camera;
        this.xhair = new Image();
        this.xhair.src = 'img/sprites/xhair.png';
        this.hud = {
            barW: 48
        }
        this.best = {
            air: 0,
            airtime: 0,
            speed: 0,
            damage: 0,
            lap: 0
        }
    }

    createDebug() {
        let characterSliders = {
            'speedMulti': { 'min': 0, 'max': 1, 'step': 0.05, 'value': this.character.speedMulti },
            'maxSpeed': { 'min': 0, 'max': 100, 'step': 0.5, 'value': this.character.maxSpeed },
            'frictionMulti': { 'min': 0.8, 'max': 1, 'step': 0.001, 'value': this.character.frictionMulti }
        };
        this.debugBox = document.createElement('div');
        this.debugBox.id = 'debugger';
        for (const debugKey in characterSliders) {
            let newSlider = document.createElement('input');
            newSlider.classList.add('debugSlider');
            newSlider.type = 'range';
            for (const debugProp in characterSliders[debugKey]) {
                newSlider[debugProp] = characterSliders[debugKey][debugProp];
            }
            newSlider.addEventListener(
                'change',
                () => { this.character[debugKey] = newSlider.value; console.log(debugKey, newSlider.value) },
                false
            );
            this.debugBox.appendChild(newSlider);
        }
        document.body.appendChild(this.debugBox);
    }

    drawHUD() {
        let compareX = game.player.camera.x - game.player.character.x;
        let compareY = game.player.camera.y - game.player.character.y;

        ctx.fillStyle = "#000000";
        if (game.debug) {

            //Create panel
            if (!this.debugBox) {
                this.createDebug();
            }


            ctx.font = '12px consolas';
            ctx.fillText(this.character.x, 10, 150);
            ctx.fillText(this.character.y, 10, 160);
        }

        ctx.font = '15px Jura';
        ctx.fillText("Air:     ", 10, 20);
        ctx.fillText(game.player.best.air.toFixed(2), 100, 20);
        ctx.fillText("Airtime: ", 10, 35);
        ctx.fillText(game.player.best.airtime.toFixed(2), 100, 35);
        ctx.fillText("Speed:   ", 10, 50);
        ctx.fillText(game.player.best.speed.toFixed(2), 100, 50);
        ctx.fillText("Lap:     ", 10, 65);
        ctx.fillText(game.player.best.lap.toFixed(2), 100, 65);
        ctx.fillText("Damage:  ", 10, 80);
        ctx.fillText(game.player.best.damage.toFixed(2), 100, 80);

        // Map locators
        ctx.fillStyle = "#FF0000";
        ctx.fillRect((game.player.camera.x / game.match.map.w) * game.window.w - 3, 0, 6, 6);
        ctx.fillRect((game.player.camera.x / game.match.map.w) * game.window.w - 3, game.window.h - 6, 6, 6);
        ctx.fillStyle = "#0000FF";
        ctx.fillRect(0, (game.player.camera.y / game.match.map.h) * game.window.h - 3, 6, 6);
        ctx.fillRect(game.window.w - 6, (game.player.camera.y / game.match.map.h) * game.window.h - 3, 6, 6);

        //Background
        ctx.fillStyle = "#000000";
        ctx.fillRect(game.window.w / 2 - compareX - (game.player.character.w / 2), game.window.h / 2 - compareY - (game.player.character.h / 2) + 56, this.hud.barW + 2, 16);
        //Health Bar
        let healthBar = (this.character.hp / this.character.hp_max) * this.hud.barW;
        if (healthBar >= this.hud.barW) {
            healthBar = this.hud.barW;
            ctx.fillStyle = "#00FF00";
        } else if (healthBar >= this.hud.barW * (2 / 3)) {
            ctx.fillStyle = "#FF9900";
        } else if (healthBar >= this.hud.barW * (1 / 3)) {
            ctx.fillStyle = "#FFFF00";
        } else if (healthBar > 0) {
            ctx.fillStyle = "#FF0000";
        } else {
            healthBar = 1;
            ctx.fillStyle = "#FF0000";
        }
        ctx.fillRect(game.window.w / 2 - compareX - (game.player.character.w / 2) + 1, game.window.h / 2 - compareY - (game.player.character.h / 2) + 57, healthBar, 4);

        //power bar
        let lungeBar = (this.character.power / this.character.power_max) * this.hud.barW;
        if (lungeBar >= this.hud.barW) {
            lungeBar = this.hud.barW;
            ctx.fillStyle = "#990099";
        } else {
            ctx.fillStyle = "#9999FF";
        }
        ctx.fillRect(game.window.w / 2 - compareX - (game.player.character.w / 2) + 1, game.window.h / 2 - compareY - (game.player.character.h / 2) + 5 + 57, lungeBar, 4);

        //Speed bar
        let calcSpeed = (this.character.xytrueSpeed() / game.match.map.maxSpeed) * this.hud.barW;
        if (calcSpeed >= (this.character.maxSpeed / game.match.map.maxSpeed) * this.hud.barW) {
            ctx.fillStyle = "#FF9900";
        } else if (Math.abs(this.character.xspeed) >= game.match.map.collideDamageSpeed || Math.abs(this.character.yspeed) >= game.match.map.collideDamageSpeed) {
            ctx.fillStyle = "#FFFF00";
        } else {
            ctx.fillStyle = "#00FF00";
        }
        ctx.fillRect(game.window.w / 2 - compareX - (game.player.character.w / 2) + 1, game.window.h / 2 - compareY - (game.player.character.h / 2) + 10 + 57, calcSpeed, 4);

        //Crosshair

        //aimX is the mouse coordinates minus the player coordinates
        //likewise with aimY (I calculated this elsewhere)
        let aimX = game.player.controller.aimX;
        let aimY = game.player.controller.aimY;
        //find the distance from player to mouse with pythagorean theorem
        let distance = ((aimX ** 2) + (aimY ** 2)) ** 0.5;
        //Normalize the dimension distance by the real distance (ratio)
        //Then multiply by the distance of the out circle
        aimX = (aimX / distance) * 75;
        aimY = (aimY / distance) * 75;
        //Draw the crosshair at the point
        //(in this case, the center of the screen plus the normalized distance)
        ctx.drawImage(this.xhair, (game.window.w / 2) + aimX - 8, (game.window.h / 2) + aimY - 8, 16, 16);




        // In case I want to use arches for power bars or abilities
        // ctx.strokeStyle = 'red';
        // ctx.fillStyle = 'rgba(255,0,0,0.1)';
        // ctx.lineWidth = 5;

        // ctx.beginPath();
        // ctx.arc(game.window.w / 2, game.window.h / 2, 48, 0, 2 * Math.PI);

        // ctx.stroke();
        // ctx.fill();

    }
}
