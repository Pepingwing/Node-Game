let start = new Date();
var starttime = start.toLocaleDateString();
var startdate = start.toLocaleTimeString();

window.onload = function() {
    setInterval(function(){
        let date = new Date();
        let diff = date - start; //difference in milliseconds

        let seconds = Math.floor(diff / 1000) % 60; // time connected
        let minutes = Math.floor(diff / (1000 * 60)) % 60;
        let hours = Math.floor(diff / (1000 * 60 * 60));

       
        let displayDate = date.toLocaleDateString(); // current date and time
        let displayTime = date.toLocaleTimeString();

        document.getElementById('datetime').innerHTML = hours + ":" + minutes + ":" + seconds + "<br>" + displayDate + " " + displayTime;
    }, 1000); // to update every second
}