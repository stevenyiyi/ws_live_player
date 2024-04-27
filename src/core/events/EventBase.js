class EventBase {
    extend(events, config) {
        if(!events) return;
        let override = config ? config.override : false;
        let publicOnly = config ? config.publicOnly : false;
        
        for(const evt in events) {
            // eslint-disable-next-line no-prototype-builtins
            if(!events.hasOwnProperty(evt) || (this[evt] && !override)) continue;
            if(publicOnly && events[evt].indexOf('public_') === -1) continue;
            this[evt] = events[evt];
        }
    }
}

export default EventBase;