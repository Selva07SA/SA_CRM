const subscriptionPlanService = require('../services/subscriptionPlanService');

class SubscriptionPlanController {
  /**
   * Get all subscription plans
   */
  async getAllPlans(req, res, next) {
    try {
      const result = await subscriptionPlanService.getAllPlans(req.query);
      res.status(200).json({
        success: true,
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get plan by ID
   */
  async getPlanById(req, res, next) {
    try {
      const plan = await subscriptionPlanService.getPlanById(req.params.id);
      res.status(200).json({
        success: true,
        data: plan
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Create new subscription plan
   */
  async createPlan(req, res, next) {
    try {
      const plan = await subscriptionPlanService.createPlan(req.body);
      res.status(201).json({
        success: true,
        message: 'Subscription plan created successfully',
        data: plan
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update subscription plan
   */
  async updatePlan(req, res, next) {
    try {
      const plan = await subscriptionPlanService.updatePlan(req.params.id, req.body);
      res.status(200).json({
        success: true,
        message: 'Subscription plan updated successfully',
        data: plan
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete subscription plan
   */
  async deletePlan(req, res, next) {
    try {
      const result = await subscriptionPlanService.deletePlan(req.params.id);
      res.status(200).json({
        success: true,
        message: result.message
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new SubscriptionPlanController();
