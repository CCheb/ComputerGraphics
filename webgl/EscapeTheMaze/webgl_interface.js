class WebGL_Interface
{
	constructor()
	{
		this.vertexShaderSource = document.getElementById("2dVertexShader").text;
		this.fragmentShaderSource = document.getElementById("2dFragmentShader").text;
		this.vertexShader = this.createShader(gl.VERTEX_SHADER, this.vertexShaderSource);
		this.fragmenShader = this.createShader(gl.FRAGMENT_SHADER, this.fragmentShaderSource);
		//Link to program
		this.program = this.createProgram(this.vertexShader,this.fragmenShader);
		//setup our viewport
		gl.viewport(0,0, gl.canvas.width, gl.canvas.height);
		//set clear colors
		//gl.clearColor(1,1,1,1);
		gl.clear(gl.COLOR_BUFFER_BIT);	
		//gl.clear(gl.DEPTH_BUFFER_BIT);	
		//what progbram to use;
		
		//We will need this for now!
		gl.enable(gl.DEPTH_TEST);
		
		gl.useProgram(this.program);
		
		var camLoc  = gl.getUniformLocation(this.program,'worldLoc');
		gl.uniform3fv(camLoc,new Float32Array([0,0,0]));
		var worldLoc = gl.getUniformLocation(this.program,'worldRotation');
		gl.uniform3fv(worldLoc,new Float32Array([0,0,0]));
		
		var tempLoc = gl.getUniformLocation(this.program,'n');
		gl.uniform1f(tempLoc,.1); //.1
		tempLoc = gl.getUniformLocation(this.program,'f');
		gl.uniform1f(tempLoc,500);
		tempLoc = gl.getUniformLocation(this.program,'r');
		gl.uniform1f(tempLoc,.1);
		tempLoc = gl.getUniformLocation(this.program,'t');
		gl.uniform1f(tempLoc,.06);

		// Defining the aspect ratio
		var aspect = gl.getUniformLocation(this.program, 'aspect');
		var a = gl.canvas.width / gl.canvas.height;
		gl.uniform1f(aspect, a);
			
		// Defining the field of view
		var field = gl.getUniformLocation(this.program, 'fov');
		var fov = Math.tan(2.37); // ~120 degrees
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