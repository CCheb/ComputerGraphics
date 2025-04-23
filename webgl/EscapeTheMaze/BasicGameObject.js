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
	constructor(tCount, pType, minF, magF, ts) 
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

		// Setting the filter types for the render function
		this.minFilter = minF;
		this.magFilter = magF;
		this.tFilter = ts;
		this.sFilter = ts;

		this.isFaceCam = false;
		this.isPowerofTwo = true;
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
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, this.minFilter);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, this.magFilter);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, this.sFilter);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, this.tFilter);	
		if(this.isPowerofTwo)			
			gl.generateMipmap(gl.TEXTURE_2D);
				
		var tranLoc  = gl.getUniformLocation(program,'transform');
		gl.uniform3fv(tranLoc,new Float32Array(this.loc));
		var thetaLoc = gl.getUniformLocation(program,'rotation');
		gl.uniform3fv(thetaLoc,new Float32Array(this.rot));
	 
	 	//var ibuffer = gl.createBuffer();
	 	//gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,this.ibuffer);
	 	//gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,new Uint8Array(this.indexOrder),gl.STATIC_DRAW);
	 	//gl.drawElements(gl.TRIANGLES,this.indexOrder.length,gl.UNSIGNED_BYTE,0);

		if(this.isFaceCam)
		{
			var FaceCamLoc = gl.getUniformLocation(program,'FaceCam');
			gl.uniform1i(FaceCamLoc,true);
		}


	 	gl.drawArrays(this.primitiveType, 0, this.triangleCount);

		if(this.isFaceCam)
		{
			gl.uniform1i(FaceCamLoc,false);
		}
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
		super(4,gl.TRIANGLE_STRIP,gl.LINEAR_MIPMAP_NEAREST,gl.NEAREST,gl.REPEAT);
		this.name = "Ground";
		this.buffer=gl.createBuffer();
		
		
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
		this.image.src = `./Textures/cobble.png?cacheBust=${Date.now()}`;

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

class Bullet extends GameObject
{
	constructor()
	{
		super(4,gl.TRIANGLE_STRIP,gl.NEAREST,gl.NEAREST,gl.CLAMP_TO_EDGE);
		this.name = "Bullet";
		this.isTrigger = true;
		//this.isFaceCam = true;
		this.isPowerofTwo = false;
		this.isFromCamera = false;
		this.isFromEnemy = false;
		this.buffer = gl.createBuffer();
		this.dir = [0,0,0];

		gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
		this.vertices = 
		[
			//  X     Y  Z     s t
			// Front face
			-1,	-1,	1, 1,   1,
			1,	-1, 1, 0,   1,
			-1,  1, 1, 1,   0,
			1,	 1,  1, 0,   0,
		];

		this.MyTexture = gl.createTexture();
		gl.bindTexture(gl.TEXTURE_2D, this.MyTexture);

		//gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,16,16,0,gl.RGBA,gl.UNSIGNED_BYTE,new Uint8Array(this.picture));

		gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,1,1,0,gl.RGBA,gl.UNSIGNED_BYTE,new Uint8Array([0, 0, 255, 255]));

		this.image = new Image();
		this.image.src = "./Textures/fireball.png"

