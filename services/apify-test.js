const axios = require('axios');
const myHeaders = new Headers();
myHeaders.append("Content-Type", "application/json");
myHeaders.append("Accept", "application/json");
const token = 'apify_api_0RhfGbocF0TfaI28n24bvQeGHarKV722Hh7m';

const requestOptions = {
    method: "POST",
    headers: myHeaders,
    body: JSON.stringify({
        url: "https://www.tiktok.com/@yxuliant8/video/7230418312637779227"
    }),
    responseType: 'json'    
};



//`https://stalk9424--tik-tok-video-scraper.apify.actor/?token=${token}&url=https://vm.tiktok.com/ZMkC5Gwp8/`
fetch(`https://api.apify.com/v2/acts/0JIAS6p2aE4luYTnx/run-sync-get-dataset-items?token=${token}`, requestOptions)
    .then((response)=> response.json())
    .then((result)=> console.log(result))
