class WebGL_Interface
{
	constructor()
	{
		this.vertexShaderSource = document.getElementById("2dVertexShader").text;
		this.fragmentShaderSource = document.getElementById("2dFragmentShader").text;
		this.vertexShader = this.createShader(gl.VERTEX_SHADER, this.vertexShaderSource);
		this.fragmentShader = this.createShader(gl.FRAGMENT_SHADER, this.fragmentShaderSource);
		//Link to program
		this.program = this.createProgram(this.vertexShader,this.fragmentShader);
		//setup our viewport
		gl.viewport(0,0, gl.canvas.width, gl.canvas.height);
		//set clear colors
		gl.clearColor(1,1,1,1);
		gl.clear(gl.COLOR_BUFFER_BIT);		
		//what progbram to use;
		//We will need this for now!
		gl.enable(gl.DEPTH_TEST);
		gl.useProgram(this.program);

		var camLoc = gl.getUniformLocation(this.program, 'worldLoc');
		gl.uniform3fv(camLoc,new Float32Array([0,0,0]));
		var worldRot = gl.getUniformLocation(this.program, 'worldRotation');
		gl.uniform3fv(worldRot,new Float32Array([0,0,0]));

		// The near plane helps to specify the FOV
		// Think of changing the camera lense settings when playing with these values
		var tempLoc = gl.getUniformLocation(this.program, 'n');
		gl.uniform1f(tempLoc, 0.06);	// The smaller it is, the wider the FOV 0.06
		tempLoc = gl.getUniformLocation(this.program, 'r');
		gl.uniform1f(tempLoc,0.08);	// The smaller the wider
		tempLoc = gl.getUniformLocation(this.program, 't');
		gl.uniform1f(tempLoc, 0.08); // The smaller the wider
		// How far I can see in front of me
		tempLoc = gl.getUniformLocation(this.program, 'f');
		gl.uniform1f(tempLoc, 500);

		// Defining the aspect ratio
		var aspect = gl.getUniformLocation(this.program, 'aspect');
		var a = gl.canvas.width / gl.canvas.height;
		gl.uniform1f(aspect, a);

		// Defining the field of view
		var field = gl.getUniformLocation(this.program, 'fov');
		var fov = Math.tan(2.40); // ~120 degrees
		gl.uniform1f(field, fov);
	}
	createShader(type,source)
	{
		var shader = gl.createShader(type);
		gl.shaderSource(shader,source);
		gl.compileShader(shader);
		var success = gl.getShaderParameter(shader,gl.COMPILE_STATUS);
		if(success)
		{
			return shader;
		}
		//Else it didn't work
		console.error(gl.getShaderInfoLog(shader));
		gl.deleteShader(shader);
	}
	createProgram(vs,fs)
	{
		var program = gl.createProgram();
		gl.attachShader(program,vs);
		gl.attachShader(program,fs);
		gl.linkProgram(program);
		var succsess = gl.getProgramParameter(program,gl.LINK_STATUS);
		if(succsess)
		{
			return program;
		}
		console.error(gl.getProgramInfoLog(program));
		gl.deleteProgram(program);	
	}

}