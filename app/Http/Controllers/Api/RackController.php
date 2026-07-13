<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Rack;
use Illuminate\Http\Request;

class RackController extends Controller
{
    public function index()
    {
        return response()->json(Rack::all());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|unique:racks,name',
            'description' => 'nullable|string',
        ]);

        $rack = Rack::create($validated);

        return response()->json([
            'message' => 'Rack created successfully',
            'data' => $rack
        ], 201);
    }

    public function show(Rack $rack)
    {
        return response()->json($rack);
    }

    public function update(Request $request, Rack $rack)
    {
        $validated = $request->validate([
            'name' => 'required|string|unique:racks,name,' . $rack->id,
            'description' => 'nullable|string',
        ]);

        $rack->update($validated);

        return response()->json([
            'message' => 'Rack updated successfully',
            'data' => $rack
        ]);
    }

    public function destroy(Rack $rack)
    {
        $rack->delete();

        return response()->json([
            'message' => 'Rack deleted successfully'
        ]);
    }
}
