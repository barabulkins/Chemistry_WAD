const fs = require('fs');

const pathLab3 = '../lab3.mdj';
if(!fs.existsSync(pathLab3)) {
    console.error("lab3.mdj not found");
    process.exit(1);
}

const content = fs.readFileSync(pathLab3, 'utf-8');
let data = JSON.parse(content);

// Function to find entities by name
function findEntityByName(obj, name) {
    if (obj && typeof obj === 'object') {
        if (obj._type === 'ERDEntity' && obj.name === name) {
            return obj;
        }
        for (let key in obj) {
            const res = findEntityByName(obj[key], name);
            if (res) return res;
        }
    }
    return null;
}

const usersTbl = findEntityByName(data, ' construction_service_users') || findEntityByName(data, 'construction_service_users');
if (usersTbl) {
    usersTbl.name = 'users';
    usersTbl.columns.forEach(c => {
        if(c.name === 'user_id') c.name = 'id';
    });
    // email might be missing, add it
    if (!usersTbl.columns.find(c => c.name === 'email')) {
        const idCol = usersTbl.columns[0];
        // naive deep copy
        const emailCol = JSON.parse(JSON.stringify(idCol));
        emailCol._id = "col_" + Date.now() + Math.random();
        emailCol.name = 'email';
        emailCol.type = 'VARCHAR';
        emailCol.length = '255';
        emailCol.primaryKey = false;
        usersTbl.columns.splice(2, 0, emailCol);
    }
}

const samplesTbl = findEntityByName(data, 'construction_service_items');
if (samplesTbl) {
    samplesTbl.name = 'chemical_samples';
    samplesTbl.columns.forEach(c => {
        if(c.name === 'item_id') c.name = 'id';
        if(c.name === 'price') { c.name = 'impurities_percent'; c.type = 'DECIMAL'; c.length = '5,2'; c.isNullable = true; }
        if(c.name === 'area') { c.name = 'gas_volume'; c.type = 'INTEGER'; c.isNullable = true; }
        if(c.name === 'description') { c.isNullable = true; }
        if(c.name === 'image_url') { c.isNullable = true; }
        if(c.name === 'video_url') { c.isNullable = true; }
        if(c.name === 'formed_at') { c.name = 'formation_date'; c.isNullable = true; }
    });
}

const likesTbl = findEntityByName(data, 'construction_service_likes');
if (likesTbl) {
    likesTbl.name = 'sample_likes';
    likesTbl.columns.forEach(c => {
        if(c.name === 'like_id') c.name = 'id';
        if(c.name === 'item_id') c.name = 'sample_id';
    });
}

// Find diagram to turn off grid
function setGridOff(obj) {
    if (obj && typeof obj === 'object') {
        if (obj._type === 'ERDDiagram') {
            obj.showGrid = false;
        }
        for (let key in obj) {
            setGridOff(obj[key]);
        }
    }
}
setGridOff(data);

fs.writeFileSync('diagram.mdj', JSON.stringify(data, null, 2));
console.log("diagram.mdj overwritten with lab3 template modified for chemistry_wad3");
