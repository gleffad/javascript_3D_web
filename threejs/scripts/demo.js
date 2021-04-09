var scene, camera, renderer, mesh;
var meshFloor;
var crate, crateTexture, crateNormalMap, crateBumpMap;
var keyboard = {};
var viewer = { height:1.8, speed:0.2, turnSpeed:Math.PI * 0.02 };
//binary status
var wireFrame_status = true;
var shadows_status = true;

function init() {
	scene = new THREE.Scene();
	camera = new THREE.PerspectiveCamera( 90, 1200/720, 0.1, 1000 );
	//mesh declaration
	mesh = new THREE.Mesh(
		new THREE.BoxGeometry(1,1,1),
		new THREE.MeshPhongMaterial( { color:0xff9999, wireframe:wireFrame_status } )
	);
	mesh.receiveShadow = shadows_status;
	mesh.castShadow = shadows_status;
	meshFloor = new THREE.Mesh(
		new THREE.PlaneGeometry(10, 10, 2, 2),
		new THREE.MeshPhongMaterial( { color:0xffffff, wireframe:wireFrame_status } )
	);
	//mesh rendering
	scene.add(mesh);
	mesh.position.y += 1;
	scene.add(meshFloor);
	meshFloor.rotation.x -= Math.PI / 2;
	//ambient light
	ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
	scene.add(ambientLight);
	//light
	light = new THREE.PointLight(0xffffff, 1, 10);
	light.position.set(-3, 6, -3);
	light.castShadow = true;
	light.shadow.camera.near = 0.1;
	light.shadow.camera.far = 25;
	scene.add(light);
	//crate
	crate = new THREE.Mesh(
			new THREE.BoxGeometry(3,3,3),
			new THREE.MeshPhongMaterial( { color:0xffffff } )
	);
	scene.add(crate);
	crate.position.set(2, 1.5, 2);
	crate.receiveShadow = true;
	crate.castShadow = true;
	
	//camera
	camera.position.set(0, viewer.height, -5);
	camera.lookAt(new THREE.Vector3(0,0,0));
	//renderer
	renderer = new THREE.WebGLRenderer();
	renderer.setSize(1280,720);
	//shadows
	renderer.shadowMap.enabled = true;
	renderer.shadowMap.type = THREE.BasicShadowMap;	
	document.body.appendChild(renderer.domElement);
	animate();
}

function animate() {
	requestAnimationFrame(animate);
	mesh.rotation.x += 0.01;
	mesh.rotation.y += 0.02;
	//Command keys
	//translations
	//W key
	if (keyboard[87]) {
		camera.position.x -= Math.sin(camera.rotation.y) * viewer.speed;
		camera.position.z -= -Math.cos(camera.rotation.y) * viewer.speed;
	}
	//S key
	if (keyboard[83]) {
		camera.position.x += Math.sin(camera.rotation.y) * viewer.speed;
		camera.position.z += -Math.cos(camera.rotation.y) * viewer.speed;
	}
	//A key
	if (keyboard[65]) {
		camera.position.x += Math.sin(camera.rotation.y + Math.PI / 2) * viewer.speed;
		camera.position.z += -Math.cos(camera.rotation.y + Math.PI / 2) * viewer.speed;
	}
	//D key
	if (keyboard[68]) {
		camera.position.x += Math.sin(camera.rotation.y - Math.PI / 2) * viewer.speed;
		camera.position.z += -Math.cos(camera.rotation.y - Math.PI / 2) * viewer.speed;
	}
	//view rotation
	//left arrow key
	if (keyboard[37]) {
		camera.rotation.y -= viewer.turnSpeed;
	}
	//right arrow key
	if (keyboard[39]) {
		camera.rotation.y += viewer.turnSpeed;
	}
	renderer.render(scene, camera);
}

function keyDown(event) {
	keyboard[event.keyCode] = true;
}

function keyUp(event) {
	keyboard[event.keyCode] = false;
}

window.addEventListener('keydown', keyDown);
window.addEventListener('keyup', keyUp);
window.onload = init;
