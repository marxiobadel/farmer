<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\UserRequest;
use App\Http\Resources\CountryResource;
use App\Http\Resources\UserResource;
use App\Models\Country;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;

class UserController extends Controller
{
    public function index(Request $request)
    {
        $request->validate([
            'page' => ['integer', 'min:1'],
            'per_page' => ['integer', 'min:1', 'max:100'],
            'search' => ['nullable', 'string'],
            'sort' => ['nullable', 'string'],
        ]);

        $query = User::query();

        if ($request->filled('search')) {
            $searchColumns = ['firstname', 'lastname', 'email'];
            $query->whereAny($searchColumns, 'like', '%'.$request->string('search').'%');
        }

        $allowed = ['firstname', 'lastname', 'email', 'status', 'created_at', 'updated_at'];
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
        $users = $query->paginate($perPage)->withQueryString();

        return Inertia::render('admin/users/index', [
            'users' => UserResource::collection($users)->response()->getData(true),
            'filters' => $request->only(['search', 'status', 'sort', 'per_page']),
        ]);
    }

    public function create()
    {
        $countries = Cache::rememberForever('countries', function () {
            return Country::orderBy('name')->get(['id', 'iso', 'nicename', 'name', 'phonecode']);
        });

        return Inertia::render('admin/users/create', [
            'countries' => CountryResource::collection($countries),
        ]);
    }

    public function edit(User $user)
    {
        $countries = Cache::rememberForever('countries', function () {
            return Country::orderBy('name')->get(['id', 'iso', 'nicename', 'name', 'phonecode']);
        });

        return Inertia::render('admin/users/edit', [
            'user' => new UserResource($user->load('addresses')),
            'countries' => CountryResource::collection($countries),
        ]);
    }

    public function store(UserRequest $request)
    {
        DB::beginTransaction();

        try {
            $user = User::create(
                $request->safe()->only([
                    'firstname',
                    'lastname',
                    'email',
                    'phone',
                    'address',
                    'is_active',
                    'password',
                ])
            );

            $user->syncRoles($request->safe()->only(['role_name']));

            $addresses = $request->safe()->input('addresses', []);

            if (! empty($addresses)) {
                foreach ($addresses as $addr) {
                    $user->addresses()->create([
                        'alias' => $addr['alias'] ?? null,
                        'firstname' => $addr['firstname'] ?? null,
                        'lastname' => $addr['lastname'] ?? null,
                        'phone' => $addr['phone'] ?? null,
                        'city' => $addr['city'] ?? null,
                        'state' => $addr['state'] ?? null,
                        'postal_code' => $addr['postal_code'] ?? null,
                        'country_id' => $addr['country_id'] ?? null,
                        'address' => $addr['address'] ?? null,
                        'is_default' => $addr['is_default'] ?? false,
                    ]);
                }

                // Ensure only ONE default address
                $defaultAddress = $user->addresses()->where('is_default', '=', true)->first();

                if (! $defaultAddress && $user->addresses()->count() > 0) {
                    // If none marked default on creation → set the first one
                    $user->addresses()->first()->update(['is_default' => true]);
                } else {
                    // More than one default ⇒ keep first and reset others
                    $user->addresses()
                        ->where('id', '!=', $defaultAddress->id)
                        ->update(['is_default' => false]);
                }
            }

            DB::commit();

            return redirect()->route('admin.users.index');
        } catch (\Exception $e) {
            DB::rollBack();
            report($e);

            return back()->with('error', $e->getMessage());
        }
    }

    public function update(UserRequest $request, User $user)
    {
        DB::beginTransaction();

        try {
            $user->update(
                $request->safe()->only([
                    'firstname',
                    'lastname',
                    'email',
                    'phone',
                    'address',
                    'is_active',
                    'password',
                ])
            );

            $user->syncRoles($request->safe()->only(['role_name']));

            $user->addresses()->delete();

            $addresses = $request->safe()->input('addresses', []);

            if (! empty($addresses)) {
                foreach ($addresses as $addr) {
                    $user->addresses()->create([
                        'alias' => $addr['alias'] ?? null,
                        'firstname' => $addr['firstname'] ?? null,
                        'lastname' => $addr['lastname'] ?? null,
                        'phone' => $addr['phone'] ?? null,
                        'city' => $addr['city'] ?? null,
                        'state' => $addr['state'] ?? null,
                        'postal_code' => $addr['postal_code'] ?? null,
                        'country_id' => $addr['country_id'] ?? null,
                        'address' => $addr['address'] ?? null,
                        'is_default' => $addr['is_default'] ?? false,
                    ]);
                }

                // Ensure only ONE default address
                $defaultAddress = $user->addresses()->where('is_default', '=', true)->first();

                if (! $defaultAddress && $user->addresses()->count() > 0) {
                    // If none marked default on creation → set the first one
                    $user->addresses()->first()->update(['is_default' => true]);
                } else {
                    // More than one default ⇒ keep first and reset others
                    $user->addresses()
                        ->where('id', '!=', $defaultAddress->id)
                        ->update(['is_default' => false]);
                }
            }

            DB::commit();

            return redirect()->route('admin.users.index');
        } catch (\Throwable $e) {
            DB::rollBack();
            report($e);

            return back()
                ->withInput()
                ->with('error', "Une erreur est survenue lors de la mise à jour de l'utilisateur.");
        }
    }

    public function destroy(Request $request)
    {
        DB::beginTransaction();

        try {
            $validated = $request->validate([
                'ids' => 'required|array|min:1',
                'ids.*' => 'integer|exists:users,id',
            ], [
                'ids.required' => 'Aucune sélection trouvée.',
                'ids.array' => 'Les identifiants doivent être dans un tableau.',
                'ids.*.exists' => "Un ou plusieurs utilisateurs n'existent pas.",
            ]);

            $ids = $validated['ids'];

            $authId = auth()->id();
            $ids = array_diff($ids, [$authId]);

            if (empty($ids)) {
                return redirect()->back()->with('warning', 'Aucun utilisateur valide à supprimer.');
            }

            // Delete users
            $deletedCount = User::whereIn('id', $ids)->delete();

            if ($deletedCount > 0) {
                DB::commit();
                Log::info("Suppression de {$deletedCount} utilisateur(s) par l'utilisateur #{$authId}.", [
                    'deleted_ids' => $ids,
                    'by_user' => $authId,
                ]);

                return redirect()->back()->with('success', "{$deletedCount} utilisateur(s) supprimé(s) avec succès.");
            }

            DB::rollBack();

            return redirect()->back()->with('warning', "Aucun utilisateur n'a été supprimé.");
        } catch (ValidationException $e) {
            DB::rollBack();

            return redirect()->back()->withErrors($e->errors())->withInput();
        } catch (\Throwable $e) {
            DB::rollBack();
            Log::error('Erreur lors de la suppression des utilisateurs : '.$e->getMessage(), [
                'stack' => $e->getTraceAsString(),
            ]);

            return redirect()->back()->with('error', 'Une erreur est survenue : '.$e->getMessage());
        }
    }
}
