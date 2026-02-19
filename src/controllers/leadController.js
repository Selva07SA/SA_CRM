const leadService = require('../services/leadService');

class LeadController {
  /**
   * Get all leads
   */
  async getAllLeads(req, res, next) {
    try {
      const result = await leadService.getAllLeads(req.query);
      res.status(200).json({
        success: true,
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get lead by ID
   */
  async getLeadById(req, res, next) {
    try {
      const lead = await leadService.getLeadById(req.params.id);
      res.status(200).json({
        success: true,
        data: lead
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Create new lead
   */
  async createLead(req, res, next) {
    try {
      const lead = await leadService.createLead(req.body);
      res.status(201).json({
        success: true,
        message: 'Lead created successfully',
        data: lead
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update lead
   */
  async updateLead(req, res, next) {
    try {
      const lead = await leadService.updateLead(req.params.id, req.body);
      res.status(200).json({
        success: true,
        message: 'Lead updated successfully',
        data: lead
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Convert lead to client
   */
  async convertLead(req, res, next) {
    try {
      const result = await leadService.convertLead(req.params.id, req.body.clientId);
      res.status(200).json({
        success: true,
        message: 'Lead converted successfully',
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete lead
   */
  async deleteLead(req, res, next) {
    try {
      const result = await leadService.deleteLead(req.params.id);
      res.status(200).json({
        success: true,
        message: result.message
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new LeadController();
