# Research Loop — Pass 6: `IdentityCommit ↔ BindingCommit`

**Attack surface:** \(\mathcal I_t \leftrightarrow \mathcal B_t\)
**Carry-in (Pass 5, locked):**

\[
FREE \rightarrow RESERVED \rightarrow COMMITTED \rightarrow RETIRED
\]

\[
\lambda = \text{monotonic authoritative fencing epoch}
\]

\[
\text{Allocation} \neq \text{Canonical creation} \neq \text{Binding} \neq \text{Materialization}
\]

---

## 1. The attack, restated precisely

Two authorities commit to a shared durable ledger:

- **Identity Authority** commits canonical identity records: \(\mathcal I_t\)
- **Binding Authority** commits execution bindings: \(\mathcal B_t\), records of the form \((CID_E, CID_H, \lambda)\)

Because the two commits are distinct ledger events in distinct failure domains, a crash between or during them produces exactly two counterexample classes:

**Case A — orphan canonical object** (identity commit wins, binding creation loses):

```text
Identity Authority
        │
        ├── CID_E committed
        ├── P committed
        └── H committed
                 │
                 X
          Binding creation fails
                 │
                 ↓
          CID_E exists but
          has no valid CID_H
```

**Case B — dangling binding** (binding commit wins, identity commit loses):

```text
Binding Authority
        │
        └── (CID_E,CID_H,λ) committed
                 │
                 X
          Identity commit fails
                 │
                 ↓
          execution binding
          points to nonexistent
          canonical object
```

**Pass 6 question:**

> Can the system guarantee that no externally observable execution binding exists without a committed canonical identity, and no object is marked runnable without a valid binding?

---

## 2. Rejected resolution: fusing the commits

The naive fix — make `IdentityCommit` and `BindingCommit` one atomic transaction — is rejected on three grounds:

1. **It re-conflates events Pass 5 separated.** Pass 5 locked *Canonical creation ≠ Binding* as distinct events with distinct semantics. Fusing them into one transaction undoes that separation and re-creates the conflation the lifecycle was built to remove.
2. **Two-phase commit reintroduces the pathology.** Distinct authorities with independent failure domains cannot share a transaction without 2PC, whose uncertain (blocking) window *is* the orphan state we are trying to exclude — now with locks held.
3. **Atomicity is stronger than needed.** Safety does not require the two commits to be atomic. It requires every *observable* state to be safe and interpretable.

Therefore:

\[
\boxed{
\text{Do not make the commits atomic. Make one causally dependent on the other, and make observability a derived property.}
}
\]

---

## 3. The resolution: ordered derivation

Three mechanisms replace atomicity:

### 3.1 Commit certificate (causal gate) — kills Case B

After the Identity Authority durably commits the canonical record at epoch \(\lambda\) (quorum-durable in the ledger), it issues:

\[
Cert(CID_E,\ CID_H,\ \lambda,\ seq)
\]

The Binding Authority may append:

\[
BindCommit(CID_E, CID_H, \lambda)
\]

**only** with a valid, unexpired certificate naming exactly that triple. Consequences:

- No certificate ⇒ no binding commit ⇒ **Case B is structurally impossible**, not merely detected.
- "Identity commit fails *after* binding commit" cannot occur: certificates exist only post-durability. A certificate is itself the durable proof that the identity record survived.
- Content addressing makes identity commit naturally idempotent: recomputing \(H_t = Hash(CID_E, P_t, Q_t, R_t, \text{SchemaVersion})\) from the same inputs yields the same CID, so a lost certificate or retry is a no-op re-commit, never a fork.

### 3.2 Derived runnability — dissolves Case A

\[
\boxed{
Runnable(CID_E) \ \equiv\ \exists B:\ Live(B)
}
\]

