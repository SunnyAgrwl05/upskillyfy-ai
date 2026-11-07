export default function LoadingSkeleton({ count = 3 }) {
  return (
    <div className="hackathon-loading-grid" aria-busy="true" aria-label="Loading">
      {Array.from({ length: count }, (_, index) => <div className="hackathon-loading-card" key={index}><span /><span /><span /><span /></div>)}
    </div>
  )
}
