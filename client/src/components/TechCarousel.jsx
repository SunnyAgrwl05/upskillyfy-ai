import { Link } from 'react-router-dom'
import './TechCarousel.css'

const CARDS = [
    {
        id: 1,
        type: 'dark',
        eyebrow: 'MODERN DEVELOPMENT',
        title: 'Full Stack Development',
        desc: 'Master modern technologies and build scalable web applications with industry best practices.',
        link: '/services/it-services',
        visual: 'code',
    },
    {
        id: 2,
        type: 'light',
        eyebrow: 'AI & MACHINE LEARNING',
        title: 'AI-Powered Future',
        desc: 'Explore AI, ML and Data Science. Build intelligent solutions and shape the future.',
        link: '/services/ai-automation',
        visual: 'ai',
    },
    {
        id: 3,
        type: 'green',
        eyebrow: '3D & DESIGN',
        title: 'Design. Model. Create.',
        desc: 'Learn 3D modeling, animation and product design. Turn your ideas into stunning visuals.',
        link: '/services/uiux',
        visual: 'robot',
    },
    {
        id: 4,
        type: 'cloud',
        eyebrow: 'CLOUD & DEVOPS',
        title: 'Cloud Native Solutions',
        desc: 'Deploy, scale and manage applications with modern Cloud & DevOps practices.',
        link: '/services/cloud',
        visual: 'cloud',
    },
    {
        id: 5,
        type: 'purple',
        eyebrow: 'CYBERSECURITY',
        title: 'Secure the Future',
        desc: 'Learn ethical hacking, application security, networking and modern cyber defense.',
        link: '/services/it-support',
        visual: 'security',
    },
    {
        id: 6,
        type: 'orange',
        eyebrow: 'DATA & ANALYTICS',
        title: 'Data Driven Growth',
        desc: 'Transform raw data into meaningful insights using analytics, SQL and visualization.',
        link: '/learning/courses',
        visual: 'data',
    },
    {
        id: 7,
        type: 'blue',
        eyebrow: 'MOBILE DEVELOPMENT',
        title: 'Build for Every Screen',
        desc: 'Create modern mobile experiences and cross-platform applications.',
        link: '/services/it-services',
        visual: 'mobile',
    },
    {
        id: 8,
        type: 'pink',
        eyebrow: 'UI / UX DESIGN',
        title: 'Experiences That Matter',
        desc: 'Design beautiful, accessible and conversion-focused digital experiences.',
        link: '/services/uiux',
        visual: 'design',
    },
    {
        id: 9,
        type: 'dark',
        eyebrow: 'DEVOPS & AUTOMATION',
        title: 'Ship Faster. Scale Smarter.',
        desc: 'Automate development workflows, CI/CD pipelines and cloud infrastructure.',
        link: '/services/cloud',
        visual: 'devops',
    },
    {
        id: 10,
        type: 'light',
        eyebrow: 'CAREER & OPPORTUNITIES',
        title: 'Turn Skills Into Careers',
        desc: 'Internships, projects, placement preparation and real-world opportunities.',
        link: '/career/internships',
        visual: 'career',
    },
]

