
add_executable(depthTesting main.cpp)

# Link shared library and dependencies
target_link_libraries(depthTesting PRIVATE ${COMMON_LIBS})

# Include shared headers
target_include_directories(depthTesting PRIVATE ${COMMON_INCLUDES})

# Copy local shaders to the same directory as the binary
add_custom_command(TARGET depthTesting POST_BUILD
    COMMAND ${CMAKE_COMMAND} -E copy_if_different
        ${CMAKE_CURRENT_SOURCE_DIR}/depthTesting.fs
        ${CMAKE_CURRENT_SOURCE_DIR}/depthTesting.vs
        $<TARGET_FILE_DIR:depthTesting>
)

# Copy resources directory
add_custom_command(TARGET depthTesting POST_BUILD
    COMMAND ${CMAKE_COMMAND} -E copy_directory
    ${CMAKE_SOURCE_DIR}/resources/textures/
    $<TARGET_FILE_DIR:depthTesting>/resources/textures
)



