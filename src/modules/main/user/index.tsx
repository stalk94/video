import React from 'react';
import Action from './action';
import User from './user';


export default function({ type }: {type: 'ls'|'user'}) { 


    return(
        <React.Fragment>
            { type === 'ls' && <Action />}
            { type === 'user' && <User />}
        </React.Fragment>
    );
}