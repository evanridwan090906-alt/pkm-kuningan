<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;

class UserController extends Controller
{
    public function index()
    {
        return response()->json(User::whereIn('role', ['admin', 'petugas'])->orderBy('role')->orderBy('name')->get());
    }

    public function getPetugas()
    {
        return response()->json(User::where('role', 'petugas')->get());
    }

    public function getSiswa()
    {
        return response()->json(User::where('role', 'siswa')->orderBy('name')->get());
    }

    public function resetPassword(Request $request, User $user)
    {
        $request->validate(['password' => 'required|string|min:8']);
        $user->update(['password' => bcrypt($request->password)]);
        return response()->json(['message' => 'Password berhasil direset.']);
    }

    public function forceLogout(User $user)
    {
        $user->tokens()->delete();
        return response()->json(['message' => 'User berhasil dikeluarkan dari semua perangkat.']);
    }

    public function updateStatus(Request $request, User $user)
    {
        $request->validate(['is_active' => 'required|boolean']);
        $user->update(['is_active' => $request->is_active]);
        if (!$request->is_active) {
            $user->tokens()->delete();
        }
        return response()->json($user);
    }

    public function getActivities(User $user)
    {
        $activities = \App\Models\Archive::where('user_id', $user->id)
            ->with('book')
            ->orderBy('created_at', 'desc')
            ->take(20)
            ->get();
            
        return response()->json($activities);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name'     => 'required|string|max:255',
            'email'    => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8',
            'role'     => 'required|in:admin,petugas,siswa',
            'nim'      => 'nullable|string|max:50|unique:users,nim',
            'jurusan'  => 'nullable|string|max:100',
            'angkatan' => 'nullable|string|max:10',
        ]);

        $user = User::create([
            'name'     => $request->name,
            'email'    => $request->email,
            'password' => bcrypt($request->password),
            'role'     => $request->role,
            'nim'      => $request->nim,
            'jurusan'  => $request->jurusan,
            'angkatan' => $request->angkatan,
            'is_active'=> true,
        ]);

        return response()->json($user, 201);
    }

    public function show(User $user)
    {
        return response()->json($user);
    }

    public function update(Request $request, User $user)
    {
        $request->validate([
            'name'     => 'required|string|max:255',
            'email'    => 'required|string|email|max:255|unique:users,email,' . $user->id,
            'role'     => 'required|in:admin,petugas,siswa',
            'nim'      => 'nullable|string|max:50|unique:users,nim,' . $user->id,
            'jurusan'  => 'nullable|string|max:100',
            'angkatan' => 'nullable|string|max:10',
        ]);

        $data = $request->only(['name', 'email', 'role', 'nim', 'jurusan', 'angkatan']);
        if ($request->filled('password')) {
            $request->validate(['password' => 'string|min:8']);
            $data['password'] = bcrypt($request->password);
        }

        $user->update($data);
        return response()->json($user);
    }

    public function destroy(User $user)
    {
        if ($user->id === request()->user()->id) {
            return response()->json(['message' => 'Anda tidak bisa menghapus diri sendiri.'], 400);
        }
        $user->delete();
        return response()->json(null, 204);
    }
}
