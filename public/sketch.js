let socket, line_pos;           //line_pos var with pos of latest line
let line_n = 0;
let lines = [];
let won = false;
let currentBall = {
    x: 80,
    y: 80,
    old_x: 0,
    old_y: 0,
    color: "rgb(10, 10, 10)",
    diameter: 60
}
let game_score = {
    green: 0,
    red: 0
}


function setup() {
    canvas = createCanvas(800, 450); //16:9 ratio
    background(51);

    //socket = io.connect("http://localhost:3000"); //for a local server 
    socket = io();
    socket.on('mouse', new_drawing);
    socket.on('ball', new_ball);
    socket.on('line', all_lines);
    socket.on('initial_lines', load_lines);
    socket.on('initial_score', load_score);
    socket.on('deleted_line', new_line_list);
    socket.on('win', player_won);
}

//until draw_own_balls function these are socket functions (messages from server)

function new_drawing(mouse_data){            //draws balls from other people (now unused)
    console.log(mouse_data);
    noStroke();
    fill(252, 3, 3);
    ellipse(mouse_data.x, mouse_data.y, 25, 25);
}

function all_lines(received_line){          // add a line
    console.log(received_line); //lines stored on every client as it's more practical (otherwise you have to send back and forth too much.)

    lines.push(received_line);
}
 
function load_lines(initial_lines){         //load on launch/boot or restart
    lines = initial_lines;
}

function load_score (initial_score) {
    game_score.green = initial_score.left;
    game_score.red = initial_score.right;
    update_score_display();
}

function new_line_list(deleted_line) {      // delete a line
    lines.splice(deleted_line, 1);
    console.log("new", lines);
}

function player_won(win){
    won = win;
    if (win == "green") {game_score.green += 1;} 
    else if (win == "red") {game_score.red += 1;}

    update_score_display();
}

function draw_own_balls (){                 // (unused) draws your balls and sends them to other clients (through server)
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

function keyPressed(){
    if (key === "s") {  // start over fully
        lines = [];
        socket.emit('delete_all_lines');
        socket.emit('reset_score');
        restart(false)
    }
   if (key === "r") {   // retry
        lines = [];
        socket.emit('delete_all_lines');
        restart(true);
    }
}

function restart(keep_score) {
    if (!(keep_score)) {
        game_score.green = 0;
        game_score.red = 0;
        update_score_display();
    }
    won = false;
    socket.emit('restart', game_score);
}

function update_score_display() {
    document.getElementById('green_score').textContent = game_score.green;
    document.getElementById('red_score').textContent = game_score.red;
}

function line_start_end(){                      // draw lines
    if (!line_pos) return;                      // safety check
    line_pos.end_x = mouseX;
    line_pos.end_y = mouseY;

    console.log(line_pos);
}

function mousePressed(){                    // start point of line
    console.log("pressed");
    line_pos = {
        start_x: mouseX,
        start_y: mouseY,
        end_x: mouseX,                      
        end_y: mouseY,
        own: true,
        finished: false
    }
}

function mouseDragged() {                   // current end point of line
    console.log("is pressed");
    
    //draw_own_balls();
    line_start_end()
}

function mouseReleased(){                   // end point of line
    console.log("released");
    if (line_pos) {
        lines.push(line_pos);
        console.log(line_pos);
        socket.emit('line', line_pos);
    }
    line_pos = null;  // Clear current line
}

function new_ball(ball_data){  
    currentBall = ball_data;        // Save new pos
}

function colorpick(n){
    stroke('red');
    if (lines[n].own){
        stroke('lightblue');
    }
}

/*
    Layering: (back to front, order of drawing)
        1 Background
        2 Lines
        3 Goals
        4 Ball
        5 Win text

*/
function draw() {
    background(51);
    
    // Draw all completed lines
    strokeWeight(3);
    for (let i = 0; i < lines.length; i++) {
        colorpick(i);
        line(lines[i].start_x, lines[i].start_y, lines[i].end_x, lines[i].end_y);
    }
    
    // Draw current line being drawn (if any)
    if (line_pos && mouseIsPressed) {
        stroke('lightblue');
        line(line_pos.start_x, line_pos.start_y, line_pos.end_x, line_pos.end_y);
    }
    
    //fill("rgb(94, 94, 255)");
    noStroke();
    fill("rgb(94, 255, 121)");
    circle(800/10, 450/2, 40);
    fill("rgb(214, 43, 43)");
    circle(800 - 800/10, 450 - 450/2, 40);

    // Draw the ball on top
    noStroke();
    fill(currentBall.color);
    circle(currentBall.x, currentBall.y, currentBall.diameter);

    if (!(won == false)){
        textSize(72);
        won_text = str(won);
        if (won == "green") {
            fill("rgb(94, 255, 121)")
            text(won_text + " won!", 800/2 - 335/2, 450/2);
        }
        else if (won == "red") {
            fill("rgb(214, 43, 43)");
            text(won_text + " won!", 800/2 - 245/2, 450/2);
        }
    }
}//*/