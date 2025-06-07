
add_executable(shaderClass main.cpp)

# Link shared library and dependencies
target_link_libraries(shaderClass PRIVATE ${COMMON_LIBS})

# Include shared headers
target_include_directories(shaderClass PRIVATE ${COMMON_INCLUDES})

# Copy local shaders to the same directory as the binary
add_custom_command(TARGET shaderClass POST_BUILD
    COMMAND ${CMAKE_COMMAND} -E copy_if_different
        ${CMAKE_CURRENT_SOURCE_DIR}/shader.fs
        ${CMAKE_CURRENT_SOURCE_DIR}/shader.vs
        $<TARGET_FILE_DIR:shaderClass>
)

