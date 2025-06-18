cmake_minimum_required(VERSION 3.10)
project(OpenGLProjects)

# Use C++17 or newer if needed
set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

# Find system packages
find_package(OpenGL REQUIRED)
find_package(glfw3 REQUIRED)

# Automatically gather all source files in src/shared
# file(GLOB SHARED_SRC CONFIGURE_DEPENDS ${CMAKE_SOURCE_DIR}/src/shared/*.c ${CMAKE_SOURCE_DIR}/src/shared/*.cpp)

# Define shared library
add_library(shared STATIC src/shared/glad.c src/shared/stb_images.cpp)

# Add include directory for shared headers (optional)
target_include_directories(shared PUBLIC ${CMAKE_SOURCE_DIR}/include)

# Link required libraries to shared library
target_link_libraries(shared PUBLIC OpenGL::GL glfw)

# Export shared libraries and includes to subprojects
set(COMMON_LIBS shared)
set(COMMON_INCLUDES ${CMAKE_SOURCE_DIR}/include)

# Add projects
# 1-gettingStarted
add_subdirectory(src/1-gettingStarted/1-1-setup)
add_subdirectory(src/1-gettingStarted/2-1-Triangle)
add_subdirectory(src/1-gettingStarted/2-2-TriangleIndexed)
add_subdirectory(src/1-gettingStarted/3-1-shaderClass)
add_subdirectory(src/1-gettingStarted/3-2-shaderInterpolation)
add_subdirectory(src/1-gettingStarted/4-1-Textures)
add_subdirectory(src/1-gettingStarted/4-2-TexturesCombined)
add_subdirectory(src/1-gettingStarted/5-1-Transformations)
add_subdirectory(src/1-gettingStarted/6-1-CoordinateSystems)
add_subdirectory(src/1-gettingStarted/6-3-CoordinateSystemsMultiple)
add_subdirectory(src/1-gettingStarted/7-1-CameraCircle)
add_subdirectory(src/1-gettingStarted/7-2-CameraMovementDT)
add_subdirectory(src/1-gettingStarted/7-3-CameraMouseZoom)
add_subdirectory(src/1-gettingStarted/7-4-CameraClass)

# 2-lighting
add_subdirectory(src/2-lighting/1-Colors)
add_subdirectory(src/2-lighting/2-2-PhongLighting)