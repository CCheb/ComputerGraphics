
add_executable(triangleIndexed main.cpp)

# Link shared library and dependencies
target_link_libraries(triangleIndexed PRIVATE ${COMMON_LIBS})

# Include shared headers
target_include_directories(triangleIndexed PRIVATE ${COMMON_INCLUDES})

