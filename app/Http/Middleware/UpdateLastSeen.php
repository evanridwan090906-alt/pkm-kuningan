<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class UpdateLastSeen
{
    /**
     * Handle an incoming request.
     *
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();
        if ($user) {
            // Check if user is active
            if (!$user->is_active) {
                $user->tokens()->delete();
                return response()->json(['message' => 'Akun Anda telah dinonaktifkan.'], 403);
            }

            $user->update([
                'last_seen' => now(),
                'last_ip' => $request->ip(),
                'last_device' => $request->header('User-Agent'),
            ]);
        }
        return $next($request);
    }
}
