class Transform
{
	constructor()
	{
		this.forward = [0,0,1];
		this.right = [1,0,0];
		this.up = [0,1,0];
	}

	doRotations(RotAngles)
	{
		this.xRot = [
					[1,0,0,0],
					[0,Math.cos(RotAngles[0]),Math.sin(RotAngles[0]),0],
					[0,-1*Math.sin(RotAngles[0]),Math.cos(RotAngles[0]),0],
					[0,0,0,1]
				];		
		this.yRot = [
				[Math.cos(RotAngles[1]),0,Math.sin(RotAngles[1]),0],
				[0,1,0,0],
				[-1*Math.sin(RotAngles[1]),0,Math.cos(RotAngles[1]),0],
				[0,0,0,1]	
				];
		this.zRot = [
					[Math.cos(RotAngles[2]),Math.sin(RotAngles[2]),0,0],
					[-1*Math.sin(RotAngles[2]),Math.cos(RotAngles[2]),0,0],
					[0,0,1,0],
					[0,0,0,1]
				]
		//this.forward = this.crossMultiply(xRot,[0,0,1,0]);		
		this.forward = this.crossMultiply(this.zRot,this.crossMultiply(this.yRot,this.crossMultiply(this.xRot,[0,0,1,0])))
		this.right = this.crossMultiply(this.zRot,this.crossMultiply(this.yRot,this.crossMultiply(this.xRot,[1,0,0,0])))
		this.up = this.crossMultiply(this.zRot,this.crossMultiply(this.yRot,this.crossMultiply(this.xRot,[0,1,0,0])))
	}			
	crossMultiply(M,V)
	{
		//console.log(M[0][3]);
		//console.log(V[3]);
		var temp = [
					M[0][0]*V[0]+M[0][1]*V[1]+M[0][2] * V[2]+ M[0][3]*V[3],
					M[1][0]*V[0]+M[1][1]*V[1]+M[1][2] * V[2]+ M[1][3]*V[3],
					M[2][0]*V[0]+M[2][1]*V[1]+M[2][2] * V[2]+ M[2][3]*V[3],
					M[3][0]*V[0]+M[3][1]*V[1]+M[3][2] * V[2]+ M[3][3]*V[3]
					]
		//console.log(temp);
		return temp;
	}
	
}


class GameObject
{
	constructor(tCount, pType) 
	{
		this.loc = [0,0,0];
		this.rot = [0,0,0];
		this.isTrigger = false;
		this.cRadX = 1.0;
		this.cRadY = 1.0;
		this.cRadZ = 1.0;
		this.velocity = [0,0,0];
		this.angVelocity = [0,0,0];
		this.name = "default";
		this.id = 0;
		this.prefab;
		
		this.triangleCount = tCount;
		this.primitiveType = pType;
		this.transform = new Transform();
	}
	
