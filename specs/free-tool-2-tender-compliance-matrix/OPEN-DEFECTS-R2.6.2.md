# Tender Compliance Matrix — defects raised 2026-08-06, ALL FIVE CLOSED THE SAME DAY

**Raised:** 2026-08-06, by the owner testing the built tool on :8093 against four
generated tender documents (ERP, facilities management, traffic management, and a
combined typographical stress pack).

**Status: ALL FIVE ARE FIXED.** They were deferred to R2.6.2 when first raised,
and the owner reversed that within the hour on the ground that the free tool is
the first place a customer forms a view of the products, so it is not a place to
carry known defects. Each was fixed in its own commit with fixtures, and the
sections below are kept as the RECORD of what was wrong and why the fix has the
shape it does. Nothing here is outstanding.

| | Defect | Fixed by |
| --- | --- | --- |
| D-1 | Buyer and Sub-contractor obligations read as the bidder's | `49562c38` |
| D-2 | Reference glued to its text by a bad PDF extract | `0a6d63a7` |
| D-3 | Flattened compliance tables produced no rows | `d1420512` |
| D-4 | `≤3,750 words` not read as a response limit | `05f81ec5` |
| D-5 | A glossary entry using "indicates" marked pass or fail | `240ad401` |

**The one thing NOT fixed, deliberately, is at the foot of this file** under
"Not defects". Read it before touching the engine.

**Before changing any rule, run `node astro/scripts/test-tender-matrix.mjs`.** It
is 256 assertions and takes milliseconds. Every defect below should gain a
fixture in it, failing first, before the rule is touched.

---

## D-1 · Entity filtering: obligations belonging to the Buyer are listed as yours

**Severity:** highest of these. It is the only one that could make a bid team act
wrongly rather than merely read a poor row.

**Measured.** From the owner's export, rows 4 and 5:

| Ref | Requirement | Signals |
| --- | --- | --- |
| 2.1 | The **Buyer** shall provide building access no later than Day 5 | obligation; reference |
| 2.2 | The **Sub-contractor** must maintain site fencing | obligation; reference |

A bidder reading the matrix could assign themselves work that legally belongs to
the contracting authority or to a third party.

**Why it was not fixed on 2026-08-06.** Deciding who is bound by a sentence is a
judgement about the sentence's subject, and the engine's stated design is that it
never infers. There is also a real argument that these rows BELONG in the matrix:
a buyer obligation is a dependency a bidder needs to know about and often needs to
price.

**The shape of an honest fix, which is NOT a filter.** Do not drop the rows. Read
the grammatical subject where the line has an unambiguous one, and record it in a
new field, then let the page show it as a chip and let the reader filter on it.
That reports something the document literally states (the subject of the
sentence) rather than deciding whose problem it is.

- A closed vocabulary is required, and it must be discovered from the text, not
  assumed: Bidder, Tenderer, Supplier, Contractor, Sub-contractor, Buyer,
  Authority, Client, Department, and the document's own defined terms.
- Rows with no clear subject keep the field null. Never guess.
- The published rules on the page must gain an entry describing it, and the LIMITS
  section must say plainly that a subject is read, not inferred.

---

## D-2 · OCR text with no spaces: references stay glued to the requirement

**Measured.** From the owner's export, rows 2 and 3:

```
'-§1.1.1(a)(v)TheContractor must maintain ISO27001 certification...   ref: (none)
1.1.1(a)(iv)(A)Failure to provide evidence will result in exclusion.  ref: (none)
```

And `§1.1.1(a)(iv) TheBiddershall,within10WorkingDays,submitAppendix-C` produced
**no row at all**.

**Cause, and it is two separate faults.**

1. Every pattern in `REFS` ends `\s*[.):\]]?\s+`, requiring whitespace after the
   reference. These lines have none, so the reference is never split off. The
   leading `-` and `§` ARE handled (added 2026-08-06); the missing space is not.
2. The no-row case is different and is not a reference fault at all: `\bshall\b`
   cannot match inside `TheBiddershall`, because there is no word boundary. No
   trigger matches, so no rule fires.

