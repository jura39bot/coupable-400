//
//  Engine.swift
//  Coupable400
//
//  Moteur du jeu « Le coupable est parmi 400 ».
//  Portage Swift de engine.js — génération déterministe, 100 % hors ligne.
//

import Foundation

// MARK: - Générateur pseudo-aléatoire déterministe (mulberry32)

struct SeededRng {
    private var state: UInt32

    init(seed: Int) { state = UInt32(truncatingIfNeeded: seed) }

    mutating func next() -> Double {
        state = state &+ 0x6D2B79F5
        var t = state
        t = (t ^ (t >> 15)) &* (1 | t)
        t = t &+ ((t ^ (t >> 7)) &* (61 | t)) ^ t
        return Double((t ^ (t >> 14))) / 4294967296.0
    }

    mutating func int(_ upperBound: Int) -> Int {
        guard upperBound > 0 else { return 0 }
        return Int(next() * Double(upperBound)) % upperBound
    }

    mutating func pick<T>(_ array: [T]) -> T { array[int(array.count)] }
}

// MARK: - Attributs

enum AttrKey: String, CaseIterable, Identifiable {
    case genre, lunettes, cheveux, barbe, chapeau, age, taille, ville, metier, animal, boisson, hobby

    var id: String { rawValue }

    var label: String {
        switch self {
        case .genre: return "Genre"
        case .lunettes: return "Lunettes"
        case .cheveux: return "Cheveux"
        case .barbe: return "Barbe"
        case .chapeau: return "Couvre-chef"
        case .age: return "Âge"
        case .taille: return "Taille"
        case .ville: return "Ville"
        case .metier: return "Métier"
        case .animal: return "Animal"
        case .boisson: return "Boisson"
        case .hobby: return "Hobby"
        }
    }

    /// Valeurs proposées dans les filtres (le genre est exclu côté UI).
    var filterValues: [String] {
        switch self {
        case .genre: return ["homme", "femme"]
        case .lunettes, .barbe, .chapeau: return ["oui", "non"]
        case .cheveux: return ["noirs", "bruns", "blonds", "roux", "gris"]
        case .age: return ["25-34", "35-44", "45-54", "55-65"]
        case .taille: return ["<1,70 m", "1,70-1,79 m", "1,80-1,89 m", "1,90 m et +"]
        case .ville: return ["Morez", "Saint-Claude", "Lons-le-Saunier", "Champagnole", "Besançon", "Pontarlier", "Genève", "Divonne-les-Bains"]
        case .metier: return ["horloger", "agriculteur", "facteur", "libraire", "médecin", "restaurateur", "ingénieur", "artiste", "professeur", "gendarme"]
        case .animal: return ["chat", "chien", "perroquet", "poisson rouge", "lapin", "aucun"]
        case .boisson: return ["café", "thé", "chocolat chaud", "jus de pomme", "bière artisanale"]
        case .hobby: return ["la randonnée", "le ski", "les échecs", "la photographie", "le jardinage", "la lecture", "la musique", "le bricolage"]
        }
    }
}

// MARK: - Suspect

struct Suspect: Identifiable, Hashable {
    let id: Int
    var prenom: String
    var nom: String
    var genre: String
    var lunettes: Bool
    var cheveux: String
    var barbe: Bool
    var chapeau: Bool
    var age: String
    var taille: String
    var ville: String
    var metier: String
    var animal: String
    var boisson: String
    var hobby: String

    var fullName: String { "\(prenom) \(nom)" }

    func value(for key: AttrKey) -> String {
        switch key {
        case .genre: return genre
        case .lunettes: return lunettes ? "oui" : "non"
        case .cheveux: return cheveux
        case .barbe: return barbe ? "oui" : "non"
        case .chapeau: return chapeau ? "oui" : "non"
        case .age: return age
        case .taille: return taille
        case .ville: return ville
        case .metier: return metier
        case .animal: return animal
        case .boisson: return boisson
        case .hobby: return hobby
        }
    }
}

// MARK: - Indice

struct Clue: Identifiable {
    let id = UUID()
    let key: AttrKey
    let text: String
    var eliminated: Int = 0
    var remainingAfter: Int = 0

    func matches(_ suspect: Suspect, culprit: Suspect) -> Bool {
        suspect.value(for: key) == culprit.value(for: key)
    }
}

// MARK: - Enquête

struct Enquete {
    let seed: Int
    let suspects: [Suspect]
    let culprit: Suspect
    let clues: [Clue]
}

// MARK: - Moteur

enum Engine {
    static let prenomsH = ["Lucas","Hugo","Nathan","Louis","Jules","Gabriel","Adam","Raphaël","Arthur","Ethan","Paul","Tom","Noah","Sacha","Timéo","Maël","Antoine","Baptiste","Clément","Damien","Étienne","Fabien","Gaël","Henri","Ivan","Jérémy","Karim","Laurent","Mathieu","Nicolas","Olivier","Pierre","Quentin","Rémi","Sébastien","Théo","Ulysse","Victor","William","Yann","Alexis","Bruno","Cédric","Denis","Émile","Franck","Grégory","Hervé","Joël","Kevin","Lionel","Marc","Noé","Pascal","Roland","Serge","Tristan","Vincent","Xavier","Zacharie"]

