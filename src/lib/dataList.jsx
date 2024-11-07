import React from 'react';
import { useDidMount } from "rooks";



const Li =({elem, useClick, disable})=> {
    const [style, setStyle] = React.useState({
        cursor: 'pointer',
        padding: '7px'
    });
    useDidMount(()=> {
        if(disable) setStyle({...style, color:'grey'});
    });
    

    return(
        <li
            style={style}
            onClick={()=> useClick(elem)}
        >
            { elem.name }
        </li>
    )
}



export function DataList({data, useClick, unSelected}) {
    const [selected, setSelected] = React.useState([]);
    const useSetSelected =(elem)=> {
        if(selected.length === 0){
            useClick(elem);
            setSelected((arr)=> {
                arr.push(Object.assign({}, elem));
                return arr;
            });
        }
    }
    const useRemove =(elem)=> {
        unSelected(elem);
        setSelected((arr)=> arr.filter((val)=> val.name!==elem.name));
    }

    return(
        <ul 
            style={{
                backgroundColor: 'white',
                color: 'black',
                border: '1px solid black',
                borderRadius: '10px',
            }}
        >
            {selected.map((elem, index)=> 
                <Li
                    key={index} 
                    elem={elem} 
                    useClick={useRemove}
                    disable={true}
                />
            )}
            {data.map((elem, index)=> 
                <Li 
                    key={index} 
                    elem={elem} 
                    useClick={useSetSelected}
                    disable={false}
                />
            )}
        </ul>
    )
}