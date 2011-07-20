var im = require('imagemagick'),
  http = require('http'),
   url = require('url');

function handle(req, res){
		var respData;
		
		var urlData = url.parse(req.url,true);
		// http://farm7.static.flickr.com/6002/5949520546_7ff09849d0_o.jpg
		var g = http.request({
			host:'farm' + urlData.query.farm + '.static.flickr.com',
			port: 80,
			path:urlData.query.path
			//http://farm7.static.flickr.com/6002/5949520546_3b10f92a44_b.jpg
		}, function(resp){
			resp.setEncoding('binary');
			respData = '';
			
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
                       res.writeHead(404, {'Content-Type': 'text/html'});
					   console.log(req.headers);
                       console.log(err);
                       res.end('Sorry, you did something stupid I bet. No image here.');
					}else{
		                res.writeHead(200, {'Content-Type': 'image/jpeg'});
					    res.end(stdout, 'binary');
                    }
				});
				
				
			})
			
		}).on('error', function(e) {
			console.log(e.message);
		});
		
		g.end();
	
}

exports.handle = handle;
