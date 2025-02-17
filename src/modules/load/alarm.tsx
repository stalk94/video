import React from 'react';
import agreement from '../../lib/agreement';
import { useTranslation } from 'react-i18next';



export default function({ useInitALarm, value }) {
    const { t, i18n } = useTranslation();

    const useLocale =()=> {
        if(agreement[globalThis.lang]) return agreement[globalThis.lang];
        else return agreement.EN;
    }
    const formater =()=> {
        const text = useLocale();
    
        const headerRegex = /^[0-9.]+\s+[A-ZА-ЯЁÄÖÜßÉÈÊÇÀÂÔÎÛÁÍÓÚÑ\s]+$/; // Регулярное выражение для заголовков (цифры + заглавные буквы)
        const bulletRegex = /^•.*/; // Регулярное выражение для пунктов (начинаются с `•`)
        const lines = text.split("\n").map(line => line.trim()).filter(line => line.length > 0);
        
        return lines.map((line, index) => {
            if(index === 0) return (
                <h3 key={index}>
                    {line}
                </h3>
            );
            else if(headerRegex.test(line)) {
                return (
                    <h4 key={index}>
                        {line}
                    </h4>
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
        <div className='AlarmContainer'>
            <div className='LabelAlarm'>
                ALARM +18
            </div>
            <div className='AlarmCard'>
                { formater() }
            </div>
            <div className='AlarmRadio'>
                <input type="checkbox" 
                    className='AlarmCheckbox'
                    onChange={(e)=> useInitALarm()} 
                    checked={value}
                />
                <div className='AlarmCheckboxLabel'>
                    { t('alarm_confirm') }
                </div>
            </div>
        </div>
    );
}