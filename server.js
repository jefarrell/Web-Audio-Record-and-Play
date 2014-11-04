// HTTP Portion
var http = require('http');
var fs = require('fs'); // Using the filesystem module
var httpServer = http.createServer(requestHandler);
var url = require('url');
httpServer.listen(8080);

var imageNumber = 0;

function requestHandler(req, res) {

	var parsedUrl = url.parse(req.url);
	console.log("The Request is: " + parsedUrl.pathname);

	fs.readFile(__dirname + parsedUrl.pathname, 
		// Callback function for reading
		function (err, data) {
			// if there is an error
			if (err) {
				res.writeHead(500);
				return res.end('Error loading ' + parsedUrl.pathname);
			}
			// Otherwise, send the data, the contents of the file
			res.writeHead(200);
			res.end(data);
  		}
  	);
}

// WebSocket Portion
// WebSockets work with the HTTP server
var io = require('socket.io').listen(httpServer);

// Register a callback function to run when we have an individual connection
// This is run for each individual user that connects
io.sockets.on('connection', 
	// We are given a websocket object in our function
	function (socket) {
	
		console.log("We have a new client: " + socket.id);
	
		// When this user "send" from clientside javascript, we get a "message"
		// client side: socket.send("the message");  or socket.emit('message', "the message");
		socket.on('message', 
			// Run this function when a message is sent
			function (data) {
				console.log("message: " + data);
				
				// Call "broadcast" to send it to all clients (except sender), this is equal to
				// socket.broadcast.emit('message', data);
				socket.broadcast.send(data);
				
				// To all clients, on io.sockets instead
				// io.sockets.emit('message', "this goes to everyone");
			}
		);
		
		// When this user emits, client side: socket.emit('otherevent',some data);
		socket.on('image', function(data) {
			// Data comes in as whatever was sent, including objects
			//console.log("Received: 'image' " + data);
			var searchFor = "data:image/webp;base64,";
			var positionFound = data.indexOf(searchFor);
			//console.log("position found: " + positionFound + " " + searchFor.length);
			var slicedImage = data.slice(positionFound + searchFor.length);
			//console.log("Sliced Image:" + slicedImage);
			
			var binaryImage = new Buffer(slicedImage, 'base64');
			fs.writeFile('image' + imageNumber + '.webp', binaryImage, function (err) {
			  if (err) throw err;
				  console.log('It\'s saved!');
			});			
			imageNumber++;
			
		});
		
		socket.on('audio', function(data) {
			//console.log("Received: 'audio' " + JSON.stringify(data));
			console.log("received: 'audio' ");
			/*
			var binaryAudio = new Buffer(data);
			fs.writeFile('audio.wav', binaryAudio, function (err) {
				if (err) console.log(err);
				console.log("It's saved");
			});
			*/
			io.sockets.emit('audio', data);
		});
		
		
		socket.on('disconnect', function() {
			console.log("Client has disconnected");
		});
	}
);


