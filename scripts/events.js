export default function eventerise(c) {
	Object.assign(c.prototype, {

		on: function (event, callback) {
			if (!this.callbacks) this.callbacks = {};
			if (!this.callbacks[event]) this.callbacks[event] = [];
			if (!this.callbacks[event].includes(callback))
				this.callbacks[event].push(callback);
		},

		fire: function(event, ...args) {
			if (this.callbacks && this.callbacks[event])
				for (const callback of this.callbacks[event])
					callback(...args);
		}
		
	});
};
