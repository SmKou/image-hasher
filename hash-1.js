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

    const genClr = () => Math.floor(Math.random() * 255)
    const color = `rgb(${genClr()}, ${genClr()}, ${genClr()})`

    const d = (dim) => {
        const n = Math.floor(Math.random() * Math.floor(dim / 75)) + 3
        const a = new Array(!(n & 1) ? n + 1 : n)
        let sum = 0
        let mid = Math.floor(a.length / 2)
        for (let left = 0; left < mid; ++left) {
            const ld = Math.floor(Math.random() * 40) + 20
            arr[left] = ld
            const rd = Math.floor(Math.random() * 40) + 20
            arr[a.length - 1 - left] = rd
            sum += (ld + rd)
        }
        a[mid] = a.length * 60 - sum

        return [n, a]
    }
    const [nDH, aDH] = d(image.bitmap.width)
    const [nDV, aDV] = d(image.bitmap.height)

    const sW = image.bitmap.width / (nDH - 1)
    const sH = image.bitmap.height / (nDV - 1)

    const cW = image.bitmap.width + (nDH * 60)
    const cH = image.bitmap.height + (nDV * 60)

    const cvs = createCanvas(cW, cH)
    const ctx = cvs.getContext('2d')

    let sum = 0
    for (let i = 0; i < aDH.length; ++i) {
        ctx.fillStyle = color
        ctx.fillRect(sum + (i * sW), 0, aDH[i], cH)
        sum += aDH[i]
    }

    sum = 0
    for (let i = 0; i < aDV.length; ++i) {
        ctx.fillStyle = color
        ctx.fillRect(0, sum + (i * sH), cW, aDV[i])
        sum += aDV[i]
    }

    const ttl = (nDH - 1) * (nDV - 1)
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
        ndhm: nDH - 1,
        ndvm: nDV - 1,
        adh: aDH,
        adv: aDV,
        o: order
    }

    sum = 0
    const xpos = aDH.map((e, i) => {
        const x = sum + (i * sW)
        sum += e
        return x
    })

    sum = 0
    const ypos = aDV.map((e, i) => {
        const y = sum + (i * sH)
        sum += e
        return y
    })

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