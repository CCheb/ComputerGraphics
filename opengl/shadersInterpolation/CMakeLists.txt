cmake_minimum_required(VERSION 3.10)
project(shadersInterpolation)

set(CMAKE_CXX_STANDARD 17)

include_directories(include)

add_executable(shadersInterpolation
    src/main.cpp
    src/glad.c
)

find_package(OpenGL REQUIRED)
find_package(glfw3 REQUIRED)

target_link_libraries(shadersInterpolation
    OpenGL::GL
    glfw
)
