const subscriptionService = require('../services/subscriptionService');

class SubscriptionController {
  /**
   * Get all subscriptions
   */
  async getAllSubscriptions(req, res, next) {
    try {
      const result = await subscriptionService.getAllSubscriptions(req.query);
      res.status(200).json({
        success: true,
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get subscription by ID
   */
  async getSubscriptionById(req, res, next) {
    try {
      const subscription = await subscriptionService.getSubscriptionById(req.params.id);
      res.status(200).json({
        success: true,
        data: subscription
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Create new subscription
   */
  async createSubscription(req, res, next) {
    try {
      const subscription = await subscriptionService.createSubscription(req.body);
      res.status(201).json({
        success: true,
        message: 'Subscription created successfully',
        data: subscription
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update subscription
   */
  async updateSubscription(req, res, next) {
    try {
      const subscription = await subscriptionService.updateSubscription(req.params.id, req.body);
      res.status(200).json({
        success: true,
        message: 'Subscription updated successfully',
        data: subscription
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Cancel subscription
   */
  async cancelSubscription(req, res, next) {
    try {
      const subscription = await subscriptionService.cancelSubscription(req.params.id);
      res.status(200).json({
        success: true,
        message: 'Subscription canceled successfully',
        data: subscription
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Renew subscription
   */
  async renewSubscription(req, res, next) {
    try {
      const subscription = await subscriptionService.renewSubscription(req.params.id);
      res.status(200).json({
        success: true,
        message: 'Subscription renewed successfully',
        data: subscription
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete subscription
   */
  async deleteSubscription(req, res, next) {
    try {
      const result = await subscriptionService.deleteSubscription(req.params.id);
      res.status(200).json({
        success: true,
        message: result.message
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new SubscriptionController();
