var im = require('imagemagick'),
  http = require('http'),
   url = require('url'),
s404   = '<html><head><title>404!</title></head><body>Sorry, you did something stupid I bet. No image here.</body></html>';
 cacheTimeout = 300000;

//this is badly designed, I keep passing state around...

var imageCache = (function(){
	
	var data = {};
	
	return {
		addImage:function(key, cdata){
			data[key] = cdata;
			setTimeout(function(){
				console.log('invalidating cache: ' + key);
				delete(data[key]);
			},cacheTimeout);
		},
		
		getImage:function(key){
			return data[key];
		},
		
		destroy:function(key){
			delete(data[key]);
			console.log('cache key: ' + key + ' destroyed');
		}
	};
	
})();

function processImage(respData, urlData, res){
	var startTime = Date.now();
	if(!respData){
		res.writeHead(404, {'Content-Type': 'text/html', 'x-served-by':'node.js'});
		console.log('no image');
        res.end(s404 + ' :32');
		return;
	}
	
	im.resize({
		srcData:respData,
		width:urlData.query.width,
		sharpening:0.5,
		format:'jpg',
		quality:0.7,
		filter:'Lagrange',
		customArgs:['-crop',urlData.query.crop, '+repage']
	}, function(err, stdout, stderr){
		if(err){
           res.writeHead(404, {'Content-Type': 'text/html'});
           res.end(s404 + ' :47');
		   imageCache.destroy(urlData.query.path);
		}else{
            res.writeHead(200, {'Content-Type': 'image/jpeg','x-served-by':'node.js'});
		    res.end(stdout, 'binary');
		
			//log after we are done with this request!
			console.log('Done in: ' + (Date.now() - startTime) + 'ms');
        }
	});
}

function handle(req, res){
		var startTime = Date.now();
		var respData;
		
		var urlData = url.parse(req.url,true);
		// http://farm7.static.flickr.com/6002/5949520546_7ff09849d0_o.jpg
		var cacheData = imageCache.getImage(urlData.query.path);
		if(cacheData){
			console.log('using cached data');
			processImage(cacheData, urlData, res);
		}else{
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
					console.log('Image load in: ' + (Date.now() - startTime) + 'ms');
					if(respData){
						imageCache.addImage(urlData.query.path, respData);
					}
					processImage(respData, urlData, res);	

				});

			}).on('error', function(e) {
				console.log(e.message);
				res.writeHead(404, {'Content-Type': 'text/html'});
	           res.end(s404);
			});

			g.end();
		}
}

exports.handle = handle;
