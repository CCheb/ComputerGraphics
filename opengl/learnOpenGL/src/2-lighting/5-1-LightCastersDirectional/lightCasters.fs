#version 330 core
out vec4 FragColor;

// Material struct that holds both the diffuse and specular maps
struct Material {
    sampler2D diffuse;  // Basically a normal texture
    sampler2D specular;    // black and white texture where white means to add specularity
    float shininess;    // specular highlight size
}; 

// Light struct for defining the intensity 
struct Light {
    //vec3 position;
    // notice here how we are using direction instead of position since we are working with
    // a directional light
    vec3 direction;

    vec3 ambient;
    vec3 diffuse;
    vec3 specular;
};

// Varyings from the vertex shader
in vec3 FragPos;  
in vec3 Normal;  
in vec2 TexCoords;
  
uniform vec3 viewPos;
// initialize structs and define each of its members in the cpu 
uniform Material material;
uniform Light light;

void main()
{
    // ambient
    // remember that the color of the fragment is the sampled texture using the texture coordinates
    // in other words: light color * object color
    vec3 ambient = light.ambient * texture(material.diffuse, TexCoords).rgb;
  	
    // diffuse 
    vec3 norm = normalize(Normal);
    // vec3 lightDir = normalize(light.position - FragPos);
    // notice here on how we normalize only the light direction since we are not concerned with
    // light positions. We flip the light direction to go from the fragment to the light source
    // since we want the light to shine from the top. remember that this is the light direction in terms
    // of the fragment.
    vec3 lightDir = normalize(-light.direction);  
    float diff = max(dot(norm, lightDir), 0.0); // angle between the normal of the fragment and the light direction
    vec3 diffuse = light.diffuse * diff * texture(material.diffuse, TexCoords).rgb; 
    // light color * angle (strength) * object color 
    
    // specular
    vec3 viewDir = normalize(viewPos - FragPos);
    vec3 reflectDir = reflect(-lightDir, norm); 
    // angle between the reflection of the light and the view direction on that fragment 
    float spec = pow(max(dot(viewDir, reflectDir), 0.0), material.shininess);
    // light color * specular hightlight * object color
    vec3 specular = light.specular * spec * texture(material.specular, TexCoords).rgb;  
    
    // Finally add all of the lighting properties up which will define the final color of the fragment
    vec3 result = ambient + diffuse + specular;
    FragColor = vec4(result, 1.0);
} 