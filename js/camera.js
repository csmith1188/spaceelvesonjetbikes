class Camera {
    constructor(options) {
        this.target;
        this.radius;
        this.angle = 0;
        if (typeof options === 'object')
            for (var key of Object.keys(options)) {
                this[key] = options[key];
            }
    }
}