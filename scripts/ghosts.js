import Ghost from './Ghost.js';
import Directions from './Directions.js';

export class Blinky extends Ghost {
	constructor(args) {
		super({
			x: 13, y: 11,
			direction: Directions.RIGHT,
			progress: 0.5,
			name: 'blinky',
			favouriteCorner: { x: 27, y: 0 },
			...args
		});
	}

	getChaseTarget() {
		return this.prey;
	}
}

export class Pinky extends Ghost {
	constructor(args) {
		super({
			x: 14, y: 14,
			direction: Directions.LEFT,
			progress: 0.5,
			name: 'pinky',
			favouriteCorner: { x: 0, y: 0 },
			...args
		});
	}

	getChaseTarget() {
		return this.getPreyDestination(4);
	}
}

export class Inky extends Ghost {
	constructor({ blinky, ...args }) {
		super({
			x: 12, y: 14,
			direction: Directions.RIGHT,
			progress: 0.5,
			name: 'inky',
			favouriteCorner: { x: 27, y: 27 },
			...args
		});
		this.blinky = blinky;
	}

	getChaseTarget() {
		const pacman = this.getPreyDestination(2),
			diff = {
				x: pacman.x - this.blinky.x,
				y: pacman.y - this.blinky.y
			};
		return {
			x: pacman.x + diff.x,
			y: pacman.y + diff.y
		};
	}
}

export class Clyde extends Ghost {
	constructor(args) {
		super({
			x: 16, y: 14,
			direction: Directions.LEFT,
			progress: 0.5,
			name: 'clyde',
			favouriteCorner: { x: 0, y: 27 },
			...args
		});
	}

	getChaseTarget() {
		const dx = this.prey.x - this.x,
			dy = this.prey.y - this.y;
		return (dx * dx + dy * dy > 64)
			? this.prey
			: this.favouriteCorner;
	}
}
