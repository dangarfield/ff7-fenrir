const exampleMethodToBeUsed = () => {
    let datas = []
    r.offset = 0
    // r.readByte()
    while (r.offset < 1206) {
        const origOffset = r.offset

        r.offset = origOffset
        const line = r.offset

        r.offset = origOffset
        const byte = r.readUByte()
        r.offset = origOffset
        const short = r.readShort()
        r.offset = origOffset
        const int = r.readInt()
        r.offset = origOffset + 1
        datas.push({
            line, byte, short, int
        })
        // console.log(`'--|${r.readString(120)}|--`)
        // console.log(r.offset, '-', r.readInt())
        //     r.offset += 120
    }
    // console.log('datas', datas)
    let md = `# ${name}\nLine|Byte|Short1|Short2|Int1|Int2|Int3|Int4\n---|---|---|---|---|---|---|---\n`
    for (let i = 0; i < datas.length; i++) {
        const data = datas[i]
        md += `${data.line}|${data.byte}|${i % 2 ? '' : data.short}|${(i - 1) % 2 ? '' : data.short}|${(i - 0) % 4 ? '' : data.int}|${(i - 1) % 4 ? '' : data.int}|${(i - 2) % 4 ? '' : data.int}|${(i - 3) % 4 ? '' : data.int}\n`
    }
    // console.log('md', md)
    const mdPath = path.join(__dirname, '..', '..', 'ff7-fenrir', 'workings-out', 'output', 'workingout.md')
    console.log('mdPath', mdPath)
    await fs.writeFile(mdPath, md)
}