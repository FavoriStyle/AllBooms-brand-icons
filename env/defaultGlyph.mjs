import rand from './rand'

export default {
    get uid(){ return rand(32) },
    src: 'custom_icons',
    selected: true,
    search: [''],
}
