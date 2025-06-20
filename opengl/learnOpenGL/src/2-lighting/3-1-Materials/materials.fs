#version 330 core
out vec4 FragColor;

// Object material struct. The struct in this case helps in keeping related
// data organized in one place and is used to create a unique namespace.
struct Material {
    vec3 ambient;   // Defines the lighting of the environment. should be kept very low
    vec3 diffuse;   // defines the how the object is lit depending on the direction of the light
    vec3 specular;    // defines the specular highlight which is mostly defined by the light
    float shininess;    // how large the specular highlight is; increases in powers of 2
}; 

struct Light {
    vec3 position;

    // Not only does the object have lighting components, so does the light source as well
    // in this case its more about defining how bright the light source should be along with
    vec3 ambient;
    vec3 diffuse;
    vec3 specular;
};

// varying from vertex shader
in vec3 FragPos;  
in vec3 Normal;  

uniform vec3 viewPos;   // camera position

// initialize the structs where we would then set each member manually
// idea is to define the objects color through the lighting components along with
// how bright eh light should shine with the benefit of granular control since we are not
// working with constants but vec3s
uniform Material material;
uniform Light light;

void main()
{
    // remember that all of this will be adopted by the object not the light source
    // we set lighting properties here because they will affect how the object is lit
   

    // ambient
    vec3 ambient = light.ambient * material.ambient;
  	
    // diffuse 
    vec3 norm = normalize(Normal);
    vec3 lightDir = normalize(light.position - FragPos);   
    float diff = max(dot(norm, lightDir), 0.0);     // angle between normal and light direction
    vec3 diffuse = light.diffuse * (diff * material.diffuse);
    
    // specular
    vec3 viewDir = normalize(viewPos - FragPos);     // in world space
    vec3 reflectDir = reflect(-lightDir, norm);  
    float spec = pow(max(dot(viewDir, reflectDir), 0.0), material.shininess);
    vec3 specular = light.specular * (spec * material.specular);  
    
    // each of the lighting calculations have the objects color baked in
    // so all we have to do is simply add the components together and send it 
    vec3 result = ambient + diffuse + specular;
    FragColor = vec4(result, 1.0);
} 