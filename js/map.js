class Map {
    constructor(options) {
        this.w = 256; //7200
        this.h = 256; //4800
        this.tileSize = 32;
        this.nodes = [];

        this.friction = {
            air: 0.01,
            ground: 0.1
        }

        this.gravity = 1;
        this.stopZone = 0.1;
        this.grace = 10;

        this.bgimg = new Image();
        this.bgimg.src = "img/tiles/tile001.png";
        this.imgSizeW = 32;
        this.imgSizeH = 32;

        this.blocks = [];
        this.lastBlock = () => { return this.blocks[this.blocks.length - 1]; }
        this.missiles = [];
        this.debris = [];

        this.lightValue = [0, 0, 0, 0.0];
        // this.lightValue = [0, 0, 128, 0.25];

        this.runFuncs = []; // A list of functions to run during the step

        if (typeof options == 'object')
            for (const setting of Object.keys(options)) {
                if (this[setting] !== undefined)
                    this[setting] = options[setting];
            }

    }

    buildNavMesh() {
        for (let x = 0; x < this.w / this.tileSize; x++) {
            for (let y = 0; y < this.h / this.tileSize; y++) {
                this.nodes.push(new Node(x * this.tileSize, y * this.tileSize))
                for (const block of game.match.map.blocks) {
                    if (this.nodes[this.nodes.length - 1].pos.collideCube(block.HB)) {
                        this.nodes[this.nodes.length - 1].pass = false;
                    } else {
                    }
                }
            }
        }
    }

    draw() {
        for (let x = 0; x < this.w / this.tileSize; x++) {
            for (let y = 0; y < this.h / this.tileSize; y++) {
                let compareX = game.player.camera.x - (x * this.tileSize);
                let compareY;
                if (game.player.camera._3D)
                    compareY = game.player.camera.y - (y * this.tileSize * game.player.camera.angle);
                else
                    compareY = game.player.camera.y - (y * this.tileSize);
                if (game.player.camera.radius > Math.max(Math.abs(compareX), Math.abs(compareY))) {
                    if (game.player.camera._3D)
                        ctx.drawImage(
                            this.bgimg,
                            game.window.w / 2 - compareX,
                            game.window.h / 2 - (compareY * game.player.camera.angle),
                            this.tileSize,
                            this.tileSize * game.player.camera.angle
                        );
                    else
                        ctx.drawImage(
                            this.bgimg,
                            game.window.w / 2 - compareX,
                            game.window.h / 2 - compareY,
                            this.tileSize,
                            this.tileSize
                        );
                }
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

        // Run all runFuncs
        for (const func of this.runFuncs) {
            func();
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
    constructor(x, y, w = game.match.map.tileSize, h = game.match.map.tileSize) {
        this.pos = new Rect(x, y, w, h)
        this.pass = true;
    }
    draw() {
        if (this.pass) {
            let compareX = game.player.camera.x - this.pos.x;
            let compareY = game.player.camera.y - this.pos.y;
            if (game.player.camera.radius > Math.max(Math.abs(compareX), Math.abs(compareY))) {
                ctx.strokeStyle = "#00FF00"
                // ctx.strokeRect(game.window.w / 2 - compareX, game.window.h / 2 - compareY, this.pos.w, this.pos.h);
            }
        }

    }
}