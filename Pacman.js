import Actor, { Directions } from './Actor.js';
import { BlockTypes } from './Map.js';

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

		document.addEventListener('keydown', e => {
			e.preventDefault();
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
			else if (newDirection == Actor.oppositeDirection(this.direction)) {
				this.uTurn();
				this.moving = true;
			}
		});
	}

	getNextDirection() {
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

	onNewTile() {
		const currentTile = this.map.get(this.x, this.y);

		if (currentTile == BlockTypes.PowerPill)
			for (const ghost of this.ghosts)
				ghost.frighten();

		this.map.set(this.x, this.y, BlockTypes.Nothing);
	}
}
