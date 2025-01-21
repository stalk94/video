import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import translationEN from './locales/en.json';
import translationRU from './locales/ru.json';
import translationCN from './locales/cn.json';
import translationDE from './locales/de.json';

i18n
    .use(initReactI18next)
    .init({
        resources: {
            GB: { translation: translationEN },
            RU: { translation: translationRU },
            CN: { translation: translationCN },
            DE: { translation: translationDE }
        },
        lng: 'RU',              // язык по умолчанию
        fallbackLng: 'GB',      // запасной язык, если перевод отсутствует
        interpolation: {
            escapeValue: false,     // для безопасности от XSS
        },
});

export default i18n;