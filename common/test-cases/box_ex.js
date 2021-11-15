export function renderBox(canvas, THREE) {
	var container, stats;
	var camera, scene, renderer;
	var present;
	var pointLight;
	var raycaster = new THREE.Raycaster();
	var pointer = new THREE.Vector2()
	var objects = [],
		materials = [];
	init();
	animate();
	open()

	function init() {

		scene = new THREE.Scene();
		camera = new THREE.PerspectiveCamera(60, canvas.width / canvas.height, 0.1, 1000);
		camera.position.set(30, 30, 30);
		camera.lookAt(scene.position);

		// Grid
		// var helper = new THREE.GridHelper(1000, 40, 0x303030, 0x303030);
		// helper.position.y = -75;
		// scene.add(helper);

		// present
		present = createPresent(12, 7);
		scene.add(present.mesh);

		// Lights
		// ambient light
		let ambientLight = new THREE.AmbientLight(0xffffff);
		ambientLight.name = "Ambient Light";
		scene.add(ambientLight);

		// directional light
		let directionLight = new THREE.DirectionalLight(0xffffff, 0.99);
		directionLight.name = "Directional Light";
		directionLight.position.set(10, 20, 0);
		directionLight.castShadow = true;
		directionLight.shadow.mapSize = new THREE.Vector2(1024, 1024);
		scene.add(directionLight);
		//
		renderer = new THREE.WebGLRenderer({
			antialias: true,
			alpha: true
		});
		//renderer.setClearColor(new THREE.Color(0xFFFFFF));
		renderer.setPixelRatio(wx.getSystemInfoSync().pixelRatio);
		renderer.setSize(canvas.width, canvas.height);
		renderer.shadowMap.enabled = true;
	}

	function updateRaycaster(e) {
		pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
		pointer.y = -(e.clientY / window.innerHeight) * 2 + 1;
		raycaster.setFromCamera(pointer, camera);
		intersects = raycaster.intersectObjects(present.mesh.children, true);
		intersects = intersects.filter(
			child => child.object.type == "Mesh"
		);
	}

	function addMesh(geometry, material) {
		var mesh = new THREE.Mesh(geometry, material);
		mesh.position.x = (objects.length % 4) * 200 - 400;
		mesh.position.z = Math.floor(objects.length / 4) * 200 - 200;
		mesh.rotation.x = Math.random() * 200 - 100;
		mesh.rotation.y = Math.random() * 200 - 100;
		mesh.rotation.z = Math.random() * 200 - 100;
		objects.push(mesh);
		scene.add(mesh);
	}

	function onWindowResize() {
		camera.aspect = window.innerWidth / window.innerHeight;
		camera.updateProjectionMatrix();
		renderer.setSize(window.innerWidth, window.innerHeight);
	}

	function generateTexture() {
		canvas.width = 256;
		canvas.height = 256;
		var context = canvas.getContext('2d');
		var image = context.getImageData(0, 0, 256, 256);
		var x = 0,
			y = 0;
		for (var i = 0, j = 0, l = image.data.length; i < l; i += 4, j++) {
			x = j % 256;
			y = x == 0 ? y + 1 : y;
			image.data[i] = 255;
			image.data[i + 1] = 255;
			image.data[i + 2] = 255;
			image.data[i + 3] = Math.floor(x ^ y);
		}
		context.putImageData(image, 0, 0);
		return canvas;
	}
	//
	function animate() {
		render();
		canvas.requestAnimationFrame(animate);
	}

	function render() {
		if (present)
			openLoop();
		// var timer = 0.0005 * Date.now();
		// camera.position.x = Math.cos(timer) * 1000;
		// camera.position.z = Math.sin(timer) * 1000;
		// camera.lookAt(scene.position);
		// for (var i = 0, l = objects.length; i < l; i++) {
		// 	var object = objects[i];
		// 	object.rotation.x += 0.01;
		// 	object.rotation.y += 0.005;
		// }
		// // materials[materials.length - 2].emissive.setHSL(0.54, 1, 0.35 * (0.5 + 0.5 * Math.sin(35 * timer)));
		// // materials[materials.length - 3].emissive.setHSL(0.04, 1, 0.35 * (0.5 + 0.5 * Math.cos(35 * timer)));
		// pointLight.position.x = Math.sin(timer * 7) * 300;
		// pointLight.position.y = Math.cos(timer * 5) * 400;
		// pointLight.position.z = Math.cos(timer * 3) * 300;
		renderer.render(scene, camera);
	}

	function createPresent(sideWidth, divisions) {
		var initObj = {}
		initObj.sideWidth = sideWidth;
		initObj.divisions = divisions;
		initObj.effectFadeSpeed = 0.02;
		initObj.effectMoveSpeed = 0.8;
		initObj.effectRotateSpeed = 0.1;
		initObj.openSpeed = 4;
		initObj.openTime = 0;
		initObj.timeToOpen = 120;
		initObj.opacity = 1;
		initObj.opening = false;
		initObj.opened = false;
		initObj.wireframe = false;
		initObj.pieces = [];
		initObj.materials = [
			// wrapping
			new THREE.MeshStandardMaterial({
				color: 0xeb6100,
				side: THREE.DoubleSide,
				transparent: true,
				wireframe: initObj.wireframe
			}),
			// ribbon
			new THREE.MeshStandardMaterial({
				color: 0xffffff,
				side: THREE.DoubleSide,
				transparent: true,
				wireframe: initObj.wireframe
			}),
			// bow
			new THREE.MeshStandardMaterial({
				color: 0xffffff,
				transparent: true,
				wireframe: initObj.wireframe
			})
		];
		initObj.mesh = new THREE.Object3D();
		initObj.mesh.name = "Present";

		let getTails = () => Math.random() < 0.5,
			randDecimal = (min, max) => Math.random() * (max - min) + min,
			S = initObj.sideWidth,
			HS = S / 2,
			fracS = S / divisions,
			fracHS = fracS / 2,
			HD = divisions / 2,

			pieceGeo = new THREE.PlaneBufferGeometry(fracS, fracS),

			wrappingMat = initObj.materials[0],
			wrappingPiece = new THREE.Mesh(pieceGeo, wrappingMat),

			ribbonMat = initObj.materials[1],
			ribbonPiece = new THREE.Mesh(pieceGeo, ribbonMat);

		wrappingPiece.receiveShadow = true;
		ribbonPiece.receiveShadow = true;

		for (let s = 0; s < 6; ++s) {
			// place sides
			let side = new THREE.Object3D();
			switch (s) {
				// bottom
				case 0:
					side.position.set(0, -HS, 0);
					side.rotation.x = Math.PI / 2;
					break;
					// back
				case 1:
					side.position.set(0, 0, -HS);
					side.rotation.y = Math.PI;
					break;
					// left
				case 2:
					side.position.set(-HS, 0, 0);
					side.rotation.y = -Math.PI / 2;
					break;
					// right
				case 3:
					side.position.set(HS, 0, 0);
					side.rotation.y = Math.PI / 2;
					break;
					// front
				case 4:
					side.position.set(0, 0, HS);
					break;
					// top
				default:
					side.position.set(0, HS, 0);
					side.rotation.x = -Math.PI / 2;
					break;
			}

			// assemble box
			for (let h = -HD; h < HD; ++h) {
				for (let w = -HD; w < HD; ++w) {
					let isMiddleX = w >= -1 && w <= 0,
						isMiddleY = h >= -1 && h <= 0,
						topOrBottom = s == 0 || s == 5,
						onBow = isMiddleX || (isMiddleY && topOrBottom),
						piece = onBow ? ribbonPiece.clone() : wrappingPiece.clone();

					piece.firstPosition = {
						x: fracS * w + fracHS,
						y: fracS * h + fracHS,
						z: 0
					};
					piece.position.set(piece.firstPosition.x, piece.firstPosition.y, 0);

					// adjust movements while adhereing to star–like direction
					piece.xMoveBias = randDecimal(0.3, 1);
					piece.yMoveBias = randDecimal(0.3, 1);
					piece.zMoveBias = randDecimal(0.3, 1);

					piece.xRotateDir = getTails() ? -1 : 1;
					piece.yRotateDir = getTails() ? -1 : 1;
					piece.zRotateDir = getTails() ? -1 : 1;

					side.add(piece);
					initObj.pieces.push(piece);
				}
			}
			initObj.mesh.add(side);
		}

		// add bow
		let bowRad = initObj.divisions % 2 == 0 ? 4 : 3,
			bowGeo = new THREE.DodecahedronBufferGeometry(bowRad),
			bowMat = initObj.materials[2];

		initObj.bow = new THREE.Mesh(bowGeo, bowMat);
		initObj.bow.castShadow = true;

		initObj.bow.firstPosition = {
			y: HS + bowRad / 4
		};
		initObj.bow.position.set(0, initObj.bow.firstPosition.y, 0);

		initObj.bow.xMoveDir = Math.random() * initObj.effectMoveSpeed * (getTails() ? -1 : 1);
		initObj.bow.yMoveDir = 1;
		initObj.bow.zMoveDir = Math.random() * initObj.effectMoveSpeed * (getTails() ? -1 : 1);

		initObj.bow.xRotateDir = getTails() ? -1 : 1;
		initObj.bow.yRotateDir = getTails() ? -1 : 1;
		initObj.bow.zRotateDir = getTails() ? -1 : 1;

		initObj.bow.scale.y = 0.5;
		initObj.mesh.add(initObj.bow);
		return initObj
	}

	function open() {
		console.log('present  open  ')
		if (!present.opening && !present.opened) {
			present.opening = true;
		}
	}

	function openLoop() {
		if (present.opening) {
			let openSpeed = present.openSpeed,
				sineCurve = n => 0.03 * Math.sin(8 * Math.PI * n / 100),
				scaleBy = 1 - sineCurve(present.openTime);

			present.mesh.scale.x = scaleBy;
			present.mesh.scale.y = scaleBy;
			present.mesh.scale.z = scaleBy;

			present.openTime += present.openSpeed;
			if (present.openTime >= present.timeToOpen) {
				present.openTime = 0;
				present.opening = false;
				present.opened = true;
			}

		} else if (present.opened) {
			let moveSpeed = present.effectMoveSpeed,
				rotateSpeed = present.effectRotateSpeed,
				divs = present.divisions;

			// pieces
			if (present.opacity > 0) {
				present.opacity -= present.effectFadeSpeed;

				present.pieces.forEach((e, i) => {
					let angleXZ = -45 + (90 * (i % divs) / (divs - 1)),
						angleY = -45 + (90 / (divs - 1) * Math.floor((i % divs ** 2) / divs));

					e.position.x += moveSpeed * Math.sin(angleXZ * Math.PI / 180) * e.xMoveBias;
					e.position.y += moveSpeed * Math.sin(angleY * Math.PI / 180) * e.yMoveBias;
					e.position.z += moveSpeed * Math.cos(angleXZ * Math.PI / 180) * e.zMoveBias;

					e.rotation.x += rotateSpeed * e.xRotateDir;
					e.rotation.y += rotateSpeed * e.yRotateDir;
					e.rotation.z += rotateSpeed * e.zRotateDir;
				});

				// bow
				present.bow.position.x += moveSpeed * present.bow.xMoveDir;
				present.bow.position.y += moveSpeed * present.bow.yMoveDir;
				present.bow.position.z += moveSpeed * present.bow.xMoveDir;

				present.bow.rotation.x += rotateSpeed * present.bow.xRotateDir;
				present.bow.rotation.y += rotateSpeed * present.bow.yRotateDir;
				present.bow.rotation.z += rotateSpeed * present.bow.zRotateDir;

			} else {
				present.opacity = 0;
				restore();
			}

			present.materials.forEach(e => {
				e.opacity = present.opacity;
			});
		}
	}

	function restore() {
		present.opened = false;
		present.opacity = 1;
		// pieces
		present.pieces.forEach(e => {
			e.position.set(e.firstPosition.x, e.firstPosition.y, e.firstPosition.z);
			e.rotation.set(0, 0, 0);
		});
		// bow
		present.bow.position.set(0, present.bow.firstPosition.y, 0);
		present.bow.rotation.set(0, 0, 0);
	}
	
	return {
		open: open,
		restore: restore
	}
}
