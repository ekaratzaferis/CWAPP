'use strict';

define(function() {
  return { 
    H  : { radius : 53  ,color : "#FFFFFF", ionic : { } },   
    He : { radius : 31  ,color : "#D9FFFF", ionic : { } }, 
    Li : { radius : 167 ,color : "#CC80FF", ionic : { '+1' : 90 } },
    Be : { radius : 112 ,color : "#C2FF00", ionic : { '+2' : 59 } },
    B  : { radius : 87  ,color : "#FFB5B5", ionic : { '+3' : 41 } },
    C  : { radius : 67  ,color : "#909090", ionic : { '+4' : 30 } },
    N  : { radius : 56  ,color : "#3050F8", ionic : { '-3' : 132, '+3' : 30, '+5' : 27 } },
    O  : { radius : 48  ,color : "#FF0D0D", ionic : { '-2' : 126 } },
    F  : { radius : 42  ,color : "#90E050", ionic : { '-1' : 119, '+7' : 22 } },
    Ne : { radius : 38  ,color : "#B3E3F5", ionic : { } },
    Na : { radius : 190 ,color : "#AB5CF2", ionic : { '+1' : 116 } },
    Mg : { radius : 145 ,color : "#8AFF00", ionic : { '+2' : 86 } },
    Al : { radius : 118 ,color : "#BFA6A6", ionic : { '+3' : 67.5 } },
    Si : { radius : 111 ,color : "#F0C8A0", ionic : { '+4' : 54 } },
    P  : { radius : 98  ,color : "#FF8000", ionic : { '+3' : 58, '+5' : 52 } },
    S  : { radius : 88  ,color : "#FFFF30", ionic : { '-2' : 170, '+4' : 51, '+6' : 43 } },
    Cl : { radius : 79  ,color : "#1FF01F", ionic : { '-1' : 167, '+5' : 26, '+7' : 41 } },
    Ar : { radius : 71  ,color : "#80D1E3", ionic : { } },
    K  : { radius : 243 ,color : "#8F40D4", ionic : { '+1' : 152 } },
    Ca : { radius : 194 ,color : "#3DFF00", ionic : { '+2' : 114 } },
    Sc : { radius : 184 ,color : "#E6E6E6", ionic : { '+3' : 88.5 } },
    Ti : { radius : 176 ,color : "#BFC2C7", ionic : { '+2' : 100, '+3' : 81, '+4' : 74.5 } },
    V  : { radius : 171 ,color : "#A6A6AB", ionic : { '+2' : 93, '+3' : 78, '+4' : 72, '+5' : 68 } },
    Cr : { radius : 166 ,color : "#8A99C7", ionic : { '+2' : 87, '+2h' : 94, '+3' : 75.5, '+4' : 69, '+5' : 63, '+6' : 58 } },
    Mn : { radius : 161 ,color : "#9C7AC7", ionic : { '+2' : 81, '+2h' : 97, '+3' : 72, '+3h' : 78.5, '+4' : 67, '+5' : 47, '+6' : 39.5, '+7' : 60 } },
    Fe : { radius : 156 ,color : "#E06633", ionic : { '+2' : 75, '+2h' : 92, '+3' : 69, '+3h' : 78.5, '+4' : 72.5, '+6' : 39 } },
    Co : { radius : 152 ,color : "#F090A0", ionic : { '+2' : 79, '+2h' : 88.5, '+3' : 68.5, '+3h': 75, '+4h' : 67 } },
    Ni : { radius : 149 ,color : "#50D050", ionic : { '+2h' : 83, '+3h' : 70, '+3' : 74, '+4h' : 62  } },
    Cu : { radius : 145 ,color : "#C88033", ionic : { '+1' : 91, '+2' : 87, '+3' : 68 } },
    Zn : { radius : 142 ,color : "#7D80B0", ionic : { '+2' : 88 } },
    Ga : { radius : 136 ,color : "#C28F8F", ionic : { '+3' : 76 } },
    Ge : { radius : 125 ,color : "#668F8F", ionic : { '+2' : 87, '+4' : 67 } },
    As : { radius : 114 ,color : "#BD80E3", ionic : { '+3' : 72, '+5' : 60 } },
    Se : { radius : 103 ,color : "#FFA100", ionic : { '-2' : 184, '+4' : 64, '+6' : 56 } },
    Br : { radius : 94  ,color : "#A62929", ionic : { '+1' : 182, '+3' : 73, '+5' : 45, '+7' : 53 } },
    Kr : { radius : 88  ,color : "#5CB8D1", ionic : { } },
    Rb : { radius : 265 ,color : "#702EB0", ionic : { '+1' : 166 } },
    Sr : { radius : 219 ,color : "#00FF00", ionic : { '+2' : 132 } },
    Y  : { radius : 212 ,color : "#94FFFF", ionic : { '+3' : 104 } },
    Zr : { radius : 206 ,color : "#94E0E0", ionic : { '+4' : 86 } },
    Nb : { radius : 198 ,color : "#73C2C9", ionic : { '+3' : 86, '+4' : 82, '+5' : 78 } },
    Mo : { radius : 190 ,color : "#54B5B5", ionic : { '+3' : 83, '+4' : 79, '+5' : 75, '+6' : 73 } },
    Tc : { radius : 183 ,color : "#3B9E9E", ionic : { '+4' : 78.5, '+5' : 74, '+7' : 70 } },
    Ru : { radius : 178 ,color : "#248F8F", ionic : { '+3' : 82, '+4' : 76, '+5' : 70.5, '+7' : 52, '+8' : 50 } },
    Rh : { radius : 173 ,color : "#0A7D8C", ionic : { '+3' : 80.5, '+4' : 74, '+5' : 69 } },
    Pd : { radius : 169 ,color : "#006985", ionic : { '+1' : 73, '+2' : 100, '+3' : 90, '+4' : 75.5 } },
    Ag : { radius : 165 ,color : "#C0C0C0", ionic : { '+1' : 129, '+2' : 108, '+3' : 89 } },
    Cd : { radius : 161 ,color : "#FFD98F", ionic : { '+2' : 109 } },
    In : { radius : 156 ,color : "#A67573", ionic : { '+3' : 94 } },
    Sb : { radius : 145 ,color : "#9E63B5", ionic : { '+3' : 90, '+5' : 74 } },
    Sn : { radius : 145 ,color : "#FFFFFF", ionic : { '+4' : 83 } },
    Te : { radius : 123 ,color : "#D47A00", ionic : { '-2' : 207, '+4' : 111, '+6' : 70 } },
    I  : { radius : 115 ,color : "#940094", ionic : { '-1' : 206, '+5' : 109, '+7' : 67 } },
    Xe : { radius : 108 ,color : "#429EB0", ionic : { '+8' : 62 } },
    Cs : { radius : 298 ,color : "#57178F", ionic : { '+1' : 181 } },
    Ba : { radius : 253 ,color : "#00C900", ionic : { '+2' : 149 } },
    La : { radius : 195 ,color : "#70D4FF", ionic : { '+3' : 117.2 } },
    Ce : { radius : 185 ,color : "#FFFFC7", ionic : { '+3' : 115, '+4' : 101 } },
    Pr : { radius : 247 ,color : "#D9FFC7", ionic : { '+3' : 113, '+4' : 99 } },
    Nd : { radius : 206 ,color : "#C7FFC7", ionic : { '+2' : 143, '+3' : 112.3 } },
    Pm : { radius : 205 ,color : "#A3FFC7", ionic : { '+3' : 111 } },
    Sm : { radius : 238 ,color : "#8FFFC7", ionic : { '+2' : 136, '+3' : 109.8 } },
    Eu : { radius : 231 ,color : "#61FFC7", ionic : { '+2' : 131, '+3' : 108.7 } },
    Gd : { radius : 233 ,color : "#45FFC7", ionic : { '+3' : 107.8 } },
    Tb : { radius : 225 ,color : "#30FFC7", ionic : { '+3' : 106.3, '+4' : 90 } },
    Dy : { radius : 228 ,color : "#1FFFC7", ionic : { '+2' : 121, '+3' : 105.2 } },
    Ho : { radius : 175 ,color : "#00FF9C", ionic : { '+3' : 104.1 } },
    Er : { radius : 226 ,color : "#00E675", ionic : { '+3' : 103 } },
    Tm : { radius : 222 ,color : "#00D452", ionic : { '+2' : 117, '+3' : 102 } },
    Yb : { radius : 222 ,color : "#00BF38", ionic : { '+2' : 116, '+3' : 100.8 } },
    Lu : { radius : 217 ,color : "#00AB24", ionic : { '+3' : 100.1 } },
    Hf : { radius : 208 ,color : "#4DC2FF", ionic : { '+4' : 85 } },
    Ta : { radius : 200 ,color : "#4DA6FF", ionic : { '+3' : 86, '+4' : 82, '+5' : 78 } },
    W  : { radius : 193 ,color : "#2194D6", ionic : { '+4' : 80, '+5' : 76, '+6' : 74 } },
    Re : { radius : 188 ,color : "#267DAB", ionic : { '+4' : 77, '+5' : 72, '+6' : 69, '+7' : 67 } },
    Os : { radius : 185 ,color : "#266696", ionic : { '+4' : 77, '+5' : 71.5, '+6' : 68.5, '+7' : 66.5, '+8' : 53 } },
    Ir : { radius : 180 ,color : "#175487", ionic : { '+3' : 82, '+4' : 76.5, '+5' : 71 } },
    Pt : { radius : 177 ,color : "#D0D0E0", ionic : { '+2' : 94, '+4' : 76.5, '+5' : 71 } },
    Au : { radius : 174 ,color : "#FFD123", ionic : { '+1' : 151, '+3' : 99, '+5' : 71 } },
    Hg : { radius : 171 ,color : "#B8B8D0", ionic : { '+1' : 133, '+2' : 116 } },
    Tl : { radius : 156 ,color : "#A6544D", ionic : { '+1' : 164, '+3' : 102.5 } },
    Pb : { radius : 154 ,color : "#575961", ionic : { '+2' : 133, '+4' : 91.5 } },
    Bi : { radius : 143 ,color : "#9E4FB5", ionic : { '+3' : 117, '+5' : 90 } },
    Po : { radius : 135 ,color : "#AB5C00", ionic : { '+4' : 108, '+6' : 81 } },
    At : { radius : 100 ,color : "#754F45", ionic : { '+7' : 76 } },
    Rn : { radius : 120 ,color : "#428296", ionic : { } },
    Fr : { radius : 100 ,color : "#420066", ionic : { '+1' : 194 } },
    Ra : { radius : 215 ,color : "#007D00", ionic : { '+2' : 162 } },
    Ac : { radius : 195 ,color : "#70ABFA", ionic : { '+3' : 126 } },
    Th : { radius : 180 ,color : "#00BAFF", ionic : { '+4' : 108 } },
    Pa : { radius : 190 ,color : "#00A1FF", ionic : { '+3' : 116, '+4' : 104, '+5' : 92 } },
    U  : { radius : 175 ,color : "#008FFF", ionic : { '+3' : 116.5, '+4' : 103, '+5' : 90, '+6' : 87 } },
    Np : { radius : 175 ,color : "#0080FF", ionic : { '+2' : 124, '+3' : 115, '+4' : 101, '+5' : 89, '+6' : 86, '+7' : 85 } },
    Pu : { radius : 175 ,color : "#006BFF", ionic : { '+3' : 114, '+4' : 100, '+5' : 88, '+6' : 85 } },
    Am : { radius : 175 ,color : "#545CF2", ionic : { '+2' : 140, '+3' : 111.5, '+4' : 99 } },
    Cm : { radius : 0   ,color : "#785CE3", ionic : { '+3' : 111, '+4' : 99 } },
    Bk : { radius : 0   ,color : "#8A4FE3", ionic : { '+3' : 110, '+4' : 97 } },
    Cf : { radius : 0   ,color : "#A136D4", ionic : { '+3' : 109, '+4' : 96.1 } },
    Es : { radius : 0   ,color : "#B31FD4", ionic : { '+3' : 92.8 } },
    Fm : { radius : 0   ,color : "#B31FBA", ionic : { } },
    Md : { radius : 0   ,color : "#B30DA6", ionic : { } },
    No : { radius : 0   ,color : "#BD0D87", ionic : { } },
    Lr : { radius : 0   ,color : "#C70066", ionic : { } },
    Rf : { radius : 0   ,color : "#CC0059", ionic : { '≡' : 131 } },
    Db : { radius : 0   ,color : "#D1004F", ionic : { '≡' : 126 } },
    Sg : { radius : 0   ,color : "#D90045", ionic : { '≡' : 121 } },
    Bh : { radius : 0   ,color : "#E00038", ionic : { '≡' : 119 } },
    Hs : { radius : 0   ,color : "#E00038", ionic : { '≡' : 118 } },
    Mt : { radius : 0   ,color : "#E6002E", ionic : { '≡' : 113 } },
    Ds : { radius : 0   ,color : "#EB0026", ionic : { '≡' : 112 } },
    Rg : { radius : 0   ,color : "#FFFFFF", ionic : { '≡' : 118 } },
    Cn : { radius : 0   ,color : "#FFFFFF", ionic : { '≡' : 130 } },
    Uut: { radius : 0   ,color : "#FFFFFF", ionic : { } },
    Fl : { radius : 0   ,color : "#FFFFFF", ionic : { } },
    Uup: { radius : 0   ,color : "#FFFFFF", ionic : { } },
    Lv : { radius : 0   ,color : "#FFFFFF", ionic : { } },
    Uus: { radius : 0   ,color : "#FFFFFF", ionic : { } },
    Uuo: { radius : 0   ,color : "#FFFFFF", ionic : { } }
     


  };
});
