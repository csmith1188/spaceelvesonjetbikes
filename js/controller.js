/*
      ::::::::::: ::::    ::: :::::::::  :::    ::: ::::::::::: ::::::::
         :+:     :+:+:   :+: :+:    :+: :+:    :+:     :+:    :+:    :+:
        +:+     :+:+:+  +:+ +:+    +:+ +:+    +:+     +:+    +:+
       +#+     +#+ +:+ +#+ +#++:++#+  +#+    +:+     +#+    +#++:++#++
      +#+     +#+  +#+#+# +#+        +#+    +#+     +#+           +#+
     #+#     #+#   #+#+# #+#        #+#    #+#     #+#    #+#    #+#
########### ###    #### ###         ########      ###     ########
*/


let lastDevice = null;

function getLastDevice() {
    document.addEventListener("keydown", (event) => { lastDevice = "keyboard";});
    window.addEventListener('gamepadconnected', (event) => { lastDevice = event.gamepad.index });
    window.addEventListener('touchstart', (event) => { lastDevice = "touch"; });
}

// Collect all input data and send it to the controller for better handling
function getCanvasRelative(e, center = true) {
    bx = canvas.getBoundingClientRect();
    if (center === true) {
        return {
            x: e.clientX - (bx.width / 2),
            y: e.clientY - (bx.height / 2),
            bx: bx
        };
    } else {
        return {
            x: e.clientX - bx.left,
            y: e.clientY - bx.top,
            bx: bx
        };
    }
}

/*
      ::::::::   ::::::::  ::::    ::: ::::::::::: :::::::::   ::::::::  :::        :::        :::::::::: :::::::::
    :+:    :+: :+:    :+: :+:+:   :+:     :+:     :+:    :+: :+:    :+: :+:        :+:        :+:        :+:    :+:
   +:+        +:+    +:+ :+:+:+  +:+     +:+     +:+    +:+ +:+    +:+ +:+        +:+        +:+        +:+    +:+
  +#+        +#+    +:+ +#+ +:+ +#+     +#+     +#++:++#:  +#+    +:+ +#+        +#+        +#++:++#   +#++:++#:
 +#+        +#+    +#+ +#+  +#+#+#     +#+     +#+    +#+ +#+    +#+ +#+        +#+        +#+        +#+    +#+
#+#    #+# #+#    #+# #+#   #+#+#     #+#     #+#    #+# #+#    #+# #+#        #+#        #+#        #+#    #+#
########   ########  ###    ####     ###     ###    ###  ########  ########## ########## ########## ###    ###
*/
class Controller {
    constructor(owner) {
        this.owner = owner;
        this.type = "controller";
        this.deadzone = 0.2;
        this.buttons = {
            moveRight: { current: 0, last: 0 },
            moveLeft: { current: 0, last: 0 },
            moveDown: { current: 0, last: 0 },
            moveUp: { current: 0, last: 0 },
            jump: { current: 0, last: 0 },
            brake: { current: 0, last: 0 },
            boost: { current: 0, last: 0 },
            fire: { current: 0, last: 0 },
            altfire: { current: 0, last: 0 },
            weaponPrevious: { current: 0, last: 0 },
            weaponNext: { current: 0, last: 0 },
            start: { current: 0, last: 0 },
            select: { current: 0, last: 0 },
            inventory1: { current: 0, last: 0 },
            inventory2: { current: 0, last: 0 },
            throw: { current: 0, last: 0 }
        };
        this.setupInputs();
    }

    setupInputs() {

    }

    read() {

    }

    draw() {

    }
}

/*
      :::    ::: :::::::::: :::   ::: :::::::::   ::::::::      :::     :::::::::  :::::::::
     :+:   :+:  :+:        :+:   :+: :+:    :+: :+:    :+:   :+: :+:   :+:    :+: :+:    :+:
    +:+  +:+   +:+         +:+ +:+  +:+    +:+ +:+    +:+  +:+   +:+  +:+    +:+ +:+    +:+
   +#++:++    +#++:++#     +#++:   +#++:++#+  +#+    +:+ +#++:++#++: +#++:++#:  +#+    +:+
  +#+  +#+   +#+           +#+    +#+    +#+ +#+    +#+ +#+     +#+ +#+    +#+ +#+    +#+
 #+#   #+#  #+#           #+#    #+#    #+# #+#    #+# #+#     #+# #+#    #+# #+#    #+#
###    ### ##########    ###    #########   ########  ###     ### ###    ### #########
*/
class Keyboard extends Controller {
    constructor(owner) {
        super(owner);
        this.type = "keyboard";
    }

