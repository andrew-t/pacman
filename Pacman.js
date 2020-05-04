import Actor from './Actor.js';
import { BlockTypes } from './Map.js';
import Directions, { oppositeDirection } from './Directions.js';
import eventerise from './events.js';

const controls = {
	ArrowUp: Directions.UP,
	ArrowDown: Directions.DOWN,
	ArrowLeft: Directions.LEFT,
	ArrowRight: Directions.RIGHT
};

export default class Pacman extends Actor {
	constructor(args) {
		super({
			x: 13, y: 23,
			direction: Directions.RIGHT,
			progress: 0.5,
			name: 'pac-man',
			speed: 0.8,
			...args
		});

		this.reset();

		document.addEventListener('keydown', e => {
			e.preventDefault();
			if (!this.isAlive || this.won) return;
			this.desiredDirection = null;
			const newDirection = controls[e.key];
			if (this.moving) {
				this.desiredDirection = newDirection;
			} else if (this.progress < 0.25) {
				this.direction = newDirection;
				this.moving = this.allowedNextDirections()[newDirection];
				this.progress = 0;
			} else if (newDirection == this.direction)
				this.moving = true;
			else if (newDirection == oppositeDirection(this.direction)) {
				this.uTurn();
				this.moving = true;
			}
		});
	}

	reset() {
		this.isAlive = true;
		super.reset();
	}

	getNextDirection() {
		if (!this.isAlive || this.won) return null;
		const allowedDirections = this.allowedNextDirections(),
			{ desiredDirection } = this;
		if (desiredDirection && allowedDirections[desiredDirection]) {
			this.desiredDirection = null;
			return desiredDirection;
		}
		return (allowedDirections[this.direction])
			? this.direction
			: null;
	}

	isWall(x, y) {
		const tile = this.map.get(x, y);
		return tile == BlockTypes.Wall || tile == BlockTypes.GhostDoor;
	}

	die() {
		console.log('Pacman died');
		this.isAlive = false;
		this.moving = false;
		this.fire('die');
	}

	win() {
		console.log('Pacman won!');
		for (const ghost of this.ghosts)
			ghost.stop();
		this.won = true;
		this.moving = false;
		this.fire('win');
	}

	onNewTile() {
		const currentTile = this.map.get(this.x, this.y);

		if (currentTile == BlockTypes.PowerPill)
			for (const ghost of this.ghosts)
				ghost.frighten();

		if (currentTile !== BlockTypes.Nothing) {
			this.map.set(this.x, this.y, BlockTypes.Nothing);
			this.fire('eat', currentTile);
			if (this.map.dotsLeft() == 0)
				this.win();
		}
	}
}

eventerise(Pacman);
