const app = require('express')();
const server = require('http').createServer(app);
const io = require('socket.io')(server);

const PORT = 3000;

io.on('connection', socket => {
	socket.on('disconnect', () => {
		console.log('user disconnected');
	});
	socket.on('add-message', (message) =>  {
		io.emit('message', message);
	});
});
server.listen(PORT, () => {
	console.log(`started on port ${PORT}`);
});