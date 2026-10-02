# Research Loop — Pass 7: Ledger → Materialization → Observation under Adversarial Schedules

**Attack surface:** \(\mathcal I \xrightarrow{certificate} \mathcal B \xrightarrow{ordered\ log} \mathcal M \xrightarrow{consistency\ contract} \mathcal O\), under \(Failure \parallel Recovery \parallel Concurrency\)
**Carry-in (Pass 6, locked):** certificate-gated ordered derivation; \(Runnable \equiv \exists B : Live(B)\); read-time revalidation, fail-closed.

---

## 0. Verdict on the critique

| # | Finding | Verdict | Disposition |
|---|---|---|---|
| 1 | R5 has no defined order over \((\lambda,\nu)\) | **Accepted — real mathematical gap** | lexicographic \(\omega=(\lambda,\nu)\); single-sequence variant rejected on separation-of-authority grounds (§1) |
| 2 | \(H_B\) does not force idempotence | **Accepted — real** | ledger admission semantics R0: content-keyed case split, adopted as specified (§2) |
| 3 | \(Live_B \neq Live_R\); read-time invalidation is not enforcement | **Accepted — strengthened** | enforcement-boundary rule + *admission-time gating*: stale actors cannot cause unauthorized effects at all (§3) |
| 4–6 | commit order ≠ observation order; prefix materialization; no-hole | **Accepted — made constructive** | no-hole holds *by construction* (checkpoint-first + idempotent apply), not by prohibition (§5) |
| 7 | observation needs an explicit consistency contract | **Accepted — refined** | contracts typed per channel; safety-relevant decisions anchored as ledger records (§4, §6) |
| 8 | certificate chain with explicit derivation edge | **Accepted** | \(Parent = H(C_I)\); generalizes to a full derivation DAG; matches the provenance invariant of `mathematical-model.md` §10 (§7) |
| 11 | Pass 6 "ordered" was undefined | **Conceded** | Pass 6 remains locked only under the amendment in §11 |

---

## 1. Finding #1 — the authoritative order is lexicographic

The critique is correct: component-wise \((\lambda,\nu)\) is a *partial* order; \((5,7)\) and \((6,6)\) are incomparable, and "each dimension is totally ordered" does not compose to totality of the pair.

**Amendment (R5, revised):** define the authoritative binding order as lexicographic:

\[
\boxed{
(\lambda_1,\nu_1) <_{\omega} (\lambda_2,\nu_2)
\iff
\lambda_1<\lambda_2 \ \lor\ (\lambda_1=\lambda_2 \land \nu_1<\nu_2)
}
\]

with the scoping convention \(\nu \in \mathbb{N}\) **scoped per** \((CID_E, \lambda)\): the first binding of an object in epoch \(\lambda\) has \(\nu=1\). Since \(\lambda\) is totally ordered (consensus epochs) and \(\nu\) is totally ordered within each \((CID_E,\lambda)\), lexicographic composition is a **total order** over all candidate bindings — including the critique's counterexample pair: \((5,7) <_{\omega} (6,6)\).

**Why lexicographic, not a single sequence \(\omega\).** The critique offers a single monotonic \(\omega\) as "probably more cleanly." Rejected, with reason: \(\lambda\) and \(\nu\) are governed by *different authorities* — \(\lambda\) by consensus (safety, fencing, §19 of the model), \(\nu\) by the object's rebinding history (bookkeeping). A single sequence merges two authorities' concerns into one counter and violates the model's own Canonical Separation Principle. \(\omega\) is therefore **not a stored field**: it is the defined ordering relation over the two existing fields. (Operationally, a single counter may be *derived* from \((\lambda,\nu)\); it may not *replace* them as authoritative.)

**Fencing falls out of the order.** Binding admission requires strict \(\omega\)-dominance over the object's current chain maximum:

\[
\boxed{
BindCommit(E,H,\rho,\lambda,\nu)\ \text{admitted}\ \Rightarrow\ (\lambda,\nu) >_\omega \max\{(\lambda',\nu') : \text{committed for } (E,\rho)\}
}
\]

