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


export default function() {
    const canvasPreviewRef = React.useRef<HTMLCanvasElement>(null);

    // смена настроек ввода
    const handlerSwitchMediaStream =(cfg: { reason: ()=> void, reject: ()=> void })=> {
        navigator.mediaDevices.getUserMedia(globalThis.creditionals)
            .then((newStream)=> {
                if(cfg && cfg.reason) cfg.reason();
                if(globalThis.mediaStream) {
                    globalThis.mediaStream.getTracks().forEach((track)=> track.stop());
                }
                
                globalThis.mediaStream = canvas.captureStream(30);
                myVideo.srcObject = newStream;
                myVideo.play();
            })
            .catch((res) => {
                errorMedia(res);
                if(cfg && cfg.reject) cfg.reject();

                if(globalThis.mediaStream) {
                    globalThis.mediaStream.getTracks().forEach((track)=> track.stop());
                }
                globalThis.mediaStream = undefined;
                myVideo.srcObject = null;
            });
    }
    // создает медиа стрим, если ранее не создан
    const createMyMediaStream =()=> {
        if(!globalThis.mediaStream) navigator.mediaDevices.getUserMedia(globalThis.creditionals)
            .then((newMediaStream)=> {
                globalThis.mediaStream = canvas.captureStream(30);

                myVideo.srcObject = newMediaStream;
                myVideo.play();
            })
            .catch((err)=> {
                errorMedia(err);

                if(globalThis.mediaStream) {
                    globalThis.mediaStream.getTracks().forEach((track)=> track.stop());
                }
                globalThis.mediaStream = undefined;
                myVideo.srcObject = null;
            });
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
        if(myVideo && !myVideo.paused && !myVideo.ended) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(myVideo, 0, 0, canvas.width, canvas.height);

            processing();                       //! состояние гонки возможно
            canvasPreviewRef.current.getContext('2d')
                .drawImage(canvas);
            
            requestAnimationFrame(drawFrame);
        }
    }

    React.useEffect(()=> {
        const handlerPlay =()=> {
            canvas.width = myVideo.videoWidth;
            canvas.height = myVideo.videoHeight;
            drawFrame();
        }

        EVENT.on('switchMediaStream', handlerSwitchMediaStream);
        EVENT.on('startStream', createMyMediaStream);
        myVideo.addEventListener('play', handlerPlay);
        
        return ()=> {
            EVENT.off('switchMediaStream', handlerSwitchMediaStream);
            EVENT.off('startStream', createMyMediaStream);
            myVideo.removeEventListener('play', handlerPlay);
        }
    }, []);


    return(
        <React.Fragment>
            <canvas id='myVideo'
                ref={canvasPreviewRef} 
                width={'100%'}
                height={'100%'}
            />
        </React.Fragment>
    );
}