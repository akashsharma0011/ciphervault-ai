# CipherVault AI — Devpost Demo Storyboard

## Format and intent

Landscape product walkthrough, 1920×1080 H.264 MP4 with English narration and captions. The edit uses authentic screenshots from the production Next.js interface. All credentials and attack prompts shown are synthetic examples. The external model connection remains off throughout; no provider calls are represented as live output.

## Sequence

1. **Hook — tokenized payload:** Open on the real sanitized prompt panel, with the fake API key replaced by a `[SECRET_001]` placeholder.
2. **Prompt entry:** Show the local demo workspace and sample prompt before inspection.
3. **Detection and tokenization:** Show the local match, placeholder trace, encrypted-in-memory status, and demo-only boundary note.
4. **Local response:** Show the canned response and explicit indication that the payload is not sent to a model.
5. **Vault boundary:** Show the ephemeral Web Crypto vault and local-only, non-exportable-key status; retain its prototype limitations.
6. **Attack lab:** Run the eight fixed policy fixtures and show the exact curated result, not a generalized success claim.
7. **Audit and flow:** Show metadata-only events and the intended user → CipherVault → policy layer → model-off flow.
8. **Limitations and close:** Keep provider status visibly off and end on the CipherVault wordmark with a synthetic-data reminder.

## Source files

- `narration.txt` is the spoken script/transcript.
- `frames/` contains real app captures used to edit the video.
- `ciphervault-devpost-demo.mp4` is the finished captioned walkthrough.

The video describes a browser-local prototype and a narrow set of curated examples. It is not a security certification, penetration-test report, or evidence of live LLM connectivity.
