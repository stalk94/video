import React from 'react';
import { EVENT, send } from "../lib/engine";
import { Button } from 'primereact/button';
import { InputNumber } from 'primereact/inputnumber';
import { Slider, SliderChangeEvent } from 'primereact/slider';
import { FaPlay, FaAngleDoubleRight } from "react-icons/fa";
import { IoPause } from "react-icons/io5";
import { ImScissors } from "react-icons/im";
import { useDidMount, useIntervalWhen, useWillUnmount } from 'rooks';
import "./trimer-style.css";


const Uploader =()=> {
    return(
        <div className='UploaderEditor'>
            <i className="pi pi-spin pi-spinner" id='Spiner'/>
            <var className='UploaderText'>
                идет обработка
            </var>
        </div>
    );
}


export default function({ path, onComplete }: { path:string, onComplete:(newpath:string)=> void }) {
    const videoRef = React.useRef<HTMLVideoElement | null>(null);
    const [curPath, setCurPath] = React.useState(path);
    const [loaderView, setLoaderView] = React.useState(false);
    const [start, setStart] = React.useState(false);
    const [curent, setCurent] = React.useState<'end'|'start'>('start');
    const [startTime, setStartTime] = React.useState(0);      // Начало обрезки
    const [endTime, setEndTime] = React.useState(10);         // Конец обрезки
    const [duration, setDuration] = React.useState(0);        // Длительность видео
    const [currentTime, setCurrentTime] = React.useState(0);  // Текущее время видео

    const useSendtrim =()=> {
        setLoaderView(true);

        send('trimVideo', {
            path: 'src/' + curPath,
            startTime: startTime,
            duration: endTime - startTime
        }, 'POST').then((result)=> {
            if(result.src) {
                setCurPath(result.src.replace("src/", ""));
            }
            setLoaderView(false);
        });
    }
    const handleVideoTimeUpdate =()=> {
        const video = videoRef.current;
        if(video) {
            setCurrentTime(video.currentTime);
        }
    }
    const handleChange =(e: SliderChangeEvent)=> {
        setStartTime(e.value[0]);
        setEndTime(e.value[1]);
    }
    const useSetStartOrStop =(type: boolean)=> {
        if(videoRef.current) {
            const video = videoRef.current;
            if(curent==='start') video.currentTime = startTime;
            else if(curent==='end') video.currentTime = endTime;
           
            if(type) video.play();
            else video.pause();
            setStart(type);
        }
    }

    React.useEffect(()=> {
        if(videoRef.current && curent==='start' && !start) {
            videoRef.current.currentTime = startTime;
        }
    }, [startTime]);
    React.useEffect(()=> {
        if(videoRef.current && curent==='end' && !start) {
            videoRef.current.currentTime = endTime;
        }
    }, [endTime]);
    React.useEffect(()=> {
        const video = videoRef.current;

        if(video) {
            video.onloadedmetadata =()=> {
                setStart(false);
                setStartTime(0);
                setDuration(video.duration);
                setEndTime(video.duration);
            }
        }
    }, [curPath]);
    useIntervalWhen(()=> {
        if(curent==='start') setStartTime(currentTime);
        else if(curent==='end') setEndTime(currentTime);
    }, 50, start);
    useWillUnmount(()=> {
        send('clearTemp', {}, 'POST');
    });


    return(
        <div className='VideoTrimer'>
            { loaderView && <Uploader />}
            <video className='VideoPreviewTrim'
                ref={videoRef}
                src={ gurl + curPath }
                onTimeUpdate={handleVideoTimeUpdate}
                onLoadedMetadata={handleVideoTimeUpdate}
            />
            <div className='VideoPreviewToolsPanel'>
                <div className='ToolsPanelBase'>
                    <Button className='ButtonPlay ButtonTrim'
                        icon={<ImScissors />}
                        disabled={startTime===0 && endTime===duration}
                        onClick={useSendtrim}
                    />
                    <Button className='ButtonPlay'
                        icon={ start ?  <IoPause style={{fontSize:'1.5rem'}} /> : <FaPlay />}
                        onClick={()=> useSetStartOrStop(!start)}
                    />
                    <InputNumber style={{marginRight:'0.7rem'}}
                        showButtons
                        size={3}
                        value={startTime}
                        onValueChange={(e)=> setStartTime(e.value)}
                        min={0}
                        max={endTime - 1}
                        step={0.1}
                    />
                    <InputNumber 
                        showButtons
                        size={3}
                        value={endTime}
                        onValueChange={(e)=> setEndTime(e.value)}
                        min={0}
                        max={duration}
                        step={0.1}
                    />
                </div>
                <Slider className='VideoPreviewSlider'
                    value={[startTime, endTime]}
                    onChange={handleChange}
                    range
                    min={0}
                    max={duration}
                    step={0.05}
                    onMouseDown={(e)=> {
                        if(e.target.classList.contains('p-slider-handle-end')) {
                            if(curent!=='end') videoRef.current.currentTime = endTime;
                            setCurent('end');
                        }
                        else if(e.target.classList.contains('p-slider-handle-start')) {
                            if(curent!=='start') videoRef.current.currentTime = startTime;
                            setCurent('start');
                        }
                    }}
                    onSlideEnd={(e)=> {
                        if(e.originalEvent.target.classList.contains('p-slider-handle-end')){
                            videoRef.current.currentTime = endTime;
                        }
                    }}
                />
                <Button className='p-button-outlined p-button-success SuccesSaveButton'
                    icon='pi pi-save'
                    label='Сохранить'
                    disabled={curPath === path}
                    onClick={()=> curPath!==path && onComplete(curPath)}
                />
            </div>
        </div>
    );
}