//
//  GameStore.swift
//  Coupable400
//

import Foundation
import SwiftUI

@MainActor
final class GameStore: ObservableObject {
    @Published private(set) var enquete: Enquete
    @Published var revealedCount: Int = 0
    @Published var searchText: String = ""
    @Published var filters: [AttrKey: String] = [:]
    @Published var autoFilter: Bool = true
    @Published var accusedId: Int? = nil
    @Published var solved: Bool = false
    @Published var verdict: String = "Révèle des indices, puis touche un suspect pour l'accuser."

    init(seed: Int? = nil) {
        let s = seed ?? Int.random(in: 1...999_999_999)
        enquete = Engine.makeCase(seed: s)
    }

    var seed: Int { enquete.seed }
    var clues: [Clue] { enquete.clues }
    var visibleClues: [Clue] { Array(enquete.clues.prefix(revealedCount)) }
    var allCluesRevealed: Bool { revealedCount >= enquete.clues.count }

    var remainingSuspects: [Suspect] {
        var list = enquete.suspects
        if autoFilter {
            for clue in visibleClues {
                list = list.filter { clue.matches($0, culprit: enquete.culprit) }
            }
        }
        for (key, value) in filters {
            list = list.filter { $0.value(for: key) == value }
        }
        if !searchText.isEmpty {
            let q = searchText.lowercased()
            list = list.filter { $0.fullName.lowercased().contains(q) }
        }
        return list
    }

    var culprit: Suspect { enquete.culprit }

    func newCase() {
        enquete = Engine.makeCase(seed: Int.random(in: 1...999_999_999))
        reset()
    }

    func newCase(seed: Int) {
        enquete = Engine.makeCase(seed: seed)
        reset()
    }

    func reset() {
        revealedCount = 0
        filters = [:]
        searchText = ""
        autoFilter = true
        accusedId = nil
        solved = false
        verdict = "Révèle des indices, puis touche un suspect pour l'accuser."
    }

    func revealNext() {
        guard !allCluesRevealed else { return }
        revealedCount += 1
    }

    func revealAll() { revealedCount = enquete.clues.count }

    func accuse(_ suspect: Suspect) {
        guard !solved else { verdict = "Enquête résolue — lance une nouvelle enquête."; return }
        guard revealedCount > 0 else {
            verdict = "Révèle au moins un indice avant d'accuser."
            return
        }
        accusedId = suspect.id
        solved = true
        if suspect.id == enquete.culprit.id {
            verdict = "✅ Bravo ! C'était bien \(enquete.culprit.fullName) — trouvé en \(revealedCount) indice(s)."
        } else {
            verdict = "❌ Raté ! Tu as accusé \(suspect.fullName). Le coupable était \(enquete.culprit.fullName) (\(enquete.culprit.metier), \(enquete.culprit.ville), \(enquete.culprit.age) ans)."
        }
    }
}
