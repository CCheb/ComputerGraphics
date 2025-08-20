#include "camera.h"
#include "glm/ext/matrix_transform.hpp"
#include "glm/trigonometric.hpp"

#include <engine.h>

// we initiallize the pointer to null since we dont want it to cause a segmentation fault
Shader* GameObject::world = nullptr;
//Shader GameObject::weapon = Shader("../src/weaponShader.vs", "../src/weaponShader.fs");

// GameObject
//---------------------------
GameObject::GameObject(glm::vec3 pos, float rot, int sWrap, int tWrap)
{
    this->pos = pos;
    this->rot = rot;
	this->sWrap = sWrap;
	this->tWrap = tWrap;
}

// We take in a shader pointer and borrow it for setting up uniforms and activating the program.
void GameObject::render(Shader* program, unsigned int VAO ,unsigned int textureID, int primitiveType, int verticeCount)
{
	program->use();
	program->setInt("texture1", 0); // sampler will be configured to GL_TEXTURE0
	glBindVertexArray(VAO);
	glActiveTexture(GL_TEXTURE0);
	glBindTexture(GL_TEXTURE_2D, textureID);
	glDrawArrays(primitiveType, 0, verticeCount);
}

void GameObject::cleanShaders()
{
    // world shader
    if(world != nullptr)
    {
        std::cout << "world shader deleted safely" << std::endl;
        delete world;
        world = nullptr;
    }
    else
    {
        std::cout << "world shader was going to be deleted when it was null!" << std::endl;
    }

    // weapon shader
}

// loadTexture is a static function and can only work with other static members thus we pass sWrap and tWrap as parameters
unsigned int GameObject::loadTexture(char const* path, int sWrap, int tWrap, int minFilter, int magFilter)
{
	unsigned int textureID;
    glGenTextures(1, &textureID);

    int width, height, nrComponents;
    unsigned char *data = stbi_load(path, &width, &height, &nrComponents, 0);
    if (data)
    {
        GLenum format;
        if (nrComponents == 1)
            format = GL_RED;
        else if (nrComponents == 3)
            format = GL_RGB;
        else if (nrComponents == 4)
        {
            format = GL_RGBA;
            //std::cout << path << endl;
        }
        
        glBindTexture(GL_TEXTURE_2D, textureID);
        glTexImage2D(GL_TEXTURE_2D, 0, format, width, height, 0, format, GL_UNSIGNED_BYTE, data);
        glGenerateMipmap(GL_TEXTURE_2D);        

        // GL_CLAMP_TO_EDGE takes the edges of the texture and stretches them out
        glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_WRAP_S, format == GL_RGBA ? sWrap : GL_REPEAT); // for this tutorial: use GL_CLAMP_TO_EDGE to prevent semi-transparent borders. Due to interpolation it takes texels from next repeat 
        glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_WRAP_T, format == GL_RGBA ? tWrap : GL_REPEAT);
        glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MIN_FILTER, minFilter); // Default value: GL_LINEAR_MIPMAP_LINEAR
        glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MAG_FILTER, magFilter);	// Default value: GL_LINEAR

        stbi_image_free(data);
    }
    else
    {
        std::cout << "Texture failed to load at path: " << path << std::endl;
        stbi_image_free(data);
    }

    return textureID;
}


