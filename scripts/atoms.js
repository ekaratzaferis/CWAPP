'use strict';

define(function() {
  return { 
    H  : { radius : 53  ,color : "#FFFFFF", ionic : { } },   
    He : { radius : 31  ,color : "#D9FFFF", ionic : { } }, 
    Li : { radius : 167 ,color : "#CC80FF", ionic : { '+1' : 76 } },
    Be : { radius : 112 ,color : "#C2FF00", ionic : { '+2' : 45 } },
    B  : { radius : 87  ,color : "#FFB5B5", ionic : { '+3' : 27 } },
    C  : { radius : 67  ,color : "#909090", ionic : { '+4' : 16 } },
    N  : { radius : 56  ,color : "#3050F8", ionic : { '-3' : 146, '+3' : 16, '+5' : 13 } },
    O  : { radius : 48  ,color : "#FF0D0D", ionic : { '-2' : 140 } },
    F  : { radius : 42  ,color : "#90E050", ionic : { '-1' : 133, '+7' : 8 } },
    Ne : { radius : 38  ,color : "#B3E3F5", ionic : { } },
    Na : { radius : 190 ,color : "#AB5CF2", ionic : { '+1' : 102 } },
    Mg : { radius : 145 ,color : "#8AFF00", ionic : { '+2' : 72 } },
    Al : { radius : 118 ,color : "#BFA6A6", ionic : { '+3' : 53.5 } },
    Si : { radius : 111 ,color : "#F0C8A0", ionic : { '+4' : 40 } },
    P  : { radius : 98  ,color : "#FF8000", ionic : { '+3' : 44, '+5' : 38 } },
    S  : { radius : 88  ,color : "#FFFF30", ionic : { '-2' : 184, '+4' : 37, '+6' : 29 } },
    Cl : { radius : 79  ,color : "#1FF01F", ionic : { '-1' : 181, '+5' : 12, '+7' : 27 } },
    Ar : { radius : 71  ,color : "#80D1E3", ionic : { } },
    K  : { radius : 243 ,color : "#8F40D4", ionic : { '+1' : 138 } },
    Ca : { radius : 194 ,color : "#3DFF00", ionic : { '+2' : 100 } },
    Sc : { radius : 184 ,color : "#E6E6E6", ionic : { '+3' : 74.5 } },
    Ti : { radius : 176 ,color : "#BFC2C7", ionic : { '+2' : 86, '+3' : 67, '+4' : 60.5 } },
    V  : { radius : 171 ,color : "#A6A6AB", ionic : { '+2' : 79, '+3' : 64, '+4' : 58, '+5' : 54 } },
    Cr : { radius : 166 ,color : "#8A99C7", ionic : { '+2' : 73, '+2h' : 80, '+3' : 61.5, '+4' : 55, '+5' : 49, '+6' : 44 } },
    Mn : { radius : 161 ,color : "#9C7AC7", ionic : { '+2' : 67, '+2h' : 83, '+3' : 58, '+3h' : 64.5, '+4' : 53, '+5' : 33, '+6' : 25.5, '+7' : 46 } },
    Fe : { radius : 156 ,color : "#E06633", ionic : { '+2' : 61, '+2h' : 78, '+3' : 55, '+3h' : 64.5, '+4' : 58.5, '+6' : 25 } },
    Co : { radius : 152 ,color : "#F090A0", ionic : { '+2' : 65, '+2h' : 74.5, '+3' : 54.5, '+3h': 61, '+4h' : 53 } },
    Ni : { radius : 149 ,color : "#50D050", ionic : { '+2h' : 69, '+3h' : 56, '+3' : 60, '+4h' : 48  } },
    Cu : { radius : 145 ,color : "#C88033", ionic : { '+1' : 77, '+2' : 73, '+3' : 54 } },
    Zn : { radius : 142 ,color : "#7D80B0", ionic : { '+2' : 74 } },
    Ga : { radius : 136 ,color : "#C28F8F", ionic : { '+3' : 63 } },
    Ge : { radius : 125 ,color : "#668F8F", ionic : { '+2' : 73, '+4' : 53 } },
    As : { radius : 114 ,color : "#BD80E3", ionic : { '+3' : 58, '+5' : 46 } },
    Se : { radius : 103 ,color : "#FFA100", ionic : { '-2' : 198, '+4' : 50, '+6' : 42 } },
    Br : { radius : 94  ,color : "#A62929", ionic : { '+1' : 196, '+3' : 59, '+5' : 31, '+7' : 39 } },
    Kr : { radius : 88  ,color : "#5CB8D1", ionic : { } },
    Rb : { radius : 265 ,color : "#702EB0", ionic : { '+1' : 152 } },
    Sr : { radius : 219 ,color : "#00FF00", ionic : { '+2' : 118 } },
    Y  : { radius : 212 ,color : "#94FFFF", ionic : { '+3' : 90 } },
    Zr : { radius : 206 ,color : "#94E0E0", ionic : { '+4' : 72 } },
    Nb : { radius : 198 ,color : "#73C2C9", ionic : { '+3' : 72, '+4' : 68, '+5' : 64 } },
    Mo : { radius : 190 ,color : "#54B5B5", ionic : { '+3' : 69, '+4' : 65, '+5' : 61, '+6' : 59 } },
    Tc : { radius : 183 ,color : "#3B9E9E", ionic : { '+4' : 64.5, '+5' : 60, '+7' : 56 } },
    Ru : { radius : 178 ,color : "#248F8F", ionic : { '+3' : 68, '+4' : 62, '+5' : 56.5, '+7' : 38, '+8' : 36 } },
    Rh : { radius : 173 ,color : "#0A7D8C", ionic : { '+3' : 66.5, '+4' : 60, '+5' : 55 } },
    Pd : { radius : 169 ,color : "#006985", ionic : { '+1' : 59, '+2' : 86, '+3' : 76, '+4' : 61.5 } },
    Ag : { radius : 165 ,color : "#C0C0C0", ionic : { '+1' : 115, '+2' : 94, '+3' : 75 } },
    Cd : { radius : 161 ,color : "#FFD98F", ionic : { '+2' : 95 } },
    In : { radius : 156 ,color : "#A67573", ionic : { '+3' : 80 } },
    Sb : { radius : 145 ,color : "#9E63B5", ionic : { '+3' : 69, '+5' : 76 } },
    Sn : { radius : 145 ,color : "#FFFFFF", ionic : { '+4' : 60 } },
    Te : { radius : 123 ,color : "#D47A00", ionic : { '-2' : 221, '+4' : 97, '+6' : 56 } },
    I  : { radius : 115 ,color : "#940094", ionic : { '-1' : 220, '+5' : 95, '+7' : 53 } },
    Xe : { radius : 108 ,color : "#429EB0", ionic : { '+8' : 48 } },
    Cs : { radius : 298 ,color : "#57178F", ionic : { '+1' : 167 } },
    Ba : { radius : 253 ,color : "#00C900", ionic : { '+2' : 135 } },
    La : { radius : 195 ,color : "#70D4FF", ionic : { '+3' : 103.2 } },
    Ce : { radius : 185 ,color : "#FFFFC7", ionic : { '+3' : 101, '+4' : 87 } },
    Pr : { radius : 247 ,color : "#D9FFC7", ionic : { '+3' : 99, '+4' : 85 } },
    Nd : { radius : 206 ,color : "#C7FFC7", ionic : { '+2' : 129, '+3' : 98.3 } },
    Pm : { radius : 205 ,color : "#A3FFC7", ionic : { '+3' : 97 } },
    Sm : { radius : 238 ,color : "#8FFFC7", ionic : { '+2' : 122, '+3' : 95.8 } },
    Eu : { radius : 231 ,color : "#61FFC7", ionic : { '+2' : 117, '+3' : 94.7 } },
    Gd : { radius : 233 ,color : "#45FFC7", ionic : { '+3' : 93.5 } },
    Tb : { radius : 225 ,color : "#30FFC7", ionic : { '+3' : 92.3, '+4' : 76 } },
    Dy : { radius : 228 ,color : "#1FFFC7", ionic : { '+2' : 107, '+3' : 91.2 } },
    Ho : { radius : 175 ,color : "#00FF9C", ionic : { '+3' : 90.1 } },
    Er : { radius : 226 ,color : "#00E675", ionic : { '+3' : 89 } },
    Tm : { radius : 222 ,color : "#00D452", ionic : { '+2' : 103, '+3' : 88 } },
    Yb : { radius : 222 ,color : "#00BF38", ionic : { '+2' : 102, '+3' : 86.8 } },
    Lu : { radius : 217 ,color : "#00AB24", ionic : { '+3' : 86.1 } },
    Hf : { radius : 208 ,color : "#4DC2FF", ionic : { '+4' : 71 } },
    Ta : { radius : 200 ,color : "#4DA6FF", ionic : { '+3' : 72, '+4' : 68, '+5' : 64 } },
    W  : { radius : 193 ,color : "#2194D6", ionic : { '+4' : 66, '+5' : 62, '+6' : 60 } },
    Re : { radius : 188 ,color : "#267DAB", ionic : { '+4' : 63, '+5' : 58, '+6' : 55, '+7' : 53 } },
    Os : { radius : 185 ,color : "#266696", ionic : { '+4' : 63, '+5' : 57.5, '+6' : 54.5, '+7' : 52.5, '+8' : 39 } },
    Ir : { radius : 180 ,color : "#175487", ionic : { '+3' : 68, '+4' : 62.5, '+5' : 57 } },
    Pt : { radius : 177 ,color : "#D0D0E0", ionic : { '+2' : 80, '+4' : 62.5, '+5' : 57 } },
    Au : { radius : 174 ,color : "#FFD123", ionic : { '+1' : 137, '+3' : 85, '+5' : 57 } },
    Hg : { radius : 171 ,color : "#B8B8D0", ionic : { '+1' : 119, '+2' : 102 } },
    Tl : { radius : 156 ,color : "#A6544D", ionic : { '+1' : 150, '+3' : 88.5 } },
    Pb : { radius : 154 ,color : "#575961", ionic : { '+2' : 119, '+4' : 77.5 } },
    Bi : { radius : 143 ,color : "#9E4FB5", ionic : { '+3' : 103, '+5' : 76 } },
    Po : { radius : 135 ,color : "#AB5C00", ionic : { '+4' : 94, '+6' : 67 } },
    At : { radius : 100 ,color : "#754F45", ionic : { '+7' : 62 } },
    Rn : { radius : 120 ,color : "#428296", ionic : { } },
    Fr : { radius : 100 ,color : "#420066", ionic : { '+1' : 180 } },
    Ra : { radius : 215 ,color : "#007D00", ionic : { '+2' : 148 } },
    Ac : { radius : 195 ,color : "#70ABFA", ionic : { '+3' : 112 } },
    Th : { radius : 180 ,color : "#00BAFF", ionic : { '+4' : 94 } },
    Pa : { radius : 190 ,color : "#00A1FF", ionic : { '+3' : 104, '+4' : 90, '+5' : 78 } },
    U  : { radius : 175 ,color : "#008FFF", ionic : { '+3' : 102.5, '+4' : 89, '+5' : 76, '+6' : 73 } },
    Np : { radius : 175 ,color : "#0080FF", ionic : { '+2' : 110, '+3' : 101, '+4' : 87, '+5' : 75, '+6' : 72, '+7' : 71 } },
    Pu : { radius : 175 ,color : "#006BFF", ionic : { '+3' : 100, '+4' : 86, '+5' : 74, '+6' : 71 } },
    Am : { radius : 175 ,color : "#545CF2", ionic : { '+2' : 126, '+3' : 97.5, '+4' : 85 } },
    Cm : { radius : 0   ,color : "#785CE3", ionic : { '+3' : 97, '+4' : 85 } },
    Bk : { radius : 0   ,color : "#8A4FE3", ionic : { '+3' : 96, '+4' : 83 } },
    Cf : { radius : 0   ,color : "#A136D4", ionic : { '+3' : 95, '+4' : 82.1 } },
    Es : { radius : 0   ,color : "#B31FD4", ionic : { '+3' : 83.5 } },
    Fm : { radius : 0   ,color : "#B31FBA", ionic : { } },
    Md : { radius : 0   ,color : "#B30DA6", ionic : { } },
    No : { radius : 0   ,color : "#BD0D87", ionic : { } },
    Lr : { radius : 0   ,color : "#C70066", ionic : { } },
    Rf : { color : "#CC0059", ionic : { '≡' : 131 } },
    Db : { color : "#D1004F", ionic : { '≡' : 126 } },
    Sg : { color : "#D90045", ionic : { '≡' : 121 } },
    Bh : { color : "#E00038", ionic : { '≡' : 119 } },
    Hs : { color : "#E00038", ionic : { '≡' : 118 } },
    Mt : { color : "#E6002E", ionic : { '≡' : 113 } },
    Ds : { color : "#EB0026", ionic : { '≡' : 112 } },
    Rg : { color : "#FFFFFF", ionic : { '≡' : 118 } },
    Cn : { color : "#FFFFFF", ionic : { '≡' : 130 } },
    Uut: { radius : 0   ,color : "#FFFFFF", ionic : { } },
    Fl : { radius : 0   ,color : "#FFFFFF", ionic : { } },
    Uup: { radius : 0   ,color : "#FFFFFF", ionic : { } },
    Lv : { radius : 0   ,color : "#FFFFFF", ionic : { } },
    Uus: { radius : 0   ,color : "#FFFFFF", ionic : { } },
    Uuo: { radius : 0   ,color : "#FFFFFF", ionic : { } }
     


  };
});