    static let prenomsF = ["Léa","Emma","Chloé","Manon","Camille","Sarah","Inès","Louise","Jade","Alice","Lina","Rose","Anna","Juliette","Zoé","Mila","Ambre","Clara","Élise","Fanny","Gabrielle","Hélène","Iris","Jeanne","Katie","Laura","Marine","Noémie","Océane","Pauline","Quitterie","Rachel","Sophie","Thaïs","Ursule","Victoire","Wendy","Yasmine","Amandine","Bérénice","Céline","Delphine","Élodie","Florence","Gwendoline","Hortense","Isabelle","Joséphine","Karine","Lucie","Maëlys","Nina","Ophélie","Perrine","Roxane","Ségolène","Tiphaine","Valentine","Yvette"]

    static let noms = ["Martin","Bernard","Dubois","Thomas","Robert","Richard","Petit","Durand","Leroy","Moreau","Simon","Laurent","Lefebvre","Michel","Garcia","David","Bertrand","Roux","Vincent","Fournier","Morel","Girard","André","Lefèvre","Mercier","Dupont","Lambert","Bonnet","François","Martinez","Legrand","Garnier","Faure","Rousseau","Blanc","Guerin","Muller","Henry","Roussel","Nicolas","Perrin","Morin","Mathieu","Clement","Gauthier","Dumont","Lopez","Fontaine","Chevalier","Robin","Masson","Sanchez","Gerard","Nguyen","Boyer","Denis","Lemaire","Duval","Joly","Gautier"]

    static func clueText(_ key: AttrKey, _ value: String, culprit: Suspect) -> String {
        switch key {
        case .genre:
            return culprit.genre == "homme" ? "Le coupable est un homme." : "La coupable est une femme."
        case .lunettes:
            return value == "oui" ? "Un témoin l'a vu porter des lunettes." : "Un témoin affirme qu'il/elle ne porte pas de lunettes."
        case .cheveux:
            return "Un témoin a décrit des cheveux \(value)."
        case .barbe:
            return value == "oui" ? "Le coupable a une barbe fournie." : "Le coupable n'a pas de barbe."
        case .chapeau:
            return value == "oui" ? "Il/elle portait un couvre-chef (chapeau ou casquette)." : "Il/elle était tête nue, sans chapeau ni casquette."
        case .age:
            let parts = value.split(separator: "-")
            return "Son âge se situe entre \(parts.first ?? "") et \(parts.last ?? "") ans."
        case .taille:
            return "Sa taille : \(value)."
        case .ville:
            return "Le coupable habite à \(value)."
        case .metier:
            return "Le coupable travaille comme \(value)."
        case .animal:
            return value == "aucun" ? "Il/elle n'a aucun animal de compagnie." : "Il/elle vit avec un \(value)."
        case .boisson:
            return "Sa boisson préférée : \(value)."
        case .hobby:
            return "Il/elle adore \(value)."
        }
    }

    static func makeCase(seed: Int, count: Int = 400) -> Enquete {
        var rng = SeededRng(seed: seed)
        var suspects: [Suspect] = []
        var seenKeys = Set<String>()
        var usedNames = Set<String>()
        var guardCount = 0

        while suspects.count < count && guardCount < count * 80 {
            guardCount += 1
            var values: [AttrKey: String] = [:]
            for key in AttrKey.allCases { values[key] = rng.pick(key.filterValues) }
            let keyString = AttrKey.allCases.map { values[$0] ?? "" }.joined(separator: "|")
            if seenKeys.contains(keyString) { continue }

            let genre = values[.genre] ?? "homme"
            let prenom = genre == "homme" ? rng.pick(prenomsH) : rng.pick(prenomsF)
            let nom = rng.pick(noms)
            let full = "\(prenom) \(nom)"
            if usedNames.contains(full) { continue }
            usedNames.insert(full)
            seenKeys.insert(keyString)

            suspects.append(Suspect(
                id: suspects.count + 1, prenom: prenom, nom: nom, genre: genre,
                lunettes: (values[.lunettes] ?? "non") == "oui",
                cheveux: values[.cheveux] ?? "bruns",
                barbe: (values[.barbe] ?? "non") == "oui",
                chapeau: (values[.chapeau] ?? "non") == "oui",
                age: values[.age] ?? "25-34",
                taille: values[.taille] ?? "<1,70 m",
                ville: values[.ville] ?? "Morez",
                metier: values[.metier] ?? "horloger",
                animal: values[.animal] ?? "aucun",
                boisson: values[.boisson] ?? "café",
                hobby: values[.hobby] ?? "la lecture"
            ))
        }

        let culprit = suspects[rng.int(suspects.count)]

        var clues: [Clue] = AttrKey.allCases.map { key in
            let value = culprit.value(for: key)
            var clue = Clue(key: key, text: clueText(key, value, culprit: culprit))
            clue.eliminated = suspects.filter { !clue.matches($0, culprit: culprit) }.count
            return clue
        }
        // indices les plus « puissants » d'abord
        clues.sort { $0.eliminated > $1.eliminated }

        var remaining = suspects
        for index in clues.indices {
            remaining = remaining.filter { clues[index].matches($0, culprit: culprit) }
            clues[index].remainingAfter = remaining.count
        }

        return Enquete(seed: seed, suspects: suspects, culprit: culprit, clues: clues)
    }
}
