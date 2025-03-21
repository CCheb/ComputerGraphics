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
		// Need to specify the verticie count through the constructor (this could be changed)
		super(6);
		this.name = "Bullet";
		// Bullet is a trigger object
		this.isTrigger = true;
		this.buffer=gl.createBuffer();
		// We want to grab the right vector of the player 
		// So that the bullet is fired in the right direction
		this.dir;

		gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
		this.vertices =
		[	//Top wing
			-0.03,0.03,0, 	1,0,0,
			0.03,0.03,0,		0,1,0,
			-0.03,-0.03,0,	0,0,1,
			//Bottom wing
			0.03,0.03,0,		0,0,1,
			0.03,-0.03,0,		0,1,0,
			-0.03,-0.03,0,	1,0,0
		   
	   	];

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
			this.velocity[i] = this.dir[i] * 0.02;	
		}
		// Now update bullets movement and check for collisions
		this.Move();
	}

	OnTriggerEnter(other)
	{
		// Colliding with the Wall or Enemy will destroy the bullet
		if(other.name == "Wall" || other.name == "Enemy")
		{
			console.log("Bullet collided with " + other.name);
			m.DestroyObject(this.id);
			// Special case for when the bullet collides with the Enemy
			// Both should be destroyed in this case
			if(other.name == "Enemy")
			{
				m.DestroyObject(other.id);
				// Check if this is the last enemy. If so the player has won
				// so print out a message!
				if(m.enemyCount == 0)
				{
					var victory = document.createElement("p");
					victory.style.color = "green"
					victory.textContent = "Victory! All enemies have been destroyed!";
					document.body.appendChild(victory);

				}

			}
		}
		

	}
}