		//"./cobble.png"
		// We have to wait until the image fully loads before we can work with it
		// If we dont do this we run the chance of running into errors.
		this.image.addEventListener('load', () => {
			gl.bindTexture(gl.TEXTURE_2D, this.MyTexture);
			gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA,gl.RGBA,
				gl.UNSIGNED_BYTE, this.image);
				//gl.generateMipmap(gl.TEXTURE_2D);
			});
	
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.vertices), gl.STATIC_DRAW);

	}

	Update()
	{
		// Update each of the velocity values of the bullet
		// by muliplying the right vector by a scalar. The vector
		// helps give direction and scaling it helps in preserving that
		// direction
		for(let i = 0; i < 3; i++)
		{ 
			if(this.isFromCamera)
				this.velocity[i] -= this.dir[i] * 0.02;	
			else
			this.velocity[i] += this.dir[i] * 0.02;
		}
		// Now update bullets movement and check for collisions
		this.Move();

	}

	OnTriggerEnter(other)
	{
		if(other.name == "Wall")
		{
			//console.log("Wall collided with Bullet");
			m.DestroyObject(this.id);
		}

		if(other.name == "Camera")
		{
			
			//console.log("Camera collided with bullet");
			if(!this.isFromCamera)
			{
				other.loc = [0,0,-3];
				other.rot = [0,1.56,0];
			}
			
		}

		if(other.name == "Enemy1" || other.name == "Enemy2" || other.name == "Enemy3")
		{
			if(!this.isFromEnemy)
			{
				if(--other.hp == 0)
					m.DestroyObject(other.id);
				
				m.DestroyObject(this.id)

			}
			

		}

		
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

		// Pressing the space bar will cause the player to shoot a bullet
		if(" " in m.Keys && m.Keys[" "])
		{
			console.log("Space works!");
			// Idea is to first check if a bullet already exists in the play area
			// if so then we dont shoot another bullet until the one that already exists
			// is destroyed first. var b helps us with this
			var b = false;
			for(var so in m.Trigger)
			{
				// Bullet object is considered to be trigger object
				if("Bullet" == m.Trigger[so].name)
				{
					b = true;
					break;
				}
			}
		
			if(!b)
			{
				// Once we can fire a bullet, we first create it, update the direction vectors
				// to the latest rotation, send that direction information over to dir and then
				// let the bullet travel in the direction that the player is pointing
				//this.transform.doRotations(this.rot);
				// Had to flip the y rotation for this one
				var bullet = m.CreateObject(2, Bullet, [this.loc[0], this.loc[1], (-1*(this.loc[2]))],[this.rot[0],-1*this.rot[1],this.rot[2]],0.2,0.2,0.2);
				var dir = this.transform.forward;
				bullet.dir[0] = -1*dir[0];
				bullet.dir[1] = -1*dir[1];
				bullet.dir[2] = dir[2];
				bullet.isFaceCam = false;
				bullet.isFromCamera = true;
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

		if(other.name == "Wall")
			console.log("Wall collided with camera");

		if(other.name == "Boundary")
			console.log("You made it to the end!");
	}

	OnTriggerEnter(other)
	{
		
	}
	
	
}

class Enemy1 extends GameObject
{
	constructor()
	{
		super(4,gl.TRIANGLE_STRIP,gl.NEAREST,gl.NEAREST,gl.CLAMP_TO_EDGE);
		this.name = "Enemy1";
		this.isTrigger = true;
		this.isFaceCam = true;
		
		this.isPowerofTwo = false;

		this.hits = 0;
		this.hp = 4;

		this.buffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);

		this.vertices =
		[
			//X 	Y 	Z   S   T
			-1,		-1,	0, 1,   1,
			1,		-1, 0, 0,   1,
			-1,      1, 0, 1,   0,
			1,		1,  0, 0,   0
		];


		this.MyTexture = gl.createTexture();
		gl.bindTexture(gl.TEXTURE_2D, this.MyTexture);
		
		
		gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,1,1,0,gl.RGBA,gl.UNSIGNED_BYTE,new Uint8Array([0, 0, 255, 255]));

		this.image = new Image();
		this.image.src = "./Textures/caco.png";

		// We have to wait until the image fully loads before we can work with it
		// If we dont do this we run the chance of running into errors.
		this.image.addEventListener('load', () => {
			gl.bindTexture(gl.TEXTURE_2D, this.MyTexture);
			gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA,
				gl.UNSIGNED_BYTE, this.image);
				//gl.generateMipmap(gl.TEXTURE_2D);
			});
	
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.vertices), gl.STATIC_DRAW);

		// For desginating the back and forth direction
		this.sign = 0;
		// enemy velocity
		this.velocity = [0,0,0.008];


		
	}

	Update()
	{
		this.Move();
		
		//console.log(this.loc);
		//console.log(this.velocity);
	}

	OnTriggerEnter(other)
	{
		if(other.name == "Wall")
		{
			//console.log("Enemy collision");
			// 0 == positive movement (right)
			if(this.sign == 0)
			{
				this.sign = 1;
			}
			else	// left movement (left)
			{
				this.sign = 0;
			}
			this.velocity = this.velocity.map(value => value * -1);
			
			
		}

		if(other.name == "Camera")
		{
			//console.log("Camera collided with enemy");
			other.loc = [0,0,-3];
			other.rot = [0,1.56,0];
			
		}
	}

}

class Enemy2 extends GameObject
{
	constructor()
	{
		super(4,gl.TRIANGLE_STRIP,gl.NEAREST,gl.NEAREST,gl.CLAMP_TO_EDGE);
		this.name = "Enemy2";
		this.isTrigger = true;
		this.isFaceCam = true;
		this.isPowerofTwo = false;

		this.hits = 0;
		this.hp = 3;

		this.buffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);

		this.vertices =
		[
			//X 	Y 	Z   S   T
			-1,		-1,	0, 1,   1,
			1,		-1, 0, 0,   1,
			-1,      1, 0, 1,   0,
			1,		1,  0, 0,   0
		];


