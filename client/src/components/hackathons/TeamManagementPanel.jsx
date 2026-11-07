import { useState } from 'react'
import { hackathonAPI } from '../../api'
import { getHackathonError, unwrapHackathonResponse } from '../../services/hackathonService'
import TeamMemberCard from './TeamMemberCard'

export default function TeamManagementPanel({ slug, team, domains = [], onChange }) {
  const [mode, setMode] = useState('create')
  const [domainId, setDomainId] = useState(domains[0]?.domainId || '')
  const [teamName, setTeamName] = useState('')
  const [inviteCode, setInviteCode] = useState('')
  const [state, setState] = useState({ loading: false, error: '' })
  const [notice, setNotice] = useState('')
  const submit = async event => {
    event.preventDefault()
    setState({ loading: true, error: '' })
    try {
      const response = mode === 'create' ? await hackathonAPI.createTeam(slug, { domainId, teamName }) : await hackathonAPI.joinTeam(slug, inviteCode)
      unwrapHackathonResponse(response)
      onChange?.()
      setState({ loading: false, error: '' })
    } catch (error) {
      setState({ loading: false, error: getHackathonError(error, 'Team action could not be completed.') })
    }
  }
  const isLeader = team && (team.currentUserIsLeader || team.isLeader)
  const runTeamAction = async action => {
    setState({ loading: true, error: '' })
    setNotice('')
    try {
      await action()
      setNotice('Team action completed.')
      onChange?.()
    } catch (error) {
      setState({ loading: false, error: getHackathonError(error, 'Team action could not be completed.') })
      return
    }
    setState({ loading: false, error: '' })
  }
  if (team) return <div className="workspace-team-panel"><div className="team-summary"><strong>{team.teamName}</strong><span>Domain: {team.domainId}</span><span>Invite code: {team.inviteCode || 'Hidden by API'}</span></div>{notice && <p className="form-success">{notice}</p>}{state.error && <p className="form-error" role="alert">{state.error}</p>}<div className="team-member-grid">{(team.members || []).map(member => { const memberId = member._id || member.userId; const memberIsLeader = memberId === team.leader; return <div className="team-member-action" key={memberId || member.email}><TeamMemberCard member={member} leader={memberIsLeader} />{isLeader && !memberIsLeader && <button className="btn-secondary" type="button" disabled={state.loading} onClick={() => runTeamAction(() => unwrapHackathonResponse(hackathonAPI.removeTeamMember(slug, memberId)))}>Remove member</button>}</div> })}</div><button className="btn-secondary team-leave-button" type="button" disabled={state.loading} onClick={() => runTeamAction(() => unwrapHackathonResponse(hackathonAPI.leaveTeam(slug)))}>{state.loading ? 'Updating team...' : 'Leave team'}</button></div>
  return <div className="workspace-form"><div className="form-toggle"><button type="button" className={mode === 'create' ? 'active' : ''} onClick={() => setMode('create')}>Create a team</button><button type="button" className={mode === 'join' ? 'active' : ''} onClick={() => setMode('join')}>Join a team</button></div><form onSubmit={submit}>{mode === 'create' ? <><label>Team name<input value={teamName} onChange={event => setTeamName(event.target.value)} required /></label><label>Domain<select value={domainId} onChange={event => setDomainId(event.target.value)} required><option value="" disabled>Select a domain</option>{domains.map(domain => <option key={domain.domainId} value={domain.domainId}>{domain.name || domain.domainId}</option>)}</select></label></> : <label>Invite code<input value={inviteCode} onChange={event => setInviteCode(event.target.value)} required /></label>}{state.error && <p className="form-error" role="alert">{state.error}</p>}<button className="btn-primary" type="submit" disabled={state.loading}>{state.loading ? 'Saving...' : mode === 'create' ? 'Create team' : 'Join team'}</button></form></div>
}
