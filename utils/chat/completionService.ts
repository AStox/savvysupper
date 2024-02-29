export interface CompletionResponse {
  message: string;
}

export interface CompletionRequestOptions {
  chatHistory: any[];
  jsonFormat?: boolean;
}

export interface CompletionService {
  getCompletion(options: CompletionRequestOptions): Promise<CompletionResponse>;
}
