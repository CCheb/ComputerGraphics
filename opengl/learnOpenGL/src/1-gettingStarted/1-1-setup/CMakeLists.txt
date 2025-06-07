
add_executable(setup main.cpp)

# Link shared library and dependencies
target_link_libraries(setup PRIVATE ${COMMON_LIBS})

# Include shared headers
target_include_directories(setup PRIVATE ${COMMON_INCLUDES})

