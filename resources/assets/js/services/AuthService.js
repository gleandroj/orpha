export const AuthEvents = {
    accessDenied: "auth:access-denied",
    accessAccepted: "auth:access-accepted",

    loginSuccess: "auth:login-success",
    loginError: "auth:login-error",
    logoutSuccess: "auth:logout-success",

    currentUserUpdated: "auth:current-user-updated"
};

const AuthKeys = {
    currentUser: 'auth-current-user',
    token: 'auth-token'
};

export function AuthServiceProvider() {
    let _oauth = null;

    let _sessionTime = 1000 * 60 * 10;

    this.setSessionTTL = function (sessionTime) {
        _sessionTime = sessionTime;
    };

    this.setOAuthConfig = function (OAuth) {
        _oauth = OAuth;
    };

    this.$get = ($http, OrphaUtilService, SessionService, StorageService, LogService, $state) => {
        'ngInject';
        SessionService.setSessionTTL(_sessionTime);
        return new AuthService($http, OrphaUtilService, SessionService, StorageService, LogService, $state, _oauth);
    };
}

class AuthUser{
    hasPermission(permissions) {
        if (this.permissions != null && this.permissions.length > 0) {
            permissions = permissions == null ? [] : permissions;

            var roles = this.permissions;

            if (typeof permissions === "string") {
                permissions = [permissions];
            }

            if (typeof roles === "string") {
                roles = [roles];
            }

            var isAllowed = true;

            if (permissions[0]) {
                isAllowed = false;
                for (var i = 0; i < roles.length; i++) {
                    if (permissions.indexOf(roles[i].slug) !== -1) {
                        isAllowed = true;
                        break;
                    }
                }
            }

            return isAllowed;
        }
        return false;
    }
}

class AuthService {

    constructor($http, OrphaUtilService, SessionService, StorageService, LogService, $state, OAuthConfig) {
        this.http = $http;
        this.util = OrphaUtilService;
        this.session = SessionService;
        this.storage = StorageService;
        this.log = LogService;
        this.route = $state;
        this.OAuth = OAuthConfig || {
            "api_oauth_url": "",
            "api_user_url": "",
            "api_permissions_url": "",

            "client_id": "",
            "client_secret": "",
            "grant_type": "password",

            "redirect_route": "",
            "login_route": ""
        };
        this.util.on('$stateChangeStart', (event, next) => this.onRouteChange(event, next));
        this.initialize();
    }

    initialize() {
        if (this.isAuthenticated() && this.session.exists() && this.session.isExpired()) {
            this.session.checkSessionFn();
        }
        else if (this.isAuthenticated()) {
            this.loadCurrentUser()
                .success(() => {
                    this.loadPermissions();
                    if (this.session.exists()) this.session.stop();
                    this.session.start();
                    this.util.broadcast(AuthEvents.loginSuccess);
                })
                .error((data) => {
                    if (this.session.exists()) this.session.stop();
                    this.util.broadcast(AuthEvents.loginError, data);
                });
        }
    }

    /*Private*/
    getClientConfig() {
        return {
            "client_id": this.OAuth.client_id,
            "client_secret": this.OAuth.client_secret,
            "grant_type": this.OAuth.grant_type
        };
    }

    /*Public*/
    setOAuthConfig(OAuth) {
        this.OAuth = OAuth;
    }

    /*Private*/
    loadCurrentUser() {
        let defer = this.util.defer();
        this.http.get(this.OAuth.api_user_url)
            .then((response) => {
                    this.setCurrentUser(response.data);
                    defer.resolve(response.data);
                }
                , (response) => {
                    this.setCurrentUser(null);
                    defer.reject(response.data);
                });
        return defer.promise;
    }

    /*Private*/
    loadPermissions() {
        let defer = this.util.defer();
        this.http.get(this.OAuth.api_permissions_url)
            .then((response) => {
                    this.setPermissions(response.data);
                    defer.resolve(response.data);
                }
                , (response) => {
                    this.setPermissions(null);
                    defer.reject(response.data);
                });

        return defer.promise;
    }

    /*Private*/
    setPermissions(permissions) {
        this.permissions = permissions;
    }

    /*Public*/
    getPermissions() {
        let defer = this.util.defer();
        let self = this;
        if(this.permissions == null || this.permissions.length == 0){
            this.loadPermissions().success((p) => {
                self.permissions = p;
                defer.resolve(p);
            }).error((err) => {
                defer.reject(err);
            });
        }else{
            this.util.timeout(()=> defer.resolve(this.permissions), 2);
        }

        return defer.promise;
    }

    /*Private*/
    setCurrentUser(user) {
        this.storage.set(AuthKeys.currentUser, user);
        this.util.broadcast(AuthEvents.currentUserUpdated, { user: this.getCurrentUser() });
    }

    /*Public*/
    getCurrentUser() {
        let user = this.storage.hasKey(AuthKeys.currentUser) ?
            this.storage.get(AuthKeys.currentUser) : null;
        return this.util.extend(new AuthUser(), user);
    }

    /*Private*/
    setToken(token) {
        this.storage.set(AuthKeys.token, token);
    }

    /*Public*/
    getToken() {
        return this.storage.hasKey(AuthKeys.token) ? this.storage.get(AuthKeys.token) : null;
    }

