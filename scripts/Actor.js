import { BlockTypes } from './Map.js';
import Directions, { oppositeDirection, nextTile } from './Directions.js';

const directionClasses = {
	[Directions.UP]: 'facing-up',
	[Directions.DOWN]: 'facing-down',
	[Directions.LEFT]: 'facing-left',
	[Directions.RIGHT]: 'facing-right'
};

const allDirectionClasses = [
	'facing-up',
	'facing-down',
	'facing-left',
	'facing-right'
];

export default class Actor {
	constructor({
		x, y,
		direction = Directions.UP,
		progress = 0,
		name,
		speed = 1,
		moving = false,
		map
	}) {
		this.initialState = { x, y, direction, progress, moving };
		this.el = document.createElement('div');
		this.el.classList.add('actor');
		this.el.id = this.name = name;
		this.speed = speed;
		this.map = map;
		document.getElementById('board')
			.appendChild(this.el);
		Actor.prototype.reset.call(this); // to avoid calling overrides
	}

	reset() {
		Object.assign(this, this.initialState);
		this.draw();
	}

	draw() {
		for (const className of allDirectionClasses)
			this.el.classList.remove(className);
		this.el.classList.add(directionClasses[this.direction]);
		let { x, y } = this;
		switch (this.direction) {
			case Directions.UP:    y -= this.progress; break;
			case Directions.DOWN:  y += this.progress; break;
			case Directions.LEFT:  x -= this.progress; break;
			case Directions.RIGHT: x += this.progress; break;
		}
		Object.assign(this.el.style, {
			transform: `translate(${ x }em, ${ y }em)`
		})
	}

	allowedNextDirections() {
		return {
			[Directions.UP]:    !this.isWall(this.x, this.y - 1),
			[Directions.DOWN]:  !this.isWall(this.x, this.y + 1),
			[Directions.LEFT]:  !this.isWall(this.x - 1, this.y),
			[Directions.RIGHT]: !this.isWall(this.x + 1, this.y)
		};
	}

	// override these
	getNextDirection() { return null; }
	onNewTile() {}
	isWall(x, y) { return this.map.get(x, y) == BlockTypes.Wall; }

	uTurn() {
		if (this.progress > 0) {
			this.progress = 1 - this.progress;
			this.step();
		}
		this.direction = oppositeDirection(this.direction);
	}

	step() {
		Object.assign(this, nextTile(this.x, this.y, this.direction));
	}

	closestTile() {
		return this.progress > 0.5
			? nextTile(this.x, this.y, this.direction)
			: { x: this.x, y: this. y };
	}

	isAtop(other) {
		// this has a bug where pacman and a ghost can swap tiles on the same frame,
		// but that's a classic pacman bug so I'm leaving it in for now #retrocharm
		const thisTile = this.closestTile(),
			otherTile = other.closestTile();
		return (thisTile.x == otherTile.x) && (thisTile.y == otherTile.y);
	}

	frame(delta) {
		if (!this.moving) return;
		const distance = delta * this.speed;
		this.progress += distance;
		while (this.progress >= 1) {
			this.progress -= 1;
			this.step();
			if (this.x == 0) this.x = 27;
			else if (this.x == 27) this.x = 0;
			this.onNewTile();
			const nextDirection = this.getNextDirection();
			if (nextDirection)
				this.direction = nextDirection;
			else {
				this.progress = 0;
				this.moving = false;
			}
		}
		this.draw();
	}
}
