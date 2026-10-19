/* ============================================================
   VISAGES — génération procédurale de têtes SVG
   Chaque suspect obtient un visage déterministe.
   Les traits dessinés correspondent EXACTEMENT aux attributs :
   genre, lunettes, cheveux, barbe, couvre-chef, âge.
   ============================================================ */

const FACE = (() => {
  const SKIN = ["#f4cdac", "#eebd97", "#e3a781", "#d4946a", "#bd7f57", "#9c6644", "#7d4f34"];
  const BG   = ["#1f2a37", "#22303f", "#1d2b33", "#252c3f", "#2a2438", "#20303a", "#2b2b33"];
  const SHIRT= ["#2f6f8f", "#8f4b5f", "#3f7f57", "#8f7a2f", "#54468f", "#7a5230", "#2f7f7a", "#8f4b3a"];
  const HAIR = { noirs: "#1b1a20", bruns: "#5a3a22", blonds: "#d9b45f", roux: "#b4522a", gris: "#b9b9bd" };

  const pick = (arr, n) => arr[Math.abs(n) % arr.length];

  /* petit hash déterministe à partir de l'id + d'une graine */
  function h(s, salt) {
    let x = (s.id * 2654435761 + salt * 40503) % 2147483647;
    x = (x ^ (x >> 13)) * 1274126177 % 2147483647;
    return Math.abs(x);
  }

  function hairShape(s, color, tone) {
    const style = s.genre === "femme" ? (tone % 3) : (tone % 4); // variantes
    if (s.genre === "femme") {
      if (style === 0) return `
        <path d="M28 52c0-19 14-31 32-31s32 12 32 31v44c0 7-6 11-11 9-3-1-4-4-4-8V62c-9 6-21 8-34 4-6-2-9-5-9-9z" fill="${color}"/>
        <path d="M28 52c0-19 14-31 32-31 9 0 17 3 23 9-14 1-27 8-34 20-4 7-6 15-6 24v14c0 4-1 7-4 8-5 2-11-2-11-9z" fill="${color}" opacity=".92"/>`;
      if (style === 1) return `
        <path d="M27 50c0-20 15-32 33-32s33 12 33 32c0 6-4 9-8 7 1-14-11-24-25-24s-26 10-25 24c-4 2-8-1-8-7z" fill="${color}"/>
        <circle cx="60" cy="20" r="11" fill="${color}"/>`;
      return `
        <path d="M29 55c0-18 14-30 31-30s31 12 31 30c0 5-3 8-7 7 0-13-10-22-24-22s-24 9-24 22c-4 1-7-2-7-7z" fill="${color}"/>
        <path d="M29 55c0 10 1 16 3 21-5 1-9-3-9-9 0-5 2-9 6-12z" fill="${color}"/>
        <path d="M91 55c0 10-1 16-3 21 5 1 9-3 9-9 0-5-2-9-6-12z" fill="${color}"/>`;
    }
    if (style === 0) return `<path d="M32 52c0-17 13-28 28-28s28 11 28 28c0 4-2 6-5 5-2-11-12-18-23-18s-21 7-23 18c-3 1-5-1-5-5z" fill="${color}"/>`;
    if (style === 1) return `
      <path d="M33 50c2-16 13-26 27-26s25 10 27 26c0 3-2 5-5 5-3-10-12-16-22-16s-19 6-22 16c-3 0-5-2-5-5z" fill="${color}"/>
      <path d="M40 30c8-6 20-7 30-2-8 5-19 7-30 2z" fill="${color}" opacity=".85"/>`;
    if (style === 2) return `
      <path d="M31 54c0-18 13-30 29-30s29 12 29 30c0 3-1 5-4 5-1-13-12-22-25-22s-24 9-25 22c-3 0-4-2-4-5z" fill="${color}"/>
      <path d="M36 58c-2 8-1 14 1 18-4 1-8-3-8-9 0-4 2-7 7-9z" fill="${color}"/>
      <path d="M84 58c2 8 1 14-1 18 4 1 8-3 8-9 0-4-2-7-7-9z" fill="${color}"/>`;
    return `<path d="M33 52c0-16 12-27 27-27s27 11 27 27c0 3-2 5-4 4-1-12-11-20-23-20s-22 8-23 20c-2 1-4-1-4-4z" fill="${color}"/>`;
  }

  function glasses() {
    return `
      <g stroke="#20242c" stroke-width="3" fill="none">
        <rect x="34" y="60" width="22" height="17" rx="7" fill="#8fd6ff" fill-opacity=".18"/>
        <rect x="65" y="60" width="22" height="17" rx="7" fill="#8fd6ff" fill-opacity=".18"/>
        <path d="M56 67h9"/>
        <path d="M34 66l-8-3"/><path d="M87 66l8-3"/>
      </g>`;
  }

  function beard(color) {
    return `
      <path d="M38 76c0 17 9 29 22 29s22-12 22-29c-4 9-12 14-22 14s-18-5-22-14z" fill="${color}" opacity=".95"/>
      <path d="M52 82c3 2 13 2 16 0-1 5-4 7-8 7s-7-2-8-7z" fill="${color}"/>
      <path d="M55 88c2-1 8-1 10 0-2 3-8 3-10 0z" fill="#8a4a3a"/>`;
  }

  function hat(s, tone) {
    const c = pick(["#c0392b", "#2c5f8a", "#3f7a4f", "#8a6d2c", "#4a3f6b"], tone);
    if (tone % 2 === 0) {
      return `<g><path d="M30 44c0-14 13-24 30-24s30 10 30 24v6H30z" fill="${c}"/>
        <path d="M24 50h72c3 0 4 3 2 5-4 4-18 6-38 6s-34-2-38-6c-2-2-1-5 2-5z" fill="${c}" opacity=".85"/>
        <circle cx="60" cy="26" r="4" fill="#f4cdac" opacity=".0"/></g>`;
    }
    return `<g><path d="M32 46c0-15 12-26 28-26s28 11 28 26v6H32z" fill="${c}"/>
      <rect x="30" y="50" width="60" height="9" rx="4" fill="${c}" opacity=".85"/>
      <path d="M32 46c0-15 12-26 28-26s28 11 28 26" fill="none" stroke="#00000022" stroke-width="2"/></g>`;
  }

  function ageMarks(age) {
    if (age === "25-34") return "";
    if (age === "35-44") return `<path d="M50 55h8M62 55h8" stroke="#00000026" stroke-width="2" stroke-linecap="round"/>`;
    if (age === "45-54") return `<path d="M49 52h10M61 52h10M48 93q4 4 8 0M64 93q4 4 8 0" stroke="#00000030" stroke-width="2" stroke-linecap="round" fill="none"/>`;
    return `<path d="M48 51h11M61 51h11M46 57h10M64 57h10M47 92q5 4 9 0M64 92q5 4 9 0" stroke="#00000033" stroke-width="2" stroke-linecap="round" fill="none"/>`;
  }

  /** Génère le SVG d'un suspect (chaîne complète, sans dépendance). */
  function svg(s, size = 120) {
    const skin = pick(SKIN, h(s, 1));
    const bg = pick(BG, h(s, 2));
    const shirt = pick(SHIRT, h(s, 3));
    const hairCol = HAIR[s.cheveux] || HAIR.bruns;
    const beardCol = s.cheveux === "blonds" ? "#c9a45a" : (s.cheveux === "roux" ? "#a4471f" : (s.cheveux === "gris" ? "#a8a8ac" : "#3a2a1c"));
    return `<svg viewBox="0 0 120 150" width="${size}" height="${size * 150 / 120}" xmlns="http://www.w3.org/2000/svg" role="img">
  <rect width="120" height="150" rx="14" fill="${bg}"/>
  <path d="M14 150c0-20 20-30 46-30s46 10 46 30z" fill="${shirt}"/>
  <rect x="52" y="98" width="16" height="18" rx="7" fill="${skin}"/>
  <ellipse cx="60" cy="72" rx="30" ry="34" fill="${skin}"/>
  <ellipse cx="29" cy="74" rx="6" ry="8" fill="${skin}"/>
  <ellipse cx="91" cy="74" rx="6" ry="8" fill="${skin}"/>
  ${hairShape(s, hairCol, h(s, 5))}
  ${ageMarks(s.age)}
  <ellipse cx="48" cy="70" rx="3.4" ry="3.8" fill="#2b2b33"/>
  <ellipse cx="72" cy="70" rx="3.4" ry="3.8" fill="#2b2b33"/>
  <path d="M42 61q6-4 12-1M66 60q6-3 12 1" stroke="${hairCol}" stroke-width="3" fill="none" stroke-linecap="round"/>
  <path d="M60 74v8q0 3-4 3" stroke="#00000030" stroke-width="2.4" fill="none" stroke-linecap="round"/>
  <path d="M51 90q9 7 18 0" stroke="#00000055" stroke-width="3" fill="none" stroke-linecap="round"/>
  ${s.genre === "femme" ? `<path d="M51 89q9 8 18 0-4 6-9 6t-9-6z" fill="#b8566a" opacity=".85"/>` : ""}
  ${s.barbe ? beard(beardCol) : ""}
  ${s.lunettes ? glasses() : ""}
  ${s.chapeau ? hat(s, h(s, 7)) : ""}
</svg>`;
  }

  return { svg, SKIN, HAIR };
})();

if (typeof module !== "undefined" && module.exports) module.exports = { FACE };
