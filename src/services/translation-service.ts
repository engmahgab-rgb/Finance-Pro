import type { AppSettings, TranslationMap } from '../core/types';

export type TranslationLanguage = 'en' | 'ar';

export interface TranslationRequest {
  text: string;
  sourceLanguage: TranslationLanguage;
  targetLanguage: TranslationLanguage;
}

/**
 * Calls a user-configured secure proxy only after a deliberate UI action.
 * API credentials must stay on that server; never put a translation key in the PWA.
 */
export async function translateExplicitly(settings: AppSettings, request: TranslationRequest): Promise<string> {
  if (!settings.translationEndpoint) throw new Error('Translation is not configured. Add your secure translation endpoint in Settings.');
  if (!request.text.trim()) return '';
  if (request.sourceLanguage === request.targetLanguage) return request.text;
  const response = await fetch(settings.translationEndpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(request) });
  if (!response.ok) throw new Error('Translation service is unavailable. Your original text was not changed.');
  const payload: unknown = await response.json();
  if (!payload || typeof payload !== 'object' || typeof (payload as { translation?: unknown }).translation !== 'string') throw new Error('Translation service returned an invalid response.');
  return (payload as { translation: string }).translation;
}

export function withTranslation(translations: TranslationMap | undefined, language: TranslationLanguage, translatedText: string): TranslationMap {
  return { ...translations, [language]: translatedText };
}
