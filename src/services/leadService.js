const { Lead, Employee, Client } = require('../models');
const { Op } = require('sequelize');

class LeadService {
  /**
   * Get all leads with pagination
   */
  async getAllLeads(query = {}) {
    const {
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'DESC',
      search = '',
      status = '',
      assignedTo
    } = query;

    const offset = (page - 1) * limit;
    const where = {};

    if (search) {
      where[Op.or] = [
        { firstName: { [Op.iLike]: `%${search}%` } },
        { lastName: { [Op.iLike]: `%${search}%` } },
        { email: { [Op.iLike]: `%${search}%` } },
        { company: { [Op.iLike]: `%${search}%` } }
      ];
    }

    if (status) {
      where.status = status;
    }

    if (assignedTo) {
      where.assignedTo = assignedTo;
    }

    const { count, rows } = await Lead.findAndCountAll({
      where,
      include: [
        {
          model: Employee,
          as: 'assignedEmployee',
          attributes: ['id', 'firstName', 'lastName', 'email']
        },
        {
          model: Client,
          as: 'client',
          attributes: ['id', 'firstName', 'lastName', 'email', 'company']
        }
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [[sortBy, sortOrder]]
    });

    return {
      leads: rows,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(count / limit)
      }
    };
  }

  /**
   * Get lead by ID
   */
  async getLeadById(id) {
    const lead = await Lead.findByPk(id, {
      include: [
        {
          model: Employee,
          as: 'assignedEmployee',
          attributes: ['id', 'firstName', 'lastName', 'email']
        },
        {
          model: Client,
          as: 'client',
          attributes: ['id', 'firstName', 'lastName', 'email', 'company']
        }
      ]
    });

    if (!lead) {
      throw new Error('Lead not found');
    }

    return lead;
  }

  /**
   * Create new lead
   */
  async createLead(data) {
    if (data.assignedTo) {
      const employee = await Employee.findByPk(data.assignedTo);
      if (!employee) {
        throw new Error('Assigned employee not found');
      }
    }

    const lead = await Lead.create(data);
    return await this.getLeadById(lead.id);
  }

  /**
   * Update lead
   */
  async updateLead(id, data) {
    const lead = await Lead.findByPk(id);
    if (!lead) {
      throw new Error('Lead not found');
    }

    if (data.assignedTo) {
      const employee = await Employee.findByPk(data.assignedTo);
      if (!employee) {
        throw new Error('Assigned employee not found');
      }
    }

    if (data.clientId) {
      const client = await Client.findByPk(data.clientId);
      if (!client) {
        throw new Error('Client not found');
      }
    }

    await lead.update(data);
    return await this.getLeadById(id);
  }

  /**
   * Convert lead to client
   */
  async convertLead(id, clientId = null) {
    const lead = await Lead.findByPk(id);
    if (!lead) {
      throw new Error('Lead not found');
    }

    if (lead.status === 'converted') {
      throw new Error('Lead is already converted');
    }

    let client;

    if (clientId) {
      client = await Client.findByPk(clientId);
      if (!client) {
        throw new Error('Client not found');
      }
    } else {
      // Create new client from lead
      client = await Client.create({
        firstName: lead.firstName,
        lastName: lead.lastName,
        email: lead.email,
        phone: lead.phone,
        company: lead.company,
        assignedTo: lead.assignedTo,
        notes: `Converted from lead #${lead.id}. ${lead.notes || ''}`
      });
    }

    // Update lead
    await lead.update({
      status: 'converted',
      clientId: client.id,
      convertedAt: new Date()
    });

    return {
      lead: await this.getLeadById(id),
      client
    };
  }

  /**
   * Delete lead
   */
  async deleteLead(id) {
    const lead = await Lead.findByPk(id);
    if (!lead) {
      throw new Error('Lead not found');
    }

    await lead.destroy();
    return { message: 'Lead deleted successfully' };
  }
}

module.exports = new LeadService();
