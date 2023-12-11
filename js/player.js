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
                if (!c.tags.includes('debris') && !c.tags.includes('nocollide') && Math.abs(this.character.x - c.x) < this.character.w / 2 + (c.w / 2) + this.character.lookAhead && Math.abs(this.character.y - c.y) < this.character.h / 2 + (c.h / 2) + this.character.lookAhead && this.character.z < c.d && c.z < this.character.d) {
                    // if (this.character.power >= this.character.jumpCost) {
                    this.character.zspeed += 7
                    this.character.power -= this.character.jumpCost
                    // }
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

                let speed = this.character.speedMulti;
                if (this.character.z > game.match.map.windH)
                    speed *= 0.1;
                if (compareX > 0 && this.character.xspeed < this.character.maxSpeed) {
                    this.character.xspeed += speed;
                    this.character.img.src = this.character.gfx + '.png';
                }
                else if (compareX <= 0 && this.character.xspeed > this.character.maxSpeed * -1) {
                    this.character.xspeed -= speed;
                    this.character.img.src = this.character.leftgfx + '.png';
                }
                if (compareY < 0 && this.character.yspeed > this.character.maxSpeed * -1) this.character.yspeed -= speed;
                else if (compareY >= 0 && this.character.yspeed < this.character.maxSpeed) this.character.yspeed += speed;

                let distance = Math.sqrt(compareX ** 2 + compareY ** 2);

                // Switch guns when empty
                if (this.character.ammo[this.character.inventory[this.character.item].type] <= 0) {
                    this.character.item++;
                    if (this.character.item >= this.character.inventory.length) this.character.item = 0;
                }

                // Attack
                if (Math.abs(distance) <= this.character.inventory[this.character.item].range && this.character.target.team != this.character.team)
                    if (ticks % 20 == 0) this.character.inventory[this.character.item].use(this.character, compareX, compareY, 0);
            }

            if (this.character.target.team !== undefined) {
                if (this.character.target.team == this.character.team) this.character.formationRange = this.character.dformationRange;
                else this.character.formationRange = 0;
                if (this.character.target.lastColNPC)
                    if (this.character.target.lastColNPC.team != this.character.team)
                        this.character.target = this.character.target.lastColNPC;
            }

            //If my target is not active
            if (this.target)
                if (!this.target.active) this.findTarget();
        } else {
            this.findTarget();
        }
    }

    findTarget() {
        this.target = null;
        // If the player is active, rally to them or attack them
        if (game.player.character.active) {
            this.target = game.player.character;
        }
        // Look for another NPC to attack!
        for (const npc of game.match.bots) {
            if (npc.active && npc.team != this.team) this.target = npc;
        }
        // Look for a goal to race through?
        if (!this.target) this.target = game.match.goals[0];
        //Try to get back into formation
        if (!this.target)
            for (const npc of game.match.bots) {
                if (npc.active && npc.team == this.team) this.target = npc;
            }
        // Target itself?
        if (!this.target) this.target = this;
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