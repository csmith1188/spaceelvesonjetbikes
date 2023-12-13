// Calculate the potential new position of the circle after movement
let newX = this.HB.pos.x + this.speed.x;
let newY = this.HB.pos.y + this.speed.y;

// Find the closest point on the rectangle to the circle
let closestX = Math.max(Math.min(newX, c.HB.pos.x + c.HB.volume.x), c.HB.pos.x);
let closestY = Math.max(Math.min(newY, c.HB.pos.y + c.HB.volume.y), c.HB.pos.y);

// Calculate the distance between the circle's center and the closest point on the rectangle
let distanceX = newX - closestX;
let distanceY = newY - closestY;

// Calculate penetration depths
let penX = Math.abs(distanceX);
let penY = Math.abs(distanceY);

let side;
if (penX <= this.HB.radius && penY <= this.HB.radius) {
    if (penX < penY) {
        if (distanceX > 0) {
            this.HB.pos.x = c.HB.pos.x + c.HB.volume.x + this.HB.radius;
            console.log('right');
        } else {
            this.HB.pos.x = c.HB.pos.x + this.HB.radius;
            console.log('left');
        }
    } else {
        if (distanceY > 0) {
            this.HB.pos.y = c.HB.pos.y + c.HB.volume.y + this.HB.radius;
            console.log('down');
        } else {
            this.HB.pos.y = c.HB.pos.y + this.HB.radius;
            console.log('up');
        }
    }
}

this.lockon.x = closestX
this.lockon.y = closestY

console.log(penX, penY);


// //This can draw a line to the closest part of a rectangle
// ctx.strokeStyle = "#FF0000"
// ctx.lineWidth = 5;
// ctx.beginPath();
// ctx.moveTo(game.window.w / 2, game.window.h / 2);
// compareX = game.player.camera.x - this.lockon.x; //If you change this to the lockon
// compareY = game.player.camera.y - this.lockon.y; //If you change this to the lockon
// ctx.lineTo(game.window.w / 2 - compareX, game.window.h / 2 - compareY);
// ctx.stroke();