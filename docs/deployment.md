# Container deployment

This project uses the existing Webdev server capability; it needs no database, provider API key, or other runtime secret. A root `Dockerfile` installs the lockfile using pnpm 11.25.0 and the checked-in `pnpm-workspace.yaml` build policy, compiles the Next.js application, and runs its production server. The image declares port 3000 and the `start` script binds to `0.0.0.0` while honoring `PORT` (falling back to 3000).

The Webdev `deploy` contract points to `Dockerfile` and uses `/` as its unauthenticated health route; the existing App Router home page responds there. The container build performed from the canonical Git checkpoint is the publication integration check. This Sandbox has no Docker engine, so no local container image build is claimed.

The site remains a local-only product simulation. It does not connect to an external LLM, and browser-side encryption is not a production key-isolation boundary. A real AI gateway would need a separately designed and reviewed server-side threat model, custody boundary, authorization controls, and integration before processing real secrets.
