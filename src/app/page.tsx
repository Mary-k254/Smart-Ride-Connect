"use client";

import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import {
  Bus,
  MapPin,
  CreditCard,
  Shield,
  Star,
  Navigation,
  Clock,
  Users,
  TrendingUp,
  Bell,
} from "lucide-react";

export default function Home() {
  const { user } = useAuth();

  const features = [
    {
      icon: Navigation,
      title: "Real-Time GPS Tracking",
      description:
        "Track your matatu live on the map. Know exactly when it will arrive at your stop.",
      color: "bg-blue-100 text-blue-600",
    },
    {
      icon: MapPin,
      title: "Easy Seat Booking",
      description:
        "Reserve your seat before the vehicle arrives. Choose your pickup and drop-off points.",
      color: "bg-green-100 text-green-600",
    },
    {
      icon: CreditCard,
      title: "Digital M-Pesa Payment",
      description:
        "Pay securely via M-Pesa. No cash needed. Get instant digital receipts.",
      color: "bg-yellow-100 text-yellow-600",
    },
    {
      icon: Clock,
      title: "Smart Fare Calculation",
      description:
        "Fares calculated automatically by distance. Know your fare before you book.",
      color: "bg-purple-100 text-purple-600",
    },
    {
      icon: Bell,
      title: "Instant Notifications",
      description:
        "Get alerts when your vehicle is approaching, booking confirmed, or payment received.",
      color: "bg-red-100 text-red-600",
    },
    {
      icon: Shield,
      title: "Safe & Secure",
      description:
        "Encrypted payments, verified drivers, and GPS tamper alerts for your safety.",
      color: "bg-indigo-100 text-indigo-600",
    },
  ];

  const stats = [
    { label: "Routes Covered", value: "50+", icon: MapPin },
    { label: "Active Vehicles", value: "200+", icon: Bus },
    { label: "Happy Passengers", value: "10K+", icon: Users },
    { label: "Trips Completed", value: "50K+", icon: TrendingUp },
  ];

  const popularRoutes = [
    { from: "Nairobi", to: "Mombasa", distance: "480 km", fare: "KES 720", duration: "8 hrs" },
    { from: "Nairobi", to: "Kisumu", distance: "350 km", fare: "KES 525", duration: "6 hrs" },
    { from: "Nairobi", to: "Nakuru", distance: "160 km", fare: "KES 240", duration: "2 hrs" },
    { from: "Nairobi", to: "Eldoret", distance: "310 km", fare: "KES 465", duration: "5 hrs" },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-green-700 via-green-600 to-green-800 text-white py-20 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <div className="flex justify-center mb-6">
            <div className="bg-yellow-400 rounded-full p-4">
              <Bus className="h-12 w-12 text-green-800" />
            </div>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-4">
            Smart Ride Connect
          </h1>
          <p className="text-xl md:text-2xl text-green-100 mb-3">
            Long Distance Matatu Transport System
          </p>
          <p className="text-green-200 max-w-2xl mx-auto mb-10 text-lg">
            Book seats, track vehicles in real-time, pay digitally, and travel
            safely across Kenya. Connecting passengers, drivers, and SACCOs.
          </p>

          {user ? (
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {user.role === "passenger" && (
                <>
                  <Link
                    href="/booking"
                    className="bg-yellow-400 text-green-900 px-8 py-4 rounded-xl font-bold text-lg hover:bg-yellow-300 transition-colors shadow-lg"
                  >
                    Book a Seat Now
                  </Link>
                  <Link
                    href="/tracking"
                    className="bg-white/20 text-white border-2 border-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-white/30 transition-colors"
                  >
                    Track Vehicle
                  </Link>
                </>
              )}
              {user.role === "driver" && (
                <Link
                  href="/driver"
                  className="bg-yellow-400 text-green-900 px-8 py-4 rounded-xl font-bold text-lg hover:bg-yellow-300 transition-colors shadow-lg"
                >
                  Go to Driver Dashboard
                </Link>
              )}
              {user.role === "manager" && (
                <Link
                  href="/manager"
                  className="bg-yellow-400 text-green-900 px-8 py-4 rounded-xl font-bold text-lg hover:bg-yellow-300 transition-colors shadow-lg"
                >
                  Go to Manager Dashboard
                </Link>
              )}
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/register"
                className="bg-yellow-400 text-green-900 px-8 py-4 rounded-xl font-bold text-lg hover:bg-yellow-300 transition-colors shadow-lg"
              >
                Get Started Free
              </Link>
              <Link
                href="/login"
                className="bg-white/20 text-white border-2 border-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-white/30 transition-colors"
              >
                Sign In
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Stats */}
      <section className="bg-white py-12 px-4 shadow-sm">
        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="flex justify-center mb-2">
                <stat.icon className="h-8 w-8 text-green-600" />
              </div>
              <div className="text-3xl font-bold text-gray-900">{stat.value}</div>
              <div className="text-gray-500 text-sm mt-1">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-3">
            Everything You Need
          </h2>
          <p className="text-center text-gray-500 mb-12 max-w-2xl mx-auto">
            A complete transport management system built for Kenya&apos;s matatu industry
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow border border-gray-100"
              >
                <div className={`inline-flex p-3 rounded-xl mb-4 ${feature.color}`}>
                  <feature.icon className="h-6 w-6" />
                </div>
                <h3 className="font-bold text-gray-900 text-lg mb-2">{feature.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Routes */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-3">
            Popular Routes
          </h2>
          <p className="text-center text-gray-500 mb-12">
            Connecting major cities across Kenya
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {popularRoutes.map((route) => (
              <div
                key={`${route.from}-${route.to}`}
                className="flex items-center justify-between p-5 border border-gray-200 rounded-xl hover:border-green-400 hover:shadow-sm transition-all group"
              >
                <div className="flex items-center gap-4">
                  <div className="bg-green-100 p-3 rounded-xl group-hover:bg-green-200 transition-colors">
                    <Bus className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <div className="font-bold text-gray-900">
                      {route.from} → {route.to}
                    </div>
                    <div className="text-sm text-gray-500">
                      {route.distance} • {route.duration}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-green-600 text-lg">{route.fare}</div>
                  <div className="text-xs text-gray-400">from</div>
                </div>
              </div>
            ))}
          </div>
          <div className="text-center mt-8">
            <Link
              href="/routes"
              className="inline-flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-green-700 transition-colors"
            >
              <MapPin className="h-5 w-5" />
              View All Routes
            </Link>
          </div>
        </div>
      </section>

      {/* User Types */}
      <section className="py-16 px-4 bg-green-700 text-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">
            Built for Everyone
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-white/20 rounded-full p-5 inline-flex mb-4">
                <Users className="h-10 w-10" />
              </div>
              <h3 className="text-xl font-bold mb-3">Passengers</h3>
              <ul className="text-green-100 text-sm space-y-2 text-left max-w-xs mx-auto">
                <li>✓ Book seats in advance</li>
                <li>✓ Track vehicle location live</li>
                <li>✓ Pay via M-Pesa</li>
                <li>✓ Get arrival notifications</li>
                <li>✓ Rate your driver</li>
              </ul>
            </div>
            <div className="text-center">
              <div className="bg-white/20 rounded-full p-5 inline-flex mb-4">
                <Bus className="h-10 w-10" />
              </div>
              <h3 className="text-xl font-bold mb-3">Drivers</h3>
              <ul className="text-green-100 text-sm space-y-2 text-left max-w-xs mx-auto">
                <li>✓ See passenger locations</li>
                <li>✓ Track daily trips</li>
                <li>✓ View traffic alerts</li>
                <li>✓ Manage bookings</li>
                <li>✓ GPS navigation</li>
              </ul>
            </div>
            <div className="text-center">
              <div className="bg-white/20 rounded-full p-5 inline-flex mb-4">
                <TrendingUp className="h-10 w-10" />
              </div>
              <h3 className="text-xl font-bold mb-3">SACCO Managers</h3>
              <ul className="text-green-100 text-sm space-y-2 text-left max-w-xs mx-auto">
                <li>✓ Monitor all vehicles</li>
                <li>✓ Track daily revenue</li>
                <li>✓ Driver performance reports</li>
                <li>✓ Manage fleet</li>
                <li>✓ Trip statistics</li>
              </ul>
            </div>
          </div>
          {!user && (
            <div className="text-center mt-12">
              <Link
                href="/register"
                className="bg-yellow-400 text-green-900 px-8 py-4 rounded-xl font-bold text-lg hover:bg-yellow-300 transition-colors shadow-lg inline-block"
              >
                Join Smart Ride Connect Today
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Reviews Preview */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            What Passengers Say
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                name: "Wanjiku M.",
                route: "Nairobi → Mombasa",
                rating: 5,
                comment:
                  "Amazing! I tracked the matatu from Nairobi and knew exactly when to leave my house. No more waiting at the stage!",
              },
              {
                name: "Kamau J.",
                route: "Nairobi → Kisumu",
                rating: 5,
                comment:
                  "The M-Pesa payment is so convenient. I paid from my phone and got a receipt instantly. Very professional service.",
              },
              {
                name: "Achieng O.",
                route: "Mombasa → Malindi",
                rating: 4,
                comment:
                  "Booking my seat in advance saved me so much stress. The driver was on time and the fare was exactly as shown.",
              },
            ].map((review) => (
              <div
                key={review.name}
                className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
              >
                <div className="flex items-center gap-1 mb-3">
                  {Array.from({ length: review.rating }).map((_, i) => (
                    <Star
                      key={i}
                      className="h-4 w-4 text-yellow-400 fill-yellow-400"
                    />
                  ))}
                </div>
                <p className="text-gray-600 text-sm mb-4 italic">
                  &ldquo;{review.comment}&rdquo;
                </p>
                <div>
                  <div className="font-semibold text-gray-900">{review.name}</div>
                  <div className="text-xs text-gray-400">{review.route}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-10 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2 text-white font-bold text-xl">
              <Bus className="h-6 w-6 text-yellow-400" />
              Smart Ride Connect
            </div>
            <div className="flex gap-6 text-sm">
              <Link href="/routes" className="hover:text-white transition-colors">
                Routes
              </Link>
              <Link href="/booking" className="hover:text-white transition-colors">
                Book
              </Link>
              <Link href="/tracking" className="hover:text-white transition-colors">
                Track
              </Link>
              <Link href="/login" className="hover:text-white transition-colors">
                Login
              </Link>
            </div>
            <div className="text-sm">
              © 2024 Smart Ride Connect. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
