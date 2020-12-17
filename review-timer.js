const TOTAL_DURATION_IN_SECONDS = 60*60;
const TOTAL_DURATION_IN_MS = TOTAL_DURATION_IN_SECONDS * 1000;

const ADMIN_MODE_CLICK_THRESHOLD = 5;

var updateInterval;

var finishAtTime = calculateFinishTime(TOTAL_DURATION_IN_MS);
var socket = io();


function withLeadingZero(val){
	return (val < 10 ? '0' : '') + val;
}

function updateTimeText(remainingSeconds) {
	var sign = remainingSeconds < 0 ? '-' : '';
	var precise, raw;
	if (remainingSeconds < 0) {
		raw = "Die Zeit ist um.";
		precise = "Die Zeit ist um.";
	} else {
		var onlySeconds = remainingSeconds % 60;
		var onlyMinutes = (remainingSeconds - onlySeconds) / 60;

		raw = timeRaw(onlyMinutes, onlySeconds);
		precise = timePrecise(onlyMinutes, onlySeconds);
	}

	Array.from(document.getElementsByClassName('remaining-time-raw')).forEach(c => c.innerHTML = raw);
	Array.from(document.getElementsByClassName('remaining-time-precise')).forEach(c => c.innerHTML = precise);
}

function timePrecise(minutes, seconds) {
	return withLeadingZero(minutes) + ':' + withLeadingZero(seconds);
}

function timeRaw(minutes, seconds) {
	if (minutes > 0)
		return "Noch etwa " + minutes + " min";
	else {
		return "Nur noch " + seconds + " sec";
	}
}


function calculateRemainingSeconds(){
	let remainingMS = finishAtTime.getTime() - new Date().getTime();
	return Math.trunc(remainingMS / 1000);
}

function updateRemainingTime(){
	var remainingSeconds = calculateRemainingSeconds();

	updateTimeText(remainingSeconds);
}

function calculateFinishTime(newRemainingMS) {
	let nowInMS = new Date().getTime();
	return new Date(nowInMS + newRemainingMS);
}

function setRemainingTime(newRemainingMS, running) {
	clearInterval(updateInterval);

	finishAtTime = calculateFinishTime(newRemainingMS);

	updateRemainingTime();

	if (running)
		updateInterval = setInterval(updateRemainingTime, 100);
}

function play(){
	socket.emit('run');
}

function pause(){
	socket.emit('pause');
}

function setCustomTime(){
	var input = document.getElementById('minutes');
	setMinutes(input.value);
}

function setMinutes(minutes){
	socket.emit('setMinutes', Number(minutes));
}


socket.on('timerUpdate', function(message){
	setRemainingTime(message.remainingMiliSeconds, message.isRunning === true)
});
socket.on('connenct', () => {
	socket.emit('updateMe');
})
