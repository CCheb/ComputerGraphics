#include <glad/glad.h>
#include <GLFW/glfw3.h>

#include "pyramid.h"
#include <glm/glm.hpp>
#include <glm/gtc/matrix_transform.hpp>
#include <glm/gtc/type_ptr.hpp>


Pyramid::Pyramid(float x, float y, float z)
{
    // initiallize the rot values to 0;
    rot[0] = 0.0;
    rot[1] = 0.0;
    rot[2] = 0.0;

    loc[0] = x;
    loc[1] = y;
    loc[2] = z;
    // Make sure to list the vertices in CCW order since openGL considers
    // CCW to be front facing and CW back facing
    float vertices[]
    {
        // Base triangle (front face, CCW from front view)
        0.5f, -0.5f,  0.0f,   1,0,0,   // right
        -0.5f, -0.5f,  0.0f,   0,0,0,   // left
        0.0f,  0.5f,  0.0f,   1,0,0,   // top

        // Side 1
        -0.5f, -0.5f,  0.0f,   0,1,0,   // base left
         0.5f, -0.5f,  0.0f,   0,1,0,   // base right
         0.0f,  0.0f, -0.5f,   0,1,0,   // back tip

        // Side 2
         0.5f, -0.5f,  0.0f,   0,0,1,   // base right
         0.0f,  0.5f,  0.0f,   0,0,1,   // top
         0.0f,  0.0f, -0.5f,   0,0,1,   // back tip

        // Side 3
         0.0f,  0.5f,  0.0f,   1,1,0,   // top
        -0.5f, -0.5f,  0.0f,   1,1,0,   // base left
         0.0f,  0.0f, -0.5f,   1,1,0    // back tip

    };

    // Go ahead and create the vertex buffer and copy its values over
    // along with formating the VAO. After this everything should be recorded and set 
    glGenVertexArrays(1, &VAO);
    glGenBuffers(1, &VBO);

    glBindVertexArray(VAO);

    glBindBuffer(GL_ARRAY_BUFFER, VBO);
    glBufferData(GL_ARRAY_BUFFER, sizeof(vertices), vertices, GL_STATIC_DRAW);

    // position attribute
    glVertexAttribPointer(0, 3, GL_FLOAT, GL_FALSE, 6 * sizeof(float), (void*)0);
    glEnableVertexAttribArray(0);
    // color attribute
    glVertexAttribPointer(1, 3, GL_FLOAT, GL_FALSE, 6 * sizeof(float), (void*)(3 * sizeof(float)));
    glEnableVertexAttribArray(1);

}

Pyramid::~Pyramid()
{
    // Do proper clean up at the end of the program
    if (VAO) glDeleteVertexArrays(1, &VAO);
    if (VBO) glDeleteBuffers(1, &VBO);
}

// Move constructor
Pyramid::Pyramid(Pyramid&& other) noexcept {
    for (int i = 0; i < 3; ++i) {
        loc[i] = other.loc[i];
        rot[i] = other.rot[i];
    }

    VAO = other.VAO;
    VBO = other.VBO;

    other.VAO = 0;
    other.VBO = 0;
}

// Move assignment operator
Pyramid& Pyramid::operator=(Pyramid&& other) noexcept {
    if (this != &other) {
        if (VAO) glDeleteVertexArrays(1, &VAO);
        if (VBO) glDeleteBuffers(1, &VBO);

        for (int i = 0; i < 3; ++i) {
            loc[i] = other.loc[i];
            rot[i] = other.rot[i];
        }

        VAO = other.VAO;
        VBO = other.VBO;

        other.VAO = 0;
        other.VBO = 0;
    }
    return *this;
}




void Pyramid::update(unsigned int program, GLFWwindow *window)
{
    // User input. User will be able to rotate the pyramid using wasd
    if(glfwGetKey(window, GLFW_KEY_W) == GLFW_PRESS)
        rot[0] += 0.01;
    if(glfwGetKey(window, GLFW_KEY_A) == GLFW_PRESS)
        rot[1] += 0.01;
    if(glfwGetKey(window, GLFW_KEY_S) == GLFW_PRESS)
        rot[0] -= 0.01;
    if(glfwGetKey(window, GLFW_KEY_D) == GLFW_PRESS)
        rot[1] -= 0.01;
    
    // Create transformation matrix that will rotate the pyramid in the x and y axes
    // process involves building the matrix from scratch starting with the identity
    // matrix and passing it over to a mat4 uniform in the vertex shader
    glm::mat4 transform = glm::mat4(1.0f);

    // Could optionaly move the pyramid through a transform
    transform = glm::translate(transform, glm::vec3(loc[0], loc[1], loc[2]));
    transform = glm::rotate(transform, rot[0], glm::vec3(1.0f, 0.0f, 0.0f));
    transform = glm::rotate(transform, rot[1], glm::vec3(0.0f, 1.0f, 0.0f));

    unsigned int transformLoc = glGetUniformLocation(program, "transform");
    glUniformMatrix4fv(transformLoc, 1, GL_FALSE, glm::value_ptr(transform));


}

void Pyramid::render() const
{
    // bind the VAO as current and render
    glBindVertexArray(VAO);
    glDrawArrays(GL_TRIANGLES, 0, 12);
}

