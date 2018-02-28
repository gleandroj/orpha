<?php

namespace Orpha\Infrastructure\IoC;

use Illuminate\Support\ServiceProvider;
use Illuminate\Container\Container as Application;
use Illuminate\Notifications\Events\NotificationSent;
use Illuminate\Support\Facades\Event;

use Orpha\Infrastructure\Data\Repositories\PasswordRepository;
use Orpha\Domains\Auth\Repositories\PasswordRepository as PasswordRepositoryContract;

use Orpha\Domains\User\Contracts\UserServiceContract;
use Orpha\Domains\User\Services\UserService;

use Orpha\Infrastructure\Data\Repositories\UserRepository;
use Orpha\Domains\User\Repositories\UserRepository as UserRepositoryContract;

use Orpha\Domains\Crianca\Contracts\CriancaServiceContract;
use Orpha\Domains\Crianca\Services\CriancaService;

use Orpha\Infrastructure\Data\Repositories\CriancaRepository;
use Orpha\Domains\Crianca\Repositories\CriancaRepository as CriancaRepositoryContract;

use Orpha\Domains\Pia\Contracts\AtividadesSocioeducativasServiceContract;
use Orpha\Domains\Pia\Services\AtividadesSocioeducativasService;

use Orpha\Domains\Pia\Contracts\DadosNecessidadesServiceContract;
use Orpha\Domains\Pia\Services\DadosNecessidadesService;

use Orpha\Domains\Pia\Contracts\InformacoesFamiliaServiceContract;
use Orpha\Domains\Pia\Services\InformacoesFamiliaService;

use Orpha\Domains\Pia\Contracts\PiaServiceContract;
use Orpha\Domains\Pia\Services\PiaService;

use Orpha\Infrastructure\Data\Repositories\AtividadesSocioeducativasRepository;
use Orpha\Domains\Pia\Repositories\AtividadesSocioeducativasRepository as AtividadesSocioeducativasRepositoryContract;

use Orpha\Infrastructure\Data\Repositories\DadosNecessidadesRepository;
use Orpha\Domains\Pia\Repositories\DadosNecessidadesRepository as DadosNecessidadesRepositoryContract;

use Orpha\Infrastructure\Data\Repositories\InformacoesFamiliaRepository;
use Orpha\Domains\Pia\Repositories\InformacoesFamiliaRepository as InformacoesFamiliaRepositoryContract;

use Orpha\Infrastructure\Data\Repositories\UnitOfWork;
use Orpha\Support\Repositories\UnitOfWorkContract;

use Orpha\Infrastructure\Data\Repositories\Repository;
use Orpha\Support\Repositories\RepositoryContract;

class ContainerServiceProvider extends ServiceProvider
{
    /**
     * Event's Listeners
     * @var array
     */
    protected static $listeners = [
    ];

    /**
     * Register Services
     */
    public function Register()
    {
        self::RegisterServices($this->app, $this);
    }

    /**
     * @param Application $application
     * @param ServiceProvider $provider
     */
    public static function RegisterServices(Application $application, ServiceProvider $provider)
    {
        static::registerSupport($application, $provider);
        static::registerAuthDomain($application, $provider);
        static::registerUserDomain($application, $provider);
        static::registerCriancaDomain($application, $provider);
        static::registerPiaDomain($application, $provider);
        static::registerAgents($application, $provider);
        static::registerHelper($application, $provider);
        static::registerListeners();
    }

    /**
     * @param Application $application
     * @param ServiceProvider $provider
     */
    private static function registerHelper(Application $application, ServiceProvider $provider)
    {
    }


    /**
     * @param Application $application
     * @param ServiceProvider $provider
    */
    private static function registerSupport(Application $application, ServiceProvider $provider)
    {
        $application->bind(UnitOfWorkContract::class, UnitOfWork::class);
        $application->bind(RepositoryContract::class, Repository::class);
    }

    /**
     * @param Application $application
     * @param ServiceProvider $provider
     */
    private static function registerAuthDomain(Application $application, ServiceProvider $provider)
    {
        $application->bind(PasswordRepositoryContract::class, PasswordRepository::class);
    }

    /**
     * @param Application $application
     * @param ServiceProvider $provider
    */
    private static function registerUserDomain(Application $application, ServiceProvider $provider)
    {
        $application->bind(UserServiceContract::class, UserService::class);
        $application->bind(UserRepositoryContract::class, UserRepository::class);
    }

    /**
     * @param Application $application
     * @param ServiceProvider $provider
    */
    private static function registerCriancaDomain(Application $application, ServiceProvider $provider)
    {
        $application->bind(CriancaServiceContract::class, CriancaService::class);
        $application->bind(CriancaRepositoryContract::class, CriancaRepository::class);
    }

    /**
     * @param Application $application
     * @param ServiceProvider $provider
    */
    private static function registerPiaDomain(Application $application, ServiceProvider $provider)
    {
        $application->bind(AtividadesSocioeducativasServiceContract::class, AtividadesSocioeducativasService::class);
        $application->bind(DadosNecessidadesServiceContract::class, DadosNecessidadesService::class);
        $application->bind(InformacoesFamiliaServiceContract::class, InformacoesFamiliaService::class);
        $application->bind(PiaServiceContract::class, PiaService::class);

        $application->bind(AtividadesSocioeducativasRepositoryContract::class, AtividadesSocioeducativasRepository::class);
        $application->bind(DadosNecessidadesRepositoryContract::class, DadosNecessidadesRepository::class);
        $application->bind(InformacoesFamiliaRepositoryContract::class, InformacoesFamiliaRepository::class);
    }

    /**
     * @param Application $application
     * @param ServiceProvider $provider
     */
    private static function registerAgents(Application $application, ServiceProvider $provider)
    {
    }

    /**
     * Register core event's listeners
     */
    private static function registerListeners()
    {
        foreach (self::$listeners as $event => $listeners) {
            foreach ($listeners as $listener) {
                Event::listen($event, $listener);
            }
        }
    }

}