<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\ContactRequest;
use App\Http\Resources\ContactResource;
use App\Mail\ContactMessage;
use App\Models\Contact;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Inertia\Inertia;

class ContactController extends Controller
{
    public function index(Request $request)
    {
        $request->validate([
            'page' => ['integer', 'min:1'],
            'per_page' => ['integer', 'min:1', 'max:100'],
            'search' => ['nullable', 'string'],
            'sort' => ['nullable', 'string'],
        ]);

        $query = Contact::query();

        if ($request->filled('search')) {
            $query->whereAny(['name', 'email'], 'like', '%'.$request->string('search').'%');
        }

        $allowed = ['name', 'email', 'created_at', 'updated_at'];
        if ($request->filled('sort')) {
            $sort = $request->string('sort');
            $direction = str_starts_with($sort, '-') ? 'desc' : 'asc';
            $column = ltrim($sort, '-');
            if (in_array($column, $allowed)) {
                $query->orderBy($column, $direction);
            }
        } else {
            $query->orderBy('created_at', 'desc');
        }

        $perPage = $request->integer('per_page', 10);
        $contacts = $query->paginate($perPage)->withQueryString();

        return Inertia::render('admin/contacts/index', [
            'contacts' => ContactResource::collection($contacts)->response()->getData(true),
            'filters' => $request->only(['search', 'status', 'sort', 'per_page']),
        ]);
    }

    public function store(ContactRequest $request)
    {
        try {
            $validated = [...$request->validated()];

            $admins = config('app.contact_recipients');

            rescue(fn () => Mail::to($admins)->send(new ContactMessage($validated)), false);

            Contact::create($validated);

            return redirect()->back()->with('success', 'Contact créé avec succès.');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Erreur : '.$e->getMessage());
        }
    }

    public function destroy(Request $request)
    {
        try {
            if ($request->has('ids')) {
                $ids = $request->input('ids', []);

                Contact::destroy($ids);
            }

            return redirect()->back()->with('success', 'Contact(s) supprimé(s) avec succès.');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Erreur : '.$e->getMessage());
        }
    }
}
