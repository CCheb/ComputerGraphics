// Its essential to include glad first before anything else since
// its glad that helps bring the opengl pointers and functions and glfw
// relies on those functions to work
#include <glad/glad.h>
#include <GLFW/glfw3.h>

#include <shader/shader_m.h>
#include <cube.h>
#include <camera.h>
#include <spotlight.h>

#include <glm/glm.hpp>
#include <glm/gtc/matrix_transform.hpp>
#include <glm/gtc/type_ptr.hpp>

#include <iostream>


// callbacks handled by glfw
void framebuffer_size_callback(GLFWwindow* window, int width, int height);
void mouse_callback(GLFWwindow* window, double xpos, double ypos);
void scroll_callback(GLFWwindow* window, double xoffset, double yoffset);
void processInput(GLFWwindow *window);

// window settings
const unsigned int SCR_WIDTH = 800;
const unsigned int SCR_HEIGHT = 600;

// camera based off of camera.h
Camera camera(glm::vec3(0.0f, 0.0f, 3.0f));
float lastX = SCR_WIDTH / 2.0f;
float lastY = SCR_HEIGHT / 2.0f;
bool firstMouse = true;

// timing
float deltaTime = 0.0f;
float lastFrame = 0.0f;


int main()
{
    // glfw: initialize and configure context
    // ------------------------------
    glfwInit();
    glfwWindowHint(GLFW_CONTEXT_VERSION_MAJOR, 3);
    glfwWindowHint(GLFW_CONTEXT_VERSION_MINOR, 3);
    glfwWindowHint(GLFW_OPENGL_PROFILE, GLFW_OPENGL_CORE_PROFILE);

#ifdef __APPLE__
    glfwWindowHint(GLFW_OPENGL_FORWARD_COMPAT, GL_TRUE);
#endif

    // glfw window creation
    // --------------------
    GLFWwindow* window = glfwCreateWindow(SCR_WIDTH, SCR_HEIGHT, "Lighting Canvas", NULL, NULL);
    if (window == NULL)
    {
        std::cout << "Failed to create GLFW window" << std::endl;
        glfwTerminate();
        return -1;
    }
    glfwMakeContextCurrent(window);
    // setting the resizing call back to the function we defined above
    glfwSetFramebufferSizeCallback(window, framebuffer_size_callback);
    glfwSetCursorPosCallback(window, mouse_callback);
    glfwSetScrollCallback(window, scroll_callback);

    // tell GLFW to capture our mouse disabled
    glfwSetInputMode(window, GLFW_CURSOR, GLFW_CURSOR_DISABLED);
    // enable v-sync
   // glfwSwapInterval(1);

    // glad: load all OpenGL function pointers
    // ---------------------------------------
    if (!gladLoadGLLoader((GLADloadproc)glfwGetProcAddress))
    {
        std::cout << "Failed to initialize GLAD" << std::endl;
        return -1;
    }
    // enable backface culling do this after setting up context
    // you can either enable depth testing or cullface 
    glEnable(GL_DEPTH_TEST);
    
    // create shader program with Shader class
    Shader lightingShader("../src/spotlight.vs", "../src/spotlight.fs");
    Shader lightCube("../src/lightCube.vs", "../src/lightCube.fs");
    
    // create wall of cubes
    // anonymous objects are considered rvalues which are essentially
    // temporary values that dont have an address. 
    std::vector<Cube> cubes;
    for(int i = 0; i < 10; i++)
        for(int j = 0; j < 10; j++)
            cubes.emplace_back(i-4.0f,j-4.0f,-15.0f, 0.9f);

    // use the program so that we can set uniforms
    // same as glUseProgram(ID); 
    lightingShader.use();

    lightingShader.setVec3("material.ambient", glm::vec3(0.3f));
    lightingShader.setVec3("material.diffuse", glm::vec3(0.5f));
    lightingShader.setVec3("material.specular", glm::vec3(1.0f));
    lightingShader.setFloat("material.shininess", 32.0f);

    glm::vec3 position = glm::vec3(-5.0f,0.0f,-1.0f);
    glm::vec3 direction = glm::normalize(glm::vec3(0.0f,0.0f,-15.0f) - position);
    glm::vec3 lightColor = glm::vec3(0.0f,0.0f,100.0f);
    Spotlight spot1(position, direction, lightColor, true, lightingShader);
    
    // At the end we send these matricies to the mat4 uniforms

    while (!glfwWindowShouldClose(window))
    {
        // per-frame time logic
        // --------------------
        float currentFrame = static_cast<float>(glfwGetTime());
        deltaTime = currentFrame - lastFrame;
        lastFrame = currentFrame;

        // input
        // --------------------
        processInput(window);

        // set background and refresh color buffer
        glClearColor(0.2f, 0.2f, 0.2f, 1.0f);
        // erase previous frame contents both the color and the depth information
        glClear(GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT);

        lightingShader.use();
        // pass projection matrix to shader (note that in this case it could change every frame)
        glm::mat4 projection = glm::perspective(glm::radians(camera.Zoom), (float)SCR_WIDTH / (float)SCR_HEIGHT, 0.1f, 100.0f);
        lightingShader.setMat4("projection", projection); 

        // camera/view transformation. Obtains the lookAt matrix with updated vectors
        glm::mat4 view = camera.GetViewMatrix();
        lightingShader.setMat4("view", view);
        
        spot1.move(lightingShader);

        // render wall of cubes
        for(auto& cube : cubes)
        {
            cube.update(lightingShader.ID, window, deltaTime);
            cube.render();
        }

        lightCube.use();
        spot1.update(lightCube, projection, view);
        spot1.render();


        
        // double buffering
        glfwSwapBuffers(window);
        // handle inputs 
        glfwPollEvents();
    }

    glfwTerminate();
    return 0;

}

