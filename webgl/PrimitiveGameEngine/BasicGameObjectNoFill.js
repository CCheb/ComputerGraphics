class Transform
{
	constructor()
	{
		// Isnt this the same as the loc and rot we had in the gems? If
		// so then why do this here and not in the vertex shader
		this.forward = [0,0,1];
		this.right = [1,0,0];
		this.up = [0,1,0];
	}

	doRotations(RotAngles)
	{
		// All this function does is calculate the rotation for the object by combining
		// x, y, and z rotations into one R matrix which contains the rotation information 
		// for all the axies
		this.xRot = [
					[1,0,0,0],
					[0,Math.cos(RotAngles[0]),-1*Math.sin(RotAngles[0]),0],
					[0,Math.sin(RotAngles[0]),Math.cos(RotAngles[0]),0],
					[0,0,0,1]
				];		
		this.yRot = [
				[Math.cos(RotAngles[1]),0,Math.sin(RotAngles[1]),0],
				[0,1,0,0],
				[-1*Math.sin(RotAngles[1]),0,Math.cos(RotAngles[1]),0],
				[0,0,0,1]	
				];
		this.zRot = [
					[Math.cos(RotAngles[2]),-1*Math.sin(RotAngles[2]),0,0],
					[Math.sin(RotAngles[2]),Math.cos(RotAngles[2]),0,0],
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
	constructor() 
	{
		this.loc = [0,0,0];
		this.rot = [0,0,0];
		this.isTrigger = false;
		this.collissionRadius = 0.1; //this by default may be too large
		this.velocity = [0,0,0];
		this.angVelocity = [0,0,0];
		this.name = "Default";
		this.id = 0;
		this.tranform = new Transform();
		this.prefab;
	}

	//assuming that velocity is set correctly 
	Move(){
		// tempP acts as the ghost/future self of the object thats
		// moving or rotating. We dont want to immediately apply the new
		// rotation and movement to the real object just yet. This so that we
		// prevent screen jitters when colliding with a solid
		var tempP = [0,0,0];
		// Changed from 4 to 3 since it will go out of bounds
		for (var i = 0;  i < 3; i++){
			tempP[i] = this.loc[i];
			tempP[i] = this.velocity[i];
			this.rot[i] += this.angVelocity[i];
		}
		// If its not a trigger object (Its a solid)
		if(!this.isTrigger){
			// Assume that there is nothing in the way
			var clear = true;	// Would probably need this outside
			for(var so in m.Solid)		// Remember that m is a global variable!
			{ 
				// While looping through each solid object we use tempP to check if there is a collision with every other
				// solid. Keep in mind that we would need to implement a way to ignore the object associated with temp
				if(m.CheckCollision(tempP, this.collissionRadius, m.Solid[so].loc, m.Solid[so].collissionRadius))//make sure m.solid does not equal this object
				{
					// If a collision is encounterd 
					// These two OnCollissionEnters are the same
					OnCollisionEnter(m.Solid[so]);
					try
					{
						// Why do a try in the first place?
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
		else{ //this should be right 
			this.loc = tempP;
			for(var so in m.Solid){
				// If we already collided with the solid object earlier and it has a OnTriggerEnter then
				// we can simply store it and use it here
				if(m.CheckCollision(tempP, this.collissionRadius,m.Solid[so].loc,m.Solid[so].collissionRadius)){
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
			for(var so in m.Trigger){ //this should be correct. It is trying to check for trigger objects insted of solid objects
				if(this != m.Trigger[so]){
					if(m.CheckCollision(tempP, this.collissionRadius,m.Trigger[so].loc,m.Trigger[so].collissionRadius)){
						this.OnTriggerEnter(m.Solid[so]);
						try
						{
							m.Trigger[so].OnTriggerEnter(this);
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
	Render(program) //needs this.program
	{
		//could possibly impliment render here
		console.error(this.name + " render() is NOT IMPLEMENTED!");
	}	
}


//shape extends game object 

class Demo extends GameObject
{
	constructor()
	{
		super();

	}
	
}