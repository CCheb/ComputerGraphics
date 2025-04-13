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

		var positionAttributeLocation = gl.getAttribLocation(program, "a_position");
		gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
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
		this.colorBuffer = gl.createBuffer();
		
		gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
		this.vertices =
		[
			-1000,0,-1000,0,1,0,
			1000,0, -1000,0,1,0,
			-1000,0,1000,0,1,0,
			1000, 0,1000,0,1,0
			
		];
	
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.vertices), gl.STATIC_DRAW);
		this.loc=[0,0,0];
		this.rot=[0,0,0];
	}
	Update()
	{
		//Do Nothing
	}
	
}


class Hex extends GameObject
{
	constructor()
	{
		//18
		super(150, gl.TRIANGLE_STRIP);
		this.name = "Hex";
		this.angVelocity = [0,.025,0];
		//this.isTrigger = false;
		this.buffer=gl.createBuffer();
		//this.colorBuffer = gl.createBuffer();
		
		gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
		this.vertices =
		[
			// Tree trunk
			-.5,-.5,-.25,.54,.27,.07,
			-.5, 1.5,-.25,.54,.27,.07,
			-.25,-.5,-.5,.54,.27,.07,
			-.25, 1.5,-.5,.54,.27,.07,
			.25,-.5,-.5,.54,.27,.07,
			.25,1.5,-.5,.54,.27,.07,
			.5,-.5,-.25,.54,.27,.07,
			.5, 1.5,-.25,.54,.27,.07,
			.5,-.5,.25,.54,.27,.07,
			.5, 1.5,.25,.54,.27,.07,
			.25,-.5,.5,.54,.27,.07,
			.25, 1.5,.5,.54,.27,.07,
			-.25,-.5,.5,.54,.27,.07,
			-.25, 1.5,.5,.54,.27,.07,
			-.5,-.5,.25,.54,.27,.07,
			-.5, 1.5,.25,.54,.27,.07,
			-.5, -.5,-.25,.54,.27,.07,
			-.5, 1.5,-.25,.54,.27,.07,







			// Bush section
			// 0.9
			0.7,2.4,0.7, 0.0,1.0,0.0, // a
			-0.7,2.4,-0.7, 0.0,1.0,0.0, // b
			-0.7,2.4,0.7, 0.0,1.0,0.0, // c
			0.7,2.4,0.7, 0.0,1.0,0.0, // d
			-0.7,2.4,-0.7, 0.0,1.0,0.0, // g
			0.7,2.4,-0.7, 0.0,1.0,0.0, // v

			0.4,2.0,1.1, 0.0,1.0,0.0, // a1
			0.9,2.0,0.9, 0.0,1.0,0.0, // b1
			0.7,2.4,0.7, 0.0,1.0,0.0, // d

			0.4,2.0,1.1, 0.0,1.0,0.0,  // a1
			0.7,2.4,0.7, 0.0,1.0,0.0,  // d
			-0.7,2.4,0.7, 0.0,1.0,0.0, // c

			-0.9,2.0,0.9, 0.0,1.0,0.0, // c1
			0.4,2.0,1.1, 0.0,1.0,0.0, // a1
			-0.7,2.4,0.7, 0.0,1.0,0.0, // c

			//15
			-1.1,2.0,0.4 , 0.0,1.0,0.0, // a2
			-0.9,2.0,0.9, 0.0,1.0,0.0, // c1
			-0.7,2.4,0.7, 0.0,1.0,0.0, // c

			//18
			-1.1,2.0,0.4, 0.0,1.0,0.0, // a2
			-0.7,2.4,0.7, 0.0,1.0,0.0, // c
			-0.7,2.4,-0.7, 0.0,1.0,0.0, // b

			//21
			-0.9,2.0,-0.9, 0.0,1.0,0.0, // b2
			-1.1,2.0,0.4 , 0.0,1.0,0.0, // a2
			-0.7,2.4,-0.7, 0.0,1.0,0.0, // g

			//23
			0.4,2.0,-1.1, 0.0,1.0,0.0, // a3
			-0.9,2.0,-0.9, 0.0,1.0,0.0, // b2
			-0.7,2.4,-0.7, 0.0,1.0,0.0, // g

			//26
			0.4,2.0,-1.1, 0.0,1.0,0.0, // a3
			-0.7,2.4,-0.7, 0.0,1.0,0.0, // g
			0.7,2.4,-0.7, 0.0,1.0,0.0, // v

			//29
			0.9,2.0,-0.9, 0.0,1.0,0.0, // b3
			0.4,2.0,-1.1, 0.0,1.0,0.0, // a3
			0.7,2.4,-0.7, 0.0,1.0,0.0, // v

			//32
			1.1,2.0,0.4, 0.0,1.0,0.0, // a4
			0.9,2.0,-0.9, 0.0,1.0,0.0, // b3
			0.7,2.4,-0.7, 0.0,1.0,0.0, // v

			//35
			1.1,2.0,0.4, 0.0,1.0,0.0, // a4
			0.7,2.4,-0.7, 0.0,1.0,0.0, // v
			0.7,2.4,0.7, 0.0,1.0,0.0, // d

			//42 // mid top
			0.9,2.0,0.9, 0.0,1.0,0.0, // b1
			1.1,2.0,0.4, 0.0,1.0,0.0, // a4
			0.7,2.4,0.7, 0.0,1.0,0.0, // d

			//45
			1.1,2.0,0.4, 0.0,1.0,0.0, // a4
			0.9,2.0,0.9, 0.0,1.0,0.0, // b1
			0.9,1.7,0.9, 0.0,1.0,0.0, // a5

			//48
			1.1,2.0,0.4, 0.0,1.0,0.0, // a4
			0.9,1.7,0.9, 0.0,1.0,0.0, // a5
			1.1,1.7,0.4, 0.0,1.0,0.0, // b5

			//51
			0.9,2.0,-0.9, 0.0,1.0,0.0, // b3
			1.1,2.0,0.4, 0.0,1.0,0.0, // a4
			1.1,1.7,0.4, 0.0,1.0,0.0, // b5

			//54
			0.9,2.0,-0.9, 0.0,1.0,0.0, // b3
			1.1,1.7,0.4, 0.0,1.0,0.0, // b5
			0.9,1.7,-0.9, 0.0,1.0,0.0, // a6

			//57
			0.4,2.0,-1.1, 0.0,1.0,0.0, // a3
			0.9,2.0,-0.9, 0.0,1.0,0.0, // b3
			0.9,1.7,-0.9, 0.0,1.0,0.0, // a6

			//60
			0.4,2.0,-1.1, 0.0,1.0,0.0, // a3
			0.9,1.7,-0.9, 0.0,1.0,0.0, // a6
			0.4,1.7,-1.1, 0.0,1.0,0.0, // b6

			-0.9,2.0,-0.9, 0.0,1.0,0.0, // b2
			0.4,2.0,-1.1, 0.0,1.0,0.0, // a3
			0.4,1.7,-1.1, 0.0,1.0,0.0, // b6

			-0.9,2.0,-0.9, 0.0,1.0,0.0, // b2
			0.4,1.7,-1.1, 0.0,1.0,0.0, // b6
			-0.9,1.7,-0.9, 0.0,1.0,0.0, // a7

			//69
			-1.1,2.0,0.4 , 0.0,1.0,0.0, // a2
			-0.9,2.0,-0.9, 0.0,1.0,0.0, // b2
			-0.9,1.7,-0.9, 0.0,1.0,0.0, // a7

			//72
			-1.1,2.0,0.4 , 0.0,1.0,0.0, // a2
			-0.9,1.7,-0.9, 0.0,1.0,0.0, // a7
			-1.1,1.7,0.4, 0.0,1.0,0.0, // a8

			//75
			-0.9,2.0,0.9, 0.0,1.0,0.0, // c1
			-1.1,2.0,0.4 , 0.0,1.0,0.0, // a2
			-1.1,1.7,0.4, 0.0,1.0,0.0, // a8

			//78
			-0.9,2.0,0.9, 0.0,1.0,0.0, // c1
			-1.1,1.7,0.4, 0.0,1.0,0.0, // a8
			-0.9,1.7,0.9, 0.0,1.0,0.0, // b8

			//80
			0.4,2.0,1.1, 0.0,1.0,0.0, // a1
			-0.9,2.0,0.9, 0.0,1.0,0.0, // c1
			-0.9,1.7,0.9, 0.0,1.0,0.0, // b8

			//83
			0.4,2.0,1.1, 0.0,1.0,0.0, // a1
			-0.9,1.7,0.9, 0.0,1.0,0.0, // b8
			0.4,1.7,1.1, 0.0,1.0,0.0, // a9

			//86
			0.9,2.0,0.9, 0.0,1.0,0.0, // b1
			0.4,2.0,1.1, 0.0,1.0,0.0, // a1
			0.4,1.7,1.1, 0.0,1.0,0.0, // a9

			//90
			0.9,2.0,0.9, 0.0,1.0,0.0, // b1
			0.4,1.7,1.1, 0.0,1.0,0.0, // a9
			0.9,1.7,0.9, 0.0,1.0,0.0, // a5


			// Bottom cap


			0.7,1.4,0.7, 0.0,1.0,0.0, // a
			-0.7,1.4,-0.7, 0.0,1.0,0.0, // b
			-0.7,1.4,0.7, 0.0,1.0,0.0, // c
			0.7,1.4,0.7, 0.0,1.0,0.0, // d
			-0.7,1.4,-0.7, 0.0,1.0,0.0, // g
			0.7,1.4,-0.7, 0.0,1.0,0.0, // v




			0.4,1.7,1.1, 0.0,1.0,0.0, // a1
			0.9,1.7,0.9, 0.0,1.0,0.0, // b1
			0.7,1.4,0.7, 0.0,1.0,0.0, // d

			0.4,1.7,1.1, 0.0,1.0,0.0,  // a1
			0.7,1.4,0.7, 0.0,1.0,0.0,  // d
			-0.7,1.4,0.7, 0.0,1.0,0.0, // c

			//99
			-0.9,1.7,0.9, 0.0,1.0,0.0, // c1
			0.4,1.7,1.1, 0.0,1.0,0.0, // a1
			-0.7,1.4,0.7, 0.0,1.0,0.0, // c

			//102
			//-0.7
			-1.1,1.7,0.4 , 0.0,1.0,0.0, // a2
			-0.9,1.7,0.9, 0.0,1.0,0.0, // c1
			-0.7,1.4,0.7, 0.0,1.0,0.0, // c

			//105
			-1.1,1.7,0.4, 0.0,1.0,0.0, // a2
			-0.7,1.4,0.7, 0.0,1.0,0.0, // c
			-0.7,1.4,-0.7, 0.0,1.0,0.0, // b

			//108
			-0.9,1.7,-0.9, 0.0,1.0,0.0, // b2
			-1.1,1.7,0.4 , 0.0,1.0,0.0, // a2
			-0.7,1.4,-0.7, 0.0,1.0,0.0, // g

			//101
			0.4,1.7,-1.1, 0.0,1.0,0.0, // a3
			-0.9,1.7,-0.9, 0.0,1.0,0.0, // b2
			-0.7,1.4,-0.7, 0.0,1.0,0.0, // g

			//104
			0.4,1.7,-1.1, 0.0,1.0,0.0, // a3
			-0.7,1.4,-0.7, 0.0,1.0,0.0, // g
			0.7,1.4,-0.7, 0.0,1.0,0.0, // v

			//107
			0.9,1.7,-0.9, 0.0,1.0,0.0, // b3
			0.4,1.7,-1.1, 0.0,1.0,0.0, // a3
			0.7,1.4,-0.7, 0.0,1.0,0.0, // v

			//110
			1.1,1.7,0.4, 0.0,1.0,0.0, // a4
			0.9,1.7,-0.9, 0.0,1.0,0.0, // b3
			0.7,1.4,-0.4, 0.0,1.0,0.0, // v

			//113
			1.1,1.7,0.4, 0.0,1.0,0.0, // a4
			0.7,1.4,-0.7, 0.0,1.0,0.0, // v
			0.7,1.4,0.7, 0.0,1.0,0.0, // d

			//116
			0.9,1.7,0.9, 0.0,1.0,0.0, // b1
			1.1,1.7,0.4, 0.0,1.0,0.0, // a4
			0.7,1.4,0.7, 0.0,1.0,0.0 // d



		];
	
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.vertices), gl.STATIC_DRAW);
		this.loc=[0,0,0];
		this.rot=[0,0,0];
	}
	Update()
	{
		//this.rot[1] += this.angVelocity[1];
	}
	
}

