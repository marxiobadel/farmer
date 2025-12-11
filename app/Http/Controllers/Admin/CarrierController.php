<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\CarrierRequest;
use App\Http\Resources\CarrierResource;
use App\Http\Resources\ZoneResource;
use App\Models\Carrier;
use App\Models\Zone;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
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

        $query = Carrier::with('rates.zone');

        if ($request->filled('search')) {
            $searchColumns = ['name', 'description'];
            $query->whereAny($searchColumns, 'like', '%' . $request->string('search') . '%');
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
            'carriers' => CarrierResource::collection($carriers)->response()->getData(true),
            'filters' => $request->only(['search', 'status', 'sort', 'per_page']),
        ]);
    }

    public function create()
    {
        $zones = Zone::oldest('name')->get();

        return Inertia::render('admin/carriers/create', [
            'zones' => ZoneResource::collection($zones),
        ]);
    }

    public function edit(Carrier $carrier)
    {
        $zones = Zone::oldest('name')->get();

        return Inertia::render('admin/carriers/edit', [
            'carrier' => new CarrierResource($carrier->load(['rates.zone'])),
            'zones' => ZoneResource::collection($zones),
        ]);
    }

    public function store(CarrierRequest $request)
    {
        DB::beginTransaction();

        try {
            $data = $request->validated();

            $carrier = Carrier::create([
                'name' => $data['name'],
                'description' => $data['description'] ?? null,
                'base_price' => $data['base_price'] ?? 0,
                'free_shipping_min' => $data['free_shipping_min'] ?? null,
                'is_active' => $data['is_active'] ?? true,
                'pricing_type' => $data['pricing_type'],
            ]);

            if (!empty($data['rates'])) {
                foreach ($data['rates'] as $rateData) {
                    $carrier->rates()->create([
                        'min_weight' => $rateData['min_weight'] ?? null,
                        'max_weight' => $rateData['max_weight'] ?? null,
                        'min_price' => $rateData['min_price'] ?? null,
                        'max_price' => $rateData['max_price'] ?? null,
                        'min_volume' => $rateData['min_volume'] ?? null,
                        'max_volume' => $rateData['max_volume'] ?? null,
                        'rate_price' => $rateData['rate_price'],
                        'delivery_time' => $rateData['delivery_time'] ?? null,
                        'zone_id' => $rateData['zone_id'] ?? null,
                    ]);
                }
            }

            DB::commit();

            return to_route('admin.carriers.index');
        } catch (\Exception $e) {
            DB::rollBack();

            return back()->with('error', $e->getMessage());
        }
    }

    public function update(CarrierRequest $request, Carrier $carrier)
    {
        DB::beginTransaction();

        try {
            $data = $request->validated();

            $carrier->update([
                'name' => $data['name'],
                'description' => $data['description'] ?? null,
                'base_price' => $data['base_price'] ?? 0,
                'free_shipping_min' => $data['free_shipping_min'] ?? null,
                'is_active' => $data['is_active'] ?? true,
                'pricing_type' => $data['pricing_type'],
            ]);

            $carrier->rates()->delete();

            if (!empty($data['rates'])) {
                foreach ($data['rates'] as $rateData) {
                    $carrier->rates()->create([
                        'min_weight' => $rateData['min_weight'] ?? null,
                        'max_weight' => $rateData['max_weight'] ?? null,
                        'min_price' => $rateData['min_price'] ?? null,
                        'max_price' => $rateData['max_price'] ?? null,
                        'min_volume' => $rateData['min_volume'] ?? null,
                        'max_volume' => $rateData['max_volume'] ?? null,
                        'rate_price' => $rateData['rate_price'],
                        'delivery_time' => $rateData['delivery_time'] ?? null,
                        'zone_id' => $rateData['zone_id'] ?? null,
                    ]);
                }
            }

            DB::commit();

            return to_route('admin.carriers.index');
        } catch (\Exception $e) {
            DB::rollBack();

            return back()->withInput()->with('error', $e->getMessage());
        }
    }

    public function destroy(Request $request)
    {
        try {
            $ids = $request->input('ids', []);

            if (!empty($ids) && is_array($ids)) {
                Carrier::whereIn('id', $ids)->each(function ($carrier) {
                    $carrier->rates()->delete();
                    $carrier->delete();
                });
            }

            return redirect()->back()->with('success', 'Transporteur(s) supprimé(s) avec succès.');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Erreur : ' . $e->getMessage());
        }
    }
}
