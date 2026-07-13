<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;
use App\Models\User;

class AuthController extends Controller
{
    public function login(Request $request)
    {
        $identifier = $request->input('identifier', $request->input('email'));
        $request->merge(['identifier' => $identifier]);
        
        $validator = Validator::make($request->all(), [
            'identifier' => 'required',
            'password' => 'required',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validasi gagal',
                'errors' => $validator->errors()
            ], 422);
        }

        $identifier = $request->identifier;
        $user = User::where('email', $identifier)->orWhere('nisn', $identifier)->first();

        if (!$user || !Auth::attempt(['email' => $user->email, 'password' => $request->password])) {
            if ($user) {
                $user->increment('login_attempts');
            }
            return response()->json([
                'success' => false,
                'message' => 'Email/NISN atau Password salah'
            ], 401);
        }

        if (!$user->is_active) {
            Auth::logout();
            return response()->json([
                'success' => false,
                'message' => 'Akun Anda telah dinonaktifkan. Silakan hubungi Admin.'
            ], 403);
        }

        // Reset login attempts on success
        $user->update([
            'login_attempts' => 0,
            'last_login_at' => now(),
            'last_ip' => $request->ip(),
            'last_device' => $request->header('User-Agent'),
        ]);

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'success' => true,
            'message' => 'Login berhasil',
            'data' => [
                'user' => $user,
                'access_token' => $token,
                'token_type' => 'Bearer'
            ]
        ]);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'success' => true,
            'message' => 'Logout berhasil'
        ]);
    }

    public function me(Request $request)
    {
        return response()->json([
            'success' => true,
            'data' => $request->user()
        ]);
    }
    public function checkSetup()
    {
        $adminExists = User::where('role', 'admin')->exists();
        return response()->json(['setup_required' => !$adminExists]);
    }

    public function setup(Request $request)
    {
        // Cek apakah admin sudah ada
        if (User::where('role', 'admin')->exists()) {
            return response()->json(['message' => 'Admin sudah dikonfigurasi. Setup dibatalkan.'], 403);
        }

        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => bcrypt($request->password),
            'role' => 'admin',
        ]);

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'success' => true,
            'message' => 'Admin pertama berhasil dibuat',
            'data' => [
                'user' => $user,
                'access_token' => $token,
                'token_type' => 'Bearer'
            ]
        ], 201);
    }
}
