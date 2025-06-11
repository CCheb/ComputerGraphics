// Its essential to include glad first before anything else since
// its glad that helps bring the opengl pointers and functions and glfw
// relies on those functions to work
#include <glad/glad.h>
#include <GLFW/glfw3.h>
#include <shader/shader_m.h>
#include "pyramid.h"
#include <iostream>
#include <string>

#include <glm/glm.hpp>
#include <glm/gtc/matrix_transform.hpp>
#include <glm/gtc/type_ptr.hpp>


// for resizing the window
void framebuffer_size_callback(GLFWwindow* window, int width, int height);
// for processing input
void processInput(GLFWwindow *window, unsigned int program, std::vector<Pyramid>& pyramids);
void renderAll(std::vector<Pyramid>& pyramids);

// settings
const unsigned int SCR_WIDTH = 800;
const unsigned int SCR_HEIGHT = 600;

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
    GLFWwindow* window = glfwCreateWindow(SCR_WIDTH, SCR_HEIGHT, "Pyramid", NULL, NULL);
    if (window == NULL)
    {
        std::cout << "Failed to create GLFW window" << std::endl;
        glfwTerminate();
        return -1;
    }
    glfwMakeContextCurrent(window);
    // setting the resizing call back to the function we defined above
    glfwSetFramebufferSizeCallback(window, framebuffer_size_callback);
    // enable v-sync
    glfwSwapInterval(1);
  
   

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
    glEnable(GL_CULL_FACE);
    glCullFace(GL_BACK);
    glFrontFace(GL_CCW);

    // create shader program with Shader class
    Shader ourShader("../src/pyramid.vs", "../src/pyramid.fs");

    // create one pyramid object that we will render
    Pyramid myPyramid(0.5f,0.0f,0.0f);
    

    // anonymous objects are considered rvalues which are essentially
    // temporary values that dont have an address. 
    std::vector<Pyramid> pyramids;
    pyramids.emplace_back(0.5f, 0.0f, 0.0f);
    pyramids.emplace_back(-0.5f, 0.0f, 0.0f);

    // use the program so that we can set uniforms
    // same as glUseProgram(ID); 
    ourShader.use();

    // we set both the view and perspective matricies here since we are not going
    // to change them unlike the model matrix

    // view referers to camera space and are the objects in terms of the camera
    // if I want to move the camera then i have to move the world to achieve the same effect
    // we do that movement here in the view matrix
    glm::mat4 view = glm::mat4(1.0f);
    view = glm::translate(view, glm::vec3(0.0,0.0,-3.0f));
   // view = glm::rotate(view, -0.5f, glm::vec3(1.0f,1.0f,0.0f));
    ourShader.setMat4("view", view);

    // With the perspective matrix we first must convert incomming coordinates into NDC coordinates
    // (-1.0 - 1.0 in all axes). This helps us specify coordinates outside of NDC in local coordinates
    // After that we set either orthographic of perspective viewing via the perspective divide.
    // This is done last since OpenGL expects coordinates in NDC spaces right after the vertex shader which
    // defines what will get rendered or not.
    glm::mat4 perspective = glm::mat4(1.0f);
    // fov, aspect ratio, near distance, far distance. This creates the well known frustrum
    perspective = glm::perspective(glm::radians(45.0f), (float)SCR_WIDTH / (float)SCR_HEIGHT, 0.1f, 100.0f);
    ourShader.setMat4("perspective", perspective);

    // At the end we send these matricies to the mat4 uniforms

    while (!glfwWindowShouldClose(window))
    {
       
        // set background and refresh color buffer
        glClearColor(0.2f, 0.3f, 0.3f, 1.0f);
        // erase previous frame contents both the color and the depth information
        glClear(GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT);

        
        //ourShader.use(); // use program once per frame

        // Loop through all pyramids and update + render each
        /*
        for (auto& pyramid : pyramids) {
            pyramid.update(ourShader.ID, window);  // set correct transform
            pyramid.render();                      // draw using that transform
        }
        */

        
        processInput(window, ourShader.ID, pyramids);
       // renderAll(pyramids);
        

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
void processInput(GLFWwindow *window, unsigned int program, std::vector<Pyramid>& pyramids)
{
    if (glfwGetKey(window, GLFW_KEY_ESCAPE) == GLFW_PRESS)
        glfwSetWindowShouldClose(window, true);

    // myPyramid.update(program, window);
    // Loop through all pyramids and update + render each
    for (auto& pyramid : pyramids) 
    {
        // Each triangle must update and render before the next one comes in
        // this is because the transform matrix is going to be changed
        pyramid.update(program, window);  // set correct transform
        pyramid.render();
    }
    
}

void renderAll(std::vector<Pyramid>& pyramids)
{
    for (auto& pyramid : pyramids)
        pyramid.render();

}

// glfw: whenever the window size changed (by OS or user resize) this callback function executes
// ---------------------------------------------------------------------------------------------
void framebuffer_size_callback(GLFWwindow* window, int width, int height)
{
    // make sure the viewport matches the new window dimensions; note that width and 
    // height will be significantly larger than specified on retina displays.
    glViewport(0, 0, width, height);
}