import React from 'react';
import { convertTime } from "../../function";
import { send } from "../../lib/engine";
import { TabMenu } from 'primereact/tabmenu';
import Flag from "../../component/flag";
import { ProgressBar } from 'primereact/progressbar';
import { IoEarthOutline } from "react-icons/io5";
import { MdOutlineDevicesOther } from "react-icons/md";
import { DopViewContext } from "./type";
import { FaSitemap } from "react-icons/fa6";
import { Histogram } from "../../component/charts";
import { UsersBaseStatistic, EventsStatistic, TraffikStatic, UniqueUsers, PayOrPurchaseStatistic } from './type';
import { FaSignOutAlt, FaSignInAlt, FaUserPlus, FaCreditCard, FaSearch, FaCheckCircle, FaTimesCircle, FaCommentAlt, FaThumbsUp, FaGift } from 'react-icons/fa';
import { FaMoneyBillTrendUp } from "react-icons/fa6";
import { GiPayMoney } from "react-icons/gi";
import "./style.base.css";


const TimeNavigation =({ onChange })=> {
    const [activeIndex, setActiveIndex] = React.useState(0);

    const items = [
        {label: 'Сегодня', icon: 'pi pi-fw pi-calendar', value: 1},
        {label: 'Неделя', icon: 'pi pi-fw pi-calendar', value: 7},
        {label: 'Месяц', icon: 'pi pi-fw pi-calendar', value: 30},
        {label: 'Все', icon: 'pi pi-fw pi-calendar', value: 360 * 2}
    ];
    const useChange =(index: number)=> {
        setActiveIndex(index);
        onChange(items[index].value);
    }

    return(
        <TabMenu
            model={items}
            activeIndex={activeIndex} 
            onTabChange={(e)=> useChange(e.index)}
        />
    );
}
const Loader =()=> (
    <div className='LoaderSpiner'>
        <i className="pi pi-spin pi-spinner" 
            style={{'fontSize': '5em', color:'silver'}}
        />
    </div>
);
const Navigator =({ value, items, onChange })=> {
    return(
        <div className='Navigator'>
            { items.map((elem, index)=> 
                <div 
                    className='NavigatorButton' 
                    id={value.value == elem.value ? 'active' : ''}
                    key={index} 
                    onClick={()=> onChange(elem)}
                >
                    { elem.label }
                </div>
            )}
        </div>
    );
}
const BaseStatistic =({ data }: { data: UsersBaseStatistic })=> {
    const [dopViewContext, setDopViewContext] = React.useState<DopViewContext>();
    const [curent, setCurent] = React.useState({value: 'country'});

    // list: name: value
    const render =(total: number, list)=> {
        const chek =(str: string)=> {
            return str.includes('[') && str.includes(']');
        }
        const useSetContext =(label: string)=> {
            let ctx;
            if(curent.value === 'country') ctx = 'city';
            else if(curent.value === 'device') ctx = 'info';
            else if(curent.value === 'refer') ctx = 'info';

            setDopViewContext({value: label, context: ctx});
        }

        return(
            <React.Fragment>
                { Object.keys(list).map((label, index)=> 
                    <div key={index} className='rowStat' 
                        style={{opacity: chek(label) ? 0.25 : 1}}
                        onClick={()=> !chek(label) && useSetContext(label)}
                    >
                        { curent.value === 'country' && <Flag code={label} size={{width:16,height:16}} /> }
                        <span style={{marginLeft: '5px', color: 'white'}}>
                            { label } {' :'}
                        </span>
                        <span style={{marginLeft:'1em', color: '#d2fa99'}}>
                            { list[label] }
                        </span>
                        <ProgressBar 
                            value={(list[label] / total) * 100}
                            showValue={false}
                        />
                    </div>
                )}
            </React.Fragment>
        );
    }
    const dataFormater =(elem: UniqueUsers)=> {
        const day = `${elem.date[6]}${elem.date[7]}`;
        const mounth = `${elem.date[4]}${elem.date[5]}`;
        const year = `${elem.date[0]}${elem.date[1]}${elem.date[2]}${elem.date[3]}`;

        return `${day}-${mounth}-${year}`;
    }
    const renderCity =(data: UniqueUsers[])=> {
        const chek =(str: string)=> {
            const one = str.includes('[') && str.includes(']');
            const two = str.includes('(') && str.includes(')');

            return one || two;
        }

        const citysRes = {};
        const filters = data.filter((elem)=> elem.country === dopViewContext.value);
        filters.forEach((elem)=> {
            if(citysRes[elem.city]) citysRes[elem.city] += 1;
            else citysRes[elem.city] = 1;
        });

        return(
            <React.Fragment>
                { Object.keys(citysRes).map((label, index)=>
                    <div key={index} className='rowStat'
                        style={{ opacity: chek(label) ? 0.25 : 1 }}
                        onClick={()=> setDopViewContext()}
                    >
                        <span style={{ marginLeft: '5px', color: 'white' }}>
                            { label } {' :'}
                        </span>
                        <span style={{ marginLeft: '1em', color: '#d2fa99' }}>
                            { citysRes[label] }
                        </span>
                        <ProgressBar 
                            value={(citysRes[label] / filters.length) * 100}
                            showValue={false}
                        />
                    </div>
                )}
            </React.Fragment>
        );
    }
    const renderInfo = (data: UniqueUsers[]) => {
        const chek = (str: string) => {
            const one = str.includes('[') && str.includes(']');
            const two = str.includes('(') && str.includes(')');
            const three = str.length === 0;

            return one || two || three;
        }
        const sortableDate =(res)=> {
            const parseDateTime =(str)=> {
                str = str.replace(/\s+/g, ""); // Убираем пробелы
                const match = str.match(/\[(\d{2})-(\d{2})-(\d{4})\](\d{2}):(\d{2})/);
                if (!match) return null;
                const [, day, month, year, hours, minutes] = match.map(Number);
                return new Date(year, month - 1, day, hours, minutes);
            }
    
            const arrDates = res.map((r)=> {
                r.timef = `${r.time[8]}${r.time[9]}:${r.time[10]}${r.time[11]}`;
                r.datef = dataFormater(r);
                r.timeFormat = parseDateTime(`[${r.datef}]${r.timef}`);
                return r;
            });
            
            return arrDates.sort((a, b)=> b.timeFormat - a.timeFormat); 
        }

        const filters = data.filter((elem)=> elem[curent.value].replace(/^https?:\/\//, '').replace(/\/$/, '') === dopViewContext.value);
        const curentResultrender = sortableDate(filters).map((elem)=> ({
            name: curent.value === 'device' ? elem.deviceModel : elem.refer,
            date: elem.datef,
            time: elem.timef,
            country: elem.country,
            city: elem.city
        }));
        

        return (
            <React.Fragment>
                { curentResultrender.map((elem, index) =>
                    <div key={index} className='rowStat' 
                        style={{borderBottom:'1px dotted gray', opacity: chek(elem.name) ? 0.25 : 1}}
                        onClick={()=> setDopViewContext()}
                    >
                        <span style={{fontSize:'12px'}}>
                            { chek(elem.name) ? '[not data]' : elem.name }:
                        </span>
                        <span style={{marginLeft:'1em', color:'silver', fontSize:'12px'}}>
                            <span style={{marginRight:'7px'}}>
                                [{ elem.date }]
                            </span> 
                            { elem.time }
                        </span>
                    </div>
                )}
            </React.Fragment>
        );
    }
    const filterOnRefer =(data: UniqueUsers[])=> {
        let total = 0;
        const result = {['[ not refer ]']: 0}
 
        data.map((elem)=> {
            if(elem.refer  && elem.refer!=='' && !result[elem.refer]) {
                result[elem.refer.replace(/^https?:\/\//, '').replace(/\/$/, '')] = elem.uniqueUsers; 
            }
            else if(elem.refer  && elem.refer!=='' && result[elem.refer]) {
                result[elem.refer.replace(/^https?:\/\//, '').replace(/\/$/, '')] += elem.uniqueUsers;
            }
            else result['[ not refer ]'] += elem.uniqueUsers;

            total += elem.uniqueUsers;
        });

        return {
            total,
            result,
        };
    }
    const filterOnDevices =(data: UniqueUsers[])=> {
        let total = 0;
        const result = {};

        data.map((elem)=> {
            if(result[elem.device]) {
                result[elem.device] += elem.uniqueUsers;
            }
            else result[elem.device] = elem.uniqueUsers;
            total += elem.uniqueUsers;
        })

        return {
            total,
            result,
        };
    }
    const filterOnCountry =(data: UniqueUsers[])=> {
        let total = 0;
        const result = {}

        data.forEach((el)=> {
            if(result[el.country]) result[el.country] += el.uniqueUsers;
            else result[el.country] = el.uniqueUsers;

            total += el.uniqueUsers;
        });

        return {
            total,
            result
        }
    }
    const dopProcessing =()=> {
        const ctx = dopViewContext.context;
        
        if(ctx === 'city') return renderCity(data.detail);
        else if(ctx === 'info') return renderInfo(data.detail);
    }
    const processing =(data: UsersBaseStatistic, curent: {value: 'country'|'refer'|'device'})=> {
        const details = structuredClone(data).detail.filter((elem)=> {
            if(elem.country !== "(not set)" && elem.country !== "(none)") {
                if(elem.city === "(not set)" || elem.city !== "(none)") elem.city = '[ not data ]';
                elem.date = dataFormater(elem);

                return elem;
            }
            else {
                elem.country = '[ not data ]';
                if(elem.city === "(not set)" || elem.city !== "(none)") elem.city = '[ not data ]';
                elem.date = dataFormater(elem);

                return elem;
            }
        });
        
        const coyntries = filterOnCountry(details);
        const refers = filterOnRefer(details);
        const devices = filterOnDevices(details);

        if(curent.value === 'country') return render(coyntries.total, coyntries.result);
        else if(curent.value === 'refer') return render(refers.total, refers.result);
        else if(curent.value === 'device') return render(devices.total, devices.result);
    }
    

    return(
        <div className='BaseArea'>
            <div className='WrapperCellStat'>
                <div className='CellStat'>
                    <div className='statValue'>
                        { data.activeUsers }
                    </div>
                    <div className='statLabel'>
                        Обшие посешения
                    </div>
                </div>
                <div className='CellStat'>
                    <div className='statValue' style={{color:'#d2fa99'}}>
                        { data.newUsers }
                    </div>
                    <div className='statLabel'>
                        Новые посешения
                    </div>
                </div>
            </div>
            <Navigator 
                value={curent}
                items={[
                    { label: <IoEarthOutline style={{margin:'auto'}} />, value: 'country' },
                    { label: <MdOutlineDevicesOther style={{margin:'auto'}} />, value: 'device' },
                    { label: <FaSitemap style={{margin:'auto'}} />, value: 'refer' },
                ]}
                onChange={(val)=> {setDopViewContext(); setCurent(val)}}
            />
            <div className='WrapperDiagram'>
                { dopViewContext && dopProcessing() }
                { !dopViewContext && processing(data, curent) }
            </div>
        </div>
    );
}
const Events =({ data }: { data: EventsStatistic })=> {
    const [curent, setCurent] = React.useState({label: 'co', value: 'country'});
    const actionsWithColors = [
        { 
            action: "Выход", 
            color: "red", 
            fadedColor: "rgba(255, 0, 0, 0.85)",
            icon: <FaSignOutAlt /> 
        },
        { 
            action: "Авторизация", 
            color: "blue", 
            fadedColor: "rgba(0, 0, 255, 0.85)",
            icon: <FaSignInAlt /> 
        },
        { 
            action: "Регистрация", 
            color: "green", 
            fadedColor: "rgba(0, 128, 0, 0.85)",
            icon: <FaUserPlus /> 
        },
        { 
            action: "Переход к оплате", 
            color: "orange", 
            fadedColor: "rgba(255, 165, 0, 0.85)",
            icon: <FaCreditCard /> 
        },
        { 
            action: "Супер поиск", 
            color: "purple", 
            fadedColor: "rgba(128, 0, 128, 0.85)",
            icon: <FaSearch /> 
        },
        { 
            action: "Платеж успешен", 
            color: "lime", 
            fadedColor: "rgba(0, 255, 0, 0.85)",
            icon: <FaCheckCircle /> 
        },
        { 
            action: "Платеж отмена", 
            color: "gray", 
            fadedColor: "rgba(128, 128, 128, 0.85)",
            icon: <FaTimesCircle /> 
        },
        { 
            action: "Сообщение", 
            color: "yellow", 
            fadedColor: "rgba(255, 255, 0, 0.85)",
            icon: <FaCommentAlt /> 
        },
        { 
            action: "Супер лайк", 
            color: "pink", 
            fadedColor: "rgba(255, 192, 203, 0.85)",
            icon: <FaThumbsUp /> 
        },
        { 
            action: "Куплен подарок", 
            color: "gold", 
            fadedColor: "rgba(255, 215, 0, 0.85)",
            icon: <FaGift /> 
        }
    ];
    
    const formatDiagram =(data: EventsStatistic)=> {
        let total = 0;
        const res = {};

        data.details.forEach((el)=> {
            if(res[el.name]) res[el.name] += el.count;
            else res[el.name] = el.count;

            total += el.count;
        });
        const arrData = Object.keys(res).map((label, index)=> {
            const find = actionsWithColors.find(el=> el.action === label);
            
            return({
                label,
                color: find.color,
                value: +res[label],
                icon: find.icon
            });
        });

        return(
            <Histogram
                data={arrData}
                maxValue={total}
            />
        );
    }
    const dataFormater =(elem)=> {
        const day = `${elem.date[6]}${elem.date[7]}`;
        const mounth = `${elem.date[4]}${elem.date[5]}`;
        const year = `${elem.date[0]}${elem.date[1]}${elem.date[2]}${elem.date[3]}`;

        return `${day}-${mounth}-${year}`;
    }
    // сортирует эвенты по времени, убыванию
    const sortableDate =(res)=> {
        const parseDateTime =(str)=> {
            str = str.replace(/\s+/g, ""); // Убираем пробелы
            const match = str.match(/\[(\d{2})-(\d{2})-(\d{4})\](\d{2}):(\d{2})/);
            if (!match) return null;
            const [, day, month, year, hours, minutes] = match.map(Number);
            return new Date(year, month - 1, day, hours, minutes);
        }

        const arrDates = res.map((r)=> {
            r.timeFormat = parseDateTime(`[${r.date}]${r.time}`);
            return r;
        });
        
        return arrDates.sort((a, b)=> b.timeFormat - a.timeFormat);
        
    }
    const processing =(data: EventsStatistic)=> {
        const res = [];

        structuredClone(data).details.forEach((el)=> {
            el.date = dataFormater(el);
            res.push(el);
        });
        
        return sortableDate(res);
    }
    

    return(
        <div className='BaseArea'>
            <div className='WrapperEventList'>
                { data && processing(data).map((elem, index)=> 
                    <div key={index} className='rowStat' style={{borderBottom:'1px dotted gray'}}>
                        <var>
                            { elem.name }:
                        </var>
                        <span style={{marginLeft:'1em', color:'silver', fontSize:'12px'}}>
                            <span style={{marginRight:'7px'}}>
                                [{ elem.date }]
                            </span> 
                            { elem.time }
                        </span>
                    </div>
                )}
            </div>
            <Navigator 
                value={curent}
                items={[
                    { label: <IoEarthOutline style={{margin:'auto'}} />, value: 'country' },
                    { label: <MdOutlineDevicesOther style={{margin:'auto'}} />, value: 'devices' },
                ]}
                onChange={setCurent}
            />
            <div className='WrapperCellEvent'>
                { data && formatDiagram(data) }
            </div>
        </div>
    );
}
const PayOrPurchase =({ data }: { data: PayOrPurchaseStatistic })=> {
    const [curent, setCurent] = React.useState({value: 'purchase'});

    const dataFormater =(elem)=> {
        const day = `${elem.date[6]}${elem.date[7]}`;
        const mounth = `${elem.date[4]}${elem.date[5]}`;
        const year = `${elem.date[0]}${elem.date[1]}${elem.date[2]}${elem.date[3]}`;

        return `${day}-${mounth}-${year}`;
    }
    // внутренние покупки
    const processingPay =(data: PayOrPurchaseStatistic)=> {
        let total = 0;
        let result = [];

        data.details.events.forEach((el)=> {
            if(el.name === 'Супер лайк') {
                result.push({
                    cost: 1,
                    name: el.name,
                    time: el.time,
                    date: dataFormater(el)
                });

                total += 1;
            }
            else if(el.name === 'Супер поиск') {
                result.push({
                    cost: 10,
                    name: el.name,
                    time: el.time,
                    date: dataFormater(el)
                });

                total += 10;
            }
            else if(el.name === 'Куплен подарок') {
                result.push({
                    cost: 10,
                    name: el.name,
                    time: el.time,
                    date: dataFormater(el)
                });

                total += 10;
            }
        });

        return({
            total,
            result
        });
    }
    // пополнения
    const processingPurchase =(data: PayOrPurchaseStatistic)=> {
        let paidCount = 0;
        let unPaidCount = 0;

        const resultPurchase = data.details.purchase.map((purchase)=> {
            if(purchase.status === 'paid') paidCount += 1;
            else if(purchase.status === 'unpaid') unPaidCount += 1;

            return purchase;
        });
        
        return {
            paid: paidCount,
            unPaid: unPaidCount,
            result: resultPurchase
        }
    }
    const render =(curent: {value: 'purchase'|'pays'})=> {
        const useColor =(status: 'paid'|'unpaid'|'no_payment_required')=> {
            if(status==='paid') return '#d2fa99';
            else if(status==='unpaid') return '#ea887b';
            else return '#ea887b';
        }

        if(curent.value === 'purchase') {
            const purchase = processingPurchase(data);

            return purchase.result.map((elem, index)=> (
                <div key={index} className='rowStat' 
                    style={{borderBottom:'1px dotted gray', color: useColor(elem.status)}}
                >
                    <span>
                        { elem.status === 'paid' && '✔️' }
                        { elem.status === 'unpaid' && '⏱' }
                    </span>
                    <var style={{marginLeft: '2px'}}>
                        { elem.login }:
                    </var>
                    <span style={{marginLeft: '1em', color:'silver', fontSize: '12px'}}>
                        <span style={{ marginRight: '7px' }}>
                            [{ convertTime(elem.timeshtamp, 'TD').date }]
                        </span>
                        { convertTime(elem.timeshtamp, 'TD').time }
                    </span> 
                    <span style={{marginLeft:'2em', fontSize:'12px'}}>
                        +{ " " +(elem.detail.amount_total / 100) + " "}  💲
                    </span>
                </div>
            ));
        }
        else if(curent.value === 'pays') {
            const pays = processingPay(data);
            
            return pays.result.map((elem, index)=> (
                <div key={index} className='rowStat' style={{borderBottom:'1px dotted gray'}}>
                    <var>
                        { elem.name }:
                    </var>
                    <span style={{ marginLeft: '1em', color: 'silver', fontSize: '12px' }}>
                        <span style={{ marginRight: '7px' }}>
                            [{ elem.date }]
                        </span>
                        { elem.time }
                    </span>
                    <span style={{ marginLeft: '30px', color: 'orange',fontSize: '12px' }}>
                        -{ " " + elem.cost + " " } 💎
                    </span>
                </div>
            ));
        }
    }
    

    return(
        <div className='BaseArea'>
            <div className='WrapperCellEvent' style={{height:'100%', width:'50%', flexDirection: 'row'}}>
                <div className='CellStat'>
                    <div className='statValue' style={{ color: '#d2fa99' }}>
                        {processingPurchase(data).paid}
                    </div>
                    <div className='statLabel' style={{ color: '#d2fa99' }}>
                        Завершенных
                    </div>
                </div>
                <div className='CellStat'>
                    <div className='statValue' style={{ color: '#ea887b' }}>
                        {processingPurchase(data).unPaid}
                    </div>
                    <div className='statLabel' style={{ color: '#ea887b' }}>
                        Не оплаченых
                    </div>
                </div>
                <div className='CellStat'>
                    <div className='statValue' style={{ color: '#9eddeb' }}>
                        {processingPay(data).total}
                    </div>
                    <div className='statLabel' style={{ color: '#9eddeb' }}>
                        Покупки
                    </div>
                </div>
            </div>
            <Navigator 
                value={curent}
                items={[
                    { label: <FaMoneyBillTrendUp style={{margin:'auto'}} />, value: 'purchase' },
                    { label: <GiPayMoney style={{margin:'auto'}} />, value: 'pays' }
                ]}
                onChange={setCurent}
            />
            <div className='WrapperEventList'>
                { data && render(curent) }
            </div>
        </div>
    );
}


export default function() {
    const [events, setEvents] = React.useState<EventsStatistic[]>();
    const [users, setUsers] = React.useState<UsersBaseStatistic>();
    const [sources, setSources] = React.useState<TraffikStatic>();
    const [pays, setPays] = React.useState<any>();

    const useChangeRangeDay =(range:number, type:'users'|'events'|'regs'|'source'|'pays')=> {
        if(type === 'users') setUsers();
        else if(type === 'events') setEvents();
        else if(type === 'pays') setPays();

        send('analytic', {
            startDate: range,
            type: type
        }, 'POST').then((result)=> {
            console.log(result);

            if(type === 'users') setUsers({startDate: range, ...result});
            else if(type === 'events') setEvents({startDate: range, details: result});
            else if(type === 'source') setSources({startDate: range, ...result});
            else if(type === 'pays') setPays({startDate: range, details: result});
        });
    }
    React.useEffect(()=> {
        if(!import.meta.env.DEV) {
            useChangeRangeDay(1, 'users');
            useChangeRangeDay(1, 'events');
            useChangeRangeDay(1, 'pays');
        }
    }, []);


    return(
        <div className='AdminBase Analitic'>
            <section className='PanelAnalytic' style={{height:'35%'}}>
                <TimeNavigation onChange={(range)=> useChangeRangeDay(range, 'users')} />
                <div className='AreaWraper'>
                    { !users  
                        ? <Loader /> 
                        : <BaseStatistic data={users}/>
                    }
                </div>
            </section>
            <section className='PanelAnalytic'>
                <TimeNavigation onChange={(range)=> useChangeRangeDay(range, 'events')} />
                <div className='AreaWraper'>
                    { !events  
                        ? <Loader /> 
                        : <Events data={events}/>
                    }
                </div>
            </section>
            <section className='PanelAnalytic'>
                <TimeNavigation onChange={(range)=> useChangeRangeDay(range, 'pays')} />
                <div className='AreaWraper'>
                    { !pays  
                        ? <Loader /> 
                        : <PayOrPurchase data={pays}/>
                    }
                </div>
            </section>
        </div>
    );
}