include_directories( External/esUtils/Include )
include_directories( External/Include )

add_executable( draw-regular-polygon draw-regular-polygon.c )
target_link_libraries( draw-regular-polygon Common )

SUBDIRS( External/esUtils )