const tik = require('rahad-media-downloader');


exports.downloadVideo = async(url)=> {
    try {
        const result = await tik.rahadtikdl(url);
        return result.data;
    } 
    catch(error) {
        return error;
    }
}

exports.downloadVideo("https://vm.tiktok.com/ZMkC5Gwp8/").then(console.log)
