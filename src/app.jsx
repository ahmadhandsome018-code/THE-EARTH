import React, { useState } from "react";

const translations = {
  ar: {
    direction: "rtl",
    eyebrow: "عالم واحد • فرص بلا حدود",
    title: "THE EARTH",
    subtitle: "عِش عالمك. ابنِ مدينتك. اصنع مستقبلك.",
    description:
      "عالم افتراضي مفتوح يجمع بين الحياة الاجتماعية والبناء والتجارة والاستكشاف وإدارة المدن.",
    enter: "استكشف العالم",
    status: "مرحلة التأسيس",
    statusText: "يجري بناء أساس العالم الافتراضي",
    featuresTitle: "عالمك، بقواعدك",
    features: [
      {
        icon: "🌍",
        title: "عالم مفتوح",
        text: "استكشف المناطق والمدن والبيئات المختلفة.",
      },
      {
        icon: "🏗️",
        title: "البناء والتملك",
        text: "امتلك الأراضي وأنشئ المباني والمشروعات.",
      },
      {
        icon: "💼",
        title: "الاقتصاد والأعمال",
        text: "أنشئ أعمالك وشارك في اقتصاد العالم.",
      },
      {
        icon: "🏛️",
        title: "إدارة المدن",
        text: "شارك في تطوير المدن وصناعة القرارات.",
      },
    ],
    roadmap: "رحلة بناء THE EARTH",
    roadmapText: "نعمل على بناء العالم خطوة بخطوة.",
    phase: "المرحلة الأولى",
    phaseText: "تأسيس المشروع والبيئة التقنية",
    footer: "THE EARTH © 2026 — عالمك يبدأ من هنا",
    language: "English",
  },

  en: {
    direction: "ltr",
    eyebrow: "ONE WORLD • UNLIMITED POSSIBILITIES",
    title: "THE EARTH",
    subtitle: "Live your world. Build your city. Shape your future.",
    description:
      "An open virtual world combining social life, construction, commerce, exploration, and city management.",
    enter: "Explore the World",
    status: "Foundation Phase",
    statusText: "The foundations of the virtual world are being built.",
    featuresTitle: "Your World, Your Rules",
    features: [
      {
        icon: "🌍",
        title: "Open World",
        text: "Explore different regions, cities, and environments.",
      },
      {
        icon: "🏗️",
        title: "Build & Own",
        text: "Own land and create buildings and projects.",
      },
      {
        icon: "💼",
        title: "Economy & Business",
        text: "Create businesses and participate in the world economy.",
      },
      {
        icon: "🏛️",
        title: "City Management",
        text: "Help develop cities and participate in decisions.",
      },
    ],
    roadmap: "The THE EARTH Journey",
    roadmapText: "We are building the world step by step.",
    phase: "Phase One",
    phaseText: "Project foundation and technical environment",
    footer: "THE EARTH © 2026 — Your world starts here",
    language: "العربية",
  },
};

export default function App() {
  const [language, setLanguage] = useState("ar");
  const [showDetails, setShowDetails] = useState(false);

  const content = translations[language];

  return (
    <main className="app" dir={content.direction}>
      <header className="topbar">
        <a className="brand" href="#home">
          <span className="brand-symbol">E</span>
          <span>THE EARTH</span>
        </a>

        <button
          className="language-button"
          onClick={() =>
            setLanguage((current) => (current === "ar" ? "en" : "ar"))
          }
          type="button"
        >
          🌐 {content.language}
        </button>
      </header>

      <section className="hero" id="home">
        <div className="hero-background" aria-hidden="true">
          <div className="planet planet-one" />
          <div className="planet planet-two" />
          <div className="grid-overlay" />
        </div>

        <div className="hero-content">
          <div className="eyebrow">
            <span className="status-dot" />
            {content.eyebrow}
          </div>

          <h1>{content.title}</h1>

          <h2>{content.subtitle}</h2>

          <p>{content.description}</p>

          <button
            className="primary-button"
            onClick={() => setShowDetails((current) => !current)}
            type="button"
          >
            {content.enter}
            <span className="button-arrow">
              {language === "ar" ? "←" : "→"}
            </span>
          </button>

          {showDetails && (
            <div className="coming-soon">
              <strong>{content.status}</strong>
              <span>{content.statusText}</span>
            </div>
          )}
        </div>

        <div className="hero-bottom">
          <span>01 / THE BEGINNING</span>
          <span>BUILDING A NEW WORLD</span>
        </div>
      </section>

      <section className="features-section">
        <div className="section-heading">
          <span className="section-label">THE WORLD</span>
          <h2>{content.featuresTitle}</h2>
        </div>

        <div className="features-grid">
          {content.features.map((feature, index) => (
            <article className="feature-card" key={feature.title}>
              <div className="feature-number">
                0{index + 1}
              </div>

              <div className="feature-icon">{feature.icon}</div>

              <h3>{feature.title}</h3>

              <p>{feature.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="roadmap-section">
        <div className="roadmap-content">
          <span className="section-label">OUR JOURNEY</span>

          <h2>{content.roadmap}</h2>

          <p>{content.roadmapText}</p>

          <div className="phase-card">
            <div className="phase-icon">⚙️</div>

            <div>
              <strong>{content.phase}</strong>
              <p>{content.phaseText}</p>
            </div>

            <span className="phase-status">
              {language === "ar" ? "قيد العمل" : "In Progress"}
            </span>
          </div>
        </div>
      </section>

      <footer className="footer">
        <div className="brand footer-brand">
          <span className="brand-symbol">E</span>
          <span>THE EARTH</span>
        </div>

        <p>{content.footer}</p>
      </footer>
    </main>
  );
}
