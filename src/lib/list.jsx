import React from 'react';
import { createRoot } from 'react-dom/client'
import "primereact/resources/themes/lara-dark-blue/theme.css";
import "primereact/resources/primereact.min.css";
import { DataList } from './dataList';




function App({listData}) {
    const [data, setData] = React.useState(listData);
    const [selected, setSelected] = React.useState([]);

    const useSelected =(elem)=> {
        setSelected((arr)=> {
            arr.push(Object.assign({}, elem));
            return arr;
        });
        setData((arr)=> arr.filter((value)=> value.name!==elem.name));
    }
    const useUnSelected =(elem)=> {
        setData((arr)=> {
            arr.push(Object.assign({}, elem));
            return arr;
        });
        setSelected((arr)=> arr.filter((value)=> value.name!==elem.name));
    }
   

    return(
        <>
            <DataList data={data} useClick={useSelected} unSelected={useUnSelected}/>
            <DataList data={data} useClick={useSelected} unSelected={useUnSelected}/>
            <DataList data={data} useClick={useSelected} unSelected={useUnSelected}/>
        </>
    )
}




window.onload =()=> createRoot(document.querySelector(".root")).render(
    <App 
        listData={[
            {name: 'первый'},
            {name: 'второй'},
            {name: 'третий'},
            {name: 'четвертый'},
            {name: 'пятый'}
        ]}
    />
);