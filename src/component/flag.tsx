import React from 'react';


export default ({ code, size }: { code: string, size?: {width:number, height:number} }) => (
    <img style={{
        width: size?.width ?? "25px",
        height: size?.height ?? "25px",
        marginTop: '4px'
    }}
        src={`http://purecatamphetamine.github.io/country-flag-icons/3x2/${code}.svg`}
    />
);