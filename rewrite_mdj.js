const fs = require('fs');

const data = JSON.parse(fs.readFileSync('diagram.mdj', 'utf8'));

const schema = {
  'Сервисы': {
    name: 'chemical_samples',
    cols: [
      { name: 'id', type: 'integer' },
      { name: 'title', type: 'varchar(255)' },
      { name: 'description', type: 'text' },
      { name: 'status', type: 'varchar(20)' },
      { name: 'image_url', type: 'text' },
      { name: 'video_url', type: 'text' },
      { name: 'impurities_percent', type: 'numeric(5,2)' },
      { name: 'gas_volume', type: 'integer' },
      { name: 'created_at', type: 'timestamp' },
      { name: 'formation_date', type: 'timestamp' },
      { name: 'creator_id', type: 'integer' }
    ]
  },
  'Пользователь': {
    name: 'users',
    cols: [
      { name: 'id', type: 'integer' },
      { name: 'username', type: 'varchar(100)' },
      { name: 'email', type: 'varchar(255)' }
    ]
  },
  'м-м': {
    name: 'sample_likes',
    cols: [
      { name: 'id', type: 'integer' },
      { name: 'user_id', type: 'integer' },
      { name: 'sample_id', type: 'integer' }
    ]
  }
};

let entities = [];
let relationships = [];
let diagram = null;

function traverse(obj, parent) {
  if (obj && typeof obj === 'object') {
    if (obj._type === 'ERDEntity') {
      entities.push({obj, parent});
    }
    if (obj._type === 'ERDRelationship') {
      relationships.push({obj, parent});
    }
    if (obj._type === 'ERDDiagram') {
      diagram = obj;
    }
    for (const key in obj) {
      if (Array.isArray(obj[key])) {
        obj[key].forEach(child => traverse(child, obj[key]));
      } else {
        traverse(obj[key], obj);
      }
    }
  }
}

traverse(data, null);

let ignoredEntityId = null;
let idMap = {}; // old name -> ID

entities.forEach(({obj, parent}) => {
  if (schema[obj.name]) {
    const oldName = obj.name;
    const s = schema[obj.name];
    obj.name = s.name;
    idMap[oldName] = obj._id;
    
    if (obj.columns) {
      obj.columns.splice(s.cols.length); // trim excess
      for (let i = 0; i < s.cols.length; i++) {
        if (!obj.columns[i]) {
            obj.columns.push({
                _type: 'ERDColumn',
                _id: 'AAAAA' + Math.random().toString(36).substr(2, 10).toUpperCase(),
                _parent: { $ref: obj._id },
                name: '',
                type: ''
            });
        }
        obj.columns[i].name = s.cols[i].name;
        obj.columns[i].type = s.cols[i].type;
      }
    }
  } else if (obj.name === 'Разработка') {
    ignoredEntityId = obj._id;
    const idx = parent.indexOf(obj);
    if (idx > -1) parent.splice(idx, 1);
  }
});

// Fix Relationships
// We want: 
// 1. users -> chemical_samples
// 2. users -> sample_likes
// 3. chemical_samples -> sample_likes
const requiredRels = [
  { end1: idMap['Пользователь'], end2: idMap['Сервисы'] },
  { end1: idMap['Пользователь'], end2: idMap['м-м'] },
  { end1: idMap['Сервисы'], end2: idMap['м-м'] }
];

let currentRelIndex = 0;

relationships.forEach(({obj, parent}) => {
    if (currentRelIndex < requiredRels.length) {
        const req = requiredRels[currentRelIndex];
        obj.end1.reference.$ref = req.end1;
        obj.end2.reference.$ref = req.end2;
        currentRelIndex++;
    } else {
        const idx = parent.indexOf(obj);
        if (idx > -1) parent.splice(idx, 1);
    }
});

if (diagram && diagram.ownedViews) {
  diagram.ownedViews = diagram.ownedViews.filter(view => {
    if (view._type === 'ERDEntityView' && view.model.$ref === ignoredEntityId) {
      return false;
    }
    if (view._type === 'ERDRelationshipView') {
        // Find if its model still exists in relationships
        const exists = relationships.some(r => r.obj._id === view.model.$ref);
        return exists;
    }
    return true;
  });
}

// Ensure ERDEntityViews only have the right number of ColumnViews
if (diagram && diagram.ownedViews) {
    diagram.ownedViews.forEach(view => {
        if (view._type === 'ERDEntityView') {
            const entityObj = entities.find(e => e.obj._id === view.model.$ref);
            if (entityObj && entityObj.obj.columns) {
                const numCols = entityObj.obj.columns.length;
                if (view.columnCompartment && view.columnCompartment.subViews) {
                    view.columnCompartment.subViews.splice(numCols);
                    // Update models
                    for(let i=0; i<numCols; i++) {
                        if (view.columnCompartment.subViews[i]) {
                           view.columnCompartment.subViews[i].model.$ref = entityObj.obj.columns[i]._id;
                           // reset text/visible to default
                           view.columnCompartment.subViews[i].visible = true;
                        }
                    }
                }
            }
        }
    });
}

fs.writeFileSync('diagram.mdj', JSON.stringify(data, null, 2), 'utf8');
console.log('Done!');
