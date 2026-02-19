const { Client, Employee, Lead, Subscription } = require('../models');
const { Op } = require('sequelize');

class ClientService {
  /**
   * Get all clients with pagination
   */
  async getAllClients(query = {}) {
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

    const { count, rows } = await Client.findAndCountAll({
      where,
      include: [
        {
          model: Employee,
          as: 'assignedEmployee',
          attributes: ['id', 'firstName', 'lastName', 'email']
        }
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [[sortBy, sortOrder]]
    });

    return {
      clients: rows,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(count / limit)
      }
    };
  }

  /**
   * Get client by ID with related data
   */
  async getClientById(id) {
    const client = await Client.findByPk(id, {
      include: [
        {
          model: Employee,
          as: 'assignedEmployee',
          attributes: ['id', 'firstName', 'lastName', 'email']
        },
        {
          model: Lead,
          as: 'leads',
          attributes: ['id', 'firstName', 'lastName', 'email', 'status', 'createdAt']
        },
        {
          model: Subscription,
          as: 'subscriptions',
          include: ['plan']
        }
      ]
    });

    if (!client) {
      throw new Error('Client not found');
    }

    return client;
  }

  /**
   * Create new client
   */
  async createClient(data) {
    if (data.assignedTo) {
      const employee = await Employee.findByPk(data.assignedTo);
      if (!employee) {
        throw new Error('Assigned employee not found');
      }
    }

    const client = await Client.create(data);
    return await this.getClientById(client.id);
  }

  /**
   * Update client
   */
  async updateClient(id, data) {
    const client = await Client.findByPk(id);
    if (!client) {
      throw new Error('Client not found');
    }

    if (data.assignedTo) {
      const employee = await Employee.findByPk(data.assignedTo);
      if (!employee) {
        throw new Error('Assigned employee not found');
      }
    }

    await client.update(data);
    return await this.getClientById(id);
  }

  /**
   * Delete client
   */
  async deleteClient(id) {
    const client = await Client.findByPk(id);
    if (!client) {
      throw new Error('Client not found');
    }

    await client.destroy();
    return { message: 'Client deleted successfully' };
  }
}

module.exports = new ClientService();