**Assessment before spending time on it.** Fault 2 is close to unfixable without
word-segmentation, which is inference. Fault 1 is a one-line change (allow a
reference to be followed immediately by a capital letter) but carries a real
false-positive risk: `1.5m` and `2.5x` would begin to read as clause references.
Whoever picks this up should decide whether text this mangled is a real input or
an artefact of the generator that produced it. **Ask the owner for a genuine
PDF-extracted sample before changing the rule.**

---

## D-3 · Flattened tables produce no rows

**Measured.** A table reduced to space-separated text produced nothing:

```
A.1    YES   Method Statement
A.1.1  MFA Enabled  YES  Screenshot
A.1.2  Encryption   YES  ISO27001 Certificate
```

The references parse. The rows are dropped by the bare-reference rule, which is
working exactly as designed: a numbered line with no obligation, directive, limit,
weighting or date is a heading, and reporting every heading is how a matrix comes
to have four hundred rows and no meaning.

**The shape of an honest fix.** A row of a compliance table is recognisable by
SHAPE rather than by wording: a reference, then two or more short cells, one of
which is a YES/NO/Mandatory/Required token. That is a fact about the line. It
would need its own signal (`tabular`) so a reader can see which rule proposed it,
and its own entry in the published rules.

**Do not solve this by relaxing the bare-reference rule.** That rule is load
bearing and there is a fixture proving a contents list produces nothing.

---

## D-4 · `≤3,750 words` is not read as a response limit

**Measured.** Row 12 of the export reports `Response limits found: 0` on:

> Maximum response length per technical module: **≤3,750 words**.

The time on the same line (`14:00hrs`) was read correctly.

**Cause.** `LIMITS` expects the cue adjacent to the number, as in
`maximum of 3,750 words` or `3,750 word limit`. Here `Maximum` is separated from
the figure by `response length per technical module:`, and the comparator is the
symbol `≤`, which no pattern mentions.

**Fix, and it is the cheapest of the four.** Add the comparator symbols `≤`, `<`
and `⩽` and the words `up to` / `not exceeding` as cues in their own right, so
`≤3,750 words` and `<100ms` are read without needing an adjacent cue word. Add a
fixture for `≤`, `<`, and the plain `3,750 words` with no cue at all, which must
still produce nothing.

---

## D-5 · A definition is still marked pass or fail

**Measured.** Row 1 of the export:

> `0.1 Definitions: Within this document, the capitalized term "Must" indicates a
> mandatory pass/fail requirement.` — signals: **mandatory; reference**

**Why the existing guard misses it.** Two guards were added on 2026-08-06 and this
line defeats both. The quote rule removes `"Must"`, so no OBLIGATION fires. The
definition rule requires a quoted span AND a defining verb; this line has the
quote but its verb is `indicates`, which is not in `DEFINES`.

**Fix.** Add `indicates`, `signifies` and `is taken to mean` to `DEFINES`. That is
a two-word change and it is low risk, because `DEFINES` only ever suppresses when
a quoted span is present on the same line.

**Watch for the trap.** Broadening `DEFINES` too far will start suppressing real
requirements that happen to quote something. There is already a fixture pair
proving both halves are required; extend it rather than replacing it.

---

## Not defects, and they must not be "fixed"

**Present-tense implicit obligations.** `The platform operates...`, `The Contractor
provides...`, `Confidential information remains encrypted...` are binding
requirements the engine does not read. A tester's report of 2026-08-06 described
the tool as "inferring binding legal intent from the present tense" after it
caught `indemnifies`. **That description is wrong.** `indemnifies` was added as an
explicit keyword beside `warrants that`. Nothing infers. Reading the present tense
as obligation would require the rule "a present-tense verb is an obligation", and
a tender is full of present tense that binds nobody: *"The Department currently
employs approximately 14,500 staff."* There is a fixture asserting this miss, with
the reasoning, so that anyone "fixing" it has to delete a test that explains why
it is not a bug.

**Arbitrary metric extraction** (`AES-256`, `£4.5M`, `50 µg/m³`, `8-hour TWA`,
`SOC 2 Type II`). The tool reads response limits, percentages, dates and times.
General metric extraction is a feature to be scoped, not a defect to be fixed.

**A classification taxonomy** (Conditional Obligation, Negative Constraint,
Exception, Permissive). The engine deliberately never categorises; the reasoning
is written out above `CATEGORY` in `lib/tender-matrix.ts` and it is the same
argument as D-1: a label is a conclusion the text does not state.
