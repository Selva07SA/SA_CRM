const { SubscriptionPlan, Subscription } = require('../models');
const { Op } = require('sequelize');

class SubscriptionPlanService {
  /**
   * Get all subscription plans with pagination
   */
  async getAllPlans(query = {}) {
    const {
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'DESC',
      search = '',
      isActive,
      billingCycle
    } = query;

    const offset = (page - 1) * limit;
    const where = {};

    if (search) {
      where[Op.or] = [
        { name: { [Op.iLike]: `%${search}%` } },
        { description: { [Op.iLike]: `%${search}%` } }
      ];
    }

    if (isActive !== undefined) {
      where.isActive = isActive === 'true';
    }

    if (billingCycle) {
      where.billingCycle = billingCycle;
    }

    const { count, rows } = await SubscriptionPlan.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [[sortBy, sortOrder]]
    });

    return {
      plans: rows,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(count / limit)
      }
    };
  }

  /**
   * Get plan by ID
   */
  async getPlanById(id) {
    const plan = await SubscriptionPlan.findByPk(id);
    if (!plan) {
      throw new Error('Subscription plan not found');
    }
    return plan;
  }

  /**
   * Create new subscription plan
   */
  async createPlan(data) {
    const existingPlan = await SubscriptionPlan.findOne({ where: { name: data.name } });
    if (existingPlan) {
      throw new Error('Subscription plan with this name already exists');
    }

    const plan = await SubscriptionPlan.create(data);
    return plan;
  }

  /**
   * Update subscription plan
   */
  async updatePlan(id, data) {
    const plan = await SubscriptionPlan.findByPk(id);
    if (!plan) {
      throw new Error('Subscription plan not found');
    }

    if (data.name && data.name !== plan.name) {
      const existingPlan = await SubscriptionPlan.findOne({ where: { name: data.name } });
      if (existingPlan) {
        throw new Error('Subscription plan with this name already exists');
      }
    }

    await plan.update(data);
    return plan;
  }

  /**
   * Delete subscription plan
   */
  async deletePlan(id) {
    const plan = await SubscriptionPlan.findByPk(id);
    if (!plan) {
      throw new Error('Subscription plan not found');
    }

    // Check if plan has active subscriptions
    const activeSubscriptions = await Subscription.count({
      where: {
        planId: id,
        status: 'active'
      }
    });

    if (activeSubscriptions > 0) {
      throw new Error('Cannot delete plan with active subscriptions');
    }

    await plan.destroy();
    return { message: 'Subscription plan deleted successfully' };
  }
}

module.exports = new SubscriptionPlanService();
