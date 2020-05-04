const Directions = {
	UP: Symbol('⬆️'),
	DOWN: Symbol('⬇️'),
	LEFT: Symbol('⬅️'),
	RIGHT: Symbol('➡️'),
};

export default Directions;

export function oppositeDirection(direction) {
	switch (direction) {
		case Directions.UP:    return Directions.DOWN;
		case Directions.DOWN:  return Directions.UP;
		case Directions.LEFT:  return Directions.RIGHT;
		case Directions.RIGHT: return Directions.LEFT;
	}
}

export function nextTile(x, y, direction) {
	switch (direction) {
		case Directions.UP:    return { x, y: y - 1 };
		case Directions.DOWN:  return { x, y: y + 1 };
		case Directions.LEFT:  return { x: x - 1, y };
		case Directions.RIGHT: return { x: x + 1, y };
	}
}
