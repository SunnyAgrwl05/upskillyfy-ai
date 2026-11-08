export function analysisToResumeDraft(value = {}) {
  return {
    name: value.name || '', headline: '', email: value.email || '', phone: value.phone || '',
    location: value.location || '', links: (value.links || []).join(', '),
    summary: value.professionalSummary || '',
    experience: (value.workExperience || []).map((item) => ({
      role: item.title || '', company: item.employer || '', dates: item.dates || '', bullets: (item.bullets || []).join('\n'),
    })),
    education: (value.education || []).map((item) => ({ degree: item.degree || '', institution: item.institution || '', dates: item.dates || '' })),
    leadership: (value.achievements || []).join('\n'),
    projects: (value.projects || []).map((item) => `${item.name}${item.dates ? ` (${item.dates})` : ''}: ${(item.description || []).join('; ')}${item.technologies?.length ? ` [${item.technologies.join(', ')}]` : ''}`).join('\n'),
    skills: [...(value.technicalSkills || []), ...(value.softSkills || [])].join(', '),
    certifications: (value.certifications || []).map((item) => [item.name, item.issuer, item.date, item.credentialId].filter(Boolean).join(' · ')).join('\n'),
    jobDescription: '',
  }
}

export const ATS_RESUME_TEMPLATE_CHOICES = Object.freeze([
  { id: 'ats-friendly-resume', title: 'ATS-Friendly Resume' },
  { id: 'fresher-resume', title: 'Fresher Resume' },
  { id: 'software-engineer-resume', title: 'Software Engineer Resume' },
  { id: 'experienced-professional-resume', title: 'Experienced Professional Resume' },
  { id: 'academic-cv', title: 'Academic CV' },
])
