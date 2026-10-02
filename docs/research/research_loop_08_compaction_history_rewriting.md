# Research Loop — Pass 8: Compaction / History Rewriting

**Attack surface:** \(Snapshot(k) \rightarrow Verify(S_k) \rightarrow Anchor(S_k) \rightarrow Truncate(k) \rightarrow Replay\) under \(Replay \parallel Compaction \parallel EpochAdvance \parallel Retention \parallel Crash\)
**Carry-in (Pass 7, locked):** certificate-gated derivation + lexicographic total order + prefix-safe materialization + explicit observation consistency.

---

## 0. Verdict on the critique

| # | Finding | Verdict | Disposition |
|---|---|---|---|
| 1 | Snapshot needs a cryptographic boundary | **Accepted — strengthened** | `anchor_k` requires a running hash chain maintained from record zero; **ledgers must be born compactable** (§2) |
| 2 | `Compact` must be semantics-preserving | **Accepted** | \(L \equiv_{\mathcal O} Compact(L,k)\), parameterized by the supported-operation contract (§9) |
| 3 | Consumer lag breaks naive truncation | **Accepted — dissolved** | `∀c Recoverable(c,k)` is discharged *by construction*, not tracked (§5) |
| 4 | Safe-truncation condition | **Accepted** (reduced conjunct, same strength) | §5, §8 |
| 5 | Anchor must be \((k, root(M_k))\), not just \(k\) | **Accepted** | corruption detection by root comparison (§5) |
| 6 | Snapshot/append race | **Accepted — closed by construction** | snapshots are minted **only at Pass 7 checkpoints**: \(Snapshot(k) \Rightarrow Checkpoint(k)\) (§3) |
| 7 | Manifest lifecycle | **Accepted** | BUILDING→VERIFIED→PUBLISHED→ELIGIBLE mirrors Pass 5's lifecycle, one layer up (§3) |
| 8 | Epoch floor \(\lambda_{floor}\) | **Accepted** | floors live in the snapshot header and the monotone state region (§6) |
| 9 | Generation floor \(\omega_{floor}\) | **Accepted — extended** | floors are **per-object**, inside the materialized state's monotone region; global floor in header (§6) |
| 10 | Provenance frontier \(F_k\) | **Accepted — extended** | plus a GC rule for frontier entries (§7) |
| 11 | Construct→Verify→Anchor→Truncate ordering | **Accepted — strengthened** | truncation is **atomic activation + reclamation**, never in-place deletion; crash-safe at every point (§4, B19) |
| 12–13 | Replay from snapshot; deterministic recovery instruction | **Accepted** | `RecoveryInstruction(S_k)` replaces the ERROR path (§5) |
| 14 | Retention protocol vs policy | **Accepted** | policy may only *delay* deletion, never enable it (§8) |
| 15 | B11–B18 | **Accepted** | + **B19** (atomic activation of physical representations) (§10) |
| 16 | Differential history-rewriting property test | **Accepted** | flagship verification target (§12) |
| 17 | Logical history \(\mathcal L^*\) vs physical \(\mathcal R_k\) | **Accepted** | \(\mathcal L^*\) defined as the equivalence class under \(\equiv_{\mathcal O}\) (§9) |

---

## 1. The conservation principle — the theorem-shaped core

The critique's closing insight is promoted to the central definition of the pass:

\[
\boxed{
\text{Once the ledger may forget physical history, the information that makes the forgotten history safely forgettable becomes part of the retained state.}
}
\]

Formally: every rule introduced in Passes 5–7 (fencing, R0–R5, the enforcement rule E, \(Live_B\), admission gates) is a **prefix predicate** — it reads the history at some prefix. Compaction is sound exactly when every such rule is ***summarizable***: there exists a monotone summary \(\sigma(k)\) of the prefix \([0,k]\) such that evaluating the rule against \((\sigma(k),\ suffix_{k+1:n})\) yields the same result as evaluating it against the full prefix.

\[
\boxed{
\forall r \in Rules:\quad
r\big(\mathcal L[0:n]\big)\ =\ r\big(\sigma(k),\ \mathcal L[k{+}1{:}n]\big)
\quad\Rightarrow\quad
\mathcal L \equiv_{\mathcal O} Compact(\mathcal L,k)
}
\]

