<?php

namespace App\Http\Controllers\Front;

use App\Http\Controllers\Controller;
use App\Models\Newsletter;
use Illuminate\Http\Request;

class NewsletterController extends Controller
{
    public function store(Request $request)
    {
        // validate email
        $request->validate([
            'email' => 'required|email|unique:newsletters,email',
        ]);

        // save email
        Newsletter::create([
            'email' => $request->email,
        ]);

        return back()->with('success', "Merci d'avoir souscris !");
    }
}
