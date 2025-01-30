import React from 'react';



export const Row =({ label, value }: {label:string, value:any})=> {
    return(
        <div className='IoRow' style={{ marginBottom: '0.5rem' }}>
            <div className="RowLabel" style={{ color: 'gray' }}>
                { label }:
            </div>
            <div style={{ marginLeft: '0.5rem', color:'white'}}>
                { value }
            </div>
        </div>
    );
}