<?php

namespace App\Policies;

use App\User;
use Illuminate\Auth\Access\HandlesAuthorization;

class UserPolicy
{
    use HandlesAuthorization;

    /**
     *
     * @param  \App\User  $user
     * @return bool
     */
    public function show(User $user)
    {
        return $user->permissions()->where('slug', 'show-user')->count() > 0;
    }

    /**
     *
     * @param  \App\User  $user
     * @return bool
     */
    public function index(User $user)
    {
        return $user->permissions()->where('slug', 'list-user')->count() > 0;
    }

    /**
     *
     * @param  \App\User  $user
     * @return bool
     */
    public function create(User $user)
    {
        return $user->permissions()->where('slug', 'create-user')->count() > 0;
    }

    /**
     *
     * @param  \App\User  $user
     * @return bool
     */
    public function update(User $user)
    {
        return $user->permissions()->where('slug', 'edit-user')->count() > 0;
    }

    /**
     *
     * @param  \App\User  $user
     * @return bool
     */
    public function active(User $user)
    {
        return $user->permissions()->where('slug', 'active-user')->count() > 0;
    }

    /**
     *
     * @param  \App\User  $user
     * @return bool
     */
    public function delete(User $user)
    {
        return $user->permissions()->where('slug', 'delete-user')->count() > 0;
    }
}
