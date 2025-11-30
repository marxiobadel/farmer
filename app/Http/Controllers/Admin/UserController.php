<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\UserRequest;
use App\Http\Resources\UserResource;
use App\Models\User;
use Illuminate\Http\Request;
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
        return Inertia::render('admin/users/create');
    }

    public function edit(User $user)
    {
        return Inertia::render('admin/users/edit', [
            'user' => new UserResource($user),
        ]);
    }

    public function store(UserRequest $request)
    {
        DB::beginTransaction();

        try {
            $user = User::create($request->safe()->all());

            $user->syncRoles($request->safe()->only(['role_name']));

            DB::commit();

            return redirect()->route('admin.users.index');
        } catch (\Exception $e) {
            DB::rollBack();
            report($e);

            return back()->with('error', "Une erreur est survenue lors de l'enregistrement.");
        }
    }

    public function update(UserRequest $request, User $user)
    {
        DB::beginTransaction();

        try {
            $user->update($request->safe()->except(['password']));

            $user->syncRoles($request->safe()->only(['role_name']));

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
