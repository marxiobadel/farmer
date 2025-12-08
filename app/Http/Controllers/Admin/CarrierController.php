<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\CarrierRequest;
use App\Http\Resources\CarrierResource;
use App\Models\Carrier;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CarrierController extends Controller
{
    public function index(Request $request)
    {
        $request->validate([
            'page' => ['integer', 'min:1'],
            'per_page' => ['integer', 'min:1', 'max:100'],
            'search' => ['nullable', 'string'],
            'sort' => ['nullable', 'string'],
        ]);

        $query = Carrier::with('rates');

        if ($request->filled('search')) {
            $searchColumns = ['name', 'description'];
            $query->whereAny($searchColumns, 'like', '%'.$request->string('search').'%');
        }

        $allowed = ['name', 'created_at', 'updated_at'];
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
        $carriers = $query->paginate($perPage)->withQueryString();

        return Inertia::render('admin/carriers/index', [
            'zones' => CarrierResource::collection($carriers)->response()->getData(true),
            'filters' => $request->only(['search', 'status', 'sort', 'per_page']),
        ]);
    }

    public function store(CarrierRequest $request)
    {
        Carrier::create($request->validated());

        return back()->with('success', 'Transporteur ajouté avec succès !');
    }

    public function update(CarrierRequest $request, Carrier $carrier)
    {
        $carrier->update($request->validated());

        return redirect()->back()->with('success', 'Transporteur mis à jour avec succès.');
    }

    public function destroy(Request $request)
    {
        try {
            if ($request->has('ids')) {
                $ids = $request->input('ids', []);

                if (! empty($ids)) {
                    Carrier::destroy($ids);
                }
            }

            return redirect()->back()->with('success', 'Transporteur(s) supprimée(s) avec succès.');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Erreur : '.$e->getMessage());
        }
    }
}