    setupInputs() {
        /*
          _  __         ___
         | |/ /___ _  _|   \ _____ __ ___ _  ___
         | ' </ -_) || | |) / _ \ V  V / ' \(_-<
         |_|\_\___|\_, |___/\___/\_/\_/|_||_/__/
                   |__/
        */
        document.addEventListener("keydown", function (event) {
            if (event.shiftKey) {
                this.shiftKey = Number(event.shiftKey)
            }
            if (event.altKey) {
                event.preventDefault();
                this.altKey = Number(event.altKey)
            }
            if (event.key.toLocaleLowerCase() === "q") this.inventory1Key = 1;
            if (event.key.toLocaleLowerCase() === "e") this.inventory2Key = 1;
            if (event.key.toLocaleLowerCase() === "f") this.throwKey = 1;
            // if (event.key.toLocaleLowerCase() === "3") game.player.character.item = 2;
            // if (event.key.toLocaleLowerCase() === "4") game.player.character.item = 3;
            if (event.key.toLocaleLowerCase() === "w" || event.key === "ArrowUp") this.upKey = 1;
            if (event.key.toLocaleLowerCase() === "a" || event.key === "ArrowLeft") this.leftKey = 1;
            if (event.key.toLocaleLowerCase() === "s" || event.key === "ArrowDown") this.downKey = 1;
            if (event.key.toLocaleLowerCase() === "d" || event.key === "ArrowRight") this.rightKey = 1;
            if (event.key.toLocaleLowerCase() === " ") this.spaceKey = 1;
            if (event.key === "Escape" || event.key === "Escape")
                game.paused = !game.paused;

        }.bind(this));
        /*
          _  __         _   _
         | |/ /___ _  _| | | |_ __ ___
         | ' </ -_) || | |_| | '_ (_-<
         |_|\_\___|\_, |\___/| .__/__/
                   |__/      |_|
        */
        document.addEventListener("keyup", function (event) {
            this.shiftKey = Number(event.shiftKey)
            this.altKey = Number(event.altKey)
            if (event.key.toLocaleLowerCase() === "q") this.inventory1Key = 0;
            if (event.key.toLocaleLowerCase() === "e") this.inventory2Key = 0;
            if (event.key.toLocaleLowerCase() === "f") this.throwKey = 0;
            if (event.key.toLocaleLowerCase() === "w" || event.key === "ArrowUp") this.upKey = 0;
            if (event.key.toLocaleLowerCase() === "a" || event.key === "ArrowLeft") this.leftKey = 0;
            if (event.key.toLocaleLowerCase() === "s" || event.key === "ArrowDown") this.downKey = 0;
            if (event.key.toLocaleLowerCase() === "d" || event.key === "ArrowRight") this.rightKey = 0;
            if (event.key.toLocaleLowerCase() === " ") this.spaceKey = 0;
        }.bind(this));

        /*
          __  __
         |  \/  |___ _  _ ___ ___
         | |\/| / _ \ || (_-</ -_)
         |_|  |_\___/\_,_/__/\___|

        */
        window.addEventListener("mousedown", function (event) {
            let coords = getCanvasRelative(event, false); // from top-left
            this.fireX = coords.x;
            this.fireY = coords.y;
            coords = getCanvasRelative(event, true); // relative to center
            this.rclickX = coords.x;
            this.rclickY = coords.y;
            // Get which mousebutton they clicked
            if (event.button == 0)
                this.clickButton = 1
            else if (event.button == 2)
                this.rclickButton = 1
        }.bind(this));
        window.addEventListener("mouseup", function (event) {
            if (event.button == 0)
                this.clickButton = 0;
            else if (event.button == 2)
                this.rclickButton = 0;
        }.bind(this));
        window.addEventListener("wheel", function (event) {
            this.wheelUp = (event.wheelDelta > 0) * 1;
            this.wheelDown = (event.wheelDelta < 0) * 1;
        }.bind(this));
        window.addEventListener('mousemove', function (event) {
            let coords = getCanvasRelative(event, true);
            this.aimX = coords.x
            this.aimY = coords.y
        }.bind(this));
        window.addEventListener("contextmenu", e => e.preventDefault());
    }