		this.MyTexture = gl.createTexture();
		gl.bindTexture(gl.TEXTURE_2D, this.MyTexture);
		
		
		gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,1,1,0,gl.RGBA,gl.UNSIGNED_BYTE,new Uint8Array([0, 0, 255, 255]));

		this.image = new Image();
		this.image.src = "./Textures/blinky.png";

		// We have to wait until the image fully loads before we can work with it
		// If we dont do this we run the chance of running into errors.
		this.image.addEventListener('load', () => {
			gl.bindTexture(gl.TEXTURE_2D, this.MyTexture);
			gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA,
				gl.UNSIGNED_BYTE, this.image);
				//gl.generateMipmap(gl.TEXTURE_2D);
			});
	
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.vertices), gl.STATIC_DRAW);

		// For desginating the back and forth direction
		this.sign = 0;
		// enemy velocity
		this.velocity = [(Math.random() * 0.016) - 0.008,0,(Math.random() * 0.016) - 0.008];


		
	}

	Update()
	{
		this.Move();
		
		//console.log(this.loc);
		//console.log(this.velocity);
	}

	OnTriggerEnter(other)
	{
		if(other.name == "Wall")
		{
			console.log("Enemy collision");
			// 0 == positive movement (right)
			if(this.sign == 0)
			{
				this.sign = 1;
			}
			else	// left movement (left)
			{
				this.sign = 0;
			}
			
			// Generate random x and z components
			const randomX = (Math.random() * 0.016) - 0.008;
			const randomZ = (Math.random() * 0.016) - 0.008;
			
			// Calculate the magnitude (length) of the vector
			const magnitude = Math.sqrt(randomX * randomX + randomZ * randomZ);
			
			// Normalize the vector (divide each component by magnitude)
			const normalizedX = randomX / magnitude;
			const normalizedZ = randomZ / magnitude;
			
			// Set the desired speed
			const speed = 0.03; // Adjust this value to control enemy speed
			
			// Apply the speed to the normalized direction
			this.velocity = [normalizedX * speed, 0, normalizedZ * speed];
			
		}

		if(other.name == "Camera")
		{
			//console.log("Camera collided with enemy");
			other.loc = [0,0,-3];
			other.rot = [0,1.56,0];
			
		}
	}


}


class Enemy3 extends GameObject
{
	constructor()
	{
		super(4,gl.TRIANGLE_STRIP,gl.NEAREST,gl.NEAREST,gl.CLAMP_TO_EDGE);
		this.name = "Enemy2";
		this.isTrigger = true;
		this.isFaceCam = true;
		this.isPowerofTwo = false;

		this.hits = 0;
		this.hp = 2;

		this.count = 0;
		this.buffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);

		this.vertices =
		[
			//X 	Y 	Z   S   T
			-1,		-1,	0, 1,   1,
			1,		-1, 0, 0,   1,
			-1,      1, 0, 1,   0,
			1,		1,  0, 0,   0
		];


