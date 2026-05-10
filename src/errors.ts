export class LaddroAPIError extends Error {
  readonly status: number;
  readonly code?: string;

  constructor(message: string, status: number, code?: string) {
    super(message);
    this.name = "LaddroAPIError";
    this.status = status;
    this.code = code;
  }
}

export class LaddroAuthError extends LaddroAPIError {
  constructor(message: string) {
    super(message, 401, "unauthorized");
    this.name = "LaddroAuthError";
  }
}

export class LaddroUsageLimitError extends LaddroAPIError {
  constructor(message: string) {
    super(message, 402, "usage_limit");
    this.name = "LaddroUsageLimitError";
  }
}

export class LaddroNotFoundError extends LaddroAPIError {
  constructor(message: string) {
    super(message, 404, "not_found");
    this.name = "LaddroNotFoundError";
  }
}
