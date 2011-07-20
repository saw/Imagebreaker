var im = require('imagemagick'),
  http = require('http'),
   url = require('url'),
 cacheTimeout = 300000;

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
		}
	};
	
})();

function processImage(respData, urlData, res){
	var startTime = Date.now();
	if(!respData){
		res.writeHead(404, {'Content-Type': 'text/html'});
		console.log('no image');
        res.end('Sorry, you did something stupid I bet. No image here.');
		return;
	}
	
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
           res.end('Sorry, you did something stupid I bet. No image here.');
		}else{
            res.writeHead(200, {'Content-Type': 'image/jpeg'});
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
					imageCache.addImage(urlData.query.path, respData);
					processImage(respData, urlData, res);	

				});

			}).on('error', function(e) {
				console.log(e.message);
			});

			g.end();
		}
}

exports.handle = handle;
