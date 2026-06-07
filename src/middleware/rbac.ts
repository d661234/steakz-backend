import { UserRole } from '@prisma/client';
import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from './auth.js';

// Define permission mappings
const ROLE_PERMISSIONS: Record<UserRole, string[]> = {
  [UserRole.OPEN_ACCESS]: [
    'browse_branches',
    'search_menu_items',
    'view_menu_prices',
    'read_restaurant_info'
  ],
  [UserRole.CUSTOMER]: [
    'browse_branches',
    'search_menu_items',
    'view_menu_prices',
    'read_restaurant_info',
    'register_account',
    'browse_menu',
    'place_order',
    'view_order_history',
    'save_favourite_items',
    'confirm_payment',
    'reorder_previous_order',
    'get_recommendations'
  ],
  [UserRole.WAITER]: [
    'browse_branches',
    'search_menu_items',
    'view_menu_prices',
    'read_restaurant_info',
    'view_new_orders',
    'update_order_status',
    'mark_order_completed',
    'view_order_details'
  ],
  [UserRole.CASHIER]: [
    'browse_branches',
    'search_menu_items',
    'view_menu_prices',
    'read_restaurant_info',
    'view_new_orders',
    'update_order_status',
    'mark_order_completed',
    'view_order_details',
    'confirm_payment'
  ],
  [UserRole.BRANCH_MANAGER]: [
    'browse_branches',
    'search_menu_items',
    'view_menu_prices',
    'read_restaurant_info',
    'view_new_orders',
    'update_order_status',
    'mark_order_completed',
    'view_order_details',
    'add_menu_items',
    'edit_menu_items',
    'remove_menu_items',
    'view_complete_menu',
    'view_low_stock_alerts'
  ],
  [UserRole.HQ_MANAGER]: [
    'browse_branches',
    'search_menu_items',
    'view_menu_prices',
    'read_restaurant_info',
    'view_all_orders',
    'generate_sales_summary',
    'identify_peak_times',
    'view_customer_frequency',
    'assign_staff_to_branches',
    'view_most_viewed_items',
    'compare_branch_performance'
  ],
  [UserRole.SYSTEM_ADMIN]: [
    'browse_branches',
    'search_menu_items',
    'view_menu_prices',
    'read_restaurant_info',
    'create_branches',
    'deactivate_user_accounts',
    'assign_user_roles',
    'view_system_activity',
    'remove_inactive_branches',
    'audit_role_changes',
    'view_all_orders',
    'generate_sales_summary'
  ],
  [UserRole.CHIEF_SUPERVISOR]: [
    'browse_branches',
    'view_new_orders',
    'update_order_status',
    'view_complete_menu'
  ],
  [UserRole.HEAD_CHEF]: [
    'browse_branches',
    'view_new_orders',
    'update_order_status'
  ]
};

export function checkPermission(requiredPermission: string) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    const userRole = req.user?.role;

    if (!userRole) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const rolePermissions = ROLE_PERMISSIONS[userRole];
    
    if (rolePermissions && rolePermissions.includes(requiredPermission)) {
      next();
    } else {
      res.status(403).json({ 
        error: 'Insufficient permissions', 
        requiredPermission,
        userRole 
      });
    }
  };
}

export function authorize(allowedRoles: UserRole[]) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    const userRole = req.user?.role;

    if (!userRole) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (allowedRoles.includes(userRole)) {
      next();
    } else {
      res.status(403).json({ 
        error: 'Insufficient permissions', 
        allowedRoles,
        userRole 
      });
    }
  };
}

export function getRolePermissions(role: UserRole): string[] {
  return ROLE_PERMISSIONS[role] || [];
}
