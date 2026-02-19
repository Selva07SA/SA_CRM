const { Subscription, Client, SubscriptionPlan } = require('../models');
const { Op } = require('sequelize');

class SubscriptionService {
  /**
   * Calculate end date based on billing cycle
   */
  calculateEndDate(startDate, billingCycle) {
    const start = new Date(startDate);
    const end = new Date(start);

    switch (billingCycle) {
      case 'monthly':
        end.setMonth(end.getMonth() + 1);
        break;
      case 'quarterly':
        end.setMonth(end.getMonth() + 3);
        break;
      case 'yearly':
        end.setFullYear(end.getFullYear() + 1);
        break;
      default:
        end.setMonth(end.getMonth() + 1);
    }

    return end;
  }

  /**
   * Get all subscriptions with pagination
   */
  async getAllSubscriptions(query = {}) {
    const {
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'DESC',
      status = '',
      paymentStatus = '',
      clientId
    } = query;

    const offset = (page - 1) * limit;
    const where = {};

    if (status) {
      where.status = status;
    }

    if (paymentStatus) {
      where.paymentStatus = paymentStatus;
    }

    if (clientId) {
      where.clientId = clientId;
    }

    const { count, rows } = await Subscription.findAndCountAll({
      where,
      include: [
        {
          model: Client,
          as: 'client',
          attributes: ['id', 'firstName', 'lastName', 'email', 'company']
        },
        {
          model: SubscriptionPlan,
          as: 'plan',
          attributes: ['id', 'name', 'price', 'billingCycle']
        }
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [[sortBy, sortOrder]]
    });

    return {
      subscriptions: rows,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(count / limit)
      }
    };
  }

  /**
   * Get subscription by ID
   */
  async getSubscriptionById(id) {
    const subscription = await Subscription.findByPk(id, {
      include: [
        {
          model: Client,
          as: 'client',
          attributes: ['id', 'firstName', 'lastName', 'email', 'company']
        },
        {
          model: SubscriptionPlan,
          as: 'plan'
        }
      ]
    });

    if (!subscription) {
      throw new Error('Subscription not found');
    }

    return subscription;
  }

  /**
   * Create new subscription
   */
  async createSubscription(data) {
    const client = await Client.findByPk(data.clientId);
    if (!client) {
      throw new Error('Client not found');
    }

    const plan = await SubscriptionPlan.findByPk(data.planId);
    if (!plan) {
      throw new Error('Subscription plan not found');
    }

    if (!plan.isActive) {
      throw new Error('Subscription plan is not active');
    }

    // Calculate end date if not provided
    if (!data.endDate) {
      data.endDate = this.calculateEndDate(data.startDate || new Date(), plan.billingCycle);
    }

    // Calculate renewal date
    data.renewalDate = this.calculateEndDate(data.endDate, plan.billingCycle);

    const subscription = await Subscription.create(data);
    return await this.getSubscriptionById(subscription.id);
  }

  /**
   * Update subscription
   */
  async updateSubscription(id, data) {
    const subscription = await Subscription.findByPk(id);
    if (!subscription) {
      throw new Error('Subscription not found');
    }

    if (data.planId && data.planId !== subscription.planId) {
      const plan = await SubscriptionPlan.findByPk(data.planId);
      if (!plan) {
        throw new Error('Subscription plan not found');
      }
    }

    await subscription.update(data);
    return await this.getSubscriptionById(id);
  }

  /**
   * Cancel subscription
   */
  async cancelSubscription(id) {
    const subscription = await Subscription.findByPk(id);
    if (!subscription) {
      throw new Error('Subscription not found');
    }

    if (subscription.status === 'canceled') {
      throw new Error('Subscription is already canceled');
    }

    await subscription.update({
      status: 'canceled',
      canceledAt: new Date()
    });

    return await this.getSubscriptionById(id);
  }

  /**
   * Renew subscription
   */
  async renewSubscription(id) {
    const subscription = await Subscription.findByPk(id, {
      include: [{ model: SubscriptionPlan, as: 'plan' }]
    });

    if (!subscription) {
      throw new Error('Subscription not found');
    }

    if (subscription.status !== 'active') {
      throw new Error('Only active subscriptions can be renewed');
    }

    const newEndDate = this.calculateEndDate(subscription.endDate, subscription.plan.billingCycle);
    const newRenewalDate = this.calculateEndDate(newEndDate, subscription.plan.billingCycle);

    await subscription.update({
      endDate: newEndDate,
      renewalDate: newRenewalDate,
      status: 'active',
      paymentStatus: 'pending'
    });

    return await this.getSubscriptionById(id);
  }

  /**
   * Delete subscription
   */
  async deleteSubscription(id) {
    const subscription = await Subscription.findByPk(id);
    if (!subscription) {
      throw new Error('Subscription not found');
    }

    await subscription.destroy();
    return { message: 'Subscription deleted successfully' };
  }
}

module.exports = new SubscriptionService();
