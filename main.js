const offscreenCanvas = document.getElementById('offscreen-canvas');
const offscreenContext = offscreenCanvas.getContext('2d');
const mainCanvas = document.getElementById('main-canvas');
const mainContext = mainCanvas.getContext('2d');
const stampCanvas = document.getElementById('stamp-canvas');
const stampContext = stampCanvas.getContext('2d');

const strokeWidth = 10;

var stokeColor = 'black';
var clicked = false;
var oldX = 0;
var oldY = 0;
var mouseX = 0;
var mouseY = 0;

function addColors() {
    const colors = ['black', 'grey', 'white'];
    ts = 3;
    th = 8;
    for (var h = 0; h < th; h++) {
        for (var s = 0.5; s < ts; s++) {
            colors.push(`hsl(${(h / th) * 360},80%,${(s / ts) * 100}%)`);
        }
    }

    const colorsDiv = document.getElementById('colors');
    for (const color of colors) {
        colorsDiv.appendChild(createButton(color));
    }
}

function createButton(color) {
    const btn = document.createElement('button');
    btn.style = 'background-color:' + color;
    btn.addEventListener('click', () => {
        stokeColor = color;
    });
    return btn;
}

//Clear canvas. Little shortcut + can't use clear as a name
function cc(context) {
    context.clearRect(0, 0, context.canvas.width, context.canvas.height);
}

function resize() {
    //Using to canvases here to keep content when resizing
    //since canvases are cleared when resized
    mainCanvas.width = window.innerWidth;
    mainCanvas.height = window.innerHeight;
    mainContext.drawImage(offscreenCanvas, 0, 0);

    //Only resize if window is bigger than canvas
    //Saves data outside of the screen area
    //Useful if you don't want to lose your drawings
    //if you make the window smaller and then larger again
    if (
        offscreenCanvas.width < window.innerWidth ||
        offscreenCanvas.height < window.innerHeight
    ) {
        offscreenCanvas.width = window.innerWidth;
        offscreenCanvas.height = window.innerHeight;
        offscreenContext.drawImage(mainCanvas, 0, 0);
    }
}

function setPosition(e) {
    mouseX = e.offsetX;
    mouseY = e.offsetY;
}

function loop() {
    if (clicked) {
        if (stamp) {
            stampContext.lineWidth = strokeWidth;
            stampContext.strokeStyle = stokeColor;
            stampContext.fillStyle = stokeColor;

            //Using paths here to fill out the area between cursor positions.
            //Allows you to move the mouse faster
            stampContext.beginPath();
            stampContext.moveTo(oldX, oldY);
            stampContext.lineTo(mouseX, mouseY);
            stampContext.closePath();
            stampContext.stroke();

            //Drawing circles in between the lines because joints don't
            //seem to work on very small paths.
            //Without the circles the line would have many small holes
            stampContext.beginPath();
            stampContext.ellipse(
                mouseX,
                mouseY,
                strokeWidth / 2,
                strokeWidth / 2,
                0,
                0,
                2 * Math.PI
            );
            stampContext.closePath();
            stampContext.fill();
        } else {
            offscreenContext.drawImage(
                stampCanvas,
                mouseX - stampCanvas.width / 2,
                mouseY - stampCanvas.height / 2
            );
        }
    }

    oldX = mouseX;
    oldY = mouseY;

    mainContext.clearRect(0, 0, mainCanvas.width, mainCanvas.height);
    mainContext.drawImage(offscreenCanvas, 0, 0);
    requestAnimationFrame(loop);
}

stampCanvas.width = 250;
stampCanvas.height = 250;
stampContext.lineCap = 'round';
resize();

addColors();
requestAnimationFrame(loop);

window.addEventListener('resize', resize);
document.getElementById('stamp-canvas').addEventListener('mousedown', (e) => {
    if (e.button == 2) return;
    clicked = true;
    stamp = true;
});
document.getElementById('main-canvas').addEventListener('mousedown', (e) => {
    if (e.button == 2) return;
    clicked = true;
    stamp = false;
});
window.addEventListener('mouseup', () => {
    clicked = false;
});
window.addEventListener('mousemove', setPosition);