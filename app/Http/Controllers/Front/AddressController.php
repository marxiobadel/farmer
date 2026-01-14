<?php

namespace App\Http\Controllers\Front;

use App\Http\Controllers\Controller;
use App\Http\Requests\AddressRequest;
use App\Models\Address;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class AddressController extends Controller
{
    public function store(AddressRequest $request)
    {
        $validated = $request->validated();

        DB::transaction(function () use ($validated) {
            if (!empty($validated['is_default']) && $validated['is_default'] == true) {
                Address::where('user_id', '=', auth()->id())
                    ->update(['is_default' => false]);
            }

            Address::create(array_merge($validated, [
                'user_id' => auth()->id(),
            ]));
        });

        return back()->with('success', 'Adresse ajoutée avec succès !');
    }

    public function update(AddressRequest $request, Address $address)
    {
        $validated = $request->validated();

        DB::transaction(function () use ($validated, $address) {
            if (!empty($validated['is_default']) && $validated['is_default'] == true) {
                Address::where('user_id', '=', auth()->id())
                    ->where('id', '!=', $address->id)
                    ->update(['is_default' => false]);
            }

            $address->update($validated);
        });

        return redirect()->back()->with('success', 'Adresse mise à jour avec succès.');
    }

    public function destroy(Address $address)
    {
        try {
            $address->delete();

            return back()->with('success', 'Adresse supprimée avec succès.');
        } catch (\Throwable $e) {
            Log::error('Address deletion failed', [
                'address_id' => $address->id,
                'error' => $e->getMessage(),
            ]);

            return back()->with('error', 'Une erreur est survenue lors de la suppression.');
        }
    }
}
