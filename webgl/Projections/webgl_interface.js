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

		var tempLoc = gl.getUniformLocation(this.program, 'n');
		gl.uniform1f(tempLoc, 0.06);
		tempLoc = gl.getUniformLocation(this.program, 'r');
		gl.uniform1f(tempLoc,0.1);
		tempLoc = gl.getUniformLocation(this.program, 't');
		gl.uniform1f(tempLoc, 0.1);
		tempLoc = gl.getUniformLocation(this.program, 'f');
		gl.uniform1f(tempLoc, 500);
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