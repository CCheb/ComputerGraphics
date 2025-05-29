
add_executable(triangle main.cpp)

# Link shared library and dependencies
target_link_libraries(triangle PRIVATE ${COMMON_LIBS})

# Include shared headers
target_include_directories(triangle PRIVATE ${COMMON_INCLUDES})

