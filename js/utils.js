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

class Circle {
    constructor(x, y, r) {
        this.x = x || 0;
        this.y = y || 0;
        this.r = r || 0;
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
    collide(c) {
        if (c instanceof Rect) {
            testX = this.pos.x;
            testY = this.pos.y;

            //Find edge to check
            if (this.pos.x < c.pos.x) testX = c.pos.x;
            else if (this.pos.x > c.pos.x + c.volume.x) testX = c.volume.x + c.volume.x;
            if (this.pos.y < c.pos.y) testY = c.pos.y;
            else if (this.pos.y > c.pos.y + c.volume.y) testy = c.volume.y + c.volume.y;

            let distX = this.pos.x - textX;
            let distY = this.pos.y - textY;
            let distance = Math.sqrt(distX ** 2 + distY ** 2);

            if (distance <= this.radius)
                return true;
            return false;
        } else if (c instanceof Cube) {
            let testX = this.pos.x;
            let testY = this.pos.y;

            //Find edge to check
            if (this.pos.x < c.pos.x) testX = c.pos.x;
            else if (this.pos.x > c.pos.x + c.volume.x) testX = c.pos.x + c.volume.x;
            if (this.pos.y < c.pos.y) testY = c.pos.y;
            else if (this.pos.y > c.pos.y + c.volume.y) testY = c.pos.y + c.volume.y;

            let distX = this.pos.x - testX;
            let distY = this.pos.y - testY;
            let distance = Math.sqrt(distX ** 2 + distY ** 2);

            if (distance <= this.radius)
                // if (!this.pos.z >= c.pos.z + c.volume.z && !this.pos.z + this.height <= c.pos.z)
                return true;
            return false;
        } else if (c instanceof Circle) {

        } else if (c instanceof Cylinder) {

        } else {

        }
    }
}

function sineAnimate(amp, freq) {
    return amp * Math.sin(freq * ticks);
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