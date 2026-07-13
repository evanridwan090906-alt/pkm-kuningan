<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\BorrowTransaction;
use App\Models\EbookDownload;
use App\Models\Ebook;
use App\Models\Book;
use Illuminate\Http\Request;

class StudentController extends Controller
{
    /**
     * GET /api/student/dashboard - Student dashboard stats
     */
    public function dashboard(Request $request)
    {
        $user = $request->user();

        $borrowStats = [
            'total'    => BorrowTransaction::where('user_id', $user->id)->count(),
            'borrowed' => BorrowTransaction::where('user_id', $user->id)->whereIn('status', ['borrowed', 'overdue'])->count(),
            'returned' => BorrowTransaction::where('user_id', $user->id)->where('status', 'returned')->count(),
            'pending'  => BorrowTransaction::where('user_id', $user->id)->where('status', 'pending')->count(),
        ];

        $ebookStats = [
            'downloads' => EbookDownload::where('user_id', $user->id)->where('action', 'download')->count(),
            'reads'     => EbookDownload::where('user_id', $user->id)->where('action', 'read')->count(),
        ];

        // Recent borrow activity
        $recentBorrows = BorrowTransaction::with(['book.category'])
            ->where('user_id', $user->id)
            ->orderBy('created_at', 'desc')
            ->limit(5)
            ->get();

        // Recent ebook activity
        $recentEbooks = EbookDownload::with('ebook')
            ->where('user_id', $user->id)
            ->orderBy('created_at', 'desc')
            ->limit(5)
            ->get();

        return response()->json([
            'success' => true,
            'data' => [
                'borrow_stats'   => $borrowStats,
                'ebook_stats'    => $ebookStats,
                'recent_borrows' => $recentBorrows,
                'recent_ebooks'  => $recentEbooks,
            ]
        ]);
    }

    /**
     * GET /api/student/history - Full activity history
     */
    public function history(Request $request)
    {
        $user = $request->user();

        $borrows = BorrowTransaction::with(['book.category', 'book.rack'])
            ->where('user_id', $user->id)
            ->orderBy('created_at', 'desc')
            ->paginate(10, ['*'], 'borrow_page');

        $ebooks = EbookDownload::with('ebook.category')
            ->where('user_id', $user->id)
            ->orderBy('created_at', 'desc')
            ->paginate(10, ['*'], 'ebook_page');

        return response()->json([
            'success' => true,
            'data' => [
                'borrows' => $borrows,
                'ebooks'  => $ebooks,
            ]
        ]);
    }
}
