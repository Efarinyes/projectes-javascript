const canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d'); // tambe podem renderitzar en webgl2, bitmaprenderer

const $sprite = document.querySelector('#sprite');
const $bricks = document.querySelector('#bricks');

canvas.width = 448
canvas.height = 400

// Variables de la Pilota

// Tamany
const ballRadius = 4;

// Posició
let x = canvas.width / 2;
let y = canvas.height -30;

// Velocitat
let dx = -3;
let dy = -3;

// Variables de la raqueta
const paddleWidth = 50;
const paddleHeight = 10;

let paddleX = (canvas.width - paddleWidth ) / 2;
let paddleY = canvas.height - paddleHeight - 10;

let pressedRight = false;
let pressedLeft = false;

// Variables de les totxanes

const brickRowsCount = 6;
const brickColumnCount = 13;
const brickWidth = 31;
const brickHeight = 14;
const brickPadding = 1;
const brickOfssetTop = 80;
const brickOfssetLeft = 16;
const bricks = [];
const BRICK_STATUS = {
    ACTIVE: 1,
    DESTROYED: 0
}

for( let c = 0; c < brickColumnCount; c++ ) {
    bricks[c] = [];
    for( let r = 0; r < brickRowsCount; r++ ) {
        // Calcul per posicionar la totxana a la pantalla
        const brickX = c * ( brickWidth + brickPadding ) + brickOfssetLeft 
        const brickY = r * ( brickHeight + brickPadding ) + brickOfssetTop
        // Assignem colors aleatoris a cada totxana
        const random = Math.floor(Math.random() * 8)
        bricks[c][r] = { 
            x: brickX, 
            y: brickY, 
            status: BRICK_STATUS.ACTIVE, 
            color: random 
        }
    }
}


const PADDLE_SENSITIVITY = 7

// funcions per dibuixar els elements
function drawBall() {

    ctx.beginPath();
    ctx.arc(x, y, ballRadius, 0, Math.PI * 2);
    ctx.fillStyle = '#fff';
    ctx.fill();
    ctx.closePath();

}
function drawPaddle() {
    /* ctx.fillStyle ='#aaff55';
    ctx.fillRect( paddleX, paddleY, paddleWidth, paddleHeight ); */

    ctx.drawImage(
        $sprite, // imatge
        29,     // Coordenades de retall
        174,    // Coordenades de retall
        paddleWidth, // Tamany del retall
        paddleHeight, // Tamany del retall
        paddleX,      // Posició X del dibuix
        paddleY,      // Posició Y del dibuix
        paddleWidth,  // Ample del dibuix
        paddleHeight  // alçada del dibuix
    )
}

function drawBricks() {
    for( let c = 0; c < brickColumnCount; c++ ) {
        for( let r = 0; r < brickRowsCount; r++ ) {
            const currentBrick = bricks[c][r];
            if (currentBrick.status === BRICK_STATUS.DESTROYED) continue;

            // ctx.fillStyle = 'yellow';
            // ctx.rect(
            //     currentBrick.x,
            //     currentBrick.y,
            //     brickWidth,
            //     brickHeight
            // )
            // ctx.strokeStyle = 'red'
            // ctx.stroke()
            // ctx.fill()
            
            const clipX = currentBrick.color * 32;
            ctx.drawImage(
                $bricks,
                clipX,
                0,
                brickWidth,  // 31,
                brickHeight,   // 14,
                currentBrick.x,
                currentBrick.y,
                brickWidth,
                brickHeight
            )
        }
    }
}

function drawUI() {
    ctx.fillText(`FPS: ${framesPerSec}`, 5, 10)
  }


// funcions per detectar moviments
function collisionDetection() {

    for( let c = 0; c < brickColumnCount; c++ ) {
        for( let r = 0; r < brickRowsCount; r++ ) {
            const currentBrick = bricks[c][r];
            if (currentBrick.status === BRICK_STATUS.DESTROYED) continue;
            const isBallSameXAsBrick = 
                    x > currentBrick.x && 
                    x < currentBrick.x + brickWidth

            const isBallSameYAsBrick = 
                y > currentBrick.y &&
                y < currentBrick.y + brickHeight


            if ( isBallSameXAsBrick && isBallSameYAsBrick ) {
                dy = -dy
                currentBrick.status = BRICK_STATUS.DESTROYED
            }
        }
    }
}

function ballMovement() {
    // rebotem la pilota als laterals
    if(
        x + dx > canvas.width - ballRadius || // Pared dreta
        x + dx < ballRadius // paret esquerra

    ) {
        dx = -dx
    }
    // controlar el rebot a la part superior
    if (y + dy < ballRadius ) {
        dy = -dy
    }

    const isBallSameXAsPaddle = x > paddleX && x < paddleX + paddleWidth;
    const isBallTouchingPaddle = y + dy > paddleY



    if (isBallTouchingPaddle && isBallSameXAsPaddle ) { // La pilota toca la paleta
        dy = -dy
    }
    else if ( y + dy > canvas.height) { // la Pilota toca terra
        console.log('Gamen Over')
        document.location.reload();
    }

    x += dx;
    y += dy;
}
function paddleMovement() {

    if (pressedRight && paddleX < canvas.width - paddleWidth) {
        paddleX += PADDLE_SENSITIVITY;
    } else if(pressedLeft && paddleX > 0 ) {
        paddleX -= PADDLE_SENSITIVITY
    }
}

function cleanCanvas() {

    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function initEvents() {
    document.addEventListener('keydown', keyDownHandler);
    document.addEventListener('keyup', keyUpHandler);

    function keyDownHandler(event) {
        
        const { key } = event;
        if ( key === 'Right' || key === 'ArrowRight' ||  key.toLowerCase() === 'd') {
            pressedRight = true;
        } else if ( key === 'Left' || key === 'ArrowLeft' || key.toLowerCase() === 'a') {
            pressedLeft = true;
        }
    }

    function keyUpHandler(event) {
        const { key } = event;
        if ( key === 'Right' || key === 'ArrowRight' || key.toLowerCase() === 'a') {
            pressedRight = false;
        } else if ( key === 'Left' || key === 'ArrowLeft' || key.toLowerCase() === 'a') {
            pressedLeft = false;
        }
    }
}

// Velocitat de renderitzacio del joc

const fps = 60;
let msPrev = window.performance.now()
let msFPSPrev = window.performance.now() + 1000;
const msPerFrame = 1000 / fps
let frames = 0
let framesPerSec = fps;

function draw() {

    window.requestAnimationFrame(draw)
    const msNow = window.performance.now()
    const msPassed = msNow - msPrev;

    if( msPassed < msPerFrame ) return;

    const excessTime = msPassed % msPerFrame
    msPrev = msNow - excessTime;
    
    frames++;

    if (msFPSPrev < msNow)
    {
      msFPSPrev = window.performance.now() + 1000
      framesPerSec = frames;
      frames = 0;
    }

    // Renderitzem el joc
    cleanCanvas();
    drawBall();
    drawPaddle()
    drawBricks()
    drawUI()
    // Moviments i colisions
    collisionDetection()
    ballMovement()
    paddleMovement()

}

draw();
initEvents();