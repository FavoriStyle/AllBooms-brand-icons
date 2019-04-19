import icons from './env/icons'
import defaultGlyph from './env/defaultGlyph'
import initialConfig from './env/initialConfig'
import upload from './env/fontello/uploadJSON'
import saveBuilt from './env/fontello/saveBuilt'

const write = process.stdout.write.bind(process.stdout);
const writeLn = console.log;

(async () => {
    const config = initialConfig;
    write('Loading icons... ');
    (await icons).forEach(icon => config.glyphs.push(Object.assign({}, icon, defaultGlyph)));
    writeLn('ok');
    write('Uploading config to fontello... ');
    const sessionId = await upload(config);
    writeLn('ok. Session id:', sessionId);
    write('Downloading and processing font data... ');
    await saveBuilt(sessionId);
    writeLn('ok')
})();
