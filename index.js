const { DBFFile } = require('dbffile');
const axios = require('axios');

function makeAgeKey(age) {
    if (isNaN(age)) {
        return 'n/a'
    }
    if (age <= 10) return '00 a 10'
    if (age <= 20) return '11 a 20'
    if (age <= 30) return '21 a 30'
    if (age <= 40) return '31 a 40'
    if (age <= 50) return '41 a 50'
    if (age <= 60) return '51 a 60'
    if (age <= 70) return '61 a 70'
    if (age <= 80) return '71 a 80'
    if (age <= 90) return '81 a 90'
    return '91 ou mais'
}

(async () => {
    let dbf = await DBFFile.open('./DO21OPEN.dbf');
    console.log(`DBF file contains ${dbf.recordCount} records.`);
    console.log(`Field names: ${dbf.fields.map(f => f.name).join(', ')}`);
    let summary = {}
    let i = 0;
    await dbf.readRecords(1463824, (record) => {
        if (++i % 100000 === 0) {
            console.log(i)
        }
        const nascAno = +record['DTNASC'].substring(4)
        const obtoAno = +record['DTOBITO'].substring(4)
        const mesObto = record['DTOBITO'].substring(2, 4)

        const key = `${obtoAno}-${mesObto}`;
        const monthData = summary[key] || { total: 0, idade: {} }
        summary[key] = monthData

        monthData.total++;
        const age = obtoAno - nascAno;
        const keyAge = makeAgeKey(age)
        monthData.idade[keyAge] = monthData.idade[keyAge] || 0
        monthData.idade[keyAge]++;
    });
    let lastMonth;
    Object.getOwnPropertyNames(summary).sort().forEach(monthKey => {
        const monthData = summary[monthKey]
        monthData.idadeChange = {}
        Object.getOwnPropertyNames(monthData.idade).sort().forEach(idadeKey => {
            if (lastMonth) {
                const change = (monthData.idade[idadeKey] / lastMonth.idade[idadeKey] - 1)
                monthData.idadeChange[idadeKey] = (change * 100).toFixed(2) + '%'
            }
        })
        lastMonth = monthData
    })
    console.log(summary)
    console.log('done')
})()