// https://www.gamasutra.com/view/feature/3938/the_pacman_dossier.php?print=1

import { Directions } from './Actor.js';
import { generateMap } from './Map.js';
import Pacman from './Pacman.js';
import { Inky, Blinky, Pinky, Clyde, Modes as GhostModes } from './Ghost.js';

const map = generateMap(),
	pacman = new Pacman({ map }),
	blinky = new Blinky({ map, prey: pacman }),
	inky = new Inky({ map, prey: pacman, blinky }),
	pinky = new Pinky({ map, prey: pacman }),
	clyde = new Clyde({ map, prey: pacman }),
	ghosts = [ inky, blinky, pinky, clyde ],
	actors = [ pacman, ...ghosts ];
pacman.ghosts = ghosts;

let lastTime = 0;

const cycle = [
	// pacman level 1 cycle
	{ mode: GhostModes.SCATTER, time: 7000 },
	{ mode: GhostModes.CHASE,   time: 20000 },
	{ mode: GhostModes.SCATTER, time: 7000 },
	{ mode: GhostModes.CHASE,   time: 20000 },
	{ mode: GhostModes.SCATTER, time: 5000 },
	{ mode: GhostModes.CHASE,   time: 20000 },
	{ mode: GhostModes.SCATTER, time: 5000 },
	{ mode: GhostModes.CHASE,   time: Infinity },
];
let cycleTime = 0, cycleStep = 0, frightTime = null;

function frame(timestamp) {
	requestAnimationFrame(frame);
	const delta = Math.min(timestamp - lastTime, 150);
	// Turn milliseconds into a kind of "1 tile / max pacman speed" unit:
	const stepDelta = delta * 0.011;

	if (blinky.mode == GhostModes.FRIGHTENED) {
		if (frightTime === null) frightTime = 7000;
		else {
			frightTime -= delta;
			if (frightTime < 0) {
				frightTime = null;
				for (const ghost of ghosts)
					ghost.mode = cycle[cycleStep].mode;
			}
		}
	} else {
		cycleTime += delta;
		if (cycleTime > cycle[cycleStep].time) {
			cycleTime -= cycle[cycleStep].time;
			++cycleStep;
			console.log('Switching mode:', cycle[cycleStep].mode);
			const { mode } = cycle[cycleStep];
			for (const ghost of ghosts)
				ghost.mode = mode;
		}
	}

	for (const actor of actors)
		actor.frame(stepDelta);

	lastTime = timestamp;
}
requestAnimationFrame(frame);
