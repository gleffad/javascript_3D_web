// HTML5 input getter

// thoses variables are critical towards WebGL page correct execution
var c_width_top = 4;	//largeur surface superieure
var c_length_top = 3;	//longueur surface superieure
var c_width_bot = 1;	//largeur surface inferieure
var c_length_bot = 1;	//longueur surface inferieure
var c_depth = 1;	//profondeur
var x_offset = 1;	//offset entre les deux surface sur X
var y_offset = 1;	//offset entre les deux surfaces sur Y
var cam_position = 4 * Math.max(
		c_width_top, c_length_top,
		c_width_bot, c_length_bot,
		c_depth, x_offset, y_offset
		);	//position de la camera automatisee
console.log("cam position = " + -cam_position);

// listener on OK button
document.getElementById("ok_btn").addEventListener('click', getValue); 

// we get the variable from the HTML
function getValue() {
	var c_width_top = document.getElementById("c_width_top").value;
	console.log("c_width_top = " + c_width_top);
	var c_length_top = document.getElementById("c_length_top").value;
	console.log("c_length_top = " + c_length_top);
	var c_width_bot = document.getElementById("c_width_bot").value;
	console.log("c_width_bot = " + c_width_bot);
	var c_length_bot = document.getElementById("c_length_bot").value;
	console.log("c_length_bot = " + c_length_bot);
	var c_depth = document.getElementById("c_depth").value;
	console.log("c_depth = " + c_depth);
	var x_offset = document.getElementById("x_offset").value;
	console.log("x_offset = " + x_offset);
	var y_offset = document.getElementById("y_offset").value;
	console.log("y_offset = " + y_offset);
	console.log("values OK");
}

/*
 **!!! CAUTION !!! this code works with glMatrix version 3.0 and more.
 **For older version, remove 'glMatrix' prefix when using glMatrix features.
 */

/*
 ** OpenGL Shader Language
 */

var vertexShaderText =
[
	'precision mediump float;',
	'',
	'attribute vec3 vertPosition;',
	'attribute vec3 vertColor;',
	'varying vec3 fragColor;',
	'uniform mat4 mWorld;',
	'uniform mat4 mView;',
	'uniform mat4 mProj;',
	'',
	'void main()',
	'{',
	'	fragColor = vertColor;',
	'	gl_Position = mProj * mView * mWorld * vec4(vertPosition, 1.0);',
	'}'
].join('\n');

var fragmentShaderText =
[
	'precision mediump float;',
	'',
	'varying vec3 fragColor;',
	'void main()',
	'{',
	'	gl_FragColor = vec4(fragColor, 1.0);',
	'}'
].join('\n');

