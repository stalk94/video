import React from 'react';
import { Button } from 'primereact/button';
import { useTranslation } from 'react-i18next';


export default function({mod, useMod}: {mod: 'auth'|'reg', useMod: (type: 'auth'|'reg')=> void}) {
    const { t, i18n } = useTranslation();

    return(
        <div className='Toogler'>
            <Button className='TooglerButton'
                style={{
                    opacity: mod === 'auth' ? '0.4' : 1
                }}
                label={ t('togler_auth') }
                onClick={()=> useMod('auth')}
            />
            <Button className='TooglerButton'
                style={{
                    marginLeft: '0.4em',
                    opacity: mod === 'reg' ? '0.4' : 1
                }}
                label={ t('togler_reg') }
                onClick={()=> useMod('reg')}
            />
        </div>
    );
}