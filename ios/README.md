# Coupable 400 — app iOS (SwiftUI)

Application native iOS (iPhone, portrait), 100 % hors ligne. Aucune dépendance externe.

## Contenu
- `Coupable400/Coupable400App.swift` — point d'entrée
- `Coupable400/Engine.swift` — moteur : génération des 400 suspects + 12 indices (portage de `engine.js`)
- `Coupable400/GameStore.swift` — état du jeu (ObservableObject)
- `Coupable400/ContentView.swift` — interface (indices, liste filtrable, accusation)
- `project.yml` — description XcodeGen

## Compiler (sur un Mac)
1. Installer Xcode (App Store) puis, dans un terminal : `brew install xcodegen`
2. `cd ios && xcodegen generate`
3. Ouvrir `Coupable400.xcodeproj`
4. Sélectionner ton iPhone (ou un simulateur) → ⌘R

## Installer sur ton iPhone (sans App Store)
1. Brancher l'iPhone en USB, l'appairer, activer « Mode développeur » (Réglages → Confidentialité et sécurité).
2. Dans Xcode : onglet du projet → *Signing & Capabilities* → cocher *Automatically manage signing* → choisir ton **Apple ID** comme Team.
3. Choisir l'iPhone comme destination → ⌘R.
4. Au premier lancement : Réglages → Général → VPN et gestion de l'appareil → faire confiance à ton certificat développeur.

> Compte Apple gratuit : l'app reste valable 7 jours (il suffit de refaire ⌘R). Compte développeur payant (99 €/an) : 1 an.

## Sans Mac
Utilise la version web installable (PWA) : voir le README à la racine du dépôt.
