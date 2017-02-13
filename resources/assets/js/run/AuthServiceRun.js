import { AuthEvents } from './../services/AuthService';
import { SessionEvents } from './../services/SessionService';

export default function AuthServiceRun(AuthService, DialogService, ToastService, MessageService, OrphaUtilService, LogService, $state) {

    OrphaUtilService.on(AuthEvents.logoutSuccess, (event, args) => {
        DialogService.clearDialogs();
        if ($state.current.name != AuthService.OAuth['login_route']) {
            $state.go(AuthService.OAuth['login_route']);
        }
    });

    OrphaUtilService.on(AuthEvents.loginError, (event, args) => {
        if (AuthService.isAuthenticated()) {
            AuthService.logout();
        }
        if (args.error && args.message)
            LogService.error("Login error: " + args.message);
    });

    OrphaUtilService.on(SessionEvents.sessionExpired, (event, args) => {
        if (AuthService.isAuthenticated()) {
            AuthService.logout();
        }
        if ($state.current.name === "") {
            $state.go(AuthService.OAuth['login_route']);
        }
        ToastService.showError(MessageService.getMessage("MSG15"));
    });

}