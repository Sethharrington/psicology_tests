const mongodb = require("../database/connect");
const ObjectId = require("mongodb").ObjectId;
const { contactSchema } = require("./../validation/contactSchema");
const Api400Error = require("../error-handling/api400Error");
const Api404Error = require("../error-handling/api404Error");

const collection = "Contacts";

const getAll = async (req, res, next) => {
  /*
  #swagger.tags = ['Contacts']
  #swagger.description = 'Get all contacts'
  */
  try {
    const result = await mongodb.getDatabase().collection(collection).find({});
    result.toArray().then((contacts) => {
      res.setHeader("Content-Type", "application/json");
      res.status(200).json(contacts);
    });
  } catch (err) {
    next(err);
  }
};
const getById = async (req, res, next) => {
  /*
  #swagger.tags = ['Contacts']
  #swagger.description = 'Get a contact by id'
  */
  try {
    const contactId = new ObjectId(req.params.id);
    const result = await mongodb
      .getDatabase()
      .collection(collection)
      .find({ _id: contactId });

    const contacts = await result.toArray();

    if (contacts.length === 0) {
      throw new Api404Error("Contact not found");
    }
    res.setHeader("Content-Type", "application/json");
    res.status(200).json(contacts[0]);
  } catch (err) {
    next(err);
  }
};

const createContact = async (req, res, next) => {
  /* 
  #swagger.tags = ['Contacts']
  #swagger.description = 'Create a new contact'
  #swagger.parameters['body'] = {
    in: 'body',
    description: 'Contact information',
    required: true,
    schema: { $ref: '#/definitions/Contact' }
  }
  */
  try {
    console.log("Creating contact with data:", req.body);
    const validateResult = await contactSchema.validateAsync(req.body);
    const result = await mongodb
      .getDatabase()
      .collection(collection)
      .insertOne(validateResult);

    if (result.acknowledged) {
      res.setHeader("Content-Type", "application/json");
      res.status(201).json(result.insertedId);
    } else {
      throw new Api404Error("Failed to create contact");
    }
  } catch (err) {
    if (err.isJoi) {
      next(new Api400Error(err.message));
    } else {
      next(err);
    }
  }
};

const updateContact = async (req, res, next) => {
  /* 
  #swagger.tags = ['Contacts']
  #swagger.description = 'Update a contact by id'
  #swagger.parameters['body'] = {
    in: 'body',
    description: 'Contact information',
    required: true,
    schema: { $ref: '#/definitions/Contact' }
  }
  */
  try {
    const contactId = new ObjectId(req.params.id);
    const validateResult = await contactSchema.validateAsync(req.body);
    const result = await mongodb
      .getDatabase()
      .collection(collection)
      .updateOne({ _id: contactId }, { $set: validateResult });
    if (result.modifiedCount > 0) {
      res.setHeader("Content-Type", "application/json");
      res.status(200).json({ message: "Contact updated successfully" });
    } else if (result.matchedCount === 0) {
      throw new Api404Error("Contact not found");
    } else {
      throw new Api400Error("No changes made to contact, bad request");
    }
  } catch (err) {
    if (err.isJoi) {
      next(new Api400Error(err.message));
    } else {
      next(err);
    }
  }
};
const deleteContact = async (req, res, next) => {
  /*
  #swagger.tags = ['Contacts']
  #swagger.description = 'Delete a contact by id'
  */
  try {
    const contactId = new ObjectId(req.params.id);
    const result = await mongodb
      .getDatabase()
      .collection(collection)
      .deleteOne({ _id: contactId });
    if (result.deletedCount > 0) {
      res.setHeader("Content-Type", "application/json");
      res.status(200).json({ message: "Contact deleted successfully" });
    } else {
      throw new Api404Error("Contact not found");
    }
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getAll,
  getById,
  createContact,
  updateContact,
  deleteContact,
};
