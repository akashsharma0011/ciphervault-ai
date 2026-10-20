# CipherVault AI — Devpost Demo Video

The finished walkthrough is [`ciphervault-devpost-demo.mp4`](ciphervault-devpost-demo.mp4): 3:01, landscape, 1920×1080, 30 fps, H.264 video with AAC stereo narration. English captions are burned into the MP4. [`captions.srt`](captions.srt) is included as a separate subtitle/transcript file; [`captions.ass`](captions.ass) records the full-resolution caption styling used in the render.

The capture follows the running Next.js interface through sample credential tokenization, the temporary local vault, eight curated policy fixtures, security events, the data-flow view, and policy limitations. The narration and end card clearly state that the model provider is disconnected, the sample data is synthetic, the attack run is limited to its selected fixtures, and the demo is not a security certification.

## Source assets

- `narration.txt` — the spoken script.
- `audio-01.wav`–`audio-05.wav` — narration segments used in the final soundtrack.
- `captions.srt` / `captions.ass` — caption source and styled render version.
- `frames/` — real interface captures and the closing card used to open/close the walkthrough.
- `ciphervault-devpost-demo.mp4` — final, playable submission video.

Use synthetic data only. No real API key is shown or needed. The application does not send prompts to an external LLM; its displayed answers and attack results are local demonstrations only.