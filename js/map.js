class Map {
    constructor(options) {
        this.w = 7200; //7200
        this.h = 4800; //4800
        this.nodes = [];

        this.friction = 0.99;
        this.gravity = 1;
        this.gravityFriction = 0.9;
        this.groundFriction = 0.5;
        this.maxSpeed = 20;
        this.collideDamageSpeed = 5;
        this.bgimg = new Image();
        this.bgimg.src = "img/maps/grass480.png";
        this.imgSizeW = 480;
        this.imgSizeH = 480;
        this.blocks = [];
        // this.blocks.lastBlock = () => { return this.blocks[this.blocks.length - 1]; }
        this.missiles = [];
        this.percipitation = false;
        this.debris = [];
        this.debrisAmount = 1000;
        this.debrisSpawn = function () {
            let tempx = Math.floor(Math.random() * this.w);
            let tempy = Math.floor(Math.random() * this.h * 1.5);
            return new Debris(allID++, tempx, tempy, { contained: false, imgFile: 'img/sprites/leaf1.png', w: 12, h: 12, z: this.h - (this.h - tempy) })
        }
        this.windH = 32; //z-height where wind takes place
        this.xwind = 2;
        this.ywind = 0;
        this.lightValue = [0, 0, 0, 0.0];
        this.runFuncs = []; // A list of functions to run during the step
        // this.lightValue = [0, 0, 128, 0.25];
        if (typeof options == 'object')
            for (const setting of Object.keys(options)) {
                if (this[setting] !== undefined)
                    this[setting] = options[setting];
            }

    }

    buildNavMesh() {
        for (let x = 0; x < this.w / 64; x++) {
            for (let y = 0; y < this.h / 64; y++) {
                this.nodes.push(new Node(x * 64, y * 64))
                for (const block of game.match.map.blocks) {
                    if (this.nodes[this.nodes.length - 1].pos.collideRect(new Rect(block.x, block.y, block.w, block.h))) {
                        this.nodes[this.nodes.length - 1].pass = false;
                    } else {
                    }
                }
            }
        }
    }


    postLoad() {
        //INIT DEBRIS
        if (this.percipitation) {
            for (let i = 0; i < 1000; i++) {
                let tempx = Math.floor(Math.random() * this.w);
                let tempy = Math.floor(Math.random() * this.h);
                this.debris.push(new Debris(allID++, tempx, tempy, { imgFile: 'img/sprites/leaf1.png', w: 12, h: 12, z: this.h - (this.h - tempy) }));
            }
            // THIS IS SUPPOSED TO FAST-FORWARD WIND DEBRIS BUT DOESN'T WORK
            // for (let i = 0; i < 60000; i++) {
            //     for (const e of this.debris) {
            //         e.step()
            //     }
            // }
        }
    }

    draw() {
        let mw = Math.ceil(game.window.w / this.imgSizeW) + 1 // How many "tiles" wide is the screen?
        let mh = Math.ceil(game.window.h / this.imgSizeH) + 1// How many "tiles" high is it?
        for (let row = 0; row < mw; row++) {
            for (let col = 0; col < mh; col++) {
                let nx = game.player.camera.x;
                let ny = game.player.camera.y;
                let shx = game.window.w / 2;
                let shy = game.window.h / 2;
                let compareX = ((game.player.camera.x - game.window.w / 2) % this.imgSizeW) * -1;
                let compareY = ((game.player.camera.y - game.window.h / 2) % this.imgSizeH) * -1;
                let tileX = compareX + (row * this.imgSizeW)
                let tileY = compareY + (col * this.imgSizeH)
                let totalX = tileX + game.player.camera.x - this.imgSizeW;
                let totalY = tileY + game.player.camera.y - this.imgSizeH;
                if (totalX <= this.w && totalY <= this.h && totalX >= 0 && totalY >= 0)
                    ctx.drawImage(this.bgimg, Math.floor(tileX), Math.floor(tileY), this.imgSizeW, this.imgSizeH);
            }
        }

        for (const node of this.nodes) {
            node.draw();
        }
    }

    step() {
        for (const e of this.debris) {
            if (e.cleanup && !e.active) {
                //Remove debris
                this.debris = this.debris.filter(function (el) { return el != e; });
            }
            if (this.percipitation && this.debris.length < this.debrisAmount) {
                this.debris.push(this.debrisSpawn())
            }
        }
        for (const e of this.missiles) {
            if (e.cleanup && !e.active) {
                //Remove missile
                this.missiles = this.missiles.filter(function (el) { return el != e; });
            }
        }

        this.wind();

        // Run all runFuncs
        for (const func of this.runFuncs) {
            func();
        }

    }

    wind() {
        for (const e of [game.player.character, ...game.match.bots, ...this.blocks, ...this.debris]) {
            if (e.wind && e.z + e.hover >= (this.windH * ((e.landable) ? 1 : 0))) {
                e.x += this.xwind * (1 - e.weight);
                e.y += this.ywind * (1 - e.weight);
            }

        }
    }

    lighting() {
        // ctx.globalCompositeOperation = "screen";
        ctx.fillStyle = `rgba(${this.lightValue[0]}, ${this.lightValue[1]}, ${this.lightValue[2]}, ${this.lightValue[3]})`
        ctx.fillRect(0, 0, game.window.w, game.window.h);
        // ctx.globalCompositeOperation = "source-over";
    }

}

class Node {
    constructor(x, y, w = 64, h = 64) {
        this.pos = new Rect(x, y, w, h)
        this.pass = true;
    }
    draw() {
        if (this.pass) {

            let compareX = game.player.camera.x - this.pos.x;
            let compareY = game.player.camera.y - this.pos.y;
            if (game.player.camera.radius > Math.max(Math.abs(compareX), Math.abs(compareY))) {
                ctx.strokeStyle = "#00FF00"
                ctx.strokeRect(game.window.w / 2 - compareX, game.window.h / 2 - compareY, this.pos.w, this.pos.h);
            }
        }

    }
}