import React from 'react';
import { getSizeElement } from "../../function";
let task;



export default function BlurFrame({start}: {start: boolean}) {
    React.useEffect(()=> {
        if(start) {
            const video: HTMLVideoElement = document.querySelector('#ovnerVideo');
            const size = getSizeElement();
            const canvas: HTMLCanvasElement = document.querySelector('.BlurCanvas');
            const ctx: CanvasRenderingContext2D = canvas.getContext('2d');;

            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;

            canvas.width = size.width;
            canvas.height = size.height;
            ctx.drawImage(video, 0, 0, size.width, size.height);

            if(task) {
                clearInterval(task);
                task = undefined;
            }

            task = setInterval(() => {
                ctx.drawImage(video, 0, 0, size.width, size.height);
            }, 100);
        }
    });


    return(
        <React.Fragment>
            { start &&
                <canvas className='BlurCanvas'
                    style={{ filter: 'blur(20px)'}}
                >
    
                </canvas>
            }
        </React.Fragment>
    );
}