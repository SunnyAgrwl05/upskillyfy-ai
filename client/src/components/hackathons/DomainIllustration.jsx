const DOMAIN_THEMES = {
  ai: { label: 'AI / ML', accent: '#5d8ff2', secondary: '#172d61', motif: 'neural' },
  'ai-ml': { label: 'AI / ML', accent: '#5d8ff2', secondary: '#172d61', motif: 'neural' },
  healthcare: { label: 'Healthcare', accent: '#3bbf9a', secondary: '#123d42', motif: 'cross' },
  health: { label: 'Healthcare', accent: '#3bbf9a', secondary: '#123d42', motif: 'cross' },
  fintech: { label: 'FinTech', accent: '#f0b44d', secondary: '#4b2f21', motif: 'bars' },
  climate: { label: 'Climate', accent: '#67c98a', secondary: '#173f36', motif: 'terrain' },
  sustainability: { label: 'Climate', accent: '#67c98a', secondary: '#173f36', motif: 'terrain' },
  'climate-sustainability': { label: 'Climate', accent: '#67c98a', secondary: '#173f36', motif: 'terrain' },
  education: { label: 'Education', accent: '#f18b68', secondary: '#542d3e', motif: 'book' },
  web3: { label: 'Web3', accent: '#a98cf5', secondary: '#30235b', motif: 'nodes' },
  robotics: { label: 'Robotics', accent: '#79c7e8', secondary: '#193c56', motif: 'robot' },
  'smart-cities': { label: 'Smart Cities', accent: '#f2a45d', secondary: '#4d3025', motif: 'city' },
  cybersecurity: { label: 'Cybersecurity', accent: '#64d5d3', secondary: '#123c4b', motif: 'shield' },
  'cyber-security': { label: 'Cybersecurity', accent: '#64d5d3', secondary: '#123c4b', motif: 'shield' },
  agriculture: { label: 'Agriculture', accent: '#b2d16b', secondary: '#314b2b', motif: 'leaf' },
}

function themeFor(domain) {
  const key = String(domain || '').toLowerCase().replace(/[\s/&]+/g, '-')
  return DOMAIN_THEMES[key] || { label: 'Innovation', accent: '#8eb4f5', secondary: '#203b68', motif: 'spark' }
}

function Motif({ type, accent }) {
  if (type === 'neural') return <><circle cx="500" cy="82" r="13" fill={accent} /><circle cx="556" cy="138" r="10" fill={accent} /><circle cx="448" cy="162" r="9" fill={accent} /><path d="M500 82l56 56M500 82l-52 80M448 162l108-24" stroke={accent} strokeWidth="4" opacity=".8" /></>
  if (type === 'cross') return <><rect x="484" y="58" width="36" height="128" rx="8" fill={accent} /><rect x="438" y="104" width="128" height="36" rx="8" fill={accent} /></>
  if (type === 'bars') return <><path d="M438 190v-58h26v58M478 190V92h26v98M518 190V48h26v142" fill={accent} opacity=".9" /><path d="M430 202h130" stroke="#fff" strokeWidth="3" opacity=".65" /></>
  if (type === 'terrain') return <><path d="M390 206l62-72 38 38 44-92 82 126z" fill={accent} opacity=".86" /><path d="M390 206h226" stroke="#fff" strokeWidth="3" opacity=".55" /></>
  if (type === 'book') return <><path d="M430 72h66c20 0 34 8 34 27v96c-12-10-25-14-42-14h-58z" fill={accent} /><path d="M530 99c0-19 14-27 34-27h38v109h-38c-17 0-30 4-34 14z" fill="#fff" opacity=".86" /></>
  if (type === 'nodes') return <><circle cx="500" cy="110" r="28" fill={accent} /><circle cx="438" cy="184" r="18" fill={accent} /><circle cx="570" cy="184" r="18" fill={accent} /><path d="M483 132l-32 40M517 132l36 40" stroke={accent} strokeWidth="7" /></>
  if (type === 'robot') return <><rect x="444" y="82" width="112" height="112" rx="22" fill={accent} /><circle cx="477" cy="132" r="10" fill="#163250" /><circle cx="523" cy="132" r="10" fill="#163250" /><path d="M477 164h46M500 82V56" stroke="#fff" strokeWidth="7" strokeLinecap="round" /><circle cx="500" cy="48" r="8" fill={accent} /></>
  if (type === 'city') return <><path d="M430 206V108h42v98M482 206V62h42v144M534 206V92h48v114" fill={accent} opacity=".9" /><path d="M442 128h18M442 151h18M494 85h18M494 110h18M546 116h22M546 140h22" stroke="#fff" strokeWidth="4" opacity=".75" /></>
  if (type === 'shield') return <><path d="M500 46l75 28v54c0 52-32 81-75 99-43-18-75-47-75-99V74z" fill={accent} /><path d="M466 130l24 24 48-52" fill="none" stroke="#153b4a" strokeWidth="10" strokeLinecap="round" strokeLinejoin="round" /></>
  if (type === 'leaf') return <><path d="M500 202C438 184 422 124 446 72c58-8 92 25 86 82-5 27-16 39-32 48z" fill={accent} /><path d="M500 198c-6-44-24-77-54-101M500 173l45-37" fill="none" stroke="#314b2b" strokeWidth="7" strokeLinecap="round" /></>
  return <><circle cx="500" cy="125" r="56" fill="none" stroke={accent} strokeWidth="5" /><path d="M500 45v34M500 171v34M420 125h34M546 125h34" stroke={accent} strokeWidth="5" strokeLinecap="round" /><circle cx="500" cy="125" r="13" fill={accent} /></>
}

export default function DomainIllustration({ domain, title = 'Innovation', compact = false }) {
  const theme = themeFor(domain)
  const safeId = `${String(domain || 'innovation').toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${String(title || 'innovation').toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 24)}-${compact ? 'compact' : 'poster'}`
  return (
    <svg className="domain-illustration" viewBox="0 0 640 320" role="img" aria-label={`${theme.label} illustration for ${title}`}>
      <defs>
        <linearGradient id={`${safeId}-bg`} x1="0" x2="1" y1="0" y2="1">
          <stop offset="0" stopColor={theme.secondary} />
          <stop offset="1" stopColor="#0d1d39" />
        </linearGradient>
        <pattern id={`${safeId}-grid`} width="24" height="24" patternUnits="userSpaceOnUse">
          <path d="M24 0H0V24" fill="none" stroke="#fff" strokeOpacity=".12" />
        </pattern>
      </defs>
      <rect width="640" height="320" fill={`url(#${safeId}-bg)`} />
      <rect width="640" height="320" fill={`url(#${safeId}-grid)`} />
      <circle cx="520" cy="100" r="112" fill="none" stroke={theme.accent} strokeOpacity=".18" strokeWidth="2" />
      <circle cx="520" cy="100" r="78" fill="none" stroke={theme.accent} strokeOpacity=".16" />
      <Motif type={theme.motif} accent={theme.accent} />
      <text x="30" y="44" fill="#fff" fontSize="14" fontWeight="700" letterSpacing="3">UPSKILLYFY / INNOVATION</text>
      <text x="30" y="252" fill="#fff" fontSize="27" fontWeight="800">{theme.label}</text>
      <text x="30" y="278" fill="#fff" fillOpacity=".72" fontSize="12" fontWeight="700" letterSpacing="2">LEARN / BUILD / IMPACT</text>
    </svg>
  )
}
