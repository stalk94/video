//import "primereact/resources/themes/lara-dark-blue/theme.css";
//import "primereact/resources/primereact.min.css";
import React from 'react';
import { TabMenu } from 'primereact/tabmenu';
import Base from "./base";
import Events from "./events";
import Bots from "./bots";
import Users from "./users";
import "./style.css";


const items = [
    {label: 'Базовое', icon: 'pi pi-fw pi-home'},
    {label: 'События', icon: 'pi pi-fw pi-calendar'},
    {label: 'Боты', icon: 'pi pi-fw pi-sitemap'},
    {label: 'Юзеры', icon: 'pi pi-fw pi-users'}
];
const components = [
    <Base />,
    <Events />,
    <Bots />,
    <Users />
];


export default function() {
    const [activeIndex, setActiveIndex] = React.useState(2);
    

    return(
        <div className='Admin'>
            <TabMenu className="TabMenu"
                model={items} 
                activeIndex={activeIndex} 
                onTabChange={(e)=> setActiveIndex(e.index)}
            />
            { components[activeIndex] && 
                components[activeIndex]
            }
        </div>
    );
}