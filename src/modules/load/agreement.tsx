import React from 'react';
import agreement from '../../lib/agreement';



export default function() {
    const useLocale =()=> {
        if(agreement[globalThis.lang]) return agreement[globalThis.lang];
        else return agreement.EN;
    }
    const formater =()=> {
        const text = useLocale();

        const headerRegex = /^[0-9.]+\s+[A-ZА-ЯЁÄÖÜßÉÈÊÇÀÂÔÎÛÁÍÓÚÑ\s]+$/gmu;    // Регулярное выражение для заголовков (цифры + заглавные буквы)
        const bulletRegex = /^•.*/gm;                                           // Регулярное выражение для пунктов (начинаются с `•`)
        const lines = text.split("\n").map(line => line.trim()).filter(line => line.length > 0);
    
        return lines.map((line, index)=> {
            if(headerRegex.test(line)) return(
                <h3 key={index} class="header">
                    { line }
                </h3>
            );
            else if(bulletRegex.test(line)) return(
                <p key={index} class="bullet">
                    { line }
                </p>
            );
            else return(
                <p key={index} class="text">
                    { line }
                </p>
            );
        });
    }


    return(
        <div>
            { formater() }
        </div>
    );
}