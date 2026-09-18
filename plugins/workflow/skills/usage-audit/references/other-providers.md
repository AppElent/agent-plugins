# Other providers

Thin by design. Each section names the meters and what multiplies them; the
numbers live in `quotas.md`, and only where a dated section exists.

## Clerk

Meter: **Monthly Retained Users**, plus Monthly Retained Organizations for B2B.

Clerk bills *retained* users — someone counts only if they come back at least 24
hours after signing up. That changes what to look for: a sign-up spike, bot
traffic, or a seeded preview environment does not bill the way an MAU meter
would.

| Pattern | What it costs | Fix |
|---|---|---|
| Machine or test accounts created against production | real retained users | point tests and previews at a separate Clerk instance |
| A login wall on content that does not need an account | converts visitors into billable users | let anonymous users read |

Clerk's own auth mechanics belong to the installed `clerk` skills.

## LLM APIs

Meter: **tokens in and tokens out**, per model. This is usually the largest bill
in an app that has any AI feature, and it is invisible to every other provider's
dashboard.

| Pattern | Multiplied by | Fix | Cost of the fix |
|---|---|---|---|
| Whole conversation resent every turn | turns squared | trim or summarize history | the model forgets earlier turns |
| A large system prompt on every call | every request | prompt caching where the vendor supports it | none — no-regret |
| The largest model for a classification | every call | a smaller model for the narrow task | accuracy on that task |
| Streaming to a client that discards the result | every abandoned request | cancel on unmount | none — no-regret |
| No token ceiling on user-supplied input | input length | cap and truncate | long inputs are cut |

Report LLM cost as its own section. Folding it into a "usage" total makes both
numbers meaningless.

## Email — Resend, Postmark, SES

Meter: **emails sent**, usually with a daily and a monthly ceiling.

Look for: a send inside a loop over recipients where one batch call exists; a
notification per event rather than a digest; retries with no idempotency key;
transactional mail going to seeded preview accounts.

## Error tracking — Sentry and similar

Meter: **events**, plus separate meters for performance traces, session replays
and attachments. Replay and tracing are usually the ones that blow the free
tier, not errors.

Look for: sampling left at 100% in production; a noisy handled-error path
reported as an exception; source maps uploaded per build with no retention
limit; preview deployments reporting into the production project.

## Databases and hosts — Neon, Supabase, Vercel

Common meters: compute hours (with autosuspend behaviour that matters more than
the rate), storage, egress, and for hosts, function invocations and bandwidth.

The audit question is the same one everywhere: **what is each meter multiplied
by, and does anything bound it?** Compute-hour meters have one extra trap worth
checking specifically — a health check or a cron that touches the database often
enough to prevent autosuspend converts an idle project into a continuously
billed one.

## Adding a provider

When an audit meets a provider with no section here:

1. **Name its meters.** Read the pricing page, not a blog post. One row per
   meter.
2. **Name the multiplier for each.** If you cannot say what a meter is
   multiplied by, you do not understand it yet — go back to the docs.
3. **Write the detection patterns.** What in application code produces that
   multiplier, and what `grep` finds it.
4. **Add a dated section to `quotas.md`** with the source URL and a
   `Last verified` line.
5. **Say what the fix costs.** A provider section that only lists savings will
   produce findings nobody can act on.

Then bump the plugin version — this is a toolbox change like any other.

Until a provider has a dated section, the correct behaviour is to describe the
usage and say the limit was not verified. Never estimate a quota.