The retained summaries are:

\[
\boxed{
\sigma(k)\ =\ \big(\ S_k:\ [k,\ \mathrm{root}(\mathcal M_k),\ anchor_k,\ \lambda_{floor},\ F_k,\ schema,\ status]\ ,\ \ \mu_k:\ \text{per-object } \omega\text{-max table}\ \big)
}
\]

Rule-by-rule, the required statistic:

| Rule (source) | Reads from history | Sufficient statistic retained |
|---|---|---|
| Fencing \(\lambda\) (Pass 5, §19) | current epoch max | \(\lambda_{floor}\) in header; state epoch |
| \(\omega\)-monotonicity R5 (Pass 7) | per-object chain max \((\lambda,\nu)\) | \(\mu_k\) per-object floor table (§6) |
| R1 derivation chain (Pass 7) | parent records | \(F_k\) provenance frontier (§7) |
| R0 dedup (Pass 7) | committed-record membership | position tags: \(pos \le k\) ⇒ compacted ⇒ NoOp (§7) |
| R2 no-fork (Pass 6) | current live binding per \((E,\rho)\) | live state in \(\mathcal M_k\) |
| \(Live_B\) (Pass 6) | liveness window after \(pos(B)\) | suffix \(>k\) + liveness state in \(\mathcal M_k\) |
| Replay (Pass 7 recovery) | full prefix | \(S_k\) itself — snapshot as replay source (§5) |

**Corollary (the meta-rule).** Summarizability is a *closed-world obligation on rules*: any future rule must either declare its sufficient statistic (be compaction-compatible) or force retention of the records it reads.

\[
\boxed{
\text{No rule without a summary.}
}
\]

This is the same discipline as §36 of the model ("no architectural claim without a reproducible test"), applied to history readers.

---

## 2. Ledgers are born compactable

\(anchor_k = H(B_1 \parallel \cdots \parallel B_k)\) cannot be computed *after* \(B_1..B_k\) are deleted. Therefore the evidence that makes truncation possible must be accumulated continuously:

\[
\boxed{
h_0 = \mathbf{0};\qquad h_k = H(h_{k-1} \parallel H(B_k))\ \text{computed at append time};\qquad anchor_k = h_k
}
\]

Every record carries its position \(pos\) and the running chain value; the hash chain **is** the authenticated log. Compaction-readiness is not a retrofit — it is a property of the uncompacted ledger's representation. (A ledger that did not maintain a chain from genesis can only compact from the first chained position onward.)

---

## 3. Snapshots: minted at checkpoints, anchored, lifecycled

**Races closed by construction.** The critique's §6 race (snapshot claims position 101 while the materializer has not applied \(B_{101}\)) is made unrepresentable:

\[
\boxed{
Snapshot(k)\ \text{may be minted only at a published Pass 7 checkpoint}\ (k,\ \mathrm{root}(\mathcal M_k))
}
\]

A snapshot is a checkpoint **extended** with the history anchor and lifecycle — it never reads live materializer state:

\[
S_k\ =\ \big(\underbrace{k,\ \mathrm{root}(\mathcal M_k)}_{\text{Pass 7 manifest}} ,\ \underbrace{anchor_k}_{\S 2},\ \underbrace{\lambda_{floor},\ F_k}_{\S 6,\ \S 7},\ schema,\ status\big)
\]

