
add_executable(colors main.cpp)

# Link shared library and dependencies
target_link_libraries(colors PRIVATE ${COMMON_LIBS})

# Include shared headers
target_include_directories(colors PRIVATE ${COMMON_INCLUDES})

# Copy local shaders to the same directory as the binary
add_custom_command(TARGET colors POST_BUILD
    COMMAND ${CMAKE_COMMAND} -E copy_if_different
        ${CMAKE_CURRENT_SOURCE_DIR}/colors.fs
        ${CMAKE_CURRENT_SOURCE_DIR}/colors.vs
	${CMAKE_CURRENT_SOURCE_DIR}/lightCube.fs
	${CMAKE_CURRENT_SOURCE_DIR}/lightCube.vs
        $<TARGET_FILE_DIR:colors>
)

# didnt need any custom texture commands