// Its essential to include glad first before anything else since
// its glad that helps bring the opengl pointers and functions and glfw
// relies on those functions to work
#include <glad/glad.h>
#include <GLFW/glfw3.h>
#include <shader/shader_m.h>
#include "pyramid.h"
#include <iostream>
#include <string>


// for resizing the window
void framebuffer_size_callback(GLFWwindow* window, int width, int height);
// for processing input
void processInput(GLFWwindow *window, unsigned int program, Pyramid& myPyramid);

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
    glEnable(GL_CULL_FACE);
    glCullFace(GL_BACK);
    glFrontFace(GL_CCW);

    // create shader program with Shader class
    Shader ourShader("../src/pyramid.vs", "../src/pyramid.fs");

    // create one pyramid object that we will render
    Pyramid myPyramid;

    // use the program so that we can set uniforms
    // same as glUseProgram(ID); 
    ourShader.use();

    while (!glfwWindowShouldClose(window))
    {
        // set background and refresh color buffer
        glClearColor(0.2f, 0.3f, 0.3f, 1.0f);
        // erase previous frame contents
        glClear(GL_COLOR_BUFFER_BIT);
        
        // same as updateAll()
        processInput(window, ourShader.ID, myPyramid);

        // could do a renderAll if we are doing multiple objects
        myPyramid.render();

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
void processInput(GLFWwindow *window, unsigned int program,Pyramid& myPyramid)
{
    if (glfwGetKey(window, GLFW_KEY_ESCAPE) == GLFW_PRESS)
        glfwSetWindowShouldClose(window, true);

    myPyramid.update(program, window);
    
}

// glfw: whenever the window size changed (by OS or user resize) this callback function executes
// ---------------------------------------------------------------------------------------------
void framebuffer_size_callback(GLFWwindow* window, int width, int height)
{
    // make sure the viewport matches the new window dimensions; note that width and 
    // height will be significantly larger than specified on retina displays.
    glViewport(0, 0, width, height);
}