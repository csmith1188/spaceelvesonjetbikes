class Vect2 {
    constructor(x, y) {
        this.x = x || 0;
        this.y = y || 0;
    }
    compare(target) {
        let xd = target.x - this.x;
        let yd = target.y - this.y;
        let dist2 = Math.sqrt(xd ** 2 + yd ** 2);
        return {
            angle2: new Vect3(xd / dist2, yd / dist2, 0),
            difference: new Vect3(xd, yd, zd),
            distance2: dist2,
        }
    }
}

class Vect3 extends Vect2 {
    constructor(x, y, z) {
        super(x, y)
        this.z = z || 0;
    }
    compare(target) {
        let xd = target.x - this.x;
        let yd = target.y - this.y;
        let zd = target.z - this.z;
        let dist2 = Math.sqrt(xd ** 2 + yd ** 2);
        let dist3 = Math.sqrt(xd ** 2 + yd ** 2 + zd ** 2);
        return {
            angle2: new Vect3(xd / dist2, yd / dist2, 0),
            angle3: new Vect3(xd / dist3, yd / dist3, zd / dist3),
            difference: new Vect3(xd, yd, zd),
            distance2: dist2,
            distance3: dist3
        }
    }
}

class Rect {
    constructor(x, y, w, h) {
        this.x = x || 0;
        this.y = y || 0;
        this.w = w || 0;
        this.h = h || 0;
    }
    center() {
        return {
            x: this.x + (this.w / 2),
            y: this.y + (this.h / 2)
        }
    }
    collideRect(c) {
        if (this.x < c.x + c.w && this.x + this.w > c.x)
            if (this.y < c.y + c.h && this.y + this.h > c.y)
                return true
        return false
    }
    collideCube(c) {
        if (this.x < c.pos.x + c.volume.x && this.x + this.w > c.pos.x)
            if (this.y < c.pos.y + c.volume.y && this.y + this.h > c.pos.y)
                return true
        return false
    }
}

class Cube {
    constructor(origin, volume) {
        this.pos = origin;
        this.volume = volume;
        this.end = new Vect3(origin.x + volume.x, origin.y + volume.y, origin.z + volume.z);
    }
    half() {
        return new Vect3(this.volume.x / 2, this.volume.y / 2, this.volume.z / 2)
    }
    center() {
        return new Vect3(this.pos.x + (this.volume.x / 2), this.pos.x + (this.volume.y / 2), this.pos.x + (this.volume.z / 2))
    }
}

class Cylinder {
    constructor(origin, radius, height) {
        this.pos = origin;
        this.radius = radius;
        this.height = height;
    }
    collide(c, speed = new Vect3(0, 0, 0)) {
        //RECT/CUBE COLLIDE
        if (c instanceof Rect || c instanceof Cube) {
            // Calculate the potential new position of the circle after movement
            let newX = this.pos.x + speed.x;
            let newY = this.pos.y + speed.y;
            let newZ = this.pos.z + speed.z;

            // Find the closest point on the rectangle to the circle
            let closestX = Math.max(Math.min(newX, c.pos.x + c.volume.x), c.pos.x);
            let closestY = Math.max(Math.min(newY, c.pos.y + c.volume.y), c.pos.y);
            let closestZ = Math.max(Math.min(newZ, c.pos.z + c.volume.z), c.pos.z); // Considering the z-axis

            // Calculate the distance between the circle's center and the closest point on the rectangle
            let distanceX = newX - closestX;
            let distanceY = newY - closestY;
            let distanceZ = newZ - closestZ;

            // Calculate penetration depths
            let penX = Math.abs(distanceX);
            let penY = Math.abs(distanceY);
            let penZ = Math.abs(distanceZ);

            let side;
            if (penX <= this.radius && penY <= this.radius) {
                if (penX < penY) {
                    if (distanceY > 0)
                        side = 'front';
                    else
                        side = 'rear';
                } else {
                    if (distanceX > 0)
                        side = 'right';
                    else
                        side = 'left';
                }
                return side;
            } else {
                return false;
            }
        } else if (c instanceof Cylinder) {
            // Calculate the potential new position of the circle after movement
            let newX = this.pos.x + speed.x;
            let newY = this.pos.y + speed.y;

            // Calculate the distance between centers
            newX = newX - c.pos.x;
            newY = newY - c.pos.y;

            let distance = Math.sqrt(newX ** 2 + newY ** 2);

            if (distance < this.radius + c.radius) return 'side';
            else return false;

        } else {

        }
    }
}

function sineAnimate(amp, freq, offset) {
    if (!offset) offset = 0
    return amp * Math.sin(freq * (ticks + offset));
}

function easeout(userValue, maxValue) {
    const normalizedValue = userValue / maxValue;
    const easedValue = normalizedValue * (2 - normalizedValue);
    const modifiedValue = easedValue * maxValue;
    return modifiedValue;
}

function easeinout(userValue, maxValue) {
    const normalizedValue = userValue / maxValue;
    const easeInValue = normalizedValue < 0.5 ? 2 * normalizedValue * normalizedValue : -1 + (4 - 2 * normalizedValue) * normalizedValue;
    const easeOutValue = normalizedValue * (2 - normalizedValue);
    const modifiedValue = (easeInValue + easeOutValue) / 2 * maxValue;
    return modifiedValue
}