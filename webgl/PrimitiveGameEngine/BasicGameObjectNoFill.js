class Transform
{
	constructor()
	{
		// These are three vectors that are always gonna be pointing in the direction of where
		// the object is facing
		this.forward = [0,0,1];	// Pointing in the +Z
		this.right = [1,0,0];	// Pointing in the +X
		this.up = [0,1,0];		// Pointing in the +Y
	}

	doRotations(RotAngles)
	{
		// All this function does is calculate the rotation for the object by combining
		// x, y, and z rotations into one R matrix which contains the rotation information 
		// for all the axies. We are doing this math because these vectors are kept in the
		// cpu and only help in telling us where the object is facing. At first the object is facing
		// in a way where these vectors are in their default positions and when we rotate the object
		// we also want to rotate these vectors so that they are still "attached" to the object, thus
		// giving us a sense of direction
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
		// Final result will be the R = dirVector * xRot * yRot * zRot. This can be done in the vertex shader
		this.forward = this.crossMultiply(this.zRot,this.crossMultiply(this.yRot,this.crossMultiply(this.xRot,[0,0,1,0])))
		this.right = this.crossMultiply(this.zRot,this.crossMultiply(this.yRot,this.crossMultiply(this.xRot,[1,0,0,0])))
		this.up = this.crossMultiply(this.zRot,this.crossMultiply(this.yRot,this.crossMultiply(this.xRot,[0,1,0,0])))
	}	

	crossMultiply(M,V)
	{
		console.log(M[0][3]);
		console.log(V[3]);
		// Multiply each column of the matrix with the associated value of the vector
		// For example first column x first row of the vector. This is if you read it from
		// top to bottom going left. Reading it horizontally, its basically normal matrix multiplication
		var temp = [
					M[0][0]*V[0]+M[0][1]*V[1]+M[0][2] * V[2]+ M[0][3]*V[3],
					M[1][0]*V[0]+M[1][1]*V[1]+M[1][2] * V[2]+ M[1][3]*V[3],
					M[2][0]*V[0]+M[2][1]*V[1]+M[2][2] * V[2]+ M[2][3]*V[3],
					M[3][0]*V[0]+M[3][1]*V[1]+M[3][2] * V[2]+ M[3][3]*V[3]
					]
		console.log(temp);
			return temp;
	}
	
}
		
class GameObject
{
	// GameObject acts as an abstract class for every object in our game
	// so it contains general information that EVERY object will have
	constructor(count) 
	{
		this.loc = [0,0,0];
		this.rot = [0,0,0];
		this.isTrigger = false;
		this.cRadX = 0.1; 
		this.cRadY = 0.1;
		this.velocity = [0,0,0];
		this.angVelocity = [0,0,0];
		this.name = "Default";
		this.id = 0;
		this.tranform = new Transform();
		this.prefab;
		this.triangleCount = count;
	}

