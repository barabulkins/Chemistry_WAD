const fs = require('fs');
const path = 'diagram.mdj';
const content = fs.readFileSync(path, 'utf-8');
let data = JSON.parse(content);

function fixNullable(obj) {
    if (obj && typeof obj === 'object') {
        if (obj._type === 'ERDColumn') {
            // we want specific columns in chemical_samples to be nullable
            const isChemicalSampleCol = obj._parent && data && JSON.stringify(data).includes(obj._parent.$ref) && JSON.stringify(data).includes('chemical_samples');
            // actually it's easier to just do it safely
            if (obj.isNullable === true) {
                obj.nullable = true;
                delete obj.isNullable;
            }
        }
        for (let key in obj) {
            fixNullable(obj[key]);
        }
    }
}
fixNullable(data);
fs.writeFileSync('diagram.mdj', JSON.stringify(data, null, 2));
console.log("Fixed nullable fields.");
