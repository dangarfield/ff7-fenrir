const getMateriaData = () => { return window.data.kernel.materiaData }

const setMateriaToInventory = (position, id, ap) => {
    const materia = {
        id: id,
        ap: ap,
        name: getMateriaData()[id].name,
        description: getMateriaData()[id].description
    }
    window.data.savemap.materias[position] = materia
}
const debugFillMateria = () => {
    const materias = window.data.savemap.materias
    for (let i = 0; i < materias.length; i++) {
        const materia = materias[i]
        if (materia.id === 255) {
            const randomMateria = getMateriaData()[Math.floor(Math.random() * getMateriaData().length)]
            setMateriaToInventory(i, randomMateria.index, 0)
        }
    }
    console.log('debugFillMateria - window.data.savemap', window.data.savemap)
}
export {
    debugFillMateria
}