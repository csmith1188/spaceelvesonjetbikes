class Item {
    constructor(options) {
        // Options
        if (typeof options === 'object')
            for (var key of Object.keys(options)) {
                this[key] = options[key];
            }
    }
    use(user, xaim, yaim, mode) {
    }
}

class Pistol extends Item {
    constructor(options) {
        super(options);
        this.type = 'pistol';
        this.shootSFX = new Audio('sfx/laser_01.wav');
        this.projectileSpeed = 20;
        this.range = 300;
        this.coolDown = 10;
        this.nextCool = 0;
        this.ammo = 10;
        this.ammoMax = 10;
        // Options
        if (typeof options === 'object')
            for (var key of Object.keys(options)) {
                this[key] = options[key];
            }
    }
    use(user, aimX, aimY, mode) {
        // Check cooldown
        if (ticks > this.nextCool) {
            // Set next cooldown
            this.nextCool = ticks + this.coolDown;
            // Check ammo
            if (this.ammo > 0) {
                this.ammo--; // consume a bullet
                this.shootSFX.play(); // play shoot sound
                //find the distance from player to mouse with pythagorean theorem
                let distance = ((aimX ** 2) + (aimY ** 2)) ** 0.5;
                //Normalize the dimension distance by the real distance (ratio)
                aimX = (aimX / distance);
                aimY = (aimY / distance);
                // Add the user's speed and multiply speed BEFORE spread for satisfying flamer
                let spreadMagnitude = user.accuracy; // Apply spread and user accuracy
                // Randomize spread
                let spreadX = (Math.random() * 2 - 1) * spreadMagnitude;
                let spreadY = (Math.random() * 2 - 1) * spreadMagnitude;
                // Add spread to aim
                aimX += spreadX;
                aimY += spreadY;
                // Multiply by this missile's speed
                aimX *= this.projectileSpeed;
                aimY *= this.projectileSpeed;
                // Add missile to map
                game.match.map.missiles.push(
                    new Missile(
                        allID++, // ID
                        user.HB.pos.x, user.HB.pos.y, user.HB.pos.z, 4, 4, 0, // Position and size
                        {
                            speed: new Vect3(aimX, aimY, 0)
                        }
                    )
                );
            } else {
                if (user.ammo.ballistic > 0) {
                    this.ammo = this.ammoMax;   // reload
                    user.ammo.ballistic--;      // consume a clip from a user
                } else {
                    //play empty click sound
                }
            }
        }
    }
}

class Flamer extends Item {
    constructor(options) {
        super(options);
        this.type = 'flamer';
        this.range = 200;
        this.shootSFX = new Audio('sfx/hit_02.wav');
        this.projectileSpeed = 10;
        this.coolDown = 6;
        this.nextCool = 0;
        // Options
        if (typeof options === 'object')
            for (var key of Object.keys(options)) {
                this[key] = options[key];
            }
    }

    use(user, xaim, yaim, mode) {
        if (user.ammo.flamer > 0) {
            if (ticks > this.nextCool) {
                this.nextCool = ticks + this.coolDown;
                user.ammo.flamer--;
                this.shootSFX.play();
                for (let i = 0; i < 5; i++) {
                    // if (this.lungeSFX.duration <= 0 || this.lungeSFX.paused)
                    //     this.lungeSFX.play();
                    let aimX = xaim;
                    let aimY = yaim;
                    //find the distance from player to mouse with pythagorean theorem
                    let distance = Math.sqrt(aimX ** 2 + aimY ** 2);
                    //Normalize the dimension distance by the real distance (ratio)
                    //Then multiply by the distance of the out circle

                    // Add the user's speed and multiply speed BEFORE spread for satisfying flamer
                    aimX = (aimX / distance) * this.projectileSpeed + user.xspeed;
                    aimY = (aimY / distance) * this.projectileSpeed + user.yspeed;

                    let spreadMagnitude = user.accuracy * 40;

                    let spreadX = (Math.random() * 2 - 1) * spreadMagnitude;
                    let spreadY = (Math.random() * 2 - 1) * spreadMagnitude;

                    aimX += spreadX;
                    aimY += spreadY;

                    game.match.map.missiles.push(new Missile(allID++, user.x, user.y, {
                        parent: user,
                        color: user.color,
                        z: user.z,
                        xspeed: aimX,
                        yspeed: aimY,
                        dxspeed: aimX,
                        dyspeed: aimY,
                        livetime: 10,
                        damage: 3,
                        wind: true
                    }));
                }
            }
        }
    }
}

class JumpDropper extends Item {
    constructor(options) {
        super(options);
        this.type = 'jumpdropper';
        this.bonus = 10;
        this.live = 20;
        this.delay = 0;
        this.range = 0;
        this.shootSFX = new Audio('sfx/laser_01.wav');
        // Options
        if (typeof options === 'object')
            for (var key of Object.keys(options)) {
                this[key] = options[key];
            }
    }

    use(user, xaim, yaim, mode) {
        if (user.ammo.jumpdropper > 0) {
            user.ammo.jumpdropper--;
            game.match.map.blocks.push(new JumpPad(allID++, user.x, user.y, {
                color: '#FF9933',
                jumpBoost: this.bonus,
                parent: user,
                livetime: this.live,
                dying: true,
                startDelay: ticks + this.delay
            }));
        }
    }
}