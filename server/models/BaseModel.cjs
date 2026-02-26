const { Model } = require('objection');
const Ajv = require('ajv');
const addFormats = require('ajv-formats');
const ajv = new Ajv();
addFormats(ajv);

class BaseModel extends Model {
  static get modelPaths() {
    return [__dirname];
  }
}

BaseModel.ajv = ajv;

module.exports = BaseModel