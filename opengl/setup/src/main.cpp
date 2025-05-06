#include <glad/glad.h>
#include <GLFW/glfw3.h>
#include <iostream>

int main() {
    // Internal error detection
    glfwSetErrorCallback([](int error, const char* description) {
        std::cerr << "GLFW Error (" << error << "): " << description << std::endl;
    });

    // Initialize GLFW 
    if (!glfwInit()) {
        std::cerr << "Failed to initialize GLFW\n";
        return -1;
    }

    // Setting up our context by specifying the opengl version that we want to use
    // the current profile of openGL along with a macOS specific compatability line
    glfwWindowHint(GLFW_CONTEXT_VERSION_MAJOR, 3);  // version 3.3
    glfwWindowHint(GLFW_CONTEXT_VERSION_MINOR, 3);
    glfwWindowHint(GLFW_OPENGL_PROFILE, GLFW_OPENGL_CORE_PROFILE);
#ifdef __APPLE__
    glfwWindowHint(GLFW_OPENGL_FORWARD_COMPAT, GL_TRUE);
#endif

    GLFWwindow* window = glfwCreateWindow(800, 600, "OpenGL 3.3", nullptr, nullptr);
    if (!window) {
        std::cerr << "Failed to create GLFW window\n";
        glfwTerminate();
        return -1;
    }

    // Make the context render at the window that we specify
    glfwMakeContextCurrent(window);
    // Initializing glad by loading the location addresses of the OpenGL functions
    if (!gladLoadGLLoader((GLADloadproc)glfwGetProcAddress)) {
        std::cerr << "Failed to initialize GLAD\n";
        return -1;
    }

    // setting internal coordinates
    // (-1,1) to (0,800) and (0,600)
    glViewport(0,0,800,600);
    // Window loop where we set the background and keep the window
    // up until the user presses the exit button
    while (!glfwWindowShouldClose(window)) {
        glClearColor(1.0f, 0.0f, 0.0f, 1.0f);
        glClear(GL_COLOR_BUFFER_BIT);
        glfwSwapBuffers(window);    // Double buffer
        glfwPollEvents();
    }

    // clean up
    glfwDestroyWindow(window);
    glfwTerminate();
    return 0;
}
