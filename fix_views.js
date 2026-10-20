const fs = require('fs');

const path = 'diagram.mdj';
const content = fs.readFileSync(path, 'utf-8');
let data = JSON.parse(content);

// Deeply walk to find ERDEntityView and ERDColumnView
function fixViews(obj) {
    if (obj && typeof obj === 'object') {
        if (obj._type === 'ERDEntityView') {
            const modelRef = obj.model.$ref;
            // find the entity model
            const entity = findModelById(data, modelRef);
            if (entity && entity.columns) {
                // rebuild column views
                const colCompartment = obj.columnCompartment;
                if (colCompartment) {
                    colCompartment.subViews = entity.columns.map(col => {
                        return {
                            _type: "ERDColumnView",
                            _id: "view_" + col._id,
                            _parent: { $ref: colCompartment._id },
                            model: { $ref: col._id },
                            font: "Arial;13;0",
                            left: colCompartment.left,
                            top: 0,
                            width: colCompartment.width,
                            height: 13
                        };
                    });
                }
            }
        }
        for (let key in obj) {
            fixViews(obj[key]);
        }
    }
}

function findModelById(obj, id) {
    if (obj && typeof obj === 'object') {
        if (obj._id === id) return obj;
        for (let key in obj) {
            const res = findModelById(obj[key], id);
            if (res) return res;
        }
    }
    return null;
}

fixViews(data);

fs.writeFileSync('diagram.mdj', JSON.stringify(data, null, 2));
console.log("Views fixed.");
