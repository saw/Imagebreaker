var http = require('http'),
	url  = require('url');
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
		
	}else if(req.url.match(/crop/)){
		res.writeHead(200, {'Content-Type': 'image/jpeg'});
		var urlData = url.parse(req.url,true);
		console.log(urlData.query.crop);
		// http://farm7.static.flickr.com/6002/5949520546_7ff09849d0_o.jpg
		var g = http.request({
			host:'farm' + urlData.query.farm + '.static.flickr.com',
			port: 80,
			path:urlData.query.path
			//http://farm7.static.flickr.com/6002/5949520546_3b10f92a44_b.jpg
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
					width:urlData.query.width,
					sharpening:0.5,
					format:'jpg',
					quality:0.9,
					filter:'Lagrange',
					customArgs:['-crop',urlData.query.crop, '+repage']
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