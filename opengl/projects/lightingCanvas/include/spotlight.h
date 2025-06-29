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
        innerCutoff(glm::cos(glm::radians(20.5f))), outerCutoff(glm::cos(glm::radians(27.0f)))
        {
            // set lighting attributes
            position = pos;
            direction = dir;
            rotDirection = rotDir;
            diffuse = color;

            setSpotlight(lightingShader);

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

        void move(Shader& lightingShader)
        {
            float radius = 10.0f;

            // Determine ccw (true) or cw (false) direction
            float rotDir = rotDirection ? 1.0f : -1.0f;
            float time = glfwGetTime();
            // -10.0 -15.0
            position.x = radius * cos(rotDir * time);
            position.z = radius * sin(rotDir * time);


            // serves as the spotlight dir
            glm::vec3 front = glm::normalize(glm::vec3(0.0f) - position);
            direction = front;

            
            

            setSpotlight(lightingShader);
        }

        void update(Shader& lightingShader, glm::mat4& projection, glm::mat4& view)
        {
            // setting projection and view matrices
            lightingShader.setMat4("projection", projection);
            lightingShader.setMat4("view", view);

            // moving cube
            glm::mat4 model = glm::mat4(1.0f);
            model = glm::translate(model, position);
            lightingShader.setMat4("model", model);
        }

        void render()
        {
            // bind the VAO as current and render
            glBindVertexArray(VAO);
            glDrawArrays(GL_TRIANGLES, 0, 36);
        }

    private:

        unsigned int VBO, VAO;

        void setSpotlight(Shader& lightingShader)
        {
           // lightingShader.setVec3(spotlight.append(".position"), position);
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
        }

};