var http = require('http'),
	url  = require('url');
http.createServer(function (req, res) {
	var myReq = req;
	
	var respData = '';
	if(req.url === '/'){
		res.writeHead(200, {'Content-Type': 'text/plain'});
		res.end('Yes, this is good');
	}else if(req.url.match(/favicon\.ico/)){
		
		res.writeHead(404, {'Content-Type': 'text/html'});
		res.end('404.');
	}else if(req.url.match(/small.jpg/)){
		res.writeHead(200, {'Content-Type': 'image/jpeg', 'Content-Length': 134});
		var buf = new Buffer('FFD8FFE000104A46494600010101004800480000FFDB004300FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFC2000B080001000101011100FFC40014100100000000000000000000000000000000FFDA0008010100013F10', 'hex');
		
		
		res.end(buf, 'binary');
		
	}else if(req.url.match(/crop/)){
		
		var breaker = require('./imagebreaker.js');
		
		breaker.handle(req, res);

		
	}
	
	
}).listen(8000);
