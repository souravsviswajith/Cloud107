# Mathematical Model Amendment — Pass 7 Consolidation

**Applies to:** *Current Mathematical Model — 107 / Cloud107 Unified System*, after the Pass 6 amendment
**Status:** Pass 7 result integrated; frontier advances to Pass 8 (bounded history)
**Date:** 2026-10-02
**Resolution record:** [research_loop_07_ledger_materialization_observation.md](research_loop_07_ledger_materialization_observation.md)

Five critique findings were accepted (R5 ordering gap; `H_B` idempotence gap; `Live_B ≠ Live_R`; prefix materialization; explicit observation contracts), the certificate chain was adopted, and the Pass 6 statement is formally amended: "ordered" now means a defined lexicographic order. This amendment contains paste-ready replacement and new sections. Supersedes the Pass 6 amendment's §13a/§13b where noted.

---

## §12 Binding Record (revised — authoritative ordering and derivation edge)

The record gains no new stored fields; it gains an authoritative order and a parent edge:

\[
\boxed{
B=(CID_E,\ CID_H,\ \rho,\ \lambda,\ \nu,\ H_B,\ Parent)
}
\]

\[
H_B=Hash(CID_E\parallel CID_H\parallel \rho\parallel \lambda\parallel \nu\parallel SchemaVersion_B),
\qquad
Parent=H(C_I)
\]

**Authoritative binding order (lexicographic, total):**

\[
\boxed{
(\lambda_1,\nu_1)<_{\omega}(\lambda_2,\nu_2)
\iff
\lambda_1<\lambda_2\ \lor\ (\lambda_1=\lambda_2\land\nu_1<\nu_2)
}
\]

with \(\nu\) scoped per \((CID_E,\lambda)\) (first generation in an epoch is \(1\)). A single monotonic sequence replacing \((\lambda,\nu)\) is rejected: \(\lambda\) is consensus-governed (safety) and \(\nu\) is object-history-governed (bookkeeping); merging them violates the Canonical Separation Principle. \(\omega\) is the *order*, not a field.

---

## §13a Ledger Admission Rules (revised — supersedes Pass 6 §13a)

Every record type — identity, certificate, binding, start, observation — appends under the same semantics:

\[
\boxed{
R0\ \textbf{(Append semantics).}\ 
Append(X,H_X)\equiv
\begin{cases}
Create(H_X),&H_X\notin Ledger\\
NoOp,&H_X\in Ledger\land ContentMatch\\
CONFLICT,&H_X\in Ledger\land ContentMismatch
\end{cases}
}
\]

\[
\boxed{
R1\ \textbf{(Derivation chain). } Parent\ \text{must verify against a committed record at a strictly earlier position.}
}
\]

\[
\boxed{
R2\ \textbf{(No forks). } \exists!\ CurrentBinding(E,\rho)\ \text{at every prefix (or none); first-in-log wins.}
}
\]

\[
\boxed{
R3\ \textbf{(Idempotence). } Append^n=Append\ \text{via } R0;\qquad
R4\ \textbf{(Epoch-keyed derived state). } \text{Caches keyed } (CID_E,\lambda).
}
\]

