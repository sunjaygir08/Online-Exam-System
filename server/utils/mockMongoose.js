const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

// Filter fields helper
function filterFields(obj, fieldsString) {
  if (!fieldsString) return { ...obj };
  const fields = fieldsString.split(' ');
  const result = { _id: obj._id, id: obj.id || obj._id };
  let hasPositive = false;
  let hasNegative = false;
  
  fields.forEach(f => {
    if (f.startsWith('-')) {
      hasNegative = true;
    } else if (f) {
      hasPositive = true;
    }
  });

  if (hasNegative) {
    const copy = { ...obj };
    fields.forEach(f => {
      if (f.startsWith('-')) {
        delete copy[f.substring(1)];
      }
    });
    return copy;
  }

  if (hasPositive) {
    fields.forEach(f => {
      if (f && !f.startsWith('-')) {
        result[f] = obj[f];
      }
    });
    return result;
  }

  return { ...obj };
}

// Simple matcher
function matchQuery(doc, query) {
  if (!query) return true;
  for (const key in query) {
    const val = query[key];
    
    if (key === '$or' && Array.isArray(val)) {
      let anyMatch = false;
      for (const subQuery of val) {
        if (matchQuery(doc, subQuery)) {
          anyMatch = true;
          break;
        }
      }
      if (!anyMatch) return false;
      continue;
    }
    
    const docVal = doc[key];
    
    if (val && typeof val === 'object' && !Array.isArray(val)) {
      if ('$exists' in val) {
        const exists = docVal !== undefined;
        if (exists !== val.$exists) return false;
      }
      if ('$size' in val) {
        const arr = Array.isArray(docVal) ? docVal : [];
        if (arr.length !== val.$size) return false;
      }
      if ('$in' in val) {
        const arr = Array.isArray(val.$in) ? val.$in : [];
        const strVal = docVal ? docVal.toString() : '';
        if (!arr.map(x => x ? x.toString() : '').includes(strVal)) return false;
      }
    } else {
      if (Array.isArray(docVal)) {
        const strVal = val ? val.toString() : '';
        const strArr = docVal.map(x => x ? x.toString() : '');
        if (!strArr.includes(strVal)) return false;
      } else {
        const strDocVal = docVal ? docVal.toString() : '';
        const strVal = val ? val.toString() : '';
        if (strDocVal !== strVal) return false;
      }
    }
  }
  return true;
}

class MockSchema {
  constructor(definition, options) {
    this.definition = definition;
    this.options = options;
    this.methods = {};
    this.statics = {};
    this.pres = {};
  }
  
  pre(hookName, fn) {
    this.pres[hookName] = this.pres[hookName] || [];
    this.pres[hookName].push(fn);
  }
}

class MockDocument {
  constructor(data, model) {
    const isExisting = !!(data && data._id);
    Object.assign(this, data);
    
    // Apply schema defaults
    if (model && model.schema && model.schema.definition) {
      for (const key in model.schema.definition) {
        const fieldDef = model.schema.definition[key];
        if (this[key] === undefined) {
          if (Array.isArray(fieldDef)) {
            this[key] = [];
          } else if (fieldDef && typeof fieldDef === 'object' && 'default' in fieldDef) {
            const defVal = fieldDef.default;
            this[key] = typeof defVal === 'function' ? defVal() : defVal;
          }
        }
      }
    }

    this._id = this._id || uuidv4();
    this.id = this._id;
    this.createdAt = this.createdAt || new Date().toISOString();
    this.updatedAt = this.updatedAt || new Date().toISOString();
    this._model = model;
    this.isNew = !isExisting;
    this._modifiedPaths = new Set();
    
    if (!isExisting) {
      Object.keys(data || {}).forEach(k => this._modifiedPaths.add(k));
    }

    // Define getters/setters to track modifications
    if (model && model.schema && model.schema.definition) {
      for (const key in model.schema.definition) {
        let val = this[key];
        Object.defineProperty(this, key, {
          get() { return val; },
          set(newVal) {
            if (val !== newVal) {
              val = newVal;
              this._modifiedPaths.add(key);
            }
          },
          enumerable: true,
          configurable: true
        });
      }
    }
  }
  
  isModified(path) {
    return this._modifiedPaths.has(path);
  }
  
  toObject() {
    const obj = {};
    for (const key of Object.keys(this)) {
      if (key === '_model' || key === '_modifiedPaths' || key === 'isNew') continue;
      obj[key] = this[key];
    }
    return obj;
  }
  
  toJSON() {
    return this.toObject();
  }
  
  toString() {
    return this._id;
  }
  
  async save() {
    this.updatedAt = new Date().toISOString();
    const pres = this._model.schema.pres['save'] || [];
    for (const preFn of pres) {
      await new Promise((resolve, reject) => {
        preFn.call(this, (err) => {
          if (err) reject(err);
          else resolve();
        });
      });
    }
    
    const data = this._model.readData();
    const index = data.findIndex(d => d._id === this._id);
    const plainObj = this.toObject();
    if (index >= 0) {
      data[index] = plainObj;
    } else {
      data.push(plainObj);
    }
    this._model.writeData(data);
    return this;
  }
}

class MockQuery {
  constructor(promise, model) {
    this.promise = promise;
    this.model = model;
    this.populatePaths = [];
    this.sortOption = null;
    this.selectFields = null;
  }
  
  populate(path, fields) {
    this.populatePaths.push({ path, fields });
    return this;
  }
  
  sort(options) {
    this.sortOption = options;
    return this;
  }
  
  select(fields) {
    this.selectFields = fields;
    return this;
  }
  
