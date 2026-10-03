# Mathematical Model Amendment — Pass 9 Consolidation

**Applies to:** *Current Mathematical Model — 107 / Cloud107 Unified System*, after the Pass 8 amendment
**Status:** Pass 9 result integrated; frontier advances to Pass 10 (trust-root governance / closure)
**Date:** 2026-10-02
**Resolution record:** [research_loop_09_authenticated_history_divergence.md](research_loop_09_authenticated_history_divergence.md)

---

## §49 Snapshot Anchoring — `AnchorCommit` (new)

The strongest Pass 9 test succeeds under B1–B19 alone: those invariants are **intra-replica** prefix predicates and do not constrain cross-replica acceptance. The gap is filled by a new record type:

\[
\boxed{
AnchorCommit(k,\ anchor_k,\ \lambda)\ \text{appended at } pos>k,\ \text{before } [0,k]\ \text{is truncatable}
}
\]

- **Admission:** chain-continuity with the anchored tip (\(anchor_k=h_k\)) and the current epoch \(\lambda\) — stale-epoch anchor attempts are fenced by the Pass 5 rule.
- **Survival under compaction:** later compactions absorb the anchor into the snapshot header chain \(ParentSnap=H(S_{prev})\); snapshot headers form a derivation chain (Pass 7's DAG) terminating at the genesis anchor. Post-compaction snapshot verification is **relative to the accepted anchor history**, never to deleted records.

\[
\boxed{
\text{Every decision that outlives the context it was made in must itself become a record.}
}
\]

(identity→binding, Pass 6; decision→`StartCommit`, Pass 7; snapshot-trust→`AnchorCommit`, Pass 9.)

---

## §50 Quorum-Certified, Epoch-Scoped Trustee Sets (new)

\[
\boxed{
AnchorCommit\ \text{requires a quorum certificate over}\ (k,anchor_k,\lambda)\ \text{from } T_\lambda:\ |T_\lambda|=3f{+}1,\ q=2f{+}1
}
\]

- \(T_\lambda\) = trustee keys of the current epoch — the same Ed25519 key infrastructure that governs the system's verified update path. The summary trust root is anchored in existing system identity.
- Two conflicting quorum certificates cannot both exist under \(\le f\) Byzantine trustees; if presented, they are **public misbehavior evidence** ⇒ fail-closed halt + re-key epoch.

**Reduction result:**

\[
\boxed{
\text{Snapshot agreement}\ \preceq\ \text{consensus safety over the anchor tuple sequence alone}
}
\]

Cross-replica trust requires agreement on one small monotone tuple type — not consensus over the whole record ledger.

---

## §51 The Meeting Protocol and Fork Alarms (new)

On replica contact, exchange \((k, anchor_k)\) and snapshot-chain head:

| Condition | Action |
|---|---|
| chain-continuous, different positions | ordinary divergence — deterministic recovery instructions (Pass 8) |
| same position, same anchor | positions reconcile |
| same position, different anchor / chain discontinuity | **ForkAlarm** |

\[
\boxed{
ForkAlarm \Rightarrow \text{fail-closed quarantine: no summary-based recovery, no anchor acceptance, pending authority resolution}
}
\]

- Stale (old but valid) snapshots are **safe**: chain-compatible, converge forward to \(\mathcal M^{canonical}\) (B17). The correct distinction is *compatible vs incompatible*, not *fresh vs stale*.
- During quorum-unavailable partitions the system **refuses to anchor** rather than anchor divergently: safety preserved, compaction liveness deliberately halted.

---

## §52 Invariants B20–B25 (new — cross-replica scope)

\[
\begin{aligned}
B20:&\ S_k\ \text{acceptable} \iff \exists\ \text{quorum-certified } AnchorCommit(k,anchor_k,\lambda)\ \text{in } T_\lambda\\
B21:&\ \text{accepted snapshots are chain-continuous; violation} \Rightarrow ForkAlarm\\
B22:&\ \text{no two incompatible anchor tuples both quorum-finalized per epoch } (\le f\ \text{Byzantine})\\
B23:&\ \text{at most one published snapshot per position (corollary of B20+B22)}\\
B24:&\ \text{RecoveryInstruction targets verify to the replica's trust root before use}\\
B25:&\ ForkAlarm \Rightarrow \text{fail-closed quarantine of summary trust}
\end{aligned}
\]

With B20–B25, the Pass 9 test inverts: two replicas cannot both accept incompatible, individually certified snapshots; incompatible *presentation* becomes a public alarm instead of a silent split.

---

## §38 Current Research Frontier (replaced — Pass 10)

All layers now compose their trust to a single root — the sovereign operator's identity plane. The last unowned operation is the definition and mutation of the trustee set itself:

\[
\boxed{
TrusteeSet_\lambda \rightarrow TrusteeSet_{\lambda+1}
\quad\text{under}\quad
Rotation \parallel Revocation \parallel CompromiseRecovery
}
\]

> **Pass 10 question:** *Can the trustee set rotate and revoke under the same epoch discipline — such that a compromised-era key set cannot certify anchors in a later era, a rotation cannot fork the anchor chain, and recovery from total compromise of one era uses only the system's own mechanisms?*

Resolution of Pass 10 closes the loop: every layer — identity, fencing, derivation, materialization, summarization, anchor trust — rests on exactly one root, with every operation epoch-fenced, ledger-recorded, and derivation-chained.

---

## §39 Highest-Level Model (constraint block additions)

\[
\boxed{
\begin{aligned}
AnchorCommit(k,anchor_k,\lambda)\ &\Rightarrow\ \text{quorum cert in } T_\lambda,\ \text{chain-continuous}\\
S_k\ \text{acceptable}\ &\Leftrightarrow\ B20\\
ForkAlarm\ &\Rightarrow\ \text{fail-closed quarantine}\\
\text{Snapshot agreement}\ &\preceq\ \text{anchor-tuple consensus only}
\end{aligned}
}
\]

---

## §40 Open Problems (revised)

1–5. Atomicity, derivation, GC/compaction clusters — resolved at model level (Passes 6–8).
6–8. Prime reservation recovery; multi-node scheduling correctness — unchanged, open. **Consensus/fencing implementation is now narrowed**: only the anchor-tuple sequence requires consensus (Pass 9 reduction).
9. Artifact-store consistency — resolved at model level (Pass 7).
10. Formal verification of Q4; **TLA+ of B1–B25** (Pass 9 target 7 is the minimal first increment) — open.
11–14. Empirical programs — unchanged, open.
15. End-to-end invariant testing — extended: fork injection, stale replay, partition–merge, misbehavior-evidence, anchor-absorption tests (Pass 9 §6).
16. Multi-witness trust in summaries — **resolved at model level (Pass 9)**; machine verification pending.

**New open problem (17): trust-root governance** — trustee-set rotation, revocation, re-key epochs, recovery from era compromise. This is the Pass 10 target and the final link: its resolution closes the model's trust regress at the sovereign operator root.
