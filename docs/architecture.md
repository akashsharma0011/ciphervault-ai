# Architecture

## Current demo path

```text
User input
  → browser-side pattern detection and policy decision
  → Web Crypto AES-GCM encryption of detected values in an ephemeral in-memory vault
  → token replacement (for example, [SECRET_001])
  → sanitized-payload preview and deterministic local demonstration response
```

The page is served by Next.js, but all demo decisions are implemented in client-side TypeScript. There is no API route, database, provider SDK, external model request, or persistent secret store. The payload preview is a local illustration, not an actual network egress capture.

## Modules

- `src/lib/security.ts` contains deterministic patterns for sample credentials, access tokens, database URLs, password assignments, email addresses, phone numbers, and user-defined exact phrases. It replaces selected matches with ordered token IDs. Its policy engine evaluates a small set of direct resource requests and prompt-override phrases.
- `src/lib/vault.ts` creates a non-exportable AES-GCM key through the browser Web Crypto API on first capture. Ciphertext and IVs are kept in a JavaScript map for this tab only. The prototype does not decrypt or return vault values to any model.
- `src/components/dashboard.tsx` coordinates the chat, status metrics, local attack fixture runner, event metadata, and settings.
- `tests/security.test.ts` checks core tokenization and curated policy outcomes.

## Planned production boundary (not implemented)

A production gateway would keep the provider credential and key-management duties on a hardened server-side boundary. It would send only policy-approved sanitized context to an external model, expose narrow and authorized operations, and maintain secret-free auditable events. Key custody, memory hygiene, vault persistence, provider authentication, user identity, authorization, prompt injection, data-loss-prevention coverage, and deployment isolation require separate design and independent security review. This browser-only prototype does not implement or certify that architecture.
