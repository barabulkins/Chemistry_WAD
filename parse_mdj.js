const fs = require('fs');

const path = 'diagram.mdj';
const content = fs.readFileSync(path, 'utf-8');
const data = JSON.parse(content);

function findEntities(obj) {
    let entities = [];
    if (obj && typeof obj === 'object') {
        if (obj._type === 'ERDEntity') {
            entities.push(obj);
        }
        for (let key in obj) {
            entities = entities.concat(findEntities(obj[key]));
        }
    }
    return entities;
}

const entities = findEntities(data);
entities.forEach(e => {
    console.log(`Table: ${e.name}`);
    if (e.columns) {
        e.columns.forEach(c => {
            console.log(`  - ${c.name} (${c.type}) pk:${c.primaryKey} fk:${c.foreignKey} ref:${c.referenceTo ? c.referenceTo.$ref : ''} length:${c.length} nullable:${c.isNullable}`);
        });
    }
});
