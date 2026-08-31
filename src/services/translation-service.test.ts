import { describe, expect, it, vi } from 'vitest';
import { translateExplicitly, withTranslation } from './translation-service';

const settings = { id: 'app' as const, currency: 'SAR', darkMode: false, translationEndpoint: 'https://example.test/translate' };

describe('translation service', () => {
  it('does not translate without a configured endpoint', async () => {
    await expect(translateExplicitly({ ...settings, translationEndpoint: undefined }, { text: 'Groceries', sourceLanguage: 'en', targetLanguage: 'ar' })).rejects.toThrow('not configured');
  });

  it('sends text only for an explicit translation request', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(JSON.stringify({ translation: 'بقالة' }), { status: 200 }));
    await expect(translateExplicitly(settings, { text: 'Groceries', sourceLanguage: 'en', targetLanguage: 'ar' })).resolves.toBe('بقالة');
    expect(fetchMock).toHaveBeenCalledOnce();
    fetchMock.mockRestore();
  });

  it('keeps the original translation map intact', () => {
    expect(withTranslation({ en: 'Groceries' }, 'ar', 'بقالة')).toEqual({ en: 'Groceries', ar: 'بقالة' });
  });
});
