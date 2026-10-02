# Mathematical Model Amendment — Pass 6 Consolidation

**Applies to:** *Current Mathematical Model — 107 / Cloud107 Unified System*, Revision: Research Loop — Pass 6
**Status:** Locked Pass 6 result integrated; frontier advances to Pass 7
**Date:** 2026-10-02
**Resolution record:** [research_loop_06_identity_binding_atomicity.md](research_loop_06_identity_binding_atomicity.md)

This amendment contains ready-to-paste replacement text for every section of the unified model touched by the Pass 6 resolution, reconciled against the full record shape

\[
B=(CID_E,\ CID_H,\ \rho,\ \lambda,\ \nu,\ H_B)
\]

which is strictly richer than the shape assumed during the pass. Three elements of the full model materially improve the result:

1. **\(\nu\) (binding generation)** requires extending the no-fork rule to generation monotonicity (new R5).
2. **\(H_B\)** makes binding commits content-addressed, so idempotence (R3) extends to bindings for free.
3. **\(\rho\) and \(Authorized\)** fold into the read-time predicate, so policy revocation invalidates bindings with no new mechanism.

One element requires an explicit answer rather than a mechanism: §25's "the system therefore requires a well-defined commit protocol across the identity and binding authorities" is resolved **negatively** — the well-defined protocol is certificate-gated ordered derivation, and the atomic cross-authority protocol is rejected.

Symbol note: in the unified model \(P_t\) is the prime structural identifier; authorization policy is not a component of \(X_t\). The \(Authorized\) predicate belongs to the verifier/policy plane of §5 and is evaluated as policy state, not as part of canonical identity.

---

## §12 Binding Record (revised — ledger interpretation added)

The record is unchanged:

\[
\boxed{
B=(CID_E,\ CID_H,\ \rho,\ \lambda,\ \nu,\ H_B)
}
\]

with the integrity anchor defined like every other canonical object:

\[
\boxed{
H_B=Hash(CID_E\parallel CID_H\parallel \rho\parallel \lambda\parallel \nu\parallel SchemaVersion_B)
}
\]

A binding is a **ledger record**, content-addressed by \(H_B\), not mutable runtime state. Two bindings with identical \((CID_E, CID_H, \rho, \lambda, \nu)\) are the same commit (idempotent re-append); any differing field yields a different \(H_B\) and is a distinct record subject to the admission rules of §13a.

---

## §13 Binding Validity (revised — complete biconditional)

The revision folds the §25 conjuncts into the definition itself, so the atomicity requirement is a property of validity, not an additional hope:

\[
\boxed{
\begin{aligned}
Valid(B_t)\iff\ &CID_E\in\mathcal E\ \land\ CID_H\in\mathcal H\\
&\land\ Committed(CID_E)\ \land\ Committed(CID_H)\\
&\land\ \Epoch(B_t)=CurrentEpoch(CID_H)\\
&\land\ Live_H(CID_H,\lambda)\\
&\land\ Authorized(CID_E,CID_H,\rho)
\end{aligned}
}
\]

Definitions:

- \(Committed(CID)\): a durable canonical record for \(CID\) exists at some ledger position.
- \(Authorized(CID_E, CID_H, \rho)\): policy predicate over the relationship type; evaluated at read time, so revocation invalidates without a notification protocol.
- \(Live_H(CID_H, \lambda)\): the execution object's own lifecycle liveness under the fencing epoch (§19).

The operational, prefix-relative form used by every external channel is \(Live\) (§13b below):

\[
\boxed{
\text{External channels never evaluate } Valid \text{ directly. They evaluate } Live(B,s) \text{ at their own ledger prefix } s.
}
\]

The §25 implication is thereby discharged by definition:

\[
Valid(B_t)\Rightarrow Committed(CID_E)\ \land\ Committed(CID_H)\ \land\ \Epoch(B_t)=CurrentEpoch(CID_H)
\]

---

## §13a Commit Certificate and Ledger Admission Rules (new)

