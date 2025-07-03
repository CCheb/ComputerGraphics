#include <glad/glad.h>
#include <GLFW/glfw3.h>

#include <Missile.h>

Missile::Missile(glm::vec3 front, glm::vec3 position, float yaw, float pitch, float speed)
: right(glm::vec3(0.0f)), up(glm::vec3(0.0f)), worldUp(glm::vec3(0.0f,1.0f,0.0f))
{
    // Initialize members with user defined values
    this->front = front;
    this->position = position;
    this->yaw = yaw;
    this->pitch = pitch;
    this->speed = speed;

    // Make sure to list the vertices in CCW order since openGL considers
    // CCW to be front facing and CW back facing
    float vertices[]
    {
         // positions          // color         
        -0.5f, -0.5f, -0.5f,  1.0f,  0.0f, 0.0f,
         0.5f, -0.5f, -0.5f,  1.0f,  0.0f, 0.0f,
         0.5f,  0.5f, -0.5f,  1.0f,  0.0f, 0.0f,
         0.5f,  0.5f, -0.5f,  1.0f,  0.0f, 0.0f,
        -0.5f,  0.5f, -0.5f,  1.0f,  0.0f, 0.0f,
        -0.5f, -0.5f, -0.5f,  1.0f,  0.0f, 0.0f,

        -0.5f, -0.5f,  0.5f,  1.0f,  1.0f,  1.0f,
         0.5f, -0.5f,  0.5f,  1.0f,  1.0f,  1.0f,
         0.5f,  0.5f,  0.5f,  1.0f,  1.0f,  1.0f,
         0.5f,  0.5f,  0.5f,  1.0f,  1.0f,  1.0f,
        -0.5f,  0.5f,  0.5f,  1.0f,  1.0f,  1.0f,
        -0.5f, -0.5f,  0.5f,  1.0f,  1.0f,  1.0f,

        -0.5f,  0.5f,  0.5f, 1.0f,  1.0f,  1.0f,
        -0.5f,  0.5f, -0.5f, 1.0f,  1.0f,  1.0f,
        -0.5f, -0.5f, -0.5f, 1.0f,  1.0f,  1.0f,
        -0.5f, -0.5f, -0.5f, 1.0f,  1.0f,  1.0f,
        -0.5f, -0.5f,  0.5f, 1.0f,  1.0f,  1.0f,
        -0.5f,  0.5f,  0.5f, 1.0f,  1.0f,  1.0f,

         0.5f,  0.5f,  0.5f,  1.0f,  1.0f,  1.0f,
         0.5f,  0.5f, -0.5f,  1.0f,  1.0f,  1.0f,
         0.5f, -0.5f, -0.5f,  1.0f,  1.0f,  1.0f,
         0.5f, -0.5f, -0.5f,  1.0f,  1.0f,  1.0f,
         0.5f, -0.5f,  0.5f,  1.0f,  1.0f,  1.0f,
         0.5f,  0.5f,  0.5f,  1.0f,  1.0f,  1.0f,

        -0.5f, -0.5f, -0.5f,  1.0f, 1.0f,  1.0f,
         0.5f, -0.5f, -0.5f,  1.0f, 1.0f,  1.0f,
         0.5f, -0.5f,  0.5f,  1.0f, 1.0f,  1.0f,
         0.5f, -0.5f,  0.5f,  1.0f, 1.0f,  1.0f,
        -0.5f, -0.5f,  0.5f,  1.0f, 1.0f,  1.0f,
        -0.5f, -0.5f, -0.5f,  1.0f, 1.0f,  1.0f,

        -0.5f,  0.5f, -0.5f,  1.0f,  1.0f,  1.0f,
         0.5f,  0.5f, -0.5f,  1.0f,  1.0f,  1.0f,
         0.5f,  0.5f,  0.5f,  1.0f,  1.0f,  1.0f,
         0.5f,  0.5f,  0.5f,  1.0f,  1.0f,  1.0f,
        -0.5f,  0.5f,  0.5f,  1.0f,  1.0f,  1.0f,
        -0.5f,  0.5f, -0.5f,  1.0f,  1.0f,  1.0f

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

Missile::~Missile()
{
    // Do proper clean up at the end of the program
    // delete if they are indeed active 
    if (VAO) glDeleteVertexArrays(1, &VAO);
    if (VBO) glDeleteBuffers(1, &VBO);
}

Missile::Missile(Missile&& other) noexcept 
{
    front = other.front;
    position = other.position;
    yaw = other.yaw;
    pitch = other.pitch;
    speed = other.speed;

    //non user defined
    right = other.right;
    up = other.up;
    worldUp = other.worldUp;

    //Copying gpu related buffers
    VAO = other.VAO;
    VBO = other.VBO;

    // Complete movement by setting the old to 0 thus avoiding the double deletion
    other.VAO = 0;
    other.VBO = 0;
}

Missile& Missile::operator=(Missile&& other) noexcept
{
    // Delete the current one and get the new one
    if(this != &other)
    {
        if (VAO) glDeleteVertexArrays(1, &VAO);
        if (VBO) glDeleteBuffers(1, &VBO);

        front = other.front;
        position = other.position;
        yaw = other.yaw;
        pitch = other.pitch;
        speed = other.speed;

        //non user defined
        right = other.right;
        up = other.up;
        worldUp = other.worldUp;

        //Copying gpu related buffers
        VAO = other.VAO;
        VBO = other.VBO;

        // Complete movement by setting the old to 0 thus avoiding the double deletion
        other.VAO = 0;
        other.VBO = 0;

    }
    return *this;

}

void Missile::update(GLFWwindow* window, Shader& vShader, float deltaTime)
{
    processInput(window);

    // Calculate velocity
    float velocity = speed * deltaTime;

    // Calculate any changes to front 
    glm::vec3 front;
    front.x = cos(glm::radians(yaw)) * cos(glm::radians(pitch));
    front.y = sin(glm::radians(pitch));
    front.z = sin(glm::radians(yaw)) * cos(glm::radians(pitch));
    this->front = glm::normalize(front);

    // Calculate right and up vectors
    right = glm::normalize(glm::cross(this->front, worldUp));
    up = glm::normalize(glm::cross(right, this->front));
    
    // Calculate object lookAt matrix
    glm::mat4 rotation = glm::mat4(1.0f);
    rotation[0] = glm::vec4(right, 0.0f);   // Filling the columns since its column-major order 
    rotation[1] = glm::vec4(up, 0.0f);
    rotation[2] = glm::vec4(-this->front, 0.0f); // negative Z in OpenGL

    // Calculate new position
    position += this->front * velocity;

    // setting the model matrix and updating it in the vShader
    glm::mat4 model = glm::mat4(1.0f);
    model = glm::translate(model, position);
    model *= rotation;

    vShader.setMat4("model", model);
}

void Missile::render()
{
    // Assumming that the shader program has been set already in main
    // bind the VAO as current and render
    glBindVertexArray(VAO);
    glDrawArrays(GL_TRIANGLES, 0, 36);

}

void Missile::processInput(GLFWwindow* window)
{
    if (glfwGetKey(window, GLFW_KEY_UP) == GLFW_PRESS)
        pitch += 0.05f;
    if (glfwGetKey(window, GLFW_KEY_DOWN) == GLFW_PRESS)
        pitch -= 0.05f;
     if (glfwGetKey(window, GLFW_KEY_RIGHT) == GLFW_PRESS)
        yaw += 0.05f;
    if (glfwGetKey(window, GLFW_KEY_RIGHT) == GLFW_PRESS)
        yaw -= 0.05f;
}