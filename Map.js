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

// This version has the correct ghost door...
// const map = `
// ############################
// #••••••••••••##••••••••••••#
// #•####•#####•##•#####•####•#
// #*####•#####•##•#####•####*#
// #•####•#####•##•#####•####•#
// #••••••••••••••••••••••••••#
// #•####•##•########•##•####•#
// #•####•##•########•##•####•#
// #••••••##••••##••••##••••••#
// ######•#####-##-#####•######
// -----#•#####-##-#####•#-----
// -----#•##----------##•#-----
// -----#•##-###==###-##•#-----
// ######•##-###==###-##•######
// ------•##-#------#-##•------
// ######•##-########-##•######
// -----#•##-########-##•#-----
// -----#•##----------##•#-----
// -----#•##-########-##•#-----
// ######•##-########-##•######
// #••••••••••••##••••••••••••#
// #•####•#####•##•#####•####•#
// #•####•#####•##•#####•####•#
// #*••##•••••••--•••••••##••*#
// ###•##•##•########•##•##•###
// ###•##•##•########•##•##•###
// #••••••##••••##••••##••••••#
// #•##########•##•##########•#
// #•##########•##•##########•#
// #••••••••••••••••••••••••••#
// ############################
// `;

// ...but this version's easier to code for
const map = `
############################
#••••••••••••##••••••••••••#
#•####•#####•##•#####•####•#
#*####•#####•##•#####•####*#
#•####•#####•##•#####•####•#
#••••••••••••••••••••••••••#
#•####•##•########•##•####•#
#•####•##•########•##•####•#
#••••••##••••##••••##••••••#
######•#####-##-#####•######
-----#•#####-##-#####•#-----
-----#•##----------##•#-----
-----#•##-========-##•#-----
######•##-========-##•######
------•##-=------=-##•------
######•##-========-##•######
-----#•##-========-##•#-----
-----#•##----------##•#-----
-----#•##-########-##•#-----
######•##-########-##•######
#••••••••••••##••••••••••••#
#•####•#####•##•#####•####•#
#•####•#####•##•#####•####•#
#*••##•••••••--•••••••##••*#
###•##•##•########•##•##•###
###•##•##•########•##•##•###
#••••••##••••##••••##••••••#
#•##########•##•##########•#
#•##########•##•##########•#
#••••••••••••••••••••••••••#
############################
`;

class Map {
	constructor(txt) {
		const blockTypes = {
			'•': BlockTypes.Dot,
			'-': BlockTypes.Nothing,
			'#': BlockTypes.Wall,
			'*': BlockTypes.PowerPill,
			'=': BlockTypes.GhostDoor
		};

		this.tiles = map
			.split('\n')
			.filter(x => x)
			.map(row => row.split('')
				.map(c => blockTypes[c]));

		const mapView = document.getElementById('background');
		this.tileEls = this.tiles.map(row => {
			const tr = document.createElement('tr');
			mapView.appendChild(tr);
			return row.map(cell => {
				const td = document.createElement('td');
				tr.appendChild(td);
				return td;
			});
		});

		this.draw();
	}

	get(x, y) {
		return this.tiles[y][x];
	}

	set(x, y, value) {
		this.tiles[y][x] = value;
		this.draw();
	}

	draw() {
		for (let y = 0; y < this.tiles.length; ++y)
			for (let x = 0; x < this.tiles[y].length; ++x) {
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
