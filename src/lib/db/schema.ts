import {
  integer,
  real,
  sqliteTable,
  text,
} from "drizzle-orm/sqlite-core";

// Users table
export const users = sqliteTable("users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  email: text("email").unique(),
  phone: text("phone").unique(),
  password: text("password").notNull(),
  role: text("role", { enum: ["passenger", "driver", "manager"] })
    .notNull()
    .default("passenger"),
  profileImage: text("profile_image"),
  isActive: integer("is_active").default(1),
  createdAt: text("created_at"),
  updatedAt: text("updated_at"),
});

// SACCOs table
export const saccos = sqliteTable("saccos", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  registrationNumber: text("registration_number").unique().notNull(),
  managerId: integer("manager_id").references(() => users.id),
  phone: text("phone"),
  email: text("email"),
  address: text("address"),
  isActive: integer("is_active").default(1),
  createdAt: text("created_at"),
});

// Routes table
export const routes = sqliteTable("routes", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  origin: text("origin").notNull(),
  destination: text("destination").notNull(),
  originLat: real("origin_lat").notNull(),
  originLng: real("origin_lng").notNull(),
  destLat: real("dest_lat").notNull(),
  destLng: real("dest_lng").notNull(),
  distanceKm: real("distance_km").notNull(),
  baseFarePerKm: real("base_fare_per_km").notNull().default(10),
  estimatedDurationMin: integer("estimated_duration_min"),
  isActive: integer("is_active").default(1),
  createdAt: text("created_at"),
});

// Vehicles table
export const vehicles = sqliteTable("vehicles", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  plateNumber: text("plate_number").unique().notNull(),
  model: text("model").notNull(),
  capacity: integer("capacity").notNull().default(14),
  saccoId: integer("sacco_id").references(() => saccos.id),
  driverId: integer("driver_id").references(() => users.id),
  routeId: integer("route_id").references(() => routes.id),
  currentLat: real("current_lat"),
  currentLng: real("current_lng"),
  status: text("status", { enum: ["active", "inactive", "maintenance", "en_route"] })
    .default("inactive"),
  lastLocationUpdate: text("last_location_update"),
  isGpsActive: integer("is_gps_active").default(0),
  createdAt: text("created_at"),
});

// Bookings table
export const bookings = sqliteTable("bookings", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  passengerId: integer("passenger_id")
    .references(() => users.id)
    .notNull(),
  vehicleId: integer("vehicle_id").references(() => vehicles.id),
  routeId: integer("route_id").references(() => routes.id).notNull(),
  pickupLat: real("pickup_lat").notNull(),
  pickupLng: real("pickup_lng").notNull(),
  pickupAddress: text("pickup_address"),
  dropoffLat: real("dropoff_lat").notNull(),
  dropoffLng: real("dropoff_lng").notNull(),
  dropoffAddress: text("dropoff_address"),
  distanceKm: real("distance_km").notNull(),
  fareAmount: real("fare_amount").notNull(),
  status: text("status", {
    enum: ["pending", "confirmed", "picked_up", "completed", "cancelled"],
  }).default("pending"),
  paymentStatus: text("payment_status", {
    enum: ["unpaid", "paid", "refunded"],
  }).default("unpaid"),
  paymentMethod: text("payment_method"),
  seatNumber: integer("seat_number"),
  createdAt: text("created_at"),
  updatedAt: text("updated_at"),
});

// Trips table
export const trips = sqliteTable("trips", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  driverId: integer("driver_id").references(() => users.id).notNull(),
  vehicleId: integer("vehicle_id").references(() => vehicles.id).notNull(),
  routeId: integer("route_id").references(() => routes.id).notNull(),
  startTime: text("start_time"),
  endTime: text("end_time"),
  distanceKm: real("distance_km"),
  passengersCount: integer("passengers_count").default(0),
  totalRevenue: real("total_revenue").default(0),
  status: text("status", { enum: ["ongoing", "completed", "cancelled"] })
    .default("ongoing"),
  createdAt: text("created_at"),
});

// Payments table
export const payments = sqliteTable("payments", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  bookingId: integer("booking_id")
    .references(() => bookings.id)
    .notNull(),
  passengerId: integer("passenger_id")
    .references(() => users.id)
    .notNull(),
  amount: real("amount").notNull(),
  method: text("method", { enum: ["mpesa", "card", "cash"] }).notNull(),
  transactionId: text("transaction_id").unique(),
  status: text("status", {
    enum: ["pending", "completed", "failed", "refunded"],
  }).default("pending"),
  phoneNumber: text("phone_number"),
  receipt: text("receipt"),
  createdAt: text("created_at"),
});

// Reviews table
export const reviews = sqliteTable("reviews", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  passengerId: integer("passenger_id")
    .references(() => users.id)
    .notNull(),
  driverId: integer("driver_id")
    .references(() => users.id)
    .notNull(),
  tripId: integer("trip_id").references(() => trips.id),
  bookingId: integer("booking_id").references(() => bookings.id),
  rating: integer("rating").notNull(),
  comment: text("comment"),
  isReported: integer("is_reported").default(0),
  createdAt: text("created_at"),
});

// Notifications table
export const notifications = sqliteTable("notifications", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id").references(() => users.id).notNull(),
  title: text("title").notNull(),
  message: text("message").notNull(),
  type: text("type", {
    enum: ["booking", "payment", "vehicle", "traffic", "system"],
  }).notNull(),
  isRead: integer("is_read").default(0),
  createdAt: text("created_at"),
});

// Traffic alerts table
export const trafficAlerts = sqliteTable("traffic_alerts", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  routeId: integer("route_id").references(() => routes.id),
  title: text("title").notNull(),
  description: text("description"),
  severity: text("severity", { enum: ["low", "medium", "high"] }).default(
    "medium"
  ),
  lat: real("lat"),
  lng: real("lng"),
  isActive: integer("is_active").default(1),
  createdAt: text("created_at"),
  expiresAt: text("expires_at"),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Vehicle = typeof vehicles.$inferSelect;
export type Route = typeof routes.$inferSelect;
export type Booking = typeof bookings.$inferSelect;
export type Trip = typeof trips.$inferSelect;
export type Payment = typeof payments.$inferSelect;
export type Review = typeof reviews.$inferSelect;
export type Notification = typeof notifications.$inferSelect;
export type Sacco = typeof saccos.$inferSelect;
export type TrafficAlert = typeof trafficAlerts.$inferSelect;
