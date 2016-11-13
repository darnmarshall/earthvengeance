// index.js
const moment = require('moment')
const exphbs = require('express-handlebars')  
const path = require('path')  
const port = 80

const express = require('express')  
const app = express()



app.engine('.hbs', exphbs({  
	defaultLayout: 'main',
	extname: '.hbs',
	layoutsDir: path.join(__dirname, 'views/layouts')
}))
app.set('view engine', '.hbs')  
app.set('views', path.join(__dirname, 'views'))

app.use(express.static(path.join(__dirname, 'public')))

app.get('/', (request, response) => {  
	response.render('game', {
		name: 'John'
	})
})

// const users = [{name:'test',age:17}]

// app.post('/users', function (request, response) {  
//     // retrieve user posted data from the body
//     const user = request.body
//     console.log(request)
//     users.push({
//       name: user.name,
//       age: user.age
//     })
//     response.send('successfully registered')
// })

// app.get('/users', function (request, response) {  
// 	response.render('users',{
// 		users: users
// 	})
// })

app.use((err, request, response, next) => {  
	// log the error, for now just console.log
	console.log(err)
	response.status(500).send('Something broke!\n<br>')
	// console.log(request.body)
})


var players = []
var nextID = 0


function newPlayer() {
	var idNum = nextID;
	nextID++;

   var newPlayer = {
   	id: idNum,
   };
	players['#' + idNum] = newPlayer;

	return newPlayer
}


var http = require('http').Server(app);
var io = require('socket.io')(http);

io.on('connection', function(socket){
	player = newPlayer()
	
	io.emit('news', "player " + player.id + " connected");

	socket.emit('initConnection', {
		id: player.id,
		players: players
	});

	socket.broadcast.emit('playerJoined',player);

	socket.on('update', function(updatedPlayer){
		players["#" + updatedPlayer.id] = updatedPlayer
		players["#" + updatedPlayer.id].lastUpdated = moment();
	});

	socket.on('disconnect', function(msg){
		delete players["#" + player.id]
		io.emit('news', "player " + player.id + " disconnected");
		console.log("player " + player.id + " disconnected");
	});

});

function kickUnresponsivePlayers() {
	for (var key in players) {
		if (players.hasOwnProperty(key)) {
			players[key].lagTime = moment().diff(players[key].lastUpdated, 'seconds')
			if(players[key].lagTime > 3) {
				delete players[key]
			}
		}
	}
}

setInterval (function () {
	kickUnresponsivePlayers();
	console.log('heartbeat. ' + players.length + ' players. Next ID: ' + nextID);
	
	json = JSON.stringify(players);
	console.log(players);console.log(json);
	io.emit('update', json);
}, 1000);

http.listen(80, function(){
  console.log('listening on *:80');
});

