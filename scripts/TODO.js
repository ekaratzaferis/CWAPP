 

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
21. sync cams and enable distortion do not work together
22. distortion doesnt work perfect
23. when zoomed in much, the motif cameras are not restored right
24. adjust arrowhead properties to its length
24. miller objects recreate function can be optimized
25. delete the restore function object after scene has restored to prevent memory usage 
26. sync cameras when autoratating do not work great 
27. check every global array for memory leaks
28. available atoms list for rotating in drag mode shouldnt have the NewSphere atom in.
29. view mode is not supported in restore mechanism
30. hexagonal is not restored well
31. opacity is not restored well
33. maybe big mistake with lengths, in lattices with angles  
33. collision with more than 2 atoms (to handle dragging atom inside atom by the user)  
34. stereoscopic function doesnt work when I first go to motif editor and then enable it  
35. when change view, if you change tab and return in MT bug   
36. when direction radius is updated also direction head should be updated

Changes by Andre

1. Miller objects dont need preview
2. Miller object have visible/invisible checkbutton
-----------------------

List with Ideas

1. Syncing with user dropbox to store a project there and reopen it later
2. Public library of CW Projects - search by keywords, most popular etc
3. Miller object use sliders for indexes



steps:
 