After the Identity Authority durably commits the canonical record at epoch \(\lambda\), it issues:

\[
\boxed{
Cert(CID_E,\ CID_H,\ \lambda,\ seq)
}
\]

A certificate exists **only post-durability** and is itself the durable proof that both identity records survived. In a single-ledger deployment the certificate is implicit: the append rule checks the earlier record directly at its ledger position \(seq\). The explicit certificate is the cross-authority generalization.

**Admission rules.** A ledger append of \(BindCommit(CID_E, CID_H, \rho, \lambda, \nu, H_B)\) is accepted only if:

\[
\boxed{
\begin{aligned}
R1:&\ \textbf{Identity precedes binding. } Cert(CID_E,CID_H,\lambda,seq) \text{ valid, with } seq < pos(B).\\
R2:&\ \textbf{No forks. } \text{At most one live binding per } (CID_E,\rho,\lambda);\ \text{first in ledger order wins;}\\
   &\ \phantom{\textbf{No forks. }} \text{duplicate } H_B \text{ is an idempotent no-op; conflicting } CID_H' \text{ at the same } (CID_E,\rho,\lambda) \text{ is rejected.}\\
R3:&\ \textbf{Idempotence. } Commit(B)\equiv Commit(B) \text{ — by } H_B \text{ content addressing, for bindings as for identities.}\\
R4:&\ \textbf{Epoch-keyed derived state. } \text{Every cache of derived state is keyed } (CID_E,\lambda) \text{ and invalidated on epoch advance.}\\
R5:&\ \textbf{Generation monotonicity. } \nu_{t+1}>\nu_t \text{ for the same } CID_E;\ \lambda_{t+1}>\lambda_t.\\
   &\ \phantom{\textbf{Generation monotonicity. }} \text{A new generation supersedes; it never silently re-occupies an earlier } (\lambda,\nu).
\end{aligned}
}
\]

R5 is the addition demanded by the full record shape: §14 rebinding creates successor generations, and without monotonicity a lagging writer could resurrect an earlier generation. Generation order and epoch order are both total orders, so supersession is deterministic at every prefix.

---

## §13b Live Predicate — Read-Time Revalidation (new)

For a reader whose observed ledger prefix is \(s\):

\[
\boxed{
\begin{aligned}
Live(B,s)\iff\ &pos(B)\le s\\
&\land\ \text{certificate anchor at } seq<pos(B)\le s\\
&\land\ \text{no } Supersede/Retire/epoch\text{-advance record for } CID_E \text{ or } CID_H \text{ in } (pos(B),\,s]\\
&\land\ Authorized(CID_E,CID_H,\rho)\ \text{evaluated at } s\\
&\land\ \lambda_B=\text{current authoritative epoch at } s
\end{aligned}
}
\]

All execution entry points resolve bindings **only** through \(Live\) evaluated at the reader's own prefix; unresolved \(\Rightarrow REJECT\) (fail-closed). Raw ledger records remain visible but are **records, not live bindings**:

\[
\boxed{
\text{Ledger visibility}\neq\text{live binding}
}
\]

This gives "externally observable execution binding" its precise meaning in the Pass 6 question, and makes the epoch conjunct — and policy conjunct — read-time facts rather than stale write-time assertions.

---

## §14 Hypervisor Failure and Rebinding (revised — same protocol, no special case)

\[
B_t=(E_1,H_1,\rho,\lambda_1,\nu_1),\qquad H_1\rightarrow FAILED
\]

Rebinding is **not a distinct protocol**; it is an ordinary \(BindCommit\) through the same R1–R5 gate:

\[
\boxed{
B_{t+1}=(E_1,\ H_2,\ \rho,\ \lambda_2,\ \nu_1+1),\qquad \lambda_2>\lambda_1
}
\]

- \(Committed(H_2)\) already holds (execution objects are committed canonical state, §31), so R1 is discharged cheaply.
- The failed generation is not deleted, rolled back, or tombstoned by any actor: it stops being live automatically at read time because the epoch advanced (\(\lambda_2>\lambda_1\)) and a superseding record exists in the ledger.
- Object identity is preserved across placement changes, exactly as before: \(CID_E^{t+1}=CID_E^t\).

