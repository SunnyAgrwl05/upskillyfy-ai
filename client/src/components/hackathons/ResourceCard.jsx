import ExternalLink from 'lucide-react/dist/esm/icons/external-link.mjs'
import BackendIntegrationPending from './BackendIntegrationPending'

export default function ResourceCard({ resource }) {
  return <article className="resource-card"><div><h3>{resource?.title || 'Organizer resource'}</h3><p>{resource?.description || 'Resource details will appear from the organizer feed.'}</p></div>{resource?.url ? <a href={resource.url} target="_blank" rel="noreferrer">Open resource <ExternalLink size={14} /></a> : <BackendIntegrationPending title="Resource API pending" />}</article>
}
