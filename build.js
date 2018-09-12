const {readFileSync: read, writeFileSync: write} = require('fs'),
    {spawnSync: spawn} = require('child_process'),
    svg2ttf = require('svg2ttf'),
    list = require('fs').readdirSync,
    processPath = require('path').resolve,
    srcDir = processPath(__dirname, 'src'),
    distDir = processPath(__dirname, 'dist'),
    cheerio = require('cheerio'),
    {ttf2eot, ttf2woff} = ($PATH => {
        return new Proxy({}, {
            get(target, name){
                return (...args) => {
                    return spawn(processPath($PATH, name), args)
                }
            }
        })
    })(processPath(__dirname, 'node_modules/.bin')),
    ttf2woff2 = require('ttf2woff2');

function _name(fname){
    fname = fname.split('.');
    fname.pop();
    return fname.join('.');
}
list(srcDir).forEach(file => {
    if(!/\.svg$/.test(file)) return;
    var name = _name(file);
    process.stdout.write(`Building ${name}... `);
    // Conversion to ttf
    var ttfTarget = processPath(distDir, `${name}.ttf`),
        svgPath = processPath(srcDir, file),
        svgContent = read(svgPath, 'utf8');
    write(
        ttfTarget,
        Buffer.from(
            svg2ttf(svgContent, {}).buffer
        )
    );
    // conversion from ttf to eot and woff
    ttf2eot(ttfTarget, processPath(distDir, name + '.eot'));
    ttf2woff(ttfTarget, processPath(distDir, name + '.woff'));
    // conversion from ttf to woff2
    write(
        processPath(distDir, name + '.woff2'),
        ttf2woff2(read(ttfTarget))
    );
    // copying svg font to dist dir
    write(processPath(distDir, file), read(svgPath));
    // generating css
    const $ = cheerio.load(svgContent),
        glyphs = $('svg > defs > font > glyph[unicode][glyph-name]');
    if(!glyphs.length) throw new TypeError('There is no named glyphs in svg file');
    var css = '@font-face{font-family:';
    if(!glyphs[0].parent.attribs.id) throw new TypeError('Font has no "id" attribute');
    var fontName = `"${glyphs[0].parent.attribs.id.replace('\\', '\\\\', '"', '\\"')}"`;
    css += fontName +
        ';src:url("' +
        (name + '.woff2').replace('"', '\\"') + '")format("woff2"),url("' +
        (name + '.woff').replace('"', '\\"') + '")format("woff"),url("' +
        (name + '.ttf').replace('"', '\\"') + '")format("truetype"),url("' +
        (name + '.eot').replace('"', '\\"') + '?#iefix")format("embedded-opentype"),url("' +
        (name + '.svg').replace('"', '\\"') + '?#' + encodeURIComponent(glyphs[0].parent.attribs.id) + '")format("svg")}' +
        `i[class^="${name}-"]:before,i[class*=" ${name}-"]:before{font-family:${fontName}!important;speak:none;font-style:normal;font-weight:normal;font-variant:normal;text-transform:none;line-height:1;-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale}`
    Array.from(glyphs).forEach(glyph => {
        css += `i.${name}-${glyph.attribs['glyph-name']}:before{content:"\\${glyph.attribs.unicode.charCodeAt(0).toString(16)}"}`
    });
    write(
        processPath(distDir, name + '.css'),
        css,
        { encoding: 'utf-8' }
    );
    console.log('done');
});