class Bush extends GameObject
{
	constructor()
	{
		// 132 for the whole
		// 90 without the bottom cap 
		super(132, gl.TRIANGLES);
		this.name = "Bush";
		this.angVelocity = [0,0,0];
		//this.isTrigger = false;
		this.buffer=gl.createBuffer();
		//this.colorBuffer = gl.createBuffer();
		
		gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
		this.vertices =
		[
			0.7,0.9,0.7, 0.0,1.0,0.0, // a
			-0.7,0.9,-0.7, 0.0,1.0,0.0, // b
			-0.7,0.9,0.7, 0.0,1.0,0.0, // c
			0.7,0.9,0.7, 0.0,1.0,0.0, // d
			-0.7,0.9,-0.7, 0.0,1.0,0.0, // g
			0.7,0.9,-0.7, 0.0,1.0,0.0, // v

			0.4,0.5,1.1, 0.0,1.0,0.0, // a1
			0.9,0.5,0.9, 0.0,1.0,0.0, // b1
			0.7,0.9,0.7, 0.0,1.0,0.0, // d

			0.4,0.5,1.1, 0.0,1.0,0.0,  // a1
			0.7,0.9,0.7, 0.0,1.0,0.0,  // d
			-0.7,0.9,0.7, 0.0,1.0,0.0, // c

			-0.9,0.5,0.9, 0.0,1.0,0.0, // c1
			0.4,0.5,1.1, 0.0,1.0,0.0, // a1
			-0.7,0.9,0.7, 0.0,1.0,0.0, // c

			//15
			-1.1,0.5,0.4 , 0.0,1.0,0.0, // a2
			-0.9,0.5,0.9, 0.0,1.0,0.0, // c1
			-0.7,0.9,0.7, 0.0,1.0,0.0, // c

			//18
			-1.1,0.5,0.4, 0.0,1.0,0.0, // a2
			-0.7,0.9,0.7, 0.0,1.0,0.0, // c
			-0.7,0.9,-0.7, 0.0,1.0,0.0, // b

			//21
			-0.9,0.5,-0.9, 0.0,1.0,0.0, // b2
			-1.1,0.5,0.4 , 0.0,1.0,0.0, // a2
			-0.7,0.9,-0.7, 0.0,1.0,0.0, // g

			//23
			0.4,0.5,-1.1, 0.0,1.0,0.0, // a3
			-0.9,0.5,-0.9, 0.0,1.0,0.0, // b2
			-0.7,0.9,-0.7, 0.0,1.0,0.0, // g

			//26
			0.4,0.5,-1.1, 0.0,1.0,0.0, // a3
			-0.7,0.9,-0.7, 0.0,1.0,0.0, // g
			0.7,0.9,-0.7, 0.0,1.0,0.0, // v

			//29
			0.9,0.5,-0.9, 0.0,1.0,0.0, // b3
			0.4,0.5,-1.1, 0.0,1.0,0.0, // a3
			0.7,0.9,-0.7, 0.0,1.0,0.0, // v

			//32
			1.1,0.5,0.4, 0.0,1.0,0.0, // a4
			0.9,0.5,-0.9, 0.0,1.0,0.0, // b3
			0.7,0.9,-0.7, 0.0,1.0,0.0, // v

			//35
			1.1,0.5,0.4, 0.0,1.0,0.0, // a4
			0.7,0.9,-0.7, 0.0,1.0,0.0, // v
			0.7,0.9,0.7, 0.0,1.0,0.0, // d

			//42 // mid top
			0.9,0.5,0.9, 0.0,1.0,0.0, // b1
			1.1,0.5,0.4, 0.0,1.0,0.0, // a4
			0.7,0.9,0.7, 0.0,1.0,0.0, // d

			//45
			1.1,0.5,0.4, 0.0,1.0,0.0, // a4
			0.9,0.5,0.9, 0.0,1.0,0.0, // b1
			0.9,0.2,0.9, 0.0,1.0,0.0, // a5

			//48
			1.1,0.5,0.4, 0.0,1.0,0.0, // a4
			0.9,0.2,0.9, 0.0,1.0,0.0, // a5
			1.1,0.2,0.4, 0.0,1.0,0.0, // b5

			//51
			0.9,0.5,-0.9, 0.0,1.0,0.0, // b3
			1.1,0.5,0.4, 0.0,1.0,0.0, // a4
			1.1,0.2,0.4, 0.0,1.0,0.0, // b5

			//54
			0.9,0.5,-0.9, 0.0,1.0,0.0, // b3
			1.1,0.2,0.4, 0.0,1.0,0.0, // b5
			0.9,0.2,-0.9, 0.0,1.0,0.0, // a6

			//57
			0.4,0.5,-1.1, 0.0,1.0,0.0, // a3
			0.9,0.5,-0.9, 0.0,1.0,0.0, // b3
			0.9,0.2,-0.9, 0.0,1.0,0.0, // a6

			//60
			0.4,0.5,-1.1, 0.0,1.0,0.0, // a3
			0.9,0.2,-0.9, 0.0,1.0,0.0, // a6
			0.4,0.2,-1.1, 0.0,1.0,0.0, // b6

			-0.9,0.5,-0.9, 0.0,1.0,0.0, // b2
			0.4,0.5,-1.1, 0.0,1.0,0.0, // a3
			0.4,0.2,-1.1, 0.0,1.0,0.0, // b6

			-0.9,0.5,-0.9, 0.0,1.0,0.0, // b2
			0.4,0.2,-1.1, 0.0,1.0,0.0, // b6
			-0.9,0.2,-0.9, 0.0,1.0,0.0, // a7

			//69
			-1.1,0.5,0.4 , 0.0,1.0,0.0, // a2
			-0.9,0.5,-0.9, 0.0,1.0,0.0, // b2
			-0.9,0.2,-0.9, 0.0,1.0,0.0, // a7

			//72
			-1.1,0.5,0.4 , 0.0,1.0,0.0, // a2
			-0.9,0.2,-0.9, 0.0,1.0,0.0, // a7
			-1.1,0.2,0.4, 0.0,1.0,0.0, // a8

			//75
			-0.9,0.5,0.9, 0.0,1.0,0.0, // c1
			-1.1,0.5,0.4 , 0.0,1.0,0.0, // a2
			-1.1,0.2,0.4, 0.0,1.0,0.0, // a8

			//78
			-0.9,0.5,0.9, 0.0,1.0,0.0, // c1
			-1.1,0.2,0.4, 0.0,1.0,0.0, // a8
			-0.9,0.2,0.9, 0.0,1.0,0.0, // b8

			//80
			0.4,0.5,1.1, 0.0,1.0,0.0, // a1
			-0.9,0.5,0.9, 0.0,1.0,0.0, // c1
			-0.9,0.2,0.9, 0.0,1.0,0.0, // b8

			//83
			0.4,0.5,1.1, 0.0,1.0,0.0, // a1
			-0.9,0.2,0.9, 0.0,1.0,0.0, // b8
			0.4,0.2,1.1, 0.0,1.0,0.0, // a9

			//86
			0.9,0.5,0.9, 0.0,1.0,0.0, // b1
			0.4,0.5,1.1, 0.0,1.0,0.0, // a1
			0.4,0.2,1.1, 0.0,1.0,0.0, // a9

			//90
			0.9,0.5,0.9, 0.0,1.0,0.0, // b1
			0.4,0.2,1.1, 0.0,1.0,0.0, // a9
			0.9,0.2,0.9, 0.0,1.0,0.0, // a5


			// Bottom cap


			0.7,-0.1,0.7, 0.0,1.0,0.0, // a
			-0.7,-0.1,-0.7, 0.0,1.0,0.0, // b
			-0.7,-0.1,0.7, 0.0,1.0,0.0, // c
			0.7,-0.1,0.7, 0.0,1.0,0.0, // d
			-0.7,-0.1,-0.7, 0.0,1.0,0.0, // g
			0.7,-0.1,-0.7, 0.0,1.0,0.0, // v




			0.4,0.2,1.1, 0.0,1.0,0.0, // a1
			0.9,0.2,0.9, 0.0,1.0,0.0, // b1
			0.7,-0.1,0.7, 0.0,1.0,0.0, // d

			0.4,0.2,1.1, 0.0,1.0,0.0,  // a1
			0.7,-0.1,0.7, 0.0,1.0,0.0,  // d
			-0.7,-0.1,0.7, 0.0,1.0,0.0, // c

			//99
			-0.9,0.2,0.9, 0.0,1.0,0.0, // c1
			0.4,0.2,1.1, 0.0,1.0,0.0, // a1
			-0.7,-0.1,0.7, 0.0,1.0,0.0, // c

			//102
			//-0.7
			-1.1,0.2,0.4 , 0.0,1.0,0.0, // a2
			-0.9,0.2,0.9, 0.0,1.0,0.0, // c1
			-0.7,-0.1,0.7, 0.0,1.0,0.0, // c

			//105
			-1.1,0.2,0.4, 0.0,1.0,0.0, // a2
			-0.7,-0.1,0.7, 0.0,1.0,0.0, // c
			-0.7,-0.1,-0.7, 0.0,1.0,0.0, // b

			//108
			-0.9,0.2,-0.9, 0.0,1.0,0.0, // b2
			-1.1,0.2,0.4 , 0.0,1.0,0.0, // a2
			-0.7,-0.1,-0.7, 0.0,1.0,0.0, // g

			//101
			0.4,0.2,-1.1, 0.0,1.0,0.0, // a3
			-0.9,0.2,-0.9, 0.0,1.0,0.0, // b2
			-0.7,-0.1,-0.7, 0.0,1.0,0.0, // g

			//104
			0.4,0.2,-1.1, 0.0,1.0,0.0, // a3
			-0.7,-0.1,-0.7, 0.0,1.0,0.0, // g
			0.7,-0.1,-0.7, 0.0,1.0,0.0, // v

			//107
			0.9,0.2,-0.9, 0.0,1.0,0.0, // b3
			0.4,0.2,-1.1, 0.0,1.0,0.0, // a3
			0.7,-0.1,-0.7, 0.0,1.0,0.0, // v

			//110
			1.1,0.2,0.4, 0.0,1.0,0.0, // a4
			0.9,0.2,-0.9, 0.0,1.0,0.0, // b3
			0.7,-0.1,-0.4, 0.0,1.0,0.0, // v

			//113
			1.1,0.2,0.4, 0.0,1.0,0.0, // a4
			0.7,-0.1,-0.7, 0.0,1.0,0.0, // v
			0.7,-0.1,0.7, 0.0,1.0,0.0, // d

			//116
			0.9,0.2,0.9, 0.0,1.0,0.0, // b1
			1.1,0.2,0.4, 0.0,1.0,0.0, // a4
			0.7,-0.1,0.7, 0.0,1.0,0.0, // d





		];
	
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.vertices), gl.STATIC_DRAW);
		this.loc=[0,0,0];
		this.rot=[0,0,0];
	}

	Update()
	{
		//nothing
	}
		
}

