import { useState } from 'react'
import { hackathonAPI } from '../../api'
import { getHackathonError, unwrapHackathonResponse } from '../../services/hackathonService'

export default function SubmissionEditor({ slug, submissions = [], onSaved }) {
  const [selectedId, setSelectedId] = useState('')
  const [form, setForm] = useState({ title: '', description: '', repoUrl: '', demoUrl: '', videoUrl: '' })
  const [state, setState] = useState({ loading: false, error: '', result: null })
  const update = event => setForm(current => ({ ...current, [event.target.name]: event.target.value }))
  const selectSubmission = event => {
    const submission = submissions.find(item => (item._id || item.submissionId) === event.target.value)
    setSelectedId(event.target.value)
    if (submission) setForm({ title: submission.title || '', description: submission.description || '', repoUrl: submission.repoUrl || '', demoUrl: submission.demoUrl || '', videoUrl: submission.videoUrl || '' })
  }
  const submit = async event => {
    event.preventDefault()
    setState({ loading: true, error: '', result: null })
    try {
      const request = selectedId ? hackathonAPI.updateSubmission(slug, selectedId, form) : hackathonAPI.createSubmission(slug, { ...form, isDraft: true })
      const result = unwrapHackathonResponse(await request)
      setState({ loading: false, error: '', result })
      onSaved?.()
    } catch (error) {
      setState({ loading: false, error: getHackathonError(error, 'Submission draft could not be saved.'), result: null })
    }
  }
  const submitFinal = async () => {
    if (!selectedId) return
    setState({ loading: true, error: '', result: null })
    try {
      const result = unwrapHackathonResponse(await hackathonAPI.submitSubmission(slug, selectedId))
      setState({ loading: false, error: '', result })
      onSaved?.()
    } catch (error) {
      setState({ loading: false, error: getHackathonError(error, 'Submission could not be finalized.'), result: null })
    }
  }
  return <form className="workspace-form submission-editor" onSubmit={submit}><label>Edit existing draft<select value={selectedId} onChange={selectSubmission}><option value="">Create a new draft</option>{submissions.filter(item => item.isDraft).map(item => <option key={item._id || item.submissionId} value={item._id || item.submissionId}>{item.title || 'Untitled draft'}</option>)}</select></label><div className="form-two-column"><label>Project title<input name="title" value={form.title} onChange={update} required /></label><label>Repository URL<input name="repoUrl" type="url" value={form.repoUrl} onChange={update} placeholder="https://github.com/..." /></label></div><label>Description<textarea name="description" rows="4" value={form.description} onChange={update} required /></label><div className="form-two-column"><label>Demo URL<input name="demoUrl" type="url" value={form.demoUrl} onChange={update} /></label><label>Video URL<input name="videoUrl" type="url" value={form.videoUrl} onChange={update} /></label></div>{state.error && <p className="form-error" role="alert">{state.error}</p>}{state.result && <p className="form-success">{selectedId ? 'Submission updated successfully.' : 'Draft saved successfully.'}</p>}<div className="submission-actions"><button className="btn-primary" type="submit" disabled={state.loading}>{state.loading ? 'Saving...' : selectedId ? 'Update draft' : 'Save submission draft'}</button><button className="btn-secondary" type="button" disabled={state.loading || !selectedId} onClick={submitFinal}>Submit final project</button></div></form>
}
