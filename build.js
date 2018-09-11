process.stdout.write('Building... ');
const list = require('fs').readdirSync,
    processPath = require('path').resolve,
    webfontsGenerator = require('webfonts-generator'),
    srcDir = processPath(__dirname, 'src');
var files = [];
list(srcDir).forEach(f => files.push(processPath(srcDir, f)))
webfontsGenerator({
    files,
    dest: processPath(__dirname, 'dist'),
    fontName: 'allbooms-brand-icons',
    types: ['eot', 'woff2', 'woff', 'ttf', 'svg'],
    templateOptions: {
        classPrefix: 'allbooms-brand-icon-',
        baseSelector: '.allbooms-brand-icon'
    },
}, (error) => {
    if(error){
        console.log('Fail ', error);
    } else {
        console.log('Done.');
    }
});
