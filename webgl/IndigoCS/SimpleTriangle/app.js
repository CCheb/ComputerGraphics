/* 
To use webgl we need to first set up the graphics pipeline
In essence, the pipeline can be seen/streamlined as:

buffers - hold data about our verticies like position, color, depth, etc
|
vertex shader - Takes our 3d representation and converts it over to 2d so that
				it can be eventually be seen on our screen. With the help of attributes
				which act much like input parameters in C, this shader reads the buffers
				to get important information about our vertexes. Once it takes and processes these vertices
				it will pass it over to the rasterizer or the fragment shader
|
rasterizer - Once webgl knows about the defined verticies, their positions, colors, depth, etc,
			It will rasterize, aka, fill in our shape by connecting the verticies together. If we want to
			draw a triangle on screen, the rasterizer will determine how many pixels are in between each of the
			verticies and will interpolate.
|
fragment shader - Once the foundation has been layed on the type of shape we are going to draw and how many pixels are
				involved, we now need to color them and thats the sole job of the fragment shader -- to give color to these
				"fragments" or pixels that live in the screen.
|
frame buffer - verticies are converted into pixels and these pixel are stored in the framebuffer. In essence, the frame buffer
			will store the final image to be shown on the screen
|
screen/output device - finally the framebuffer passes the pixel information over to the screen for viewing

WebGL only cares about two things: clip space coordinates and colors. Your job as a programmer using WebGL is to provide WebGL with those 2 things. 
You provide your 2 "shaders" to do this. A Vertex shader which provides the clip space coordinates, and a fragment shader that provides the color.

Note that the canvas has coordinates 0,0 on the top left of the screen. In webgl, the clip space refers to the "play area" which defines where we are
allowed to draw. Most of the time it ranges from -1 to 1 in the X and the Y.
*/


// Writing our vertex shader. Both the vertex and fragment shaders are written in a language called GLSL (GL shader language). Its similar to C/C++ 
// but with some exotic types like vec#, attribute, variying, uniform etc.
// Here we define our shader with medium float precision (boilerplate) along with three attributes (first two input, last is output/return). The jobs 
// of the attributes is to read from defined buffers which contain vertex information like positon, color, etc. In this case we grab postions with vertPosition
// and color with vertColor. fragColor is an attribute that will be passed over to the fragment shader.
//
// attribute = input parameter to the vertex shader
// varying = return value usually from vertex shader over to fragment shader. Can act as an "in" or "out" variable. Varyings always interpolate when in the
// fragmentation shader
// uniform = global constants
//
// vec4 = {x:0.0, y:0.0, z:0.0, w:1.0}
// There are many ways to write the shaders, this is just one method by using string arrays and concantenating the inner strings into one text
var vertexShaderText = 
[
'precision mediump float;',
'',
'attribute vec2 vertPosition;',
'attribute vec3 vertColor;',
'varying vec3 fragColor;',
'',
'void main()',
'{',
'  fragColor = vertColor;',
'  gl_Position = vec4(vertPosition, 0.0, 1.0);',
'}'
].join('\n');

// Writing our fragment shader. We set its precision and will set the color of the vertex according to the passed rgba. rbg is contained already inside
// fragColor from earlier
var fragmentShaderText =
[
'precision mediump float;',
'',
'varying vec3 fragColor;',
'void main()',
'{',
'  gl_FragColor = vec4(fragColor, 1.0);',
'}'
].join('\n');