		this.MyTexture = gl.createTexture();
		gl.bindTexture(gl.TEXTURE_2D, this.MyTexture);
		
		
		gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,1,1,0,gl.RGBA,gl.UNSIGNED_BYTE,new Uint8Array([0, 0, 255, 255]));

		this.image = new Image();
		this.image.src = "./Textures/imp.png";

		// We have to wait until the image fully loads before we can work with it
		// If we dont do this we run the chance of running into errors.
		this.image.addEventListener('load', () => {
			gl.bindTexture(gl.TEXTURE_2D, this.MyTexture);
			gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA,
				gl.UNSIGNED_BYTE, this.image);
				//gl.generateMipmap(gl.TEXTURE_2D);
			});
	
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.vertices), gl.STATIC_DRAW);

		// For desginating the back and forth direction
		this.sign = 0;
		// enemy velocity
		this.velocity = [(Math.random() * 0.016) - 0.008,0,(Math.random() * 0.016) - 0.008];


		
	}

	Update()
	{
		this.count++;

		if(this.count == 200)
		{

			var camX = m.Camera.loc[0];
			var camZ = m.Camera.loc[2];

			var enemyX = this.loc[0];
			var enemyZ = this.loc[2];

			var enemyCamVec = [camX-enemyX,0,camZ+enemyZ];
			var magnitude = Math.sqrt(enemyCamVec[0]*enemyCamVec[0] + enemyCamVec[2]*enemyCamVec[2]);

			var normalizedX = enemyCamVec[0] / magnitude;
			var normalizedZ = enemyCamVec[2] / magnitude;

			var bullet = m.CreateObject(2, Bullet, [this.loc[0], this.loc[1], this.loc[2]],[0,0,0],0.2,0.2,0.2);
			
			bullet.dir[0] = normalizedX;
			bullet.dir[1] = 0;
			bullet.dir[2] = -1*normalizedZ;
			bullet.isFaceCam = true;
			bullet.isFromEnemy = true;

			this.count = 0;
		}


		this.Move();
		//console.log(this.loc);
		//console.log(this.velocity);
	}

	OnTriggerEnter(other)
	{
		if(other.name == "Wall")
		{
			console.log("Enemy collision");
			// 0 == positive movement (right)
			if(this.sign == 0)
			{
				this.sign = 1;
			}
			else	// left movement (left)
			{
				this.sign = 0;
			}
			
			// Generate random x and z components
			const randomX = (Math.random() * 0.016) - 0.008;
			const randomZ = (Math.random() * 0.016) - 0.008;
			
			// Calculate the magnitude (length) of the vector
			const magnitude = Math.sqrt(randomX * randomX + randomZ * randomZ);
			
			// Normalize the vector (divide each component by magnitude)
			const normalizedX = randomX / magnitude;
			const normalizedZ = randomZ / magnitude;
			
			// Set the desired speed
			const speed = 0.03; // Adjust this value to control enemy speed
			
			// Apply the speed to the normalized direction
			this.velocity = [normalizedX * speed, 0, normalizedZ * speed];
			
		}

		if(other.name == "Camera")
		{
			//console.log("Camera collided with enemy");
			other.loc = [0,0,-3];
			other.rot = [0,1.56,0];
			
		}
	}

}

class Wall extends GameObject
{
	constructor()
	{
		super(16,gl.TRIANGLE_STRIP,gl.NEAREST,gl.NEAREST,gl.CLAMP_TO_EDGE);
		this.name = "Wall";
		this.isPowerofTwo = false;
		this.loc = [0,0,0];
		this.rot = [0,0,0];

		this.buffer=gl.createBuffer();
		
		
		gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
		this.vertices =
		[//  X     Y  Z     s t
			// Front face
			-1,	-1,	1, 1,   1,
			1,	-1, 1, 0,   1,
			-1,  1, 1, 1,   0,
			1,	 1,  1, 0,   0,

			-1, -1, -1,   0, 0,  // v0 (bottom back)
			-1, -1,  1,   1, 0,  // v1 (bottom front)
			-1,  1, -1,   0, 1,  // v2 (top back)
			-1,  1,  1,   1, 1,  // v3 (top front)

			// Right face (x = 1)
			1, -1,  1,   0, 0,  // v0 (bottom front)
			1, -1, -1,   1, 0,  // v1 (bottom back)
			1,  1,  1,   0, 1,  // v2 (top front)
			1,  1, -1,   1, 1,   // v3 (top back)

			// Back face (z = -1)
 			1, -1, -1,   0, 0,  // v0 (bottom right)
 			-1, -1, -1,   1, 0,  // v1 (bottom left)
 			 1,  1, -1,   0, 1,  // v2 (top right)
 			-1,  1, -1,   1, 1   // v3 (top left)
 

		];

		

		this.MyTexture = gl.createTexture();
		gl.bindTexture(gl.TEXTURE_2D, this.MyTexture);

		//gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,16,16,0,gl.RGBA,gl.UNSIGNED_BYTE,new Uint8Array(this.picture));

		gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,1,1,0,gl.RGBA,gl.UNSIGNED_BYTE,new Uint8Array([0, 0, 255, 255]));

		this.image = new Image();
		this.image.src = "./Textures/brick.png"

		this.image2 = new Image();
		this.image2.src = "./Textures/cobbleWall.png";


		// Choosing a random image from a pool of two images
		var imageSelection = Math.floor(Math.random() * 2) + 1;
		//"./cobble.png"
		// We have to wait until the image fully loads before we can work with it
		// If we dont do this we run the chance of running into errors.
		if(imageSelection == 2)
		{
			this.image.addEventListener('load', () => {
				gl.bindTexture(gl.TEXTURE_2D, this.MyTexture);
				gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA,gl.RGBA,
					gl.UNSIGNED_BYTE, this.image);
					//gl.generateMipmap(gl.TEXTURE_2D);
				});

		}
		else
		{
			this.image.addEventListener('load', () => {
				gl.bindTexture(gl.TEXTURE_2D, this.MyTexture);
				gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA,gl.RGBA,
					gl.UNSIGNED_BYTE, this.image2);
					//gl.generateMipmap(gl.TEXTURE_2D);
				});

		}
		
	
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.vertices), gl.STATIC_DRAW);

	}

	Update()
	{
		// Nothing
	}

}

