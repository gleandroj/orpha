import AuthController from './../controllers/AuthController';
import AuthTemplate from './../pages/auth-layout.tpl.html';

import LoginController from './../controllers/LoginController';
import LoginTemplate from './../pages/login-page.tpl.html';

import PasswordRecoveryController from './../controllers/PasswordRecoveryController';
import PasswordRecoveryTemplate from './../pages/password-recovery.tpl.html';

import PasswordResetController from './../controllers/PasswordResetController';
import PasswordResetTemplate from './../pages/password-reset.tpl.html';

export default function RouteConfig($stateProvider) {

    $stateProvider
        .state('auth', {
            url: '/auth',
            abstract: true,
            template: AuthTemplate,
            controller: AuthController,
            allowAnonymous:true
        })
        .state('auth.login', {
            url: '/login',
            controller: LoginController,
            controllerAs: '$ctrl',
            template: LoginTemplate,
            allowAnonymous:true
        })
        .state('auth.password', {
            url: '/password',
            controller: PasswordRecoveryController,
            controllerAs: '$ctrl',
            template: PasswordRecoveryTemplate,
            allowAnonymous:true
        })
        .state('auth.password_reset', {
            url: '/password/reset?email&token',
            resolve: {
                token: (AuthService, OrphaUtilService, LogService, $stateParams, $state) => {

                    let deferred = OrphaUtilService.defer();
                    AuthService.checkResetPasswordToken({email:$stateParams.email, token:$stateParams.token})
                        .success((token) => { deferred.resolve(token) })
                        .error((error) => {
                            $state.go('auth.login');
                            LogService.error(error['message']);
                        });

                    return deferred.promise;
                }
            },
            controller: PasswordResetController,
            controllerAs: '$ctrl',
            template: PasswordResetTemplate,
            allowAnonymous:true
        });
}

RouteConfig.$inject = ['$stateProvider'];