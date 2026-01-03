<?php

namespace App\Http\Controllers\Front;

use App\Http\Controllers\Controller;
use App\Models\ProRequest;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ProController extends Controller
{
    public function index()
    {
        return Inertia::render('front/pro');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'company_name' => 'required|string|max:255',
            'niu' => 'nullable|string|max:50', // Spécifique Cameroun
            'contact_name' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'phone' => 'required|string|max:20',
            'activity_sector' => 'required|string',
            'address' => 'required|string',
            'message' => 'nullable|string',
        ]);

        ProRequest::create($validated);

        return back()->with('success', 'Votre demande a été reçue. Notre service commercial vous contactera sous 24h pour activer votre compte pro.');
    }
}