So a stale-epoch writer — \((5,8)\) after \((6,1)\) is live — is rejected *because of the order itself*, which is precisely Pass 5 fencing restated for bindings. Rebinding after failure in the same epoch increments \(\nu\); a new epoch legitimately restarts at \(\nu=1\) and dominates lexically. Both of the critique's candidate scenarios are handled by one rule.

---

## 2. Finding #2 — ledger append semantics (R0)

Content-addressing a record does not make the storage layer deduplicate it. Idempotence is a property of **append semantics**, not of hashes. Adopted as a ledger rule, in the critique's own form:

\[
\boxed{
Append(B, H_B) \equiv
\begin{cases}
Create(H_B), & H_B \notin Ledger\\
NoOp, & H_B \in Ledger \land ContentMatch\\
CONFLICT, & H_B \in Ledger \land ContentMismatch
\end{cases}
}
\]

with the durable uniqueness constraint:

\[
\boxed{
H_B \in Committed \Rightarrow Cardinality(Records(H_B)) = 1
}
\]

This is the durable-key/dedup discipline (as in Raft's session-based deduplication of client commands — the log alone does not make retries idempotent). \(Commit(B)^n = Commit(B)\) now holds at the storage layer for all \(n \ge 1\), and the same rule applies to every record type, including observations and start commits (§4). **CONFLICT** (same key, different content) is a hash-collision or corruption signal and is fail-closed: no append, alarm.

---

## 3. Finding #3 — two-level liveness and the enforcement boundary

Accepted: read-time invalidation is *classification*, not *enforcement*. A binding going non-live does not stop a running process. Define:

\[
\boxed{
Live_B(B,s) = \text{the Pass 6 read-time predicate at prefix } s
\qquad
Live_R(R,s) = Live_B(B_{start}) \ \land\ Lease(R)\ \text{valid at the enforcement point}
}
\]

**Enforcement-boundary rule (E):**

\[
\boxed{
Live_B(B,s)=false\ \Rightarrow\ NextAuthorizedAction(R,s)=REJECT
}
\]

Every *privileged action* by a running execution — lease renewal, new materialization, write to any shared authority, observation append — re-checks liveness at the action boundary. No action is privileged by continuity; privilege is re-earned per action.

**Strengthening beyond the critique: admission-time gating.** The critique's timeline (grant at \(t_1\), revoke at \(t_3\), execution continues at \(t_4\)) is closed by a structural fact, not by executor cooperation:

\[
\boxed{
\text{Shared state changes only via appends, and every append is gated at the owning authority against the authority's current prefix.}
}
\]

A stale or partitioned executor has exactly two capabilities: (a) *read* — its result is classified by its declared consistency contract (§6); (b) *attempt an append* — evaluated at the authority's current prefix, where the revocation is already visible, hence REJECTed. The Pass 5 \(\lambda\)-fence at each authority independently rejects stale-epoch writes, so protection of shared state is **double-fenced**: authority-side by epoch, executor-side by lease. What a lagging executor can still do is confined to *purely local, rebuildable* state (§21 of the model) during the interval before it observes rejection — bounded by the liveness hint \(\tau\), and consistent with \(\tau \not\rightarrow Safety\): **clocks time out attempts; epochs and admission gates decide outcomes.** No wall clock ever decides safety.

---

## 4. Authorization itself becomes a ledger record

The remaining soft spot in §3 is "the start decision": which prefix was it made at? Resolved by making authorization replayable:

\[
\boxed{
StartCommit(CID_E,\ CID_H,\ \rho,\ \lambda,\ \nu,\ H_B,\ s)
}
\]

appended at position \(s' > s\), admitted only if \(Live_B(B, s)\) held at the named prefix and the lease epoch is current. Legitimacy of a running execution is then a **prefix query**, not a memory:

\[
\boxed{
Legitimate(R)\ \iff\ \exists StartCommit(R)\ \text{at } s'\ \text{with } Live_B\ \text{at its named prefix}\ \land\ Lease\ \text{unexpired at the checked action}
}
\]

Everything is now a record in one totally ordered history — identity, certificate, binding, start, observation — and every correctness property is a prefix predicate over it. This is the uniform move that dissolves the "which version did the decider see" ambiguity: the decision itself has a position.

---

## 5. Findings #4–6 — materialization is a prefix state machine, no-hole by construction

Adopted: \(\mathcal M_t = Apply(\mathcal L[0:m_t])\), never an arbitrary subset. The critique's crash schedule (apply \(B_3\), crash, "accidentally apply \(B_4\)") is made **unrepresentable** rather than prohibited:

\[
\boxed{
Apply(k)\ \text{requires}\ Checkpoint(k-1)\ \land\ \text{atomically publishes}\ \big(k,\ \mathrm{root}(\mathcal M_k)\big)
}
\]

- **Checkpoint-first ordering.** The durable checkpoint is advanced before (or atomically with) publishing; a crash between the two causes the record to be *re-applied* on restart, which is a \(NoOp\) by R0 content-keying. At-least-once delivery + exactly-once effect, composed from R0.
- **A restart cannot name position \(k\) without a checkpoint at \(k-1\)** — "accidentally applying \(B_4\)" has no mechanism.
- **No-hole invariant, by construction:** \(Applied(j) \Rightarrow Applied([1..j-1])\), hence \(Visible(B_j) \Rightarrow \forall i<j\ Applied(B_i)\).
- **Readers never see torn state:** external readers consume only published manifests \((k, \mathrm{root}(\mathcal M_k))\), never in-progress materializer state.
- **Rebuild convergence is checkable, not assumed (B9).** \(Apply\) is required to be a deterministic function of the prefix — no wall-clock, no unseeded randomness (the same reproducibility discipline as Pass 5 hashing). Then \(Replay(\mathcal L) = \mathcal M^{canonical}\) for any crash/restart schedule, and drift is *detectable* by re-deriving and comparing \(\mathrm{root}(\mathcal M_k)\).

Recovery is exactly the log-consumer pattern: \(m_{crash} \rightarrow Replay(m_{crash}+1, \dots, n)\) — the position is the recovery state.

---

## 6. Finding #7 — the observation contract

Accepted: read consistency must be declared, never implicit. Every observation channel and every observation record carries:

\[
\boxed{
Consistency(O) \in \{\ STALE,\ BOUNDED,\ CAUSAL,\ LINEARIZABLE\ \}
}
\]

with the refinement that safety-relevant decisions are not "linearizable reads" in the general sense but **anchored decisions**: an enforcement or authorization decision is made at a named prefix and anchored by its own ledger record (§4), and every shared-state effect is gated at admission (§3). Call this \(LINEARIZABLE\text{-}AT\text{-}AUTHORITY\): linearizability is needed only at the authority's admission gate — a point check — while every other consumer declares a weaker contract honestly (e.g., dashboards: \(BOUNDED\)).

**Observation admission is fenced.** The observation ledger applies the same R0/R1 gating plus lease validity at append time:

\[
\boxed{
Recorded(O)\ \Rightarrow\ Completed(M_t)\ \lor\ Fenced(M_t)
}
\]

An execution whose lease has been invalidated may append only records typed \(FENCED\) — or be rejected. **The observation history never records an unauthorized execution as authorized.** Attribution is carried per record: \((CID_E, CID_H, \rho, \lambda, \nu, H_B,\ StartCommit\ pos,\ Consistency,\ Fenced?)\).

---

## 7. Finding #8 — certificate chain and the derivation DAG

Adopted in the critique's form:

\[
C_I=(CID_E, P, Q, H_I, \lambda_I, seq),\qquad
C_B=(CID_E, CID_H, \rho, \lambda, \nu, H_B, \lambda_B, Parent)
\]

\[
\boxed{
Parent = H(C_I);\qquad C_B\ \text{admissible}\ \Rightarrow\ Verify(C_I)\ \text{at a position} < pos(C_B)
}
\]

Generalized: **every** record type carries a parent edge — identity → certificate → binding → start → observation. The history is a derivation DAG anchored in a total order, and admissibility is chain verification back to the anchor, fail-closed. This is exactly the provenance-preservation invariant already in the repository's `mathematical-model.md` §10:

\[
Prov(I_{out}) \supseteq Prov(I_{in})
\]

The binding is no longer "derived from an authority that knows the identity exists"; it is derived from a *verifiable committed derivation edge*.

---

## 8. The Pass 7 question — answered

> *Can every crash/concurrency schedule produce only a prefix of the authoritative history, and can every observation be classified by an explicit consistency contract?*

\[
\boxed{
\text{Yes at model level, for the mechanism set } \{R0..R5,\ E,\ StartCommit,\ Checkpoint\text{-}first\ Apply,\ typed\ O\}.
}
\]

**Claim (prefix safety under schedules).** Let \(\sigma\) be any schedule — arbitrary interleaving of appends, message deliveries, crashes, and restarts. Every reachable global state of \(\sigma\) is a tuple of positions \(\theta = (n;\ m,\ s',\ o,\ s_1,\dots,s_k)\) into the single authoritative history \(\mathcal L\) (ledger length \(n\); materializer, start, observation, and reader positions), and every externally observable fact at those positions is a prefix-relative predicate over \(\mathcal L\).

*Proof sketch (induction over \(\sigma\)'s events).* Appends only extend \(n\) and are gated at the appending authority's current prefix ⇒ appended records are valid. Position advances are guarded (materializer: \(Apply(k)\) requires \(Checkpoint(k-1)\); start: requires an admitted \(StartCommit\); readers: positions are what they read). A crash resets a component to its last durable position ⇒ the state is still a \(\theta\)-tuple. Delivery reorderings change only *when* positions advance, never *what a prefix means*. An actor with a stale position can only read (classified by its declared contract, B10) or attempt an append (gated at the authority, §3). Hence no schedule exposes a non-prefix view, and every observation record is typed by contract and lease state at write. \(\blacksquare\)

**Honest boundaries (not closed by this pass):**
1. Purely-local effects of a partitioned executor between revocation-commit and local observation of rejection — bounded by \(\tau\) (liveness), confined to rebuildable local state (§21).
2. **Bounded history.** All of the above assumes an append-only, unbounded ledger. Physical compaction (snapshot + truncate + re-anchor) is not yet modeled — and compaction is where prefix properties go to die. This is the next pass.
3. Implementation verification per §36 of the model: the schedule-induction claim must be encoded (TLA+/property-based fuzzing over crash positions and delivery orders) — the reasoning sketch is not a machine-checked proof.

---

## 9. Refined invariant set (B1–B10, promoted to the formal spec)

\[
\begin{aligned}
B1:&\quad Live_B(B,s) \Rightarrow Valid(B) \quad \text{at every prefix } s\\
B2:&\quad Runnable(E) \equiv \exists B : Live_B(B)\ \text{(read-time, fail-closed)}\\
B3:&\quad \forall (E,\rho):\ \exists!\ CurrentBinding(E,\rho)\ \text{at every prefix (or none)}\\
B4:&\quad \text{Admission is } \omega\text{-monotonic: } (\lambda,\nu) >_\omega \text{ chain max, lexicographic}\\
B5:&\quad \text{No resurrection: } \omega_{new} >_\omega \omega_{retired}\ \text{(corollary of B4, tested separately)}\\
B6:&\quad Append(B)^n = Append(B)\ \text{via R0 content-keyed semantics}\\
B7:&\quad \mathcal M = Apply(\mathcal L[0:m]),\ m\ \text{durable}\\
B8:&\quad Applied(j) \Rightarrow Applied([1..j-1])\ \text{(by construction)}\\
B9:&\quad Apply\ \text{deterministic} \Rightarrow Replay(\mathcal L)=\mathcal M^{canonical},\ \text{checkable via manifest roots}\\
B10:&\quad Consistency(O)\ \text{declared per channel/record; enforcement is } LINEARIZABLE\text{-}AT\text{-}AUTHORITY
\end{aligned}
\]

---

## 10. Verification targets (per §36 — reproducible tests)

1. **Schedule fuzzing:** model the ledger + materializer + executor + observer; fuzz crash positions across every rule boundary and arbitrary delivery orders; assert B1–B10 at *every reachable state*.
2. **Ordering attacks:** concurrent candidate commits with incomparable-looking pairs \((\lambda{+}1, \nu{-}1)\)-style; assert total order and single live binding (B3, B4, B5).
3. **Retry storms:** duplicate and conflicting appends of every record type; assert B6 semantics (Create/NoOp/CONFLICT) and uniqueness of committed records.
4. **Revocation races:** revoke concurrently with start; assert no privileged action post-commit-of-revocation except rejected attempts (§3), and observations typed FENCED (§6).
5. **Materializer chaos:** crash between apply and checkpoint; restart; assert no-hole (B8), manifest-only visibility, and root equality (B9).
6. **TLA+ encoding** of B1–B10 as the machine-checked counterpart of the sketch in §8.

These are variant-independent (the §34 experimental matrix is untouched).

---

## 11. Pass 6 correction — formally conceded and amended

The Pass 6 statement "certificate-gated **ordered** derivation" used "ordered" without defining an order; the critique's finding #1 shows this was load-bearing. The Pass 6 result remains locked **under this amendment**:

\[
\boxed{
\text{Certificate-gated derivation}
+
\text{authoritative total order } (\omega, \text{lexicographic})
+
\text{prefix-safe materialization}
+
\text{explicit observation consistency}
}
\]

The certificate alone does not solve concurrency; the order alone does not solve materialization; materialization alone does not solve stale observation. Four layers, one history.

---

## 12. External alignment (direction support, not proof)

The mechanism set is the established distributed-systems pattern family — committed log ordering and leader-completeness for history preservation (Raft), durable command identity for exactly-once-like effects of retried operations (Raft sessions/dedup), position-tracked replay for derived-state recovery and total-order prefix relationships (Kleppmann, *logs for data infrastructure*), explicit consistency semantics instead of implicit assumptions (Kleppmann, *CP/AP*), and machine-checked reasoning over crash/recovery/interleaving (Kleppmann, Isabelle verification). These support the research **direction**; they do not prove this protocol — which is what the §10 targets are for.

---

## 13. The loop advances to Pass 8

The frontier moves from identity/binding atomicity to **bounded history**. Every guarantee so far assumes an append-only, unbounded ledger:

\[
\boxed{
\mathcal L = (B_1, \dots, B_n),\quad n \rightarrow \infty
}
\]

Real systems must compact: \(Snapshot(k)\), \(Truncate(\le k)\), \(Re\text{-}anchor\). Compaction is the first operation that *rewrites the history* prefix safety depends on, and it races with everything:

```text
Compaction:  Snapshot(k) ── Truncate(≤k) ── Re-anchor
                    │              │             │
   consumer at j<k still needs its derivation chain
   replay of a crashed materializer still needs records ≤ m
   an epoch advance lands mid-compaction
   a certificate expires inside the retention window
```

\[
\boxed{
Compaction \leftrightarrow Derivation
}
\]

> **Pass 8 question:** *Can the system compact the authoritative history — snapshot, truncate, re-anchor — such that prefix safety, the derivation chain, and B1–B10 continue to hold for every consumer at every position, under concurrent compaction, replay, epoch advance, and certificate retention pressure?*

If yes, the ledger becomes a bounded, self-maintaining structure with all guarantees intact. If no, the counterexample determines whether the fix is retention policy, anchor design, or an admission rule — not a new abstraction.
