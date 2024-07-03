const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

canvas.width = 800;
canvas.height = 600;

const paddle = {
    width: 100,
    height: 20,
    x: canvas.width / 2 - 50,
    y: canvas.height - 30,
    dx: 0,
    speed: 6,
    move() {
        this.x += this.dx;
        if (this.x < 0) this.x = 0;
        if (this.x + this.width > canvas.width) this.x = canvas.width - this.width;
    },
    draw() {
        ctx.fillStyle = '#0095DD';
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }
};

const ball = {
    radius: 10,
    x: canvas.width / 2,
    y: canvas.height - 40,
    speed: 4,
    dx: 4,
    dy: -4,
    move() {
        this.x += this.dx;
        this.y += this.dy;

        if (this.x + this.radius > canvas.width || this.x - this.radius < 0) { //wall-left/right
            this.dx *= -1;
        }

        if (this.y - this.radius < 0) { //wall top 
            this.dy *= -1;
        }

        if (this.x > paddle.x && this.x < paddle.x + paddle.width && this.y + this.radius > paddle.y) { //paddle chk
            this.dy *= -1;
            this.y = paddle.y - this.radius;
        }

        if (this.y + this.radius > canvas.height) {
            window.location.reload();
        }
    },
    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = '#0095DD';
        ctx.fill();
        ctx.closePath();
    }
};

const brick = {
    rowCount: 5,
    columnCount: 9,
    width: 70,
    height: 20,
    padding: 10,
    offsetTop: 30,
    offsetLeft: 35,
    bricks: [],
    initialize() {
        for (let c = 0; c < this.columnCount; c++) {
            this.bricks[c] = [];
            for (let r = 0; r < this.rowCount; r++) {
                this.bricks[c][r] = { x: 0, y: 0, status: Math.random() > 0.5 ? 1 : 0 }; // Randomly place bricks
            }
        }
    },
    draw() {
        for (let c = 0; c < this.columnCount; c++) {
            for (let r = 0; r < this.rowCount; r++) {
                if (this.bricks[c][r].status === 1) {
                    const brickX = c * (this.width + this.padding) + this.offsetLeft;
                    const brickY = r * (this.height + this.padding) + this.offsetTop;
                    this.bricks[c][r].x = brickX;
                    this.bricks[c][r].y = brickY;
                    // ctx.beginPath();
                    ctx.rect(brickX, brickY, this.width, this.height);
                    ctx.fillStyle = 'aqua';
                    ctx.fill();
                    // ctx.closePath();
                }
            }
        }
    },
    collisionDetection() {
        for (let c = 0; c < this.columnCount; c++) {
            for (let r = 0; r < this.rowCount; r++) {
                const b = this.bricks[c][r];
                if (b.status === 1) {
                    if (ball.x > b.x && ball.x < b.x + this.width && ball.y > b.y && ball.y < b.y + this.height) {
                        ball.dy *= -1;
                        b.status = 0;
                    }
                }
            }
        }
    }
};

brick.initialize();

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    paddle.draw();
    ball.draw();
    brick.draw();
}

function update() {
    paddle.move();
    ball.move();
    brick.collisionDetection();
}

function gameLoop() {
    draw();
    update();
    requestAnimationFrame(gameLoop);
}

document.addEventListener('keydown', e => {
    if (e.key === 'ArrowRight') {
        paddle.dx = paddle.speed;
    } else if (e.key === 'ArrowLeft') {
        paddle.dx = -paddle.speed;
    }
});

document.addEventListener('keyup', e => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
        paddle.dx = 0;
    }
});

gameLoop();
