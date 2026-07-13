<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\BookController;
use App\Http\Controllers\Api\ArchiveController;
use App\Http\Controllers\Api\TransactionController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\ExportController;
use App\Http\Controllers\Api\RackController;
use App\Http\Controllers\Api\StockController;
use App\Http\Controllers\Api\SettingsController;
use App\Http\Controllers\Api\EbookController;
use App\Http\Controllers\Api\BorrowController;
use App\Http\Controllers\Api\StudentController;
use App\Http\Controllers\Api\ReportController;

Route::get('/check-setup', [AuthController::class, 'checkSetup']);
Route::post('/setup', [AuthController::class, 'setup']);
Route::post('/login', [AuthController::class, 'login']);
Route::get('/public/settings', [SettingsController::class, 'publicConfig']);

Route::middleware(['auth:sanctum', 'last_seen'])->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);
    
    // Settings Routes
    Route::get('/settings', [SettingsController::class, 'index']);
    Route::post('/settings/profile', [SettingsController::class, 'updateProfile']);
    Route::post('/settings/password', [SettingsController::class, 'updatePassword']);
    Route::post('/settings/system', [SettingsController::class, 'updateSystem']);
    Route::post('/settings/notifications', [SettingsController::class, 'updateNotifications']);
    Route::post('/settings/security', [SettingsController::class, 'updateSecurity']);
    Route::get('/settings/sessions', [SettingsController::class, 'getSessions']);
    Route::post('/settings/sessions/logout-others', [SettingsController::class, 'logoutOtherDevices']);

    Route::get('/categories', [CategoryController::class, 'index']);

    // ========================
    // E-BOOK ROUTES (all authenticated roles)
    // ========================
    Route::get('/ebooks/popular', [EbookController::class, 'popular']);
    Route::get('/ebooks', [EbookController::class, 'index']);
    Route::get('/ebooks/{id}', [EbookController::class, 'show']);
    Route::post('/ebooks/{id}/download', [EbookController::class, 'download']);

    // ========================
    // BORROW ROUTES (all roles)
    // ========================
    Route::get('/borrow/stats', [BorrowController::class, 'stats']);
    Route::get('/borrow', [BorrowController::class, 'index']);
    Route::post('/borrow', [BorrowController::class, 'store']);
    Route::get('/borrow/{id}', [BorrowController::class, 'show']);

    // ========================
    // STUDENT ROUTES
    // ========================
    Route::get('/student/dashboard', [StudentController::class, 'dashboard']);
    Route::get('/student/history', [StudentController::class, 'history']);

    // Public book catalog for siswa
    Route::get('/books/catalog', [BookController::class, 'index']);
    Route::get('/ebooks', [EbookController::class, 'index']);
    Route::get('/ebooks/{id}', [EbookController::class, 'show']);

    // ========================
    // ADMIN & PETUGAS ROUTES
    // ========================
    Route::middleware('role:admin,petugas')->group(function () {
        Route::get('/dashboard', [DashboardController::class, 'index']);
        Route::get('/global-search', [BookController::class, 'globalSearch']);

        // Export routes
        Route::get('/export/transactions/excel', [ExportController::class, 'exportTransactionsExcel']);
        Route::get('/export/transactions/pdf', [ExportController::class, 'exportTransactionsPdf']);
        Route::get('/export/archives/excel', [ExportController::class, 'exportArchivesExcel']);
        Route::get('/export/archives/pdf', [ExportController::class, 'exportArchivesPdf']);

        Route::get('/books/isbn/{isbn}', [BookController::class, 'findByIsbn']);

        Route::apiResource('books', BookController::class);
        Route::post('ebooks/import-link', [EbookController::class, 'importMetadata']);
        Route::apiResource('archives', ArchiveController::class);
        Route::apiResource('transactions', TransactionController::class);
        Route::apiResource('racks', RackController::class);

        // Stock Management
        Route::post('/books/stock-in', [StockController::class, 'stockIn']);
        Route::post('/books/stock-out', [StockController::class, 'stockOut']);
        Route::post('/books/batch-stock-out', [StockController::class, 'batchStockOut']);
        Route::get('/books/barcode/{code}', [StockController::class, 'barcodeLookup']);
        Route::get('/stock/history', [StockController::class, 'history']);
        Route::get('/stock/stats', [StockController::class, 'stats']);

        // E-Book Management (Petugas can upload/edit)
        Route::post('/ebooks', [EbookController::class, 'store']);
        Route::post('/ebooks/{id}/update', [EbookController::class, 'update']); // multipart workaround
        Route::put('/ebooks/{id}', [EbookController::class, 'update']);
        Route::delete('/ebooks/{id}', [EbookController::class, 'destroy']);

        // Borrow Management (Petugas processes borrows)
        Route::put('/borrow/{id}/approve', [BorrowController::class, 'approve']);
        Route::put('/borrow/{id}/confirm', [BorrowController::class, 'confirm']);
        Route::put('/borrow/{id}/reject', [BorrowController::class, 'reject']);
        Route::put('/borrow/{id}/return', [BorrowController::class, 'returnBook']);
        Route::put('/borrow/{id}/due-date', [BorrowController::class, 'updateDueDate']);
        Route::put('/borrow/{id}/return-date', [BorrowController::class, 'updateReturnDate']);
        Route::get('/borrow/overdue-check', [BorrowController::class, 'overdueCheck']);

        // Student Management (Admin & Petugas)
        Route::get('/students', [\App\Http\Controllers\Api\StudentManagementController::class, 'index']);
        Route::post('/students', [\App\Http\Controllers\Api\StudentManagementController::class, 'store']);
        Route::post('/students/import', [\App\Http\Controllers\Api\StudentManagementController::class, 'import']);
        Route::put('/students/{id}', [\App\Http\Controllers\Api\StudentManagementController::class, 'update']);
        Route::delete('/students/{id}', [\App\Http\Controllers\Api\StudentManagementController::class, 'destroy']);

        // Reports
        Route::get('/reports/borrow', [ReportController::class, 'getBorrowReport']);
        Route::get('/reports/return', [ReportController::class, 'getReturnReport']);
        Route::get('/reports/ebooks', [ReportController::class, 'getEbookReport']);
        Route::get('/reports/borrow/excel', [ReportController::class, 'exportBorrowExcel']);
        Route::get('/reports/borrow/pdf', [ReportController::class, 'exportBorrowPdf']);
    });

    // Admin only routes
    Route::middleware('role:admin')->group(function () {
        Route::apiResource('categories', CategoryController::class)->except(['index']);
        
        // Extended User Management
        Route::get('/petugas', [UserController::class, 'getPetugas']);
        Route::get('/siswa', [UserController::class, 'getSiswa']);
        Route::post('/users/{user}/reset-password', [UserController::class, 'resetPassword']);
        Route::post('/users/{user}/force-logout', [UserController::class, 'forceLogout']);
        Route::put('/users/{user}/status', [UserController::class, 'updateStatus']);
        Route::get('/users/{user}/activities', [UserController::class, 'getActivities']);
        
        Route::apiResource('users', UserController::class);

        
        Route::apiResource('users', UserController::class);
    });
});
