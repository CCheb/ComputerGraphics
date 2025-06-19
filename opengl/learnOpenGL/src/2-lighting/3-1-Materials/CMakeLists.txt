
add_executable(materials main.cpp)

# Link shared library and dependencies
target_link_libraries(materials PRIVATE ${COMMON_LIBS})

# Include shared headers
target_include_directories(materials PRIVATE ${COMMON_INCLUDES})

# Copy local shaders to the same directory as the binary
add_custom_command(TARGET materials POST_BUILD
    COMMAND ${CMAKE_COMMAND} -E copy_if_different
        ${CMAKE_CURRENT_SOURCE_DIR}/materials.fs
        ${CMAKE_CURRENT_SOURCE_DIR}/materials.vs
	${CMAKE_CURRENT_SOURCE_DIR}/lightCube.fs
	${CMAKE_CURRENT_SOURCE_DIR}/lightCube.vs
        $<TARGET_FILE_DIR:materials>
)

# didnt need any custom texture commands