<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class StudentManagementController extends Controller
{
    /**
     * GET /api/students
     */
    public function index(Request $request)
    {
        $query = User::where('role', 'siswa');

        if ($request->filled('search')) {
            $query->where(function ($q) use ($request) {
                $q->where('name', 'like', '%' . $request->search . '%')
                  ->orWhere('email', 'like', '%' . $request->search . '%')
                  ->orWhere('nisn', 'like', '%' . $request->search . '%');
            });
        }

        if ($request->filled('jurusan')) {
            $query->where('jurusan', $request->jurusan);
        }

        if ($request->filled('angkatan')) {
            $query->where('angkatan', $request->angkatan);
        }

        if ($request->filled('is_active')) {
            $query->where('is_active', $request->boolean('is_active'));
        }

        // Return paginated response
        return response()->json([
            'success' => true,
            'data' => $query->orderBy('name')->paginate(15)
        ]);
    }

    /**
     * POST /api/students
     */
    public function store(Request $request)
    {
        $request->validate([
            'name'     => 'required|string|max:255',
            'nisn'      => 'required|string|max:50|unique:users,nisn', // nisn acts as NISN
            'email'    => 'required|string|email|max:255|unique:users',
            'jurusan'  => 'nullable|string|max:100',
            'angkatan' => 'nullable|string|max:10',
            'kelas'    => 'nullable|string|max:50',
            'password' => 'required|string|min:8',
            'photo'    => 'nullable|image|mimes:jpeg,png,jpg|max:2048'
        ]);

        $data = $request->only(['name', 'nisn', 'email', 'jurusan', 'angkatan', 'kelas']);
        $data['role'] = 'siswa';
        $data['password'] = Hash::make($request->password);
        $data['is_active'] = $request->boolean('is_active', true);

        if ($request->hasFile('photo')) {
            $data['photo'] = $request->file('photo')->store('profiles', 'public');
            $data['profile_photo_path'] = $data['photo']; // Compatibility with existing field
        }

        $user = User::create($data);

        return response()->json([
            'success' => true,
            'message' => 'Siswa berhasil ditambahkan',
            'data' => $user
        ], 201);
    }

    /**
     * PUT /api/students/{id}
     */
    public function update(Request $request, $id)
    {
        $user = User::where('role', 'siswa')->findOrFail($id);

        $request->validate([
            'name'     => 'required|string|max:255',
            'nisn'      => 'required|string|max:50|unique:users,nisn,' . $user->id,
            'email'    => 'required|string|email|max:255|unique:users,email,' . $user->id,
            'jurusan'  => 'nullable|string|max:100',
            'angkatan' => 'nullable|string|max:10',
            'kelas'    => 'nullable|string|max:50',
            'password' => 'nullable|string|min:8',
            'photo'    => 'nullable|image|mimes:jpeg,png,jpg|max:2048'
        ]);

        $data = $request->only(['name', 'nisn', 'email', 'jurusan', 'angkatan', 'kelas']);
        
        if ($request->has('is_active')) {
            $data['is_active'] = $request->boolean('is_active');
            // If deactivated, revoke tokens
            if (!$data['is_active']) {
                $user->tokens()->delete();
            }
        }

        if ($request->filled('password')) {
            $data['password'] = Hash::make($request->password);
        }

        if ($request->hasFile('photo')) {
            if ($user->photo) {
                Storage::disk('public')->delete($user->photo);
            }
            if ($user->profile_photo_path && $user->profile_photo_path !== $user->photo) {
                Storage::disk('public')->delete($user->profile_photo_path);
            }
            $data['photo'] = $request->file('photo')->store('profiles', 'public');
            $data['profile_photo_path'] = $data['photo'];
        }

        $user->update($data);

        return response()->json([
            'success' => true,
            'message' => 'Data siswa berhasil diperbarui',
            'data' => $user
        ]);
    }

    /**
     * DELETE /api/students/{id}
     */
    public function destroy($id)
    {
        $user = User::where('role', 'siswa')->findOrFail($id);

        if ($user->photo) {
            Storage::disk('public')->delete($user->photo);
        }
        if ($user->profile_photo_path && $user->profile_photo_path !== $user->photo) {
            Storage::disk('public')->delete($user->profile_photo_path);
        }
        
        $user->delete();

        return response()->json([
            'success' => true,
            'message' => 'Siswa berhasil dihapus'
        ]);
    }

    /**
     * POST /api/students/import
     */
    public function import(Request $request)
    {
        $request->validate([
            'file' => 'required|file|mimes:csv,txt|max:5120' // only basic csv support here
        ]);

        $file = $request->file('file');
        $csvData = file_get_contents($file);
        $rows = array_map("str_getcsv", explode("\n", $csvData));
        $header = array_shift($rows); // Expect: name, nisn, email, jurusan, angkatan, kelas

        if (count($header) < 3) {
            return response()->json(['message' => 'Format file tidak valid. Header harus berisi name, nisn, email'], 400);
        }

        $header = array_map('strtolower', array_map('trim', $header));
        
        $imported = 0;
        foreach ($rows as $row) {
            if (empty($row) || count($row) !== count($header)) continue;
            
            $row = array_combine($header, array_map('trim', $row));
            
            if (empty($row['name']) || empty($row['email']) || empty($row['nisn'])) continue;

            $password = isset($row['password']) && !empty($row['password']) 
                        ? $row['password'] 
                        : Str::random(8); // Auto generate if empty

            User::updateOrCreate(
                ['nisn' => $row['nisn']],
                [
                    'name' => $row['name'],
                    'email' => $row['email'],
                    'password' => Hash::make($password),
                    'role' => 'siswa',
                    'jurusan' => $row['jurusan'] ?? null,
                    'angkatan' => $row['angkatan'] ?? null,
                    'kelas' => $row['kelas'] ?? null,
                    'is_active' => true
                ]
            );
            $imported++;
        }

        return response()->json([
            'success' => true,
            'message' => "$imported data siswa berhasil diimpor"
        ]);
    }
}
