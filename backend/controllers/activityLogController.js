const ActivityLog = require('../models/ActivityLog')
const mongoose = require('mongoose')

// @desc    Create activity log (internal use - called by product controllers)
// @route   POST /api/activity-logs
// @access  Private
const createActivityLog = async (req, res) => {
  try {
    const {
      actionType,
      entityType = 'PRODUCT',
      brand,
      sku,
      productId,
      adminId,
      adminName,
      adminEmail,
      metadata = {},
    } = req.body

    // Validate required fields
    if (!actionType || !productId || !adminId || !adminName || !adminEmail) {
      return res.status(400).json({ message: 'Missing required fields' })
    }

    const log = await ActivityLog.create({
      actionType,
      entityType,
      brand: brand || '',
      sku: sku || '',
      productId,
      adminId,
      adminName,
      adminEmail,
      metadata,
    })

    res.status(201).json({ success: true, data: log })
  } catch (error) {
    console.error('Error creating activity log:', error)
    res.status(500).json({ message: error.message })
  }
}

// @desc    Get activity logs with filters and pagination
// @route   GET /api/activity-logs
// @access  Private
const getActivityLogs = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      brand,
      action, // Alias for actionType (backward compatible)
      actionType, // Original param (backward compatible)
      admin, // Alias for adminId (backward compatible)
      adminId, // Original param (backward compatible)
      search,
      startDate,
      endDate,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = req.query

    // Build dynamic filter object
    const filter = {}

    // Brand filter
    if (brand) {
      filter.brand = new RegExp(`^${brand}$`, 'i')
    }

    // Action filter (support both 'action' and 'actionType' for backward compatibility)
    const actionFilter = action || actionType
    if (actionFilter) {
      filter.actionType = actionFilter
    }

    // Admin filter (support both 'admin' and 'adminId' for backward compatibility)
    const adminFilter = admin || adminId
    if (adminFilter) {
      filter.adminId = adminFilter
    }

    // Search across brand and SKU
    if (search) {
      const searchRegex = new RegExp(search, 'i')
      filter.$or = [
        { brand: searchRegex },
        { sku: searchRegex },
      ]
    }

    // Date range filter
    if (startDate || endDate) {
      filter.createdAt = {}
      if (startDate) {
        filter.createdAt.$gte = new Date(startDate)
      }
      if (endDate) {
        // Include the entire end date (end of day)
        const endDateTime = new Date(endDate)
        endDateTime.setHours(23, 59, 59, 999)
        filter.createdAt.$lte = endDateTime
      }
    }

    // Calculate pagination
    const pageNum = parseInt(page) || 1
    const limitNum = parseInt(limit) || 10
    const skip = (pageNum - 1) * limitNum

    // Build aggregation pipeline
    const pipeline = [
      // Match stage - apply filters
      { $match: filter },
      
      // Lookup stage - join with products collection
      {
        $lookup: {
          from: 'products',
          localField: 'productId',
          foreignField: '_id',
          as: 'product',
        },
      },
      
      // Unwind product array (should be single product or empty)
      {
        $unwind: {
          path: '$product',
          preserveNullAndEmptyArrays: true,
        },
      },
      
      // Project stage - select fields and add thumbnail
      {
        $project: {
          actionType: 1,
          entityType: 1,
          brand: 1,
          sku: 1,
          productId: 1,
          adminId: 1,
          adminName: 1,
          adminEmail: 1,
          createdAt: 1,
          changes: 1,
          metadata: 1,
          // Extract first image as thumbnail
          // Returns first image from product.images array, or null if not available
          thumbnail: {
            $let: {
              vars: {
                images: { $ifNull: ['$product.images', []] },
              },
              in: {
                $cond: {
                  if: {
                    $and: [
                      { $eq: [{ $type: '$$images' }, 'array'] },
                      { $gt: [{ $size: '$$images' }, 0] },
                    ],
                  },
                  then: { $arrayElemAt: ['$$images', 0] },
                  else: null,
                },
              },
            },
          },
        },
      },
      
      // Sort stage
      {
        $sort: { [sortBy]: sortOrder === 'asc' ? 1 : -1 },
      },
      
      // Facet stage - get both paginated data and total count
      {
        $facet: {
          data: [
            { $skip: skip },
            { $limit: limitNum },
          ],
          total: [
            { $count: 'count' },
          ],
        },
      },
    ]

    // Execute aggregation
    const result = await ActivityLog.aggregate(pipeline)

    // Extract data and total from aggregation result
    const logs = result[0]?.data || []
    const total = result[0]?.total[0]?.count || 0

    // Calculate total pages
    const totalPages = Math.ceil(total / limitNum)

    // Industry-standard response format
    res.json({
      success: true,
      data: logs,
      page: pageNum,
      limit: limitNum,
      total,
      totalPages,
    })
  } catch (error) {
    console.error('Error fetching activity logs:', error)
    res.status(500).json({ message: error.message })
  }
}

// @desc    Get unique admins for filter dropdown
// @route   GET /api/activity-logs/admins
// @access  Private
const getAdmins = async (req, res) => {
  try {
    const admins = await ActivityLog.distinct('adminId', {})
    const adminDetails = await ActivityLog.find({ adminId: { $in: admins } })
      .select('adminId adminName adminEmail')
      .lean()

    // Get unique admin details
    const uniqueAdmins = []
    const seen = new Set()
    adminDetails.forEach((log) => {
      if (!seen.has(log.adminId.toString())) {
        seen.add(log.adminId.toString())
        uniqueAdmins.push({
          _id: log.adminId,
          name: log.adminName,
          email: log.adminEmail,
        })
      }
    })

    res.json({ success: true, data: uniqueAdmins })
  } catch (error) {
    console.error('Error fetching admins:', error)
    res.status(500).json({ message: error.message })
  }
}

module.exports = {
  createActivityLog,
  getActivityLogs,
  getAdmins,
}

