  
ADDING
a. User starts with everything emptied / grayed out (hkl/name..)
b. Leads to user clicking on new plane, which adds an empty item on list
c. User changes value, previews… clicks on save. bvgt5
d. On save click, item parameters are updated on the list (hkl, name…)

CHANGING DATA
a. User clicks on item list to select it
b. Item is highlighted on the list and parameters are loaded to the
menu (hkl, name…)
c. User changes value, previews… clicks on save.
d. On save click, item parameters are updated on the list (hkl, name…)

Suggestion 2 (check in save stage) : the system lets the user enters
whatever input he wants but it when he clicks the save button ifthere is already a
saved plane/dir. It aborts the action informing him which plane/dir. of the saved
ones is the same as the one he is currently trying to create.

 performance TODOs
 1. ola ta sphereGeometry na einai ena me scaling. 
 3. na dw ti paizei me grids faces.
 4. thelw gia to progres bar mia sunarthsh pou na to tleeiwnei ksafnika
5. fps drop in unit cell renderern motif renderer
  6. suggest merge in crystal because atoms do not move.

  ui TODOs
  33. otan kleinw to menu de douleuei kala to mouse event ston kuvo ston ME
  34. renderization mode - deacctivate menu
  35 gear bar tour to idio provlima me renderization mode

TODO list 
    
    6.  hex faces optimization 
 
    9.  change the recreate of hex and use transform function as others
    10. recreate motif fro hexagonal also needs optimization 
    
    12. between changing view mode it must go to classic first (except for gradeLimited)  
    13. sync cams and enable distortion do not work together
    14. distortion doesnt work perfect
    15. WASD speeds to be optimised from the crystal size
    
    --- hex is ok for 1x1x1 subtracted, solid

    16. miller objects recreate function can be optimized
    17. delete the restore function object after scene has restored to prevent memory usage 
    18. sync cameras when autoratating do not work great 
    19. check every global array for memory leaks
    20. available atoms list for rotating in drag mode shouldnt have the NewSphere atom in. 
    21. hexagonal is not restored well 
    23. collision with more than 2 atoms (to handle dragging atom inside atom by the user)  
    24. stereoscopic function doesnt work when I first go to motif editor and then enable it  
    25. when change view, if you change tab and return in MT bug    
    26. Ligths full deactivation fro performance
    27. Calculate better the center of crystal
    28. Grade Limited View and subtracted view for hexagonal Strange
    29. Disable everything when we are viewing the cell or crystal in subtracted and solid void.
    30. When go bak to classic view from subtracted in cell, distances appear.
    31. Add loader which freezes mouse events 
    32. When applying new motif to crystal auto position camera far from crystal.
    33. speed of WASD to be analogous to crystal size or analogous to the distance of the center
    -- when moving atom with sliders and collides unit cell atoms do not get tangent
      

List with Ideas

    1. Syncing with user dropbox to store a project there and reopen it later
    2. Public library of CW Projects - search by keywords, most popular etc
    3. Miller object use sliders for indexes
    4. all screens resizable 
    5. parameters for lighting (maybe this is too much)
        


