import React from 'react';
import { getSizeElement } from "../../function";
let task;


export function Spiner({start, input}: {start:boolean, input:boolean}) {
    return(
        <React.Fragment>
            { (start && !input) &&
                <div className='Spiner'>
                    <i className="pi pi-spin pi-spinner" 
                        style={{
                            fontSize: '4vh',
                            color: 'white'
                        }}
                    >
                    </i>
                </div>
            }
        </React.Fragment>
    );
}


export default function BlurFrame({ start }: {start: boolean}) {
    React.useEffect(()=> {
        if(start) {
            const video: HTMLVideoElement = document.querySelector('#ovnerVideo');
            const size = getSizeElement();
            const canvas: HTMLCanvasElement = document.querySelector('.BlurCanvas');
            const ctx: CanvasRenderingContext2D = canvas.getContext('2d');

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
            }, 60);
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