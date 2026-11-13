// ============================================
// middleware/roleCheck.js — Role-Based Access
// ============================================
// Restricts access to routes based on user role.
// Must be used AFTER the authenticate middleware.
// ============================================

/**
 * Factory function that returns a middleware to check user roles.
 * @param  {...string} allowedRoles - The roles allowed to access the route (e.g., 'rider', 'driver', 'admin')
 * @returns {Function} Express middleware
 *
 * Usage: router.get('/admin/dashboard', authenticate, roleCheck('admin'), handler)
 */
const roleCheck = (...allowedRoles) => {
  return (req, res, next) => {
    // Ensure the user object exists (authenticate middleware must run first)
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required before role check.'
      });
    }

    // Check if the user's role is in the allowed roles list
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. This resource requires one of the following roles: ${allowedRoles.join(', ')}. Your role: ${req.user.role}.`
      });
    }

    // User has an allowed role — proceed
    next();
  };
};

module.exports = { roleCheck };
