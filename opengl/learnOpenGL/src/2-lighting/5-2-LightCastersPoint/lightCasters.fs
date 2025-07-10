#version 330 core
out vec4 FragColor;

// Material struch with both diffuse and specular mappings (essentially just textures to be lit)
struct Material {
    sampler2D diffuse;
    sampler2D specular;    
    float shininess;
}; 

// Light struct to determine light intensities 
struct Light {
    vec3 position;  
  
    vec3
    vec3 diffuse; ambient;
    vec3 specular;
	
    float constant;
    float linear;
    float quadratic;
};

// varyings from the vertex shader
in vec3 FragPos;  
in vec3 Normal;  
in vec2 TexCoords;

// need to initialize the structs and set each of their memebers in the cpu (main.cpp)
uniform vec3 viewPos;
uniform Material material;
uniform Light light;

void main()
{
    // ambient
    // we use material.diffuse since both diffuse and ambient should be the same colors
    vec3 ambient = light.ambient * texture(material.diffuse, TexCoords).rgb;
  	
    // diffuse 
    vec3 norm = normalize(Normal);
    vec3 lightDir = normalize(light.position - FragPos);
    float diff = max(dot(norm, lightDir), 0.0); // angle between lightDir and normal vector
    // for texture we are sampling the diffuse mapping with the corresponding TexCoordinates
    vec3 diffuse = light.diffuse * diff * texture(material.diffuse, TexCoords).rgb;  
    
    // specular
    vec3 viewDir = normalize(viewPos - FragPos);
    // reflection: want the mirror reflection of the light bouncing off of the surface
    vec3 reflectDir = reflect(-lightDir, norm);  
    // calculate specular highlight
    float spec = pow(max(dot(viewDir, reflectDir), 0.0), material.shininess);
    vec3 specular = light.specular * spec * texture(material.specular, TexCoords).rgb;  
    
    // attenuation. allows us to light up objects within a certain distance
    float distance    = length(light.position - FragPos);
    float attenuation = 1.0 / (light.constant + light.linear * distance + light.quadratic * (distance * distance));    

    // enable attenuation for each of the color components. We dont want to do this partially since by doing so
    // object long distances away will be lit when they are not supposed to
    ambient  *= attenuation;  
    diffuse   *= attenuation;
    specular *= attenuation;   
        
    // before we simply multiplied the object color here. Now we multiply the object color component
    // in the calculations themselves and then simply add it all here.
    vec3 result = ambient + diffuse + specular;
    FragColor = vec4(result, 1.0);
} 