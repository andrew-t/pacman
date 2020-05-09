export const BlockTypes = {
	Nothing: Symbol(' '),
	Wall: Symbol('🧱'),
	Dot: Symbol('•'),
	PowerPill: Symbol('💊'),
	GhostDoor: Symbol('👻')
};

const blockClasses = {
	[BlockTypes.Nothing]: 'nothing',
	[BlockTypes.Wall]: 'wall',
	[BlockTypes.Dot]: 'pill',
	[BlockTypes.PowerPill]: 'power-pill',
	[BlockTypes.GhostDoor]: 'ghost-door'
};

const allBlockClasses = [
	'nothing',
	'wall',
	'pill',
	'power-pill',
	'ghost-door',
];

const blockTypes = {
	'•': BlockTypes.Dot,
	'-': BlockTypes.Nothing,
	'#': BlockTypes.Wall,
	'.': BlockTypes.Wall,
	',': BlockTypes.Wall,
	'"': BlockTypes.Wall,
	"'": BlockTypes.Wall,
	'r': BlockTypes.Wall,
	'7': BlockTypes.Wall,
	'L': BlockTypes.Wall,
	'J': BlockTypes.Wall,
	'_': BlockTypes.Wall,
	'^': BlockTypes.Wall,
	'[': BlockTypes.Wall,
	']': BlockTypes.Wall,
	'~': BlockTypes.Wall,
	'*': BlockTypes.PowerPill,
	'=': BlockTypes.GhostDoor
};

const wallClasses = {
	'#': 'internal-wall',
	'.': 'top-left-convex-wall',
	',': 'top-right-convex-wall',
	'"': 'bottom-left-convex-wall',
	"'": 'bottom-right-convex-wall',
	'r': 'top-left-concave-wall',
	'7': 'top-right-concave-wall',
	'L': 'bottom-left-concave-wall',
	'J': 'bottom-right-concave-wall',
	'_': 'bottom-wall',
	'^': 'top-wall',
	'[': 'left-wall',
	']': 'right-wall',
	'~': 'unstyled-wall',
	'=': 'unstyled-wall'
};

const map = `
r^^^^^^^^^^^^7r^^^^^^^^^^^^7
]••••••••••••[]••••••••••••[
]•.__,•.___,•[]•.___,•.__,•[
]*[##]•[###]•[]•[###]•[##]*[
]•"^^'•"^^^'•"'•"^^^'•"^^'•[
]••••••••••••••••••••••••••[
]•.__,•.,•.______,•.,•.__,•[
]•"^^'•[]•"^^7r^^'•[]•"^^'•[
]••••••[]••••[]••••[]••••••[
L____,•[L__,-[]-.__J]•.____J
#####]•[r^^'-"'-"^^7]•[#####
#####]•[]----------[]•[#####
#####]•[]-~~=~~=~~-[]•[#####
^^^^^'•[]-~~=~~=~~-[]•"^^^^^
------•[]-~------~-[]•------
_____,•[]-~~~~~~~~-[]•._____
#####]•[]-~~~~~~~~-[]•[#####
#####]•[]----------[]•[#####
#####]•[]-.______,-[]•[#####
r^^^^'•"'-"^^7r^^'-"'•"^^^^7
]••••••••••••[]••••••••••••[
]•.__,•.___,•[]•.___,•.__,•[
]•"^7]•"^^^'•[]•"^^^'•[r^'•[
]*••[]•••••••--•••••••[]••*[
L_,•[]•.,•.______,•.,•[]•._J
r^'•"'•[]•"^^7r^^'•[]•"'•"^7
]••••••[]••••[]••••[]••••••[
]•.____JL__,•[]•.__JL____,•[
]•"^^^^^^^^'•"'•"^^^^^^^^'•[
]••••••••••••••••••••••••••[
L__________________________J
`;

class Map {
	constructor(txt) {

		// Build elements and tiles object in one pass:
		this.tiles = [];
		this.tileEls = [];
		const board = document.getElementById('board');
		for (const row of map.split('\n').filter(x => x)) {
			const tilesRow = [];
			this.tiles.push(tilesRow);
			const tileElsRow = [];
			this.tileEls.push(tileElsRow);
			for (const c of row.split('')) {
				const type = blockTypes[c];
				tilesRow.push(type);
				const el = document.createElement('div');
				el.classList.add('map');
				Object.assign(el.style, {
					left: `${ tilesRow.length - 1 }em`,
					top: `${ this.tiles.length - 1 }em`,
					zIndex: this.tiles.length * 100 - 100
				});
				switch (type) {
					case BlockTypes.Dot:
						el.classList.add(`dot-type-${-~(Math.random() * 8)}`);
						break;
					case BlockTypes.Wall:
					case BlockTypes.GhostDoor:
						el.classList.add(wallClasses[c]);
						break;
				}
				board.appendChild(el);
				tileElsRow.push(el);
			}
		}

		this.width = this.tiles[0].length;
		this.height = this.tiles.length;

		this.draw();
	}

	get(x, y) {
		return this.tiles[y][x];
	}

	set(x, y, value) {
		this.tiles[y][x] = value;
		this.draw();
	}

	dotsLeft() {
		let n = 0;
		for (let y = 0; y < this.height; ++y)
			for (let x = 0; x < this.width; ++x)
				switch (this.get(x, y)) {
					case BlockTypes.Dot:
					case BlockTypes.PowerPill:
						++n; break;
					default: break;
				}
		return n;
	}

	draw() {
		for (let y = 0; y < this.height; ++y)
			for (let x = 0; x < this.width; ++x) {
				for (const className of allBlockClasses)
					this.tileEls[y][x].classList.remove(className);
				const className = blockClasses[this.tiles[y][x]];
				if (!className) throw new Error();
				this.tileEls[y][x].classList.add(className);
			}
	}
}

export function generateMap() {
	return new Map(map);
}
