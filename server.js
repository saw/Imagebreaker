var http = require('http');

http.createServer(function (req, res) {
	var myReq = req;
	
	var respData = '';
	if(req.url === '/'){
		res.writeHead(200, {'Content-Type': 'text/plain'});
		
		res.write('ok');
		res.end('Yes, this is good');
	}else if(req.url.match(/favicon\.ico/)){
		
		res.writeHead(404, {'Content-Type': 'text/html'});
		res.end('404.');
	}else if(req.url.match(/small.jpg/)){
		res.writeHead(200, {'Content-Type': 'image/jpeg', 'Content-Length': 134});
		var buf = new Buffer('FFD8FFE000104A46494600010101004800480000FFDB004300FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFC2000B080001000101011100FFC40014100100000000000000000000000000000000FFDA0008010100013F10', 'hex');
		
		
		res.end(buf, 'binary');
		
	}else if(req.url.match(/test.jpg/)){
		res.writeHead(200, {'Content-Type': 'image/jpeg'});
		console.log('fetching image');
		var g = http.request({
			host:'farm7.static.flickr.com',
			port: 80,
			path:'/6020/5906330026_bcf5cc5bdb_o.jpg'
			//http://farm7.static.flickr.com/6020/5906330026_bcf5cc5bdb_o.jpg
		}, function(resp){
			resp.setEncoding('binary');
			
			
			resp.on('data', function(chunk){
			
				respData += chunk;
				
			});
			
			resp.on('end', function(){
				console.log('done loading data, beginning convert');
				var b = new Buffer(respData);
				
				var im = require('imagemagick');
				im.resize({
					srcData:respData,
					width:500,
					height:500,
					sharpening:0.5,
					crop:'120x120+10+5',
					format:'jpg',
					quality:0.5
				}, function(err, stdout, stderr){
					if(err){
						throw err;
					}
					res.end(stdout, 'binary');
				});
				
				
			})
			
		}).on('error', function(e) {
			console.log(e.message);
		});
		
		g.end();
		
	}
	
	
}).listen(1337, "127.0.0.1");


console.log('Server running at http://127.0.0.1:1337/');