		class WebGL_Interface
		{
			constructor()
			{
				this.vertexShaderSource = document.getElementById("2dVertexShader").text;
				this.fragmentShaderSource = document.getElementById("2dFragmentShader").text;
				// Final return will be the fully compiled shader
				this.vertexShader = this.createShader(gl.VERTEX_SHADER, this.vertexShaderSource);
				this.fragmenShader = this.createShader(gl.FRAGMENT_SHADER, this.fragmentShaderSource);
				//Link to program. To create it we need to pass it the compiled shaders
				this.program = this.createProgram(this.vertexShader,this.fragmenShader);
				//setup our viewport. Make sure it matches the canvas size
				gl.viewport(0,0, gl.canvas.width, gl.canvas.height);
				//set clear colors
				gl.clearColor(1,1,1,1);	// White
				gl.clear(gl.COLOR_BUFFER_BIT);		
				//what progbram to use;
				
				//We will need this for now! That way shapes will appear as expected
				gl.enable(gl.DEPTH_TEST);
				
				gl.useProgram(this.program);
			}
			
			createShader(type,source)
			{
				// Linking the shader source code with the type that way gl will know about it.
				var shader = gl.createShader(type);
				gl.shaderSource(shader,source);
				gl.compileShader(shader);
				var success = gl.getShaderParameter(shader,gl.COMPILE_STATUS);
				if(success)	// Always make sure to do some error checking since webGL will not let you know otherwise
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