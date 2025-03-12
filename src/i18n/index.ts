import { createI18n } from 'vue-i18n'
import en from './locales/en';
import pl from './locales/pl';
import de from './locales/de'
import fr from './locales/fr'
import it from './locales/it'
import es from './locales/es'

const i18n = createI18n({
  legacy: false, // ustawienie na false, aby używać Composition API
  locale: 'en', // domyślny język
  fallbackLocale: 'en', // język używany, gdy tłumaczenie nie istnieje
  messages: {
    en,
    pl,
    de,
    fr,
    it,
    es
  },
})

export default i18n;