---

## §21 Canonical vs Materialized State (revised — constructive bridge to Pass 7)

\[
\boxed{
ArtifactStoreFailure\nRightarrow IdentityCommitFailure
}
\]

provided canonical identity is durably committed. The Pass 6 result makes this constructive: derived artifacts are rebuildable from \((CID,P,Q,H,version)\), and rebuild paths re-enter the system only through the binding gate — a rebuild produces a new materialization that must satisfy the Pass 7 byte-exactness invariant before it can serve. The artifact store is precisely \(\mathcal M_t\), and its separateness from \(\mathcal I_t\) is why the next attack surface exists at all: **the rebuild path is where referent-substitution attacks live.**

---

## §25 Identity–Binding Atomicity (replaced — locked Pass 6 result)

The relationship between identity state and binding state:

\[
\mathcal I_t=\text{canonical identity state},\qquad
\mathcal B_t=\text{execution binding state}
\]

is resolved by **ordered derivation, not by distributed atomic commit**:

\[
\boxed{
BindCommit\ \Rightarrow\ Cert_{IdentityCommit};\qquad
Runnable(CID_E)\ \equiv\ \exists B:Live(B);\qquad
Live\ \text{revalidated at read, fail-closed}
}
\]

The atomic alternative is rejected on three grounds:

1. Fusing \(IdentityCommit\) with \(BindCommit\) re-conflates events the model explicitly separates: \(\text{Canonical creation}\neq\text{Binding}\).
2. A cross-authority transaction requires 2PC between authorities with independent failure domains; its uncertain window *is* the orphan state, now with locks held.
3. Atomicity is stronger than safety requires. Safety requires every *observable* state to be safe and interpretable.

**Consequences:**

\[
\boxed{
\text{Orphan canonical objects are legal; dangling live bindings are impossible.}
}
\]

- Case B (binding committed, identity commit failed) is *structurally impossible*: certificates exist only post-durability.
- Case A (canonical object with no valid binding) is not a violation: it is the state the model already names, \(\text{Canonical creation}\neq\text{Binding}\). \(Runnable\) is never a stored flag authored by any actor; a "make runnable" request is implemented as *commit or activate a binding*. An unbound object is not a broken object.

**Crash windows** (all dispositions at ledger level, no recovery transactions required):

| Crash window | Durable state | Violation? | Disposition |
|---|---|---|---|
| after IdentityCommit, before cert | committed canonical object, no cert | No | legal unbound state; cert re-issued idempotently |
| after cert, before BindCommit | cert, no binding | No | completion optional + idempotent (R2/R3) |
| during BindCommit | record present or absent | No | single-record atomicity; retry safe |
| after BindCommit | both committed, cert-anchored | No | normal path |
| reader prefix short (partition) | \(Live=false\) ⇒ not runnable | No | availability event, never integrity event |
| forged binding without cert | rejected at admission; \(Live=false\) regardless | No | defense in depth |

**Property (prefix safety).** For every ledger prefix \(s\):

\[
\boxed{
B1:\ Live(B,s)\Rightarrow Valid(B)
\qquad\qquad
B2:\ Runnable_s\equiv\exists B:Live(B,s)
}
\]

*Proof sketch (induction over prefixes).* Each admission rule is a precondition evaluated against the existing prefix: \(IdentityCommit\) requires a durable reservation transition (§17–18); \(BindCommit\) requires a certificate anchored at a strictly earlier position with a matching triple (R1) and no conflicting live binding (R2, R5). Hence every binding record in any prefix is anchored to a strictly earlier identity record. \(Live\) additionally filters supersession, retirement, epoch advance, and authorization at read time, discharging the remaining conjuncts. \(Runnable\) is *defined* as \(\exists Live\) at the serving channel, and R4 excludes stale derived caches, so B2 holds by construction. \(\blacksquare\)

**Corollaries.**