`Runnable` is **not a stored flag authored by any actor**. It is a predicate recomputed at the observation/execution channel over a ledger prefix. Any request to "make runnable" is implemented as *commit or activate a binding*. Therefore Case A — a committed canonical object with no valid binding — is **not a violation**; it is the legal state Pass 5 already named: *canonical creation ≠ binding*. The object exists canonically, the derived predicate simply does not fire, and nothing may present it as runnable.

### 3.3 Read-time revalidation, fail-closed — makes the epoch conjunct real

\[
Live(B, s)\ :=\ pos(B) \le s\ \land\ IdentityCommit(CID_E, CID_H, \lambda)\ \text{at}\ pos < pos(B) \le s\ \land\ \text{no } Retire/epoch\text{-advance of } CID_H \text{ in } (pos(B), s]
\]

All execution entry points resolve bindings **only** through \(Live\) evaluated at the reader's own ledger prefix \(s\); unresolved ⇒ `REJECT`. Raw ledger records are visible but are **records, not live bindings**: an externally observable binding is one that has passed \(Live\) at a serving channel. This gives the phrase "externally observable" a precise meaning and makes the conjunct \(\Epoch(B_t) = CurrentEpoch(CID_H)\) a read-time fact rather than a stale write-time assertion.

---

## 4. Ledger admission rules

