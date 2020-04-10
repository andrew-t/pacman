import { BlockTypes } from './Map.js';

export const Directions = {
	UP: Symbol('⬆️'),
	DOWN: Symbol('⬇️'),
	LEFT: Symbol('⬅️'),
	RIGHT: Symbol('➡️'),
};

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
	constructor({ x, y, direction, progress, name, speed, moving, map }) {
		this.x = x;
		this.y = y;
		this.direction = direction || Directions.UP;
		this.progress = progress || 0;
		this.el = document.createElement('div');
		this.el.id = name;
		this.speed = speed || 1;
		this.moving = moving || false;
		this.map = map;
		document.getElementById('actors')
			.appendChild(this.el);
		this.draw();
	}

	static oppositeDirection(direction) {
		switch (direction) {
			case Directions.UP:    return Directions.DOWN;
			case Directions.DOWN:  return Directions.UP;
			case Directions.LEFT:  return Directions.RIGHT;
			case Directions.RIGHT: return Directions.LEFT;
		}
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
			transform: `translate(${ x * 2 }em, ${ y * 2 }em)`
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
			switch (this.direction) {
				case Directions.UP:    this.y--; break;
				case Directions.DOWN:  this.y++; break;
				case Directions.LEFT:  this.x--; break;
				case Directions.RIGHT: this.x++; break;
			}
		}
		this.direction = Actor.oppositeDirection(this.direction);
	}

	frame(delta) {
		if (!this.moving) return;
		const distance = delta * this.speed;
		this.progress += distance;
		while (this.progress >= 1) {
			this.progress -= 1;
			switch (this.direction) {
				case Directions.UP:    this.y--; break;
				case Directions.DOWN:  this.y++; break;
				case Directions.LEFT:  this.x--; break;
				case Directions.RIGHT: this.x++; break;
			}
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
