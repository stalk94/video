import React from 'react';
const countryCodes = {
    "Russia": "RU",
    "Germany": "DE",
    "United States": "US",
    "France": "FR",
    "Italy": "IT",
    "Spain": "ES",
    "United Kingdom": "GB",
    "China": "CN",
    "Japan": "JP",
    "Canada": "CA",
    "Australia": "AU",
    "Brazil": "BR",
    "India": "IN",
    "Mexico": "MX",
    "Ukraine": "UA",
    "Belarus": "BY",
    "Kazakhstan": "KZ",
    "Turkey": "TR",
    "Sweden": "SE",
    "Netherlands": "NL",
    "Switzerland": "CH",
    "South Korea": "KR",
    "Albania": "AL",
    "Andorra": "AD",
    "Armenia": "AM",
    "Austria": "AT",
    "Azerbaijan": "AZ",
    "Belgium": "BE",
    "Bosnia and Herzegovina": "BA",
    "Bulgaria": "BG",
    "Croatia": "HR",
    "Cyprus": "CY",
    "Czech Republic": "CZ",
    "Denmark": "DK",
    "Estonia": "EE",
    "Finland": "FI",
    "Georgia": "GE",
    "Greece": "GR",
    "Hungary": "HU",
    "Iceland": "IS",
    "Ireland": "IE",
    "Kosovo": "XK",
    "Latvia": "LV",
    "Liechtenstein": "LI",
    "Lithuania": "LT",
    "Luxembourg": "LU",
    "Malta": "MT",
    "Moldova": "MD",
    "Monaco": "MC",
    "Montenegro": "ME",
    "North Macedonia": "MK",
    "Norway": "NO",
    "Poland": "PL",
    "Portugal": "PT",
    "Romania": "RO",
    "San Marino": "SM",
    "Serbia": "RS",
    "Slovakia": "SK",
    "Slovenia": "SI",
    "Vatican City": "VA"
}



export default ({ code, size, margin }: {margin?:string, code:string, size?: {width:number, height:number}})=> {
    const chek =(code: string)=> {
        if(countryCodes[code]) return countryCodes[code];
        else return code;
    }

    return(
        <img style={{
            width: size?.width ?? "25px",
            height: size?.height ?? "25px",
            marginTop: margin ?? '4px'
        }}
            src={`img/flags/${chek(code)}.svg`}
            onError={(e)=> e.target.src = 'img/not-flag.png'}
        />
    );
}