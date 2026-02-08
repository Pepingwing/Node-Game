let socket;
let line_pos;           //var with pos of lines
let line_n = 0;

/*
    Layering: (top to bottom)
        1 Drawing
        2 Ball
        3 BG
*/

function setup() {
    canvas = createCanvas(800, 450); //16:9 ratio
    background(51);

    socket = io.connect("http://localhost:3000");
    socket.on('mouse', newDrawing);
    socket.on('ball', newBall);
    socket.on('line', lines_pos);           //lines_pos is from other people, line_pos your own
}

function newDrawing(mouse_data){            //draws balls from other people
    console.log(mouse_data);
    noStroke();
    fill(252, 3, 3);
    ellipse(mouse_data.x, mouse_data.y, 25, 25);
}

function draw_own_balls (){                 // draws your balls and sends them to other clients (through server)
    console.log("X: " + mouseX + " Y: " + mouseY);

    let mouse_data = {
        x: mouseX,
        y: mouseY
    }

    noStroke();
    fill (255);
    ellipse(mouseX, mouseY, 25, 25);
    socket.emit('mouse', mouse_data);
}

function draw_own_lines(){                  // draw lines
    stroke(51);                        
    strokeWeight(4);
    line(line_pos.start_x, line_pos.start_y, line_pos.end_x, line_pos.end_y);      // delete last line
    
    line_pos.end_x = mouseX;
    line_pos.end_y = mouseY;
    console.log(line_pos);

    strokeWeight(3);                
    stroke('red');
    line(line_pos.start_x, line_pos.start_y, line_pos.end_x, line_pos.end_y);      // draw next line

    socket.emit('line', line_pos);
}

function draw_other_lines(lines_pos){
    console.log(lines_pos);
    strokeWeight(3);                
    stroke('red');
    line(lines_pos.start_x, lines_pos.start_y, lines_pos.end_x, lines_pos.end_y);   
}

function mousePressed(){                    // start point of line
    console.log("pressed");
    line_pos = {
        start_x: mouseX,
        start_y: mouseY,
        end_x: null,
        end_y: null
    }
}

function mouseDragged() {                   // current end point of line
    console.log("is pressed");
    
    //draw_own_balls();
    draw_own_lines();
    draw_other_lines();
}

function mouseReleased(){                   // end point of line
    console.log("releasd");
    lines.push(line_pos);
    console.log(lines);
}

function newBall(ball_data, connections, cx_speed, cy_speed){
    noStroke();
    fill(51);

    ellipse(ball_data.old_x, ball_data.old_y, 81, 81) //remove ball from last frame. Yes it needs to be 1 bigger.
    fill(252, 3, 3)
    ellipse(ball_data.x, ball_data.y, 80, 80);        //draw new ball
    
}

// function draw() {
//     fill(51);

// }//*/