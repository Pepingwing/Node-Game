var socket;

/*
    Layering: (top to bottom)
        1 Drawing
        2 Ball
        3 BG
*/

function setup() {
    canvas = createCanvas(800, 450);
    // const canvas = document.getElementById("canvas");
    // const ctx = canvas.getContext("2d");
    
    background(51);

    socket = io.connect("http://localhost:3000");
    socket.on('mouse', newDrawing);
    socket.on('ball', newBall);
}

function newDrawing(mousedata){
    noStroke();
    fill(252, 3, 3);
    ellipse(mousedata.x, mousedata.y, 25, 25);
}



function mouseDragged() {
    console.log("X, Y" + mouseX + ", " + mouseY);

    let mouse_data = {
        x: mouseX,
        y: mouseY
    }

    socket.emit('mouse', mouse_data);

    noStroke();
    fill (255);
    ellipse(mouseX, mouseY, 25, 25);
}

function newBall(ball_data, connections, cx_speed, cy_speed){
    noStroke();
    fill(51);

    ellipse(ball_data.old_x, ball_data.old_y, 81, 81) //remove ball from last frame. Yes it needs to be 1 bigger.
    fill(252, 3, 3)
    ellipse(ball_data.x, ball_data.y, 80, 80);        //draw new ball
    
}

/*function draw() {
    
}//*/