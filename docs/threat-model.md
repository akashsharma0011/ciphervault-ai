# Demo threat model and limitations

## Intended demonstration

The UI illustrates three controls: (1) selected patterns are detected locally and substituted with opaque placeholders; (2) detected values are encrypted in an ephemeral browser-memory map with the Web Crypto AES-GCM API; and (3) a deterministic local policy engine denies a small set of curated requests for protected resources. The event feed omits prompt bodies and matched values.

## Assets represented in the demo

- Sample credentials, contact information, and user-defined exact phrases typed into the local browser session.
- An ephemeral non-exportable CryptoKey and corresponding ciphertext entries.
- Token labels and secret-free event metadata.

## Assumptions

The prototype assumes its page code is unmodified and executes in the user's ordinary browser. The controls are illustrative and scoped to the visible demo implementation. There is no provider or remote server receiving prompt content from the chat flow.

## Out of scope / not protected

- A compromised browser, malicious extension, injected JavaScript, XSS, supply-chain compromise, operating-system compromise, screen recording, screenshots, or user copying data elsewhere.
- Exhaustive secret detection. The detector is regex/pattern based and can miss formats or produce false positives.
- Adaptive prompt injection or arbitrary model behavior. The policy rules and eight attack inputs are curated and fixed.
- Production-grade key isolation. Browser UI and client-side application logic share a trust environment; non-exportable Web Crypto key material does not turn it into a secure enclave.
- Durable vault security or guaranteed memory wiping. The entries are not persisted; JavaScript provides no guarantee of physical zeroization.
- Provider-side or network security. No external model is connected, so this demo does not measure real provider egress or provider behavior.

## Claims to avoid

Do not state that CipherVault is mathematically impossible to hack, that an LLM never sees any data, or that encryption hides arbitrary plaintext while an ordinary model can still understand that plaintext. Do not present a 100% score or the eight-fixture outcome as proof of production security. The defensible claim is narrower: **this prototype demonstrates local tokenization and policy examples and is designed to minimize sensitive data sent to external LLMs; its current demo sends nothing to an external LLM.**

## Before handling real secrets

Replace the browser-only architecture with a reviewed server-side gateway and key-management boundary, verify that plaintext does not appear in logs/telemetry/error reports, evaluate detector coverage and bypasses, formalize authorization and provider egress policy, add independent security testing, and obtain a professional threat-model review. Never place provider API keys in browser code.
