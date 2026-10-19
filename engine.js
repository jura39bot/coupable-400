/* ============================================================
   MOTEUR — « Le coupable est parmi 400 »
   Logique pure (aucun DOM) : génération d'enquêtes + indices.
   Utilisable en Node (tests) et dans le navigateur.
   ============================================================ */

/* ---------- PRNG déterministe (mulberry32) ---------- */
function makeRng(seed) {
  let a = seed >>> 0;
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/* ---------- Réservoirs de valeurs ---------- */
const PRENOMS_H = ["Lucas","Hugo","Nathan","Louis","Jules","Gabriel","Adam","Raphaël","Arthur","Ethan","Paul","Tom","Noah","Sacha","Timéo","Maël","Antoine","Baptiste","Clément","Damien","Étienne","Fabien","Gaël","Henri","Ivan","Jérémy","Karim","Laurent","Mathieu","Nicolas","Olivier","Pierre","Quentin","Rémi","Sébastien","Théo","Ulysse","Victor","William","Yann","Alexis","Bruno","Cédric","Denis","Émile","Franck","Grégory","Hervé","Joël","Kevin","Lionel","Marc","Noé","Pascal","Roland","Serge","Tristan","Vincent","Xavier","Zacharie"];
const PRENOMS_F = ["Léa","Emma","Chloé","Manon","Camille","Sarah","Inès","Louise","Jade","Alice","Lina","Rose","Anna","Juliette","Zoé","Mila","Ambre","Clara","Élise","Fanny","Gabrielle","Hélène","Iris","Jeanne","Katie","Laura","Marine","Noémie","Océane","Pauline","Quitterie","Rachel","Sophie","Thaïs","Ursule","Victoire","Wendy","Yasmine","Amandine","Bérénice","Céline","Delphine","Élodie","Florence","Gwendoline","Hortense","Isabelle","Joséphine","Karine","Lucie","Maëlys","Nina","Ophélie","Perrine","Roxane","Ségolène","Tiphaine","Valentine","Yvette","Zoé"];
const NOMS = ["Martin","Bernard","Dubois","Thomas","Robert","Richard","Petit","Durand","Leroy","Moreau","Simon","Laurent","Lefebvre","Michel","Garcia","David","Bertrand","Roux","Vincent","Fournier","Morel","Girard","André","Lefèvre","Mercier","Dupont","Lambert","Bonnet","François","Martinez","Legrand","Garnier","Faure","Rousseau","Blanc","Guerin","Muller","Henry","Roussel","Nicolas","Perrin","Morin","Mathieu","Clement","Gauthier","Dumont","Lopez","Fontaine","Chevalier","Robin","Masson","Sanchez","Gerard","Nguyen","Boyer","Denis","Lemaire","Duval","Joly","Gautier"];

/* ---------- Attributs (les 12 indices) ---------- */
const ATTRS = [
  { key: "genre",    label: "Genre",   values: ["homme", "femme"] },
  { key: "lunettes", label: "Lunettes", values: [true, false], fmt: v => v ? "oui" : "non" },
  { key: "cheveux",  label: "Cheveux", values: ["noirs", "bruns", "blonds", "roux", "gris"] },
  { key: "barbe",    label: "Barbe",   values: [true, false], fmt: v => v ? "oui" : "non" },
  { key: "chapeau",  label: "Couvre-chef", values: [true, false], fmt: v => v ? "oui" : "non" },
  { key: "age",      label: "Âge",     values: ["25-34", "35-44", "45-54", "55-65"] },
  { key: "taille",   label: "Taille",  values: ["<1,70 m", "1,70-1,79 m", "1,80-1,89 m", "1,90 m et +"] },
  { key: "ville",    label: "Ville",   values: ["Morez", "Saint-Claude", "Lons-le-Saunier", "Champagnole", "Besançon", "Pontarlier", "Genève", "Divonne-les-Bains"] },
  { key: "metier",   label: "Métier",  values: ["horloger", "agriculteur", "facteur", "libraire", "médecin", "restaurateur", "ingénieur", "artiste", "professeur", "gendarme"] },
  { key: "animal",   label: "Animal",  values: ["chat", "chien", "perroquet", "poisson rouge", "lapin", "aucun"] },
  { key: "boisson",  label: "Boisson", values: ["café", "thé", "chocolat chaud", "jus de pomme", "bière artisanale"] },
  { key: "hobby",    label: "Hobby",   values: ["la randonnée", "le ski", "les échecs", "la photographie", "le jardinage", "la lecture", "la musique", "le bricolage"] },
];

/* ---------- Phrasé des indices ---------- */
function clueText(attr, val, culprit) {
  const h = culprit.genre === "homme";
  switch (attr.key) {
    case "genre":    return h ? "Le coupable est un homme." : "La coupable est une femme.";
    case "lunettes": return val ? "Un témoin l'a vu porter des lunettes." : "Un témoin affirme qu'il/elle ne porte pas de lunettes.";
    case "cheveux":  return `Un témoin a décrit des cheveux ${val}.`;
    case "barbe":    return val ? "Le coupable a une barbe fournie." : "Le coupable n'a pas de barbe.";
    case "chapeau":  return val ? "Il/elle portait un couvre-chef (chapeau ou casquette)." : "Il/elle était tête nue, sans chapeau ni casquette.";
    case "age":      return `Son âge se situe entre ${val.split("-")[0]} et ${val.split("-")[1]} ans.`;
    case "taille":   return `Sa taille : ${val}.`;
    case "ville":    return `Le coupable habite à ${val}.`;
    case "metier":   return `Le coupable travaille comme ${val}.`;
    case "animal":   return val === "aucun" ? "Il/elle n'a aucun animal de compagnie." : `Il/elle vit avec un ${val}.`;
    case "boisson":  return `Sa boisson préférée : ${val}.`;
    case "hobby":    return `Il/elle adore ${val}.`;
    default:         return `${attr.label} : ${val}`;
  }
}

/* ---------- Génération du casting (400 personnes uniques) ---------- */
function buildSuspects(rng, n, pools) {
  const seen = new Set();
  const out = [];
  let guard = 0;
  while (out.length < n && guard++ < n * 60) {
    const s = {};
    for (const a of ATTRS) s[a.key] = a.values[Math.floor(rng() * a.values.length)];
    // réalisme des visages : pas de barbe sur les femmes
    if (s.genre === "femme") s.barbe = false;
    const key = ATTRS.map(a => String(s[a.key])).join("|");
    if (seen.has(key)) continue;
    seen.add(key);
    const prenom = s.genre === "homme"
      ? pools.prenomsH[Math.floor(rng() * pools.prenomsH.length)]
      : pools.prenomsF[Math.floor(rng() * pools.prenomsF.length)];
    const nom = pools.noms[Math.floor(rng() * pools.noms.length)];
    s.prenom = prenom; s.nom = nom;
    // dédoublonne les noms complets
    const full = prenom + " " + nom;
    if (pools.usedNames.has(full)) continue;
    pools.usedNames.add(full);
    s.id = out.length + 1;
    out.push(s);
  }
  return out;
}

/* ---------- Création d'une enquête ---------- */
function makeCase(seed, n = 400) {
  const rng = makeRng(seed);
  const pools = { prenomsH: PRENOMS_H, prenomsF: PRENOMS_F, noms: NOMS, usedNames: new Set() };
  const suspects = buildSuspects(rng, n, pools);
  if (suspects.length !== n) throw new Error("casting incomplet: " + suspects.length);

  const culprit = suspects[Math.floor(rng() * suspects.length)];

  // un indice par attribut : la valeur du coupable
  let clues = ATTRS.map(a => ({
    key: a.key, label: a.label, value: culprit[a.key],
    text: clueText(a, culprit[a.key], culprit),
    match: s => s[a.key] === culprit[a.key],
  }));

  // power = nb de personnes éliminées
  for (const c of clues) c.eliminated = suspects.filter(s => !c.match(s)).length;
  // tri : indices les plus « puissants » d'abord (mais on garde le genre en tête, c'est la base)
  clues.sort((a, b) => b.eliminated - a.eliminated);

  // restants après chaque indice, dans l'ordre
  let remaining = suspects.slice();
  for (const c of clues) {
    remaining = remaining.filter(c.match);
    c.remainingAfter = remaining.length;
  }

  return {
    seed, culprit, suspects, clues,
    n,
    check: remaining.length, // doit valoir 1
  };
}

/* ---------- Export ---------- */
if (typeof module !== "undefined" && module.exports) {
  module.exports = { makeCase, ATTRS, clueText, makeRng, buildSuspects, PRENOMS_H, PRENOMS_F, NOMS };
}

/* ---------- Auto-test (node engine.js) ---------- */
if (typeof require !== "undefined" && require.main === module) {
  let ok = 0, bad = 0, minRem = 1e9, maxRem = 0;
  const t0 = Date.now();
  for (let s = 1; s <= 300; s++) {
    const c = makeCase(s);
    if (c.check === 1 && c.suspects.length === 400) ok++; else { bad++; console.log("FAIL seed", s, "check=", c.check); }
    if (c.clues[0].remainingAfter > maxRem) maxRem = c.clues[0].remainingAfter;
  }
  const c = makeCase(42);
  console.log("300 enquêtes générées en", Date.now() - t0, "ms — OK:", ok, "KO:", bad);
  console.log("Exemple seed 42 — coupable:", c.culprit.prenom, c.culprit.nom);
  console.log("Indices (ordre, éliminés, restants) :");
  for (const cl of c.clues) console.log(`  - [${cl.key}] ${cl.text} (élimine ${cl.eliminated}, reste ${cl.remainingAfter})`);
  console.log("Vérification finale :", c.check, "suspect(s) compatible(s)");
}