- **Retirement cannot dangle.** \(Retire(CID_H)\) or epoch advance invalidates every binding with \(\lambda\le\epsilon\) at read time, automatically; reclamation cannot create a dangling *live* binding.
- **Rebinding is the same protocol** (§14). Interim "committed, not yet runnable" windows are safe and bounded — an availability property, not an integrity property.
- **Observability is precise.** \(\mathcal B_t\) is the derived view that has passed \(Live\), exactly as Pass 5 defined observable transitions rather than raw allocations.

---

## §37 Evidence Classification (revised rows)

| Element | Current classification |
|---|---|
| Identity/binding atomicity | **Resolved at model level (Pass 6): ordered derivation — commit certificate + derived runnability + read-time revalidation; prefix-safety proof; implementation verification pending** |
| Commit certificate mechanism | Engineering design (model-level proof complete) |
| Derived runnability \(Runnable\equiv\exists B:Live(B)\) | Architectural requirement |
| Read-time binding revalidation | Distributed-systems design |
| Binding rollback | Superseded: no rollback; ledger-append supersession (R5) + read-time invalidation |

---

## §38 Current Research Frontier (replaced — Pass 7)

The resolved Pass 6 chain is:

\[
\boxed{
Committed(CID_E)\ \rightarrow\ Live(B_t)\ \rightarrow\ \text{allowed to execute}
}
\]

It stops at the binding. The next unresolved boundary is the one it exposes:

\[
\boxed{
\mathcal B_t\ \leftrightarrow\ \mathcal M_t\ \leftrightarrow\ \mathcal O_t
}
\]

where \(\mathcal M_t\) = materialization state, \(\mathcal O_t\) = observation state.

**Counterexample 1 — substituted referent:**

```text
Binding Authority
        │
        └── (CID_E, CID_H, ρ, λ, ν, H_B) live
                 │
                 X
          executor materializes
          from cache / partial fetch / nondeterministic rebuild
                 │
                 ↓
          running bytes hash ≠ CID_H
          observation records an execution "of CID_E"
```

**Counterexample 2 — stale-epoch continuation:**

```text
Execution starts under λ
        │
        ├── epoch advances to λ+1
        ├── binding auto-invalidated (read-time rule)
        │
        └── execution continues, still writing observations
                 ↓
          observation attributed to a dead epoch
```

**Required Pass 7 invariants:**

\[
\boxed{
Running(M_t)\ \Rightarrow\ Live(B_t)\ \text{at start}\ \land\ Lease(\lambda)\ \text{unexpired}\ \land\ Hash(\text{materialized bytes})=CID_H
}
\]

\[
\boxed{
Recorded(O_t)\ \Rightarrow\ Completed(M_t)\ \lor\ Fenced(M_t)
}
\]

> **Pass 7 question:** *Can the system guarantee that everything which executes is a byte-exact materialization of the committed \(CID_H\) named by a live binding, held under a currently-valid epoch lease — and that no observation is recorded for an execution that does not satisfy this?*

The §30 pipeline fixes where the lease must bind: the lease covers the window from materialization start through `lowerToUnixProcess` → `executeUnixProcess` → teardown, and every observation record must carry the full attribution tuple \((CID_E, CID_H, \rho, \lambda, \nu, H_B)\) so attribution is epoch- and generation-precise.

---

## §39 Highest-Level Model (revised constraint block)

The §39 constraint box gains:

\[
\boxed{
\begin{aligned}
BindCommit\ &\Rightarrow\ Cert(CID_E,CID_H,\lambda,seq),\quad seq<pos(B)\\
H_B\ &=\ Hash(CID_E,CID_H,\rho,\lambda,\nu,SchemaVersion_B)\\
Runnable(CID_E)\ &\equiv\ \exists B:Live(B)\quad\text{(read-time, fail-closed)}\\
Live(B,s)\ &\Rightarrow\ Valid(B)\ \text{at every prefix } s
\end{aligned}
}
\]

---

## §40 Open Problems (revised)

