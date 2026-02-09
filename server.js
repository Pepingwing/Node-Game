//C:\Users\joppe_mp1ev\Documents\Coding\Node
/*                                              cd Documents/Coding/Node 
                                                node server                 */   
let express = require('express');
let app = express();
const port = process.env.PORT || 3000;
let server = app.listen(port, () => {
    console.log("server is running on port " + port);
});
console.log("\n" + "server is running: 127.0.0.1:3000"); 

app.use(express.static('public'));
let socket = require('socket.io');
let io = socket(server);

io.sockets.on('connection', newConnection);     // ^ server creation


let timer = 0;
let restarting = false;
let manual_reset = false;
let restart_time;
let connections = 0;
let line_collided = 0;
let cx_speed = 0; //connections x speed increase, cx- cy_speed and connections - unused in final cut
let cy_speed = 0;

let initial_x_speed, initial_y_speed;

function ball_start_direction() {
    initial_x_speed = random_number(-2, 2);                             //random a
    initial_y_speed = Math.sqrt(Math.max(0, 4 - (Math.pow(initial_x_speed, 2))));    // c^2 - a^2 = b^2
    if (Math.random() < 0.5) {
        initial_y_speed *= -1;
    }
    initial_x_speed *= 1.5;
    initial_y_speed *= 1.5;
}
function random_number(min, max) {  //based on w3schools function
    return Math.random() * (max - min + 1) + min;
}
ball_start_direction();

let ball_data = {
    x: 800/2,
    y: 450/2,
    old_x: 0,
    old_y: 0,
    x_speed: initial_x_speed,
    y_speed: initial_y_speed,
    color: "rgb(10, 10, 10)",
    diameter: 60
}
let received_lines = [];       //array with all lines
let score = {
    left: 0,
    right: 0
}


function ball_movement(){
    timer += 1;
    ball_data.old_x = ball_data.x;                          //save previous location
    ball_data.old_y = ball_data.y;

    cx_speed = connections;
    cy_speed = connections;

    if (ball_data.x_speed < 0){
        cx_speed = Math.sqrt(cx_speed * cx_speed) * -1;     // makes speed negative, even if it is already
}
    if (ball_data.y_speed < 0){
        cy_speed = Math.sqrt(cy_speed * cy_speed) * -1;
}

    // ball_data.x += ball_data.x_speed + cx_speed;            // moving the ball
    // ball_data.y += ball_data.y_speed + cy_speed;
    ball_data.x += ball_data.x_speed;            
    ball_data.y += ball_data.y_speed;

    if (ball_data.x >= 800 - 60/2 || ball_data.x <= 60/2) {        // bounce off walls
        ball_data.x_speed *= -1;
}
    if (ball_data.y >= 450 - 60/2 || ball_data.y <= 60/2) {
        ball_data.y_speed *= -1;
}
    for (let i = 0; i < received_lines.length; i++){
        if (line_circle_collision(received_lines[i].start_x, received_lines[i].start_y, received_lines[i].end_x, received_lines[i].end_y, ball_data.x, ball_data.y, ball_data.diameter)){                                                  // line-circle collission checks
            line_collided += 1;
            console.log("line_collided", line_collided);
            received_lines.splice(i, 1);
            io.sockets.emit("deleted_line", i);
        }
    }
    
    let win = ball_goal_colission();
    if ((restarting) && (timer - restart_time == 50)) {    //game ended
        restarting = false;
        restart_time = 0;
        win = false;
        io.sockets.emit('win', win);
        restart_game_state();    
    }
    if (!(restarting) && !(win == false)) {                 // when ball has touched a goal
        restarting = true;
        restart_time = timer;
         
        console.log(win, " won");
        io.sockets.emit('win', win);
        if (win == "green") {                           //red = red won = touching green
            score.left += 1;
        }
        else if (win == "red") {
            score.right += 1;
        }
    }
    //console.log("b ", ball_data, cx_speed, cy_speed);
    io.sockets.emit('ball', ball_data);
    io.sockets.emit('connections', connections, cx_speed, cy_speed);
}
setInterval(ball_movement, 16);  // roughly every frame

function ball_goal_colission (){ // circle circle colission check
    const left_goal = { //since I don't want to alter these, i can just store this in client and server, instead of sending back and/or forth data that doens't change
        x: 800/10,
        y: 450/2,
        diameter: 40
    }
    const right_goal = {
        x: 800 - 800/10,
        y: 450/2,
        diameter: 40
    }
    left_goal_distance = Math.sqrt(Math.pow(left_goal.y - ball_data.y, 2) + Math.pow(left_goal.x - ball_data.x, 2));
    right_goal_distance = Math.sqrt(Math.pow(right_goal.y - ball_data.y, 2) + Math.pow(right_goal.x - ball_data.x, 2));

    if (left_goal_distance <= (ball_data.diameter + left_goal.diameter)/2) {return "red";}              //touching green
    else if (right_goal_distance <= (ball_data.diameter + right_goal.diameter)/2) {return "green";}     //touching red
    else {return false;}
}

