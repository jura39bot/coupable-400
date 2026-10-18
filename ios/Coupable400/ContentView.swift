//
//  ContentView.swift
//  Coupable400
//

import SwiftUI

struct ContentView: View {
    @StateObject private var store = GameStore()

    var body: some View {
        NavigationStack {
            VStack(spacing: 0) {
                cluesSection
                Divider()
                suspectsSection
                verdictBar
            }
            .navigationTitle("Le coupable est parmi 400")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .topBarLeading) {
                    Button {
                        store.revealNext()
                    } label: {
                        Label("Indice", systemImage: "plus.magnifyingglass")
                    }
                    .disabled(store.allCluesRevealed)
                }
                ToolbarItem(placement: .topBarTrailing) {
                    Menu {
                        Button("Révéler tous les indices") { store.revealAll() }
                        Button("Réinitialiser les filtres") { store.reset() }
                        Button("Nouvelle enquête") { store.newCase() }
                    } label: {
                        Label("Menu", systemImage: "ellipsis.circle")
                    }
                }
            }
        }
    }

    // MARK: - Indices

    private var cluesSection: some View {
        VStack(alignment: .leading, spacing: 6) {
            HStack {
                Text("INDICES")
                    .font(.caption).bold()
                    .foregroundStyle(.secondary)
                Spacer()
                Text("\(store.revealedCount)/\(store.clues.count)")
                    .font(.caption.monospacedDigit())
                    .foregroundStyle(.secondary)
            }
            .padding(.horizontal)
            .padding(.top, 8)

            if store.visibleClues.isEmpty {
                Text("Touche « Indice » en haut à gauche pour démarrer l'enquête.")
                    .font(.footnote)
                    .foregroundStyle(.secondary)
                    .padding(.horizontal)
                    .padding(.bottom, 8)
            } else {
                ScrollView(.horizontal, showsIndicators: false) {
                    HStack(spacing: 10) {
                        ForEach(Array(store.visibleClues.enumerated()), id: \.element.id) { index, clue in
                            VStack(alignment: .leading, spacing: 4) {
                                Text("\(index + 1). \(clue.text)")
                                    .font(.subheadline)
                                    .fixedSize(horizontal: false, vertical: true)
                                Text("reste \(clue.remainingAfter)")
                                    .font(.caption2)
                                    .foregroundStyle(.secondary)
                            }
                            .padding(10)
                            .frame(width: 260, alignment: .leading)
                            .background(Color(.secondarySystemBackground))
                            .clipShape(RoundedRectangle(cornerRadius: 10))
                        }
                    }
                    .padding(.horizontal)
                }
                .padding(.bottom, 8)
            }
        }
    }

    // MARK: - Suspects

    private var suspectsSection: some View {
        VStack(spacing: 0) {
            HStack(spacing: 8) {
                Image(systemName: "magnifyingglass").foregroundStyle(.secondary)
                TextField("Rechercher un nom", text: $store.searchText)
                    .textInputAutocapitalization(.never)
                    .autocorrectionDisabled()
                Toggle("Filtre auto", isOn: $store.autoFilter)
                    .labelsHidden()
                Text("\(store.remainingSuspects.count) / \(store.enquete.suspects.count)")
                    .font(.caption.monospacedDigit())
                    .foregroundStyle(.secondary)
            }
            .padding(.horizontal)
            .padding(.vertical, 8)

            List(store.remainingSuspects) { suspect in
                Button {
                    store.accuse(suspect)
                } label: {
                    HStack {
                        VStack(alignment: .leading, spacing: 2) {
                            Text(suspect.fullName).font(.body)
                            Text("\(suspect.metier) · \(suspect.ville) · \(suspect.age) ans")
                                .font(.caption)
                                .foregroundStyle(.secondary)
                        }
                        Spacer()
                        if store.solved && suspect.id == store.culprit.id {
                            Image(systemName: "checkmark.seal.fill").foregroundStyle(.green)
                        }
                        if store.accusedId == suspect.id && suspect.id != store.culprit.id {
                            Image(systemName: "xmark.seal.fill").foregroundStyle(.red)
                        }
                    }
                }
                .buttonStyle(.plain)
            }
            .listStyle(.plain)
        }
    }

    // MARK: - Verdict

    private var verdictBar: some View {
        Text(store.verdict)
            .font(.footnote)
            .padding(12)
            .frame(maxWidth: .infinity, alignment: .leading)
            .background(Color(.secondarySystemBackground))
    }
}

#Preview {
    ContentView()
}