**Lifecycle** (the critique's §7, adopted):

\[
BUILDING \rightarrow VERIFIED \rightarrow PUBLISHED \rightarrow ELIGIBLE\_FOR\_TRUNCATION
\]

with \(Verify(S_k)\): (a) \(\mathrm{root}(\mathcal M_k)\) re-derived deterministically from the prefix (B9 discipline); (b) \(anchor_k\) matched against the running chain; (c) floors and frontier well-formed. Note the rhyme: this is Pass 5's \(FREE \rightarrow RESERVED \rightarrow COMMITTED \rightarrow RETIRED\) lifecycle applied one layer up — the ledger managing its own history with the ledger's own discipline.

---

## 4. Truncation is atomic activation, not deletion

The critique's ordering (Construct → Verify → DurablyAnchor → Truncate) is adopted and made crash-proof by transposing the repository's own update-engine discipline (*fail-closed atomic activation with rollback*, System_Design §1.1):

\[
\boxed{
Compact(\mathcal L, k):\quad
\text{build } \mathcal R_k = (S_k\ \text{header},\ \mathcal L_{>k})
\rightarrow Verify \rightarrow \textbf{activate (pointer swap)}
\rightarrow \textbf{reclaim}
}
\]

- **Physical representations are immutable; a durable pointer names the current one.** Readers follow the pointer; writers never mutate a live representation.
- **Truncate decomposes into activate + reclaim.** The destructive step is last and is idempotent garbage collection of the superseded representation — never in-place deletion.
- **Every crash point is safe:** before activation ⇒ old representation intact; after activation ⇒ \(\mathcal R_k\) intact; during reclamation ⇒ both partially present, pointer decides. This is **B19** below.
- **Re-anchoring is concrete:** the first record of \(\mathcal R_k\) *is* the anchor record — the retained suffix's parent edges and positions are interpreted relative to \(S_k\). A second compaction replaces the header and shortens the suffix; \(\mathcal R_{k'}\) supersedes \(\mathcal R_k\) exactly as bindings supersede bindings.

---

## 5. Recoverability is structural, not bookkeeping

The critique's SafeTruncate condition includes \(\forall c:\ Recoverable(c,k)\). As stated this is a distributed-termination problem — the compactor can never *know* about a crashed or partitioned consumer. The resolution dissolves the quantifier:

\[
\boxed{
Recoverable(c,k)\ \equiv\ SnapshotPublished(k)\quad \text{for every consumer } c
}
\]

because the snapshot is a **universal replay source** (first-class):

