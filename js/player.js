class Bot {
    constructor(options) {
        this.type = 'bot';
        this.character = new Character(allID++, 0, 0, this);
        this.controller = new DummyController();
        this.best = {
            air: 0,
            airtime: 0,
            speed: 0,
            damage: 0,
            lap: 0
        }
        // Options
        if (typeof options === 'object')
            for (var key of Object.keys(options)) {
                this[key] = options[key];
            }
    }

    /*
          :::     :::::::::::
       :+: :+:       :+:
     +:+   +:+      +:+
   +#++:++#++:     +#+
  +#+     +#+     +#+
 #+#     #+#     #+#
###     ### ###########
*/
    AI() {
        for (const c of game.match.map.blocks) {
            if (c != this.character) {
                if (Math.abs(this.character.x - c.x) < this.character.w / 2 + (c.w / 2) + 50 && Math.abs(this.character.y - c.y) < this.character.h / 2 + (c.h / 2) + 50 && this.character.z < c.d && c.z < this.character.d) {
                        this.controller.buttons.jump.current = 1;
                } else {
                    this.controller.buttons.jump.current = 0;
                }
            }
        }
        if (this.character.target) {
            if (this.character.target.type == 'goal') this.character.formationRange = 0;
            if (Math.abs(this.character.x - this.character.target.x) < this.character.w / 2 + (this.character.target.w / 2) + this.character.formationRange && Math.abs(this.character.y - this.character.target.y) < this.character.h / 2 + (this.character.target.h / 2) + this.character.formationRange && this.character.z < this.character.target.d && this.character.target.z < this.character.d) {
                this.character.inFormation = true;
            } else {
                let compareX = this.character.target.x - this.character.x;
                let compareY = this.character.target.y - this.character.y;

                let distance = Math.sqrt(compareX ** 2 + compareY ** 2);

                let dx = compareX / distance;
                let dy = compareY / distance;

                let directX = (Math.abs(dx) + 1.4) / 2;
                if (directX > 1) directX = 1;
                let directY = (Math.abs(dy) + 1.4) / 2;
                if (directY > 1) directY = 1;

                this.controller.aimX = dx;
                this.controller.aimY = dy;

                if (compareX > 0) {
                    this.controller.buttons.moveLeft.current = 0;
                    this.controller.buttons.moveRight.current = directX;
                    this.character.img.src = this.character.gfx + '.png';
                }
                else if (compareX <= 0) {
                    this.controller.buttons.moveLeft.current = directX;
                    this.controller.buttons.moveRight.current = 0;
                    this.character.img.src = this.character.leftgfx + '.png';
                } else {
                    this.controller.buttons.moveLeft.current = this.controller.buttons.moveRight.current = 0;
                }
                if (compareY < 0) {
                    this.controller.buttons.moveUp.current = directX;
                    this.controller.buttons.moveDown.current = 0;
                }
                else if (compareY > 0) {
                    this.controller.buttons.moveUp.current = 0;
                    this.controller.buttons.moveDown.current = directX;
                } else {
                    this.controller.buttons.moveDown.current = this.controller.buttons.moveUp.current = 0;
                }

                // Switch guns when empty
                if (this.character.ammo[this.character.inventory[this.character.item].type] <= 0) {
                    this.character.item++;
                    if (this.character.item >= this.character.inventory.length) this.character.item = 0;
                }

                // Attack
                if (Math.abs(distance) <= this.character.inventory[this.character.item].range && this.character.target.team != this.character.team)
                    this.controller.buttons.fire.current = 1;
                else
                    this.controller.buttons.fire.current = 0;

            }

            if (this.character.target.team !== undefined) {
                if (this.character.target.team == this.character.team) this.character.formationRange = this.character.dformationRange;
                else this.character.formationRange = 0;
                if (this.character.target.lastColNPC)
                    if (this.character.target.lastColNPC.team != this.character.team)
                        this.character.target = this.character.target.lastColNPC;
            }

            //If my target is not active
            if (!this.character.target.active) {
                this.findTarget();
            }
        } else {
            this.findTarget();
        }
    }

    findTarget() {
        this.character.target = null;
        // If the player is active, rally to them or attack them
        if (game.player.character.active) {
            this.character.target = game.player.character;
        }
        // Look for another NPC to attack!
        for (const npc of game.match.bots) {
            if (npc.character.active && npc.character.team != this.character.team) this.character.target = npc.character;
        }
        // Look for a goal to race through?
        if (!this.character.target) this.character.target = game.match.goals[0];
        //Try to get back into formation
        if (!this.character.target)
            for (const npc of game.match.bots) {
                if (npc.character.active && npc.character.team == this.team) this.character.target = npc.character;
            }
        // Target itself?
        if (!this.character.target) this.character.target = this.character;
    }

}

class Player extends Bot {
    constructor(options) {
        super(options);
        this.type = 'player';
        this.character = new Character(allID++, 0, 0, this);
        this.controller = new Controller();
        this.camera = new Camera({ target: this.character });;
        this.interface = new Interface(this);
        // Options
        if (typeof options === 'object')
            for (var key of Object.keys(options)) {
                this[key] = options[key];
            }
    }

    AI() {
        return
    }

    findTarget() {
        return
    }
}