class Transform
{
	constructor()
	{
		// Our direction vectors which follow the object rotation
		this.forward = [0,0,1];
		this.right = [1,0,0];
		this.up = [0,1,0];
	}

	doRotations(RotAngles)
	{
		// Had to change the signs of the right sine over to the bottom left sign
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
		// Make sure all vectors are being multiplied in the right order
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
	constructor(tCount) 
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
		this.transform = new Transform();
	}
	
	Move()
	{
		var tempP = [0,0,0];
		for(var i =0; i< 3;i ++)
		{
			tempP[i] = this.loc[i];
			tempP[i] += this.velocity[i];
			this.rot[i] += this.angVelocity[i];
		}
		// If any of the rotation values reach 360 degrees (6.28319~), reset back to 0 degrees
		for(var j = 0; j < 3; j++)
		{
			if(this.rot[j] >= 6.28319)
				this.rot[j] = 0;
		}
		if(!this.isTrigger)
		{
			var clear = true;
			for(var so in m.Solid)
			{
				if(m.Solid[so] != this)
				{
					if(m.CheckCollision(tempP, this.cRadX, this.cRadY, this.cRadZ, m.Solid[so].loc, m.Solid[so].cRadX, m.Solid[so].cRadY, m.Solid[so].cRadZ))
					{
						this.OnTriggerEnter(m.Solid[so])

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
				if(m.CheckCollision(tempP, this.cRadX, this.cRadY, this.cRadZ, m.Solid[so].loc, m.Solid[so].cRadX, m.Solid[so].cRadY, m.Solid[so].cRadZ))
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
					if(m.CheckCollision(tempP, this.cRadX, this.cRadY, this.cRadZ, m.Trigger[to].loc, m.Trigger[to].cRadX, m.Trigger[to].cRadY, m.Trigger[to].cRadZ))
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

	// Virtual functions that the children of GameObject might implement
	OnCollisionEnter(other){}

	OnTriggerEnter(other){}
	
	Update()
	{
		console.error(this.name +" update() is NOT IMPLEMENTED!");
	}

	Render(program)
	{
		gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
		
		//First we bind the buffer for triangle 1
		var positionAttributeLocation = gl.getAttribLocation(program, "a_position");
		var size = 3;          // 2 components per iteration
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
				
		var tranLoc  = gl.getUniformLocation(program,'transform');
		gl.uniform3fv(tranLoc,new Float32Array(this.loc));
		var thetaLoc = gl.getUniformLocation(program,'rotation');
		gl.uniform3fv(thetaLoc,new Float32Array(this.rot));
		
		
		var primitiveType = gl.TRIANGLES;
		offset = 0;
		var count = this.triangleCount;
		gl.drawArrays(primitiveType, offset, count);
	}	
}


class Player extends GameObject
{
	constructor()
	{
		super(3);
		this.buffer=gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
		this.vertices =
		[
			-.05, -.1, 0, 0,0,1,
			.05,    0, 0, 1,0,0,
			-.05, .1,  0, 0,0,1
		]	
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.vertices), gl.STATIC_DRAW);		
	}

	Update()
	{
		this.velocity = [0,0,0];
		this.angVelocity = [0,0,0];
		if("A" in m.Keys && m.Keys["A"])
		{
			this.angVelocity[2] +=.01;		//euler angles x,y,z
		}
		if("D" in m.Keys && m.Keys["D"])
		{
			this.angVelocity[2] -=.01;
		}
		this.transform.doRotations(this.rot);
		var tempF = this.transform.right;
		if("W" in m.Keys && m.Keys["W"])
		{
			for(var i =0; i < 3; i ++)
			{
				this.velocity[i] += tempF[i]*.01; 
			}
		}
		if("S" in m.Keys && m.Keys["S"])
		{
			for(var i =0; i < 3; i ++)
			{
				this.velocity[i] -= tempF[i]*.01; 
			}
		}
		this.Move();
	}
}


class Demo extends GameObject
{
	constructor()
	{
		super();


	}
	
	Update()
	{
		this.velocity = [0,0,0];
		if("A" in m.Keys && m.Keys["A"])
		{
			this.velocity[0] = -1;
		}
		if("W" in m.Keys && m.Keys["W"])
		{
			this.velocity[1] = 1;
		}
		//D 
		//S 
		console.log("THE VELOCITY IS "+this.velocity);
		
	}

	Render(program)
	{
	//This is how I draw demo!	
	}
	
}

// Added child status 
class Gem extends GameObject
 {
	 constructor()
	 {
		super(24);
		this.name = "Gem";
		
		this.buffer=gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
		//Now we want to add color to our vertices information.
		this.vertices =
		[
			//Top Front
			0,0.6,0,   1,0,0,
			0.45,0,0.45,  1,0,0,
			-0.45,0,0.45,	 1,0,0,
			 //Bottom Front
			0,-0.6,0,	0,1,0,
			0.45,0,0.45,	0,1,0,
			-0.45,0,0.45,	0,1,0,
			//Top Left
			0,0.6,0,	 0,0,1,
			-0.45,0,0.45,	 0,0,1,
			-0.45,0,-0.45, 0,0,1,
			//Top Right
			0,0.6,0,	1,1,0,
			0.45,0,0.45,	1,1,0,
			0.45,0,-0.45,	1,1,0,
			//Top rear
			0,0.6,0,		0,1,1,
			0.45,0,-0.45,		0,1,1,
			-0.45,0,-0.45,	0,1,1,

			-0.45,0,-0.45,	1,0,1,
			0.45,0,-0.45,		1,0,1,
			0,-0.6,0,		1,0,1,
	
			0,-0.6,0,		1,0.3,0.5,
			0.45,0,0.45,		1,0,0.5,
			0.45,0,-0.45,		1,0.3,0.5,
	
			-0.45,0,0.45,		0.5,0.1,0.3,
			0,-0.6,0,		1,0.1,0.3,
			-0.45,0,-0.45,	0.5,0.1,1
		
		];
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.vertices), gl.STATIC_DRAW);
		this.loc = [0.0,0.0,0.0];
		this.rot = [0.0,0.0,0.0];
	 }
	 //Again this could be inherited ... but not always...not all objects
	 
	 
	 Update()
	 {
		// Enable the dorito to rotate slowly
        // random number between 0.01 and 0.5 and placing it in a random axis
        this.angVelocity[Math.floor(Math.random()*3)] = Math.random() * (0.01 - 0.009) + 0.009;
        for(let i = 0; i < 3; i++)
            this.rot[i] += this.angVelocity[i];

		this.transform.doRotations(this.rot);

        // No need to call Move() since we only want to rotate the gems
        // It will be the job of the camera to check for collisions with itself.
        //this.Move();
	 }

	 OnCollisionEnter(other)
	 {
		if(other.name == "Camera")
			console.log("Camera collided with Gem");

		console.log("Something");
	 }
 }


// Treat camera as a game object and go from there.
class Camera extends GameObject
{
	constructor()
	{
		super(0);
		this.name = "Camera";
		//this.isTrigger = true;
		// No need to model the camera itself only the object that we will see

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
			this.angVelocity[1] -=.01;		//euler angles x,y,z
		}
		if("D" in m.Keys && m.Keys["D"])
		{
			this.angVelocity[1] +=.01;
		}
		if("N" in m.Keys && m.Keys["N"])	// Look up
		{
			
			this.angVelocity[0] +=.01;
		}
		if("M" in m.Keys && m.Keys["M"])	// Look down
		{
			
			this.angVelocity[0] -=.01;
		}
		// Make sure to rotate the direction vectors by the same ammount!
		this.transform.doRotations(this.rot);
		// Want to move in the z direction which is where the camera is pointing
		var tempF = this.transform.forward;
		if("W" in m.Keys && m.Keys["W"])	// Move forward 
		{
			for(var i =0; i < 3; i ++)
			{
				this.velocity[i] += tempF[i]*.05; 
			}
		}
		if("S" in m.Keys && m.Keys["S"])	// Move backwards
		{
			for(var i =0; i < 3; i ++)
			{
				this.velocity[i] -= tempF[i]*.05; 
			}
		}
		

		// Now set the world loc and rot variables for the camera
		var wLoc = gl.getUniformLocation(m.myWEBGL.program, 'worldLoc');
		gl.uniform3fv(wLoc, new Float32Array([this.loc[0],this.loc[1],this.loc[2]]));
		var wRot = gl.getUniformLocation(m.myWEBGL.program, 'worldRotation');
		gl.uniform3fv(wRot, new Float32Array([this.rot[0],this.rot[1],this.rot[2]]));

		// Finalize update
		this.Move();
		
	}

	// No need to render since the camera has no verticies!
	Render(program)
	{

	}

	OnCollisionEnter(other)
	{
		if(other.name == "Gem")
			console.log("Gem collided with camera");
	}

	OnTriggerEnter(other)
	{
		if(other.name == "Gem")
			console.log("Gem collided with camera");
	}
}