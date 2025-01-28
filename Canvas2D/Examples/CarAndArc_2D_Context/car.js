class Vehicle
{
	constructor()
	{
		this.speed = 10;	
	}	
}

// The car class inherits from the Vehicle class
class Car extends Vehicle
{
	constructor()
	{
		// We can reference the parents constructor or methods using the
		// super keyword. In this case we are calling the parents constructor
		// which defines speed to be 10. If we wanted to call a parent method
		// we use super.methodName(any parameters). super allows us to override
		// parent methods as well since the keyword allows js to diferentiate from
		// the two.
		super();

		// The car will start drawing at positon 100x100 and move right
		// Center postition of the car
		this.x =100;
		this.y =100;
	}
	update()
	{
		// move the car to the right by 4 units
		this.x+=4;
	}
	render()
	{	
			// remember that the context (ctx) gives us the ability to
			// draw to the screen! Its a global variable that can be accessed
			// anywhere in the program and it makes sense why it is so
			console.log("The speed is "+this.speed);

			// Random colors
			this.randColor1 = Math.floor(Math.random() * 256);
			this.randColor2 = Math.floor(Math.random() * 256);
			this.randColor3 = Math.floor(Math.random() * 256);
			// Set the "pencil" attributes
			ctx.lineJoin = "miter"; 	// A square join
			ctx.lineWidth = 3;
			ctx.fillStyle = `rgb(${this.randColor1}, ${this.randColor2}, ${this.randColor3})`;
			ctx.strokeStyle = "#333";	// a shade of black

			// Shape drawing
			ctx.beginPath();
			ctx.arc(this.x,this.y,25,0,2*Math.PI,false);
			ctx.fill();		// Draw body
			ctx.beginPath();
			ctx.arc(this.x-25,this.y+25,15,0,2*Math.PI, false);
			ctx.stroke();	// Draw left wheel (circle)
			ctx.beginPath();
			ctx.arc(this.x+25,this.y+25,15,0,2*Math.PI, false);	
			ctx.stroke();	// Draw right wheel
	}
	
	
}