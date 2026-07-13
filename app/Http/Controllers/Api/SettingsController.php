<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\SystemSetting;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rules\Password;

class SettingsController extends Controller
{
    public function index()
    {
        $user = auth()->user();
        $system = SystemSetting::first() ?? SystemSetting::create([
            'app_name' => 'CASPER Smart Library',
            'school_name' => 'SMK PERTIWI KUNINGAN'
        ]);

        return response()->json([
            'user' => $user,
            'system' => $system
        ]);
    }

    public function publicConfig()
    {
        $system = SystemSetting::first() ?? SystemSetting::create([
            'app_name' => 'CASPER Smart Library',
            'school_name' => 'SMK PERTIWI KUNINGAN'
        ]);

        return response()->json([
            'system' => [
                'app_name' => $system->app_name,
                'school_name' => $system->school_name,
                'logo' => $system->logo,
                'primary_color' => $system->primary_color,
            ]
        ]);
    }

    public function updateProfile(Request $request)
    {
        $user = auth()->user();

        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users,email,' . $user->id,
            'phone' => 'nullable|string|max:20',
            'profile_photo' => 'nullable|mimes:jpeg,png,jpg,gif,svg|max:2048',
        ]);

        $user->name = $request->name;
        $user->email = $request->email;
        $user->phone = $request->phone;

        if ($request->hasFile('profile_photo')) {
            if ($user->profile_photo_path) {
                Storage::delete('public/' . $user->profile_photo_path);
            }
            $path = $request->file('profile_photo')->store('profile_photos', 'public');
            // store() returns 'profile_photos/filename.jpg', we save this to profile_photo_path
            $user->profile_photo_path = $path;
        }

        $user->save();

        return response()->json([
            'message' => 'Profil berhasil diperbarui',
            'user' => $user
        ]);
    }

    public function updatePassword(Request $request)
    {
        $request->validate([
            'current_password' => ['required', 'current_password'],
            'password' => ['required', 'confirmed', Password::defaults()],
        ]);

        $request->user()->update([
            'password' => Hash::make($request->password),
        ]);

        return response()->json([
            'message' => 'Password berhasil diperbarui'
        ]);
    }

    public function updateSystem(Request $request)
    {
        if (auth()->user()->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $request->validate([
            'app_name' => 'required|string|max:255',
            'school_name' => 'required|string|max:255',
            'address' => 'nullable|string',
            'logo' => 'nullable|mimes:jpeg,png,jpg,gif,svg|max:2048',
            'primary_color' => 'required|string|max:7',
            'date_format' => 'required|string|max:20',
        ]);

        $system = SystemSetting::first() ?? new SystemSetting();
        $system->app_name = $request->app_name;
        $system->school_name = $request->school_name;
        $system->address = $request->address;
        $system->primary_color = $request->primary_color;
        $system->date_format = $request->date_format;

        if ($request->hasFile('logo')) {
            if ($system->logo) {
                Storage::delete($system->logo);
            }
            $path = $request->file('logo')->store('logos', 'public');
            $system->logo = $path;
        }

        $system->save();

        return response()->json([
            'message' => 'Pengaturan sistem berhasil diperbarui',
            'system' => $system
        ]);
    }

    public function updateNotifications(Request $request)
    {
        if (auth()->user()->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $request->validate([
            'notif_loan' => 'required|boolean',
            'notif_late' => 'required|boolean',
            'notif_email' => 'required|boolean',
        ]);

        $system = SystemSetting::first() ?? new SystemSetting();
        $system->notif_loan = $request->notif_loan;
        $system->notif_late = $request->notif_late;
        $system->notif_email = $request->notif_email;
        $system->save();

        return response()->json([
            'message' => 'Pengaturan notifikasi berhasil diperbarui',
            'system' => $system
        ]);
    }

    public function updateSecurity(Request $request)
    {
        if (auth()->user()->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $request->validate([
            'auto_logout_minutes' => 'required|integer|in:5,10,30,60,0',
        ]);

        $system = SystemSetting::first() ?? new SystemSetting();
        $system->auto_logout_minutes = $request->auto_logout_minutes;
        $system->save();

        return response()->json([
            'message' => 'Pengaturan keamanan berhasil diperbarui',
            'system' => $system
        ]);
    }

    public function getSessions(Request $request)
    {
        $sessions = \DB::table('sessions')
            ->where('user_id', $request->user()->id)
            ->orderBy('last_activity', 'desc')
            ->get();

        $formatted = $sessions->map(function ($session) {
            $ua = $session->user_agent;
            
            // Basic OS Detection
            $os = 'Unknown Device';
            if (str_contains($ua, 'Windows')) $os = 'Windows';
            elseif (str_contains($ua, 'Android')) $os = 'Android';
            elseif (str_contains($ua, 'iPhone') || str_contains($ua, 'iPad')) $os = 'iOS';
            elseif (str_contains($ua, 'Macintosh')) $os = 'macOS';
            elseif (str_contains($ua, 'Linux')) $os = 'Linux';

            // Basic Browser Detection
            $browser = 'Browser';
            if (str_contains($ua, 'Edg')) $browser = 'Edge';
            elseif (str_contains($ua, 'Chrome')) $browser = 'Chrome';
            elseif (str_contains($ua, 'Firefox')) $browser = 'Firefox';
            elseif (str_contains($ua, 'Safari') && !str_contains($ua, 'Chrome')) $browser = 'Safari';

            $device = "$os • $browser";
            $time = \Carbon\Carbon::createFromTimestamp($session->last_activity);
            
            return [
                'id' => $session->id,
                'device' => $device,
                'ip' => $session->ip_address,
                'time' => $time->diffForHumans(),
                'is_current' => $session->id === session()->getId(),
                'status' => $time->diffInMinutes() < 5 ? 'Online' : 'Offline'
            ];
        });

        return response()->json($formatted);
    }

    public function logoutOtherDevices(Request $request)
    {
        \DB::table('sessions')
            ->where('user_id', $request->user()->id)
            ->where('id', '!=', session()->getId())
            ->delete();

        // Also revoke all tokens except current one
        $request->user()->tokens()->where('id', '!=', $request->user()->currentAccessToken()->id)->delete();

        return response()->json(['message' => 'Berhasil mengeluarkan perangkat lain']);
    }
}
