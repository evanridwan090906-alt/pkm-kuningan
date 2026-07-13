<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

use App\Models\Book;
use App\Models\Transaction;
use App\Models\Archive;
use App\Models\User;

class DashboardController extends Controller
{
    public function index()
    {
        $totalBooks = Book::count();
        $borrowedBooks = Transaction::where('status', 'dipinjam')->count();
        $damagedOrLostBooks = Archive::whereIn('status', ['rusak', 'hilang'])->sum('qty');
        $totalUsers = User::count();

        // Stock warnings and stats
        $lowStockBooks = Book::where('stock', '<', 5)->take(5)->get();
        $mostDamagedLost = Archive::whereIn('status', ['rusak', 'hilang'])
            ->select('book_id', \Illuminate\Support\Facades\DB::raw('SUM(qty) as total'))
            ->groupBy('book_id')
            ->orderBy('total', 'desc')
            ->with('book')
            ->take(5)
            ->get();

        // Sirkulasi Mingguan (Borrowing trend last 7 days)
        $circulation = [];
        for ($i = 6; $i >= 0; $i--) {
            $date = now()->subDays($i)->format('Y-m-d');
            $count = Transaction::whereDate('borrow_date', $date)->count();
            $circulation[] = [
                'date' => $date,
                'count' => $count
            ];
        }

        $latestTransactions = Transaction::with(['book'])->orderBy('created_at', 'desc')->take(5)->get();
        $latestActivities = Archive::with(['book'])->orderBy('created_at', 'desc')->take(10)->get();

        return response()->json([
            'stats' => [
                'total_books' => $totalBooks,
                'borrowed_books' => $borrowedBooks,
                'damaged_lost_books' => $damagedOrLostBooks,
                'total_users' => $totalUsers,
                'low_stock_count' => Book::where('stock', '<', 5)->count(),
                'online_petugas' => User::where('role', 'petugas')
                    ->where('last_seen', '>=', now()->subMinutes(5))
                    ->count()
            ],
            'low_stock_books' => $lowStockBooks,
            'most_damaged_lost' => $mostDamagedLost,
            'circulation' => $circulation,
            'latest_transactions' => $latestTransactions,
            'latest_activities' => $latestActivities
        ]);
    }
}
