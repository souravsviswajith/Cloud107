# Mathematical Model Amendment — Pass 8 Consolidation

**Applies to:** *Current Mathematical Model — 107 / Cloud107 Unified System*, after the Pass 7 amendment
**Status:** Pass 8 result integrated; frontier advances to Pass 9 (multi-witness trust in summaries)
**Date:** 2026-10-02
**Resolution record:** [research_loop_08_compaction_history_rewriting.md](research_loop_08_compaction_history_rewriting.md)

Adds new sections to the unified model; revises §38–§40. The Pass 6/7 admission rules (R0–R5) and invariants (B1–B10) are unchanged except for the R0 position patch (§46 below).

---

## §41 Logical History vs Physical Representation (new)

\[
\boxed{
\text{Physical truncation}\neq\text{logical history destruction}
}
\]

Define the **logical history** as the equivalence class of physical representations under observational equivalence:

\[
\mathcal L^{*} := \{\,\mathcal R : \mathcal R \equiv_{\mathcal O} \mathcal L\,\}
\]

Pass 7's single-history statement survives as: *one logical history, many interchangeable physical witnesses*. No rule is defined over physical bytes; every rule evaluates the logical history through its retained summaries and suffix.

---

## §42 Snapshot as Committed Boundary (new)

A snapshot is a Pass 7 checkpoint extended with the history anchor, floors, and lifecycle:

\[
\boxed{
S_k=\big(k,\ \mathrm{root}(\mathcal M_k),\ anchor_k,\ \lambda_{floor},\ F_k,\ schema,\ status\big)
}
\]

with

\[
h_0=\mathbf 0;\quad h_k=H(h_{k-1}\parallel H(B_k));\quad anchor_k=h_k
\]

**Born compactable:** the running hash chain is maintained at append time, from genesis; anchors are computed before they are needed. A ledger that never chained cannot compact.

**Minting rule (race closure):**

\[
\boxed{
Snapshot(k)\ \text{may be minted only at a published checkpoint}\ (k,\ \mathrm{root}(\mathcal M_k))
}
\]

Snapshots never read live materializer state, so the snapshot/append race is unrepresentable.

**Lifecycle:** \(BUILDING \rightarrow VERIFIED \rightarrow PUBLISHED \rightarrow ELIGIBLE\_FOR\_TRUNCATION\), mirroring the Pass 5 object lifecycle \(FREE \rightarrow RESERVED \rightarrow COMMITTED \rightarrow RETIRED\) one layer up.

---

## §43 Compaction Protocol and Safe Truncation (new)

\[
\boxed{
Compact(\mathcal L,k):\ \text{build }\mathcal R_k=(S_k,\ \mathcal L_{>k})\ \rightarrow\ Verify\ \rightarrow\ \textbf{Activate (pointer swap)}\ \rightarrow\ \textbf{Reclaim}
}
\]

