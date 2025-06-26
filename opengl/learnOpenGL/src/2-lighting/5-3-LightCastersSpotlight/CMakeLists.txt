
add_executable(spotlight main.cpp)

# Link shared library and dependencies
target_link_libraries(spotlight PRIVATE ${COMMON_LIBS})

# Include shared headers
target_include_directories(spotlight PRIVATE ${COMMON_INCLUDES})

# Copy local shaders to the same directory as the binary
add_custom_command(TARGET spotlight POST_BUILD
    COMMAND ${CMAKE_COMMAND} -E copy_if_different
        ${CMAKE_CURRENT_SOURCE_DIR}/lightCasters.fs
        ${CMAKE_CURRENT_SOURCE_DIR}/lightCasters.vs
	    ${CMAKE_CURRENT_SOURCE_DIR}/lightCube.fs
	    ${CMAKE_CURRENT_SOURCE_DIR}/lightCube.vs
        $<TARGET_FILE_DIR:spotlight>
)

# Copy resources directory
add_custom_command(TARGET spotlight POST_BUILD
    COMMAND ${CMAKE_COMMAND} -E copy_directory
    ${CMAKE_SOURCE_DIR}/resources/textures
    $<TARGET_FILE_DIR:spotlight>/resources/textures
)