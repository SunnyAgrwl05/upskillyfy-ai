import { useState } from 'react'
import { hackathonAPI } from '../../api'
import { unwrapHackathonResponse, getHackathonError } from '../../services/hackathonService'

export default function RegistrationPanel({ slug, domains = [], registration, onChanged }) {
  const [domainId, setDomainId] = useState(domains[0]?.domainId || '')
  const [state, setState] = useState({ loading: false, error: '', result: null })
  const submit = async event => {
    event.preventDefault()
    setState({ loading: true, error: '', result: null })
    try {
      const result = unwrapHackathonResponse(await hackathonAPI.register(slug, domainId))
      setState({ loading: false, error: '', result })
      onChanged?.(result)
    } catch (error) {
      setState({ loading: false, error: getHackathonError(error, 'Registration could not be completed.'), result: null })
    }
  }
  return <div className="workspace-form"><p>Choose an eligible domain to register for this hackathon.</p>{registration || state.result ? <div className="registration-confirmation"><div className="form-success">Registration status: {registration?.status || state.result?.status || 'registered'}.</div><span>Domain: {registration?.domainId || state.result?.domainId || 'Selected domain'}</span></div> : <form onSubmit={submit}><label>Domain<select value={domainId} onChange={event => setDomainId(event.target.value)} required><option value="" disabled>Select a domain</option>{domains.map(domain => <option key={domain.domainId} value={domain.domainId}>{domain.name || domain.domainId}</option>)}</select></label>{state.error && <p className="form-error" role="alert">{state.error}</p>}<button className="btn-primary" type="submit" disabled={state.loading || !domainId}>{state.loading ? 'Registering...' : 'Register for hackathon'}</button></form>}</div>
}
