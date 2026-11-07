import '../config/dotenv.js'
import mongoose from 'mongoose'
import { env } from '../config/env.js'
import User from '../models/User.js'
import Hackathon from '../models/Hackathon.js'

const adminEmail = process.env.SEED_ADMIN_EMAIL?.trim().toLowerCase()
if (!adminEmail) throw new Error('Set SEED_ADMIN_EMAIL to an existing administrator account before seeding.')

await mongoose.connect(env.MONGODB_URI)
try {
  const admin = await User.findOne({ email: adminEmail, role: 'admin' }).select('_id').lean()
  if (!admin) throw new Error('SEED_ADMIN_EMAIL must belong to an existing admin user.')

  const now = Date.now()
  const day = 24 * 60 * 60 * 1000
  const eventData = [
    { slug: 'demo-climate-build', title: 'Climate Build Sprint', status: 'registration_open', isPublished: true, registrationStart: new Date(now - day), registrationDeadline: new Date(now + 14 * day), startDate: new Date(now + 18 * day), endDate: new Date(now + 20 * day) },
    { slug: 'demo-ai-for-good', title: 'AI for Good Lab', status: 'live', isPublished: true, registrationDeadline: new Date(now - day), startDate: new Date(now - day), endDate: new Date(now + day) },
    { slug: 'demo-future-fintech', title: 'Future Fintech Studio', status: 'ended', isPublished: true, registrationDeadline: new Date(now - 10 * day), startDate: new Date(now - 8 * day), endDate: new Date(now - 6 * day) },
    { slug: 'demo-education-lab', title: 'Education Innovation Lab', status: 'results_published', isPublished: true, registrationDeadline: new Date(now - 20 * day), startDate: new Date(now - 18 * day), endDate: new Date(now - 16 * day), resultsPublishedAt: new Date(now - 15 * day) },
    { slug: 'demo-cloud-challenge', title: 'Cloud for Communities Challenge', status: 'draft', isPublished: false, registrationDeadline: new Date(now + 30 * day), startDate: new Date(now + 35 * day), endDate: new Date(now + 37 * day) },
  ]
  for (const event of eventData) {
    const { slug, ...datesAndStatus } = event
    await Hackathon.updateOne({ slug }, { $set: {
      ...datesAndStatus,
      description: `Sample ${event.title} event for preview and development. Replace with approved event details before publishing.`,
      organiser: 'Upskillyfy Demo', mode: 'Virtual', isFree: true, fee: 0,
      domains: [
        { domainId: 'web', name: 'Web Development', description: 'Build accessible web experiences.', teamSizeMin: 1, teamSizeMax: 4, seatsTotal: 100 },
        { domainId: 'ai', name: 'Artificial Intelligence', description: 'Apply AI to a practical problem.', teamSizeMin: 1, teamSizeMax: 4, seatsTotal: 100 },
        { domainId: 'impact', name: 'Social Impact', description: 'Design a measurable community solution.', teamSizeMin: 1, teamSizeMax: 5, seatsTotal: 100 },
      ],
      rounds: [
        { roundId: 'proposal', title: 'Project proposal', startDate: new Date(now + day), endDate: new Date(now + 2 * day) },
        { roundId: 'final', title: 'Final submission', startDate: new Date(now + 5 * day), endDate: new Date(now + 8 * day) },
      ],
      eligibility: 'Open to students and early career builders.', rules: 'Submit original work and follow the event code of conduct.',
      createdBy: admin._id,
    } }, { upsert: true, runValidators: true })
  }
  console.log(`Seeded ${eventData.length} sample hackathons. Review draft and published details before using them in production.`)
} finally {
  await mongoose.disconnect()
}
