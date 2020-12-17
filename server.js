const express = require('express');
const app = express();
var cors = require('cors');
app.use(cors());


const http = require('http').Server(app);
const io = require('socket.io')(http);

const timer = require('./timer.js')(io);

// Frontend logic
app.get('/', (req, res) => {
	res.sendFile(__dirname+'/index.html');
});
app.get('/review-timer.js', (req, res) => {
	res.sendFile(__dirname+'/review-timer.js');
});
app.get('/socket.io.min.js', (req, res) => {
	res.sendFile(__dirname+'/node_modules/socket.io/client-dist/socket.io.min.js');
});

const PORT = process.env.PORT || 3003;

http.listen(PORT, () => console.log('listening on port ' + PORT));
