 
    So currently, if the  "Highlight Overlapped atoms" is ON, it rusn in these points :
  for Crystal : every time the crystal is refreshed in any way.
  for Cell : 1.every time the user drags and leaves an atom,  2. every time he uses the length/angle sliders, 3. every time an atom is deleted/added
  for Motif : 1.every time the user drags and leaves an atom,  2.. every time an atom is deleted/added



[6:53:45 μμ] alexandros: onPlaneParallel
[6:53:49 μμ] alexandros: onPlaneInterception
closeAtomCustomizer()

[7:15:30 μμ] alexandros: parallel = 'active'
[7:15:40 μμ] alexandros: interception = 'active'

  
 3. na dw ti paizei me grids faces. 
5. fps drop in unit cell renderern motif renderer
  6. suggest merge in crystal because atoms do not move.
7. kleidwma geometriwn gia performance
8. share material by atom for better perf
 small todo : 
 /* allages se updateDirectionList kai na kaleitai mono auti kai selectDirection
    setPlaneEntryVisibility
    setDirectionEntryVisibility
    setAtomEntryVisibility 
{'action':true,'id':'eimai mpines'}
*/
 
gia kapoio logo planes/directions me dekadiko exoun themata sto idi

TODO list 
    
    6.  hex faces optimization 
    33. na svisw ola ta textures
    9.  change the recreate of hex and use transform function as others
    10. focal point na einai synced me to synced cameras
    16. miller objects recreate function can be optimized
    17. delete the restore function object after scene has restored to prevent memory usage 
    18. sync cameras when autoratating do not work great 
    19. check every global array for memory leaks
    20. available atoms list for rotating in drag mode shouldnt have the NewSphere atom in. 
    22. http://jsfiddle.net/kgxeuz24/7/ xyz label positions
    25. when change view, if you change tab and return in MT bug   
    33. ta materials na ginoun global (px wireframe)
    
List with Ideas

    1. Syncing with user dropbox to store a project there and reopen it later
    2. Public library of CW Projects - search by keywords, most popular etc
    3. Miller object use sliders for indexes
    4. all screens resizable 
    5. parameters for lighting (maybe this is too much)
    6. When applying new motif to crystal auto position camera far from crystal.
        
 
