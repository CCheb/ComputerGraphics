
add_executable(phong main.cpp)

# Link shared library and dependencies
target_link_libraries(phong PRIVATE ${COMMON_LIBS})

# Include shared headers
target_include_directories(phong PRIVATE ${COMMON_INCLUDES})

# Copy local shaders to the same directory as the binary
add_custom_command(TARGET phong POST_BUILD
    COMMAND ${CMAKE_COMMAND} -E copy_if_different
        ${CMAKE_CURRENT_SOURCE_DIR}/basicLighting.fs
        ${CMAKE_CURRENT_SOURCE_DIR}/basicLighting.vs
	${CMAKE_CURRENT_SOURCE_DIR}/lightCube.fs
	${CMAKE_CURRENT_SOURCE_DIR}/lightCube.vs
        $<TARGET_FILE_DIR:phong>
)

# didnt need any custom texture commands