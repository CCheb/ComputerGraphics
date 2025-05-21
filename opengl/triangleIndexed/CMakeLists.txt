cmake_minimum_required(VERSION 3.10)
project(triangleIndexed)

set(CMAKE_CXX_STANDARD 17)

include_directories(include)

add_executable(triangleIndexed
    src/main.cpp
    src/glad.c
)

find_package(OpenGL REQUIRED)
find_package(glfw3 REQUIRED)

target_link_libraries(triangleIndexed
    OpenGL::GL
    glfw
)
