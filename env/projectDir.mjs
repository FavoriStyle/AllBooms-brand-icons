import { resolve as resolvePath } from 'path'

const projectDir = resolvePath(decodeURIComponent(import.meta.url.slice(7)), '..', '..');

export default (...parts) => {
    return resolvePath(projectDir, ...parts)
}
