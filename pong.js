/*jshint esversion: 6 */

var canvas = document.createElement('canvas');
var context = canvas.getContext('2d');
canvas.width = 768;
canvas.height = 512;
document.body.appendChild(canvas);

var seizureMode = !confirm('Normal mode?');
console.log(seizureMode);

var p1 = {
    x: 0,
    y: canvas.height / 2 - 32,
    yspeed: 384,
    width: 10,
    height: 64,
    score: 0
};

var p2 = {
    x: canvas.width - 10,
    y: canvas.height / 2 - 32,
    yspeed: 384,
    width: 10,
    height: 64,
    score: 0
};

var ball = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    xvel: -384,
    yvel: 0,
    width: 10,
    height: 10,
    maxspeed: 384
};

var keysDown = [];

addEventListener('keydown', function (e) {
    keysDown[e.keyCode] = true;
}, false);

addEventListener('keyup', function (e) {
    keysDown[e.keyCode] = false;
}, false);

var reset = function (direction) {
    ball.x = canvas.width / 2;
    ball.y = canvas.height / 2;
    ball.maxspeed = 384;
    ball.xvel = 384 * direction;
    ball.yvel = 0;
    win = 0;
};

var bgHue = 0;

var update = function (dt) {
    if (keysDown[65] && p1.y > 0) {
        p1.y -= p1.yspeed * dt;
    }
    if (keysDown[90] && p1.y < canvas.height - p1.height) {
        p1.y += p1.yspeed * dt;
    }
    if (keysDown[38] && p2.y > 0) {
        p2.y -= p2.yspeed * dt;
    }
    if (keysDown[40] && p2.y < canvas.height - p2.height) {
        p2.y += p2.yspeed * dt;
    }
    var col = paddleCollision();
    if (col !== false) {
        if (col === 'p1') {
            ball.x = p1.width;
            ball.yvel = - ball.maxspeed * Math.sin((p1.y + p1.height / 2 - ball.y) / (p1.height / 2) * Math.PI / 3);
            ball.xvel = ball.maxspeed * Math.cos((p1.y + p1.height / 2 - ball.y) / (p1.height / 2) * Math.PI / 3);
        } else {
            ball.x = canvas.width - p2.width;
            ball.yvel = - ball.maxspeed * Math.sin((p2.y + p2.height / 2 - ball.y) / (p2.height / 2) * Math.PI / 3);
            ball.xvel = - ball.maxspeed * Math.cos((p2.y + p2.height / 2 - ball.y) / (p2.height / 2) * Math.PI / 3);
        }
    } else if (ball.x + ball.width < 0) {
        p2.score += 1;
        reset(1);
    } else if (ball.x > canvas.width) {
        p1.score += 1;
        reset(-1);
    }
    if (ball.yvel < 0 && ball.y <= 0) {
        ball.yvel *= -1;
    } else if (ball.yvel > 0 && ball.y + ball.height > canvas.height) {
        ball.yvel *= -1;
    }
    ball.x += ball.xvel * dt;
    ball.y += ball.yvel * dt;
    if (seizureMode) {
        ball.maxspeed += 15 * dt;
    }
    
    // p2.y += p2.yspeed * Math.sign(ball.y - p2.y) * dt; // ssshh super secret ai
    
    bgHue = (bgHue + ball.maxspeed * dt) % 256;
};

var paddleCollision = function () {
    if (ball.x > 0 && ball.x <= p1.width && ball.y >= p1.y && ball.y <= p1.y + p1.height) {
        return 'p1';
    }
    if (ball.x < canvas.width && ball.x >= canvas.width - p2.width && ball.y >= p2.y && ball.y <= p2.y + p2.height) {
        return 'p2';
    }
    return false;
};

context.textAlign = "center";
context.font = "16px Consolas";
var render = function () {
    context.clearRect(0, 0, canvas.width, canvas.height);
    if (seizureMode) {
        context.fillStyle = `hsl(${bgHue}, 100%, 62.5%)`;
        context.fillRect(0, 0, canvas.width, canvas.height);
    }
    context.fillStyle = '#FFFFFF';
    context.fillRect(p1.x, p1.y, p1.width, p1.height);
    context.fillRect(p2.x, p2.y, p2.width, p2.height);
    context.fillRect(ball.x, ball.y, ball.width, ball.height);
    context.fillText("P1: " + p1.score, 320, 32);
    context.fillText("P2: " + p2.score, 416, 32);
};

var main = function () {
    var now = Date.now();
    var delta = now - then;
    then = now;

    update(delta / 1000);
    render();
    
    requestAnimationFrame(main);
};

var then = Date.now();
reset(-1);
//setInterval(update, 1);
main();