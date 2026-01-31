const mongodb = require("../database/connect");
const ObjectId = require("mongodb").ObjectId;
const { testSchema } = require("./../validation/testSchema");
const Api400Error = require("../error-handling/api400Error");
const Api404Error = require("../error-handling/api404Error");

const collection = "Tests";

const getAll = async (req, res, next) => {
  /*
  #swagger.tags = ['Tests']
  #swagger.description = 'Get all tests'
  */
  try {
    const result = await mongodb.getDatabase().collection(collection).find({});
    result.toArray().then((tests) => {
      res.setHeader("Content-Type", "application/json");
      res.status(200).json(tests);
    });
  } catch (err) {
    next(err);
  }
};
const getById = async (req, res, next) => {
  /*
  #swagger.tags = ['Tests']
  #swagger.description = 'Get a test by id'
  */
  try {
    const testId = new ObjectId(req.params.id);
    const result = await mongodb
      .getDatabase()
      .collection(collection)
      .find({ _id: testId });

    const tests = await result.toArray();

    if (tests.length === 0) {
      throw new Api404Error("Test not found");
    }
    res.setHeader("Content-Type", "application/json");
    res.status(200).json(tests[0]);
  } catch (err) {
    next(err);
  }
};

const createTest = async (req, res, next) => {
  /* 
  #swagger.tags = ['Tests']
  #swagger.description = 'Create a new test'
  #swagger.parameters['body'] = {
    in: 'body',
    description: 'Test information',
    required: true,
    schema: { $ref: '#/definitions/Test' }
  }
  */
  try {
    console.log("Creating test with data:", req.body);
    const validateResult = await testSchema.validateAsync(req.body);
    const result = await mongodb
      .getDatabase()
      .collection(collection)
      .insertOne(validateResult);

    if (result.acknowledged) {
      res.setHeader("Content-Type", "application/json");
      res.status(201).json(result.insertedId);
    } else {
      throw new Api404Error("Failed to create test");
    }
  } catch (err) {
    if (err.isJoi) {
      next(new Api400Error(err.message));
    } else {
      next(err);
    }
  }
};

const updateTest = async (req, res, next) => {
  /* 
  #swagger.tags = ['Tests']
  #swagger.description = 'Update a test by id'
  #swagger.parameters['body'] = {
    in: 'body',
    description: 'Test information',
    required: true,
    schema: { $ref: '#/definitions/Test' }
  }
  */
  try {
    const testId = new ObjectId(req.params.id);
    const validateResult = await testSchema.validateAsync(req.body);
    const result = await mongodb
      .getDatabase()
      .collection(collection)
      .updateOne({ _id: testId }, { $set: validateResult });
    if (result.modifiedCount > 0) {
      res.setHeader("Content-Type", "application/json");
      res.status(200).json({ message: "Test updated successfully" });
    } else if (result.matchedCount === 0) {
      throw new Api404Error("Test not found");
    } else {
      throw new Api400Error("No changes made to test, bad request");
    }
  } catch (err) {
    if (err.isJoi) {
      next(new Api400Error(err.message));
    } else {
      next(err);
    }
  }
};
const deleteTest = async (req, res, next) => {
  /*
  #swagger.tags = ['Tests']
  #swagger.description = 'Delete a test by id'
  */
  try {
    const testId = new ObjectId(req.params.id);
    const result = await mongodb
      .getDatabase()
      .collection(collection)
      .deleteOne({ _id: testId });
    if (result.deletedCount > 0) {
      res.setHeader("Content-Type", "application/json");
      res.status(200).json({ message: "Test deleted successfully" });
    } else {
      throw new Api404Error("Test not found");
    }
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getAll,
  getById,
  createTest,
  updateTest,
  deleteTest,
};
