import React from 'react';
import { EVENT } from '../../lib/engine';
import { Results, FaceMesh, 
    FACEMESH_LEFT_EYE, FACEMESH_RIGHT_EYE, FACEMESH_LEFT_EYEBROW, 
    FACEMESH_LIPS, FACEMESH_LEFT_IRIS, FACEMESH_RIGHT_IRIS, FACEMESH_RIGHT_EYEBROW, 
    FACEMESH_FACE_OVAL, FACE_GEOMETRY, FACEMESH_TESSELATION, FACEMESH_CONTOURS, 
    LandmarkConnectionArray, NormalizedLandmarkList, NormalizedLandmark
} from "@mediapipe/face_mesh";
import { errorMedia, getCoordinates } from "../../function";

//////////////////////////////////////////////////////////
let animFrame;
const myVideo = document.createElement('video');
const canvas = document.createElement('canvas');
const ctx = canvas.getContext('2d');
const tempCanvas = document.createElement('canvas');
const tempCtx = tempCanvas.getContext('2d');
const faceMesh = new FaceMesh({locateFile: (file)=> {
    return `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`;
}});
faceMesh.setOptions({
    maxNumFaces: 1,
    refineLandmarks: true,
    minDetectionConfidence: 0.5,
    minTrackingConfidence: 0.5
});
//////////////////////////////////////////////////////////


export default function({ setStart }) {
    const [mask, setMask] = React.useState(true);
    const videoPreviewRef = React.useRef<HTMLVideoElement>(null);

    const handlerSwitchRender =(type: boolean)=> {
        cancelAnimationFrame(animFrame);
        setMask(type);

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
                if(globalThis.mediaStream) {
                    globalThis.mediaStream.getTracks().forEach((track)=> track.stop());
                }
                
                globalThis.mediaStream = mask ? canvas.captureStream(60) : newMediaStream;
                myVideo.srcObject = newMediaStream;
                myVideo.muted = true;
                myVideo.play();
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
                }

                myVideo.muted = true;
                myVideo.play();
            })
            .catch((err)=> {
                errorMedia(err);
                setStart(false);
            });
        else call(globalThis.mediaStream);
    }
    // блюрим лиццо
    const processing = async()=> {
        await faceMesh.send({image: myVideo});

        faceMesh.onResults((results: Results)=> {
            if(results.multiFaceLandmarks?.[0]) {
                tempCanvas.width = canvas.width;
                tempCanvas.height = canvas.height;
                tempCtx.clearRect(0, 0, canvas.width, canvas.height);

                for(const landmarks of results.multiFaceLandmarks) {
                    const coord = getCoordinates(landmarks, FACEMESH_FACE_OVAL);
                    
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
        });
    }
    const drawFrame =()=> {
        console.log(mask)
        if(mask) {
            if(myVideo && !myVideo.paused && !myVideo.ended) {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                ctx.drawImage(myVideo, 0, 0, canvas.width, canvas.height);

                processing().then(()=> 
                    animFrame = requestAnimationFrame(drawFrame)
                );            
            }
        }
    }

    React.useEffect(()=> {
        const handlerPlay =()=> {
            canvas.width = 500;
            canvas.height = 500;
            drawFrame();
        }

        EVENT.on('switchMediaStream', handlerSwitchMediaStream);
        EVENT.on('startStream', createMyMediaStream);
        myVideo.addEventListener('play', handlerPlay);
        
        return ()=> {
            console.log('remove')
            EVENT.off('switchMediaStream', handlerSwitchMediaStream);
            EVENT.off('startStream', createMyMediaStream);
            myVideo.removeEventListener('play', handlerPlay);
        }
    }, [mask]);
    

    return(
        <video ref={videoPreviewRef} 
            id='myVideo'
            playsInline
            controls={false}
            width={'100%'}
            height={'100%'}
            autoPlay={true}
            onClick={()=> handlerSwitchRender(!mask)}
        />
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