import React from 'react';
import { Button } from 'primereact/button';
import { EVENT } from '../../lib/engine';
import { Results, FaceMesh, 
    FACEMESH_LEFT_EYE, FACEMESH_RIGHT_EYE, FACEMESH_LEFT_EYEBROW, 
    FACEMESH_LIPS, FACEMESH_LEFT_IRIS, FACEMESH_RIGHT_IRIS, FACEMESH_RIGHT_EYEBROW, 
    FACEMESH_FACE_OVAL, FACE_GEOMETRY, FACEMESH_TESSELATION, FACEMESH_CONTOURS, 
    LandmarkConnectionArray, NormalizedLandmarkList, NormalizedLandmark
} from "@mediapipe/face_mesh";
import { errorMedia, getCoordinates } from "../../function";



//////////////////////////////////////////////////////////
const myVideo = document.createElement('video');
const canvas = document.createElement('canvas');
//canvas.width = 500; canvas.height = 500;
const ctx = canvas.getContext('2d');
const tempCanvas = document.createElement('canvas');
const tempCtx = tempCanvas.getContext('2d');
let faceMesh, mask;
let isRunning = false;
//////////////////////////////////////////////////////////


export default function({ setStart }) {
    const [mod, setMod] = React.useState<0|1|2>(0);
    const videoPreviewRef = React.useRef<HTMLVideoElement>(null);

    const stopFaceMesh = async()=> {
        if(faceMesh) {
            await faceMesh.close();
            faceMesh = null;
        }
        isRunning = false;
    }
    const handlerSwitchRender = async(type: boolean)=> {
        if(!type) {
            await stopFaceMesh();
            setMod(2);
        }
        mask = type;

        handlerSwitchMediaStream({
            reason: ()=> console.log('sucess toogle preview'), 
            reject: ()=> console.error('error toogle preview') 
        });
    }
    // смена настроек ввода
    const handlerSwitchMediaStream =(cfg: { reason: ()=> void, reject: ()=> void })=> {
        navigator.mediaDevices.getUserMedia(globalThis.creditionals)
            .then((newMediaStream)=> {
                if(cfg && cfg.reason) cfg.reason();

                // только если запушено
                if(globalThis.mediaStream) {
                    globalThis.mediaStream.getTracks().forEach((track)=> track.stop());
                    globalThis.mediaStream = mask ? canvas.captureStream(60) : newMediaStream;
                    myVideo.srcObject = newMediaStream;

                    myVideo.onloadeddata =()=> {
                        canvas.width = myVideo.videoWidth;
                        canvas.height = myVideo.videoHeight;
                        tempCanvas.width = canvas.width;
                        tempCanvas.height = canvas.height;

                        videoPreviewRef.current.srcObject = globalThis.mediaStream;
                        videoPreviewRef.current.volume = 0;
                        myVideo.volume = 0;
                    }

                    myVideo.play();
                }
            })
            .catch((res) => {
                errorMedia(res);
                if(cfg && cfg.reject) cfg.reject();
                setStart(false);
            });
    }
    // создает медиа стрим, если ранее не создан
    const createMyMediaStream =(call)=> {
        if(!globalThis.mediaStream) navigator.mediaDevices.getUserMedia(globalThis.creditionals)
            .then((newMediaStream)=> {
                globalThis.mediaStream = mask ? canvas.captureStream(60) : newMediaStream;
                call(globalThis.mediaStream);

                myVideo.srcObject = newMediaStream;

                myVideo.onloadeddata =()=> {
                    canvas.width = myVideo.videoWidth;
                    canvas.height = myVideo.videoHeight;
                    tempCanvas.width = canvas.width;
                    tempCanvas.height = canvas.height;

                    videoPreviewRef.current.srcObject = globalThis.mediaStream;
                    videoPreviewRef.current.volume = 0;
                    myVideo.volume = 0;
                }

                myVideo.play();
            })
            .catch((err)=> {
                errorMedia(err);
                setStart(false);
            });
        else call(globalThis.mediaStream);
    }
    const processing =(results: Results)=> {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(myVideo, 0, 0, canvas.width, canvas.height);

        if(results.multiFaceLandmarks?.[0]) {
            tempCanvas.width = canvas.width;
            tempCanvas.height = canvas.height;
            tempCtx.clearRect(0, 0, canvas.width, canvas.height);

            for(const landmarks of results.multiFaceLandmarks) {
                const coord = getCoordinates(landmarks, window.FACEMESH_FACE_OVAL);

                for(const point of coord) {
                    tempCtx.lineTo(point.x * tempCanvas.width, point.y * tempCanvas.height);
                }

                tempCtx.closePath();
                tempCtx.filter = "blur(8px)";
                tempCtx.clip();
                tempCtx.drawImage(canvas, 0, 0, tempCanvas.width, tempCanvas.height);

                ctx.drawImage(tempCanvas, 0, 0);
            }
        }
    }
    async function processVideo(videoElement) {
        if(!faceMesh || !isRunning || !mask) return;
      
        await faceMesh.send({ image: videoElement });
        if(isRunning) {
            requestAnimationFrame(()=> processVideo(videoElement));
        }
     }
    const handlerPlay = async()=> {
        if(faceMesh || isRunning || !mask) {
            if(!mask) setMod(2);
            return;         // Если уже запущено — ничего не делаем
        }
        isRunning = true;

        faceMesh = new window.FaceMesh({
            locateFile: (file)=> `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`,
        });

        faceMesh.setOptions({
            maxNumFaces: 1,
            refineLandmarks: true,
            minDetectionConfidence: 0.5,
            minTrackingConfidence: 0.5,
        });

        faceMesh.onResults((results) => {
            processing(results);
        });

        await faceMesh.initialize();
        processVideo(myVideo);
        setMod(1);
    }

    React.useEffect(()=> {
        EVENT.on('switchMediaStream', handlerSwitchMediaStream);
        EVENT.on('startStream', createMyMediaStream);
        myVideo.addEventListener('play', handlerPlay);
        
        
        return ()=> {
            EVENT.off('switchMediaStream', handlerSwitchMediaStream);
            EVENT.off('startStream', createMyMediaStream);
            myVideo.removeEventListener('play', handlerPlay);

            stopFaceMesh();
            mask = undefined;
            if(globalThis.mediaStream) {
                globalThis.mediaStream.getTracks().forEach((track)=> track.stop());
                delete globalThis.mediaStream;
            }
        }
    }, []);
    

    return(
        <React.Fragment>
            <Button className={`p-button-rounded p-button-text ${mod===2 && 'p-button-secondary'} ${mod===1 && 'p-button-success'}`}
                icon={`pi ${mod===0 && 'pi-times'} ${mod===2 && 'pi-eye'} ${mod===1 && 'pi-eye-slash'}`}
                style={{position:'absolute', zIndex:'6'}}
                disabled={mod===0 ? true : false}
                onClick={()=> handlerSwitchRender(mask ? false : true)}
            />
            <video ref={videoPreviewRef} 
                id='myVideo'
                playsInline
                controls={false}
                width={'100%'}
                height={'100%'}
                autoPlay={true}
            />
        </React.Fragment>
    );
}


/**
 * { mask 
                ? <canvas id='myVideoCanvas'
                    ref={canvasPreviewRef} 
                />
                : <video ref={videoPreviewRef} id='myVideo'
                    playsInline
                    controls={false}
                    width={'100%'}
                    height={'100%'}
                    autoPlay={true}
                />
            }
 */