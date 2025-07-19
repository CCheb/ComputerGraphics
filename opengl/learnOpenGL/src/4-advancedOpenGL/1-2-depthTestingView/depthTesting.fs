#version 330 core
out vec4 FragColor;

// near and far planes of the frustrum.
float near = 0.1; 
float far = 100.0; 

// converting from non-linear depth buffer to a linear one
float LinearizeDepth(float depth) 
{
    float z = depth * 2.0 - 1.0; // back to NDC 
    // inverse transformation to get it into inverse
    return (2.0 * near * far) / (far + near - z * (far - near));	
}

// varying from fragment shader
in vec2 TexCoords;
uniform sampler2D texture1; // sampler for the textures. only need one as we are rebinding new textures to it


void main()
{             
    // each fragment along with carying color information also carries depth information via its z coordinate.
    // gl_FragCoord is a vec3 that carries screen space coords for its x and y components along with depth information
    // (i.e. how far is the fragment from the viewer). When we enable depth testing we use a special buffer the same size as the 
    // color buffer which contains depth values between [0.0,1.0] and compare these values against the fragments depth value which
    // is calculated after the fragment shader. By enabling depth testing, the OpenGL is able to discard fragments that are behind other
    // fragments thus giving us that 3D jump. This is to say that the right comparison state is used when enabling depth testing.
    
    float depth = LinearizeDepth(gl_FragCoord.z) / far; // divide by far to get depth in range [0,1] for visualization purposes

    // ONLY ENABLE ONE AT A TIME

    // enable for linear depth testing visualization
    //FragColor = vec4(vec3(depth), 1.0);

    // enable for non-linear depth testing visualization
    //FragColor = vec4(vec3(gl_FragCoord.z), 1.0);

    // enable for regular texturing
    FragColor = vec4(texture(texture1, TexCoords).rgb, 1.0);
}