function line_circle_collision(line_start_x, line_start_y, line_end_x, line_end_y, circle_mid_x, circle_mid_y, diameter){
    if (line_start_x == line_end_x && line_start_y == line_end_y){
        return undefined;
    }

    let directional_coefficient = (line_start_y - line_end_y) / (line_start_x - line_end_x);                            // dy/dx
    let starting_number = line_start_y - directional_coefficient * line_start_x;                                        // line_start(p, q) q-ap = b in y=ax+b
    let perpendicular_DC = -1 / directional_coefficient;                                                                // -1/dc
    let perpendicular_starting_number = -perpendicular_DC * circle_mid_x + circle_mid_y;                                // b = y -ax or y = ax + b   
    let cross_x = (perpendicular_starting_number - starting_number) / (directional_coefficient - perpendicular_DC);     // ax + b = cx + e      ax = cx + e - b     x = (cx + e) / (a - b)
    let cross_y = perpendicular_DC * cross_x + perpendicular_starting_number;                                           // y = ax + b
    
    let min_x = Math.min(line_start_x, line_end_x); // you need both for completely horizontal/vertical lines
    let max_x = Math.max(line_start_x, line_end_x); 
    let min_y = Math.min(line_start_y, line_end_y);
    let max_y = Math.max(line_start_y, line_end_y);

    if (cross_x >= min_x && cross_x <= max_x && cross_y >= min_y && cross_y <= max_y){   // If closest point is on the line
        let x_distance = circle_mid_x - cross_x;
        let y_distance = circle_mid_y - cross_y;
        let distance = Math.sqrt(Math.pow(x_distance, 2) + Math.pow(y_distance, 2));

        if (distance <= diameter/2){
            ball_bounce_angle(ball_data.x_speed, ball_data.y_speed, directional_coefficient);
            //ball_data.color = "gray";
            
            return true;
        }
        else {
            //ball_data.color = "black";
            return false;
        }
    }
    else {// if closest point isnt on the line (but still touches)
        let min_x_distance = circle_mid_x - min_x;  // note that min and max don't refer to how far away they are, they're just a smaller and bigger number.
        let max_x_distance = circle_mid_x - max_x;
        let min_y_distance = circle_mid_y - min_y;
        let max_y_distance = circle_mid_y - max_y;

        let min_distance = (Math.sqrt(Math.pow(min_x_distance, 2) + Math.pow(min_y_distance, 2))); //checking distance to both endpoints
        let max_distance = (Math.sqrt(Math.pow(max_x_distance, 2) + Math.pow(max_y_distance, 2)));
        let distance, x_distance, y_distance;
        if (min_distance < max_distance){   //smallest distance is to be worked with
            distance = min_distance;
            x_distance = min_x_distance;
            y_distance = min_y_distance;
        }
        else if (max_distance < min_distance) {
            distance = max_distance;
            x_distance = max_x_distance;
            y_distance = max_y_distance;
        }
        else {
            return false;
        }
        if ((distance <= diameter/2)){
            let endpoint_directional_coefficient = (y_distance) / (x_distance);
            ball_bounce_angle(ball_data.x_speed, ball_data.y_speed, endpoint_directional_coefficient);   
            //ball_data.color = "gray";
            return true;
        }
        //ball_data.color = "black";
        return false;
    }
}

function ball_bounce_angle (x_speed, y_speed, line_angle){  //angle represented by two numbers, x and y speed    
    ball_data.x_speed = ((1 - Math.pow(line_angle, 2)) * x_speed + 2 * line_angle * y_speed) / (1 + Math.pow(line_angle, 2));
    ball_data.y_speed = ((Math.pow(line_angle, 2) - 1) * y_speed + 2 * line_angle * x_speed) / (1 + Math.pow(line_angle, 2));

    // new_vx = ((1 - line_angle²) * vx + 2 * line_angle * vy) / (1 + line_angle²)
    // new_vy = ((line_angle² - 1) * vy + 2 * line_angle * vx) / (1 + line_angle²)
}

function restart_game_state() {
    timer = 0;
    restarting = false;
    manual_reset = false;
    restart_time = 0;
    line_collided = 0;

    ball_start_direction();
    ball_data.x = 800/2;
    ball_data.y = 450/2;
    ball_data.old_x = 0;
    ball_data.old_y = 0;
    ball_data.x_speed = initial_x_speed * 1.25;
    ball_data.y_speed = initial_y_speed * 1.25;

    received_lines = [];                                //array with all lines
    io.sockets.emit('initial_lines', received_lines);
}

function newConnection(socket){
    connections += 1;
    //console.log('new connection: ' + socket.id);    
    console.log("c ", connections, "+");

    socket.emit('initial_lines', received_lines);
    socket.emit('initial_score', score);

    socket.on('disconnect', function(){
        connections -= 1;
        console.log("c ", connections, "-");
});

    socket.on('mouse', mouseMsg);
    socket.on('line', line_Msg);
    socket.on('delete_all_lines', reset_lines);
    socket.on('restart', reset_game_state);
    socket.on('reset_score', restart_score);

    function mouseMsg(mouse_data){
        console.log(" m ", mouse_data);
        socket.broadcast.emit('mouse', mouse_data);   //  everyone except sender
        //io.sockets.emit('mouse', mouse_data);           everyone including sender 
    }

    function line_Msg(line_pos){
        line_pos.own = false;
        received_lines.push(line_pos);                  // include new line to the list
        let line_surplus = received_lines.length - 5;

        console.log(" l ", line_pos);
        socket.broadcast.emit('line', line_pos);

        if (line_surplus > 0) {
            for (let i = 0; i < line_surplus; i++) {    //to ensure it removes any surplus (more than 5) oldest lines from the game
                received_lines.splice(0,  1);
                io.sockets.emit("deleted_line", 0);
            }
        }
        
    }

    function reset_lines(delete_all_lines) {
        received_lines = [];
        io.sockets.emit('initial_lines', received_lines);
    }

    function restart_score (reset_score) {
        score.left = 0;
        score.right = 0;
        io.sockets.emit('initial_score', score);
    }

    function reset_game_state (restart) {
        score.left = restart.green;
        score.right = restart.red;
        restart_game_state();
    }
}

ball_data.old_x = ball_data.x;
ball_data.old_y = ball_data.y;

// server.listen(port, hostname, () => {
//     console.log(`Server running at http://${hostname}:${port}/`);
// });