- Physical representations are immutable; a durable pointer names the current one (the repository's own fail-closed atomic-activation discipline, applied to the ledger).
- Truncation decomposes into *activation* (atomic) and *reclamation* (idempotent GC of the superseded representation). There is no in-place deletion.
- Re-anchoring is concrete: \(S_k\) is the header record of \(\mathcal R_k\).

\[
\boxed{
SafeTruncate(k)\ \iff\ SnapshotPublished(k)\ \land\ FloorsPreserved(k)\ \land\ ProvenanceAnchored(k)
}
\]

**Consumer recoverability is structural, not tracked:**

\[
Recoverable(c,k)\equiv SnapshotPublished(k)\ \text{for all } c;\qquad
\text{missing record}\Rightarrow RecoveryInstruction(S_{k'})\ \text{(never ERROR)}
\]

\[
Replay(c)=
\begin{cases}
\mathcal L[a_c+1:n], & a_c\ge k\\
S_k\rightarrow\mathcal L_{>k}, & a_c<k
\end{cases}
\]

Consumers anchor as \(A_c=(a_c,\ \mathrm{root}(\mathcal M_{a_c}))\); a root mismatch ⇒ corruption ⇒ mandatory snapshot re-recovery. Position alone is never trusted.

---

## §44 Fencing Floors — the Monotone Region (new)

\[
\boxed{
\lambda<\lambda_{floor}\Rightarrow REJECT
\qquad\qquad
\omega_{cand}\le_\omega \mu_k[E]\Rightarrow REJECT
}
\]

- \(\lambda_{floor}\): global epoch floor, stored in the snapshot header (max committed epoch at \(k\)).
- \(\mu_k\): **per-object** \((\lambda,\nu)_{max}\) table — a distinguished monotone region of \(\mathcal M_k\), maintained by \(Apply\), never garbage-collected, \(O(\text{objects})\) scalars. A global \(\omega\)-floor alone is insufficient (floors must be per-object to reject resurrection of *this* object's dead generation).

R5 and the fencing rule read only \((\lambda_{floor},\mu_k)\) and the suffix — never deleted records.

---

## §45 Provenance Frontier (new)

\[
\boxed{
F_k=\{\,H(C):C\in[0,k],\ \exists\ \text{retained record with }Parent=H(C)\,\}
}
\]

Post-compaction chain verification: \(Parent\in F_k\Rightarrow\) verified-by-anchor (optionally via Merkle membership against \(anchor_k\)); otherwise traverse retained records:

\[
Provenance_{post}(x)=F_k\cup Provenance_{suffix}(x)
\]

Frontier entries are droppable once no retained record references them (self-pruning across successive compactions).

---

## §46 R0 Patch — Position-Based Dedup (revises Pass 7 R0)

\[
\boxed{
pos(X)\le k\Rightarrow NoOp\ \text{(compacted region)};\qquad pos(X)>k\Rightarrow R0\ hash\ semantics
}
\]

Record positions travel with every record, so membership in the compacted region is a comparison, not a lookup. Prevents re-appended compacted records from being mistaken for fresh creates.

---

## §47 Retention Protocol (new)

\[
\boxed{
Deleteable(k)=SnapshotPublished(k)\ \land\ FloorsPreserved(k)\ \land\ ProvenanceAnchored(k)\ \land\ PolicyAllows(k)
}
\]

SafetyRetention and RetentionPolicy compose conjunctively: storage policy may only *delay* deletion below what safety permits, never enable deletion above it.

---

## §48 The Summarizability Meta-Rule (new — closes the pass)

Every history-reading rule must declare a **sufficient statistic** preserved by compaction:

| Rule | Statistic |
|---|---|
| Fencing \(\lambda\) | \(\lambda_{floor}\) |
| R5 \(\omega\)-monotonicity | \(\mu_k\) per-object floors |
| R1 derivation | \(F_k\) |
| R0 dedup | position tags |
| R2 no-fork, \(Live_B\) | live state in \(\mathcal M_k\) + suffix |
| Replay | \(S_k\) itself |

\[
\boxed{
\text{No rule without a summary.}
}
\]

A future rule that cannot name its statistic must force retention of the records it reads.

---

## §38 Current Research Frontier (replaced — Pass 9)

Compaction is resolved at model level under the summarizability theorem; its honest boundary relocates the root of trust into the **snapshot** — a summary no consumer re-verifies record-by-record. Across nodes, representations diverge legitimately (e.g. \(\mathcal R_{50}\) vs \(\mathcal R_{80}\)), and snapshot credibility across them is unanchored:

\[
\boxed{
S_k\leftrightarrow S_k'\leftrightarrow Trust
\quad\text{under}\quad
Sync\ \parallel\ Forgery\ \parallel\ Corruption
}
\]

> **Pass 9 question:** *Can many physical representations with divergent compaction boundaries jointly verify the one logical history — such that no forged, stale, or corrupt snapshot is accepted, every replica recovers from the others, and the trust root for summaries is anchored in the system's existing cryptographic identity (the same Ed25519 root that already governs updates)?*

---

## §39 Highest-Level Model (constraint block additions)

\[
\boxed{
\begin{aligned}
h_k&=H(h_{k-1}\parallel H(B_k)) &&\text{(born compactable)}\\
Snapshot(k)&\Rightarrow Checkpoint(k) &&\text{(checkpoint-minted)}\\
Truncate(k)&\Rightarrow Verified(S_k)\ \text{and activation is atomic} &&\text{(B12, B19)}\\
\lambda<\lambda_{floor}\ &\Rightarrow\ REJECT;\quad \omega\le_\omega\mu_k[E]\Rightarrow REJECT &&\text{(B14, B15)}\\
\mathcal L^*&=\text{equivalence class under } \equiv_{\mathcal O} &&\text{(§41)}
\end{aligned}
}
\]

---

## §40 Open Problems (revised)

1–4. Identity–binding atomicity cluster — resolved (Pass 6, amended Pass 7).
5. Distributed GC of stale bindings — **resolved at model level (Pass 8)**: compaction protocol + retention protocol + frontier GC; machine verification pending.
6–8. Prime reservation recovery; consensus/fencing implementation; multi-node scheduling correctness — unchanged, open. (Consensus work now connects directly to Pass 9: snapshot anchoring needs the same quorum machinery.)
9. Artifact-store consistency — resolved at model level (Pass 7 §21a).
10. Formal verification of the Q4 transition system; **TLA+ encoding of B1–B19** — open.
11–14. Empirical programs — unchanged, open.
15. End-to-end invariant testing — **extended (Pass 8)**: differential history-rewriting testing is the flagship target.

**New open problem (16): multi-witness trust in summaries** — snapshot authentication, quorum anchoring, divergent-representation reconciliation, corrupted-replica recovery. This is the Pass 9 target.

The next research pass should therefore attack:

\[
\boxed{
Snapshot\ Anchoring\ \parallel\ Replica\ Divergence\ \parallel\ Corruption
}
\]

rather than introducing additional architectural abstractions before the summary trust root is resolved.