    read() {
        // Remember the last state of every command
        for (const button in this.buttons) {
            this.buttons[button].last = this.buttons[button].current;
        }
        // Because buttons can get cleared at other points, we need to check for them here at the same time as other inputs
        if (this.rightKey) this.buttons.moveRight.current = 1;
        else this.buttons.moveRight.current = 0;
        if (this.leftKey) this.buttons.moveLeft.current = 1;
        else this.buttons.moveLeft.current = 0;
        if (this.downKey) this.buttons.moveDown.current = 1;
        else this.buttons.moveDown.current = 0;
        if (this.upKey) this.buttons.moveUp.current = 1;
        else this.buttons.moveUp.current = 0;
        if (this.spaceKey) this.buttons.jump.current = 1;
        else this.buttons.jump.current = 0;
        if (this.shiftKey) this.buttons.brake.current = 1;
        else this.buttons.brake.current = 0;
        if (this.altKey) this.buttons.boost.current = 1;
        else this.buttons.boost.current = 0;
        if (this.clickButton) this.buttons.fire.current = 1;
        else this.buttons.fire.current = 0;
        if (this.rclickButton) this.buttons.altfire.current = 1;
        else this.buttons.altfire.current = 0;
        if (this.inventory1Key) this.buttons.inventory1.current = 1;
        else this.buttons.inventory1.current = 0;
        if (this.inventory2Key) this.buttons.inventory2.current = 1;
        else this.buttons.inventory2.current = 0;
        if (this.throwKey) this.buttons.throw.current = 1;
        else this.buttons.throw.current = 0;
        if (this.wheelUp) {
            this.buttons.weaponPrevious.current = this.wheelUp;
            this.wheelUp = 0;
        }
        else this.buttons.weaponPrevious.current = 0;
        if (this.wheelDown) {
            this.buttons.weaponNext.current = this.wheelDown;
            this.wheelDown = 0;
        }
        else this.buttons.weaponNext.current = 0;
    }
}

/*
      ::::::::      :::       :::   :::   :::::::::: :::::::::     :::     :::::::::
    :+:    :+:   :+: :+:    :+:+: :+:+:  :+:        :+:    :+:  :+: :+:   :+:    :+:
   +:+         +:+   +:+  +:+ +:+:+ +:+ +:+        +:+    +:+ +:+   +:+  +:+    +:+
  :#:        +#++:++#++: +#+  +:+  +#+ +#++:++#   +#++:++#+ +#++:++#++: +#+    +:+
 +#+   +#+# +#+     +#+ +#+       +#+ +#+        +#+       +#+     +#+ +#+    +#+
#+#    #+# #+#     #+# #+#       #+# #+#        #+#       #+#     #+# #+#    #+#
########  ###     ### ###       ### ########## ###       ###     ### #########
*/
class GamePad extends Controller {
    constructor(owner, gamePadIndex) {
        super(owner);
        this.type = "gamepad";
        this.gamePad = gamePadIndex;
    }

    setupInputs() {
        window.addEventListener('gamepaddisconnected', (event) => {
            game.player.controller.gamePad = null;
        });
    }

    read() {
        // Remember the last state of every command
        for (const button in this.buttons) {
            this.buttons[button].last = this.buttons[button].current;
        }
        if (this.gamePad != null) {
            let gp = navigator.getGamepads()[this.gamePad];
            // Get AXES
            if (gp.axes[0] > this.deadzone) this.buttons.moveRight.current = gp.axes[0];
            else this.buttons.moveRight.current = 0;
            if (gp.axes[0] < this.deadzone * -1) this.buttons.moveLeft.current = gp.axes[0] * -1;
            else this.buttons.moveLeft.current = 0;
            if (gp.axes[1] > this.deadzone) this.buttons.moveDown.current = gp.axes[1];
            else this.buttons.moveDown.current = 0;
            if (gp.axes[1] < this.deadzone * -1) this.buttons.moveUp.current = gp.axes[1] * -1;
            else this.buttons.moveUp.current = 0;
            // If either axis of stick 2 is outside of deadzone
            if (Math.abs(gp.axes[2]) >= this.deadzone || Math.abs(gp.axes[3]) >= this.deadzone) {
                game.player.controller.aimX = gp.axes[2] * 100;
                game.player.controller.aimY = gp.axes[3] * 100;
            }
            if (gp.buttons[10].pressed) this.buttons.brake.current = 1;
            else this.buttons.brake.current = 0;
            if (gp.buttons[4].pressed) this.buttons.boost.current = 1;
            else this.buttons.boost.current = 0;

            // A button to switch to weapon 0
            if (gp.buttons[0].pressed) this.buttons.inventory2.current = 1;
            else this.buttons.inventory2.current = 0;
            // X button to switch to weapon 1
            if (gp.buttons[2].pressed) this.buttons.inventory1.current = 1;
            else this.buttons.inventory1.current = 0;
            // B button to throw
            if (gp.buttons[1].pressed) this.buttons.throw.current = 1;
            else this.buttons.throw.current = 0;

            // Left trigger to space
            if (gp.buttons[6].pressed) this.buttons.jump.current = 1;
            else this.buttons.jump.current = 0;

            // Right trigger to click
            if (gp.buttons[7].pressed) this.buttons.fire.current = 1;
            else this.buttons.fire.current = 0;

            // Select Button reloads window
            if (gp.buttons[8].pressed) if (game.match.ticks > 180) location.reload();

            // Start button pauses game
            if (gp.buttons[9].pressed) {
                this.buttons.start.current = 1;
                if (this.buttons.start.current != this.buttons.start.last) {
                    game.paused = !game.paused;
                }
                this.buttons.start.last = this.buttons.start.current;
            }
            else {
                this.buttons.start.current = 0;
                this.buttons.start.last = this.buttons.start.current;
            }
            if (gp.buttons[5].pressed) {
                game.player.camera._3D = 1;
                game.player.camera.angle = 0.35;
            } else {
                game.player.camera._3D = false;
                game.player.camera.angle = 1;
            }
        }
    }

