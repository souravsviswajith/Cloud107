# HyperCloud107 AI Gateway

The AI gateway is an optional, authenticated provider adapter. It does not run unless a provider key is configured; no paid provider is enabled by default.

## Endpoints

All endpoints are under `/api/v1/ai` and require the existing Cloud107 bearer-token authentication.

- `GET /providers`: provider names and configured model IDs (never returns secrets).
- `GET /usage`: process-local usage and configured budget limits for the authenticated user.
- `POST /chat`: non-streaming chat completion.

Example request:

```json
{
  "messages": [
    { "role": "system", "content": "You are a coding assistant." },
    { "role": "user", "content": "Explain this error." }
  ],
  "maxTokens": 512,
  "temperature": 0.2
}
```

## Provider routing

Set `AI_PROVIDER_ORDER=glm,openai-compatible` to try GLM first and then the explicitly configured OpenAI-compatible fallback. The default is `glm`. A provider is considered configured only when its API key is present. Provider failures are logged with correlation IDs and a sanitized response is returned to the caller.

GLM defaults to `https://api.z.ai/api/paas/v4` and model ID `glm-5.2`; verify the model ID and account access with the provider before enabling production traffic. Alternate deployments can set `GLM_BASE_URL` and `GLM_MODEL`.

## Budget controls and limitations

- Defaults: USD 0.25 per user per UTC day and USD 0.05 estimated per request.
- Set provider input/output rates using the `*_USD_PER_MILLION` variables. Values default to zero, so configure real rates before relying on monetary budget enforcement.
- Preflight estimates use character-based token approximations. Actual usage uses provider-reported token counts when available.
- The ledger is in-memory and per process. It resets on restart and is not safe as a global spending cap across replicas. For multi-instance deployments, move reservation and settlement into a shared transactional store (for example PostgreSQL) before production use.
- No retry is performed against the same provider. Fallback proceeds only to providers explicitly listed in `AI_PROVIDER_ORDER`.
- Do not send secrets or sensitive personal data in prompts. Provider terms, retention, data residency, and account billing remain provider-controlled.

## Security

The endpoints use the existing `requireAuth` middleware. Requests are schema-validated, limited to 40 messages and 20,000 characters per message, constrained to supported roles, and capped at 2,048 output tokens by default. API keys are server-side environment variables only. Add rate limiting at the API gateway or reverse proxy before public exposure.

## Local configuration

See `.env.example`. Never commit real provider credentials.
