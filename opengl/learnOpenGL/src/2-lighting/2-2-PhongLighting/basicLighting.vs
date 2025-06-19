#version 330 core
layout (location = 0) in vec3 aPos;     // position attribute
layout (location = 1) in vec3 aNormal;  // normal attribute


out vec3 FragPos;   // position of fragment/vertex
out vec3 Normal;    // the normal of that particular fragment


uniform mat4 model;
uniform mat4 view;
uniform mat4 projection;


void main()
{
    // need the fragment in world space. could also get it in view space
    // by multiplying the view matrix as well
    FragPos = vec3(model * vec4(aPos, 1.0));
    
    // calculating the normal matrix which is the transpose of the inverse of the
    // upper left 3x3 portion of the model matrix. This matrix exists with the intention
    // of properly adjusting the normal vector if any non-uniform scales are made in the model
    // matrix which will skew the normal.
    Normal = mat3(transpose(inverse(model))) * aNormal;  
    
    // Know that the normal matrix should be calculated in CPU (program code) and not the
    // GPU since it takes a heavy toll on the shaders.


    // FragPos already contains the model matrix so we can repeat it here
    gl_Position = projection * view * vec4(FragPos, 1.0);
}