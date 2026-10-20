import { createServer } from 'vite'

const server = await createServer({
  root: '/Users/kumar/Desktop/upskillyfy-ai/client',
  server: { middlewareMode: true },
  appType: 'custom',
  logLevel: 'error',
})

const m = await server.ssrLoadModule('/src/services/assessmentService.js')
console.log('exports:', Object.keys(m).sort().join(', '))

console.log('\n--- fallback path (API unreachable) ---')
const t = await m.fetchTest('cse-data-structures')
console.log('fetchTest ->', t.source, '|', t.data.title, '| questions:', t.data.questions.length)
console.log('  correctAnswer leaked to exam?', 'correctAnswer' in t.data.questions[0])
console.log('  explanation leaked to exam?', 'explanation' in t.data.questions[0])
console.log('  markingScheme:', JSON.stringify(t.data.markingScheme))

const b = await m.fetchBranches()
console.log('fetchBranches ->', b.source, '| count:', b.data.length, '| cse testCount:', b.data.find(x => x.id === 'cse').testCount)

const bt = await m.fetchBranchTests('general-aptitude')
console.log('fetchBranchTests ->', bt.source, '| n:', bt.data.length, '|', bt.data.map(x => x.id).join(', '))

const rv = await m.fetchTestReview('cse-data-structures')
console.log('fetchTestReview ->', rv.source, '| has correctAnswer:', 'correctAnswer' in rv.data.questions[0], '| has explanation:', !!rv.data.questions[0].explanation)

console.log('\n--- attempt lifecycle + scoring ---')
const test = t.data
const { attempt } = m.startAttempt({ test, userId: 'tester' })
console.log('startAttempt status:', attempt.status, '| deadline:', attempt.deadline)
const begun = m.beginAttempt(attempt, test.duration)
console.log('beginAttempt status:', begun.status, '| has deadline:', !!begun.deadline)

const a2 = m.setAnswer({ attempt: begun, questionId: test.questions[0].id, optionIndex: 0 })
console.log('setAnswer -> answers:', Object.keys(a2.answers).length, '| visited:', a2.visited.length)

const a3 = m.toggleMarkForReview({ attempt: a2, questionId: test.questions[1].id })
console.log('toggleMarkForReview -> marked:', a3.markedForReview.length)

const a4 = m.setCurrentQuestion({ attempt: a3, index: 2, total: test.questions.length })
console.log('setCurrentQuestion -> idx:', a4.currentQuestionIndex)

const s = m.getSummary(a4, test)
console.log('getSummary ->', JSON.stringify(s))

// Score it: answer q0 correctly, q1 wrongly
const real = m.startAttempt({ test: test, userId: 'scorer' })
let scored = m.beginAttempt(real.attempt, test.duration)
scored = m.setAnswer({ attempt: scored, questionId: test.questions[0].id, optionIndex: 0 })
const { result } = await m.submitAttempt({ attempt: scored, timeTakenSeconds: 42 })
console.log('submitAttempt result ->', JSON.stringify(result))
console.log('isSubmitted:', m.isSubmitted(scored))

await server.close()
