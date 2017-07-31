var request = require('request')
var cheerio = require('cheerio')

var domain = 'https://losangeles.craigslist.org'
var baseUrl = domain + '/search/apa'

function getData(nDesired, cb){

    var numberOfPages = Math.ceil(nDesired/120);    
    var listings = []
                        
    for (var i=0; i<numberOfPages; i++){ 
        
           var queryUrl = (i>0) ? baseUrl + '?s=' + i*120 : baseUrl; //case of i>0 to conform to replay
           
           var options = {
                url: queryUrl,
                headers: {
                    'User-Agent': 'Node.js Request/Bot'
                }
            }; 
           
           request(options, nDesired, function(err, res, html)
                {
                    if (!err && res.statusCode==200) {

                        var $ = cheerio.load(html);
    
                        $('.result-info').slice(0, nDesired).each(function() { 
                            
                            var time = $(this).children('time').attr('datetime'); 
                            var title = $(this).children('a').text(); 
                            var url = $(this).children('.result-title.hdrlnk').attr('href'); 
                            var price = $(this).children('span[class="result-meta"]').children('span[class="result-price"]').text();
                            var neighborhood = $(this).children('span[class="result-meta"]').children('span[class="result-hood"]').text().replace(/\(|\)/g,'').trim();
                            var bedrooms = $(this).children('span[class="result-meta"]').children('span[class="housing"]').text().replace(/\d+ft2/g,'').replace(/-/g,'').trim();
                            var size = $(this).children('span[class="result-meta"]').children('span[class="housing"]').text().replace(/\d+br/g,'').replace(/-/g,'').trim();
                            
                            var scrapedData = {
                                title:title,
                                url:baseUrl+url,
                                time:time,
                                price:price,
                                bedrooms:bedrooms,
                                size:size,
                                neighborhood:neighborhood,
                            };
                            
                            listings.push(scrapedData);    
                            nDesired -= 1;
                        });
                        
                        if (nDesired==0){
                            cb(null, listings);
                        }
                    }
                    else {
                        cb(err, null)
                    }
                });
        };
};

module.exports = function(nDesired, cb){
        getData(nDesired, cb);
};