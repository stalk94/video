import React from 'react';
import m from "../../img/loader/m.png";
import fem from "../../img/loader/fem.png";
import mi from "../../img/loader/m-i.png";
import femi from "../../img/loader/fem-i.png";




export default function({useInitSex}: {useInitSex: (type: 'm'|'fem')=> void}) {
    const [mSrc, setMsrc] = React.useState(m);
    const [femSrc, setFsrc] = React.useState(fem);



    return(
        <div className='SelectSexContainer'>
            <div className='TextSelectSex' style={{paddingLeft:'2%'}}>
                INTIMALIVE
            </div>
            <div className='SelectSex'>
                <img className='ImageSex'
                    style={{marginRight: '3%'}}
                    src={mSrc}
                    onMouseEnter={()=> setMsrc(mi)}
                    onMouseLeave={()=> setMsrc(m)}
                    onClick={()=> useInitSex('m')}
                />
                <div className='Border'/>
                <img className='ImageSex'
                    style={{marginLeft: '3%'}}
                    src={femSrc}
                    onMouseEnter={()=> setFsrc(femi)}
                    onMouseLeave={()=> setFsrc(fem)}
                    onClick={()=> useInitSex('fem')}
                />
            </div>
            <div className='TextSelectSex' style={{color: '#996666'}}>
                VIDEO CHAT
            </div>
        </div>
    );
}