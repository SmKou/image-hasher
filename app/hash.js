const { createCanvas, loadImage } = require("canvas")
const jimp = require('jimp')
const fs = require("fs")

/* Generate code images -------------------------------- */
const dir = process.env.DIR
const names = [], paths = []

const fileList = fs.readdirSync()
for (const file of fileList) {
    const name = file.includes('-min') ? file.slice(0, file.length - 8) : file.slice(0, file.length - 4)
    names.push(name)
    paths.push(`${dir}/${name}`)
}
const destruct = {}

for (let f = 0; f < paths.length; ++f) {
    const image = async () => await jimp.read(paths[f])
    const cW = image.bitmap.width
    const nW = Math.floor(Math.random() * Math.floor(cW / 75)) + 3
    const sW = image.bitmap.width / nW
    const cH = image.bitmap.height
    const nH = Math.floor(Math.random() * Math.floor(cH / 75)) + 3
    const sH = image.bitmap.height / nH

    const cvs = createCanvas(cW, cH)
    const ctx = cvs.getContext('2d')

    const ttl = nW * nH
    const stack = new Array(ttl)
    for (let i = 0; i < stack.length; ++i) stack[i] = i

    const order = []
    while (stack.length) {
        if (stack.length === 1) {
            order.push(stack[0])
            stack.pop()
            continue
        }
        const s = Math.floor(Math.random() * stack.length)
        order.push(stack[s])
        stack.splice(s, 1)
    }

    destruct[names[f]] = {
        sw: sW,
        sh: sH,
        nw: nW,
        nh: nH,
        o: order
    }

    loadImage(paths[f]).then(img => {
        for (let i = 0; i < order.length; ++i) {
            // ctx.drawImage(sx, sy, swidth, sheight, dx, dy, dwidth, dheight)
        }
        
        const buffer = cvs.toBuffer('image/png')
        fs.writeFileSync(`${names[f]}.png`, buffer)
    })
}

const content = 'const art = ' + JSON.stringify(codes)
fs.writeFile(`${process.env.DEST}/art-1.js`, content, err => { if (err) console.error(err) })