	//assuming that velocity is set correctly 
	Move(){
		// tempP acts as the ghost/future self of the object thats
		// moving or rotating. We dont want to immediately apply the new
		// rotation and movement to the real object just yet. This so that we
		// prevent screen jitters when colliding with a solid

		// If you take all the rest of the code out, Move simply updates
		// the loc and rot of the object with velocity and angVelocity respectively
		// where loc and rot are synced with the transform and rotation uniforms!
		var tempP = [0,0,0];
		// Changed from 4 to 3 since it will go out of bounds
		for (var i = 0; i < 3; i++){
			tempP[i] = this.loc[i];
			tempP[i] += this.velocity[i];	// This is where loc and velocity meet! 
			// Yes rot has values other than 0 and the vertex shader stores that value in rotate
			// its not until angVelocity adds something other than 0 to rot that the object will rotate!
			this.rot[i] += this.angVelocity[i];		// This is where rot and angVelocity meet!
		}
		// If its not a trigger object (Its a solid)
		if(!this.isTrigger){
			// Assume that there is nothing in the way
			var clear = true;	
			for(var so in m.Solid)		// Remember that m is a global variable!
			{ 
				if(this != m.Solid[so])
				{
					// While looping through each solid object we use tempP to check if there is a collision with every other
					// solid. Keep in mind that we would need to implement a way to ignore the object associated with temp
					if(m.CheckCollision(tempP, this.cRadX, this.cRadY, m.Solid[so].loc, m.Solid[so].cRadX, m.Solid[so].cRadY))//make sure m.solid does not equal this object
					{
						// If a collision is encounterd 
						// These two OnCollissionEnters are the same
						this.OnCollisionEnter(m.Solid[so]);
						try
						{
							// We are now checking the other way around
							// Its in a try in the case that the collision enter right
							// before caused m.Solid[so] to be deleted
							m.Solid[so].OnCollisionEnter(this);
						}
						catch{}
						clear = false;
					}
				}
				
			}
			if(clear){
				// If the solid object did not collide with anything then simply update its location
				// Be careful of shallow copies!
				this.loc = tempP;
			}
		}
		
		else{ //this should be right 
			this.loc = tempP;
			//console.log("this works");
			for(var so in m.Solid){
				// If we already collided with the solid object earlier and it has a OnTriggerEnter then
				// we can simply store it and use it here
				if(m.CheckCollision(tempP, this.cRadX, this.cRadY, m.Solid[so].loc, m.Solid[so].cRadX, m.Solid[so].cRadY)){
					// What if the Solid doenst have an OnTriggerEnter
					this.OnTriggerEnter(m.Solid[so]);
					try
					{
						m.Solid[so].OnTriggerEnter(this);
					}
					catch
					{

					}
				}

			}
			// Now check if 
			for(var to in m.Trigger){ //this should be correct. It is trying to check for trigger objects insted of solid objects
				if(this != m.Trigger[to]){
					if(m.CheckCollision(tempP, this.cRadX, this.cRadY, m.Trigger[to].loc, m.Trigger[to].cRadX, m.Trigger[to].cRadY)){
						this.OnTriggerEnter(m.Trigger[to]);
						try
						{
							m.Trigger[to].OnTriggerEnter(this);
						}
						catch
						{
	
						}
					}
				}
			}
		}
	} 


	//virtural functions 
	//colide with a phyical object and it stops me 
	OnCollisionEnter(other){

	}

	//colide with a object and a event happens
	OnTriggerEnter(other){

	}


	//make a fake abstract class
	Update()
	{
		console.error(this.name +" update() is NOT IMPLEMENTED!");
	}
	
	Render(program)
	{
	   // Telling webGL which buffer. This is important for when we will work with multiple buffers
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
	   offset = 3*Float32Array.BYTES_PER_ELEMENT;	//size of the offset. In this case grab last three of the set of 6
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
	   
	   // Before it was a count of 12
	   var primitiveType = gl.TRIANGLES;
	   offset = 0;
	   var count = this.triangleCount;
	   gl.drawArrays(primitiveType, offset, count);
	}
}

class Bullet extends GameObject
{
	constructor()
	{
		super(6);
		this.name = "Bullet";
		this.isTrigger = true;
		this.buffer=gl.createBuffer();
		this.velocity = [0.003,0.003,0];

		gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
		this.vertices =
		[	//Top wing
			-0.1,0.1,0, 	1,0,0,
			0.1,0.1,0,		0,1,0,
			-0.1,-0.1,0,	0,0,1,
			//Bottom wing
			0.1,0.1,0,		0,0,1,
			0.1,-0.1,0,		0,1,0,
			-0.1,-0.1,0,	1,0,0
		   
	   	];

		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.vertices), gl.STATIC_DRAW);
	}

	Update()
	{
		//this.velocity = 0.003;
		this.Move();
	}

	OnCollisionEnter(other)
	{
		if(other.name == "Wall" || other.name == "Enemy")
		{
			console.log("Bullet collided with something")
			m.DestroyObject(this.id);


		}
		else if(other.name == "Player")
			console.log("Bullet collided with player!");

	}
}