- **R1 — Identity precedes binding.** \(BindCommit(CID_E, CID_H, \lambda)\) is appendable only if \(IdentityCommit(CID_E, CID_H, \lambda)\) exists at a strictly earlier ledger position, evidenced by \(Cert\). (Single-ledger deployment: the append rule checks the earlier record directly; the certificate is the cross-authority generalization.)
- **R2 — No forks.** At most one live binding per \((CID_E, \lambda)\). First in ledger order wins; duplicate commit is an idempotent no-op; a conflicting \(CID_H'\) at the same \(\lambda\) is rejected as a fork.
- **R3 — Idempotent identity commit.** By content addressing (R3 above), re-commit after a lost ack is a no-op.
- **R4 — Epoch-keyed derived state.** Every cache of derived state (runnability, routing, scheduler memos) is keyed \((CID_E, \lambda)\) and invalidated on epoch advance. A memoized "runnable" that survives an epoch advance is the practical attack on the converse invariant, and keying excludes it.

---

## 5. Failure matrix — every crash window

| # | Crash window | Resulting durable state | B1/B2 violated? | Disposition |
|---|---|---|---|---|
| 1 | after `IdentityCommit`, before certificate | canonical object committed, no cert | No | legal unbound state; recovery re-issues cert idempotently (R3) |
| 2 | after certificate, before `BindCommit` | cert exists, no binding | No | completion optional + idempotent (R2); or object legitimately stays unbound |
| 3 | during `BindCommit` | record fully present or absent (single-record atomicity) | No | retry safe by R2 |
| 4 | after `BindCommit` | both committed, anchored by cert | No | normal path |
| 5 | reader's prefix lacks the identity record (partition) | \(Live = false\) ⇒ not runnable | No | fail-closed; an availability event, never an integrity event |
| 6 | forged / corrupt binding record without certificate | rejected at admission; if it lands anyway, \(Live = false\) | No | defense in depth |

Every prefix of the ledger is a valid, interpretable state. **Crash-consistency is by construction, not by transaction.**

---

## 6. Invariants and proof sketch

\[
\boxed{
Valid(B_t) \Rightarrow Committed(CID_E) \land Committed(CID_H) \land \Epoch(B_t) = CurrentEpoch(CID_H)
}
\]

\[
\boxed{
Runnable(CID_E) \Rightarrow \exists CID_H : Valid(B_t)
}
\]

**Claim.** For every ledger prefix \(s\): (B1) every \(B\) with \(Live(B,s)\) satisfies \(Valid(B_t)\); (B2) \(Runnable_s \equiv \exists B : Live(B,s)\).

**Proof sketch (induction over ledger prefixes).**
*Base:* empty prefix — trivially true.
*Step:* each admission rule is a precondition evaluated against the existing prefix: `IdentityCommit` requires a durable reservation transition (Pass 5); `BindCommit` requires a certificate anchored at a strictly earlier position with matching \((CID_E, CID_H, \lambda)\) (R1) and no existing live binding for \((CID_E, \lambda)\) (R2). Hence every binding record in any prefix is anchored to a strictly earlier identity record; \(Live\) additionally filters retirement and epoch advance, which discharges the epoch conjunct at read time. \(Runnable\) is *defined* as \(\exists Live\) at the serving channel (3.2), and R4 excludes stale derived caches, so B2 holds by construction rather than by hope. \(\blacksquare\)

---

## 7. Corollaries

- **C1 — Retirement cannot dangle.** `Retire(CID_H)` / epoch advance to \(\epsilon+1\) invalidates every binding with \(\lambda \le \epsilon\) at read time, automatically, with no notification protocol. Reclamation therefore cannot create a dangling *live* binding.
- **C2 — Upgrade rebinding is the same protocol.** Re-canonicalization at \(\lambda+1\) requires a new binding through the same gated path. The interim window ("committed, not yet runnable") is safe and bounded — an availability property, not an integrity property.
- **C3 — Observability is precise.** Raw ledger visibility ≠ live binding. \(\mathcal B_t\) is defined as the *derived view* that has passed \(Live\), exactly as Pass 5 defined observable state transitions rather than raw allocations.

---

## 8. What this does not solve (honest boundary → Pass 7)

The guaranteed chain now runs: `Committed(CID_E)` → `Live(B_t)` → *allowed to execute*. It stops at the binding. Three exposures remain:

1. **Materialization fidelity.** Nothing yet proves that the bytes actually loaded by the executor hash to \(CID_H\) — cache reuse, partial fetch, or nondeterministic rebuild can substitute a different referent for a sound reference.
2. **Continuation fencing.** \(\lambda\) fences *acceptance*; an execution started under \(\lambda\) may continue running after the epoch advances to \(\lambda+1\).
3. **Observation attribution.** \(\mathcal O_t\) may record executions that never satisfied the above, or lose fenced ones.

---

## 9. Pass 6 locked result

\[
\boxed{
\text{Identity–binding integrity is achieved by ordered derivation, not by distributed atomic commit.}
}
\]

\[
\boxed{
BindCommit \Rightarrow Cert_{IdentityCommit}; \quad
Runnable \equiv \exists B : Live(B); \quad
Live \text{ revalidated at read, fail-closed}
}
\]

\[
\boxed{
\text{Every ledger prefix is a safe state: orphans are legal, dangles are impossible.}
}
\]

---

## 10. The loop advances to Pass 7

Next unresolved boundary, exposed by the Pass 6 conclusion:

\[
\boxed{
\mathcal B_t \leftrightarrow \mathcal M_t \leftrightarrow \mathcal O_t
}
\]

where \(\mathcal M_t\) = materialization state and \(\mathcal O_t\) = observation state.

**Counterexample 1 — substituted referent:**

```text
Binding Authority
        │
        └── (CID_E, CID_H, λ) live
                 │
                 X
          executor materializes
          from cache / partial fetch
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
        ├── binding auto-invalidated (Pass 6: read-time rule)
        │
        └── execution continues, still writing observations
                 ↓
          observation attributed to a dead epoch
```

**Required Pass 7 invariant:**

\[
\boxed{
Running(M_t) \Rightarrow Live(B_t)\ \text{at start}\ \land\ Lease(\lambda)\ \text{unexpired}\ \land\ Hash(\text{materialized bytes}) = CID_H
}
\]

\[
\boxed{
Recorded(O_t) \Rightarrow Completed(M_t) \lor Fenced(M_t)
}
\]

> **Pass 7 question:** *Can the system guarantee that everything which executes is a byte-exact materialization of the committed \(CID_H\) named by a live binding, held under a currently-valid epoch lease — and that no observation is recorded for an execution that does not satisfy this?*

That is the materialization/observation fidelity surface — the last unbroken link between canonical identity and observed execution.
