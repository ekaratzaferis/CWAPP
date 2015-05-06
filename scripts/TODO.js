1. newSPhere doesnot reposition well when tangetn to rotate
2. when I add one atom and then i click save and then i move it with mouse newSphere is undefined and causes problems
3. possible have to change every configureCellPoints call with stalling to enable it get the right values of object3d.position (or I can re do it every little time);

7. sync cams and enable distortion do not work together
8. * depthWrite: false, depthTest: false, */
9. motif editor must create an DB for each atom and for the whole motif


 

TODO list
1.  xyz labels not moving when zoom in/out
2.  switch for light to improve performance
3.  parameters for lighting
4.  hold all data of an atom to be updatable
5.  texture.minfilter has been changed
6.  improve scene with helper axis
7.  grid has duplicates
8.  merge geometries
9.  hex grid (at least) in hex does not update (radius,color) when parameter changes 
10. hex faces optimization
11. hex grid and faces are not deleted when other lattice is selected
12. hud does not work when cameras are synced
13. change the reference in lattice hex to simpler _x+_y+_z+_r
14. change the recreate of hex and use transform function as others
15. recreate motif fro hexagonal also needs optimization
16. changing the lattice in the middle of motif editing has problems
17. adjust miller object to lattice dimensions
18. adjust arrows head width, length acording to the size of the arrow (millers)
19. between changing view mode it must go to classic first (except for gradeLimited) 
20. triclinic,monoclinic,rhombohedral and hexagonal needs their Aa Ab Ac leastCellLengths fixed (findLeastCellLength())
