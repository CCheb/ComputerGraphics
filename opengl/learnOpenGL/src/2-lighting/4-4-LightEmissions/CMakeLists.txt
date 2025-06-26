
add_executable(emissions main.cpp)

# Link shared library and dependencies
target_link_libraries(emissions PRIVATE ${COMMON_LIBS})

# Include shared headers
target_include_directories(emissions PRIVATE ${COMMON_INCLUDES})

# Copy local shaders to the same directory as the binary
add_custom_command(TARGET emissions POST_BUILD
    COMMAND ${CMAKE_COMMAND} -E copy_if_different
        ${CMAKE_CURRENT_SOURCE_DIR}/lightingMaps.fs
        ${CMAKE_CURRENT_SOURCE_DIR}/lightingMaps.vs
	${CMAKE_CURRENT_SOURCE_DIR}/lightCube.fs
	${CMAKE_CURRENT_SOURCE_DIR}/lightCube.vs
        $<TARGET_FILE_DIR:emissions>
)

# Copy resources directory
add_custom_command(TARGET emissions POST_BUILD
    COMMAND ${CMAKE_COMMAND} -E copy_directory
    ${CMAKE_SOURCE_DIR}/resources/textures
    $<TARGET_FILE_DIR:emissions>/resources/textures
)