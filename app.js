require('dotenv').config();

const app = require('express')();
const server = require('http').createServer(app);
const io = require('socket.io')(server);

const PORT = process.env.PORT || 3000;


const MongoClient = require('mongodb').MongoClient;

const url = process.env.MONGODB_URI;

const dbName = 'test';

class Chat {
	constructor() {
		this.connection = MongoClient.connect(url, (err, client) => {	
			console.log("conectou ao chat;")	
			this.db = client.db('chat');
		});
	}

	addMessage(message) {
		this.db.collection('messages').insertOne(message, (err, res) => {
			if(err) {
				throw err;
			}
			console.log('nova mensagem:', message);
		});
	}

	async getAllMessages() {

		return new Promise( (resolve, reject) => {
			this.db.collection('messages').find({}).sort({ _id: -1}).limit(20).toArray( (err, res) => {
				if(err)
					reject(err);
				else 
					resolve(res);
			})
		});
	}

	close() {
		console.log("conexão fechada");
		if(this.connection) {
			console.log('db:', this.db);
			this.connection.close();
		}
	}
}

/*
setTimeout( () => {

	chat.close();
}, 2000);
*/

const chat = new Chat();

io.on('connection', socket => {
	
	setTimeout(async () => {
		const data = await chat.getAllMessages();
			
		let tmp = data;

		tmp.reverse();

		socket.emit('onLoad', data);
	}, 1000);

	socket.on('disconnect', () => {
		console.log('user disconnected');
	});
	socket.on('add-message', (message) =>  {
		console.log('adicionando mensagem:', message);
		chat.addMessage(message);
		io.emit('message', message);
	});
});


server.listen(PORT, () => {
	console.log(`started on port ${PORT}`);
});