// Player class
class Player extends GameObject
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
            -0.08,0.1,0, 1,0,0,
            0.1,0,0,    0,1,0,
            0,0,0,      0,0,1,
            //Bottom wing
            0,0,0,      0,0,1,
            0.1,0,0,    0,1,0,
            -0.08,-0.1,0,   1,0,0
		   
	   	];
	   gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.vertices), gl.STATIC_DRAW);

	}
	
	Update()
	{
		// A and D specify the ammount of rotation. The idea is that
		// pressing any of these keys will rotate the object 
		if(m.CheckKey("A"))
		{
			// Specify how fast to rotate and in which axis
			// In this case we are rotating along the z-axis
			this.angVelocity = [0,0,0.06];

		}
		else if(m.CheckKey("D"))
		{
			this.angVelocity = [0,0,-0.06];
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
		
		if(m.CheckKey("W"))		// Moving forwards
		{
			// This is so that the direction vectors (front, right, top) rotate an equal ammount to what the
			// the object is rotating! What ever ammount we are rotating, we also want to rotate
			// the direction vectors by that ammount!
			// Think of this as updating the direction vectors to be facing in the correct directions
			// according to how the object has been rotated the in the previous code.
			this.tranform.doRotations(this.rot);
			var tv = this.tranform.right;		// Grabbing the right vector.
			for(let i = 0; i < 3; i++)
			{
				// The differences between the axies determines the direction for the right vector
				// We need to preserve these diferences so we multiply each axis of the direction
				// vector and assign each over to velocity so that the update reflects the player movement
				this.velocity[i] = tv[i] * 0.01;	
			}

		}
		else if(m.CheckKey("S"))	// Moving backwards
		{
			// Again update rotation. The direction vectors need to be kept up to date
			this.tranform.doRotations(this.rot);
			var tv = this.tranform.right;		// Grabbing the right vector.
			for(let i = 0; i < 3; i++)
			{
				// Same idea here just backwards for velocity
				this.velocity[i] = tv[i] * -0.01;	
			}

		}
		else
		{
			// Same fail-safe idea to the rotations. We dont want to keep moving after pressing w.
			this.velocity = [0,0,0];
		}

		// Pressing the space bar will cause the player to shoot a bullet
		if(m.CheckKey(" "))
		{
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
				var bullet = m.CreateObject(2, Bullet, [this.loc[0],this.loc[1],0], this.rot,0.03,0.03);
				this.tranform.doRotations(this.rot);
				bullet.dir = this.tranform.right;
			}
		}
		

		// Finally update the player movement accordingly
		this.Move();
		
		
	}
 
	OnCollisionEnter(other){
		// Debug message for when the player collided with another physical object
		console.log("Player just collided with " + other.name);
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
		[	// Two triangles that make up a rectangle
			-0.03,1,0, 	1,0,0,
			0.03,1,0,	0,1,0,
			-0.03,-1,0,	0,0,1,
			
			0.03,1,0,	0,0,1,
			0.03,-1,0,	0,1,0,
			-0.03,-1,0,	1,0,0
		   
	   	];

		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.vertices), gl.STATIC_DRAW);
	}

	Update()
	{
		// wall doesnt need to update anything! There are various approaches in how the
		// object should update themselfs. Figured that since wall doenst really move that
		// it shouldnt track any collisions with other object constantly. Also, parts of the walls
		// collide with each other so we dont want them to bug out 
		//this.Move();
	}

	OnCollisionEnter(other){
		// This only gets called when an object other than a wall collides with it
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
			0,0.1,-0.01, 		0.988,0.584,0.050,
			-0.1,-0.1,-0.01,		0.988,0.584,0.050,
			0.1,-0.1,-0.01,		0.988,0.584,0.050,

			// Left side
			0,0.1,-0.01, 		0.988,0.584,0.050,
			-0.1,-0.1,0.01,	0.988,0.584,0.050,
			-0.1,-0.1,-0.01,	0.988,0.584,0.050,

			0,0.1,-0.01, 		0.988,0.584,0.050,
			0,0.1,0.01, 		0.988,0.584,0.050,
			-0.1,-0.1,0.01,	0.988,0.584,0.050,

			// right side
			0,0.1,-0.01, 		0.988,0.584,0.050,
			0,0.1,0.01, 		0.988,0.584,0.050,
			0.1,-0.1,0.01, 	0.988,0.584,0.050,

			0,0.1,-0.01, 		0.988,0.584,0.050,
			0.1,-0.1,-0.01, 	0.988,0.584,0.050,
			0.1,-0.1,0.01, 	0.988,0.584,0.050,

			// Bottom Side
			-0.1,-0.1,0.01, 	0.988,0.584,0.050,
			-0.1,-0.1,0.01, 	0.988,0.584,0.050,
			0.1,-0.1,0.01, 	0.988,0.584,0.050,

			-0.1,-0.1,0.01, 	0.988,0.584,0.050,
			0.1,-0.1,0.01,		0.988,0.584,0.050,
			0.1,-0.1,-0.01, 	0.988,0.584,0.050,

			// Back face
			0,0.1,0.01, 		0.0,0.0,0.0,
			-0.1,-0.1,0.01,	0.0,0.0,0.0,
			0.1,-0.1,0.01,	0.0,0.0,0.0
		   
	   	];

		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.vertices), gl.STATIC_DRAW);
		
	}

	Update()
	{
		// rotate in the y axis constantly and call move to reflect changes
		// The rotation could have been done without the need for Move()
		this.angVelocity = [0,0.008,0];
		this.Move();
	}

	OnTriggerEnter(other){
		if(other.name == "Player")
		{	// A collision from the player will signify that the coin has been 
			// collected
			console.log("Coin just collided with " + other.name);
			console.log("Coin will delete");
			pPara.innerHTML = "Score: " + (++m.score);
			m.DestroyObject(this.id);

			// Print out a message if all coins have been collected!
			if(m.coinCount == 0)
			{
				var collected = document.createElement("p");
				collected.style.color = "orange";
				collected.textContent = "All coins collected!";
				document.body.appendChild(collected);
			}
		}
	}
}

class Enemy extends GameObject
{
	constructor()
	{
		super(6);
		this.name = "Enemy"; 
		//this.hVert;
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
		//this.velocity = [0.007,0,0];	// We want enemy object to already be moving off rip
		this.sign = 0;		// Sign helps in determining in which direction to go when colliding with a wall
	}

	Update()
	{
		// Simply update the enemy movement. Collision wont happen immediately so we want to
		// still update the enemy movement anyways
		this.Move();
	}

	OnCollisionEnter(other)
	{
		if(other.name == "Wall" || other.name == "Enemy")
		{
			// 0 == positive movement (right)
			if(this.sign == 0)
			{
				
				this.velocity = this.velocity.map(value => value * -1);

				this.sign = 1;
			}
			else	// left movement (left)
			{
				
				this.velocity = this.velocity.map(value => value * -1);
				
				this.sign = 0;
			}
		}
		else if(other.name == "Player")
		{
			// If player collides with Enemy then destroy the player!
			var gameOver = document.createElement("p");
			gameOver.style.color = "red";
			gameOver.textContent = "Defeat! The Player has been destroyed!";
			document.body.appendChild(gameOver);
			m.DestroyObject(other.id);
		}
	}
}