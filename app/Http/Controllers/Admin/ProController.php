<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\ProRequestResource;
use App\Models\ProRequest;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ProController extends Controller
{
    public function index(Request $request)
    {
        $request->validate([
            'page' => ['integer', 'min:1'],
            'per_page' => ['integer', 'min:1', 'max:100'],
            'search' => ['nullable', 'string'],
            'sort' => ['nullable', 'string'],
        ]);

        $query = ProRequest::with('user');

        if ($request->filled('search')) {
            $searchColumns = ['company_name', 'niu'];
            $query->whereAny($searchColumns, 'like', '%'.$request->string('search').'%');
        }

        $allowed = ['company_name', 'created_at', 'updated_at'];
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
        $proRequests = $query->paginate($perPage)->withQueryString();

        return Inertia::render('admin/pro/index', [
            'proRequests' => ProRequestResource::collection($proRequests)->response()->getData(true),
            'filters' => $request->only(['search', 'status', 'sort', 'per_page']),
        ]);
    }

    public function update(Request $request, ProRequest $proRequest)
    {
        $validated = $request->validate([
            'status' => 'required|in:pending,approved,rejected',
        ]);

        $proRequest->update($validated);

        return back()->with('success', __("Tout s'est bien passé."));
    }

    public function destroy(Request $request)
    {
        try {
            if ($request->has('ids')) {
                $ids = $request->input('ids', []);

                ProRequest::destroy($ids);
            }

            return redirect()->back()->with('success', 'Compte(s) supprimé(s) avec succès.');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Erreur : '.$e->getMessage());
        }
    }
}
