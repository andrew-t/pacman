import Actor, { Directions } from './Actor.js';
import { BlockTypes } from './Map.js';

export const Modes = {
	SCATTER: Symbol('Scatter'),
	CHASE: Symbol('Chase'),
	FRIGHTENED: Symbol('Frightened'),
	DEAD: Symbol('Dead')
};

const modeClasses = {
	[Modes.SCATTER]: 'scatter',
	[Modes.CHASE]: 'chase',
	[Modes.FRIGHTENED]: 'frightened',
	[Modes.DEAD]: 'dead'
};

const allModeClasses = [
	'scatter',
	'chase',
	'frightened',
	'dead'
];

class Ghost extends Actor {
	constructor({ favouriteCorner, prey, ...args}) {
		super({
			speed: 0.75,
			moving: true,
			...args
		});
		this.prey = prey;
		this.el.classList.add('ghost');
		this.favouriteCorner = favouriteCorner;
		this.mode = Modes.SCATTER;
	}

	getTarget() {
		return (this.mode == Modes.SCATTER)
			? this.favouriteCorner
			: this.getChaseTarget();
	}

	isWall(x, y) {
		switch (this.map.get(x, y)) {
			case BlockTypes.Wall: return true;
			case BlockTypes.GhostDoor: {
				if (this.map.get(this.x, this.y) == BlockTypes.GhostDoor)
					return false;
				if (this.y == 14 && this.x > 10 && this.x < 16)
					return false;
				return true;
			}
			default: return false;
		}
	}

	getPreferredDirectionList() {
		if (this.mode === Modes.FRIGHTENED)
			return [
				{ direction: Directions.UP,    badness: Math.random() },
				{ direction: Directions.LEFT,  badness: Math.random() },
				{ direction: Directions.DOWN,  badness: Math.random() },
				{ direction: Directions.RIGHT, badness: Math.random() }
			];

		const target = this.getTarget(),
			dx = target.x - this.x,
			dy = target.y - this.y;
		return [
				// define in original pacman preference order:
				{ direction: Directions.UP,    badness: -dy },
				{ direction: Directions.LEFT,  badness: -dx },
				{ direction: Directions.DOWN,  badness:  dy },
				{ direction: Directions.RIGHT, badness:  dx }
			]
			.map(({ direction, badness }) => ({
				direction,
				badness: badness < 0 ? 1000 - badness : badness
			}));
	}

	getNextDirection() {
		const allowedDirections = {
			...this.allowedNextDirections(),
			[Actor.oppositeDirection(this.direction)]: false
		};

		const bestDirection = this
			.getPreferredDirectionList()
			.filter(d => allowedDirections[d.direction])
			.sort((a, b) => a.badness - b.badness)
			[0];

		if (!bestDirection)
			throw new Error('Ghost trapped');

		return bestDirection
			? bestDirection.direction
			: null;
	}

	getPreyDestination(offset) {
		switch (this.prey.direction) {
			case Directions.UP: return {
				x: this.prey.x - offset, // bug to match original pacman
				y: this.prey.y - offset
			};
			case Directions.DOWN: return {
				x: this.prey.x,
				y: this.prey.y + offset
			};
			case Directions.LEFT: return {
				x: this.prey.x - offset,
				y: this.prey.y
			};
			case Directions.RIGHT: return {
				x: this.prey.x + offset,
				y: this.prey.y
			};
		}
	}

	draw() {
		super.draw();
		for (const className of allModeClasses)
			this.el.classList.remove(className);
		this.el.classList.add(modeClasses[this.mode]);
	}

	frighten() {
		this.mode = Modes.FRIGHTENED;
		this.uTurn();
	}
}

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
