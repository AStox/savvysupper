export interface CompletionResponse {
  message: string;
}

export interface CompletionRequestOptions {
  chatHistory: any[];
  jsonFormat?: boolean;
}

export enum CompletionServiceType {
  OPENAI = "openai",
  ANTHROPIC = "anthropic",
  GOOGLE = "google",
}

export interface CompletionService {
  getCompletion(options: CompletionRequestOptions): Promise<CompletionResponse>;
}
