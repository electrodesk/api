import { execSync } from 'child_process'
import { copyFile } from 'fs/promises'

execSync('npm run build')
await copyFile('./package.json', './dist/package.json')
execSync('npm publish --registry http://localhost:4873 --folder ./dist', {
  stdio: 'inherit'
})
