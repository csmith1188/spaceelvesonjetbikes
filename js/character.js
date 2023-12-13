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
        this.parent = parent;
        this.active = true;
        this.cleanup = true;
        this.team = 0;

        //Position Data. This is a Tube
        this.HB = new Cylinder(new Vect3(spawnx, spawny, 0), 8, 32);
        this.aim = new Vect3(0, 0, 0);
        this.angle = new Vect3(0, 0, 0);

        this.bouyancy = 2;
        this.hover = 0; // 12

        //Speed
        this.speed = new Vect3(0, 0, 0);
        this.mom = new Vect3(0, 0, 0);
        this.accel = new Vect3(0.15, 0.15, 0.15);

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
        this.color = '#FF0000';

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
            this.mom = new Vect3();

            if (this.HB.pos.z < game.match.map.grace) {
                if (controller.buttons.moveLeft.current) this.mom.x = -1;
                if (controller.buttons.moveRight.current) this.mom.x = 1;
                if (controller.buttons.moveUp.current) this.mom.y = -1;
                if (controller.buttons.moveDown.current) this.mom.y = 1;
                if (controller.buttons.jump.current && !controller.buttons.jump.last)
                    this.speed.z = 12;
            }

            // Single shot code
            if (controller.buttons.fire.current != controller.buttons.fire.last) {
                if (controller.buttons.fire.current)
                    this.inventory[this.item].use(this, this.parent.controller.aimX, this.parent.controller.aimY, 0);
            }

            //Accelerate
            this.speed.x += this.mom.x * this.accel.x;
            this.speed.y += this.mom.y * this.accel.y;
            this.speed.z += this.mom.z * this.accel.z;

            //Gravity
            this.speed.z -= game.match.map.gravity;
            if (this.HB.pos.z < this.hover) this.speed.z += this.bouyancy;

            //Friction
            if (this.HB.pos.z < game.match.map.grace) {
                this.speed.x *= 1 - game.match.map.friction.ground;
                this.speed.y *= 1 - game.match.map.friction.ground;
            } else {
                this.speed.x *= 1 - game.match.map.friction.air;
                this.speed.y *= 1 - game.match.map.friction.air;
            }
            this.speed.z *= 1 - game.match.map.friction.air;
            if (Math.abs(this.speed.x) < game.match.map.stopZone) this.speed.x = 0;
            if (Math.abs(this.speed.y) < game.match.map.stopZone) this.speed.y = 0;
            if (Math.abs(this.speed.z) < game.match.map.stopZone) this.speed.z = 0;

            //Predict
            let c = game.match.map.blocks[0]

            // If the distance is less than or equal to the circle's radius, a collision occurs

            //Move
            this.HB.pos.x += this.speed.x
            this.HB.pos.y += this.speed.y
            this.HB.pos.z += this.speed.z

            //Ground
            if (-this.speed.z > this.HB.pos.z) {
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
        if (this.active) {

            let compareX = game.player.camera.x - this.HB.pos.x;
            let compareY = game.player.camera.y - this.HB.pos.y;
            let compareZ = game.player.camera.z - this.HB.pos.z;
            if (game.debug) {
                ctx.fillStyle = "#FF0000";
                ctx.fillRect(game.window.w / 2 - compareX - 5, game.window.h / 2 - compareY - 5, 10, 10);
                ctx.strokeStyle = "#FF0000";
                ctx.beginPath();
                ctx.arc(
                    game.window.w / 2 - compareX,
                    game.window.h / 2 - compareY - this.HB.pos.z,
                    this.HB.radius,
                    0, 2 * Math.PI);
                ctx.stroke();
                ctx.beginPath();
                ctx.arc(
                    game.window.w / 2 - compareX,
                    game.window.h / 2 - compareY - this.HB.height - this.HB.pos.z,
                    this.HB.radius,
                    0, 2 * Math.PI);
                ctx.stroke();
            }
            ctx.globalAlpha = 0.5;
            //shadow
            ctx.globalAlpha = 1;
            //sineAnimate(1, 0.1) <- subtract this from the y position of the image to hover effect.
            ctx.drawImage(this.img, game.window.w / 2 - compareX - this.HB.radius, game.window.h / 2 - compareX - this.HB.height - this.HB.pos.z, this.HB.radius * 2, this.HB.height);

            // //This can draw a line to the closest part of a rectangle
            // ctx.strokeStyle = "#FF0000"
            // ctx.lineWidth = 5;
            // ctx.beginPath();
            // ctx.moveTo(game.window.w / 2, game.window.h / 2);
            // compareX = game.player.camera.x - this.lockon.x; //If you change this to the lockon
            // compareY = game.player.camera.y - this.lockon.y; //If you change this to the lockon
            // ctx.lineTo(game.window.w / 2 - compareX, game.window.h / 2 - compareY);
            // ctx.stroke();

        }
    }

    /*
          ::::::::   ::::::::  :::        :::        ::::::::::: :::::::::  ::::::::::
        :+:    :+: :+:    :+: :+:        :+:            :+:     :+:    :+: :+:
       +:+        +:+    +:+ +:+        +:+            +:+     +:+    +:+ +:+
      +#+        +#+    +:+ +#+        +#+            +#+     +#+    +:+ +#++:++#
     +#+        +#+    +#+ +#+        +#+            +#+     +#+    +#+ +#+
    #+#    #+# #+#    #+# #+#        #+#            #+#     #+#    #+# #+#
    ########   ########  ########## ########## ########### #########  ##########
    */

    collide(colliders) {
        for (const c of colliders) {
            if (this.HB.collide(c.HB)) {
                c.trigger();
            }
        }
    }

}


/*
      :::::::::: ::::    ::: ::::::::::   :::   :::  :::   :::
     :+:        :+:+:   :+: :+:         :+:+: :+:+: :+:   :+:
    +:+        :+:+:+  +:+ +:+        +:+ +:+:+ +:+ +:+ +:+
   +#++:++#   +#+ +:+ +#+ +#++:++#   +#+  +:+  +#+  +#++:
  +#+        +#+  +#+#+# +#+        +#+       +#+   +#+
 #+#        #+#   #+#+# #+#        #+#       #+#   #+#
########## ###    #### ########## ###       ###   ###
*/
