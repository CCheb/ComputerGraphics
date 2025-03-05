class Gem
{
	constructor()
	{
		this.buffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);

		this.verticies =
		[	//Top Front
			0,0.15,0,   1,0,0,
			0.1,0,0.1,  1,0,0,
			-0.1,0,0.1,	 1,0,0,
			 //Bottom Front
			0,-0.15,0,	0,1,0,
			0.1,0,0.1,	0,1,0,
			-0.1,0,0.1,	0,1,0,
			//Top Left
			0,0.15,0,	 0,0,1,
			-0.1,0,0.1,	 0,0,1,
			-0.1,0,-0.1, 0,0,1,
			//Top Right
			0,0.15,0,	1,1,0,
			0.1,0,0.1,	1,1,0,
			0.1,0,-0.1,	1,1,0,
			//Top rear
			0,0.15,0,		0,1,1,
			0.1,0,-0.1,		0,1,1,
			-0.1,0,-0.1,	0,1,1,
			//
			-0.1,0,-0.1,	1,0,1,
			0.1,0,-0.1,		1,0,1,
			0,-0.15,0,		1,0,1,

			0,-0.15,0,		1,0.3,0.5,
			0.1,0,0.1,		1,0,0.5,
			0.1,0,-0.1,		1,0.3,0.5,

			-0.1,0,0.1,		0.5,0.1,0.3,
			0,-0.15,0,		1,0.1,0.3,
			-0.1,0,-0.1,	0.5,0.1,1

		];

		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.verticies), gl.STATIC_DRAW);

		this.loc = [0.0,0.0,0.0];
		this.rot = [0.0,0.0,0.0];

	}

	render(program)
	{
		// Telling webGL which buffer 
		gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
		
		//First we bind the buffer for triangle 1. Formating the attribute to read the buffer
		var positionAttributeLocation = gl.getAttribLocation(program, "a_position");
		var size = 3;          // 2 components per iteration (position and color)
		var type = gl.FLOAT;   // the data is 32bit floats
		var normalize = false; // don't normalize the data
		var stride = 6*Float32Array.BYTES_PER_ELEMENT;	//Size in bytes of each element     // 0 = move forward size * sizeof(type) each iteration to get the next position
		var offset = 0;        // start at the beginning of the buffer
		gl.enableVertexAttribArray(positionAttributeLocation);
		gl.vertexAttribPointer(positionAttributeLocation, size, type, normalize, stride, offset);
		
		//Now we have to do this for color
		var colorAttributeLocation = gl.getAttribLocation(program,"vert_color");
		//We don't have to bind because we already have the correct buffer bound.
		size = 3;
		type = gl.FLOAT;
		normalize = false;
		stride = 6*Float32Array.BYTES_PER_ELEMENT;	//Size in bytes of each element
		offset = 3*Float32Array.BYTES_PER_ELEMENT;									//size of the offset
		gl.enableVertexAttribArray(colorAttributeLocation);
		gl.vertexAttribPointer(colorAttributeLocation, size, type, normalize, stride, offset);
		
		// Setting our state variables (uniforms) before we draw
		// We get reference of the uniforms using getUniformLocation
		var tranLoc  = gl.getUniformLocation(program,'transform');
		// uniform3floatvector
		// Now pass the objects location and translation (loc and rot) over to the uniforms.
		// If rot changes, rotation will know about it. 
		gl.uniform3fv(tranLoc,new Float32Array(this.loc));
		var thetaLoc = gl.getUniformLocation(program,'rotation');
		gl.uniform3fv(thetaLoc,new Float32Array(this.rot));

		var primitiveType = gl.TRIANGLES;
		offset = 0;
		var count = 24;
		gl.drawArrays(primitiveType, offset, count);
	 }
}
 