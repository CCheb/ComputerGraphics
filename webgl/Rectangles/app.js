"use strict";

function main()
{
    var canvas = document.getElementById("myCanvas");
    var gl  = canvas.getContext("webgl");
    if(!gl)
    {
        return;
    }

    // create shaders
    var vertexShader = gl.createShader(gl.VERTEX_SHADER);
	var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);

    // grabbing our source
    var vertexShaderSource = document.getElementById("vertex-shader").textContent;
    var fragmentShaderSource = document.getElementById("fragment-shader").textContent;

    // connecting the shaders with the source
    gl.shaderSource(vertexShader, vertexShaderSource);
	gl.shaderSource(fragmentShader, fragmentShaderSource);

    // Compile both shaders and perform any error checking for syntax
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

    // Linking the shaders with the program and doing error checking
    var program = gl.createProgram();
	gl.attachShader(program, vertexShader);
	gl.attachShader(program, fragmentShader);
	gl.linkProgram(program);
	// Error checking
	if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
		console.error('ERROR linking program!', gl.getProgramInfoLog(program));
		return;
    }

    // setting up our attributes. These are fed buffers
    var positionAttributeLocation = gl.getAttribLocation(program, "a_position");

    // Setting up our uniforms. Theses are assigned values after we use the program
    var resolutionUniformLocation = gl.getUniformLocation(program, "u_resolution");
    var colorUniformLocation = gl.getUniformLocation(program, "u_color");

    // Creating our buffer
    var postionBuffer = gl.createBuffer();

    // Bind it with gl.ARRAY_BUFFER (Claw)
    gl.bindBuffer(gl.ARRAY_BUFFER, postionBuffer);

    // set our viewport
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

    // Clear the canvas
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    // Tell the attribute how to get data out of positionBuffer (ARRAY_BUFFER)
    var size = 2;          // 2 components per iteration
    var type = gl.FLOAT;   // the data is 32bit floats
    var normalize = false; // don't normalize the data
    var stride = 0;        // 0 = move forward size * sizeof(type) each iteration to get the next position
    var offset = 0;        // start at the beginning of the buffer
    gl.vertexAttribPointer(positionAttributeLocation, size, type, normalize, stride, offset);

    // Turn on the attribute
    gl.enableVertexAttribArray(positionAttributeLocation);

    // Tell it to use our program the gpu(pair of shaders)
    // Any rendering or setting after this function call will
    // use this program to execute it
    gl.useProgram(program);
    
    // set the resolution. NOTE: uniforms are set after the useProgram is called!!!
    gl.uniform2f(resolutionUniformLocation, gl.canvas.width, gl.canvas.height);


    // Render loop. Everything before was just initialization
    // draw 50 random rectangles in random colors
    for (var ii = 0; ii < 50; ++ii) {
      // Setup a random rectangle
      // This will write to positionBuffer because
      // its the last thing we bound on the ARRAY_BUFFER
      // bind point
      setRectangle(
          gl, randomInt(500), randomInt(500), randomInt(300), randomInt(300));

      // Set a random color. Again, uniforms are set after the useProgram
      gl.uniform4f(colorUniformLocation, Math.random(), Math.random(), Math.random(), 1);

      // Draw the rectangle.
      var primitiveType = gl.TRIANGLES;
      var offset = 0;
      var count = 6;
      // The last thing we call is drawArrays which intiates a draw call executes our
      // state
      gl.drawArrays(primitiveType, offset, count);
    }

}

function randomInt(range){
    return Math.floor(Math.random() * range);
}

// Fill the buffer with the values that define a rectangle.
function setRectangle(gl, x, y, width, height) {
    var x1 = x;
    var x2 = x + width;
    var y1 = y;
    var y2 = y + height;
    // Forming rectangles based on two triangles. the numbers
    // are give in pixel coordinates and the vertex shader will
    // automatically convert them over to clip space. We update the
    // buffer data 50 times in this case
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
       x1, y1,
       x2, y1,
       x1, y2,
       x1, y2,
       x2, y1,
       x2, y2,
    ]), gl.STATIC_DRAW);
}
    

main();