// Cube
//--------------------------
float Cube::vertices[] =
{
    // positions          // texture Coords
    -0.5f, -0.5f, -0.5f,  0.0f, 0.0f,
     0.5f, -0.5f, -0.5f,  1.0f, 0.0f,
     0.5f,  0.5f, -0.5f,  1.0f, 1.0f,
     0.5f,  0.5f, -0.5f,  1.0f, 1.0f,
    -0.5f,  0.5f, -0.5f,  0.0f, 1.0f,
    -0.5f, -0.5f, -0.5f,  0.0f, 0.0f,

    -0.5f, -0.5f,  0.5f,  0.0f, 0.0f,
     0.5f, -0.5f,  0.5f,  1.0f, 0.0f,
     0.5f,  0.5f,  0.5f,  1.0f, 1.0f,
     0.5f,  0.5f,  0.5f,  1.0f, 1.0f,
    -0.5f,  0.5f,  0.5f,  0.0f, 1.0f,
    -0.5f, -0.5f,  0.5f,  0.0f, 0.0f,

    -0.5f,  0.5f,  0.5f,  1.0f, 0.0f,
    -0.5f,  0.5f, -0.5f,  1.0f, 1.0f,
    -0.5f, -0.5f, -0.5f,  0.0f, 1.0f,
    -0.5f, -0.5f, -0.5f,  0.0f, 1.0f,
    -0.5f, -0.5f,  0.5f,  0.0f, 0.0f,
    -0.5f,  0.5f,  0.5f,  1.0f, 0.0f,

     0.5f,  0.5f,  0.5f,  1.0f, 0.0f,
     0.5f,  0.5f, -0.5f,  1.0f, 1.0f,
     0.5f, -0.5f, -0.5f,  0.0f, 1.0f,
     0.5f, -0.5f, -0.5f,  0.0f, 1.0f,
     0.5f, -0.5f,  0.5f,  0.0f, 0.0f,
     0.5f,  0.5f,  0.5f,  1.0f, 0.0f,

    -0.5f, -0.5f, -0.5f,  0.0f, 1.0f,
     0.5f, -0.5f, -0.5f,  1.0f, 1.0f,
     0.5f, -0.5f,  0.5f,  1.0f, 0.0f,
     0.5f, -0.5f,  0.5f,  1.0f, 0.0f,
    -0.5f, -0.5f,  0.5f,  0.0f, 0.0f,
    -0.5f, -0.5f, -0.5f,  0.0f, 1.0f,

    -0.5f,  0.5f, -0.5f,  0.0f, 1.0f,
     0.5f,  0.5f, -0.5f,  1.0f, 1.0f,
     0.5f,  0.5f,  0.5f,  1.0f, 0.0f,
     0.5f,  0.5f,  0.5f,  1.0f, 0.0f,
    -0.5f,  0.5f,  0.5f,  0.0f, 0.0f,
    -0.5f,  0.5f, -0.5f,  0.0f, 1.0f

};
// initialize VAO, VBO, and textureID to 0 which signifies that they dont point to any OpenGL object
unsigned int Cube::VAO = 0;
unsigned int Cube::VBO = 0;
unsigned int Cube:: textureID = 0;
Cube::Cube(glm::vec3 pos, float rot, int primitiveType, int verticeCount) : GameObject(pos, rot, GL_CLAMP_TO_EDGE, GL_CLAMP_TO_EDGE)
{
    // primitiveType and verticeCount have default values so this is skipped if nothing is specified by the user
    this->primitiveType = primitiveType;
    this->verticeCount = verticeCount;

    // As soon as the first object is instantiated we want to set up the VAO and VBO
    if(VAO == 0)
    {
        glGenVertexArrays(1, &VAO);
        glGenBuffers(1, &VBO);
        glBindVertexArray(VAO);
        glBindBuffer(GL_ARRAY_BUFFER, VBO);
        glBufferData(GL_ARRAY_BUFFER, sizeof(vertices), vertices, GL_STATIC_DRAW);
        glEnableVertexAttribArray(0);
        glVertexAttribPointer(0, 3, GL_FLOAT, GL_FALSE, 5 * sizeof(float), (void*)0);
        glEnableVertexAttribArray(1);
        glVertexAttribPointer(1, 2, GL_FLOAT, GL_FALSE, 5 * sizeof(float), (void*)(3 * sizeof(float)));
    }

    // Same idea goes for the textureID
    if(textureID == 0)
    {
        textureID = GameObject::loadTexture("../resources/textures/marble.jpg", sWrap, tWrap);
    }

    // default the model matrix. In this case we dont do perspective and view matrices since that will be handled by the camera
    model = glm::mat4(1.0f);
}

void Cube::update() 
{
    // make sure to reset the model matrix or else it will remember previous translates and rotations
    GameObject::world->use();
    model = glm::mat4(1.0f);
    model = glm::translate(model, pos);
    model = glm::rotate(model, glm::radians(rot), glm::vec3(1.0,1.0f,1.0f));
    GameObject::world->setMat4("model", model);
}

// Cubes render() acts like a wrapper to GameObjects render()
void Cube::draw()
{
    GameObject::render(GameObject::world, VAO, textureID, primitiveType, verticeCount);
}

// Always make sure to clean up OpenGL data like VAO's and VBO's. In this case we implement a static function
// that will be called at the end of main outside of the loop.
void Cube::cleanUp()
{
    if(VAO != 0)
        glDeleteVertexArrays(1, &VAO);

    if(VBO != 0)
        glDeleteBuffers(1, &VBO);
}



// Player
//----------------------
Player::Player(glm::vec3 pos, float rot, unsigned int scr_width, unsigned int scr_height): camera(pos, rot)
{
    projection = glm::mat4(1.0f);
    view = glm::mat4(1.0f);
    model = glm::mat4(1.0f);
    weaponSelection = 0;
    this->scr_width = scr_width;
    this->scr_height = scr_height;
}


// this should be key_callback not process. That way we call the key once
void Player::processInput(GLFWwindow *window)
{
    if(glfwGetKey(window, GLFW_KEY_1) == GLFW_PRESS)
    {
        weaponSelection = 0;
        std::cout << weaponSelection << std::endl;
    }
    
    if(glfwGetKey(window, GLFW_KEY_2) == GLFW_PRESS)
    {
        weaponSelection = 1;
        std::cout << weaponSelection << std::endl;
    }



}

void Player::update(GLFWwindow *window)
{
    processInput(window);
    GameObject::world->use();
    projection = glm::perspective(glm::radians(camera.Zoom), (float)scr_width / (float)scr_height, 0.1f, 100.0f);
    view = camera.GetViewMatrix();
    model = glm::mat4(1.0f);
    GameObject::world->setMat4("projection", projection);
    GameObject::world->setMat4("view", view);   
}

void Player::draw()
{
    // Draw weapon/UI elements here

}