var InitDemo = function () {
	var canvas = document.getElementById('model_surface');
	var gl = canvas.getContext('webgl');

	if (!gl) {
		console.log('WebGL not supported');
		gl = canvas.getContext('experimental-webgl');
	}

	if (!gl) {
		alert('WebGL not supported');
	}

	/*
	 ** OpenGL initialisation
	 */

	//clearcolor(R,G,B,Alpha)
	gl.clearColor(0.75, 0.85, 0.8, 1.0);
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

	// camera proximity test
	gl.enable(gl.DEPTH_TEST);
	//gl.enable(gl.CULL_FACE);

	// a face is formed by vertices appearing counterclockwise form each other
	gl.frontFace(gl.CCW);

	// optimisation
	//gl.cullFace(gl.BACK);

	//shader declaration
	var vertexShader = gl.createShader(gl.VERTEX_SHADER);
	var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);

	gl.shaderSource(vertexShader, vertexShaderText);
	gl.shaderSource(fragmentShader, fragmentShaderText);

	//shader compilation
	gl.compileShader(vertexShader);
	if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
		console.error('ERROR compiling vertex shader !', gl.getShaderInfoLog(vertexShader));
		return;
	}

	gl.compileShader(fragmentShader);
	if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
		console.error('ERROR compiling fragment shader !', gl.getShaderInfoLog(fragmentShader));
		return;
	}

	//program building by linking shaders
	var program = gl.createProgram();
	gl.attachShader(program, vertexShader);
	gl.attachShader(program, fragmentShader);
	gl.linkProgram(program);
	if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
		console.error('ERROR linking program !', gl.getProgramInfoLog(program));
		return;
	}

	//program validation
	gl.validateProgram(program);
	if (!gl.getProgramParameter(program, gl.VALIDATE_STATUS)) {
		console.error('ERROR validating program !', gl.getProgramInfoLog(program));
		return;
	}

	/*
	 **buffer creation
	 */

	//specified in 64bit (javascript natif)
	//depends on indices order, changes may brake the program
	var boxVertices =
		[	// X, Y, Z,													R, G, B
		// TOP
		// following point is on diagonal (shared)
		0.0, 0.0, 0.0,												0.5, 0.5, 0.5,
		c_length_top, 0.0, 0.0,										0.5, 0.5, 0.5,
		// following point is on diagonal (shared)
		c_length_top, c_width_top, 0.0,								0.5, 0.5, 0.5,
		0.0, c_width_top, 0.0,										0.5, 0.5, 0.5,
		// LEFT
		// following point is on diagonal (shared)
		0.0, 0.0, 0.0,												0.75, 0.25, 0.5,
		c_length_top, 0.0, 0.0,										0.75, 0.25, 0.5,
		// following point is on diagonal (shared)
		c_length_bot + x_offset, y_offset, -c_depth,				0.75, 0.25, 0.5,
		x_offset, y_offset, -c_depth,								0.75, 0.25, 0.5,
		// RIGHT
		// following point is on diagonal (shared)
		0.0, c_width_top, 0.0,										0.25, 0.25, 0.75,
		c_length_top, c_width_top, 0.0,								0.25, 0.25, 0.75,
		// following point is on diagonal (shared)
		c_length_bot + x_offset, c_width_bot + y_offset, -c_depth,	0.25, 0.25, 0.75,
		x_offset, c_width_bot + y_offset, -c_depth,					0.25, 0.25, 0.75,
		// FRONT
		// following point is on diagonal (shared)
		c_length_top, 0.0, 0.0,										1.0, 0.0, 0.15,
		c_length_top, c_width_top, 0.0,								1.0, 0.0, 0.15,
		// following point is on diagonal (shared)
		c_length_bot + x_offset, c_width_bot + y_offset, -c_depth,	1.0, 0.0, 0.15,
		c_length_bot + x_offset, y_offset, -c_depth,				1.0, 0.0, 0.15,
		// BACK
		// following point is on diagonal (shared)
		0.0, 0.0, 0.0,												0.0, 1.0, 0.15,
		0.0, c_width_top, 0.0,										0.0, 1.0, 0.15,
		// following point is on diagonal (shared)
		x_offset, c_width_bot + y_offset, -c_depth,					0.0, 1.0, 0.15,
		x_offset, y_offset, -c_depth,								0.0, 1.0, 0.15,
		// BOTTOM
		// following point is on diagonal (shared)
		x_offset, y_offset, -c_depth,								0.5, 0.5, 1.0,
		c_length_bot + x_offset, y_offset, -c_depth,				0.5, 0.5, 1.0,
		// following point is on diagonal (shared)
		c_length_bot + x_offset, c_width_bot + y_offset, -c_depth,	0.5, 0.5, 1.0,
		x_offset, c_width_bot + y_offset, -c_depth,					0.5, 0.5, 1.0
			];

	var boxIndices =
		[
		// TOP
		0, 1, 2,
		0, 2, 3,

		// LEFT
		5, 4, 6,
		6, 4, 7,

		// RIGHT
		8, 9, 10,
		8, 10, 11,

		// FRONT
		13, 12, 14,
		15, 14, 12,

		// BACK
		16, 17, 18,
		16, 18, 19,

		// BOTTOM
		21, 20, 22,
		22, 20, 23 
			];

	// vertex objects
	var boxVertexBufferObject = gl.createBuffer();
	var boxIndexBufferObject = gl.createBuffer();

	// binding the bufffer
	gl.bindBuffer(gl.ARRAY_BUFFER, boxVertexBufferObject);
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, boxIndexBufferObject);

	// specification of the values we are using + specifying the array as 32bit like openGL expect it to be
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(boxVertices), gl.STATIC_DRAW);
	gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(boxIndices), gl.STATIC_DRAW);

	// position of the attribute
	var positionAttribLocation = gl.getAttribLocation(program, 'vertPosition');
	var colorAttribLocation = gl.getAttribLocation(program, 'vertColor');
	gl.vertexAttribPointer(
			positionAttribLocation,	// attribute location
			3,	// number of elements per attribute (vec2,3,4,...)
			gl.FLOAT,	// type of elements
			gl.FALSE,	// normalized data ?
			6 * Float32Array.BYTES_PER_ELEMENT,	// size of an individual vertex
			/*
			 ** BYTES_PER_ELEMENT hold the number of bytes held into the format of the value (32bit => 4),
			 ** we use it to be sure that [4 on the CPU] = [4 on the GPU] (limiting errors of interpretations)
			 */ 
			0	// offset from the beginning of a single vertex to this attribute
			);

	gl.vertexAttribPointer(
			colorAttribLocation,	// attribute location
			3,	// number of elements per attribute (vec2,3,4)
			gl.FLOAT,	// type of elements
			gl.FALSE,	// normalized data ?
			6 * Float32Array.BYTES_PER_ELEMENT, // size of an individual vertex
			/*
			 ** BYTES_PER_ELEMENT hold the number of bytes held into the format of the value (32bit => 4),
			 ** we use to be sure that [4 on the CPU] = [4 on the GPU] (limiting errors of interpretations)
			 */ 
			// offset from the beginning of a single vertex to this attribute
			3 * Float32Array.BYTES_PER_ELEMENT
			);

	// enabling attributes
	gl.enableVertexAttribArray(positionAttribLocation);
	gl.enableVertexAttribArray(colorAttribLocation);

	// tell OpenGL state machine which program should be active
	gl.useProgram(program);

	var matWorldUniformLocation = gl.getUniformLocation(program, 'mWorld');
	var matViewUniformLocation = gl.getUniformLocation(program, 'mView');
	var matProjUniformLocation = gl.getUniformLocation(program, 'mProj');

	// matrix building	
	var worldMatrix = new Float32Array(16);
	var viewMatrix = new Float32Array(16);
	var projMatrix = new Float32Array(16);

	glMatrix.mat4.identity(worldMatrix);

	// camera location
	glMatrix.mat4.lookAt(viewMatrix, [0, 0, -cam_position], [0, 0, 0], [0, 1, 0]);

	// perspective
	glMatrix.mat4.perspective(projMatrix, glMatrix.glMatrix.toRadian(45), canvas.width / canvas.height, 0.1, 1000.0);

	gl.uniformMatrix4fv(matWorldUniformLocation, gl.FALSE, worldMatrix);
	gl.uniformMatrix4fv(matViewUniformLocation, gl.FALSE, viewMatrix);
	gl.uniformMatrix4fv(matProjUniformLocation, gl.FALSE, projMatrix);

	// dual rotation

	var xRotationMatrix = new Float32Array(16);
	var yRotationMatrix = new Float32Array(16);

	/*
	 ** main render loop
	 */

	var identityMatrix = new Float32Array(16);
	glMatrix.mat4.identity(identityMatrix);
	var angle = 0;
	var loop = function () {
		angle = performance.now() / 1000 / 6 * 2 * Math.PI;
		//glMatrix.mat4.rotate(worldMatrix, identityMatrix, angle, [0, 1, 0]);
		// rotation movement
		glMatrix.mat4.rotate(xRotationMatrix, identityMatrix, 2 * angle, [1, 0, 0]);
		glMatrix.mat4.rotate(yRotationMatrix, identityMatrix, angle, [0, 1, 0]);
		glMatrix.mat4.mul(worldMatrix, xRotationMatrix, yRotationMatrix);

		gl.uniformMatrix4fv(matWorldUniformLocation, gl.FALSE, worldMatrix);

		gl.clearColor(0.75, 0.85, 0.8, 1.0);
		gl.clear(gl.DEPTH_BUFFER_BIT | gl.COLOR_BUFFER_BIT);

		// drawArrays(form : ('point','lines',...), nb point to skip, nb point to draw)
		// will use any already bindinded buffer
		gl.drawElements(gl.TRIANGLES, boxIndices.length, gl.UNSIGNED_SHORT, 0);
		requestAnimationFrame(loop);
	};
	requestAnimationFrame(loop);
};
