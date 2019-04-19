import fetch from 'node-fetch'
import host from './host'
import projectDir from '../projectDir'
import { promises as fs } from 'fs'
import Zip from 'adm-zip'
import rimraf from 'rimraf'

function rm(path){
    return new Promise(r => rimraf(path, r))
}

const distDir = 'dist';
const neededFontName = 'allbooms-brand-icons';

const isBannedName = RegExp.prototype.test.bind(/^([^\/]*|css\/fontello-[^\/]+)$/i)

/** @returns {Promise<Buffer>} */
function getEntryData(entry){
    return new Promise(r => entry.getDataAsync(data => r(data)))
}
/**
 * @template T
 * @type {(data: T) => T}
 */
function processEntryData(data){
    if(data.name === 'css/fontello.css') return Object.assign(data, {
        data: Buffer.from(data.data.toString('utf8').replace(/fontello/g, neededFontName), 'utf8'),
        name: `css/${neededFontName}.css`,
    });
    if(data.name.startsWith('font/')) return Object.assign(data, {
        name: data.name.replace(/\/fontello\./, `/${neededFontName}.`),
    });
    return data
}

async function processZipEntry(entry){
    /** @type {string} */
    const name = entry.entryName.replace(/^fontello-[^\/]+\//, '');
    /** @type {boolean} */
    const dir = entry.isDirectory;
    if(isBannedName(name)) return null;
    const res = {
        name,
        isDirectory: dir,
        data: dir ? undefined : await getEntryData(entry)
    };
    return dir ? res : processEntryData(res)
}

async function decompress(buf){
    const zip = new Zip(buf);
    return await Promise.all(zip.getEntries().map(processZipEntry));
}

export default async id => {
    const distFullPath = projectDir(distDir);
    await rm(distFullPath);
    await fs.mkdir(distFullPath);
    const buf = Buffer.from(await fetch(`${host}${id}/get`).then(r => r.arrayBuffer()));
    const zipEntries = (await decompress(buf)).filter(v => v);
    const fileWritings = [];
    for(let i = 0; i < zipEntries.length; i++){
        const { name, isDirectory, data } = zipEntries[i];
        const fullPath = projectDir(distDir, name);
        if(isDirectory) await fs.mkdir(fullPath);
        else fileWritings.push(fs.writeFile(fullPath, data))
    }
    await Promise.all(fileWritings)
}