class Rock extends GameObject
{
	constructor()
	{
		super(90, gl.TRIANGLES);
		this.name = "Rock";
		this.angVelocity = [0,0,0];
		//this.isTrigger = false;
		this.buffer=gl.createBuffer();
		//this.colorBuffer = gl.createBuffer();
		
		gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);

		this.vertices =
		[
			0.3,0.8,0.3, 0.65,0.65,0.65, // a
			-0.3,0.8,-0.3, 0.65,0.65,0.65, // b
			-0.3,0.8,0.3, 0.65,0.65,0.65, // c
			0.3,0.8,0.3, 0.65,0.65,0.65, // d
			-0.3,0.8,-0.3, 0.65,0.65,0.65, // g
			0.3,0.8,-0.3, 0.65,0.65,0.65, // v

			0.0,-0.2,0.7, 0.65,0.65,0.65, // a1
			0.5,-0.2,0.5, 0.65,0.65,0.65, // b1
			0.3,0.8,0.3, 0.65,0.65,0.65, // d

			0.0,-0.2,0.7, 0.65,0.65,0.65,  // a1
			0.3,0.8,0.3, 0.65,0.65,0.65,  // d
			-0.3,0.8,0.3, 0.65,0.65,0.65, // c

			-0.5,-0.2,0.5, 0.65,0.65,0.65, // c1
			0.0,-0.2,0.7, 0.65,0.65,0.65, // a1
			-0.3,0.8,0.3, 0.65,0.65,0.65, // c

			//15
			-0.7,-0.2,0.0 , 0.65,0.65,0.65, // a2
			-0.5,-0.2,0.5, 0.65,0.65,0.65, // c1
			-0.3,0.8,0.3, 0.65,0.65,0.65, // c

			//16
			-0.7,-0.2,0.0, 0.65,0.65,0.65, // a2
			-0.3,0.8,0.3, 0.65,0.65,0.65, // c
			-0.3,0.8,-0.3, 0.65,0.65,0.65, // b

			//21
			-0.5,-0.2,-0.5, 0.65,0.65,0.65, // b2
			-0.7,-0.2,0.0 , 0.65,0.65,0.65, // a2
			-0.3,0.8,-0.3, 0.65,0.65,0.65, // g

			//23
			0.0,-0.2,-0.7, 0.65,0.65,0.65, // a3
			-0.5,-0.2,-0.5, 0.65,0.65,0.65, // b2
			-0.3,0.8,-0.3, 0.65,0.65,0.65, // g

			//26
			0.0,-0.2,-0.7, 0.65,0.65,0.65, // a3
			-0.3,0.8,-0.3, 0.65,0.65,0.65, // g
			0.3,0.8,-0.3, 0.65,0.65,0.65, // v

			//29
			0.5,-0.2,-0.5, 0.65,0.65,0.65, // b3
			0.0,-0.2,-0.7, 0.65,0.65,0.65, // a3
			0.3,0.8,-0.3, 0.65,0.65,0.65, // v

			//32
			0.7,-0.2,0.0, 0.65,0.65,0.65, // a4
			0.5,-0.2,-0.5, 0.65,0.65,0.65, // b3
			0.3,0.8,-0.3, 0.65,0.65,0.65, // v

			//35
			0.7,-0.2,0.0, 0.65,0.65,0.65, // a4
			0.3,0.8,-0.3, 0.65,0.65,0.65, // v
			0.3,0.8,0.3, 0.65,0.65,0.65, // d

			//42
			0.5,-0.2,0.5, 0.65,0.65,0.65, // b1
			0.7,-0.2,0.0, 0.65,0.65,0.65, // a4
			0.3,0.8,0.3, 0.65,0.65,0.65, // d

			//45
			0.7,-0.2,0.0, 0.65,0.65,0.65, // a4
			0.5,-0.2,0.5, 0.65,0.65,0.65, // b1
			0.5,-0.5,0.5, 0.65,0.65,0.65, // a5

			//48
			0.7,-0.2,0.0, 0.65,0.65,0.65, // a4
			0.5,-0.5,0.5, 0.65,0.65,0.65, // a5
			0.7,-0.5,0.0, 0.65,0.65,0.65, // b5

			//51
			0.5,-0.2,-0.5, 0.65,0.65,0.65, // b3
			0.7,-0.2,0.0, 0.65,0.65,0.65, // a4
			0.7,-0.5,0.0, 0.65,0.65,0.65, // b5

			//54
			0.5,-0.2,-0.5, 0.65,0.65,0.65, // b3
			0.7,-0.5,0.0, 0.65,0.65,0.65, // b5
			0.5,-0.5,-0.5, 0.65,0.65,0.65, // a6

			//57
			0.0,-0.2,-0.7, 0.65,0.65,0.65, // a3
			0.5,-0.2,-0.5, 0.65,0.65,0.65, // b3
			0.5,-0.5,-0.5, 0.65,0.65,0.65, // a6

			//60
			0.0,-0.2,-0.7, 0.65,0.65,0.65, // a3
			0.5,-0.5,-0.5, 0.65,0.65,0.65, // a6
			0.0,-0.5,-0.7, 0.65,0.65,0.65, // b6

			-0.5,-0.2,-0.5, 0.65,0.65,0.65, // b2
			0.0,-0.2,-0.7, 0.65,0.65,0.65, // a3
			0.0,-0.5,-0.7, 0.65,0.65,0.65, // b6

			-0.5,-0.2,-0.5, 0.65,0.65,0.65, // b2
			0.0,-0.5,-0.7, 0.65,0.65,0.65, // b6
			-0.5,-0.5,-0.5, 0.65,0.65,0.65, // a7

			//69
			-0.7,-0.2,0.0 , 0.65,0.65,0.65, // a2
			-0.5,-0.2,-0.5, 0.65,0.65,0.65, // b2
			-0.5,-0.5,-0.5, 0.65,0.65,0.65, // a7

			//72
			-0.7,-0.2,0.0 , 0.65,0.65,0.65, // a2
			-0.5,-0.5,-0.5, 0.65,0.65,0.65, // a7
			-0.7,-0.5,0.0, 0.65,0.65,0.65, // a8

			//75
			-0.5,-0.2,0.5, 0.65,0.65,0.65, // c1
			-0.7,-0.2,0.0 , 0.65,0.65,0.65, // a2
			-0.7,-0.5,0.0, 0.65,0.65,0.65, // a8

			//78
			-0.5,-0.2,0.5, 0.65,0.65,0.65, // c1
			-0.7,-0.5,0.0, 0.65,0.65,0.65, // a8
			-0.5,-0.5,0.5, 0.65,0.65,0.65, // b8

			//80
			0.0,-0.2,0.7, 0.65,0.65,0.65, // a1
			-0.5,-0.2,0.5, 0.65,0.65,0.65, // c1
			-0.5,-0.5,0.5, 0.65,0.65,0.65, // b8

			//83
			0.0,-0.2,0.7, 0.65,0.65,0.65, // a1
			-0.5,-0.5,0.5, 0.65,0.65,0.65, // b8
			0.0,-0.5,0.7, 0.65,0.65,0.65, // a9

			//86
			0.5,-0.2,0.5, 0.65,0.65,0.65, // b1
			0.0,-0.2,0.7, 0.65,0.65,0.65, // a1
			0.0,-0.5,0.7, 0.65,0.65,0.65, // a9

			//90
			0.5,-0.2,0.5, 0.65,0.65,0.65, // b1
			0.0,-0.5,0.7, 0.65,0.65,0.65, // a9
			0.5,-0.5,0.5, 0.65,0.65,0.65, // 

			// Was 0.2

		];

		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.vertices), gl.STATIC_DRAW);
		this.loc=[0,0,0];
		this.rot=[0,0,0];
	}

	Update()
	{
		//nothing
	}
}

