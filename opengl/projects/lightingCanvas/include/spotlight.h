#pragma once

#include <glad/glad.h>
#include <GLFW/glfw3.h>

#include <glm/glm.hpp>
#include <glm/gtc/matrix_transform.hpp>
#include <glm/gtc/type_ptr.hpp>

#include <shader/shader_m.h>
#include <string>

class Spotlight
{
    public:
        // movement
        
        glm::vec3 position;
        glm::vec3 direction;
        float rotDirection;
        // Intensities/colors
        glm::vec3 ambient;
        glm::vec3 diffuse;
        glm::vec3 specular;
        // attenuation
        float constant, linear, quadratic;
        // inner and outer cones
        float innerCutoff, outerCutoff;

        Spotlight(glm::vec3& pos, glm::vec3& dir, glm::vec3& color, bool rotDir, Shader& lightingShader)
        : ambient(glm::vec3(1.0f)), specular(glm::vec3(1.0f)), constant(1.0f), linear(0.09f), quadratic(0.032f),
        innerCutoff(glm::cos(glm::radians(8.5f))), outerCutoff(glm::cos(glm::radians(15.0f)))
        {
            // set lighting attributes
            position = pos;
            direction = dir;
            rotDirection = rotDir;
            diffuse = color;

            //setSpotlight(lightingShader);

            float vertices[]
            {
                 // positions          // normals          
                -0.5f, -0.5f, -0.5f,  
                 0.5f, -0.5f, -0.5f,  
                 0.5f,  0.5f, -0.5f,  
                 0.5f,  0.5f, -0.5f, 
                -0.5f,  0.5f, -0.5f,  
                -0.5f, -0.5f, -0.5f,  

                -0.5f, -0.5f,  0.5f, 
                 0.5f, -0.5f,  0.5f,  
                 0.5f,  0.5f,  0.5f,  
                 0.5f,  0.5f,  0.5f, 
                -0.5f,  0.5f,  0.5f,  
                -0.5f, -0.5f,  0.5f,  

                -0.5f,  0.5f,  0.5f, 
                -0.5f,  0.5f, -0.5f, 
                -0.5f, -0.5f, -0.5f, 
                -0.5f, -0.5f, -0.5f, 
                -0.5f, -0.5f,  0.5f, 
                -0.5f,  0.5f,  0.5f, 

                 0.5f,  0.5f,  0.5f, 
                 0.5f,  0.5f, -0.5f, 
                 0.5f, -0.5f, -0.5f,  
                 0.5f, -0.5f, -0.5f, 
                 0.5f, -0.5f,  0.5f,  
                 0.5f,  0.5f,  0.5f,  

                -0.5f, -0.5f, -0.5f, 
                 0.5f, -0.5f, -0.5f, 
                 0.5f, -0.5f,  0.5f, 
                 0.5f, -0.5f,  0.5f,  
                -0.5f, -0.5f,  0.5f,  
                -0.5f, -0.5f, -0.5f,  

                -0.5f,  0.5f, -0.5f, 
                 0.5f,  0.5f, -0.5f,  
                 0.5f,  0.5f,  0.5f,  
                 0.5f,  0.5f,  0.5f,  
                -0.5f,  0.5f,  0.5f, 
                -0.5f,  0.5f, -0.5f

            };

            glGenVertexArrays(1, &VAO);
            glGenBuffers(1, &VBO);

            glBindVertexArray(VAO);

            glBindBuffer(GL_ARRAY_BUFFER, VBO);
            glBufferData(GL_ARRAY_BUFFER, sizeof(vertices), vertices, GL_STATIC_DRAW);

            // position attribute
            glVertexAttribPointer(0, 3, GL_FLOAT, GL_FALSE, 3 * sizeof(float), (void*)0);
            glEnableVertexAttribArray(0);

        }

        void update(Shader& lightCubeShader)
        {
            float radius = 10.0f;

            // Determine ccw (true) or cw (false) direction
            float rotDir = rotDirection ? 1.0f : -1.0f;
            float time = glfwGetTime();
            // -10.0 -15.0
            position.x =  rotDir * radius * cos(rotDir * time);
            //position.z = -15.0f + radius * sin(rotDir * time);


            // serves as the spotlight dir
            glm::vec3 front = glm::normalize(glm::vec3(0.0f,0.0f,-1.0f));
            direction = front;

            // moving cube
            glm::mat4 model = glm::mat4(1.0f);
            model = glm::translate(model, position);
            lightCubeShader.setMat4("model", model);

            //setSpotlight(lightingShader);
        }

        void render()
        {
            // bind the VAO as current and render
            glBindVertexArray(VAO);
            glDrawArrays(GL_TRIANGLES, 0, 36);
        }

   

        void setSpotlight(Shader& lightingShader, std::string& it)
        {
            //lightingShader.use();
           // lightingShader.setVec3(spotlight.append(".position"), position);
           /*
            lightingShader.setVec3("spotLight.position", position);
            lightingShader.setVec3("spotLight.direction", direction);
            lightingShader.setVec3("spotLight.ambient", ambient);
            lightingShader.setVec3("spotLight.diffuse", diffuse);
            lightingShader.setVec3("spotLight.specular", specular);
            lightingShader.setFloat("spotLight.constant", constant);
            lightingShader.setFloat("spotLight.linear", linear);
            lightingShader.setFloat("spotLight.quadratic", quadratic);
            lightingShader.setFloat("spotLight.cutOff", innerCutoff);
            lightingShader.setFloat("spotLight.outerCutOff", outerCutoff);   
            */

            lightingShader.setVec3(it + ".position", position);
            lightingShader.setVec3(it + ".direction", direction);
            lightingShader.setVec3(it + ".ambient", ambient);
            lightingShader.setVec3(it + ".diffuse", diffuse);
            lightingShader.setVec3(it + ".specular", specular);
            lightingShader.setFloat(it + ".constant", constant);
            lightingShader.setFloat(it + ".linear", linear);
            lightingShader.setFloat(it + ".quadratic", quadratic);
            lightingShader.setFloat(it + ".cutOff", innerCutoff);
            lightingShader.setFloat(it + ".outerCutOff", outerCutoff); 
        }
        
    private:

        unsigned int VBO, VAO;

};