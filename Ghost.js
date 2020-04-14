import Actor from './Actor.js';
import { BlockTypes } from './Map.js';
import Directions, { oppositeDirection } from './Directions.js';

export const Modes = {
	SCATTER: Symbol('Scatter'),
	CHASE: Symbol('Chase'),
	FRIGHTENED: Symbol('Frightened'),
	DEAD: Symbol('Dead'),
	STOPPED: Symbol('Stopped')
};

const modeClasses = {
	[Modes.SCATTER]: 'scatter',
	[Modes.CHASE]: 'chase',
	[Modes.STOPPED]: 'stopped',
	[Modes.FRIGHTENED]: 'frightened',
	[Modes.DEAD]: 'dead'
};

const allModeClasses = [
	'scatter',
	'chase',
	'stopped',
	'frightened',
	'dead'
];

export default class Ghost extends Actor {
	constructor({ favouriteCorner, prey, cycle, ...args}) {
		super({
			speed: 0.75,
			moving: true,
			...args
		});
		this.prey = prey;
		this.el.classList.add('ghost');
		this.favouriteCorner = favouriteCorner;

		this.cycle = cycle;
		this.reset();
	}

	reset() {
		this.cycleStep = 0;
		this.mode = this.cycle[0].mode;
		this.cycleTime = this.cycle[0].time;
		super.reset();
	}

	getTarget() {
		switch (this.mode) {
			case Modes.SCATTER: return this.favouriteCorner;
			case Modes.CHASE: return this.getChaseTarget();
			case Modes.DEAD: return { x: 14, y: 14 };
		}
		throw new Error('Unexpected ghost mode', this);
	}

	isWall(x, y) {
		switch (this.map.get(x, y)) {
			case BlockTypes.Wall: return true;
			case BlockTypes.GhostDoor: {
				if (this.mode == Modes.DEAD)
					return true;
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
		if (this.mode == Modes.STOPPED) return null;

		const reverse = oppositeDirection(this.direction);

		const allowedDirections = {
			...this.allowedNextDirections(),
			[reverse]: false
		};

		const bestDirection = this
			.getPreferredDirectionList()
			.filter(d => allowedDirections[d.direction])
			.sort((a, b) => a.badness - b.badness)
			[0];

		// If there is no bestDirection it means we can't go anywhere...
		// but we must be able to go backwards because we always can.
		// so we must be in the little ghost house bit
		return bestDirection ? bestDirection.direction : reverse;
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
		console.log(this.name, 'is frightened');
		this.mode = Modes.FRIGHTENED;
		this.uTurn();
		// fairly made-up number tbh, 63 is roughly 7s:
		this.specialModeTime = 63;
	}

	die() {
		console.log(this.name, 'died');
		this.mode = Modes.DEAD;
		this.specialModeTime = 100; // see frighten()
	}

	stop() {
		console.log(this.name, 'stopped');
		this.mode = Modes.STOPPED;
	}

	frame(delta) {
		super.frame(delta);

		const currentCycleStep = this.cycle[this.cycleStep];
		this.cycleTime += delta;
		if (this.cycleTime >= currentCycleStep.time) {
			this.cycleTime -= currentCycleStep.time;
			this.cycleStep++;
			console.log(this.name, 'moving to', this.cycle[this.cycleStep].mode, 'phase');
		}

		if (this.specialModeTime) {
			this.specialModeTime -= delta;
			if (this.specialModeTime <= 0) {
				console.log(this.name, 'returning to normal mode');
				this.specialModeTime = null;
			}
		}

		if (!this.specialModeTime)
			this.mode = this.cycle[this.cycleStep].mode;
	}
}