	Move()
	{
		var tempP = [0,0,0];
		for(var i =0; i < 3;i ++)
		{
			tempP[i] = this.loc[i];
			tempP[i] += this.velocity[i];
			this.rot[i] += this.angVelocity[i];
		}
		// If any of the rotation values reach 360 degrees (6.28319~), reset back to 0 degrees
		if(!this.isTrigger)
		{
			var clear = true;
			for(var so in m.Solid)
			{
				if(m.Solid[so] != this)
				{
					if(m.CheckCollision(this.name,tempP, this.cRadX, this.cRadY, this.cRadZ, m.Solid[so].name, m.Solid[so].loc, m.Solid[so].cRadX, m.Solid[so].cRadY, m.Solid[so].cRadZ))
					{
						this.OnCollisionEnter(m.Solid[so])
					
						try
						{
							m.Solid[so].OnCollisionEnter(this);
						}
						catch{}
					
						clear = false;
					}
				}
			} 
			if(clear)
			{
				this.loc = tempP;
			}
		}
		else
		{  
			this.loc = tempP;
			// Check the trigger object against any solid objects
			for(var so in m.Solid)
			{
				// If we already collided with the solid object earlier and it has a OnTriggerEnter then
				// we can simply store it and use it here
				if(m.CheckCollision(this.name,tempP, this.cRadX, this.cRadY, this.cRadZ, m.Solid[so].name, m.Solid[so].loc, m.Solid[so].cRadX, m.Solid[so].cRadY, m.Solid[so].cRadZ))
				{
					// If there is a detected collision then call the TriggerEnter function from the
					// object thats listening for collisions, in this case the trigger object
					this.OnTriggerEnter(m.Solid[so]);
					try
					{
						m.Solid[so].OnTriggerEnter(this);
					}
					catch
					{}
				}
			
			}
			// Now check trigger with trigger just in case
			for(var to in m.Trigger)
			{ 	//this should be correct. It is trying to check for trigger objects insted of solid objects
				if(this != m.Trigger[to]){
					if(m.CheckCollision(this.name,tempP, this.cRadX, this.cRadY, this.cRadZ, m.Trigger[to].name, m.Trigger[to].loc, m.Trigger[to].cRadX, m.Trigger[to].cRadY, m.Trigger[to].cRadZ))
					{
						this.OnTriggerEnter(m.Trigger[to]);
						try
						{
							m.Trigger[to].OnTriggerEnter(this);
						}
						catch
						{}
					}
				}
			}
		}
	}

	OnCollisionEnter(other){}

	OnTriggerEnter(other){}
	

	Render(program)
	{
		var uTextureLocation = gl.getUniformLocation(program, 'sampler');
		gl.activeTexture(gl.TEXTURE0);
		gl.bindTexture(gl.TEXTURE_2D, this.MyTexture);
		gl.uniform1i(uTextureLocation, 0);

		var positionAttributeLocation = gl.getAttribLocation(program, "a_position");
		gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
		var size = 3;          // 2 components per iteration
		var type = gl.FLOAT;   // the data is 32bit floats
		var normalize = false; // don't normalize the data
		var stride = 5*Float32Array.BYTES_PER_ELEMENT;	//Size in bytes of each element     // 0 = move forward size * sizeof(type) each iteration to get the next position
		var offset = 0;        // start at the beginning of the buffer
		gl.enableVertexAttribArray(positionAttributeLocation);
		gl.vertexAttribPointer(positionAttributeLocation, size, type, normalize, stride, offset);
		
		//Now we have to do this for color
		var TexAttributeLocation = gl.getAttribLocation(program,"a_texcoord");
		//We don't have to bind because we already have the correct buffer bound.
		size = 2;
		type = gl.FLOAT;
		normalize = false;
		stride = 5*Float32Array.BYTES_PER_ELEMENT;	//Size in bytes of each element
		offset = 3*Float32Array.BYTES_PER_ELEMENT;									//size of the offset
		gl.enableVertexAttribArray(TexAttributeLocation);
		gl.vertexAttribPointer(TexAttributeLocation, size, type, normalize, stride, offset);

		gl.bindTexture(gl.TEXTURE_2D, this.MyTexture);
		//setup S
		 //gl.MIRRORED_REPEAT//gl.CLAMP_TO_EDGE
		//Sets up our T
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);				
		gl.generateMipmap(gl.TEXTURE_2D);
				
		var tranLoc  = gl.getUniformLocation(program,'transform');
		gl.uniform3fv(tranLoc,new Float32Array(this.loc));
		var thetaLoc = gl.getUniformLocation(program,'rotation');
		gl.uniform3fv(thetaLoc,new Float32Array(this.rot));
	 
	 	//var ibuffer = gl.createBuffer();
	 	//gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,this.ibuffer);
	 	//gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,new Uint8Array(this.indexOrder),gl.STATIC_DRAW);
	 	//gl.drawElements(gl.TRIANGLES,this.indexOrder.length,gl.UNSIGNED_BYTE,0);
	 	gl.drawArrays(this.primitiveType, 0, this.triangleCount);
	}

	Update()
	{
		console.error(this.name +" update() is NOT IMPLEMENTED!");
	}
	
}


