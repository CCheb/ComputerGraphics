cmake_minimum_required(VERSION 3.10)
project(shaderClass)

set(CMAKE_CXX_STANDARD 17)

include_directories(include)

add_executable(shaderClass
    src/main.cpp
    src/glad.c
)

find_package(OpenGL REQUIRED)
find_package(glfw3 REQUIRED)

target_link_libraries(shaderClass
    OpenGL::GL
    glfw
)
