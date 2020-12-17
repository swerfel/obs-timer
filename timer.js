const HOUR_IN_MS = 1000 * 60 * 60;
const FIVE_MINUTES_IN_MS = 1000 * 60 * 5;

var running = false;
var deadline;
var remainingMiliSeconds = FIVE_MINUTES_IN_MS;

var allClients;
var authentications;

function dateWithOffset(date, offsetInMS) {
	let oldInMS = date.getTime();
	let nowInMS = new Date().getTime();

	let newInMS = Math.min(oldInMS + offsetInMS, nowInMS + HOUR_IN_MS);

	return new Date(newInMS);
}

function run(){
	if (!running) {
		running = true;
		deadline = dateWithOffset(new Date(), remainingMiliSeconds);
		timerUpdate()
	}
}

function pause(){
	if (running) {
		running = false;
		remainingMiliSeconds = calculateRemainingMiliSeconds();
		timerUpdate();
	}
}

function setMinutes(minutes) {
	running = false;
	remainingMiliSeconds = 1000 *  60 * minutes;
	run();
}

function handleTimerCommand(command, client) {
	switch (command) {
		case "run":
			run();
			break;
		case "pause":
			pause();
			break;
	}
}

function calculateRemainingMiliSeconds(){
	let nowInMS = new Date().getTime();
	let deadlineInMs = deadline.getTime();
	return deadlineInMs - nowInMS;
}

function updateMessage(){
	let remaining = running ? calculateRemainingMiliSeconds() : remainingMiliSeconds;
	return {
		remainingMiliSeconds: remaining,
		isRunning: running
	}
}

var sockets;

function timerUpdate(){
	sockets.emit('timerUpdate', updateMessage());
}

module.exports = function(io) {
	sockets = io;

	sockets.on("connection", (socket) => {
		socket.on('run', () => run())
		socket.on('pause', () => pause())
		socket.on('setMinutes', (minutes) => setMinutes(minutes))
		socket.on('updateMe', () => sockets.emit('timerUpdate', updateMessage()))
		sockets.emit('timerUpdate', updateMessage())
	})
}
