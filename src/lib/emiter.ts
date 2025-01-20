type EventAnimation = {
    type: 'fall' | 'kiss' | 'fier' | 'imgFier' | 'exp' | 'expRainbow' | 'rocket'
    image?: 'heart' | 'rose' | 'star' | 'lips' | 'petal'
    count?: number
    x?: number
    y?: number
}

interface Events {
    error: (data: { text: string })=> void
    success: (data: { text: string })=> void
    exit: (data?: any)=> void
    inputChange: ()=> void
    'input.start': ()=> void
    anim: (data: EventAnimation)=> void
}


export default class EventEmitter {
    events: Record<keyof Events, Events[keyof Events][]> = {} as Record<keyof Events, Events[keyof Events][]>;

    on<K extends keyof Events>(eventName: K, fn: Events[K]) {
        if (!this.events[eventName]) this.events[eventName] = [];
        this.events[eventName].push(fn);

        return ()=> {
            this.events[eventName] = this.events[eventName].filter((eventFn)=> fn !== eventFn);
        };
    }
    emit<K extends keyof Events>(eventName: K, data: Parameters<Events[K]>[0]) {
        const event = this.events[eventName];
        if(event) {
            event.forEach((fn) => {
                fn.call(null, data);
            });
        }
    }
    off<K extends keyof Events>(eventName: K, fn?: Events[K]) {
        if(fn) {
            let index = this.events[eventName].findIndex((func) => func === fn);
            if(index !== -1) this.events[eventName].splice(index, 1);
        } 
        else {
            delete this.events[eventName];
        }
    }
}