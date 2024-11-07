import EventEmmitter from "./emiter";


export const useLocalStorage =()=> {
    const result = {}

    Object.keys(localStorage).map((key)=> {
        if(key!=='setItem' && key!=='getItem' && key!=='removeItem'){
			result[key] = JSON.parse(localStorage.getItem(key))
		}
    });

	return result;
}


export default {
    globalStorage: {},
	_event: new EventEmmitter(),
    
	async _save(key, value) {
		localStorage.setItem(key, JSON.stringify(value))
	},
    init(globalStorage) {
        this.globalStorage = globalStorage;
        return this;
    },
	set(key, value) {
		this.globalStorage[key] = value;
		this._save(key, value);
		this._event.emit(key, value);
	},
	get(key) {
		return this.globalStorage[key];
	},
	watch(key, listener) {
		this._event.on(key, listener);
	},
	unwatch(key) {
		delete this._event.events[key];
	}
}