# Meeting to CRM — how it works, in plain English

No code in this one. If you've ever wondered whether the "AI reads your
calls and updates the CRM" tool actually works, or just looks like it does
in a demo, this is written for you.

## The problem, in one paragraph

After a sales call, someone has to turn what was said into structured
information a CRM can use: who was on the call, what stage the deal is
really at, what was promised, what happens next. Today that's almost always
a person doing it by hand, under time pressure, right after (or during) the
call — which means names get misspelled, next steps go unlogged, and stage
updates lag the real conversation by days. Tools that promise to automate
this step rarely show their work, and almost never prove they're actually
accurate. This one does both: every extracted fact comes with the evidence
it was pulled from, and every extraction is graded against a known-correct
answer, automatically, every time.

## 1. Automation you can't check is automation you shouldn't trust

Imagine a tool tells you: "this call was about a demo, and the deal stage
is Proposal." Fine — but based on what? If you can't see the sentence that
led to that conclusion, you're being asked to trust a black box. The next
time it's wrong, you won't know until it's already caused a problem.

Every field this tool extracts — a contact's name, the deal stage, an
action item — comes with the exact line from the transcript it was pulled
from. Click into any meeting and you can check every claim against its
source, the same way you'd check a citation.

## 2. Honest uncertainty beats false confidence

Real conversations are messy. Sometimes a deal stage is genuinely
ambiguous — one person says "let's move forward," another says "we're
still reviewing the contract," and there's no way to tell which one wins.
A tool that picks one anyway, silently, is worse than a tool that says "I
can't tell."

This one assigns a confidence level — high, medium, or low — to every
field, based on how clear the evidence actually was. When the evidence
conflicts, it says "unclear" instead of guessing. When a person is never
introduced by name, it reports zero contacts instead of inventing one.
Being wrong quietly is the failure mode this is built to avoid.

## 3. "It works" should be a number, not a vibe

Most tools that claim to extract information from calls show you a demo and
ask you to take their word for it. This one is different: every synthetic
call in the built-in library was generated with a known-correct answer
already written down — who was really on the call, what the real deal
stage was, what the real next steps were. The extractor never sees that
answer. It just reads the transcript, the same way it would for a real
call. Then a separate step compares what it found against the real answer
and produces a score.

Across the 50 calls in this demo, that score comes out to **91 out of
100** — and, importantly, it's not the same everywhere. Calls with clean,
clear conversations score **98**. Calls that were deliberately made messy
and ambiguous score **82**. That gap is the point: a tool that scored the
same on easy and hard calls would be suspicious — it would mean the
"confidence" and "difficulty" labels weren't actually connected to
anything real. Here, they are.

## 4. You can test it yourself, right now

The built-in library uses calls this tool wrote itself, so it can grade its
own homework. But you might reasonably wonder if that's a fair test. So
there's a second page — **Try It Yourself** — where you can type or paste
your own fake call transcript and watch the same extractor run on it, live,
in your browser. No server round-trip, no waiting. There's no accuracy
score for what you type, on purpose: there's no way to know the "right
answer" for a transcript nobody but you wrote, so the tool doesn't pretend
to grade it.

## What this tool doesn't try to do

It doesn't use an AI language model — every extraction rule is a plain,
readable pattern (like "a sentence starting with 'I'll' names an action
item and its owner"), not a black-box model call. That's a deliberate
tradeoff: it means the tool can't handle a completely novel way of phrasing
something the way an AI model might, but it also means every decision it
makes can be read, understood, and tested — including by you, in the source
code. It doesn't save anything back into a real CRM — there's no write
path, no account to log into, nothing persisted beyond this demo. And it
isn't a general call-transcription or meeting-notes product — it's a
demonstration of what evidence-linked, honestly-uncertain, measurably-accurate
extraction looks like, built end to end.
