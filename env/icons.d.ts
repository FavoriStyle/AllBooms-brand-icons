type Icon = {
    css: string
    code: number
    svg: {
        path: string
        width: number
    }
}

const icons: Promise<Icon[]>

export default icons
