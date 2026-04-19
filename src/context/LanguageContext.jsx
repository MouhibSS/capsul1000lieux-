import { createContext, useContext, useState } from 'react'
import { translations } from '../i18n/translations'

const LanguageContext = createContext()

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(() => localStorage.getItem('capsul_lang') || null)

  const choose = (newLang) => {
    setLang(newLang)
    localStorage.setItem('capsul_lang', newLang)
  }

  return (
    <LanguageContext.Provider value={{ lang: lang || 'en', choose, chosen: !!lang }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider')
  }
  return context
}

export function useTranslation(namespace) {
  const { lang } = useLanguage()
  return translations[lang][namespace] || {}
}
