console.clear();

const GUI = new dat.GUI();

let GUISettings = {
	totalBlobs: {
		value: 3,
		min: 1,
		max: 6
	},
	pixelSize: {
		value: 10,
		min: 4,
		max: 20
	},
	radius: {
		value: 200,
		min: 100,
		max: 600
	},
	noiseRadius: {
		value: 1.5,
		min: 1,
		max: 5
	},
	numFrames: {
		value: 500,
		min: 100,
		max: 1200
	},
	noisyColor: false,
	differentBlobColor: false,
	paused: false,
	redraw: () => init()
};

let blobs;
let canvas;

function setup() {
	canvas = createCanvas(innerWidth, innerHeight);
	init();
}

function init() {
	let options = {
		seed: Date.now(),
		size: GUISettings.pixelSize.value,
		radius: GUISettings.radius.value,
		noiseRadius: GUISettings.noiseRadius.value,
		numFrames: GUISettings.numFrames.value,
		noisyColor: GUISettings.noisyColor,
		randomColorMod: GUISettings.differentBlobColor
			? undefined
			: {
					r: floor(random(0, 255)),
					g: floor(random(0, 255)),
					b: floor(random(0, 255))
			  }
	};
	blobs = [];
	for (let i = 0; i < GUISettings.totalBlobs.value; i++) {
		blobs.push(new Blob(options));
	}
}

function draw() {
	background(0);
	blobs.forEach((blob) => {
		if (GUISettings.paused === false) blob.update();
		blob.draw();
	});
}

function addGUI() {
	GUI.add(
		GUISettings.totalBlobs,
		"value",
		GUISettings.totalBlobs.min,
		GUISettings.totalBlobs.max
	)
		.step(1)
		.name("Total Blobs")
		.onChange(init);
	GUI.add(
		GUISettings.pixelSize,
		"value",
		GUISettings.pixelSize.min,
		GUISettings.pixelSize.max
	)
		.step(1)
		.name("Pixel Size")
		.onChange(init);
	GUI.add(
		GUISettings.radius,
		"value",
		GUISettings.radius.min,
		GUISettings.radius.max
	)
		.step(1)
		.name("Radius")
		.onChange(init);
	GUI.add(
		GUISettings.noiseRadius,
		"value",
		GUISettings.noiseRadius.min,
		GUISettings.noiseRadius.max
	)
		.step(0.1)
		.name("Noise Radius")
		.onChange(init);
	GUI.add(
		GUISettings.numFrames,
		"value",
		GUISettings.numFrames.min,
		GUISettings.numFrames.max
	)
		.step(100)
		.name("Total Frames")
		.onChange(init);
	GUI.add(GUISettings, "noisyColor").name("Noisy Color").onChange(init);
	GUI.add(GUISettings, "differentBlobColor")
		.name("Different Color")
		.onChange(init);
	GUI.add(GUISettings, "paused").name("Paused");
	GUI.add(GUISettings, "redraw").name("Re-Draw");
}

addGUI();

function windowResized() {
	resizeCanvas(innerWidth, innerHeight);
	init();
}

class Blob {
	constructor(options) {
		this.size = options.size || 10;
		this.rows = ceil(width / this.size);
		this.cols = ceil(height / this.size);
		this.radius = options.radius;
		this.NOISE = openSimplexNoise(options.seed || Date.now());
		this.noiseRadius = options.noiseRadius || 2;
		this.numFrames = options.numFrames;
		this.blobPosition = createVector(0, 0);
		this.randomBlobPositionSeed = createVector(random(0, 100), random(0, 100));
		this.randomColorMod = options.randomColorMod || {
			r: floor(random(0, 255)),
			g: floor(random(0, 255)),
			b: floor(random(0, 255))
		};
		this.noisyColor = options.noisyColor || false;
		this.t = 0;
	}
	draw() {
		for (let y = 0; y < this.cols; y++) {
			for (let x = 0; x < this.rows; x++) {
				this.radius =
					100 *
						this.NOISE.noise4D(
							x * this.size * 0.01,
							y * this.size * 0.01,
							this.noiseRadius * cos(TWO_PI * this.t),
							this.noiseRadius * sin(TWO_PI * this.t)
						) +
					100;

				if (
					dist(
						x * this.size,
						y * this.size,
						this.blobPosition.x,
						this.blobPosition.y
					) < this.radius
				) {
					if (this.noisyColor) {
						fill(
							this.radius % floor(random(0, 255)),
							this.radius % floor(random(0, 255)),
							this.radius % floor(random(0, 255))
						);
					} else {
						fill(
							this.radius % this.randomColorMod.r,
							this.radius % this.randomColorMod.g,
							this.radius % this.randomColorMod.b
						);
					}
					noStroke();
					rect(x * this.size, y * this.size, this.size, this.size);
				}
			}
		}
	}

	update() {
		this.t = map(frameCount - 1, 0, this.numFrames, 0, 1);
		this.blobPosition.x =
			(width / 2) *
				this.NOISE.noise3D(
					this.randomBlobPositionSeed.x,
					this.noiseRadius * cos(TWO_PI * this.t),
					this.noiseRadius * sin(TWO_PI * this.t)
				) +
			width / 2;
		this.blobPosition.y =
			(height / 2) *
				this.NOISE.noise3D(
					this.randomBlobPositionSeed.y,
					this.noiseRadius * sin(TWO_PI * this.t),
					this.noiseRadius * cos(TWO_PI * this.t)
				) +
			height / 2;
	}
}