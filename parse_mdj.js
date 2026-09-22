const fs = require('fs');

const data = JSON.parse(fs.readFileSync('diagram.mdj', 'utf8'));

function findEntities(obj, results = []) {
  if (obj && typeof obj === 'object') {
    if (obj._type === 'ERDEntity') {
      results.push(obj);
    }
    for (const key in obj) {
      findEntities(obj[key], results);
    }
  }
  return results;
}

const entities = findEntities(data);
const entMap = {};
entities.forEach(ent => {
  entMap[ent._id] = ent.name;
  console.log(`Entity: ${ent.name} -> ID: ${ent._id}`);
});

function findRelations(obj, results = []) {
  if (obj && typeof obj === 'object') {
    if (obj._type === 'ERDRelationship') {
      results.push(obj);
    }
    for (const key in obj) {
      findRelations(obj[key], results);
    }
  }
  return results;
}

const rels = findRelations(data);
rels.forEach(rel => {
  console.log(`Relation: ${entMap[rel.end1.reference.$ref]} <-> ${entMap[rel.end2.reference.$ref]}`);
});
