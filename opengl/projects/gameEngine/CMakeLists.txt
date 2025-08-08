cmake_minimum_required(VERSION 3.10)
project(GameEngine)

# Use C++17 or newer if needed
set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

# Find system packages
find_package(OpenGL REQUIRED)
find_package(glfw3 REQUIRED)
find_package(glm CONFIG REQUIRED)
# Create executable
add_executable(engine src/main.cpp src/glad.c src/stb_images.cpp src/engine.cpp)

# Add include directory for shared headers
target_include_directories(engine PUBLIC ${CMAKE_SOURCE_DIR}/include)

# Link required libraries to shared library
target_link_libraries(engine PUBLIC OpenGL::GL glfw glm::glm)






