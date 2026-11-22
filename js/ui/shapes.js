// Zwischenreize: farbige Formen, die Sebastian benennt ("roter Kreis").

export const COLORS = {
  rot: "#d8483f",
  blau: "#2e6fd1",
  gelb: "#f2c12e",
  grün: "#3d9b4b",
  orange: "#ef8a26",
};

// Formfamilien. Pfeile zählen als eine Familie, damit sie nicht zu oft kommen.
const FAMILIES = ["kreis", "quadrat", "dreieck", "herz", "stern", "pfeil"];
const ARROWS = ["pfeil-oben", "pfeil-unten", "pfeil-links", "pfeil-rechts"];

const pick = (list, not) => {
  const options = list.filter((x) => x !== not);
  return options[Math.floor(Math.random() * options.length)];
};

export function makeDistractor(prev) {
  const prevFamily = prev?.shape?.startsWith("pfeil") ? "pfeil" : prev?.shape;
  const family = pick(FAMILIES, prevFamily);
  const shape = family === "pfeil" ? pick(ARROWS) : family;
  const color = pick(Object.keys(COLORS), prev?.color);
  return { shape, color };
}

function starPoints(cx, cy, R, r, n = 5, rot = -90) {
  const pts = [];
  for (let k = 0; k < n * 2; k++) {
    const rad = k % 2 ? r : R;
    const a = ((rot + k * (180 / n)) * Math.PI) / 180;
    pts.push(`${(cx + rad * Math.cos(a)).toFixed(1)},${(cy + rad * Math.sin(a)).toFixed(1)}`);
  }
  return pts.join(" ");
}

const ARROW = "50,8 88,48 64,48 64,92 36,92 36,48 12,48";
const ROT = { "pfeil-oben": 0, "pfeil-rechts": 90, "pfeil-unten": 180, "pfeil-links": 270 };

export function shapeSVG(shape, color) {
  const fill = COLORS[color] || color;
  const st = `fill="${fill}" stroke="rgba(0,0,0,.22)" stroke-width="2" stroke-linejoin="round"`;
  let body;
  switch (shape) {
    case "kreis":
      body = `<circle cx="50" cy="50" r="40" ${st}/>`;
      break;
    case "quadrat":
      body = `<rect x="13" y="13" width="74" height="74" rx="5" ${st}/>`;
      break;
    case "dreieck":
      body = `<polygon points="50,10 92,86 8,86" ${st}/>`;
      break;
    case "herz":
      body = `<path d="M50 88 C 20 66, 6 48, 12 30 C 18 13, 41 11, 50 29 C 59 11, 82 13, 88 30 C 94 48, 80 66, 50 88 Z" ${st}/>`;
      break;
    case "stern":
      body = `<polygon points="${starPoints(50, 54, 44, 18)}" ${st}/>`;
      break;
    default:
      body = `<polygon points="${ARROW}" ${st} transform="rotate(${ROT[shape] || 0} 50 50)"/>`;
  }
  return `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${color} ${shape}">${body}</svg>`;
}
