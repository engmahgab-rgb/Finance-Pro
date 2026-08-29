export type AppLanguage = 'en' | 'ar';

const messages = {
  en: { notEnoughData: 'Not enough data yet', income: 'Income', expenses: 'Expenses', transfer: 'Transfer money', upcoming: 'Upcoming', noUpcoming: 'No upcoming recurring payments.' },
  ar: { notEnoughData: 'لا توجد بيانات كافية بعد', income: 'الدخل', expenses: 'المصروفات', transfer: 'تحويل الأموال', upcoming: 'القادم', noUpcoming: 'لا توجد دفعات دورية قادمة.' },
} as const;

export function translate(language: AppLanguage, key: keyof typeof messages.en): string { return messages[language][key]; }
export function direction(language: AppLanguage): 'ltr' | 'rtl' { return language === 'ar' ? 'rtl' : 'ltr'; }
export function formatMoney(value: number, language: AppLanguage = 'en'): string { return new Intl.NumberFormat(language === 'ar' ? 'ar-SA' : 'en-SA', { style: 'currency', currency: 'SAR', maximumFractionDigits: 2 }).format(value); }
