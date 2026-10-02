# Research Loop — Pass 9: Authenticated-History Divergence

**Attack surface:** \(S_k \leftrightarrow S_k' \leftrightarrow Trust\) under \(Sync \parallel Forgery \parallel Corruption\) — snapshot trust, cross-replica agreement, fork/equivocation analysis.
**Carry-in (Pass 8, locked):** summarizability + atomic activation + structural recoverability; physical representations \(\mathcal R\) are interchangeable witnesses of one logical history \(\mathcal L^*\).
**Standing constraint:** \(\text{Model claim} \neq \text{Verified implementation property}\) — this pass remains model-level.

---

## 0. The strongest test — and the honest concession

> *Can two replicas independently accept incompatible snapshots/history roots while all currently defined invariants still appear satisfied?*

\[
\boxed{
\textbf{Yes — under B1--B19 alone, the counterexample goes through.}
}
\]

B1–B19 are **intra-replica prefix predicates**: each constrains what one replica's rules do with *its own* history. Nothing constrains what one replica may accept *about* the history *from another replica*. Two replicas holding \(\mathcal R_{50}=(S_{50},\cdot)\) and \(\mathcal R'_{80}=(S'_{80},\cdot)\) with mutually incompatible snapshot headers each satisfy every invariant locally while witnessing divergent logical histories. Pass 8's own boundary ("who signs \(S_k\), and what quorum makes a snapshot credible?") was the open door; this pass closes it.

No prior result is overturned: B1–B19 remain true and remain scoped exactly as written. The gap is a **missing acceptance rule**, and it is filled without a new abstraction — by the same uniform move the loop has used twice before (Pass 6: identity→binding; Pass 7: decision→`StartCommit`).

---

## 1. Mechanism 1 — `AnchorCommit`: snapshot trust becomes a ledger record

\[
\boxed{
AnchorCommit(k,\ anchor_k,\ \lambda)\ \text{appended at } pos>k,\ \textbf{before}\ [0,k]\ \text{is truncatable}
}
\]

- **Admission:** chain-continuity with the currently anchored tip (\(anchor_k = h_k\), the born-compactable chain of Pass 8 §2) and the **current epoch** \(\lambda\). Stale-epoch anchor attempts are rejected by the Pass 5 fence — the same \(\lambda\), the same rule, one more record type.
- **Survival:** a later compaction at \(k'' \ge pos\) truncates the `AnchorCommit` too — but its content is **absorbed into the snapshot header**: each snapshot carries \(ParentSnap=H(S_{prev})\). Snapshots form their own derivation chain (the Pass 7 DAG applied to snapshots), terminating at the genesis anchor.
- Verification of a post-compaction snapshot is therefore **relative to the accepted anchor history**, not to raw records — exactly the relocation of the trust root identified in Pass 8, now made explicit and falsifiable.

This is the third application of the loop's uniform principle:

\[
\boxed{
\text{Every decision that outlives the context it was made in must itself become a record.}
}
\]

---

## 2. Mechanism 2 — Quorum certification and epoch-scoped trustees

Signatures exclude outsiders; they do not exclude an equivocating authority. Therefore:

\[
\boxed{
AnchorCommit(k,anchor_k,\lambda)\ \text{requires a quorum certificate over}\ (k,anchor_k,\lambda)\ \text{from trustee set } T_\lambda
}
\]

- \(T_\lambda\): the trustee keys **of the current epoch** — the same Ed25519 key infrastructure that already governs the repository's source-first update system. The trust root for summaries is anchored in the system's existing cryptographic identity, as required.
- Thresholds: \(|T_\lambda| = 3f+1\), quorum \(q = 2f+1\). Any two quorums intersect in \(\ge f+1\) members; under \(\le f\) Byzantine trustees, **two conflicting certificates cannot both exist** — and if they do, they constitute *public, undeniable misbehavior evidence*: trigger for fail-closed halt plus **re-key epoch** (revocation via the same epoch machinery that fences everything else).

**Reduction result (the small-consensus decomposition).** Cross-replica snapshot agreement reduces to consensus on a single tuple type — \((k, anchor_k, \lambda)\), a monotone sequence of small records — *not* general-purpose consensus over the whole ledger:

\[
\boxed{
\text{Snapshot agreement} \ \preceq\ \text{consensus safety over the anchor tuple sequence alone}
}
\]

The record ledger keeps its existing structure; only the anchor sequence is agreement-critical. This is the minimal possible consensus object, and it is epoch-scoped like everything else in the model.

---

## 3. Mechanism 3 — the Meeting Protocol: divergence is detected on contact

On any replica-to-replica contact, exchange \((k,\ anchor_k)\) and snapshot-chain head. The deterministic case analysis:

| Situation | Condition | Action |
|---|---|---|
| Same chain, different positions | chain-continuity holds | ordinary divergence; Pass 8 recovery instructions; deterministic convergence (B17) |
| Same position, same anchor | \(anchor_k = anchor_k'\) | positions reconcile; suffix exchange |
| Same position, different anchor | \(anchor_k \ne anchor_k'\) | **FORK ALARM** |
| Incompatible snapshot chains | \(ParentSnap\) discontinuity | **FORK ALARM** |

**Fork alarm semantics (fail-closed, safety over liveness):**

\[
\boxed{
ForkAlarm \Rightarrow \text{quarantine: no summary-based recovery, no further anchor acceptance, pending authority resolution}
}
\]

- A fork alarm is **cryptographically self-evidencing**: two conflicting quorum certificates are public proof that \(\ge f{+}1\) signers misbehaved (or consensus safety itself failed) — the system does not need to *decide* who is right, because under the threshold assumption that situation is impossible; its existence *is* the alarm.
- **Stale snapshots are not an attack.** A replayed older-but-valid snapshot is chain-compatible — it *is* part of the history — and recovery from it replays forward deterministically to \(\mathcal M^{canonical}\) (B17). "Stale" costs convergence time, never correctness. The correct cut is exactly the one the critique drew: **compatible vs incompatible**, not fresh vs stale.
- A corrupted replica is caught by its own Pass 8 anchor \(A_c=(a_c,\mathrm{root}(\mathcal M_{a_c}))\) mismatch ⇒ self-quarantine ⇒ mandatory re-recovery from an anchored snapshot (B24).

---

## 4. Fork / equivocation analysis

| Adversary | Mechanism | Outcome |
|---|---|---|
| External forger (no keys) | forge or alter \(S_k\), inject anchors | excluded by Ed25519 verification under the existing update root |
| Faulty/compromised replica | accept junk, corrupt state, replay stale | accepts only quorum-certified, chain-continuous anchors; own root mismatch ⇒ self-quarantine; stale ⇒ safe convergence |
| Byzantine trustees \(\le f\) | equivocate: sign two anchors at \(k\) | impossible to both finalize (quorum intersection); any attempt yields public misbehavior evidence ⇒ fail-closed + re-key epoch |
| Byzantine trustees \(> f\) | equivocate successfully | **outside model tolerance** — fork alarm fires on contact; safety preserved by quarantine, liveness surrendered to the sovereign operator (explicitly the model's standing trade) |
| Network partition | replicas diverge in position | safe: compatible chains reconcile deterministically; no fork can *finalize* without quorum, and quorum unavailability halts anchoring (fail-closed) rather than permitting it |

The partition row is the CAP statement made precise for this design: **during a partition the system refuses to anchor (safety preserved, liveness of compaction halts) rather than anchor divergently.**

---

## 5. New invariants B20–B25 (promoted to the formal spec)

\[
\begin{aligned}
B20\ \text{(Anchor authority):}\ & S_k\ \text{acceptable} \iff \exists\ AnchorCommit(k,anchor_k,\lambda)\ \text{quorum-certified in } T_\lambda\\
B21\ \text{(Chain compatibility):}\ & \text{accepted snapshots at } k<k'\ \text{are chain-continuous; violation} \Rightarrow ForkAlarm\\
B22\ \text{(Equivocation safety):}\ & \text{no two incompatible anchor tuples can both be quorum-finalized in one epoch}\\
&\quad \text{(conditional on } \le f\ \text{Byzantine of } 3f{+}1;\ \text{violation evidence} \Rightarrow \text{halt + re-key)}\\
B23\ \text{(Snapshot uniqueness):}\ & \text{at most one published snapshot per position } k\ \text{(corollary of B20+B22)}\\
B24\ \text{(Recovery authenticity):}\ & \text{RecoveryInstruction targets must verify to the replica's trust root before use}\\
B25\ \text{(Divergence containment):}\ & ForkAlarm \Rightarrow \text{fail-closed quarantine of summary trust, both sides}
\end{aligned}
\]

B1–B19 keep their scope (intra-replica); the B-series now spans both. With B20–B25, the answer to the strongest test inverts:

\[
\boxed{
\text{Two replicas cannot both accept incompatible, individually quorum-certified snapshots —}
}
\]

\[
\boxed{
\text{and if they are handed incompatible anchors at all, the meeting protocol turns the event into a public alarm, not a silent split.}
}
\]

*Proof sketch.* (i) Acceptance requires a quorum certificate (B20). (ii) Two incompatible accepted anchors imply two incompatible quorum certificates ⇒ intersection contains \(\ge f{+}1\) members of which \(\ge 1\) is Byzantine — impossible under \(\le f\) (B22). (iii) Any incompatible *presentation* (certified or not) is chain-inconsistent with an accepted chain, detected at meeting and contained by B25 before it can be *used* for recovery. Hence incompatible acceptance is either impossible (both certified), detectable-and-contained (uncertified/forged), or outside the stated adversary threshold (>f Byzantine) — where safety is still preserved by B25 quarantine. \(\blacksquare\)

---

## 6. Verification targets (per §36 — all model-level, none prematurely "implemented")

1. **Fork injection, sub-threshold:** simulate \(\le f\) compromised trustees signing conflicting anchors at position \(k\); assert no replica pair both finalize (B22) and any presented conflict raises ForkAlarm (B25).
2. **Fork injection, super-threshold:** \(>f\) compromised trustees; assert forks *can* occur (honesty of the boundary) and are contained: quarantine on contact, no summary-based recovery from either side, alarm evidence exported.
3. **Stale-anchor replay:** replay old valid anchors/snapshots; assert safe acceptance, B17 forward convergence, no alarms.
4. **Partition–merge:** replicas diverge in position only; assert deterministic reconciliation via anchor continuity and suffix exchange.
5. **Misbehavior-evidence path:** two conflicting certificates ⇒ assert halt + re-key-epoch transition.
6. **Anchor absorption:** compact across an `AnchorCommit`; assert the snapshot header chain preserves verifiability from genesis anchor to newest snapshot.
7. **TLA+:** minimal two-replica / three-trustee acceptance model of B20–B25 — the first *machine-checked* increment, deliberately tiny.

---

## 7. Honest boundaries

1. **Trustee governance is the remaining root.** Who are \(T_\lambda\)'s members, how do key sets rotate, and how is a re-key epoch itself certified? The regress terminates — in this architecture — at the **sovereign operator's identity plane** (the WebAuthn/FIDO2 + update root the system already has). Rotation and revocation protocol is the next attack surface, not this pass.
2. **Partition liveness.** Compaction and anchoring halt during quorum-unavailable partitions by design; availability resumes on heal. Stated, not solved — it is the model's chosen trade.
3. **Detection liveness** assumes eventual connectivity (meetings happen). A replica isolated forever accepts only its own certified chain — safe, possibly stale.
4. **Machine checking.** B20–B25 are model-level claims with an induction sketch; only target 7 begins the TLA+ debt.

---

## 8. The loop advances to Pass 10 — and the shape of closure

The last unowned trust operation is the one that defines \(T_\lambda\):

\[
\boxed{
TrusteeSet_\lambda \rightarrow TrusteeSet_{\lambda+1}\ \text{(rotation, revocation, recovery of the trust root itself)}
}
\]

Every prior layer's safety now composes down to a single question about this one: identity (P5), fencing (P5), derivation (P7), summaries (P8), anchor trust (P9) — all terminate at the operator root. The research loop is therefore approaching **closure**: Pass 10 attacks trust-root governance —

> **Pass 10 question:** *Can the trustee set rotate and revoke under the same epoch discipline — such that a compromised-era key set cannot certify anchors in a later era, a rotation cannot fork the anchor chain, and recovery from total compromise of one era is possible using only the system's own mechanisms?*

If yes, every layer of the model rests on exactly one root — the sovereign operator's identity — and every operation on every layer is epoch-fenced, ledger-recorded, and derivation-chained. If no, the counterexample determines whether the fix is certificate design, epoch semantics, or an admission rule — not a new abstraction.