function Visual({ type }) {
    if (type === 'code') {
        return (
            <div className="tc-visual tc-code-visual">
                <div className="tc-code-window">
                    <div className="tc-window-dots">
                        <span />
                        <span />
                        <span />
                    </div>

                    <div className="tc-code-lines">
                        <i />
                        <i />
                        <i />
                        <i />
                        <i />
                    </div>
                </div>

                <div className="tc-floating-icon tc-react">⚛</div>
                <div className="tc-floating-icon tc-js">JS</div>
                <div className="tc-floating-icon tc-ts">TS</div>
                <div className="tc-floating-icon tc-brackets">&lt;/&gt;</div>
            </div>
        )
    }

    if (type === 'ai') {
        return (
            <div className="tc-visual tc-ai-visual">
                <div className="tc-ai-orbit orbit-one" />
                <div className="tc-ai-orbit orbit-two" />
                <div className="tc-ai-core">
                    <span>✦</span>
                </div>

                <div className="tc-ai-node node-one">AI</div>
                <div className="tc-ai-node node-two">ML</div>
                <div className="tc-ai-node node-three">✦</div>
            </div>
        )
    }

    if (type === 'robot') {
        return (
            <div className="tc-visual tc-robot-visual">
                <div className="tc-robot-glow" />
                <div className="tc-robot">
                    <div className="tc-robot-head">
                        <span />
                        <span />
                    </div>
                    <div className="tc-robot-body">
                        <i />
                    </div>
                    <div className="tc-robot-foot left" />
                    <div className="tc-robot-foot right" />
                </div>

                <div className="tc-cube cube-one" />
                <div className="tc-cube cube-two" />
            </div>
        )
    }

    if (type === 'cloud') {
        return (
            <div className="tc-visual tc-cloud-visual">
                <div className="tc-cloud-shape">
                    <span />
                    <span />
                    <span />
                </div>

                <div className="tc-server">
                    <div />
                    <div />
                    <div />
                </div>

                <div className="tc-cloud-line line-one" />
                <div className="tc-cloud-line line-two" />
                <div className="tc-cloud-line line-three" />
            </div>
        )
    }

    if (type === 'security') {
        return (
            <div className="tc-visual tc-security-visual">
                <div className="tc-shield">
                    <div className="tc-shield-inner">✓</div>
                </div>

                <div className="tc-security-ring ring-one" />
                <div className="tc-security-ring ring-two" />
                <div className="tc-security-dot sd-one" />
                <div className="tc-security-dot sd-two" />
                <div className="tc-security-dot sd-three" />
            </div>
        )
    }

    if (type === 'data') {
        return (
            <div className="tc-visual tc-data-visual">
                <div className="tc-data-bars">
                    <span style={{ height: '35%' }} />
                    <span style={{ height: '55%' }} />
                    <span style={{ height: '78%' }} />
                    <span style={{ height: '48%' }} />
                    <span style={{ height: '92%' }} />
                </div>

                <div className="tc-data-line">
                    <i />
                    <i />
                    <i />
                    <i />
                    <i />
                </div>

                <div className="tc-data-orb">◈</div>
            </div>
        )
    }

    if (type === 'mobile') {
        return (
            <div className="tc-visual tc-mobile-visual">
                <div className="tc-phone">
                    <div className="tc-phone-camera" />
                    <div className="tc-phone-screen">
                        <div />
                        <div />
                        <div />
                    </div>
                </div>

                <div className="tc-mobile-orb orb-a" />
                <div className="tc-mobile-orb orb-b" />
            </div>
        )
    }

    if (type === 'design') {
        return (
            <div className="tc-visual tc-design-visual">
                <div className="tc-design-circle circle-a" />
                <div className="tc-design-circle circle-b" />
                <div className="tc-design-square" />
                <div className="tc-design-cross">+</div>
                <div className="tc-design-cursor">↗</div>
            </div>
        )
    }

    if (type === 'devops') {
        return (
            <div className="tc-visual tc-devops-visual">
                <div className="tc-devops-center">∞</div>

                <div className="tc-devops-node dn-one">CI</div>
                <div className="tc-devops-node dn-two">CD</div>
                <div className="tc-devops-node dn-three">⚙</div>
                <div className="tc-devops-node dn-four">☁</div>

                <div className="tc-devops-ring" />
            </div>
        )
    }

    return (
        <div className="tc-visual tc-career-visual">
            <div className="tc-career-person">
                <div className="tc-head" />
                <div className="tc-body" />
            </div>

            <div className="tc-career-star star-one">★</div>
            <div className="tc-career-star star-two">✦</div>
            <div className="tc-career-star star-three">✧</div>

            <div className="tc-career-platform" />
        </div>
    )
}

function TechCard({ card }) {
    return (
        <Link
            to={card.link}
            className={`tc-card tc-${card.type}`}
            aria-label={card.title}
        >
            <div className="tc-content">
                <div className="tc-eyebrow">{card.eyebrow}</div>

                <h3>{card.title}</h3>

                <p>{card.desc}</p>

                <div className="tc-arrow">
                    <span>→</span>
                </div>
            </div>

            <Visual type={card.visual} />
        </Link>
    )
}

export default function TechCarousel() {
    const loopCards = [...CARDS, ...CARDS]

    return (
        <section className="tech-section">
            <div className="tech-heading">
                <div className="eyebrow">EXPLORE THE UPSKILLYFY UNIVERSE</div>

                <h2>
                    Learn. Build. <span className="grad">Create.</span>
                </h2>

                <p>
                    Explore technology, AI, cloud, design and career paths —
                    all in one place.
                </p>
            </div>

            <div className="tech-carousel-wrap">
                <div className="tech-fade tech-fade-left" />
                <div className="tech-fade tech-fade-right" />

                <div className="tech-track">
                    {loopCards.map((card, index) => (
                        <TechCard
                            key={`${card.id}-${index}`}
                            card={card}
                        />
                    ))}
                </div>
            </div>

            <div className="tech-carousel-meta">
                <span className="tech-meta-dot" />
                <span>Auto exploring</span>
                <span className="tech-meta-line" />
                <span>{CARDS.length} technology paths</span>
            </div>
        </section>
    )
}