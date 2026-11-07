import LockKeyhole from 'lucide-react/dist/esm/icons/lock-keyhole.mjs'

export default function HackathonModulePlaceholder({ title, description }) {
  return (
    <article className="hackathon-module-placeholder">
      <div className="hackathon-module-placeholder-icon" aria-hidden="true"><LockKeyhole size={17} /></div>
      <div>
        <h3>{title}</h3>
        <p>{description}</p>
        <span>Backend integration required</span>
      </div>
    </article>
  )
}
