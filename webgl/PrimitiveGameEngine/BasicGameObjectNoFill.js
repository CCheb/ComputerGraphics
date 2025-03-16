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
		this.forward = this.crossMultiply(this.zRot,this.crossMultiply(this.yRot,this.crossMultiply(this.xRot,[0,0,1,0])))
		this.right = this.crossMultiply(this.zRot,this.crossMultiply(this.yRot,this.crossMultiply(this.xRot,[1,0,0,0])))
		this.up = this.crossMultiply(this.zRot,this.crossMultiply(this.yRot,this.crossMultiply(this.xRot,[0,1,0,0])))
	}			
	crossMultiply(M,V)
	{
	console.log(M[0][3]);
	console.log(V[3]);
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
		var tempP = [0,0,0]
		for (var i = 0;  i < 4; i++){
			tempP[i] = this.loc[i]
			tempP[i] = this.velocity[i]
			this.rot[i] += this.angVelocity[i]
		}
		if(!this.isTrigger){
			var clear = true;
			for(var so in m.Solid)
				{ // what is this line
				if(m.CheckCollision(tempP, this.collissionRadius,m.Solid[so].loc,m.Solid[so].collissionRadius))//make sure m.solid does not equal this object
					{
					OnCollisionEnter(m.Solid[so])
					try
					{
						m.Solid[so].OnCollisionEnter(this)
					}
					catch{}
					clear = false
				}
			}
		}
		if(clear){
			this.loc = tempP;
		}
		else{ //this should be right 
			this.loc = tempP;
			for(var so in m.Solid){
				if(m.CheckCollision(tempP, this.collissionRadius,m.Solid[so].loc,m.Solid[so].collissionRadius)){
					this.OnTriggerEnter(m.Solid[so])
					try
					{
						m.Solid[so].OnTriggerEnter(this)
					}
					catch
					{

					}
				}

			}
			for(var so in m.Trigger){ //this should be correct. It is trying to check for tigger objects insted of solid objects
				if(this != m.Trigger[so]){
					if(m.CheckCollision(tempP, this.collissionRadius,m.Trigger[so].loc,m.Trigger[so].collissionRadius)){
						this.OnTriggerEnter(m.Solid[so])
						try
						{
							m.Trigger[so].OnTriggerEnter(this)
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