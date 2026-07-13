<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckRole
{
    /**
     * Handle an incoming request.
     * Supports single role: role:admin
     * Supports multiple roles: role:admin,petugas
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next, string ...$roles): Response
    {
        if (!$request->user()) {
            return response()->json(['message' => 'Unauthenticated.'], 401);
        }

        $userRole = $request->user()->role;
        
        // If no specific roles required, allow all authenticated users
        if (empty($roles)) {
            return $next($request);
        }

        foreach ($roles as $role) {
            // Support comma-separated roles in single argument e.g. role:admin,petugas
            $allowedRoles = explode(',', $role);
            if (in_array($userRole, $allowedRoles)) {
                return $next($request);
            }
        }

        return response()->json(['message' => 'Unauthorized. Akses ditolak.'], 403);
    }
}
