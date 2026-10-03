import { createContext, useContext, useEffect, useState } from "react";

const LanguageContext = createContext();

const LANGUAGES = {
    en: "English",
    hi: "हिन्दी",
    bn: "বাংলা",
    ta: "தமிழ்",
    te: "తెలుగు",
    mr: "मराठी",
    gu: "ગુજરાતી",
    kn: "ಕನ್ನಡ",
    es: "Español",
    fr: "Français",
    de: "Deutsch",
};

export function LanguageProvider({ children }) {
    const [language, setLanguage] = useState(
        localStorage.getItem("upskillyfy-language") || "en"
    );

    useEffect(() => {
        localStorage.setItem("upskillyfy-language", language);
        document.documentElement.lang = language;
    }, [language]);

    const changeLanguage = (lang) => {
        setLanguage(lang);

        /*
          Google Translate cookie.
          This makes the selected language persist and lets Google Translate
          translate the complete website.
        */
        document.cookie = `googtrans=/en/${lang};path=/`;
        document.cookie = `googtrans=/en/${lang};path=/;domain=${window.location.hostname}`;

        const googleSelect = document.querySelector(".goog-te-combo");

        if (googleSelect) {
            googleSelect.value = lang;
            googleSelect.dispatchEvent(new Event("change"));
        } else {
            window.location.reload();
        }
    };

    return (
        <LanguageContext.Provider
            value={{
                language,
                changeLanguage,
                languages: LANGUAGES,
            }}
        >
            {children}
        </LanguageContext.Provider>
    );
}

export function useLanguage() {
    return useContext(LanguageContext);
}