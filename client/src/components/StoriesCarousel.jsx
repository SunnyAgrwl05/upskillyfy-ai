import { useEffect, useRef, useState } from 'react'

const stories = [
  {
    name: 'Kajal Kumari',
    role: 'Upskillyfy learning journey',
    text: 'Learning, building and discovering new opportunities with the Upskillyfy AI ecosystem.',
    tag: 'Community member',
    gradient: 'linear-gradient(135deg, #1a73e8 0%, #4285f4 100%)',
    image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=600&q=80',
  },
  {
    name: 'Alok Raj',
    role: 'Building with Upskillyfy',
    text: 'Exploring practical learning paths, projects and opportunities designed for the next generation of builders.',
    tag: 'Community member',
    gradient: 'linear-gradient(135deg, #174ea6 0%, #1a73e8 100%)',
    image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80',
  },
  {
    name: 'Abhijeet Gupta',
    role: 'Growing through practical technology',
    text: 'Turning technical learning into practical projects and experiences through Upskillyfy.',
    tag: 'Community member',
    gradient: 'linear-gradient(135deg, #0b57d0 0%, #4285f4 100%)',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80',
  },
  {
    name: 'Shrestha Saran',
    role: 'Learning and building with Upskillyfy',
    text: 'Finding resources, challenges and opportunities that make the journey from learning to building easier.',
    tag: 'Community member',
    gradient: 'linear-gradient(135deg, #1557b0 0%, #34a853 100%)',
    image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=600&q=80',
  },
  {
    name: 'Tanya Gupta',
    role: 'Developing skills with Upskillyfy',
    text: 'Growing skills and staying connected with a community focused on learning, building and career growth.',
    tag: 'Community member',
    gradient: 'linear-gradient(135deg, #1a3fa0 0%, #7b61ff 100%)',
    image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=600&q=80',
  },
  {
    name: 'Shivam Kumar',
    role: 'Full Stack & AI Systems',
    text: 'Building scalable modern applications, mastering production tools, and growing with the community.',
    tag: 'Community member',
    gradient: 'linear-gradient(135deg, #0b8043 0%, #1a73e8 100%)',
    image: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=600&q=80',
  },
]

export default function StoriesCarousel({ names = ['Kajal Kumari', 'Alok Raj', 'Abhijeet Gupta', 'Shrestha Saran', 'Tanya Gupta', 'Shivam Kumar'] }) {
  const trackRef = useRef(null)

  const [progress, setProgress] = useState(0)
  const [atStart, setAtStart] = useState(true)
  const [atEnd, setAtEnd] = useState(false)

  const updateProgress = () => {
    const el = trackRef.current

    if (!el) return

    const maxScroll = el.scrollWidth - el.clientWidth

    if (maxScroll <= 0) {
      setProgress(100)
      setAtStart(true)
      setAtEnd(true)
      return
    }

    const currentProgress = (el.scrollLeft / maxScroll) * 100

    setProgress(currentProgress)
    setAtStart(el.scrollLeft <= 2)
    setAtEnd(el.scrollLeft >= maxScroll - 2)
  }

  useEffect(() => {
    updateProgress()

    const handleResize = () => {
      updateProgress()
    }

    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  const scrollCards = (direction) => {
    const el = trackRef.current

    if (!el) return

    const card = el.querySelector('.story-card')

    const cardWidth = card
      ? card.getBoundingClientRect().width + 24
      : 380

    el.scrollBy({
      left: direction * cardWidth,
      behavior: 'smooth',
    })
  }

  return (
    <div className="stories-wrap">

      <div
        ref={trackRef}
        className="story-track"
        onScroll={updateProgress}
      >
        {stories.map((story) => (
          <article key={story.name} className="story-card">

            <div className="story-body">

              <div className="story-eyebrow">{story.role}</div>

              <p className="story-text">{story.text}</p>

              <button
                type="button"
                className="story-link"
                onClick={() => {}}
              >
                {story.name} - {story.tag}
              </button>

            </div>

            <div
              className="story-media"
              style={{
                background: story.gradient,
              }}
            >
              {story.image && (
                <img
                  src={story.image}
                  alt={story.name}
                  className="story-img"
                  loading="lazy"
                />
              )}

              <div className="story-pattern">
                <span />
                <span />
                <span />
              </div>

              <div className="story-avatar">
                {story.image ? (
                  <img src={story.image} alt={story.name} className="story-avatar-img" />
                ) : (
                  story.name.charAt(0)
                )}
              </div>

              <div className="story-label">

                <span className="story-name">{story.name}</span>

                <span className="story-tag">{story.tag}</span>

              </div>

            </div>

          </article>
        ))}
      </div>

      <div className="stories-controls">

        <div className="story-progress">

          <div
            className="story-progress-bar"
            style={{
              width: `${Math.max(8, progress)}%`,
            }}
          />

        </div>

        <div className="story-arrows">

          <button
            type="button"
            className="story-arrow"
            onClick={() => scrollCards(-1)}
            disabled={atStart}
            aria-label="Previous story"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>

          <button
            type="button"
            className="story-arrow"
            onClick={() => scrollCards(1)}
            disabled={atEnd}
            aria-label="Next story"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M9 18l6-6-6-6" />
            </svg>
          </button>

        </div>

      </div>

    </div>
  )
}

export function StoriesSection() {
  return (
    <section className="stories-section">

      <div className="stories-container">

        <div className="stories-heading">

          <span className="stories-overline">UPSKILLYFY AI COMMUNITY</span>

          <h2>
            People are building
            <br />
            <span>with Upskillyfy AI</span>
          </h2>

          <p>
            Discover how learners and builders are using Upskillyfy
            to learn new skills, build projects and find their next
            opportunity.
          </p>

        </div>

        <StoriesCarousel names={['Kajal Kumari', 'Alok Raj', 'Abhijeet Gupta', 'Shrestha Saran', 'Tanya Gupta']} />

      </div>

    </section>
  )
}