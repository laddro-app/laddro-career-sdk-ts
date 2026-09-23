# @laddro/career-sdk

## 0.3.0

### Minor Changes

- ba34c58: Expose artifact metadata on detailed binary responses.

### Patch Changes

- ba34c58: Remove `templates.models()` and the `ModelProvider`/`Model` types.

  `GET /v1/models` is not a route laddro-career-api serves. Its registered public
  endpoints are `/v1/templates`, `/v1/templates/{id}`, `/v1/fonts` and
  `/v1/languages`; there is no models handler anywhere in the repo, and the live
  API answers 404. The method has been calling a URL that does not exist, and the
  three tests asserting "10+ providers, OpenAI, Anthropic" have been failing
  against production since at least 2026-09-09 - which is what kept this PR's
  test job red and the branch unmergeable.

  Same removal as laddro-career-mcp#36 does for its four BYOK tools: the
  endpoints behind them were deleted in June and the clients were never told.

## 0.2.0

### Minor Changes

- 14add29: Expose artifact metadata on detailed binary responses.
