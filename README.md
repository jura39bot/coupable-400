# 🕵️ Le coupable est parmi 400

**12 indices. 400 suspects. Un seul coupable.**

Jeu de déduction en français : on te donne des indices (ville, métier, âge, hobby, animal…) et tu dois éliminer les suspects jusqu'à identifier le coupable. Garanti mathématiquement : après les 12 indices, **une seule** personne reste compatible.

---

## 🎮 Jouer tout de suite (iPhone / Android / PC)

👉 **https://jura39bot.github.io/coupable-400/**

**Sur iPhone :** ouvrir le lien dans **Safari** → bouton Partager → **« Sur l'écran d'accueil »**.
L'app s'installe comme une vraie application (plein écran, icône, fonctionne **hors ligne**).


## 🃏 Mode visages (nouveau)

Les 400 suspects ont maintenant un **visage dessiné** (SVG procédural, généré depuis leurs attributs) :
- **lunettes**, **barbe**, **couleur de cheveux**, **couvre-chef** et **âge** (rides) sont visibles sur la tête
- les autres indices (ville, métier, animal, boisson, hobby, taille) restent en texte

Interactions :
- **Clic sur une tête** = la barrer / la débarrer (elle se grise avec une croix rouge)
- **🔍 Loupe** = visage en grand, **curseur de flou** pour isoler un détail, **gribouillage rouge** pour entourer un trait, puis **« J'accuse »**
- Bouton **« Effacer les barres »** pour repartir à zéro

Les visages sont générés côté navigateur : aucun fichier image, aucune requête réseau, ça marche **hors ligne**.

## 📱 App iOS native (SwiftUI)

Sources complètes dans [`ios/`](ios/) — projet Xcode généré avec XcodeGen :

```bash
brew install xcodegen
cd ios && xcodegen generate
open Coupable400.xcodeproj   # puis ⌘R vers ton iPhone
```

Détails (signature, mode développeur, compte gratuit vs payant) : [`ios/README.md`](ios/README.md)

## ✨ Fonctionnalités

- 400 suspects générés aléatoirement (prénom, nom, genre, lunettes, cheveux, barbe, couvre-chef, âge, taille, ville, métier, animal, boisson, hobby)
- 12 indices révélés **un par un**, classés du plus discriminant au plus fin
- Chaque indice affiche le nombre de personnes éliminées et combien il en reste
- Filtrage automatique de la liste, ou mode manuel (recherche + filtres par attribut)
- Accusation en un clic → verdict
- Parties illimitées (« Nouvelle enquête »)
- Rejouer une enquête précise : `?enquete=42`
- 100 % hors ligne, aucune donnée envoyée

## 🧠 Comment c'est garanti sans triche

Le casting est généré avec un PRNG déterministe (seed) : les 400 suspects ont des combinaisons d'attributs **uniques**. Les 12 indices sont les valeurs d'attribut du coupable : l'intersection des 12 contraintes ne peut donc contenir que lui. Vérifié sur 300 enquêtes aléatoires (300/300 → exactement 1 suspect restant).

- `engine.js` — moteur JavaScript (navigateur + Node, `node engine.js` lance l'auto-test)
- `ios/Coupable400/Engine.swift` — portage Swift du même moteur

## 📂 Structure

```
index.html            # le jeu (PWA)
manifest.webmanifest  # installation écran d'accueil
sw.js                 # cache hors ligne
icons/                # icônes
ios/                  # app iOS native (SwiftUI)
```

---

_Pas de données personnelles, pas de serveur, pas de pub. Un jeu, point._
