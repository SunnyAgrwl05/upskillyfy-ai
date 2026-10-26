export const answerIsCorrect = (question, answer) => {
  if (question.type === 'multiple_choice') {
    return Array.isArray(answer)
      && Array.isArray(question.correctAnswer)
      && answer.length === question.correctAnswer.length
      && answer.every((value) => question.correctAnswer.includes(value))
  }
  return answer === question.correctAnswer
}

export const isValidAssessmentAnswer = (question, answer) => {
  if (answer === null) return true
  if (question.type === 'multiple_choice') {
    return Array.isArray(answer)
      && answer.length <= question.options.length
      && answer.every((value) => Number.isInteger(value) && value >= 0 && value < question.options.length)
      && new Set(answer).size === answer.length
  }
  return Number.isInteger(answer) && answer >= 0 && answer < question.options.length
}

export const calculateAssessmentResult = (questions, answers, passPercent, status, submittedAt = new Date()) => {
  const answersByQuestion = new Map(answers.map((answer) => [String(answer.questionId), answer]))
  const maxScore = questions.reduce((total, question) => total + question.points, 0)
  let score = 0
  let correctCount = 0
  let incorrectCount = 0
  let unansweredCount = 0
  questions.forEach((question) => {
    const answer = answersByQuestion.get(String(question.questionId || question._id))
    if (answer?.answer === null || answer?.answer === undefined || (Array.isArray(answer.answer) && answer.answer.length === 0)) unansweredCount += 1
    else if (answerIsCorrect(question, answer.answer)) {
      score += question.points
      correctCount += 1
    } else incorrectCount += 1
  })
  const percentage = maxScore ? Math.round((score / maxScore) * 100) : 0
  return {
    status,
    score,
    maxScore,
    percentage,
    correctCount,
    incorrectCount,
    unansweredCount,
    passed: passPercent == null ? null : percentage >= passPercent,
    submittedAt,
  }
}
