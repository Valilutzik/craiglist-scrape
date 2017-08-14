var request = require('request')
var cheerio = require('cheerio')

function getListings(nDesired, cb){
    
            var listings = []
            const baseUrl = 'https://losangeles.craigslist.org/search/apa'

            var numberOfPages = Math.floor(nDesired/120);
            const tracker_ = numberOfPages;

            var getData = function(nDesired, cb){
                
                var queryUrl = (tracker_ - numberOfPages > 0) ? baseUrl + '?s=' + (tracker_ - numberOfPages) * 120 : baseUrl; 
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

                                if (nDesired>0) {
                                    numberOfPages-=1;
                                    getData(nDesired, cb);
                                } else {
                                    return cb(null, listings);
                                }       
                        
                        } else {
                            return cb(err, null);
                        }
                });
            };

        return getData(nDesired, cb);        
};                

module.exports = function(nDesired, cb){
        getListings(nDesired,cb);
};