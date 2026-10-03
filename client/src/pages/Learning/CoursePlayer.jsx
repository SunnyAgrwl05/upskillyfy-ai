import { useState, useEffect, useRef, useMemo } from 'react'
import { useParams, Link } from 'react-router-dom'
import {
  ArrowLeft,
  Play,
  Pause,
  RotateCcw,
  RotateCw,
  Volume2,
  VolumeX,
  Maximize,
  CheckCircle2,
  Circle,
  Award,
  ChevronDown,
  ChevronUp,
  FileText,
  Code2,
  MessageSquare,
  Copy,
  Check,
  Download,
  HelpCircle,
  Sparkles,
  Search,
  Send,
  X,
  Video,
  List
} from 'lucide-react'
import { courseAPI } from '../../api'
import { COURSES_DATA } from '../../data/coursesData'
import { useAuth } from '../../context/AuthContext'
import './Courses.css'

export default function CoursePlayer() {
  const { courseId } = useParams()
  const { user } = useAuth()

  const [course, setCourse] = useState(null)
  const [loading, setLoading] = useState(true)

  // Current Lesson State
  const [activeModuleIdx, setActiveModuleIdx] = useState(0)
  const [activeLessonIdx, setActiveLessonIdx] = useState(0)

  // Module Accordion open state
  const [openModules, setOpenModules] = useState({ 0: true })

  // Mobile View Toggle: 'content' | 'syllabus' (active on < 1024px)
  const [mobileView, setMobileView] = useState('content')

  // Progress Tracking
  const [completedLessons, setCompletedLessons] = useState(() => {
    try {
      const saved = localStorage.getItem(`upskillyfy-completed-${courseId}`)
      return saved ? JSON.parse(saved) : []
    } catch {
      return []
    }
  })

  // Tabs: 'overview' | 'lab' | 'resources' | 'qa' | 'notes'
  const [activeTab, setActiveTab] = useState('overview')

  // Search in syllabus
  const [syllabusSearch, setSyllabusSearch] = useState('')

  // Video Controls State
  const videoRef = useRef(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(1)
  const [isMuted, setIsMuted] = useState(false)
  const [playbackRate, setPlaybackRate] = useState(1)

  // Quiz state
  const [selectedQuizAnswer, setSelectedQuizAnswer] = useState(null)
  const [quizSubmitted, setQuizSubmitted] = useState(false)

  // Code Copy feedback
  const [copiedCode, setCopiedCode] = useState(false)

  // Personal Notes State
  const [notes, setNotes] = useState('')
  const [noteSaved, setNoteSaved] = useState(false)

  // Q&A State
  const [qaList, setQaList] = useState([
    {
      id: 1,
      author: 'Aman Verma',
      time: '2 days ago',
      text: 'How does Cloud NAT compare with assigning public IPs directly to Compute Engine VMs?',
      reply: 'Cloud NAT is vastly more secure because it prevents inbound unsolicited traffic from the internet while allowing VMs to download patches and outbound dependencies.'
    },
    {
      id: 2,
      author: 'Sneha Roy',
      time: '1 day ago',
      text: 'Can we use this setup in the Google Cloud Free Tier sandbox?',
      reply: 'Yes! The e2-micro and e2-medium instances qualify within Google Cloud’s 90-day $300 trial credits.'
    }
  ])
  const [newQuestion, setNewQuestion] = useState('')

  // Certificate Modal
  const [showCertModal, setShowCertModal] = useState(false)

  // Load Course Data
  useEffect(() => {
    let isMounted = true
    setLoading(true)

    courseAPI.getOne(courseId)
      .then((res) => {
        if (isMounted && res?.data) {
          setCourse(res.data)
        } else {
          fallbackLocalCourse()
        }
      })
      .catch(() => {
        if (isMounted) fallbackLocalCourse()
      })
      .finally(() => {
        if (isMounted) setLoading(false)
      })

    function fallbackLocalCourse() {
      const found = COURSES_DATA.find(c => c.id === courseId) || COURSES_DATA[0]
      setCourse(found)
    }

    return () => { isMounted = false }
  }, [courseId])

  // Save Progress to localStorage
  useEffect(() => {
    if (courseId) {
      localStorage.setItem(`upskillyfy-completed-${courseId}`, JSON.stringify(completedLessons))
    }
  }, [completedLessons, courseId])

  // Current module & lesson
  const currentModule = course?.modules?.[activeModuleIdx]
  const currentLesson = currentModule?.lessons?.[activeLessonIdx]

  useEffect(() => {
    if (courseId && currentLesson?.id) {
      const savedNote = localStorage.getItem(`upskillyfy-note-${courseId}-${currentLesson.id}`) || ''
      setNotes(savedNote)
      setSelectedQuizAnswer(null)
      setQuizSubmitted(false)
    }
  }, [courseId, currentLesson?.id])

  const handleNoteChange = (val) => {
    setNotes(val)
    if (courseId && currentLesson?.id) {
      localStorage.setItem(`upskillyfy-note-${courseId}-${currentLesson.id}`, val)
      setNoteSaved(true)
      setTimeout(() => setNoteSaved(false), 1800)
    }
  }

  const allLessons = useMemo(() => {
    if (!course?.modules) return []
    const list = []
    course.modules.forEach((mod, mIdx) => {
      mod.lessons?.forEach((les, lIdx) => {
        list.push({ ...les, moduleIndex: mIdx, lessonIndex: lIdx, moduleTitle: mod.title })
      })
    })
    return list
  }, [course])

  const totalLessonsCount = allLessons.length
  const completedCount = allLessons.filter(l => completedLessons.includes(l.id)).length
  const progressPercent = totalLessonsCount > 0 ? Math.round((completedCount / totalLessonsCount) * 100) : 0

  // Video Event Handlers
  const togglePlay = () => {
    if (!videoRef.current) return
    if (isPlaying) {
      videoRef.current.pause()
    } else {
      videoRef.current.play()
    }
    setIsPlaying(!isPlaying)
  }

  const handleTimeUpdate = () => {
    if (!videoRef.current) return
    setCurrentTime(videoRef.current.currentTime)
  }

  const handleLoadedMetadata = () => {
    if (!videoRef.current) return
    setDuration(videoRef.current.duration)
  }

  const handleSeek = (e) => {
    const time = parseFloat(e.target.value)
    if (videoRef.current) {
      videoRef.current.currentTime = time
      setCurrentTime(time)
    }
  }

  const skipTime = (seconds) => {
    if (videoRef.current) {
      videoRef.current.currentTime = Math.max(0, Math.min(duration, videoRef.current.currentTime + seconds))
    }
  }

  const handleVolumeChange = (e) => {
    const val = parseFloat(e.target.value)
    setVolume(val)
    if (videoRef.current) {
      videoRef.current.volume = val
      setIsMuted(val === 0)
    }
  }

  const toggleMute = () => {
    if (!videoRef.current) return
    if (isMuted) {
      videoRef.current.muted = false
      setIsMuted(false)
    } else {
      videoRef.current.muted = true
      setIsMuted(true)
    }
  }

  const changePlaybackSpeed = (rate) => {
    setPlaybackRate(rate)
    if (videoRef.current) {
      videoRef.current.playbackRate = rate
    }
  }

  const toggleFullscreen = () => {
    if (!videoRef.current) return
    if (videoRef.current.requestFullscreen) {
      videoRef.current.requestFullscreen()
    }
  }

  const formatTime = (secs) => {
    if (!secs || isNaN(secs)) return '0:00'
    const m = Math.floor(secs / 60)
    const s = Math.floor(secs % 60)
    return `${m}:${s < 10 ? '0' : ''}${s}`
  }

  const toggleModuleOpen = (idx) => {
    setOpenModules(prev => ({ ...prev, [idx]: !prev[idx] }))
  }

  const selectLesson = (mIdx, lIdx) => {
    setActiveModuleIdx(mIdx)
    setActiveLessonIdx(lIdx)
    setIsPlaying(false)
    if (videoRef.current) {
      videoRef.current.pause()
      videoRef.current.currentTime = 0
    }
    // On mobile, auto switch back to video/content view upon selecting lesson
    setMobileView('content')
  }

  const toggleLessonComplete = (lessonId) => {
    setCompletedLessons(prev => {
      const exists = prev.includes(lessonId)
      const next = exists ? prev.filter(id => id !== lessonId) : [...prev, lessonId]
      return next
    })
    courseAPI.updateProgress(courseId, { lessonId, completed: true }).catch(() => {})
  }

  const handleNextLesson = () => {
    if (!currentLesson) return
    if (!completedLessons.includes(currentLesson.id)) {
      toggleLessonComplete(currentLesson.id)
    }

    const currentIdxInAll = allLessons.findIndex(l => l.id === currentLesson.id)
    if (currentIdxInAll !== -1 && currentIdxInAll < allLessons.length - 1) {
      const nextLes = allLessons[currentIdxInAll + 1]
      selectLesson(nextLes.moduleIndex, nextLes.lessonIndex)
    } else {
      setShowCertModal(true)
    }
  }

  const handlePrevLesson = () => {
    if (!currentLesson) return
    const currentIdxInAll = allLessons.findIndex(l => l.id === currentLesson.id)
    if (currentIdxInAll > 0) {
      const prevLes = allLessons[currentIdxInAll - 1]
      selectLesson(prevLes.moduleIndex, prevLes.lessonIndex)
    }
  }

  const handleCopyCode = (text) => {
    navigator.clipboard.writeText(text)
    setCopiedCode(true)
    setTimeout(() => setCopiedCode(false), 2000)
  }

  const handlePostQuestion = (e) => {
    e.preventDefault()
    if (!newQuestion.trim()) return
    const newEntry = {
      id: Date.now(),
      author: user?.name || 'You (Learner)',
      time: 'Just now',
      text: newQuestion.trim(),
      reply: 'Thanks for asking! Our Google Cloud certified mentor will provide detailed feedback shortly.'
    }
    setQaList([newEntry, ...qaList])
    setNewQuestion('')
  }

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 20px', minHeight: '80vh' }}>
        <div className="spinner" style={{ margin: '0 auto 16px' }} />
        <h3 style={{ fontSize: '1.15rem', color: 'var(--text-h)' }}>Loading Learning Workspace...</h3>
        <p style={{ color: 'var(--muted)', marginTop: 6, fontSize: '0.88rem' }}>Preparing interactive video player and syllabus</p>
      </div>
    )
  }

  if (!course) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 24px' }}>
        <h2>Course Not Found</h2>
        <p style={{ color: 'var(--muted)', margin: '14px 0 24px' }}>The requested course track does not exist.</p>
        <Link to="/learning/courses" className="btn-primary">Back to Course Catalog</Link>
      </div>
    )
  }

  return (
    <div className="gcp-player-page">
      {/* =========================================================
          TOP GOOGLE CLOUD CONSOLE BAR
          ========================================================= */}
      <header className="gcp-player-header-wrap">
        <div className="container">
          <div className="gcp-player-header-inner">
            <div className="gcp-player-nav-left">
              <Link to="/learning/courses" className="gcp-back-btn" title="Back to Catalog">
                <ArrowLeft size={15} />
                <span className="gcp-back-btn-text">Catalog</span>
              </Link>

              <div className="gcp-player-title-box">
                <div className="gcp-course-breadcrumb">
                  <span>{course.category}</span>
                  <span>•</span>
                  <span>{course.level}</span>
                </div>
                <div className="gcp-player-course-name" title={course.title}>
                  {course.title}
                </div>
              </div>
            </div>

            <div className="gcp-player-nav-right">
              {/* Progress Indicator */}
              <div className="gcp-progress-summary">
                <div className="gcp-progress-bar-wrap">
                  <div 
                    className="gcp-progress-bar-fill" 
                    style={{ width: `${progressPercent}%` }} 
                  />
                </div>
                <span className="gcp-progress-text">
                  {progressPercent}% <span className="gcp-progress-text-label">Complete</span>
                </span>
              </div>

              {/* Certificate Button */}
              <button 
                className="gcp-cert-btn"
                onClick={() => setShowCertModal(true)}
                title="Preview or Claim Course Certificate"
              >
                <Award size={14} />
                <span className="gcp-cert-btn-text">Certificate</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* =========================================================
          MOBILE VIEW SWITCHER (Visible on screens < 1024px)
          Allows 1-tap switching between Video and Syllabus
          ========================================================= */}
      <div className="gcp-mobile-view-tabs">
        <div className="container" style={{ display: 'flex' }}>
          <button 
            className={`gcp-mobile-tab-btn ${mobileView === 'content' ? 'active' : ''}`}
            onClick={() => setMobileView('content')}
          >
            <Video size={16} />
            <span>Lesson Workspace</span>
          </button>
          <button 
            className={`gcp-mobile-tab-btn ${mobileView === 'syllabus' ? 'active' : ''}`}
            onClick={() => setMobileView('syllabus')}
          >
            <List size={16} />
            <span>Syllabus ({totalLessonsCount})</span>
          </button>
        </div>
      </div>

      {/* =========================================================
          MAIN 2-COLUMN LEARNING WORKSPACE
          Strictly bounded within global .container margins
          ========================================================= */}
      <div className="container">
        <div className={`gcp-learning-layout mobile-view-${mobileView}`}>
        {/* LEFT COLUMN: Player & Content Tabs */}
        <main className="gcp-main-stage">
          {/* Video Player */}
          <div className="gcp-video-container">
            <video
              ref={videoRef}
              className="gcp-video-element"
              src={currentLesson?.videoUrl || 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'}
              onTimeUpdate={handleTimeUpdate}
              onLoadedMetadata={handleLoadedMetadata}
              onClick={togglePlay}
              playsInline
            />

            {/* Custom Google Cloud Video Control Bar */}
            <div className="gcp-video-overlay-bar">
              <input
                type="range"
                className="gcp-scrubber"
                min="0"
                max={duration || 100}
                step="0.1"
                value={currentTime}
                onChange={handleSeek}
                aria-label="Video scrubber"
              />

              <div className="gcp-controls-row">
                <div className="gcp-controls-left">
                  <button className="gcp-ctrl-btn" onClick={togglePlay} title={isPlaying ? 'Pause' : 'Play'}>
                    {isPlaying ? <Pause size={17} /> : <Play size={17} fill="#ffffff" />}
                  </button>

                  <button className="gcp-ctrl-btn" onClick={() => skipTime(-10)} title="Rewind 10s">
                    <RotateCcw size={15} />
                  </button>
                  <button className="gcp-ctrl-btn" onClick={() => skipTime(10)} title="Forward 10s">
                    <RotateCw size={15} />
                  </button>

                  <span className="gcp-video-time">
                    {formatTime(currentTime)} / {formatTime(duration)}
                  </span>
                </div>

                <div className="gcp-controls-right">
                  {/* Volume Control */}
                  <div className="gcp-volume-ctrl">
                    <button className="gcp-ctrl-btn" onClick={toggleMute} title="Mute/Unmute">
                      {isMuted || volume === 0 ? <VolumeX size={15} /> : <Volume2 size={15} />}
                    </button>
                    <input
                      type="range"
                      className="gcp-volume-slider"
                      min="0"
                      max="1"
                      step="0.05"
                      value={isMuted ? 0 : volume}
                      onChange={handleVolumeChange}
                      aria-label="Volume slider"
                    />
                  </div>

                  {/* Speed Selector */}
                  <select
                    className="gcp-select gcp-speed-select"
                    value={playbackRate}
                    onChange={(e) => changePlaybackSpeed(parseFloat(e.target.value))}
                    aria-label="Playback speed"
                  >
                    <option value="0.75">0.75x</option>
                    <option value="1">1.0x</option>
                    <option value="1.25">1.25x</option>
                    <option value="1.5">1.5x</option>
                    <option value="2">2.0x</option>
                  </select>

                  {/* Fullscreen Button */}
                  <button className="gcp-ctrl-btn" onClick={toggleFullscreen} title="Fullscreen">
                    <Maximize size={15} />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Lesson Header & Action Bar */}
          <div className="gcp-lesson-action-bar">
            <div className="gcp-current-lesson-header">
              <span className="gcp-current-module-badge">
                {currentModule?.title}
              </span>
              <h1>{currentLesson?.title || 'Course Lesson'}</h1>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 4, fontSize: '0.8rem', color: 'var(--muted)' }}>
                <span>⏱ {currentLesson?.duration || '15 mins'}</span>
                <span>•</span>
                <span style={{ textTransform: 'capitalize' }}>{currentLesson?.type || 'video'}</span>
              </div>
            </div>

            <div className="gcp-lesson-nav-buttons">
              <button 
                className="gcp-btn-prev" 
                onClick={handlePrevLesson}
                title="Go to previous lesson"
              >
                Previous
              </button>

              <button 
                className={`gcp-btn-complete ${completedLessons.includes(currentLesson?.id) ? 'completed' : ''}`}
                onClick={() => currentLesson && toggleLessonComplete(currentLesson.id)}
              >
                {completedLessons.includes(currentLesson?.id) ? (
                  <>
                    <CheckCircle2 size={15} />
                    <span>Done</span>
                  </>
                ) : (
                  <>
                    <Circle size={15} />
                    <span>Mark Done</span>
                  </>
                )}
              </button>

              <button 
                className="gcp-btn-next" 
                onClick={handleNextLesson}
                title="Next lesson"
              >
                Next →
              </button>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="gcp-tabs-nav">
            <button 
              className={`gcp-tab-link ${activeTab === 'overview' ? 'active' : ''}`}
              onClick={() => setActiveTab('overview')}
            >
              <FileText size={15} />
              <span>Overview</span>
            </button>

            {currentLesson?.codeSnippet && (
              <button 
                className={`gcp-tab-link ${activeTab === 'lab' ? 'active' : ''}`}
                onClick={() => setActiveTab('lab')}
              >
                <Code2 size={15} />
                <span>Hands-on Code</span>
              </button>
            )}

            <button 
              className={`gcp-tab-link ${activeTab === 'resources' ? 'active' : ''}`}
              onClick={() => setActiveTab('resources')}
            >
              <Download size={15} />
              <span>Downloads</span>
            </button>

            <button 
              className={`gcp-tab-link ${activeTab === 'qa' ? 'active' : ''}`}
              onClick={() => setActiveTab('qa')}
            >
              <MessageSquare size={15} />
              <span>Discussion ({qaList.length})</span>
            </button>

            <button 
              className={`gcp-tab-link ${activeTab === 'notes' ? 'active' : ''}`}
              onClick={() => setActiveTab('notes')}
            >
              <Sparkles size={15} />
              <span>My Notes</span>
            </button>
          </div>

          {/* TAB CONTENTS */}
          <div className="gcp-tab-pane">
            {/* 1. OVERVIEW TAB */}
            {activeTab === 'overview' && (
              <div>
                <h3 style={{ fontSize: '1.05rem', marginBottom: 8, color: 'var(--text-h)' }}>
                  Lesson Summary
                </h3>
                <p style={{ lineHeight: 1.65, color: 'var(--text)', fontSize: '0.9rem' }}>
                  {currentLesson?.summary || 'In this lesson, you will master essential engineering concepts through practical demonstration and guided implementation.'}
                </p>

                {currentLesson?.keyTakeaways && (
                  <div style={{ marginTop: 20 }}>
                    <h4 style={{ fontSize: '0.92rem', marginBottom: 10, color: 'var(--text-h)' }}>
                      Key Architectural Takeaways
                    </h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {currentLesson.keyTakeaways.map((takeaway, idx) => (
                        <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: '0.86rem' }}>
                          <CheckCircle2 size={16} color="var(--gcp-green)" style={{ flexShrink: 0, marginTop: 2 }} />
                          <span style={{ lineHeight: 1.5 }}>{takeaway}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Interactive Quiz Checkpoint */}
                {currentLesson?.quiz && (
                  <div className="gcp-quiz-card">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                      <HelpCircle size={16} color="var(--gcp-blue)" />
                      <strong style={{ fontSize: '0.9rem' }}>Knowledge Checkpoint</strong>
                    </div>
                    <p style={{ fontSize: '0.88rem', marginBottom: 12 }}>
                      {currentLesson.quiz.question}
                    </p>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      {currentLesson.quiz.options.map((opt, oIdx) => {
                        let optionClass = ''
                        if (quizSubmitted) {
                          if (oIdx === currentLesson.quiz.correctIndex) optionClass = 'correct'
                          else if (selectedQuizAnswer === oIdx) optionClass = 'wrong'
                        } else if (selectedQuizAnswer === oIdx) {
                          optionClass = 'selected'
                        }

                        return (
                          <div
                            key={oIdx}
                            className={`gcp-quiz-option ${optionClass}`}
                            onClick={() => !quizSubmitted && setSelectedQuizAnswer(oIdx)}
                          >
                            <span style={{ 
                              width: 20, 
                              height: 20, 
                              borderRadius: '50%', 
                              background: 'var(--border)', 
                              display: 'flex', 
                              alignItems: 'center', 
                              justifyContent: 'center',
                              fontSize: '0.7rem',
                              fontWeight: 700,
                              flexShrink: 0
                            }}>
                              {String.fromCharCode(65 + oIdx)}
                            </span>
                            <span>{opt}</span>
                          </div>
                        )
                      })}
                    </div>

                    {!quizSubmitted ? (
                      <button
                        className="gcp-btn-enroll"
                        style={{ marginTop: 14, padding: '7px 16px', fontSize: '0.82rem' }}
                        disabled={selectedQuizAnswer === null}
                        onClick={() => setQuizSubmitted(true)}
                      >
                        Submit Answer
                      </button>
                    ) : (
                      <div style={{ marginTop: 12, padding: '10px 12px', borderRadius: 6, background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
                        <div style={{ fontWeight: 600, fontSize: '0.84rem', color: selectedQuizAnswer === currentLesson.quiz.correctIndex ? 'var(--gcp-green-dark)' : 'var(--gcp-red)' }}>
                          {selectedQuizAnswer === currentLesson.quiz.correctIndex ? '✓ Correct! Excellent work.' : '✕ Incorrect. Review explanation below:'}
                        </div>
                        <p style={{ fontSize: '0.8rem', color: 'var(--muted)', marginTop: 3 }}>
                          {currentLesson.quiz.explanation}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* 2. LAB & CODE TAB */}
            {activeTab === 'lab' && currentLesson?.codeSnippet && (
              <div>
                <h3 style={{ fontSize: '1.05rem', marginBottom: 6, color: 'var(--text-h)' }}>
                  Hands-on Code & Terminal Commands
                </h3>
                <p style={{ fontSize: '0.84rem', color: 'var(--muted)', marginBottom: 12 }}>
                  Execute these commands in your Google Cloud Shell or terminal.
                </p>

                <div className="gcp-code-block-container">
                  <div className="gcp-code-block-header">
                    <div className="gcp-code-window-dots">
                      <span className="dot dot-red" />
                      <span className="dot dot-yellow" />
                      <span className="dot dot-green" />
                      <span className="gcp-code-lang-label">Terminal / Script</span>
                    </div>

                    <button 
                      className="gcp-code-copy-btn"
                      onClick={() => handleCopyCode(currentLesson.codeSnippet)}
                      title="Copy code to clipboard"
                    >
                      {copiedCode ? <Check size={13} /> : <Copy size={13} />}
                      <span>{copiedCode ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                  <pre className="gcp-code-pre"><code>{currentLesson.codeSnippet}</code></pre>
                </div>
              </div>
            )}

            {/* 3. RESOURCES & DOWNLOADS TAB */}
            {activeTab === 'resources' && (
              <div>
                <h3 style={{ fontSize: '1.05rem', marginBottom: 10, color: 'var(--text-h)' }}>
                  Lesson Documents & Architecture Schemas
                </h3>
                {currentLesson?.resources && currentLesson.resources.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {currentLesson.resources.map((res, rIdx) => (
                      <div 
                        key={rIdx} 
                        className="card"
                        style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px' }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <FileText size={18} color="var(--gcp-blue)" />
                          <div>
                            <div style={{ fontWeight: 600, fontSize: '0.86rem' }}>{res.name}</div>
                            <div style={{ fontSize: '0.74rem', color: 'var(--muted)' }}>Size: {res.size}</div>
                          </div>
                        </div>
                        <button 
                          onClick={() => alert(`Simulated download of: ${res.name}`)}
                          className="gcp-btn-syllabus"
                          style={{ padding: '5px 12px', fontSize: '0.78rem' }}
                        >
                          <Download size={13} style={{ marginRight: 4 }} />
                          Download
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ padding: '20px', textAlign: 'center', background: 'var(--gcp-surface-variant)', borderRadius: 8 }}>
                    <p style={{ color: 'var(--muted)', fontSize: '0.84rem' }}>Reference guides and starter code will be linked in upcoming modules.</p>
                  </div>
                )}
              </div>
            )}

            {/* 4. DISCUSSION & Q&A TAB */}
            {activeTab === 'qa' && (
              <div>
                <h3 style={{ fontSize: '1.05rem', marginBottom: 10, color: 'var(--text-h)' }}>
                  Questions & Mentor Answers
                </h3>
                
                <form onSubmit={handlePostQuestion} className="gcp-qa-form">
                  <input
                    type="text"
                    className="gcp-qa-input"
                    placeholder="Ask a question about this module..."
                    value={newQuestion}
                    onChange={(e) => setNewQuestion(e.target.value)}
                  />
                  <button type="submit" className="gcp-btn-enroll" style={{ padding: '6px 14px', fontSize: '0.82rem' }}>
                    <Send size={14} />
                    <span>Ask</span>
                  </button>
                </form>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {qaList.map((qa) => (
                    <div key={qa.id} className="card" style={{ padding: '14px 16px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                        <strong style={{ fontSize: '0.86rem' }}>{qa.author}</strong>
                        <span style={{ fontSize: '0.72rem', color: 'var(--muted)' }}>{qa.time}</span>
                      </div>
                      <p style={{ fontSize: '0.85rem', color: 'var(--text)', marginBottom: 8 }}>
                        {qa.text}
                      </p>
                      {qa.reply && (
                        <div style={{ padding: '8px 12px', background: 'var(--gcp-surface-variant)', borderLeft: '3px solid var(--gcp-blue)', borderRadius: 4, fontSize: '0.82rem' }}>
                          <span style={{ fontWeight: 600, color: 'var(--gcp-blue)', display: 'block', marginBottom: 1 }}>
                            Mentor Reply:
                          </span>
                          {qa.reply}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 5. NOTES TAB */}
            {activeTab === 'notes' && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <h3 style={{ fontSize: '1.05rem', color: 'var(--text-h)' }}>
                    My Scratchpad & Key Points
                  </h3>
                  {noteSaved && (
                    <span style={{ fontSize: '0.74rem', color: 'var(--gcp-green-dark)', display: 'flex', alignItems: 'center', gap: 3 }}>
                      <Check size={13} /> Saved
                    </span>
                  )}
                </div>
                <p style={{ fontSize: '0.82rem', color: 'var(--muted)', marginBottom: 10 }}>
                  Notes automatically save in your local browser storage per lesson.
                </p>
                <textarea
                  className="gcp-notes-textarea"
                  placeholder="Record your thoughts, commands, and reminders for this lesson..."
                  value={notes}
                  onChange={(e) => handleNoteChange(e.target.value)}
                />
              </div>
            )}
          </div>
        </main>

        {/* RIGHT COLUMN: Curriculum Syllabus Tree */}
        <aside className="gcp-syllabus-sidebar">
          <div className="gcp-sidebar-header">
            <h2>Course Syllabus</h2>
            <div style={{ fontSize: '0.76rem', color: 'var(--muted)', marginTop: 3 }}>
              {completedCount} of {totalLessonsCount} lessons completed ({progressPercent}%)
            </div>

            {/* Syllabus Search */}
            <div style={{ position: 'relative', marginTop: 10 }}>
              <Search size={13} style={{ position: 'absolute', left: 9, top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)' }} />
              <input
                type="text"
                placeholder="Filter lessons..."
                value={syllabusSearch}
                onChange={(e) => setSyllabusSearch(e.target.value)}
                style={{
                  width: '100%',
                  padding: '6px 8px 6px 28px',
                  borderRadius: 16,
                  border: '1px solid var(--border)',
                  background: 'var(--bg)',
                  fontSize: '0.78rem',
                  color: 'var(--text)'
                }}
              />
            </div>
          </div>

          {/* Module List */}
          <div style={{ flex: 1 }}>
            {course.modules?.map((mod, mIdx) => {
              const isOpen = openModules[mIdx] ?? true
              const filteredLessons = mod.lessons?.filter(l => 
                !syllabusSearch || l.title.toLowerCase().includes(syllabusSearch.toLowerCase())
              )

              if (syllabusSearch && filteredLessons.length === 0) return null

              return (
                <div key={mod.id || mIdx} className="gcp-module-accordion">
                  {/* Module Header */}
                  <div 
                    className="gcp-module-head"
                    onClick={() => toggleModuleOpen(mIdx)}
                  >
                    <div>
                      <div className="gcp-module-title">{mod.title}</div>
                      <div className="gcp-module-meta">{mod.duration || '2h'} • {mod.lessons?.length || 0} lessons</div>
                    </div>
                    {isOpen ? <ChevronUp size={15} color="var(--muted)" /> : <ChevronDown size={15} color="var(--muted)" />}
                  </div>

                  {/* Lessons */}
                  {isOpen && (
                    <div>
                      {filteredLessons?.map((les, lIdx) => {
                        const isCurrent = activeModuleIdx === mIdx && activeLessonIdx === lIdx
                        const isDone = completedLessons.includes(les.id)

                        return (
                          <div
                            key={les.id || lIdx}
                            className={`gcp-lesson-item ${isCurrent ? 'active' : ''}`}
                            onClick={() => selectLesson(mIdx, lIdx)}
                          >
                            <div className="gcp-lesson-info">
                              {/* Checkbox */}
                              <div
                                onClick={(e) => {
                                  e.stopPropagation()
                                  toggleLessonComplete(les.id)
                                }}
                                style={{ cursor: 'pointer', display: 'flex' }}
                                title={isDone ? 'Mark as incomplete' : 'Mark as completed'}
                              >
                                {isDone ? (
                                  <CheckCircle2 size={15} color="var(--gcp-green-dark)" />
                                ) : (
                                  <Circle size={15} color="var(--border)" />
                                )}
                              </div>

                              <div style={{ minWidth: 0 }}>
                                <div className="gcp-lesson-name">{les.title}</div>
                                <div style={{ fontSize: '0.7rem', color: 'var(--muted)', display: 'flex', gap: 5, marginTop: 1 }}>
                                  <span>{les.duration}</span>
                                  <span>•</span>
                                  <span style={{ textTransform: 'capitalize' }}>{les.type}</span>
                                </div>
                              </div>
                            </div>

                            {isCurrent && (
                              <div className="gcp-lesson-icon">
                                <Play size={13} fill="var(--gcp-blue)" />
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {/* Instructor Footer Card */}
          {course.instructor && (
            <div style={{ padding: '14px 18px', borderTop: '1px solid var(--border)', background: 'var(--gcp-surface-variant)' }}>
              <div style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.06em', color: 'var(--muted)', marginBottom: 6 }}>
                Track Lead
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <img 
                  src={course.instructor.avatar} 
                  alt={course.instructor.name}
                  style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover' }}
                />
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.84rem' }}>{course.instructor.name}</div>
                  <div style={{ fontSize: '0.74rem', color: 'var(--muted)' }}>{course.instructor.role}</div>
                </div>
              </div>
            </div>
          )}
        </aside>
      </div>
    </div>

      {/* =========================================================
          COMPLETION CERTIFICATE MODAL
          ========================================================= */}
      {showCertModal && (
        <div className="gcp-modal-backdrop" onClick={() => setShowCertModal(false)}>
          <div className="gcp-modal-cert-card" onClick={(e) => e.stopPropagation()}>
            <button 
              onClick={() => setShowCertModal(false)}
              style={{ position: 'absolute', top: 14, right: 14, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)' }}
              aria-label="Close certificate modal"
            >
              <X size={18} />
            </button>

            <div style={{ display: 'inline-flex', padding: 10, borderRadius: '50%', background: 'var(--gcp-green-light)', color: 'var(--gcp-green-dark)', marginBottom: 12 }}>
              <Award size={32} />
            </div>

            <div style={{ fontSize: '0.74rem', textTransform: 'uppercase', letterSpacing: '.08em', color: 'var(--gcp-blue)', fontWeight: 700 }}>
              Upskillyfy Academy • Google Cloud Track
            </div>

            <h2 style={{ fontSize: '1.45rem', margin: '6px 0 10px', color: 'var(--text-h)' }}>
              Certificate of Completion
            </h2>

            <p style={{ fontSize: '0.88rem', color: 'var(--muted)', marginBottom: 14 }}>
              This certifies that
            </p>

            <div style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--gcp-blue)', fontFamily: 'Poppins, sans-serif', borderBottom: '2px solid var(--border)', display: 'inline-block', paddingBottom: 4, marginBottom: 16 }}>
              {user?.name || 'Devansh Agrawal'}
            </div>

            <p style={{ fontSize: '0.86rem', color: 'var(--muted)', maxWidth: 440, margin: '0 auto 18px', lineHeight: 1.55 }}>
              has successfully fulfilled all hands-on module requirements, architecture labs, and knowledge assessments in:
              <br />
              <strong style={{ color: 'var(--text)' }}>{course.title}</strong>
            </p>

            <div style={{ display: 'flex', justifyContent: 'center', gap: 20, fontSize: '0.75rem', color: 'var(--muted)', marginBottom: 22, borderTop: '1px solid var(--border)', paddingTop: 14, flexWrap: 'wrap' }}>
              <div>Issue Date: {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</div>
              <div>Credential ID: UPX-GCP-{Math.random().toString(36).substring(2, 9).toUpperCase()}</div>
              <div>Status: Verified</div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', gap: 10, flexWrap: 'wrap' }}>
              <button 
                onClick={() => { window.print(); }} 
                className="gcp-btn-enroll"
                style={{ padding: '8px 16px', fontSize: '0.84rem' }}
              >
                <Download size={14} />
                Download PDF
              </button>
              <button 
                onClick={() => setShowCertModal(false)}
                className="gcp-btn-syllabus"
                style={{ padding: '8px 14px', fontSize: '0.84rem' }}
              >
                Keep Learning
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
