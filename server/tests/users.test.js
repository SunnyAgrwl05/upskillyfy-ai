import { asUser, registerUser } from './helpers.js'
import User from '../models/User.js'
import ResumeProject from '../models/ResumeProject.js'

describe('DELETE /api/users/account', () => {
  test('requires password confirmation and removes the user private data', async () => {
    const account = await registerUser()
    await ResumeProject.create({
      owner: account.user.id,
      clientId: 'account-delete-project',
      name: 'Private resume',
      mainFile: 'main.tex',
      files: [{ path: 'main.tex', content: 'private source' }],
    })

    const denied = await asUser(account.token).delete('/api/users/account').send({ confirm: true, password: 'WrongPassword123!' })
    expect(denied.status).toBe(401)
    expect(await User.exists({ _id: account.user.id })).toBeTruthy()

    const deleted = await asUser(account.token).delete('/api/users/account').send({ confirm: true, password: account.credentials.password })
    expect(deleted.status).toBe(204)
    expect(await User.exists({ _id: account.user.id })).toBeFalsy()
    expect(await ResumeProject.exists({ owner: account.user.id })).toBeFalsy()
    expect((await asUser(account.token).get('/api/auth/me')).status).toBe(401)
  })
})