class Ground extends GameObject
{
	constructor()
	{
		super(4, gl.TRIANGLE_STRIP);
		this.name = "Ground";
		this.buffer=gl.createBuffer();
		
		this.picture = CreateCheckered();
		
		gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
		this.vertices =
		[//  X     Y  Z     s t
			-1000,0,-1000,  0,0,
			1000,0, -1000,  1000,0,
			-1000,0,1000,   0,1000,
			1000, 0,1000,   1000,1000
		];

		

		this.MyTexture = gl.createTexture();
		gl.bindTexture(gl.TEXTURE_2D, this.MyTexture);

		//gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,16,16,0,gl.RGBA,gl.UNSIGNED_BYTE,new Uint8Array(this.picture));

		gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,1,1,0,gl.RGBA,gl.UNSIGNED_BYTE,new Uint8Array([0, 0, 255, 255]));

		this.image = new Image();
		this.image.src = "./stone.png";

		// We have to wait until the image fully loads before we can work with it
		// If we dont do this we run the chance of running into errors.
		this.image.addEventListener('load', () => {
			gl.bindTexture(gl.TEXTURE_2D, this.MyTexture);
			gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA,gl.RGBA,
				gl.UNSIGNED_BYTE, this.image);
				//gl.generateMipmap(gl.TEXTURE_2D);
			});
	
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.vertices), gl.STATIC_DRAW);
		this.loc=[0,0,0];
		this.rot=[0,0,0];
	}
	Update()
	{
		//Do Nothing
	}
	
}


class Camera extends GameObject
{
	constructor()
	{
		super(0, gl.TRIANGLES);
		this.name = "Camera";
		this.loc = [0,0,0];
		this.rot = [0,0,0];



		

		

		

			
	}
	Update()
	{
		// All of this is from the Player update
		this.velocity = [0,0,0];
		this.angVelocity = [0,0,0];
		if("A" in m.Keys && m.Keys["A"])
		{
			// 1 == rotate y
			// If we want to rotate the camera to move
			// right then i have to rotate the entire world to the
			// left. So in this case we make sure to rotate counter-clockwise
			this.angVelocity[1] -=.02;		//euler angles x,y,z
		}
		if("D" in m.Keys && m.Keys["D"])
		{
			// Movign the world 
			// Same idea of roation applies here! In this case to rotate the camera
			// left, we make suere to rotate the world to the right (clock-wise)
			this.angVelocity[1] +=.02;
		}
		
		// Make sure to rotate the direction vectors by the same ammount!
		this.transform.doRotations(this.rot);
		// Want to move in the z direction which is where the camera is pointing
		var tempF = this.transform.forward;
		if("W" in m.Keys && m.Keys["W"])	// Move forward 
		{
			for(var i =0; i < 3; i++)
			{
				this.velocity[i] += tempF[i]*.1; 
			}
		}
		if("S" in m.Keys && m.Keys["S"])	// Move backwards
		{
			for(var i =0; i < 3; i++)
			{
				this.velocity[i] -= tempF[i]*.1; 
			}
		}

		this.Move();
	}
	Render(program)
	{







		var camLoc  = gl.getUniformLocation(program,'worldLoc');
		gl.uniform3fv(camLoc,new Float32Array(this.loc));
		var worldLoc = gl.getUniformLocation(program,'worldRotation');
		gl.uniform3fv(worldLoc,new Float32Array(this.rot));
	}

	OnCollisionEnter(other)
	{
		if(other.name == "Hex")
			console.log("Hex collided with camera");

		if(other.name == "Boundary")
			console.log("Boundary collided with camera");
	}

	OnTriggerEnter(other)
	{
		if(other.name == "Hitbox")
			console.log("Hitbox collided with Camera");
	}
	
	
}

class Boundary extends GameObject
{
	constructor()
	{
		super(0,gl.TRIANGLES);
		this.name = "Boundary";
		this.loc = [0,0,0];
		this.rot = [0,0,0];
	}

	Update()
	{
		// Nothing
	}

	Render(program)
	{
		// Nothing

	}
}