// "Driver" code
var InitDemo = function () {
	console.log('This is working');

	// set the canvas and the context to be webgl
	var canvas = document.getElementById('game-surface');
	var gl = canvas.getContext('webgl');

	// erro catching
	if (!gl) {
		console.log('WebGL not supported, falling back on experimental-webgl');
		gl = canvas.getContext('experimental-webgl');
	}

	if (!gl) {
		alert('Your browser does not support WebGL');
	}

	// Setting our background color and clearing our screen with that color by reading from the color
	// and depth buffers
	gl.clearColor(0.75, 0.85, 0.8, 1.0);
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

	//
	// Create shaders
	// Start by creating two shader variables that will represent the vertex and
	// fragment shaders respectively
	var vertexShader = gl.createShader(gl.VERTEX_SHADER);
	var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);

	// Up until here the variables dont have a source to pull from. So we do that here by passing the
	// shader implementation from earlier
	gl.shaderSource(vertexShader, vertexShaderText);
	gl.shaderSource(fragmentShader, fragmentShaderText);

	// Then we compile our shaders and check for any errors in syntax with the error checking
	gl.compileShader(vertexShader);
	if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
		console.error('ERROR compiling vertex shader!', gl.getShaderInfoLog(vertexShader));
		return;
	}

	gl.compileShader(fragmentShader);
	if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
		console.error('ERROR compiling fragment shader!', gl.getShaderInfoLog(fragmentShader));
		return;
	}

	// Notice how this process is much like the compile process in C and C++. Once the shaders have been
	// compiled we need to link them together so that they can start talking to each other. We first create a
	// "program" which will sit on the GPU and to that program we attach both shaders, thus linking them
	var program = gl.createProgram();
	gl.attachShader(program, vertexShader);
	gl.attachShader(program, fragmentShader);
	gl.linkProgram(program);
	// Error checking
	if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
		console.error('ERROR linking program!', gl.getProgramInfoLog(program));
		return;
	}
	gl.validateProgram(program);
	if (!gl.getProgramParameter(program, gl.VALIDATE_STATUS)) {
		console.error('ERROR validating program!', gl.getProgramInfoLog(program));
		return;
	}

	// Now that the program has been created and the shaders linked, we can now start defining our
	// buffers. In this case we want to draw a simple triangle. Its vertex information will be stored
	// in an array of float values and connected to a buffer
	// Create buffer
	//
	var triangleVertices = 
	[ // X, Y,       R, G, B
		0.0, 0.5,    1.0, 0.0, 0.0,
		-0.5, -0.5,  0.0, 1.0, 0.0,
		0.5, -0.5,   0.0, 0.0, 1.0,

		0.5, 0.5,    1.0, 0.0, 0.0,
		0.7, 0.3, 	 0.0, 1.0, 0.0,
		0.3, 0.3, 	 0.0, 0.0, 1.0
	];

	// Creating our buffer that holds the triangleVertices information. Once created the buffer needs to be
	// binded to a global bind point. WebGL reads these resources from these global bind points. In this case
	// we can reference this particular buffer with the gl.ARRAY_BUFFER. "Hey WebGL, this is the current buffer
	// that i want to work with"
	var triangleVertexBufferObject = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, triangleVertexBufferObject);

	// JS considers all numbers to be 64-bit but WebGL works with 32-bit numbers (floats) so we need to make a 
	// conversion using new Float32Array(). This is the point where the cpu passes over information to the gpu
	// By including gl.STATIC_DRAW, we are telling the gpu that what ever this information this buffer contains
	// we (the cpu) are not going to change it and can be considered to be constants. So keep it stored
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(triangleVertices), gl.STATIC_DRAW);

	// Now that the buffer has been properly defined we need to connect it to the appropriate attributes. We do this by 
	// getting their locations/reference. Pass both the program and the attribute
	var positionAttribLocation = gl.getAttribLocation(program, 'vertPosition');
	var colorAttribLocation = gl.getAttribLocation(program, 'vertColor');

	// Now that the buffers and attributes know about each other, we know specify how the attribute should read/parse the buffer
	// since the its really just a big glorified array of floats. Need to do this step for all attributes. Here we are linking the attributes
	// with the buffer. Something that is hidden is that the attributes link to what the ARRAY_BUFFER is pointing to
	gl.vertexAttribPointer(
		positionAttribLocation, // Attribute location
		2, // Number of elements per attribute (X and Y)
		gl.FLOAT, // Type of elements
		gl.FALSE, // dont normalize
		5 * Float32Array.BYTES_PER_ELEMENT, // Size of an individual vertex we defined it early to have (x, y, r, g, b) and we only need x and y
		0 // Offset from the beginning of a single vertex to this attribute
	);
	gl.vertexAttribPointer(
		colorAttribLocation, // Attribute location
		3, // Number of elements per attribute
		gl.FLOAT, // Type of elements
		gl.FALSE,
		5 * Float32Array.BYTES_PER_ELEMENT, // Size of an individual vertex
		2 * Float32Array.BYTES_PER_ELEMENT // Offset from the beginning of a single vertex to this attribute. Skipping x and y and reading rgb
	);

	// Confirm changes. "I want to use the position data from the buffer and pass it to the vertex shader for processing." Without this line, 
	// WebGL wouldn't use the vertex data you've stored in your buffer for that particular attribute. We now finally pass this data over to the gpu
	gl.enableVertexAttribArray(positionAttribLocation);
	gl.enableVertexAttribArray(colorAttribLocation);

	//
	// Main render loop
	// executing the defined shaders to draw
	// Everything before was just initialization of the graphics pipeline. Now we can get to drawing!
	gl.useProgram(program);
	// Specify to draw a trianle with no offset and specify to use 3 verticies each with position and color!
	// For every pixel it is about to draw WebGL will call our fragment shader.
	gl.drawArrays(gl.TRIANGLES, 0, 3);
	gl.drawArrays(gl.TRIANGLES, 3, 3);
	gl.drawArrays(gl.TRIANGLE_FAN, 0, 6);
};