\[
Replay(c)=
\begin{cases}
\mathcal L[a_c+1:n], & a_c \ge k\\
S_k \rightarrow \mathcal L_{>k}, & a_c < k
\end{cases}
\qquad\qquad
\boxed{
\text{missing record} \Rightarrow RecoveryInstruction(S_{k'})\ \text{— never ERROR}
}
\]

- No consumer registry, no leases on consumers, no liveness guessing: any consumer at *any* position, live or crashed, recovers from the latest published snapshot by the deterministic path (B17).
- **Corruption detection** (the critique's §5): consumers anchor as \(A_c = (a_c, \mathrm{root}(\mathcal M_{a_c}))\); mismatch against the authoritative root ⇒ the consumer's state is suspect ⇒ mandatory snapshot re-recovery. Position alone is never trusted.
- Therefore:

\[
\boxed{
SafeTruncate(k)\ \iff\ SnapshotPublished(k)\ \land\ FloorsPreserved(k)\ \land\ ProvenanceAnchored(k)
}
\]

with one honest caveat: a consumer type that *cannot* boot from a snapshot (none currently exists in the model) would have to register an exclusion — which is the meta-rule of §1 applied to consumers.

---

## 6. Fences survive compaction: \(\lambda_{floor}\) and the monotone region

Adopted with an extension. Two floors, at two layers:

\[
\boxed{
\lambda < \lambda_{floor} \Rightarrow REJECT
\qquad\qquad
\omega_{cand} \le_\omega \mu_k[E] \Rightarrow REJECT
}
\]

- **\(\lambda_{floor}\)** (global) lives in the snapshot header; it is the maximum committed epoch at \(k\). Deleted epoch records leave their *consequence* behind.
- **\(\omega_{cand} \le_\omega \mu_k[E]\)** (per-object) is the critique's §9 generalized correctly: a global \(\omega\)-floor is too coarse — a stale actor resubmits \((10,7)\) for object \(E_1\) while \(E_2\)'s history is irrelevant. The floor must be **per-object**. \(\mu_k\) — the per-object \((\lambda,\nu)_{max}\) table — is a **distinguished monotone region of the materialized state** \(\mathcal M_k\): \(Apply\) maintains it as it applies records; retired and dead objects keep their row forever.

\[
\boxed{
\text{The monotone region is never garbage-collected. It is } O(\text{objects}) \text{ scalars — the permanent shadow of deleted history.}
}
\]

R5 and the fencing rule now read only \((\lambda_{floor}, \mu_k)\) and the suffix — never deleted records.

---

## 7. Provenance frontier and the R0 position patch

**Frontier.** At compaction, compute the set of parent hashes referenced by the retained suffix whose parent records fall inside \([0,k]\):

\[
\boxed{
F_k = \{\, H(C) : C \in [0,k],\ \exists\ \text{retained record with } Parent = H(C) \,\}
}
\]

committed in the header. Post-compaction verification: \(Parent \in F_k \Rightarrow\) verified-by-anchor (the boundary test may consult a Merkle membership proof against \(anchor_k\)); otherwise traverse retained records. Hence \(Provenance_{post}(x) = F_k \cup Provenance_{suffix}(x)\).

**Frontier GC.** An \(F\)-entry becomes droppable when no retained record references it (its referencing records were themselves compacted, their own readers now terminating at a later frontier). \(F_k\) is therefore self-pruning across successive compactions.

**R0 patch (position-based dedup).** A re-append of a *compacted* record would otherwise look like a fresh Create (its hash is no longer in the physical ledger). Resolved without a hash index:

\[
\boxed{
pos(X) \le k \Rightarrow \text{compacted region} \Rightarrow Append = NoOp;\qquad pos(X) > k \Rightarrow \text{R0 hash semantics as before}
}
\]

Positions are total-ordered and travel with every record, so membership in the compacted region is a comparison, not a lookup.

---

## 8. Retention: safety is a conjunction, policy is a delay

\[
\boxed{
Deleteable(k)\ =\ SnapshotPublished(k)\ \land\ FloorsPreserved(k)\ \land\ ProvenanceAnchored(k)\ \land\ PolicyAllows(k)
}
\]

SafetyRetention and RetentionPolicy compose **conjunctively**: an administrator's "delete older than 30 days" can only *delay* deletion below what safety permits — never enable deletion above it. There is no policy override on \(Recoverability\) or \(FencingSafety\) because neither depends on policy: recoverability is structural (§5), floors are state (§6).

---

## 9. Logical history vs physical representation

The critique's §17 refinement is adopted and made precise:

\[
\boxed{
\mathcal L^{*} \ :=\ \text{the equivalence class of physical representations under } \equiv_{\mathcal O}
}
\]

Pass 7's "everything is one totally ordered history" survives, re-stated: there is **one logical history** \(\mathcal L^*\); physical representations \(\mathcal R_0 = \mathcal L\), \(\mathcal R_k = (S_k, \mathcal L_{>k})\), \(\mathcal R_{k'}\), … are **interchangeable witnesses** of it. No contradiction arises from destroying a physical witness, because no rule was ever defined over physical bytes — every rule is defined over the logical history, evaluated through its summaries and suffix.

---

## 10. Invariants B11–B19 (promoted to the formal spec)

\[
\begin{aligned}
B11:&\quad Verified(S_k) \Rightarrow S_k \text{ represents } Apply(\mathcal L[0:k]) \text{ (root + anchor + floors checked)}\\
B12:&\quad Truncate(k) \Rightarrow SnapshotPublished(k) \land FloorsPreserved(k) \land ProvenanceAnchored(k)\\
B13:&\quad \mathcal L \equiv_{\mathcal O} Compact(\mathcal L,k)\ \text{for all operations in the supported contract}\\
B14:&\quad \lambda < \lambda_{floor} \Rightarrow REJECT\\
B15:&\quad \omega_{cand} \le_\omega \mu_k[E] \Rightarrow REJECT\ \text{(per-object floor)}\\
B16:&\quad Parent\text{-chain verification may terminate at } F_k\ \text{(authenticated frontier)}\\
B17:&\quad Replay(S_k, \mathcal L_{>k}) = \mathcal M^{canonical}\ \text{(corollary of B9 + B11)}\\
B18:&\quad Compact(Compact(\mathcal L,k),k) \equiv Compact(\mathcal L,k)\ \text{(header content-keying, R0)}\\
B19:&\quad \textbf{Atomic activation: every crash point during compaction leaves a complete representation — } \mathcal L \text{ or } \mathcal R_k\text{, never a hybrid}
\end{aligned}
\]

---

## 11. The Pass 8 question — answered

> *Can physical history be deleted while preserving logical history — without losing consumer recoverability, fencing safety, generation monotonicity, or provenance?*

\[
\boxed{
\text{Yes at model level, given: born-compactable chain (§2), checkpoint-minted snapshots (§3),}
}
\]

\[
\boxed{
\text{atomic-activation truncation (§4), structural recoverability (§5), monotone floors (§6), frontier (§7).}
}
\]

**Claim (compaction soundness).** For every schedule \(\sigma\) interleaving appends, snapshots, replays, epoch advances, consumer lag, crashes, recoveries, truncations, retries, and retention events: every reachable state exposes only observations \(O\) with \(O(\mathcal R_{current}) = O(\mathcal L)\) — i.e., \(State_{compacted} \equiv State_{uncompacted}\) under the declared contract.

*Proof sketch.* By §1's table, each rule's result is invariant under prefix replacement by its summary; by §4 activation, the physical pointer always names a complete representation; by §5, every consumer recovers along a deterministic path converging to \(\mathcal M^{canonical}\); by §6–7, all admission rules retain their verdicts across the boundary. Induction over \(\sigma\)'s events, exactly as in Pass 7. \(\blacksquare\)

---

## 12. Verification targets (per §36)

1. **Differential history-rewriting (flagship).** Two model instances over the same random event sequence: one compacts at random boundaries, one never compacts. After every event, assert observational equivalence under the declared contract. Any divergence is a counterexample to §11's claim.
2. **Snapshot/append race schedules:** interleave snapshot minting with appends at every checkpoint boundary; assert \(Snapshot(k) \Rightarrow Checkpoint(k)\) and B11.
3. **Crash-during-compaction:** fuzz crash points across build/verify/activate/reclaim; assert B19 (pointer always names a complete representation).
4. **Stale-actor resurrection across the boundary:** after truncation at \(k\), replay \((\lambda,\nu) \le_\omega \mu_k[E]\) candidates and \(\lambda < \lambda_{floor}\) writes; assert B14/B15 rejects.
5. **Provenance traversal:** verify retained chains whose parents are deleted; assert B16 termination at \(F_k\), and frontier GC correctness.
6. **Recovery-instruction universality:** consumers at arbitrary lag positions \(a_c < k\) receiving \(RecoveryInstruction\); assert B17 convergence.
7. **TLA+ extension:** B11–B19 join B1–B10 in the machine-checked specification.

Variant-independent; the §34 experimental matrix is untouched.

---

## 13. Honest boundaries (not closed by this pass)

1. **Snapshot authentication.** A consumer recovering from \(S_k\) trusts a summary it did not verify record-by-record. Within one authority this is acceptable; across nodes it is not: *who signs \(S_k\), and what quorum of anchors makes a snapshot credible?* The root of trust moves from records to summaries — and is currently unauthenticated.
2. **Heterogeneous representations.** Two nodes may legitimately sit at \(\mathcal R_{50}\) and \(\mathcal R_{80}\). Cross-node sync between representations with *different physical prefixes* is unmodeled.
3. **\(F_k\) growth.** Self-pruning (§7) bounds it in practice; a worst-case bound is not proven.
4. **Machine checking.** §11's induction is a sketch; B1–B19 await the TLA+ encoding.

---

## 14. The loop advances to Pass 9

The Pass 8 result relocates the root of trust: after compaction, correctness rests on the **snapshot** — a summary no consumer re-verifies record-by-record. The next attack surfaces:

\[
\boxed{
S_k \leftrightarrow S_k' \leftrightarrow \text{Trust}
}
\]

```text
Node A: R_50 = (S_50, L_51..L_n)          Node B: R_80 = (S_80, L_81..L_m)
        │                                         │
        └──────── sync / recovery / audit ────────┘
                     │
        which snapshot is credible? who signed it?
        what if one is forged, stale, or corrupt?
        can a single corrupted replica recover
        from replicas with DIFFERENT compaction boundaries?
```

> **Pass 9 question:** *Can many physical representations with divergent compaction boundaries jointly verify the one logical history — such that no forged, stale, or corrupt snapshot is accepted, every replica recovers from the others, and the trust root for summaries is itself anchored in the system's existing cryptographic identity (the same Ed25519 root that already governs updates)?*

If yes, the ledger becomes a bounded, self-maintaining, **multi-witness** structure with all guarantees intact. If no, the counterexample determines whether the fix is quorum anchoring, signature chains over headers, or a retention rule — not a new abstraction.
