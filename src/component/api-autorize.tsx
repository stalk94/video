import React from 'react';
import { Button } from 'primereact/button';



export default function() {
    const useGoogle =()=> {

    }


    return(
        <React.Fragment>
            <Button className='SocButton'
                icon='pi pi-google'
                label='Sign in Google'
                onClick={useGoogle}
            />
        </React.Fragment>
    );
}