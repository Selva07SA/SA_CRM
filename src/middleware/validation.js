const Joi = require('joi');

/**
 * Validation middleware factory
 * Creates middleware to validate request data using Joi schemas
 */
const validate = (schema, property = 'body') => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req[property], {
      abortEarly: false,
      stripUnknown: true
    });

    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }));

      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors
      });
    }

    req[property] = value;
    next();
  };
};

// Validation schemas
const schemas = {
  // Employee schemas
  createEmployee: Joi.object({
    firstName: Joi.string().min(1).max(100).required(),
    lastName: Joi.string().min(1).max(100).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    role: Joi.string().valid('admin', 'sales', 'support').default('sales'),
    phone: Joi.string().max(20).allow('', null)
  }),

  updateEmployee: Joi.object({
    firstName: Joi.string().min(1).max(100),
    lastName: Joi.string().min(1).max(100),
    email: Joi.string().email(),
    password: Joi.string().min(6),
    role: Joi.string().valid('admin', 'sales', 'support'),
    phone: Joi.string().max(20).allow('', null),
    isActive: Joi.boolean()
  }),

  login: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required()
  }),

  // Client schemas
  createClient: Joi.object({
    firstName: Joi.string().min(1).max(100).required(),
    lastName: Joi.string().min(1).max(100).required(),
    email: Joi.string().email().required(),
    phone: Joi.string().max(20).allow('', null),
    company: Joi.string().max(200).allow('', null),
    address: Joi.string().allow('', null),
    notes: Joi.string().allow('', null),
    assignedTo: Joi.number().integer().positive().allow(null),
    status: Joi.string().valid('active', 'inactive', 'archived').default('active')
  }),

  updateClient: Joi.object({
    firstName: Joi.string().min(1).max(100),
    lastName: Joi.string().min(1).max(100),
    email: Joi.string().email(),
    phone: Joi.string().max(20).allow('', null),
    company: Joi.string().max(200).allow('', null),
    address: Joi.string().allow('', null),
    notes: Joi.string().allow('', null),
    assignedTo: Joi.number().integer().positive().allow(null),
    status: Joi.string().valid('active', 'inactive', 'archived')
  }),

  // Lead schemas
  createLead: Joi.object({
    firstName: Joi.string().min(1).max(100).required(),
    lastName: Joi.string().min(1).max(100).required(),
    email: Joi.string().email().required(),
    phone: Joi.string().max(20).allow('', null),
    company: Joi.string().max(200).allow('', null),
    source: Joi.string().max(100).allow('', null),
    status: Joi.string().valid('new', 'contacted', 'qualified', 'converted').default('new'),
    notes: Joi.string().allow('', null),
    assignedTo: Joi.number().integer().positive().allow(null)
  }),

  updateLead: Joi.object({
    firstName: Joi.string().min(1).max(100),
    lastName: Joi.string().min(1).max(100),
    email: Joi.string().email(),
    phone: Joi.string().max(20).allow('', null),
    company: Joi.string().max(200).allow('', null),
    source: Joi.string().max(100).allow('', null),
    status: Joi.string().valid('new', 'contacted', 'qualified', 'converted'),
    notes: Joi.string().allow('', null),
    assignedTo: Joi.number().integer().positive().allow(null),
    clientId: Joi.number().integer().positive().allow(null)
  }),

  convertLead: Joi.object({
    clientId: Joi.number().integer().positive().allow(null)
  }),

  // Subscription Plan schemas
  createSubscriptionPlan: Joi.object({
    name: Joi.string().min(1).max(100).required(),
    description: Joi.string().allow('', null),
    price: Joi.number().min(0).required(),
    billingCycle: Joi.string().valid('monthly', 'quarterly', 'yearly').default('monthly'),
    features: Joi.array().items(Joi.string()).default([]),
    isActive: Joi.boolean().default(true)
  }),

  updateSubscriptionPlan: Joi.object({
    name: Joi.string().min(1).max(100),
    description: Joi.string().allow('', null),
    price: Joi.number().min(0),
    billingCycle: Joi.string().valid('monthly', 'quarterly', 'yearly'),
    features: Joi.array().items(Joi.string()),
    isActive: Joi.boolean()
  }),

  // Subscription schemas
  createSubscription: Joi.object({
    clientId: Joi.number().integer().positive().required(),
    planId: Joi.number().integer().positive().required(),
    startDate: Joi.date().default('now'),
    endDate: Joi.date().required(),
    paymentStatus: Joi.string().valid('pending', 'paid', 'failed', 'refunded').default('pending'),
    notes: Joi.string().allow('', null)
  }),

  updateSubscription: Joi.object({
    status: Joi.string().valid('active', 'expired', 'canceled'),
    paymentStatus: Joi.string().valid('pending', 'paid', 'failed', 'refunded'),
    endDate: Joi.date(),
    renewalDate: Joi.date().allow(null),
    notes: Joi.string().allow('', null)
  }),

  // Query parameters
  pagination: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10),
    sortBy: Joi.string().default('createdAt'),
    sortOrder: Joi.string().valid('ASC', 'DESC').default('DESC')
  })
};

module.exports = {
  validate,
  schemas
};