// process all input: query GLFW whether relevant keys are pressed/released this frame and react accordingly
// ---------------------------------------------------------------------------------------------------------
void processInput(GLFWwindow *window)
{
    if (glfwGetKey(window, GLFW_KEY_ESCAPE) == GLFW_PRESS)
        glfwSetWindowShouldClose(window, true);
    if (glfwGetKey(window, GLFW_KEY_W) == GLFW_PRESS)
        camera.ProcessKeyboard(FORWARD, deltaTime);
    if (glfwGetKey(window, GLFW_KEY_S) == GLFW_PRESS)
        camera.ProcessKeyboard(BACKWARD, deltaTime);
    if (glfwGetKey(window, GLFW_KEY_A) == GLFW_PRESS)
        camera.ProcessKeyboard(LEFT, deltaTime);
    if (glfwGetKey(window, GLFW_KEY_D) == GLFW_PRESS)
        camera.ProcessKeyboard(RIGHT, deltaTime);

    // Roll mechanic bu pressing either N or M
    if (glfwGetKey(window, GLFW_KEY_N) == GLFW_PRESS)
        camera.ProcessKeyboard(LROLL, deltaTime);
    if (glfwGetKey(window, GLFW_KEY_M) == GLFW_PRESS)
        camera.ProcessKeyboard(RROLL, deltaTime);
    
}


// glfw: whenever the window size changed (by OS or user resize) this callback function executes
// ---------------------------------------------------------------------------------------------
void framebuffer_size_callback(GLFWwindow* window, int width, int height)
{
    // make sure the viewport matches the new window dimensions; note that width and 
    // height will be significantly larger than specified on retina displays.
    glViewport(0, 0, width, height);
}

// glfw: whenever the mouse moves, this callback is called
// -------------------------------------------------------
void mouse_callback(GLFWwindow* window, double xposIn, double yposIn)
{
    // Grab current mouse position
    float xpos = static_cast<float>(xposIn);
    float ypos = static_cast<float>(yposIn);

    // If this is the first time then set the lastX and Y to the default which is the
    // middle of the screen
    if (firstMouse)
    {
        lastX = xpos;
        lastY = ypos;
        firstMouse = false;
    }

    // Then calculate the difference between the previous and current mouse positions
    float xoffset = xpos - lastX;
    float yoffset = lastY - ypos; // reversed since y-coordinates go from bottom to top

    // update the previous to the current so that it forms a cycle
    lastX = xpos;
    lastY = ypos;

    // Finally pass the difference so that the pitch and yaw can be calculated based 
    // on how much total offset in the x and y
    camera.ProcessMouseMovement(window, xoffset, yoffset);
}

// glfw: whenever the mouse scroll wheel scrolls, this callback is called
// ----------------------------------------------------------------------
void scroll_callback(GLFWwindow* window, double xoffset, double yoffset)
{
    camera.ProcessMouseScroll(static_cast<float>(yoffset));
}
