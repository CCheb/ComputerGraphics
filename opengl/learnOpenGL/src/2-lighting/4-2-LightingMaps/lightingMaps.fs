#version 330 core
out vec4 FragColor;

// now instead of vec3s we now have a samplers for the diffuse and specular maps
// diffuse is essentially just the regular texture while the specular map represents 
// a black and white image of the same texture. The idea is that black = no specularity
// while white = full specularity
struct Material {
    sampler2D diffuse;
    sampler2D specular;    
    float shininess;    // shininess constant
}; 

// same lighting components since these focus on the instensity of the light which will
// alter the object color if light color is not white
struct Light {
    vec3 position;

    vec3 ambient;
    vec3 diffuse;
    vec3 specular;
};

// varyings brought from vertex shader
in vec3 FragPos;  
in vec3 Normal;  
in vec2 TexCoords;

uniform vec3 viewPos;
// instantiate the structs which we'll need to set each of the members in the cpu
uniform Material material;
uniform Light light;

void main()
{
    // remember that the objects color will be baked into the calculations along with the 
    // light color.

    // ambient. Notice how we sample the fragments color via the texture coordinates
    // the objects color will be the texture itself. we use diffuse here for setting the 
    // ambient because most of the time the ambient and diffuse components will be the same
    vec3 ambient = light.ambient * texture(material.diffuse, TexCoords).rgb;
  	
    // diffuse 
    vec3 norm = normalize(Normal);
    vec3 lightDir = normalize(light.position - FragPos);
    float diff = max(dot(norm, lightDir), 0.0); // angle between light dir and fragment normal\

    // light.diffuse and diff help calculate how strong the fragment is being lit.
    vec3 diffuse = light.diffuse * diff * texture(material.diffuse, TexCoords).rgb;  
    
    // specular
    vec3 viewDir = normalize(viewPos - FragPos);
    vec3 reflectDir = reflect(-lightDir, norm);  
    float spec = pow(max(dot(viewDir, reflectDir), 0.0), material.shininess);   // angle between camera dir and light reflection
    vec3 specular = light.specular * spec * texture(material.specular, TexCoords).rgb;  
        
    // once all is calculated we simply add them together which will then be applied to the fragment and eventually interpolated.
    vec3 result = ambient + diffuse + specular;
    FragColor = vec4(result, 1.0);
} 