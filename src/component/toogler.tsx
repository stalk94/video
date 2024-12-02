import React from 'react';
import { Button } from 'primereact/button';



export default function({mod, useMod}: {mod: 'auth'|'reg', useMod: (type: 'auth'|'reg')=> void}) {
    return(
        <div className='Toogler'>
            <Button className='TooglerButton'
                style={{
                    opacity: mod === 'auth' ? '0.4' : 1
                }}
                label='ВХОД'
                onClick={()=> useMod('auth')}
            />
            <Button className='TooglerButton'
                style={{
                    marginLeft: '20px',
                    opacity: mod === 'reg' ? '0.4' : 1
                }}
                label='РЕГИСТРАЦИЯ'
                onClick={()=> useMod('reg')}
            />
        </div>
    );
}