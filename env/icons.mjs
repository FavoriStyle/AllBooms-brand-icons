import { promises as fs } from 'fs'
import { resolve as resolvePath, extname } from 'path'
import projectDir from './projectDir'

const iconDir = 'src';

function nameOnly(file){
    return file.slice(0, -1 * extname(file).length)
}

function importIcon(file){
    return import(projectDir(iconDir, file)).then(({ default: icon }) => {
        const { code } = icon;
        delete icon.code;
        return {
            css: nameOnly(file),
            code,
            svg: icon,
        }
    })
}

export default (async () => {
    const targetIconDir = projectDir(iconDir);
    return await Promise.all((await fs.readdir(targetIconDir)).map(file => importIcon(file)))
})()