\[
\boxed{
R5\ \textbf{(\(\omega\)-monotonicity). } BindCommit\ \text{admitted only if } (\lambda,\nu)>_\omega \text{the object's chain max.}
}
\]

R5 makes fencing a property of the order: a stale-epoch candidate (e.g. \((5,8)\) after \((6,1)\) is live) is rejected because \((5,8)<_\omega(6,1)\). The lexicographic pair is a total order over all candidates (resolves the Pass 6 gap: component-wise \((\lambda,\nu)\) is only a partial order).

---

## §13b Live Predicate (revised — position-explicit form)

\[
Live_B(B,s)\iff pos(B)\le s\ \land\ \text{verified parent chain}\ \land\ \text{no supersede/retire/epoch-advance in } (pos(B),s]\ \land\ Authorized(\cdot)\ \text{at } s\ \land\ \lambda_B=\text{current epoch at } s
\]

Fail-closed: all channels resolve through \(Live_B\) at their own prefix; unresolved ⇒ REJECT.

---

## §13c Execution Liveness and Enforcement (new)

\[
\boxed{
Live_B\neq Live_R
}
\]

Read-time invalidation is classification, not enforcement. Define \(Live_R(R)=Live_B(B_{start})\land Lease(R)\) valid at the enforcement point, and the **enforcement-boundary rule**:

\[
\boxed{
Live_B(B,s)=false\ \Rightarrow\ NextAuthorizedAction(R,s)=REJECT
}
\]

Every privileged action (lease renewal, new materialization, shared-authority write, observation append) re-checks liveness; privilege is re-earned per action. **Admission-time gating** closes the stale-actor case structurally:

\[
\boxed{
\text{Shared state changes only via appends; appends are gated at the owning authority against the authority's current prefix.}
}
\]

A stale or partitioned actor can only read (classified by its declared contract) or attempt a gated append (REJECT at the authority). Shared state is double-fenced: authority-side by \(\lambda\), executor-side by lease. \(\tau\) remains purely a liveness hint — clocks time out attempts; epochs and admission gates decide outcomes.

**Authorization is a record.** Starting an execution appends

\[
\boxed{
StartCommit(CID_E, CID_H, \rho, \lambda, \nu, H_B, s)
}
\]

admitted only if \(Live_B(B,s)\) at the named prefix. Legitimacy of a running execution is a prefix query, not a memory.

---

## §21a Materialization Prefix Machine (new — extends §21)

\[
\boxed{
\mathcal M_t=Apply(\mathcal L[0:m_t]),\qquad Apply(k)\ \text{requires}\ Checkpoint(k-1)
}
\]

with atomic publication of manifests \(\big(k,\ \mathrm{root}(\mathcal M_k)\big)\). Checkpoint-first ordering makes the no-hole invariant hold **by construction** (a crash causes re-apply, which is a NoOp by R0); a restart cannot name position \(k\) without a checkpoint at \(k-1\). \(Apply\) must be a deterministic function of the prefix, so \(Replay(\mathcal L)=\mathcal M^{canonical}\) for any crash schedule, and drift is detectable by comparing manifest roots. Recovery is \(m_{crash}\rightarrow Replay(m_{crash}+1,\dots,n)\). External readers consume manifests only — never in-progress materializer state.

---

## §25a Observation Contract (new)

Every observation channel and record declares its consistency semantics:

\[
\boxed{
Consistency(O)\in\{\,STALE,\ BOUNDED,\ CAUSAL,\ LINEARIZABLE\,\}
}
\]

Safety-relevant decisions are \(LINEARIZABLE\text{-}AT\text{-}AUTHORITY\): made at a named prefix and anchored by their own ledger record; linearizability is required only at admission gates. Observation admission is fenced by R0/R1 plus lease validity at append time:

\[
\boxed{
Recorded(O)\ \Rightarrow\ Completed(M_t)\ \lor\ Fenced(M_t)
}
\]

Attribution per record: \((CID_E, CID_H, \rho, \lambda, \nu, H_B,\ StartCommit\ pos,\ Consistency,\ Fenced?)\). The observation history never records an unauthorized execution as authorized.

---

## §37 Evidence Classification (revised rows)

| Element | Current classification |
|---|---|
| Ledger append semantics (R0 content-keying) | Distributed-systems design (Raft-style dedup) |
| Lexicographic authoritative order \((\lambda,\nu)<_\omega\) | **Architectural requirement** (closes Pass 6 R5 gap) |
| \(Live_B \neq Live_R\) + enforcement-boundary rule | Architectural requirement |
| Admission-time gating at owning authority | Distributed-systems design (structural safety) |
| Prefix materialization + checkpoint-first apply | Engineering design (log-consumer pattern) |
| Manifest state roots (B9 checkable) | Engineering design |
| Observation consistency contracts (B10) | Architectural requirement |
| StartCommit as ledger record | Architectural requirement |
| Derivation DAG with parent edges | Architectural requirement (matches provenance invariant, `mathematical-model.md` §10) |
| Prefix safety under schedules | **Model-level claim with induction sketch; machine-checked verification pending** |

---

## §38 Current Research Frontier (replaced — Pass 8)

The Pass 7 chain:

\[
\boxed{
\mathcal I\xrightarrow{certificate}\mathcal B\xrightarrow{ordered\ log}\mathcal M\xrightarrow{consistency\ contract}\mathcal O
}
\]

holds for an **append-only, unbounded** ledger. Real systems must compact, and compaction is the first operation that rewrites the history the guarantees depend on:

\[
\boxed{
Snapshot(k)\ \rightarrow\ Truncate(\le k)\ \rightarrow\ Re\text{-}anchor
}
\]

racing with replay, epoch advance, consumer lag, and certificate retention:

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
Compaction\ \leftrightarrow\ Derivation
}
\]

> **Pass 8 question:** *Can the system compact the authoritative history — snapshot, truncate, re-anchor — such that prefix safety, the derivation chain, and B1–B10 continue to hold for every consumer at every position, under concurrent compaction, replay, epoch advance, and certificate retention pressure?*

---

## §39 Highest-Level Model (constraint block additions)

\[
\boxed{
\begin{aligned}
Append(X,H_X)\ &\equiv\ Create/NoOp/CONFLICT\ \text{by } H_X\ \text{(R0)}\\
BindCommit\ &\Rightarrow\ (\lambda,\nu)>_\omega \text{chain max},\quad Parent=H(C_I)\\
Live_B(B,s)=false\ &\Rightarrow\ NextAuthorizedAction=REJECT\\
\mathcal M\ &=\ Apply(\mathcal L[0:m]),\quad Apply(k)\Rightarrow Checkpoint(k-1)\\
Recorded(O)\ &\Rightarrow\ Completed(M_t)\ \lor\ Fenced(M_t)
\end{aligned}
}
\]

---

## §40 Open Problems (revised)

1–4. Identity–binding atomicity cluster — **resolved (Pass 6), amended and closed under the Pass 7 four-layer statement** (§11 of the resolution record).
5. Distributed GC of stale bindings — **superseded by Pass 8**: physical compaction with prefix-safety preservation is now the open problem, with replay/epoch/retention concurrency.
6–8. Prime reservation recovery; consensus/fencing implementation; multi-node scheduling correctness — unchanged, open.
9. Artifact-store consistency — **resolved at model level (Pass 7 §21a)**: prefix machine + deterministic apply + manifest roots; implementation verification pending.
10. Formal verification of the Q4 transition system — unchanged, open; now joined by **TLA+ encoding of B1–B10** (Pass 7 verification targets).
11–14. Empirical programs — unchanged, open.
15. End-to-end invariant testing — **specified (Pass 7 §10)**: schedule fuzzing, ordering attacks, retry storms, revocation races, materializer chaos.

The next research pass should therefore attack:

\[
\boxed{
Snapshot\ \parallel\ Truncate\ \parallel\ Re\text{-}anchor
\quad\text{under}\quad
Replay\ \parallel\ EpochAdvance\ \parallel\ Retention
}
\]

rather than introducing additional architectural abstractions before bounded-history correctness is resolved.