// Two classes: Triangle1 and Triangle2. Both define different shapes
class Triangle1 extends GameObject
{
	constructor()
	{
		super(6);
		this.name = "Player";
		this.buffer=gl.createBuffer();
		// Creating our buffer for the shape. Know that all unique instances will
		// have its own buffer
		gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
		//Now we want to add color to our vertices information.
		// Here we define the prototype of the shape. The idea is to create
		// shapes where their origin is at 0,0,0, these are our prototypes
		// We now use this prototype and instantiate objects with at different
		// locations with the help of the translation matrix.
		this.vertices =
		[	//Top wing
			-0.1,0.1,0, 	1,0,0,
			0.1,0.1,0,		0,1,0,
			-0.1,-0.1,0,	0,0,1,
			//Bottom wing
			0.1,0.1,0,		0,0,1,
			0.1,-0.1,0,		0,1,0,
			-0.1,-0.1,0,	1,0,0
		   
	   	];
	   gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.vertices), gl.STATIC_DRAW);
	   // These two variables allow us to set the location and rotation of a particular
	   // Triangle1 instance. By default the instance will be positioned at the origin.
	   // No point in specifying a loc and a rot here since its already declared for us in
	   // GameObject
	   //this.loc = [0.0,0.0,0.0];
	   //this.rot = [0.0,0.0,0.0]; 	// Rotation will be altered in the render loop
	   // We set the rotation here so that on load the front face will show
	}
	//Again this could be inherited ... but not always...not all objects
	
	Update()
	{
		// A and D specify the ammount of rotation. The idea is that
		// pressing any of these keys will rotate the object 
		if(m.CheckKey("A"))
		{
			// Specify how fast to rotate and in which axis
			this.angVelocity = [0,0,0.1];

		}
		else if(m.CheckKey("D"))
		{
			this.angVelocity = [0,0,-0.1];
		}
		else
		{
			// Fail safe in the case that when we press either A or D
			// that the object doesnt keep rotating. This is because pressing
			// A or D will assign a list to angVelocity which will cause
			// rot in move to constantly rotate by that ammount. In short
			// if we are not pressing anything, we dont want the object to keep
			// rotating, so we make sure to set angVelocity which updates this.rot
			// to change/rotate
			this.angVelocity = [0,0,0];
		}
		//Aquire forward vector
		if(m.CheckKey("W"))		// Moving forwards
		{
			// pass current rotation into rotation
			// This is so that the direction vectors rotate an equal ammount to what the
			// the object is rotating! What ever ammount we are rotating, we also want to rotate
			// the direction vectors by that ammount!
			// Think of this as updating the direction vectors to be facing in the right directions
			// according to how the object has been rotated the in the previous code.
			this.tranform.doRotations(this.rot);
			var tv = this.tranform.right;		// Grabbing the forward vector.
			for(let i = 0; i < 3; i++)
			{
				// Depending on the direction vector chosen by tv, the velocity will update
				// only a particular axis, the rest will be 0. For example choosing forward
				// for tv will only update the z spot in velocity, the rest will be zero!
				this.velocity[i] = tv[i] * 0.01;	
			}

		}
		else if(m.CheckKey("S"))	// Moving backwards
		{
			this.tranform.doRotations(this.rot);
			var tv = this.tranform.right;		// Grabbing the forward vector.
			for(let i = 0; i < 3; i++)
			{
				// Depending on the direction vector chosen by tv, the velocity will update
				// only a particular axis, the rest will be 0. For example choosing forward
				// for tv will only update the z spot in velocity, the rest will be zero!
				this.velocity[i] = tv[i] * -0.01;	
			}

		}
		else
		{
			// Same fail-safe idea to the rotations. We dont want to keep moving after pressing w.
			this.velocity = [0,0,0];
		}

		if(m.CheckKey(" "))
		{
			var b = false;
			for(var so in m.Trigger)
			{
				if("Bullet" == m.Trigger[so].name)
				{
					b = true;
					break;
				}
			}

			if(!b)
			{
				// Make sure to change the radius of x and y
				console.log("Bullet Fired!");
				m.CreateObject(2, Bullet, [this.loc[0]+0.1,this.loc[1]+0.1,0], this.rot,0.1,0.1);
				console.log("Check");
			}
		}
		else
		{
			b = false;
		}

		this.Move();
		// now implement override functions for collision
		
	}

	//virtural functions 
	//colide with a phyical object and it stops me 
	OnCollisionEnter(other){
		console.log("Player just collided with " + other.name);
	}

	//colide with a object and a event happens
	OnTriggerEnter(other){
		console.log("Player just triggered " + other.name);
	}
	

}

