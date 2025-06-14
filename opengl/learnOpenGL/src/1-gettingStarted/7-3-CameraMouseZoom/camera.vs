#version 330 core
layout (location = 0) in vec3 aPos;
layout (location = 1) in vec2 aTexCoord;
// color attribute would go here

// varying to pass over the texture coordinates over to the fragment shader
// so that they can be used to sample
out vec2 TexCoord;

// These matrices combined take the object from local space all the way to clip space
// where it will be ready for screen space which is done by the fragment shader
uniform mat4 model;
uniform mat4 view;
uniform mat4 projection;

void main()
{
	// read from left to right. We are going through this cycle for every vertex
	gl_Position = projection * view * model * vec4(aPos, 1.0f);
	TexCoord = vec2(aTexCoord.x, aTexCoord.y);
}