1. ~~Identity–binding atomicity~~ — **resolved at model level (Pass 6)**; remains as implementation + invariant testing (see 15).
2. ~~Cross-authority transaction protocol~~ — **resolved by refutation**: superseded by certificate-gated ordered derivation; no distributed transaction exists or is needed.
3. ~~Failure ordering between identity and binding authorities~~ — **resolved**: total ledger order + certificate anchoring; all crash windows enumerated (§25 table).
4. ~~Binding rollback semantics~~ — **resolved by replacement**: rollback is not an operation; supersession is a ledger append (R5), invalidation is read-time.
5. Distributed garbage collection of stale bindings — **narrowed**: logical invalidation is solved; remaining problem is *physical ledger compaction that preserves prefix-safety* (compaction must retain all Live-relevant records: identity commits, certificates, supersedes, retires).
6. Prime reservation recovery — unchanged, open.
7. Consensus/fencing implementation — unchanged, open.
8. Multi-node scheduling correctness — unchanged, open.
9. Artifact-store consistency — **subsumed into Pass 7** (\(\mathcal M_t\) fidelity).
10. Formal verification of the Q4 transition system — unchanged, open.
11–14. Empirical programs (prime IDs, Q4, numerical typing, LLM correction convergence) — unchanged, open.
15. End-to-end invariant testing — **now concretely specified**; see Reproducible Verification Targets below.

The next research pass should therefore attack:

\[
\boxed{
\mathcal B_t\ \leftrightarrow\ \mathcal M_t\ \leftrightarrow\ \mathcal O_t
\quad\text{under}\quad
Failure\ \parallel\ Recovery\ \parallel\ Concurrency
}
\]

rather than introducing additional architectural abstractions before materialization/observation fidelity is resolved.

---

## Reproducible Verification Targets (per §36 — new subsection of §40)

Per the loop's central rule — *no architectural claim without a reproducible test* — the Pass 6 claim is encoded as property-based tests over the ledger model:

1. **No-dangle property (B1):** for randomized append/crash schedules (crash position fuzzed across every rule boundary), assert \(Live(B,s)\Rightarrow Valid(B)\) at *every* prefix \(s\), with \(Valid\) evaluated per §13.
2. **Derived-runnability property (B2):** assert \(Runnable_s\equiv\exists B:Live(B,s)\) at every prefix, with no stored runnable flag in the model state.
3. **No-fork property (R2/R5):** assert at most one live binding per \((CID_E,\rho,\lambda)\) and strict \((\lambda,\nu)\) monotonicity per \(CID_E\), under concurrent duplicate and conflicting appends.
4. **Prefix-safety property:** assert every prefix of every executed schedule is an interpretable state — no schedule, crash timing, or message reordering produces an externally observable dangling binding.
5. **Rebinding property (§14):** after forced \(H_1\rightarrow FAILED\) and rebinding to \(H_2\), assert the old generation is non-live at every prefix \(\ge\) the rebinding position, with no tombstone or deletion operation in the schedule.

These tests are variant-independent (§34 matrix unaffected): the Pass 6 mechanisms are structural, not experimental variables.

---

## Summary of the consolidated model state

\[
\boxed{
\begin{array}{c}
\text{Identity}\\
\downarrow\\
\text{Representation}\\
\downarrow\\
\text{Semantic State}\\
\downarrow\\
\text{Integrity}\\
\downarrow\\
\text{Allocation}\ \ \text{(Pass 5: reserved → committed → retired, epoch-fenced)}\\
\downarrow\\
\text{Binding}\ \ \text{(Pass 6: certificate-gated, derived-live, read-time-valid)}\\
\downarrow\\
\text{Execution}\ \ \text{(Pass 7 target: materialization fidelity + epoch lease)}\\
\downarrow\\
\text{Observation}\ \ \text{(Pass 7 target: epoch-precise attribution)}\\
\downarrow\\
\text{Feedback}
\end{array}
}
\]

\[
\boxed{
\text{Separation of concerns is itself an invariant of the model.}
}
\]
