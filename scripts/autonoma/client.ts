import type { AutonomaConfig } from "./config.ts";

export type SetupRecord = {
  id: string;
  applicationId?: string;
  repoName?: string;
  status?: string;
  createdAt?: string;
};

export type SecretListResponse = {
  keys?: string[];
};

export class AutonomaApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly body: string,
  ) {
    super(message);
    this.name = "AutonomaApiError";
  }
}

export class AutonomaClient {
  constructor(private readonly config: AutonomaConfig) {}

  private async request<T>(
    method: string,
    path: string,
    body?: unknown,
  ): Promise<T> {
    const url = `${this.config.apiUrl}${path}`;
    const response = await fetch(url, {
      method,
      headers: {
        Authorization: `Bearer ${this.config.apiKey}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: body === undefined ? undefined : JSON.stringify(body),
    });

    const text = await response.text();
    if (!response.ok) {
      throw new AutonomaApiError(
        `Autonoma API ${method} ${path} failed (${response.status})`,
        response.status,
        text,
      );
    }

    if (!text) return undefined as T;
    try {
      return JSON.parse(text) as T;
    } catch {
      return text as T;
    }
  }

  async verify(): Promise<{ ok: true; apiUrl: string; applicationId: string }> {
    await this.request("GET", `/v1/previewkit/secrets/${this.config.applicationId}/_probe`);
    return { ok: true, apiUrl: this.config.apiUrl, applicationId: this.config.applicationId };
  }

  async createSetup(repoName: string): Promise<SetupRecord> {
    return this.request<SetupRecord>("POST", "/v1/setup/setups", {
      applicationId: this.config.applicationId,
      repoName,
    });
  }

  async getSetup(setupId: string): Promise<SetupRecord> {
    return this.request<SetupRecord>("GET", `/v1/setup/setups/${setupId}`);
  }

  async emitEvent(
    setupId: string,
    type: string,
    data: Record<string, unknown>,
  ): Promise<void> {
    await this.request("POST", `/v1/setup/setups/${setupId}/events`, { type, data });
  }

  async uploadArtifacts(
    setupId: string,
    payload: Record<string, unknown>,
  ): Promise<void> {
    await this.request("POST", `/v1/setup/setups/${setupId}/artifacts`, payload);
  }

  async uploadScenarioRecipes(
    setupId: string,
    recipes: Record<string, unknown>,
  ): Promise<void> {
    await this.request(
      "POST",
      `/v1/setup/setups/${setupId}/scenario-recipe-versions`,
      recipes,
    );
  }

  async listSecrets(appName: string): Promise<string[]> {
    const result = await this.request<SecretListResponse>(
      "GET",
      `/v1/previewkit/secrets/${this.config.applicationId}/${appName}`,
    );
    return result.keys ?? [];
  }

  async upsertSecrets(
    appName: string,
    items: Array<{ key: string; value: string }>,
  ): Promise<void> {
    await this.request(
      "PUT",
      `/v1/previewkit/secrets/${this.config.applicationId}/${appName}`,
      { items },
    );
  }

  async upsertSecret(appName: string, key: string, value: string): Promise<void> {
    await this.request(
      "PUT",
      `/v1/previewkit/secrets/${this.config.applicationId}/${appName}/${encodeURIComponent(key)}`,
      { value },
    );
  }

  async deleteSecret(appName: string, key: string): Promise<void> {
    await this.request(
      "DELETE",
      `/v1/previewkit/secrets/${this.config.applicationId}/${appName}/${encodeURIComponent(key)}`,
    );
  }
}