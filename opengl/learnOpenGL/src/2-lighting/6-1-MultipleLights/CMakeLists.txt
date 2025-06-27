
add_executable(multipleLights main.cpp)

# Link shared library and dependencies
target_link_libraries(multipleLights PRIVATE ${COMMON_LIBS})

# Include shared headers
target_include_directories(multipleLights PRIVATE ${COMMON_INCLUDES})

# Copy local shaders to the same directory as the binary
add_custom_command(TARGET multipleLights POST_BUILD
    COMMAND ${CMAKE_COMMAND} -E copy_if_different
        ${CMAKE_CURRENT_SOURCE_DIR}/multipleLights.fs
        ${CMAKE_CURRENT_SOURCE_DIR}/multipleLights.vs
	    ${CMAKE_CURRENT_SOURCE_DIR}/lightCube.fs
	    ${CMAKE_CURRENT_SOURCE_DIR}/lightCube.vs
        $<TARGET_FILE_DIR:multipleLights>
)

# Copy resources directory
add_custom_command(TARGET multipleLights POST_BUILD
    COMMAND ${CMAKE_COMMAND} -E copy_directory
    ${CMAKE_SOURCE_DIR}/resources/textures
    $<TARGET_FILE_DIR:multipleLights>/resources/textures
)