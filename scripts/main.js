// https://www.gamasutra.com/view/feature/3938/the_pacman_dossier.php?print=1

import { generateMap, BlockTypes } from './Map.js';
import Pacman from './Pacman.js';
import { Modes as GhostModes } from './Ghost.js';
import { Inky, Blinky, Pinky, Clyde } from './ghosts.js';

const gameSpeed = 0.009;

const cycle = [
	// pacman level 1 cycle
	{ mode: GhostModes.SCATTER, time: 7000 * gameSpeed },
	{ mode: GhostModes.CHASE,   time: 20000 * gameSpeed },
	{ mode: GhostModes.SCATTER, time: 7000 * gameSpeed },
	{ mode: GhostModes.CHASE,   time: 20000 * gameSpeed },
	{ mode: GhostModes.SCATTER, time: 5000 * gameSpeed },
	{ mode: GhostModes.CHASE,   time: 20000 * gameSpeed },
	{ mode: GhostModes.SCATTER, time: 5000 * gameSpeed },
	{ mode: GhostModes.CHASE,   time: Infinity },
];

document.addEventListener('keypress', e => {
	if (e.key != ' ') return;
	e.preventDefault();
	if (document.body.classList.contains('game-over')) playGame();
});

function playGame() {
	document.getElementById('board').innerHTML = '';
	document.body.classList.remove('game-over');
	document.body.classList.remove('you-win');
	document.body.classList.remove('title-screen');

	const map = generateMap(),
		pacman = new Pacman({ map }),
		blinky = new Blinky({ map, cycle, prey: pacman }),
		inky = new Inky({ map, cycle, prey: pacman, blinky }),
		pinky = new Pinky({ map, cycle, prey: pacman }),
		clyde = new Clyde({ map, cycle, prey: pacman }),
		ghosts = [ inky, blinky, pinky, clyde ],
		actors = [ pacman, ...ghosts ];
	pacman.ghosts = ghosts;

	let lastTime = 0;

	let lives = 3, score = 0;

	function drawChrome() {
		// todo - should be row of pacmans
		document.getElementById('lives').innerHTML = lives;
		document.getElementById('score').innerHTML = score;
	}
	drawChrome();

	pacman.on('die', () => {
		lives--;
		if (lives > 0)
			setTimeout(() => {
				for (const actor of actors) actor.reset();
			}, 1000);
		else {
			document.body.classList.add('game-over');
			for (const ghost of ghosts) ghost.stop();
		}
		drawChrome();
	});

	pacman.on('eat', pill => {
		switch (pill) {
			case BlockTypes.Dot: score += 10; break;
			case BlockTypes.PowerPill: score += 50; break;
		}
		drawChrome();
	});

	pacman.on('win', () => {
		document.body.classList.add('you-win');
	});

	function frame(timestamp) {
		if (!document.body.classList.contains('game-over'))
			requestAnimationFrame(frame);
		const delta = Math.min(timestamp - lastTime, 150);
		// Turn milliseconds into a kind of "1 tile / max pacman speed" unit:
		const stepDelta = delta * gameSpeed;

		// step movement
		for (const actor of actors)
			actor.frame(stepDelta);

		// test collisions
		if (pacman.isAlive)
			allGhosts:
			for (const ghost of ghosts)
				if (ghost.isAtop(pacman))
					switch (ghost.mode) {
						case GhostModes.FRIGHTENED: ghost.die(); break;
						case GhostModes.DEAD: break;
						default: pacman.die(); break allGhosts;
					}

		lastTime = timestamp;
	}
	requestAnimationFrame(frame);
}

