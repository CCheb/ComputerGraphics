
add_executable(shaderInterpolation main.cpp)

# Link shared library and dependencies
target_link_libraries(shaderInterpolation PRIVATE ${COMMON_LIBS})

# Include shared headers
target_include_directories(shaderInterpolation PRIVATE ${COMMON_INCLUDES})