    draw() {
        super.draw();
    }
}

/*
  ::::::::::: ::::::::  :::    :::  ::::::::  :::    ::: :::::::::     :::     :::::::::
     :+:    :+:    :+: :+:    :+: :+:    :+: :+:    :+: :+:    :+:  :+: :+:   :+:    :+:
    +:+    +:+    +:+ +:+    +:+ +:+        +:+    +:+ +:+    +:+ +:+   +:+  +:+    +:+
   +#+    +#+    +:+ +#+    +:+ +#+        +#++:++#++ +#++:++#+ +#++:++#++: +#+    +:+
  +#+    +#+    +#+ +#+    +#+ +#+        +#+    +#+ +#+       +#+     +#+ +#+    +#+
 #+#    #+#    #+# #+#    #+# #+#    #+# #+#    #+# #+#       #+#     #+# #+#    #+#
###     ########   ########   ########  ###    ### ###       ###     ### #########
*/
class Touch extends Controller {
    constructor(owner) {
        super(owner);
        this.type = "touch";
        this.touch = {
            enabled: true,
            event: {},
            left: {
                pos: new Vect3(150, 150, 75),
                radius: 75
            },
            right: {
                pos: new Vect3(150, 150, 75),
                radius: 75
            }
        };
    }

    setupInput() {
        window.addEventListener('touchstart', (event) => {
            event.preventDefault();
            event.stopImmediatePropagation();
            game.player.controller.touch.enabled = true;
            game.player.controller.touch.event = event;
            game.player.controller.touch.eventType = 'start';

        }, { passive: false });

        window.addEventListener('touchmove', (event) => {
            event.preventDefault();
            event.stopImmediatePropagation();
            game.player.controller.touch.event = event;
            game.player.controller.touch.eventType = 'move';
        }, { passive: false });

        window.addEventListener('touchend', (event) => {
            event.preventDefault();
            event.stopImmediatePropagation();
            game.player.controller.touch.event = event;
            game.player.controller.touch.eventType = 'end';
        }, { passive: false });

        window.addEventListener('touchcancel', (event) => {
            event.preventDefault();
            event.stopImmediatePropagation();
            getTouch(event);
        }, { passive: false });
    }

