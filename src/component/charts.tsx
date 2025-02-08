import React from 'react';
import { Tooltip } from 'primereact/tooltip';



export const ProgressBar = ({ progress, color = "blue", text = "" }) => {
    return (
        <div className="progress-bar">
            <div
                className="progress-fill"
                style={{
                    width: `${progress}%`,
                    backgroundColor: color,
                }}
            />
            <div className="progress-text">{text}</div>
        </div>
    );
}
// todo: Надо его выделить в независимый
export const Histogram = ({ data, maxValue }: {data:{value:number,color:string,icon:any}[],maxValue:number}) => {
    return (
        <div className="histogram">
            <Tooltip target=".bar-container" mouseTrack mouseTrackLeft={10} />
            { data.map((item, index)=> (
                <div key={index} 
                    className="bar-container" 
                    data-pr-tooltip={ item.label } 
                    data-pr-position="top"
                >
                    <div className="bar" style={{
                        height: `${(item.value / maxValue) * 100}%`,
                        backgroundColor: item.color,
                    }}>
                        <span className="bar-value">
                            { item.icon }
                            { " " + item.value }
                        </span>
                    </div>
                </div>
            ))}
        </div>
    );
};