class Wall extends GameObject
{
	constructor()
	{
		super(6);
		this.name = "Wall";
		this.buffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);

		this.vertices =
		[	//Top wing
			-0.03,1,0, 	1,0,0,
			0.03,1,0,	0,1,0,
			-0.03,-1,0,	0,0,1,
			//Bottom wing
			0.03,1,0,	0,0,1,
			0.03,-1,0,	0,1,0,
			-0.03,-1,0,	1,0,0
		   
	   	];

		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.vertices), gl.STATIC_DRAW);
	}

	Update()
	{
		//this.Move();
	}

	OnCollisionEnter(other){
		console.log("Wall just collided with " + other.name);
	}
}



class Coin extends GameObject
{
	constructor()
	{
		super(24);
		this.name = "Coin";
		this.isTrigger = true;
		this.buffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);

		this.vertices =
		[	// Front face
			0,0.1,-0.05, 		0.988,0.584,0.050,
			-0.1,-0.1,-0.05,		0.988,0.584,0.050,
			0.1,-0.1,-0.05,		0.988,0.584,0.050,

			// Left side
			0,0.1,-0.05, 		0.988,0.584,0.050,
			-0.1,-0.1,0.05,	0.988,0.584,0.050,
			-0.1,-0.1,-0.05,	0.988,0.584,0.050,

			0,0.1,-0.05, 		0.988,0.584,0.050,
			0,0.1,0.05, 		0.988,0.584,0.050,
			-0.1,-0.1,0.05,	0.988,0.584,0.050,

			// right side
			0,0.1,-0.05, 		0.988,0.584,0.050,
			0,0.1,0.05, 		0.988,0.584,0.050,
			0.1,-0.1,0.05, 	0.988,0.584,0.050,

			0,0.1,-0.05, 		0.988,0.584,0.050,
			0.1,-0.1,-0.05, 	0.988,0.584,0.050,
			0.1,-0.1,0.05, 	0.988,0.584,0.050,

			// Bottom Side
			-0.1,-0.1,0.05, 	0.988,0.584,0.050,
			-0.1,-0.1,0.05, 	0.988,0.584,0.050,
			0.1,-0.1,0.05, 	0.988,0.584,0.050,

			-0.1,-0.1,0.05, 	0.988,0.584,0.050,
			0.1,-0.1,0.05,		0.988,0.584,0.050,
			0.1,-0.1,-0.05, 	0.988,0.584,0.050,

			// Back face
			0,0.1,0.05, 		0.0,0.0,0.0,
			-0.1,-0.1,0.05,	0.0,0.0,0.0,
			0.1,-0.1,0.05,	0.0,0.0,0.0
		   
	   	];

		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.vertices), gl.STATIC_DRAW);
		
	}

	Update()
	{
		//this.Move();
		// rotate in the y axis constantly
		this.angVelocity = [0,0.008,0];
		this.Move()
	}

	OnTriggerEnter(other){
		console.log("Coin just collided with " + other.name);
		if(other.name == "Player")
		{
			console.log("Coin will delete");
			m.DestroyObject(this.id);
		}
	}
}

class Enemy extends GameObject
{
	constructor()
	{
		super(6);
		this.name = "Enemy"; 
		this.buffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);

		this.vertices =
		[	//Top wing
			-0.1,0.1,0, 	1,0,0,
			0.1,0.1,0,		0,1,0,
			-0.1,-0.1,0,	0,0,1,
			//Bottom wing
			0.1,0.1,0,		0,0,1,
			0.1,-0.1,0,		0,1,0,
			-0.1,-0.1,0,	1,0,0
		   
	   	];

		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.vertices), gl.STATIC_DRAW);
		this.velocity = [0.007,0,0];
		this.sign = 0;
	}

	Update()
	{
		this.Move();
	}

	OnCollisionEnter(other)
	{
		if(other.name == "Wall")
		{
			if(this.sign == 0)
			{
				this.velocity = [0.007,0,0];
				this.sign = 1;
			}
			else
			{
				this.velocity = [-0.007,0,0];
				this.sign = 0;
			}
		}
		else if(other.name == "Player")
		{
			console.log("Player Destroyed!");
			m.DestroyObject(other.id);
		}
	}
}