const ffmpeg = require('fluent-ffmpeg');



/**
 * 
 * @param {string} videoPath 
 * @returns {Promise<ffmpeg.FfprobeFormat>}
 */
async function getMeta(videoPath) {
    return await new Promise((resolve, reject)=> {
        ffmpeg.ffprobe(videoPath, (err, metadata)=> {
            if(err) {
                console.error('Ошибка при анализе видео:', err);
                reject();
            }
            else {
                const duration = metadata.format.duration;
                resolve(metadata.format);
            }
        });
    });
}
/**
 * Обрезчик видео
 * @param {string} path путь к видео
 * @param {number} startTime в секундах время начала
 * @param {number} duration в секундах длительность
 * @param {string} otput куда сохранять, если нет то в path
 * @returns {Promise<string>}
 */
async function trimVideo(path, startTime, duration, otput) {
    const metaFormatData = await getMeta(path);

    return await new Promise((resolve, reject)=> {
        if(!metaFormatData) reject(new Error('video not meta data'));
        else ffmpeg(path)
            .setStartTime(startTime)
            .duration(duration)
            .output(otput ?? path)
            .on('end', ()=> {
                console.log('Обрезка завершена.');
                resolve(otput ?? path);
            })
            .on('error', (err)=> {
                console.error('Ошибка при обрезке видео:', err);
                reject(err);
            })
            .run();
    });
}


module.exports = {
    trimVideo: trimVideo
}