class Torch extends GameObject
{
	constructor()
	{
		super(24, gl.TRIANGLES);
		this.name = "Torch";
		//this.angVelocity = [0,0,0];
		//this.isTrigger = false;
		this.buffer=gl.createBuffer();
		//this.colorBuffer = gl.createBuffer();
		
		gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);

		this.vertices = 
		[
			// Front face
			-0.05,-0.05,0.1, 0.63,0.26,0.0,
			0.05,-1.5,0.1, 0.63,0.26,0.0,
			-0.05,-1.5,0.1, 0.63,0.26,0.0,
			-0.05,-0.05,0.1, 0.63,0.26,0.0,
			0.05,-0.05,0.1, 0.63,0.26,0.0,
			0.05,-1.5,0.1, 0.63,0.26,0.0,

			// Left face
			-0.05,-0.05,0.0, 0.63,0.26,0.0,
			-0.05,-1.5,0.1, 0.63,0.26,0.0,
			-0.05,-1.5,0.0, 0.63,0.26,0.0,
			-0.05,-0.05,0.0, 0.63,0.26,0.0,
			-0.05,-0.05,0.1, 0.63,0.26,0.0,
			-0.05,-1.5,0.1, 0.63,0.26,0.0,

			// Right face
			0.05,-0.05,0.0, 0.63,0.26,0.0,
			0.05,-1.5,0.1, 0.63,0.26,0.0,
			0.05,-1.5,0.0, 0.63,0.26,0.0,
			0.05,-0.05,0.0, 0.63,0.26,0.0,
			0.05,-0.05,0.1, 0.63,0.26,0.0,
			0.05,-1.5,0.1, 0.63,0.26,0.0,

			// Back face
			-0.05,-0.05,0.0, 0.63,0.26,0.0,
			0.05,-1.5,0.0, 0.63,0.26,0.0,
			-0.05,-1.5,0.0, 0.63,0.26,0.0,
			-0.05,-0.05,0.0, 0.63,0.26,0.0,
			0.05,-0.05,0.0, 0.63,0.26,0.0,
			0.05,-1.5,0.0, 0.63,0.26,0.0,
			
			

		];

		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.vertices), gl.STATIC_DRAW);

	}

	Update()
	{
		//Nothing
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

class Enemy extends GameObject
{
	constructor()
	{
		super(24, gl.TRIANGLES);
		this.name = "Enemy";
		this.isTrigger = true;
		this.buffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
	
		this.vertices =
		[	
			// Top
			-0.5, 0.5, -0.5,   0.5, 0.5, 0.5,
			-0.5, 0.5, 0.5,    0.5, 0.5, 0.5,
			0.5, 0.5, 0.5,     0.5, 0.5, 0.5,
			0.5, 0.5, -0.5,    0.5, 0.5, 0.5,

			// Left
			-0.5, 0.5, 0.5,    0.75, 0.25, 0.5,
			-0.5, -0.5, 0.5,   0.75, 0.25, 0.5,
			-0.5, -0.5, -0.5,  0.75, 0.25, 0.5,
			-0.5, 0.5, -0.5,   0.75, 0.25, 0.5,

			// Right
			0.5, 0.5, 0.5,    0.25, 0.25, 0.75,
			0.5, -0.5, 0.5,   0.25, 0.25, 0.75,
			0.5, -0.5, -0.5,  0.25, 0.25, 0.75,
			0.5, 0.5, -0.5,   0.25, 0.25, 0.75,

			// Front
			0.5, 0.5, 0.5,    1.0, 0.0, 0.15,
			0.5, -0.5, 0.5,    1.0, 0.0, 0.15,
			-0.5, -0.5, 0.5,    1.0, 0.0, 0.15,
			-0.5, 0.5, 0.5,    1.0, 0.0, 0.15,

			// Back
			0.5, 0.5, -0.5,    0.0, 1.0, 0.15,
			0.5, -0.5, -0.5,    0.0, 1.0, 0.15,
			-0.5, -0.5, -0.5,    0.0, 1.0, 0.15,
			-0.5, 0.5, -0.5,    0.0, 1.0, 0.15,

			// Bottom
			-0.5, -0.5, -0.5,   0.5, 0.5, 1.0,
			-0.5, -0.5, 0.5,    0.5, 0.5, 1.0,
			0.5, -0.5, 0.5,     0.5, 0.5, 1.0,
			0.5, -0.5, -0.5,    0.5, 0.5, 1.0
			
		];
	
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.vertices), gl.STATIC_DRAW);
		//this.velocity = [0.007,0,0];	// We want enemy object to already be moving off rip
		this.sign = 0;		// Sign helps in determining in which direction to go when colliding with a wall
		// Move the enemy at constant speed
		this.velocity = [0.08,0,0];
		// Variable for holding the uniform that the enemy is connected to
		this.uniform;
		// Composition
		this.hitbox;
		
	}

	Update()
	{
		this.hitbox.loc = [this.loc[0], 0, this.loc[2]];
		
		this.Move();

		var enemyLoc = gl.getUniformLocation(m.myWEBGL.program,this.uniform);
		gl.uniform3fv(enemyLoc, this.loc);
	}

	OnTriggerEnter(other)
	{
		if(other.name == "Boundary")
		{
			console.log("wall collision");
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
			console.log("Camera collided with enemy");
			
		}
	}

}

class Hitbox extends GameObject
{
	constructor()
	{
		super(0,gl.TRIANGLES);
		this.name = "Hitbox";
		this.isTrigger = true;
		this.loc = [0,0,0];
		this.rot = [0,0,0];
	}

	Update()
	{
		// Make the hitbox look out for any camera collisions
		this.Move();
	}

	Render(program)
	{
		// Nothing
	}

	OnTriggerEnter(other)
	{
		// If the camera collides with the spotlight then send it back to spawn
		if(other.name == "Camera")
		{
			other.loc = [0,0,0];
		}
	}
}

class Moon extends GameObject
{
	constructor()
	{
		super(6,gl.TRIANGLES);
		this.name = "Moon";

		this.buffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
	
		this.vertices =
		[	
			-45.0,45.0,0, 0.99,0.99,0.99,
			45.0,-45.0,0, 0.99,0.99,0.99,
			-45.0,-45.0,0, 0.99,0.99,0.99,

			-45.0,45.0,0, 0.99,0.99,0.99,
			45.0,45.0,0, 0.99,0.99,0.99,
			45.0,-45.0,0, 0.99,0.99,0.99,
			
		];
	
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.vertices), gl.STATIC_DRAW);
		

	}

	Update()
	{
		// Nothing
	}
}


