import React from 'react';
import globalState from "../../global.state";
import { useHookstate } from '@hookstate/core';
import { IoMdFemale, IoMdMale } from "react-icons/io";


const Flag =({code})=> {
    return(
        <img style={{width: '25px', height: '25px'}}
            src={`http://purecatamphetamine.github.io/country-flag-icons/3x2/${code}.svg`}
        />
    );
}
const Likes =({count})=> {
    
    return(
        <div>
            { count }
        </div>
    );
}
const Sex =({type})=> {
    return(
        <React.Fragment>
            { type === 'm'
                ? <IoMdMale style={{color: 'blue'}} />
                : <IoMdFemale style={{color: 'red'}}/>
            }
        </React.Fragment>
    );
}


export default function() {
    const user = useHookstate(globalState.user);
    const ovnerState = useHookstate(globalState.ovner); 


    return(
        <div className='Indicator'>
            { ovnerState?.likes?.get() &&
                <Likes 
                    count={ovnerState.likes.get()} 
                />
            }
            { ovnerState?.info?.country?.get() &&
                <Flag 
                    code={ovnerState.info.country.get()} 
                />
            }
            { ovnerState?.sex?.get() &&
                <Sex 
                    type={ovnerState.sex.get()} 
                />
            }
        </div>
    );
}