import rand from '../rand'
import fetch from 'node-fetch'
import host from './host'

function nl(count){
    if(!count) return '';
    return '\r\n' + nl(count - 1)
}

export default function(data){
    const boundary = rand();
    const boundaryMiddle = `--${boundary}${nl(1)}`;
    const boundaryLast = `--${boundary}--${nl(1)}`;
    const body = [
        nl(1),
        `Content-Disposition: form-data; name="config"; filename="font.json"${nl(1)}Content-Type: application/json${nl(2)}${JSON.stringify(data)}${nl(1)}`,
    ].join(boundaryMiddle) + boundaryLast;
    return fetch(host, {
        method: 'POST',
        headers: { 'Content-Type': `multipart/form-data; boundary=${boundary}` },
        body,
    }).then(r => r.text())
}
