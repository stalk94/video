import React from 'react';
import agreement from '../../lib/agreement';
import { useNavigate } from "react-router-dom";


export default function() {
    const navigate = useNavigate();

    const useLocale =()=> {
        if(agreement[globalThis.lang]) return agreement[globalThis.lang];
        else return agreement.EN;
    }
    const formater = () => {
        const text = useLocale();
    
        const headerRegex = /^[0-9.]+\s+[A-ZА-ЯЁÄÖÜßÉÈÊÇÀÂÔÎÛÁÍÓÚÑ\s]+$/; // Регулярное выражение для заголовков (цифры + заглавные буквы)
        const bulletRegex = /^•.*/; // Регулярное выражение для пунктов (начинаются с `•`)
        const lines = text.split("\n").map(line => line.trim()).filter(line => line.length > 0);
        
        return lines.map((line, index) => {
            if(index === 0) return (
                <h2 key={index}>
                    {line}
                </h2>
            );
            else if(headerRegex.test(line)) {
                return (
                    <h3 key={index}>
                        {line}
                    </h3>
                );
            } 
            else if(bulletRegex.test(line)) {
                return (
                    <p key={index} style={{ margin: '0px', marginLeft:'1em', fontStyle:'italic' }}>
                        {line}
                    </p>
                );
            } 
            else {
                return (
                    <p key={index}>
                        {line}
                    </p>
                );
            }
        });
    }


    return(
        <div className='Agreement'>
            <div style={{borderBottom:'1px dotted black', paddingBottom:'5px'}}>
                <button onClick={()=> navigate('/')}>
                    ← К приложению
                </button>
            </div>
            { formater() }
        </div>
    );
}