cmake_minimum_required(VERSION 3.10)
project(LightingCanvas)

# Use C++17 or newer if needed
set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

# Find system packages
find_package(OpenGL REQUIRED)
find_package(glfw3 REQUIRED)

# Create executable
add_executable(lightingCanvas src/main.cpp src/glad.c src/cube.cpp)

# Add include directory for shared headers
target_include_directories(lightingCanvas PUBLIC ${CMAKE_SOURCE_DIR}/include)

# Link required libraries to shared library
target_link_libraries(lightingCanvas PUBLIC OpenGL::GL glfw)






