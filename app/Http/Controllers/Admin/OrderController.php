<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;

class OrderController extends Controller
{
    public function index(Request $request)
    {
        return Inertia::render('admin/orders/index');
    }

    public function create()
    {
        return Inertia::render('admin/orders/create');
    }
}
