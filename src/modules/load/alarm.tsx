import React from 'react';
import { useTranslation } from 'react-i18next';



export default function({ useInitALarm, value }) {
    const { t, i18n } = useTranslation();

    return(
        <div className='AlarmContainer'>
            <div className='LabelAlarm'>
                ALARM +18
            </div>
            <div className='AlarmCard'>
                { t('alarm') }
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