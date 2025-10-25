`
Brand color:
#C59D39
`


`
Company logo URL:
https://www.clipartmax.com/png/full/116-1169119_millennium-history-clipart-yugioh-millenium-puzzle.png
`


`
Custom CSS:
/* === Fonts: Egyptian / mystical flavor === */
@font-face {
  font-family: 'Cinzel Decorative';
  font-style: normal;
  font-weight: 700;
  font-display: swap;
  src: url('https://fonts.gstatic.com/s/cinzeldecorative/v15/daaHSScvJGqLYhG8nNt8KPPswUAPni6-TIg.woff2')
    format('woff2');
}
@font-face {
  font-family: 'Marcellus';
  font-style: normal;
  font-weight: 400;
  font-display: swap;
  src: url('https://fonts.gstatic.com/s/marcellus/v11/wEO_EBrOk8hQLDvIAF8FUfAL3EsHiA.woff2')
    format('woff2');
}

#app * {
  font-family: 'Marcellus', serif !important;
  letter-spacing: 0.4px;
  --color-type-primary: #f4e7cf;
  --color-type-secondary: #c7b9a1;
}

/* === Page background: papyrus parchment === */
#app > div[class$='viewBox'] {
  background-image: url('https://e1.pxfuel.com/desktop-wallpaper/242/299/desktop-wallpaper-10-best-yu-gi-oh-full-1920%C3%971080-for-pc-backgrounds-yu-gi-oh.jpg');
  background-color: #1c1a17;
  background-size: cover;        /* Fill the whole page */
  background-repeat: no-repeat;  /* Prevent tiling */
  background-position: center;   /* Center the image */
  background-attachment: fixed;  /* Optional: make it stay fixed when scrolling */
}

/* === Main auth card: stone tablet look === */
#app main[class*='main'] {
  background: linear-gradient(
      180deg,
      rgba(38, 35, 31, 0.95),
      rgba(28, 26, 23, 0.9)
    ),
    url('https://www.transparenttextures.com/patterns/stone-wall.png');
  background-size: cover;
  border: 2px solid #c59d39;
  border-radius: 12px;
  padding: 28px;
  padding-bottom: 72px;
  box-shadow: 0 0 40px rgba(197, 157, 57, 0.25);
  opacity: 1;
}

/* === Logo (Millennium Puzzle style) === */
#app main[class*='main'] img[class*='logo'] {
  content: url('https://upload.wikimedia.org/wikipedia/en/4/4a/Millennium_Puzzle.png');
  margin: -12px 0 -12px;
  height: 120px;
  filter: drop-shadow(0 6px 12px rgba(197, 157, 57, 0.4));
}

/* === Headline === */
#app main[class*='main'] h1,
#app main[class*='main'] ._9b8WI_headline {
  font-family: 'Cinzel Decorative', serif !important;
  font-size: 1.6rem;
  color: #f4d76e;
  text-align: center;
  margin-bottom: 12px;
  text-shadow: 0 0 10px rgba(244, 215, 110, 0.5);
}

/* === Input fields: carved stone slots === */
#app form div[class*='inputField'] > div {
  border: 1px solid #3a342c;
  border-radius: 6px;
  background: rgba(28, 26, 23, 0.9);
}

#app form div[class*='inputField'] input,
#app form div[class*='inputField'] div[class$='countryCodeSelector'] {
  background: transparent;
  color: #f4e7cf;
  font-family: 'Marcellus', serif;
  font-size: 16px;
  font-weight: 500;
  padding: 12px;
}

#app form div[class*='inputField'] input::placeholder {
  color: #7d7264;
  font-style: italic;
}

/* === Divider (with star glyph like Duel Disk) === */
#app main[class*='main'] > div[class*='wrapper'] > div[class*='divider'] {
  color: #c59d39;
  text-align: center;
}
#app main[class*='main'] > div[class*='wrapper'] > div[class*='divider'] > i[class*='line'] {
  background: rgba(197, 157, 57, 0.25);
}
#app main[class*='main'] > div[class*='wrapper'] > div[class*='divider']::before {
  content: "★";
  position: relative;
  top: -0.7rem;
  font-size: 1rem;
  color: #f4d76e;
  text-shadow: 0 0 6px rgba(244, 215, 110, 0.4);
}

/* === Primary button: golden glow === */
#app button[type='submit'] {
  background: linear-gradient(135deg, #8d6d1f, #c59d39);
  color: #1c1a17;
  font-weight: 700;
  font-size: 16px;
  border-radius: 6px;
  border: none;
  padding: 12px;
  box-shadow: 0 0 14px rgba(244, 215, 110, 0.4);
  transition: all 0.25s ease;
}
#app button[type='submit']:hover {
  background: linear-gradient(135deg, #c59d39, #f4d76e);
  transform: translateY(-2px);
  box-shadow: 0 0 22px rgba(244, 215, 110, 0.6);
}

/* === Secondary / social buttons: teal spell card === */
#app div[class*='socialLinkList'] > button {
  background-color: #2b8e8a;
  border: none;
  border-radius: 6px;
  color: #ffffff;
  font-weight: 600;
  transition: background 0.25s;
}
#app div[class*='socialLinkList'] > button:hover {
  background-color: #5ed1cd;
}

/* === Links / create account: ancient scroll ink === */
#app main[class*='main'] > div[class*='wrapper'] > div[class*='createAccount'],
#app a {
  font-family: 'Marcellus', serif;
  color: #f4d76e;
  text-decoration: none;
}
#app a:hover {
  text-shadow: 0 0 6px rgba(244, 215, 110, 0.5);
}

/* === Errors: red seal === */
#app .logto-error,
#app div[class*='error'] {
  background: rgba(214, 69, 80, 0.08);
  border-left: 4px solid #d64550;
  padding: 10px;
  border-radius: 6px;
  color: #ff7b82;
  font-weight: 600;
}

/* === Footer signature: faded carving === */
#app .VPHIq_signature,
#app .vSHaV_signature {
  font-family: 'Marcellus', serif;
  font-size: 0.8rem;
  color: #7d7264;
  opacity: 0.7;
}
`;
