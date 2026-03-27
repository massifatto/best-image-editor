export type AIActionStatus = 'idle' | 'loading' | 'success' | 'error';

export interface AIActionParam {
  key: string;
  label: string;
  type: 'text' | 'number' | 'select' | 'slider' | 'textarea';
  default: string | number;
  options?: { label: string; value: string }[];
  min?: number;
  max?: number;
  step?: number;
  placeholder?: string;
}

export interface AIActionMeta {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'generate' | 'enhance' | 'transform' | 'remove';
  params: AIActionParam[];
  requiresImage: boolean;
  isStub?: boolean;
}

export interface AIActionResult {
  imageDataUrl?: string;
  error?: string;
}

export interface IAIAction {
  meta: AIActionMeta;
  execute(
    imageDataUrl: string | null,
    params: Record<string, string | number>,
  ): Promise<AIActionResult>;
}

export interface AIProviderConfig {
  provider: string;
  apiKey: string;
  endpoint?: string;
}
