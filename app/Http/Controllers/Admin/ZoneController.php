<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\ZoneRequest;
use App\Http\Resources\CountryResource;
use App\Http\Resources\ZoneResource;
use App\Models\Country;
use App\Models\Zone;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Inertia\Inertia;

class ZoneController extends Controller
{
    public function index(Request $request)
    {
        $request->validate([
            'page' => ['integer', 'min:1'],
            'per_page' => ['integer', 'min:1', 'max:100'],
            'search' => ['nullable', 'string'],
            'sort' => ['nullable', 'string'],
        ]);

        $query = Zone::with('country');

        if ($request->filled('search')) {
            $searchColumns = ['name'];
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
        $zones = $query->paginate($perPage)->withQueryString();

        $countries = Cache::rememberForever('countries', function () {
            return Country::orderBy('name')->get(['id', 'iso', 'nicename', 'name', 'phonecode']);
        });

        return Inertia::render('admin/carriers/zones/index', [
            'countries' => CountryResource::collection($countries),
            'zones' => ZoneResource::collection($zones)->response()->getData(true),
            'filters' => $request->only(['search', 'status', 'sort', 'per_page']),
        ]);
    }

    public function store(ZoneRequest $request)
    {
        Zone::create($request->validated());

        return back()->with('success', 'Zone ajoutée avec succès !');
    }

    public function update(ZoneRequest $request, Zone $zone)
    {
        $zone->update($request->validated());

        return redirect()->back()->with('success', 'Zone mise à jour avec succès.');
    }

    public function destroy(Request $request)
    {
        try {
            if ($request->has('ids')) {
                $ids = $request->input('ids', []);

                if (! empty($ids)) {
                    Zone::destroy($ids);
                }
            }

            return redirect()->back()->with('success', 'Zone(s) supprimée(s) avec succès.');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Erreur : '.$e->getMessage());
        }
    }
}
