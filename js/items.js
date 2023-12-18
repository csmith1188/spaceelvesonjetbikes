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
        this.reloadTime = 60;
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
                        user.HB.pos.x, user.HB.pos.y, user.HB.pos.z, 4, 4, 0, user, // Position and size
                        {
                            speed: new Vect3(aimX, aimY, 0),
                            color: user.color
                        }
                    )
                );
            } else {
                if (user.ammo.ballistic > 0) {
                    this.ammo = this.ammoMax;   // reload
                    this.nextCool = ticks + this.reloadTime; // set reload time
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
        this.type = 'pistol';
        this.shootSFX = new Audio('sfx/hit_02.wav');
        this.projectileSpeed = 10;
        this.range = 200;
        this.coolDown = 6;
        this.reloadTime = 60;
        this.nextCool = 0;
        this.ammo = 5;
        this.ammoMax = 5;
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
                for (let i = 0; i < 5; i++) {
                    let distance = Math.sqrt(aimX ** 2 + aimY ** 2);
                    aimX = (aimX / distance) * this.projectileSpeed;
                    aimY = (aimY / distance) * this.projectileSpeed;

                    let spreadMagnitude = user.accuracy * 40;

                    let spreadX = (Math.random() * 2 - 1) * spreadMagnitude;
                    let spreadY = (Math.random() * 2 - 1) * spreadMagnitude;

                    aimX += spreadX + user.speed.x;
                    aimY += spreadY + user.speed.y;
                    // Add missiles to map
                    game.match.map.missiles.push(
                        new Missile(
                            allID++, // ID
                            user.HB.pos.x, user.HB.pos.y, user.HB.pos.z, 4, 4, 0, user, // Position and size
                            {
                                livetime: 10,
                                speed: new Vect3(aimX, aimY, 0),
                                color: user.color,
                                damage: 3
                            }
                        )
                    );
                }
            } else {
                if (user.ammo.ballistic > 0) {
                    this.ammo = this.ammoMax;   // reload
                    this.nextCool = ticks + this.reloadTime; // set reload time
                    user.ammo.ballistic--;      // consume a clip from a user
                } else {
                    //play empty click sound
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