    read() {
        // Remember the last state of every command
        for (const button in this.buttons) {
            this.buttons[button].last = this.buttons[button].current;
        }
        if (this.touch.enabled) {
            if (this.touch.event.target == canvas) {
                let touchLeftFound = false;
                let touchRightFound = false;
                for (const touch of this.touch.event.targetTouches) {
                    let touchCoord = getCanvasRelative(touch);
                    // Check for touchbutton inventory 1 Rect collidepoint
                    if (game.player.interface.touchButton.inventory1.collidePoint(touchCoord.x, touchCoord.y))
                        game.player.character.item = 0;
                    if (game.player.interface.touchButton.inventory2.collidePoint(touchCoord.x, touchCoord.y))
                        game.player.character.item = 1;
                    // Check for left touch
                    let touchX = touchCoord.x - this.touch.left.pos.x;
                    let touchY = touchCoord.y - (game.window.h - this.touch.left.pos.y);
                    let distance = Math.sqrt(touchX ** 2 + touchY ** 2);
                    if (distance < this.touch.left.radius * 2) {

                        touchLeftFound = true;

                        if (distance > this.touch.right.radius)
                            if (game.match.ticks - this.touch.left.lastBoostTouch <= 10)
                                this.buttons.boost.current = 1;
                        //Normalize, but add a little bonus outside of main ring
                        touchX /= (distance / this.touch.left.radius) * 100;
                        touchY /= (distance / this.touch.left.radius) * 100;

                        //Cap the bonus at 1
                        if (touchX > 1) touchX = 1;
                        if (touchX > 1) touchX = 1;

                        //Attach to movement functions
                        if (touchX < 0) this.buttons.moveLeft.current = Math.abs(touchX);
                        if (touchX > 0) this.buttons.moveRight.current = Math.abs(touchX);
                        if (touchY < 0) this.buttons.moveUp.current = Math.abs(touchY);
                        if (touchY > 0) this.buttons.moveDown.current = Math.abs(touchY);

                    }
                    // Check for right touch
                    touchX = touchCoord.x - (game.window.w - this.touch.right.pos.x);
                    touchY = touchCoord.y - (game.window.h - this.touch.right.pos.y);
                    distance = Math.sqrt(touchX ** 2 + touchY ** 2);
                    if (distance < this.touch.right.radius * 2) {
                        touchRightFound = true;
                        //Button was pressed                            
                        if (distance > this.touch.right.radius) this.buttons.fire.current = 1;
                        //Normalize, then change the aim angle
                        touchX /= distance;
                        touchY /= distance;
                        this.aimX = touchX;
                        this.aimY = touchY;

                    }
                }
                if (!touchLeftFound) {
                    this.buttons.moveLeft.current = 0;
                    this.buttons.moveRight.current = 0;
                    this.buttons.moveUp.current = 0;
                    this.buttons.moveDown.current = 0;
                }
            }
            if (this.touch.eventType == 'end') {
                this.buttons.fire.current = 0;
                this.buttons.boost.current = 0;
                for (const touch of this.touch.event.changedTouches) {
                    let touchCoord = getCanvasRelative(touch);
                    let touchX = touchCoord.x - this.touch.left.pos.x;
                    let touchY = touchCoord.y - (game.window.h - this.touch.left.pos.y);
                    let distance = Math.sqrt(touchX ** 2 + touchY ** 2);
                    if ((distance > this.touch.left.radius) && (distance < (this.touch.left.radius * 2)))
                        this.touch.left.lastBoostTouch = game.match.ticks;
                }

            }
            this.touch.event = {};
            this.touch.eventType = {};
        }
    }

    draw() {
        super.draw();
        if (this.touch.enabled) {
            ctx.globalAlpha = 0.05;
            ctx.lineWidth = 8;
            ctx.strokeStyle = "#FFFFFF";
            ctx.fillStyle = "#000000";
            // Left touch
            ctx.beginPath();
            ctx.arc(
                this.touch.left.pos.x,
                game.window.h - this.touch.left.pos.y,
                this.touch.left.radius * 2,
                0, 2 * Math.PI);
            ctx.closePath();
            ctx.fill()
            ctx.stroke();
            ctx.beginPath();
            ctx.arc(
                this.touch.left.pos.x,
                game.window.h - this.touch.left.pos.y,
                this.touch.left.radius,
                0, 2 * Math.PI);
            ctx.closePath();
            ctx.fill()
            ctx.stroke();
            // Right touch
            ctx.beginPath();
            ctx.arc(
                game.window.w - this.touch.right.pos.x,
                game.window.h - this.touch.right.pos.y,
                this.touch.right.radius * 2,
                0, 2 * Math.PI);
            ctx.closePath();
            ctx.fill()
            ctx.stroke();
            ctx.beginPath();
            ctx.arc(
                game.window.w - this.touch.right.pos.x,
                game.window.h - this.touch.right.pos.y,
                this.touch.right.radius,
                0, 2 * Math.PI);
            ctx.closePath();
            ctx.fill()
            ctx.stroke();
            ctx.globalAlpha = 1;
        }
    }
}

/*
      :::::::::  :::    :::   :::   :::     :::   :::  :::   :::
     :+:    :+: :+:    :+:  :+:+: :+:+:   :+:+: :+:+: :+:   :+:
    +:+    +:+ +:+    +:+ +:+ +:+:+ +:+ +:+ +:+:+ +:+ +:+ +:+
   +#+    +:+ +#+    +:+ +#+  +:+  +#+ +#+  +:+  +#+  +#++:
  +#+    +#+ +#+    +#+ +#+       +#+ +#+       +#+   +#+
 #+#    #+# #+#    #+# #+#       #+# #+#       #+#   #+#
#########   ########  ###       ### ###       ###   ###
*/
class DummyController extends Controller {
    constructor(owner) {
        super(owner);
        this.type = "dummy";
    }
    setupInputs() { return }
    read() { return }
    draw() { return }
}