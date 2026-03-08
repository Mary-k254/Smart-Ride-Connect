import { getAuthUser } from "./auth";

/**
 * Row-Level Security (RLS) Utility
 * 
 * This module provides utilities to enforce data access controls
 * based on user roles and ownership in the database.
 */

export type UserRole = "passenger" | "driver" | "manager";

/**
 * Interface for RLS policy
 */
export interface RLSPolicy {
  /**
   * Check if user can access the resource
   */
  canAccess: (userId: number, role: UserRole, resourceOwnerId?: number) => boolean;
  
  /**
   * Get the owner ID from a resource (if applicable)
   */
  getOwnerId?: (resource: Record<string, unknown>) => number | undefined;
}

/**
 * Pre-built RLS policies for common resources
 */
export const policies = {
  /**
   * Policy for passenger-specific resources (bookings, reviews, notifications)
   * Passengers can only access their own data
   */
  passengerData: {
    canAccess: (userId: number, role: UserRole, resourceOwnerId?: number) => {
      // Managers can access all data
      if (role === "manager") return true;
      
      // Drivers can access passenger data for their trips
      if (role === "driver") return true;
      
      // Passengers can only access their own data
      return resourceOwnerId === userId;
    },
    getOwnerId: (resource: Record<string, unknown>) => resource.passengerId as number | undefined,
  },

  /**
   * Policy for driver-specific resources
   * Drivers can access their own data, managers can access all
   */
  driverData: {
    canAccess: (userId: number, role: UserRole, resourceOwnerId?: number) => {
      // Managers can access all data
      if (role === "manager") return true;
      
      // Drivers can only access their own data
      return resourceOwnerId === userId;
    },
    getOwnerId: (resource: Record<string, unknown>) => resource.driverId as number | undefined,
  },

  /**
   * Policy for vehicle resources (managed by SACCO managers)
   */
  vehicleData: {
    canAccess: (userId: number, role: UserRole, _resourceOwnerId?: number) => {
      // Managers can access vehicles
      if (role === "manager") return true;
      
      // Drivers can see vehicles assigned to them
      if (role === "driver") return true;
      
      // Passengers can see active vehicles for booking
      return true;
    },
  },

  /**
   * Policy for booking data
   */
  bookingData: {
    canAccess: (userId: number, role: UserRole, resourceOwnerId?: number) => {
      // Managers can access all bookings
      if (role === "manager") return true;
      
      // Drivers can access bookings for their vehicles
      if (role === "driver") return true;
      
      // Passengers can only access their own bookings
      return resourceOwnerId === userId;
    },
    getOwnerId: (resource: Record<string, unknown>) => resource.passengerId as number | undefined,
  },
};

/**
 * Filter query based on user role and ownership
 * This ensures row-level security at the database query level
 */
export function applyRowLevelFilter<T extends Record<string, unknown>>(
  userId: number,
  role: UserRole,
  resourceOwnerField: keyof T,
  query: T[]
): T[] {
  // Managers can see all data
  if (role === "manager") {
    return query;
  }

  // Drivers can see their own data and related passenger data
  if (role === "driver") {
    return query;
  }

  // Passengers can only see their own data
  return query.filter((item) => item[resourceOwnerField] === userId);
}

/**
 * Check if user is authorized to perform an action on a resource
 */
export async function authorizeAction(
  resourceOwnerId?: number,
  requiredRole?: UserRole
): Promise<{ authorized: boolean; userId?: number; role?: UserRole }> {
  const user = await getAuthUser();
  
  if (!user) {
    return { authorized: false };
  }

  // If specific role is required
  if (requiredRole && user.role !== requiredRole && user.role !== "manager") {
    return { authorized: false };
  }

  // Check ownership if resource owner ID is provided
  if (resourceOwnerId !== undefined && user.role !== "manager") {
    if (user.userId !== resourceOwnerId) {
      return { authorized: false };
    }
  }

  return {
    authorized: true,
    userId: user.userId,
    role: user.role,
  };
}

/**
 * Middleware to check authorization for API routes
 */
export function requireAuth(requiredRole?: UserRole) {
  return async (request: Request): Promise<{ authorized: boolean; userId?: number; role?: UserRole }> => {
    const user = await getAuthUser();
    
    if (!user) {
      return { authorized: false };
    }

    // If specific role is required
    if (requiredRole && user.role !== requiredRole && user.role !== "manager") {
      return { authorized: false };
    }

    return {
      authorized: true,
      userId: user.userId,
      role: user.role,
    };
  };
}