  then(onFulfilled, onRejected) {
    let chain = this.promise;
    
    // Sort
    if (this.sortOption) {
      chain = chain.then(res => {
        if (!res || !Array.isArray(res)) return res;
        const key = Object.keys(this.sortOption)[0];
        const dir = this.sortOption[key];
        res.sort((a, b) => {
          const valA = a[key];
          const valB = b[key];
          if (valA < valB) return -dir;
          if (valA > valB) return dir;
          return 0;
        });
        return res;
      });
    }
    
    // Populate
    if (this.populatePaths.length > 0) {
      chain = chain.then(async (res) => {
        if (!res) return res;
        const isArray = Array.isArray(res);
        const docs = isArray ? res : [res];
        
        for (const pop of this.populatePaths) {
          const schemaDef = this.model.schema.definition[pop.path];
          let refModelName = null;
          
          if (schemaDef) {
            if (Array.isArray(schemaDef)) {
              refModelName = schemaDef[0].ref;
            } else if (schemaDef.ref) {
              refModelName = schemaDef.ref;
            } else if (schemaDef.type && schemaDef.type.ref) {
              refModelName = schemaDef.type.ref;
            }
          }
          
          if (refModelName) {
            const refModel = mockMongoose.models[refModelName];
            if (refModel) {
              const refData = refModel.readData();
              
              for (const doc of docs) {
                const refVal = doc[pop.path];
                if (Array.isArray(refVal)) {
                  doc[pop.path] = refVal.map(id => {
                    const matchedRef = refData.find(d => d._id === id.toString() || d.id === id.toString());
                    return matchedRef ? filterFields(matchedRef, pop.fields) : id;
                  });
                } else if (refVal) {
                  const matchedRef = refData.find(d => d._id === refVal.toString() || d.id === refVal.toString());
                  if (matchedRef) {
                    doc[pop.path] = filterFields(matchedRef, pop.fields);
                  }
                }
              }
            }
          }
        }
        return res;
      });
    }
    
    // Select
    if (this.selectFields) {
      chain = chain.then(res => {
        if (!res) return res;
        const docs = Array.isArray(res) ? res : [res];
        const fields = this.selectFields.split(' ');
        docs.forEach(doc => {
          fields.forEach(f => {
            if (f.startsWith('-')) {
              const fieldName = f.substring(1);
              delete doc[fieldName];
            }
          });
        });
        return res;
      });
    }
    
    return chain.then(onFulfilled, onRejected);
  }
}

const mockMongoose = {
  Schema: MockSchema,
  models: {},
  
  model(modelName, schema) {
    if (mockMongoose.models[modelName]) {
      return mockMongoose.models[modelName];
    }
    
    const filePath = path.join(__dirname, '../data', `${modelName.toLowerCase()}s.json`);
    
    class Model extends MockDocument {
      constructor(data) {
        super(data, Model);
        if (schema) {
          for (const methodName in schema.methods) {
            this[methodName] = schema.methods[methodName];
          }
        }
      }
      
      static get schema() {
        return schema;
      }
      
      static readData() {
        if (!fs.existsSync(filePath)) return [];
        try {
          return JSON.parse(fs.readFileSync(filePath, 'utf8'));
        } catch (e) {
          return [];
        }
      }
      
      static writeData(data) {
        const dir = path.dirname(filePath);
        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir, { recursive: true });
        }
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
      }
      
      static find(query) {
        const docs = this.readData().map(d => new this(d));
        const matched = docs.filter(doc => matchQuery(doc, query));
        return new MockQuery(Promise.resolve(matched), this);
      }
      
      static findOne(query) {
        const docs = this.readData().map(d => new this(d));
        const matched = docs.find(doc => matchQuery(doc, query));
        return new MockQuery(Promise.resolve(matched || null), this);
      }
      
      static findById(id) {
        const docs = this.readData().map(d => new this(d));
        const matched = docs.find(doc => doc._id === id || doc.id === id);
        return new MockQuery(Promise.resolve(matched || null), this);
      }
      
      static findByIdAndDelete(id) {
        const data = this.readData();
        const index = data.findIndex(d => d._id === id || d.id === id);
        let deletedDoc = null;
        if (index >= 0) {
          deletedDoc = new this(data[index]);
          data.splice(index, 1);
          this.writeData(data);
        }
        return new MockQuery(Promise.resolve(deletedDoc), this);
      }
      
      static findByIdAndRemove(id) {
        return this.findByIdAndDelete(id);
      }
      
      static deleteMany(query) {
        const data = this.readData();
        const remaining = data.filter(d => !matchQuery(d, query));
        const deletedCount = data.length - remaining.length;
        this.writeData(remaining);
        return new MockQuery(Promise.resolve({ deletedCount }), this);
      }
      
      static findByIdAndUpdate(id, update, options) {
        const data = this.readData();
        const index = data.findIndex(d => d._id === id || d.id === id);
        let doc = null;
        if (index >= 0) {
          Object.assign(data[index], update);
          data[index].updatedAt = new Date().toISOString();
          doc = new this(data[index]);
          this.writeData(data);
        }
        return new MockQuery(Promise.resolve(doc), this);
      }
    }
    
    // Copy statics
    if (schema) {
      for (const staticName in schema.statics) {
        Model[staticName] = schema.statics[staticName];
      }
    }
    
    mockMongoose.models[modelName] = Model;
    return Model;
  },
  
  connect() {
    return Promise.resolve({
      connection: {
        host: 'local-file-db'
      }
    });
  },
  
  connection: {
    on(event, cb) {
      if (event === 'connected') cb();
    },
    once(event, cb) {
      if (event === 'open') cb();
    }
  }
};

mockMongoose.Schema.Types = {
  ObjectId: String
};

mockMongoose.Types = {
  ObjectId: (val) => val || uuidv4()
};

module.exports = mockMongoose;
