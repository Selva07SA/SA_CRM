const clientService = require('../services/clientService');

class ClientController {
  /**
   * Get all clients
   */
  async getAllClients(req, res, next) {
    try {
      const result = await clientService.getAllClients(req.query);
      res.status(200).json({
        success: true,
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get client by ID
   */
  async getClientById(req, res, next) {
    try {
      const client = await clientService.getClientById(req.params.id);
      res.status(200).json({
        success: true,
        data: client
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Create new client
   */
  async createClient(req, res, next) {
    try {
      const client = await clientService.createClient(req.body);
      res.status(201).json({
        success: true,
        message: 'Client created successfully',
        data: client
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update client
   */
  async updateClient(req, res, next) {
    try {
      const client = await clientService.updateClient(req.params.id, req.body);
      res.status(200).json({
        success: true,
        message: 'Client updated successfully',
        data: client
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete client
   */
  async deleteClient(req, res, next) {
    try {
      const result = await clientService.deleteClient(req.params.id);
      res.status(200).json({
        success: true,
        message: result.message
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new ClientController();
