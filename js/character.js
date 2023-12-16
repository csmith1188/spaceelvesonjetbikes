/*
      ::::::::  :::    :::     :::     :::::::::      :::      :::::::: ::::::::::: :::::::::: :::::::::
    :+:    :+: :+:    :+:   :+: :+:   :+:    :+:   :+: :+:   :+:    :+:    :+:     :+:        :+:    :+:
   +:+        +:+    +:+  +:+   +:+  +:+    +:+  +:+   +:+  +:+           +:+     +:+        +:+    +:+
  +#+        +#++:++#++ +#++:++#++: +#++:++#:  +#++:++#++: +#+           +#+     +#++:++#   +#++:++#:
 +#+        +#+    +#+ +#+     +#+ +#+    +#+ +#+     +#+ +#+           +#+     +#+        +#+    +#+
#+#    #+# #+#    #+# #+#     #+# #+#    #+# #+#     #+# #+#    #+#    #+#     #+#        #+#    #+#
########  ###    ### ###     ### ###    ### ###     ###  ########     ###     ########## ###    ###
*/
class Character {
    constructor(id, spawnx, spawny, parent, options) {
        this.id = id;
        this.name = '';
        this.parent = parent;
        this.active = true;
        this.cleanup = true;
        this.team = 0;
        this.target = null;

        //Position Data
        this.HB = new Cylinder(new Vect3(spawnx, spawny, 0), 8, 32);
        this.aim = new Vect3(0, 0, 0);
        this.angle = new Vect3(0, 0, 0);

        this.bouyancy = 1;
        this.hover = 0; // 12

        //Physics
        this.speed = new Vect3(0, 0, 0);
        this.maxSpeed = new Vect3(8, 8, 12)
        this.mom = new Vect3(0, 0, 0);
        this.accel = new Vect3(0.15, 0.15, 1);
        this.airAccel = new Vect3(0.08, 0.08, 1);
        this.colliders = [];

        //Stats
        this.hp = 100;
        this.hp_max = 100;
        this.accuracy = 0.1; // Spread magnitude of weapon

        //Items
        this.item = 0;
        this.inventory = [new Pistol(), new Flamer(), new JumpDropper()];
        this.ammo = {
            plasma: 50,
            ballistic: 50
        }

        //Graphics
        this.img = new Image();
        this.gfx = 'img/sprites/lilguy';
        this.color = [0, 255, 0];
        this.faceCamera = true;
        this.shadow = {
            img: new Image()
        }
        this.shadow.img.src = 'img/sprites/shadow.png';

        // Options
        if (typeof options === 'object')
            for (var key of Object.keys(options)) {
                this[key] = options[key];
            }
        this.leftgfx = this.gfx + '_l'; // Set this after options so you only have to set gfx
        this.img.src = this.gfx + '.png'
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
   
    step(controller) {
        if (this.active) {
            // create a logpoint after each time the speed.z changes in this function

            //Reset Momentum
            this.mom = new Vect3();

            //Movement
            if (controller.buttons.moveLeft.current) this.mom.x = -1;
            if (controller.buttons.moveRight.current) this.mom.x = 1;
            if (controller.buttons.moveUp.current) this.mom.y = -1;
            if (controller.buttons.moveDown.current) this.mom.y = 1;
            if (this.HB.pos.z < game.match.map.grace + this.hover) {
                if (controller.buttons.jump.current && !controller.buttons.jump.last)
                    this.speed.z = 12;
            }

            // Single shot code
            if (controller.buttons.fire.current != controller.buttons.fire.last) {
                if (controller.buttons.fire.current)
                    this.inventory[this.item].use(this, this.parent.controller.aimX, this.parent.controller.aimY, 0);
            }

            //Max Speed Momentum Cap
            if (Math.abs(this.speed.x) > this.maxSpeed) this.mom.x = 0;
            if (Math.abs(this.speed.y) > this.maxSpeed) this.mom.y = 0;

            //Friction
            if (this.HB.pos.z <= game.match.map.floor) { //Ground
                //Accelerate Ground
                this.speed.x += this.mom.x * this.accel.x;
                this.speed.y += this.mom.y * this.accel.y;
                this.speed.z += this.mom.z * this.accel.z;
                // Friction Ground
                this.speed.x *= 1 - game.match.map.friction.ground;
                this.speed.y *= 1 - game.match.map.friction.ground;
            } else { //Air
                //Accelerate Air
                this.speed.x += this.mom.x * this.airAccel.x;
                this.speed.y += this.mom.y * this.airAccel.y;
                this.speed.z += this.mom.z * this.airAccel.z;
                //Friction Air
                this.speed.x *= 1 - game.match.map.friction.air;
                this.speed.y *= 1 - game.match.map.friction.air;
            }
            this.speed.z *= 1 - game.match.map.friction.air; //Air friction always applies to falling/rising
            if (Math.abs(this.speed.x) < game.match.map.stopZone) this.speed.x = 0; //Stop if you are below the stop speed
            if (Math.abs(this.speed.y) < game.match.map.stopZone) this.speed.y = 0; 
            // if (Math.abs(this.speed.z) < game.match.map.stopZone) this.speed.z = 0; //Enabling this makes hover never level out

            //Hover
            if (this.HB.pos.z < this.hover) { //If you are lower than the hover threshold
                this.speed.z += Math.max((1 - (this.HB.pos.z / this.hover)) * this.bouyancy, 0); //Move up by your bouyancy times the percent between your z and you hover, not negative
            }
            else if (this.HB.pos.z > this.hover) { //If you are higher than the hover threshold
                this.speed.z += Math.max((1 - ((this.HB.pos.z - this.hover) / this.hover)) * this.bouyancy, 0); //Move up by your bouyancy times the percent over the hover, not negative
                //Gravity
                this.speed.z -= game.match.map.gravity; 
            }

            //
            //Predictive collision
            //

            //All players
            for (let c of game.match.bots) {
                if (c.character === this) //Don't collide with yourself
                    continue;
                c = c.character; //Get the character from the bot
                let side = this.HB.collide(c.HB); //Check for collision
                console.log(side); 
                if (side) c.trigger(this, side);
                if (c.solid) //If the other character is solid
                    switch (side) { //Move this character to the edge of the other character
                        case 'front':
                            this.speed.y *= -game.match.map.collideReflect; this.mom.y *= -game.match.map.collideReflect;
                            this.HB.pos.y = c.HB.pos.y + c.HB.volume.y + this.HB.radius;
                            break;
                        case 'rear':
                            this.speed.y *= -game.match.map.collideReflect; this.mom.y *= -game.match.map.collideReflect;
                            this.HB.pos.y = c.HB.pos.y - this.HB.radius;
                            break;
                        case 'right':
                            this.speed.x *= -game.match.map.collideReflect; this.mom.x *= -game.match.map.collideReflect;
                            this.HB.pos.x = c.HB.pos.x + c.HB.volume.x + this.HB.radius;
                            break;
                        case 'left':
                            this.speed.x *= -game.match.map.collideReflect; this.mom.x *= -game.match.map.collideReflect;
                            this.HB.pos.x = c.HB.pos.x - this.HB.radius;
                            break;
                        default:

                            break;
                    }
            }
            // All blocks
            for (const c of game.match.map.blocks) { //For each block
                let side = this.HB.collide(c.HB); //Check for collision
                if (side) c.trigger(this, side); //Trigger the block's trigger function
                if (side) {
                    game.paused = true;
                    console.log("Before:", side);
                    console.log(this.speed.z, this.mom.z);
                }
                if (c.solid) //If the block is solid
                    switch (side) {
                        case 'front':
                            this.speed.y *= -game.match.map.collideReflect;
                            this.mom.y *= -game.match.map.collideReflect;
                            this.HB.pos.y = c.HB.pos.y + c.HB.volume.y + this.HB.radius;
                            break;
                        case 'rear':
                            this.speed.y *= -game.match.map.collideReflect;
                            this.mom.y *= -game.match.map.collideReflect;
                            this.HB.pos.y = c.HB.pos.y - this.HB.radius;
                            break;
                        case 'right':
                            this.speed.x *= -game.match.map.collideReflect;
                            this.mom.x *= -game.match.map.collideReflect;
                            this.HB.pos.x = c.HB.pos.x + c.HB.volume.x + this.HB.radius;
                            break;
                        case 'left':
                            this.speed.x *= -game.match.map.collideReflect;
                            this.mom.x *= -game.match.map.collideReflect;
                            this.HB.pos.x = c.HB.pos.x - this.HB.radius;
                            break;
                        case 'top':
                            this.speed.z *= -game.match.map.collideReflect;
                            this.mom.z *= -game.match.map.collideReflect;
                            this.HB.pos.z = c.HB.pos.z + c.HB.volume.z;
                            break;
                        case 'bottom':
                            this.speed.z *= -game.match.map.collideReflect;
                            this.mom.z *= -game.match.map.collideReflect;
                            this.HB.pos.z = c.HB.pos.z - this.HB.height;
                            break;
                        default:
                            break;
                    }
                if (side) {
                    game.paused = true;
                    console.log("After", side);
                    console.log(this.speed.z, this.mom.z);
                }
            }

            //Make the Move
            this.HB.pos.x += this.speed.x;
            this.HB.pos.y += this.speed.y;
            this.HB.pos.z += this.speed.z;

            //Ground Collision
            if (-this.speed.z > this.HB.pos.z + game.match.map.floor) {
                this.HB.pos.z = 0;
                this.speed.z *= -0.5
            }

        }
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

        //Draw correct graphic
        if (this.mom.x < 0) this.img.src = this.leftgfx + '.png'
        if (this.mom.x > 0) this.img.src = this.gfx + '.png'

        let compareX = game.player.camera.x - this.HB.pos.x;
        let compareY = game.player.camera.y - this.HB.pos.y;
        if (game.player.camera._3D) {
            this.draw3D();
        } else {
            if (game.debug) {
                ctx.fillStyle = "#FF0000";
                ctx.fillRect(game.window.w / 2 - compareX - 2, game.window.h / 2 - compareY - 2, 4, 4);
                ctx.strokeStyle = "#FF0000";
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.ellipse(
                    game.window.w / 2 - compareX,
                    game.window.h / 2 - compareY - this.HB.pos.z,
                    this.HB.radius,
                    this.HB.radius,
                    0, 0, 2 * Math.PI);
                ctx.stroke();
                ctx.beginPath();
                ctx.ellipse(
                    game.window.w / 2 - compareX,
                    game.window.h / 2 - compareY - this.HB.height - this.HB.pos.z,
                    this.HB.radius,
                    this.HB.radius,
                    0, 0, 2 * Math.PI);
                ctx.stroke();
            }

            //
            // DRAW SHADOW ON BOTTOM
            //
            ctx.globalAlpha = 0.4;
            let shadowShrink = this.HB.radius * Math.min((this.HB.pos.z / 128), 1)
            ctx.drawImage(
                this.shadow.img,
                game.window.w / 2 - this.HB.radius + shadowShrink,
                game.window.h / 2 - this.HB.radius + shadowShrink,
                this.HB.radius * 2 - shadowShrink * 2,
                this.HB.radius * 2 - shadowShrink * 2
            );
            ctx.globalAlpha = 1;

            //
            // Draw SELECTOR RING
            //
            if (game.player.interface.drawFriendlyRing) {
                ctx.strokeStyle = `rgba(${this.color[0]}, ${this.color[1]}, ${this.color[2]}, ${game.player.interface.drawFriendlyRing})`;
                ctx.lineWidth = 5;
                ctx.beginPath();
                ctx.ellipse(
                    game.window.w / 2 - compareX,
                    game.window.h / 2 - compareY,
                    this.HB.radius,
                    this.HB.radius,
                    0, 0, 2 * Math.PI);
                ctx.stroke();
            }

            //sineAnimate(1, 0.1) <- subtract this from the y position of the image to hover effect
            ctx.drawImage(
                this.img,
                game.window.w / 2 - compareX - this.HB.radius,
                game.window.h / 2 - compareY - this.HB.height - this.HB.pos.z,
                this.HB.radius * 2, this.HB.height
            );
        }
        // This can draw a line to the closest part of a rectangle
        // except it broke at some point when i moved to utils
        // It can still draw to the XY which is good for tubes, but not blocks
        if (this.target) {
            ctx.strokeStyle = "#FF0000"
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(game.window.w / 2, game.window.h / 2);
            compareX = game.player.camera.x - this.target.HB.pos.x; //If you change this to the target.pos
            compareY = game.player.camera.y - this.target.HB.pos.y; //If you change this to the target.pos
            ctx.lineTo(game.window.w / 2 - compareX, game.window.h / 2 - compareY);
            ctx.stroke();
        }
    }

    draw3D() {
        let compareX = game.player.camera.x - this.HB.pos.x;
        let compareY = game.player.camera.y - this.HB.pos.y;

        //
        // DEBUG: DRAW HITBOX
        //
        if (game.debug) {
            ctx.lineWidth = 2;
            ctx.fillStyle = "#FF0000";
            ctx.fillRect(game.window.w / 2 - compareX - 2, game.window.h / 2 - (compareY * game.player.camera.angle) - 2, 4, 4);
            ctx.strokeStyle = "#FF0000";
            ctx.beginPath();
            ctx.ellipse(
                game.window.w / 2 - compareX,
                game.window.h / 2 - (compareY * game.player.camera.angle) - this.HB.pos.z,
                this.HB.radius,
                this.HB.radius * game.player.camera.angle,
                0, 0, 2 * Math.PI);
            ctx.stroke();
            ctx.beginPath();
            ctx.ellipse(
                game.window.w / 2 - compareX,
                game.window.h / 2 - (compareY * game.player.camera.angle) - (this.HB.height * (1 - game.player.camera.angle)) - this.HB.pos.z,
                this.HB.radius,
                this.HB.radius * game.player.camera.angle,
                0, 0, 2 * Math.PI);
            ctx.stroke();
        }

        //
        // DRAW SHADOW ON BOTTOM
        //
        ctx.globalAlpha = 0.4;
        let shadowShrink = this.HB.radius * Math.min((this.HB.pos.z / 128), 1)
        ctx.drawImage(
            this.shadow.img,
            game.window.w / 2 - this.HB.radius + shadowShrink,
            game.window.h / 2 - this.HB.radius + (this.HB.height * (1 - game.player.camera.angle)) + (shadowShrink * game.player.camera.angle),
            (this.HB.radius * 2) - (shadowShrink * 2),
            ((this.HB.radius * 2) - (shadowShrink * 2)) * game.player.camera.angle
        );
        ctx.globalAlpha = 1;

        //
        // DRAW SELECTOR RING
        //
        if (game.player.interface.drawFriendlyRing) {
            ctx.strokeStyle = `rgba(${this.color[0]}, ${this.color[1]}, ${this.color[2]}, ${game.player.interface.drawFriendlyRing})`;
            ctx.lineWidth = 5;
            ctx.beginPath();
            ctx.ellipse(
                game.window.w / 2 - compareX,
                game.window.h / 2 - (compareY * game.player.camera.angle),
                this.HB.radius,
                this.HB.radius * game.player.camera.angle,
                0, 0, 2 * Math.PI);
            ctx.stroke();
        }

        if (this.faceCamera)
            ctx.drawImage(
                this.img,
                game.window.w / 2 - compareX - this.HB.radius,
                game.window.h / 2 - (compareY * game.player.camera.angle) - this.HB.height - (this.HB.pos.z * (1 - game.player.camera.angle)),
                this.HB.radius * 2,
                this.HB.height
            );
        else
            ctx.drawImage(
                this.img,
                game.window.w / 2 - compareX - this.HB.radius,
                game.window.h / 2 - (compareY * game.player.camera.angle) - (this.HB.height * (1 - game.player.camera.angle)) - (this.HB.pos.z * (1 - game.player.camera.angle)),
                this.HB.radius * 2,
                this.HB.height * (1 - game.player.camera.angle)
            );
    }

    //Save this code for utils
    trigger(actor) {

        //this mom to their speed
        //their mom to this speed

    }

}