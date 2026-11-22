// Alle Symbole als eingebettetes SVG (keine Emojis).

const svg = (body, vb = "0 0 64 64") =>
  `<svg viewBox="${vb}" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">${body}</svg>`;

export const ICON = {
  // Delfin = flüssig
  dolphin: svg(`
    <path d="M6 40 C 12 25, 28 15, 44 18 C 50 19, 55 22, 60 25 C 58 27, 55 28, 52 28 C 53 32, 50 36, 46 38 C 38 42, 26 42, 18 39 Z" fill="#3a78b8"/>
    <path d="M28 18 C 30 12, 34 8, 40 7 C 37 11, 37 15, 38 18 Z" fill="#3a78b8"/>
    <path d="M18 39 C 13 42, 8 44, 3 44 C 6 41, 8 38, 8 35 Z" fill="#3a78b8"/>
    <path d="M18 39 C 15 45, 12 50, 8 53 C 9 48, 10 44, 12 40 Z" fill="#3a78b8"/>
    <path d="M24 37 C 30 39, 40 38, 46 34 C 42 40, 30 41, 24 37 Z" fill="#cfe2f3"/>
    <path d="M34 34 C 36 37, 37 40, 36 44 C 33 41, 32 38, 32 35 Z" fill="#2c5f93"/>
    <circle cx="49" cy="23" r="2" fill="#1d2a38"/>`),

  // Schildkröte = langsam
  turtle: svg(`
    <ellipse cx="18" cy="46" rx="5" ry="4" fill="#6f9e4a"/>
    <ellipse cx="44" cy="46" rx="5" ry="4" fill="#6f9e4a"/>
    <path d="M7 41 L 2 44 L 8 44 Z" fill="#6f9e4a"/>
    <circle cx="56" cy="37" r="6" fill="#6f9e4a"/>
    <circle cx="58" cy="35.5" r="1.3" fill="#1d2a38"/>
    <path d="M8 42 C 8 24, 18 16, 31 16 C 44 16, 54 24, 54 42 Z" fill="#8a6a3b"/>
    <path d="M14 42 C 14 28, 21 21, 31 21 C 41 21, 48 28, 48 42 Z" fill="#a88452"/>
    <path d="M31 21 L 31 42 M 18 32 L 44 32 M 22 24 L 26 32 L 22 42 M 40 24 L 36 32 L 40 42" stroke="#7a5c30" stroke-width="2" fill="none"/>
    <rect x="6" y="40" width="50" height="4" rx="2" fill="#7a5c30"/>`),

  // Fragezeichen = weiß nicht
  question: svg(`
    <circle cx="32" cy="32" r="27" fill="#ece3f5"/>
    <path d="M23 25 C 23 18, 28 14, 33 14 C 39 14, 43 18, 43 23 C 43 28, 40 30, 36 32 C 33 34, 32 36, 32 40" stroke="#6a4c93" stroke-width="6" fill="none" stroke-linecap="round"/>
    <circle cx="32" cy="49" r="4" fill="#6a4c93"/>`),

  home: svg(`<path d="M10 30 L32 12 L54 30 M16 26 V52 H48 V26" stroke="currentColor" stroke-width="5" fill="none" stroke-linejoin="round" stroke-linecap="round"/><rect x="27" y="36" width="10" height="16" fill="currentColor"/>`),

  undo: svg(`<path d="M24 16 L12 28 L24 40" stroke="currentColor" stroke-width="5" fill="none" stroke-linecap="round" stroke-linejoin="round"/><path d="M13 28 H38 C 47 28, 53 34, 53 42 C 53 50, 47 54, 40 54 H30" stroke="currentColor" stroke-width="5" fill="none" stroke-linecap="round"/>`),

  play: svg(`<path d="M22 14 L50 32 L22 50 Z" fill="currentColor" stroke="currentColor" stroke-width="4" stroke-linejoin="round"/>`),

  next: svg(`<path d="M12 32 H48 M34 18 L50 32 L34 46" stroke="currentColor" stroke-width="6" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`),

  moon: svg(`<path d="M40 10 C 26 12, 18 24, 20 36 C 22 48, 34 56, 48 52 C 38 50, 30 42, 30 31 C 30 21, 35 14, 40 10 Z" fill="currentColor"/>`),

  book: svg(`<path d="M8 14 C 16 12, 25 13, 32 18 C 39 13, 48 12, 56 14 V52 C 48 50, 39 51, 32 56 C 25 51, 16 50, 8 52 Z" fill="none" stroke="currentColor" stroke-width="4" stroke-linejoin="round"/><path d="M32 18 V56" stroke="currentColor" stroke-width="4"/>`),

  check: svg(`<path d="M14 34 L27 47 L51 19" stroke="currentColor" stroke-width="7" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`),

  close: svg(`<path d="M18 18 L46 46 M46 18 L18 46" stroke="currentColor" stroke-width="6" stroke-linecap="round"/>`),

  // Zahnrad mit Ring, der sich beim Gedrückthalten füllt
  gear: svg(`
    <circle cx="32" cy="32" r="15" fill="none" stroke="currentColor" stroke-width="8" stroke-dasharray="6.3 5.5"/>
    <circle cx="32" cy="32" r="11" fill="none" stroke="currentColor" stroke-width="5"/>
    <circle class="ring" cx="32" cy="32" r="29" fill="none" stroke="#2f6db5" stroke-width="4" pathLength="100" stroke-dasharray="100" stroke-dashoffset="100" transform="rotate(-90 32 32)"/>`),
};
