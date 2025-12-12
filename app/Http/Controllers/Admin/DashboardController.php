<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Product;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Concurrency;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function dashboard(Request $request)
    {
        // Define time ranges for trends
        $now = Carbon::now();
        $startOfMonth = $now->copy()->startOfMonth();
        $endOfMonth = $now->copy()->endOfMonth();
        $startOfLastMonth = $now->copy()->subMonth()->startOfMonth();
        $endOfLastMonth = $now->copy()->subMonth()->endOfMonth();

        $stats = Cache::remember('dashboard.full_stats', 1, function () use ($startOfMonth, $endOfMonth, $startOfLastMonth, $endOfLastMonth) {
            return Concurrency::driver('sync')->run([

                // 1. User Stats (Your existing logic)
                fn() => [
                    'admins' => User::role(['admin', 'superadmin'])->count(),
                    'customers' => User::has('orders')->count(),
                    'visitors' => User::withoutRole(['admin', 'superadmin'])->doesntHave('orders')->count(),
                ],

                // 2. Revenue & Financials (Current Month vs Last Month)
                fn() => [
                    'revenue_current' => Order::where('status', 'completed')
                        ->whereBetween('created_at', [$startOfMonth, $endOfMonth])
                        ->sum('total'),
                    'revenue_last' => Order::where('status', 'completed')
                        ->whereBetween('created_at', [$startOfLastMonth, $endOfLastMonth])
                        ->sum('total'),
                    'orders_count_current' => Order::whereBetween('created_at', [$startOfMonth, $endOfMonth])->count(),
                    'orders_count_last' => Order::whereBetween('created_at', [$startOfLastMonth, $endOfLastMonth])->count(),
                ],

                // 3. Inventory Health (Critical for operations)
                fn() => [
                    'low_stock_count' => Product::where('quantity', '<=', 5)->count(),
                    'out_of_stock_count' => Product::where('quantity', 0)->count(),
                    'top_products' => DB::table('order_items')
                        ->select('product_id', DB::raw('SUM(quantity) as total_sold'))
                        ->groupBy('product_id')
                        ->orderByDesc('total_sold')
                        ->limit(5)
                        ->get(), // You might want to join with products table here or load client-side
                ],

                // 4. Chart Data (Last 30 Days Sales)
                fn() => Order::where('status', 'completed')
                    ->where('created_at', '>=', Carbon::now()->subDays(30))
                    ->selectRaw('DATE(created_at) as date, SUM(total) as total')
                    ->groupBy('date')
                    ->orderBy('date')
                    ->get(),

                // 5. Recent Activity (Latest 5 orders)
                fn() => Order::with('user:id,firstname,lastname,email')
                    ->latest()
                    ->take(5)
                    ->get(['id', 'user_id', 'total', 'status', 'created_at']),
            ]);
        });

        // Unpack the concurrency results
        [$userStats, $financials, $inventory, $chartData, $recentOrders] = $stats;

        // Helper to calculate growth percentage safely
        $calculateGrowth = fn($current, $previous) => $previous > 0
            ? round((($current - $previous) / $previous) * 100, 1)
            : 100;

        // Format the final data structure for the frontend
        $dashboardData = [
            'users' => $userStats,
            'financials' => [
                'revenue' => $financials['revenue_current'],
                'revenue_growth' => $calculateGrowth($financials['revenue_current'], $financials['revenue_last']),
                'orders' => $financials['orders_count_current'],
                'orders_growth' => $calculateGrowth($financials['orders_count_current'], $financials['orders_count_last']),
            ],
            'inventory' => [
                'low_stock' => $inventory['low_stock_count'],
                'out_of_stock' => $inventory['out_of_stock_count'],
            ],
            'charts' => [
                'sales_over_time' => $chartData
            ],
            'recent_orders' => $recentOrders
        ];

        return Inertia::render('admin/index', [
            'stats' => $dashboardData,
        ]);
    }
}