class Boundary extends GameObject
{
	constructor()
	{
		super(4,gl.TRIANGLE_STRIP,gl.NEAREST,gl.NEAREST,gl.CLAMP_TO_EDGE);
		this.name = "Boundary";
		
		this.loc = [0,0,0];
		this.rot = [0,0,0];
	}

	Update()
	{
		
	}

	Render(program)
	{
		// Nothing

	}
}

class Torch extends GameObject
{
	constructor()
	{
		super(4,gl.TRIANGLE_STRIP,gl.NEAREST,gl.NEAREST,gl.CLAMP_TO_EDGE);
		this.name = "Torch";
		this.isFaceCam = true;
		this.isPowerofTwo = false;
		this.buffer=gl.createBuffer();
		//this.colorBuffer = gl.createBuffer();
		
		gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);

		this.vertices = 
		[
			//X 	Y 	Z   S   T
			-1,		-1,	0, 1,   1,
			1,		-1, 0, 0,   1,
			-1,      1, 0, 1,   0,
			1,		1,  0, 0,   0
		];


		this.MyTexture = gl.createTexture();
		gl.bindTexture(gl.TEXTURE_2D, this.MyTexture);
		
		
		gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,1,1,0,gl.RGBA,gl.UNSIGNED_BYTE,new Uint8Array([0, 0, 255, 255]));

		this.image = new Image();
		this.image.src = "./Textures/torch.png";

		// We have to wait until the image fully loads before we can work with it
		// If we dont do this we run the chance of running into errors.
		this.image.addEventListener('load', () => {
			gl.bindTexture(gl.TEXTURE_2D, this.MyTexture);
			gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA,
				gl.UNSIGNED_BYTE, this.image);
				//gl.generateMipmap(gl.TEXTURE_2D);
			});
		
		
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.vertices), gl.STATIC_DRAW);

	}
	
	Update()
	{
		//Nothing
	}
}

class Quad extends GameObject
{
	constructor()
	{
		super(4,gl.TRIANGLE_STRIP,gl.NEAREST,gl.NEAREST,gl.CLAMP_TO_EDGE);
		this.name = "Quad";
		this.isFaceCam = true;
		this.isPowerofTwo = false;
		this.buffer=gl.createBuffer();
		this.count = 0;

		
		gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);

		//Get vertices from announcements
		this.vertices =
		[
			//X 	Y 	Z   S   T
			-1,		-1,	0, 1,   1,
			1,		-1, 0, 0,   1,
			-1,      1, 0, 1,   0,
			1,		1,  0, 0,   0
		];
		
		this.MyTexture = gl.createTexture();
		gl.bindTexture(gl.TEXTURE_2D, this.MyTexture);
		
		
		gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,1,1,0,gl.RGBA,gl.UNSIGNED_BYTE,new Uint8Array([0, 0, 255, 255]));

		this.image = new Image();
		this.image.src = "./Textures/blinky.png";

		// We have to wait until the image fully loads before we can work with it
		// If we dont do this we run the chance of running into errors.
		this.image.addEventListener('load', () => {
			gl.bindTexture(gl.TEXTURE_2D, this.MyTexture);
			gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA,
				gl.UNSIGNED_BYTE, this.image);
				//gl.generateMipmap(gl.TEXTURE_2D);
			});
		
		/*
		this.image2 = new Image();
		this.image2.src = "./Textures/pistol2.png";

		this.image3 = new Image();
		this.image3.src = "./Textures/pistol3.png";

		this.image4 = new Image();
		this.image4.src = "./Textures/pistol4.png";
		//!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
		*/
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.vertices), gl.STATIC_DRAW);
		this.loc=[0,0,0];
		this.rot=[0,0,0];
	}

	Update()
	{
		/*
		this.count++;

		if(this.count == 15)
		{
			gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA,
				gl.UNSIGNED_BYTE, this.image2);
		}
		if(this.count == 30)
		{
			gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA,
				gl.UNSIGNED_BYTE, this.image3);


		}
		if(this.count == 45)
		{
			gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA,
				gl.UNSIGNED_BYTE, this.image4);

			
		}
		if(this.count == 60)
		{
			gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA,
				gl.UNSIGNED_BYTE, this.image);

			this.count = 0;
		}
			*/
		//this.Move();
	}
}

