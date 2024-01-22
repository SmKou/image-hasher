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
const codes = {}

for (let f = 0; f < paths.length; ++f) {
    const image = async () => await jimp.read(paths[f])

    const getColor = () => {
        const arr = new Array(3)
        for (let i = 0; i < arr.length; ++i)
            arr[i] = Math.floor(Math.random() * 255)
        return `rgb(${arr.join(', ')})`
    }
    const color = getColor()

    /* No. of divisions & division[dLength] */
    const add = (arr, l, r) => {
        const lD = Math.floor(Math.random() * 40) + 20
        const rD = Math.floor(Math.random() * 40) + 20
        arr[l] = lD
        arr[r] = rD
        return lD + rD
    }
    const d = (dim, n = Math.floor(Math.random() * (Math.floor(dim / 75) - 3)) + 3) => {
        const nd = !(n & 1) ? n + 1 : n
        const a = new Array(nd)
        let sum = 0, mid = Math.floor(a.length / 2)
        for (let left = 0; left < mid; ++left)
            sum += add(a, left, a.length - 1 - left)
        a[mid] = nd * 60 - sum
        return [n, a]
    }
    const [nDH, aDH] = d(image.bitmap.width)
    const [nDV, aDV] = d(image.bitmap.height)

    /* Slice dimensions */
    const sW = image.bitmap.width / (nDH - 1)
    const sH = image.bitmap.height / (nDV - 1)

    /* Canvas dimensions */
    const cW = image.bitmap.width + (nDH * 60)
    const cH = image.bitmap.height + (nDV * 60)

    /* Canvas */
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

    /* Scrambled order of slices */
    const istack = (len) => {
        const arr = new Array(len)
        for (let i = 0; i < arr.length; ++i)
            arr[i] = i
        return arr
    }
    const ord = (ttl, stack = istack(ttl)) => {
        const arr = []
        while (stack.length) {
            if (stack.length === 1) {
                arr.push(stack[0])
                stack.pop()
                continue
            }
            const s = Math.floor(Math.random() * stack.length)
            arr.push(stack[s])
            stack.splice(s, 1)
        }
        return arr
    }
    const order = ord((nDH - 1) * (nDV - 1))

    /* Code for scrambled image */
    const code = (sW, nDHm, aDH, sH, nDVm, aDV) => {
        const arr = []
        arr.push(sW, sH, nDHm, nDVm)
        
        let min = arr.length, max = arr.length + aDH.length - 1, mid = Math.floor(aDH.length / 2)
        for (let i = min; i < max; ++i)
            arr.push(i - min >= mid ? aDH[i - min + 1] : aDH[i - min])
        
        min = arr.length, max = arr.length + aDV.length - 1, mid = Math.floor(aDV.length / 2)
        for (let i = min; i < max; ++i)
            arr.push(i - min >= mid ? aDV[i - min + 1] : aDV[i - min])
    
        return arr
    }
    codes[names[f]] = code(sW, nDH - 1, aDH, sH, nDV - 1, aDV).join('-')

    /* Place image slices => mosaic image */
    loadImage(paths[f]).then(img => {
        for (let i = 0; i < order.length; ++i) {
        }
        
        const buffer = cvs.toBuffer('image/png')
        fs.writeFileSync(`${names[f]}.png`, buffer)
    })
}

const content = 'const art = ' + JSON.stringify(codes)
fs.writeFile(`${process.env.DEST}/art-1.js`, content, err => { if (err) console.error(err) })