    /*Public*/
    login(username, password) {
        var deferred = this.util.defer();
        this.http.post(this.OAuth.api_oauth_url, angular.extend({ username: username, password: password }, this.getClientConfig()))
            .then(
            (response) => {
                this.setToken(response.data);
                this.loadCurrentUser()
                    .success((user) => {
                        if (this.session.exists()) this.session.stop();
                        this.session.start();
                        this.util.broadcast(AuthEvents.loginSuccess, { user: user });
                        deferred.resolve(user);
                    })
                    .error((error) => {
                        if (this.session.exists()) this.session.stop();
                        this.util.broadcast(AuthEvents.loginError, error);
                        deferred.reject(error);
                    });
            },
            (response) => {
                this.util.broadcast(AuthEvents.loginError, response.data);
                deferred.reject(response.data);
            });
        return deferred.promise;
    }

    /*Public*/
    logout() {
        if (this.session.exists()) this.session.stop();
        this.storage.clear();
        this.util.broadcast(AuthEvents.logoutSuccess);
    }

    /*Public*/
    reconnect() {
        /*var deferred = this.util.defer();
        var config = this.util.extend({ refresh_token: this.getToken().refresh_token }, this.getClientConfig());
        config.grant_type = "refresh_token";
        this.http.post(this.OAuth.oauth_url, config)
            .then(
            (response) => {
                this.setToken(response.data);
                this.loadCurrentUser()
                    .success((user) => {
                        if (this.session.exists()) this.session.stop();
                        this.session.start();
                        this.util.broadcast(AuthEvents.loginSuccess, { user: user });
                        deferred.resolve(user);
                    })
                    .error((error) => {
                        if (this.session.exists()) this.session.stop();
                        this.util.broadcast(AuthEvents.loginError, error);
                        deferred.reject(error);
                    });
            },
            (response) => {
                this.util.broadcast(AuthEvents.loginError, response.data);
                deferred.reject(response.data);
            });
        return deferred.promise;*/
    }

    /*Public*/
    sendResetLinkEmail(email) {
        var deferred = this.util.defer();
        this.http.post('api/auth/password/email', { email: email })
            .then((response) => {
                deferred.resolve(response.data);
            },
            (response) => {
                deferred.reject(response.data);
            });
        return deferred.promise;
    }

    /*Public*/
    checkResetPasswordToken(token) {
        var deferred = this.util.defer();
        this.http.post('api/auth/password/token', { token: token })
            .then((response) => {
                deferred.resolve(response.data);
            },
            (response) => {
                deferred.reject(response.data);
            });
        return deferred.promise;
    }

    /*Public*/
    resetPassword(credentials) {
        var deferred = this.util.defer();
        this.http.post('api/auth/password/reset', credentials)
            .then((response) => {
                deferred.resolve(response.data);
            },
            (response) => {
                deferred.reject(response.data);
            });
        return deferred.promise;
    }

    /*Public*/
    isAuthenticated() {
        try {
            return this.getToken() && this.getToken().access_token != "" && this.getCurrentUser() != null;
        } catch (err) {
            return false;
        }
    }

    /*Private*/
    onRouteChange(event, next, prev) {

        if (this.isAuthenticated() && next.name.indexOf('auth') > -1) {
            event.preventDefault();
            this.log.info('Authenticated user, redirecting to: ' + this.OAuth['redirect_route']);
            this.route.go(this.OAuth['redirect_route']);
        }

        let auth = next['authorized'] ? next['authorized'] : [];
        let allowAnonymous = next['allowAnonymous'] ? next['allowAnonymous'] : false;
        if (!allowAnonymous) {
            if (!this.isAuthenticated()) this.danyRouteAcess(event, next, true);
            else if (this.isAuthenticated() && !this.getCurrentUser().hasPermission(auth)) this.danyRouteAcess(event, next, false);
            else if (this.isAuthenticated()) this.session.touch();
        }
    }

    /*Private*/
    danyRouteAcess(event, next, redirect) {
        event.preventDefault();
        this.util.broadcast(AuthEvents.accessDenied, next);

        if (next.name != "") this.log.error("Access denied on unauthorized root:" + next.name);
        else this.log.error("Access denied");

        let isAuthenticated = this.isAuthenticated();

        if (redirect) {
            this.route.go(this.OAuth['login_route']);
            this.log.info((isAuthenticated ? 'Unauthorized' : 'Unauthenticated') +
                ' user, redirecting to: ' +
                (isAuthenticated ? this.OAuth.redirect_route : this.OAuth.login_route));
        }
    }
}

export function OAuthInterceptor($injector, LogService, OrphaUtilService) {
    'ngInject';

    const Request = (config) => {
        const Auth = $injector.get('AuthService');
        const Session = $injector.get('SessionService');

        var token = Auth.getToken();
        if (token && token.access_token != "") {
            Session.touch();
            config.headers.Authorization = token.token_type + " " + token.access_token;
        }
        return config;
    };

    const ResponseError = (response) => {
        const Auth = $injector.get('AuthService');
        var deferred = OrphaUtilService.defer();

        if ((response.config.url.indexOf('oauth/token') === -1) && response.status == 401) {
            //Try recovery request?
            deferred.reject(response);
        } else {
            deferred.reject(response);
        }
        return deferred.promise;
    };

    return {
        request: Request,
        responseError: ResponseError
    }
}