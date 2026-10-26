const path = require('node:path')
const { spawnSync } = require('node:child_process')

const root = process.env.INIT_CWD || process.cwd()
const client = path.join(root, 'client')

let result

if (process.platform === 'win32' && root.startsWith('\\\\')) {
  result = spawnSync(
    process.env.ComSpec || 'cmd.exe',
    [
      '/d',
      '/v:on',
      '/c',
      `pushd ${client} && npm run dev & set "exitCode=!ERRORLEVEL!" & popd & exit /b !exitCode!`,
    ],
    { stdio: 'inherit' }
  )
} else {
  result = spawnSync(
    process.platform === 'win32' ? 'npm.cmd' : 'npm',
    ['run', 'dev'],
    { cwd: client, stdio: 'inherit', shell: process.platform === 'win32' }
  )
}

if (result.error) {
  console.error(result.error)
  process.exitCode = 1
} else {
  process.exitCode = result.status ?? 1
}
