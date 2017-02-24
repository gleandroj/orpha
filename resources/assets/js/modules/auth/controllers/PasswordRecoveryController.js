
export default class PasswordRecoveryController {

    constructor(AuthService, ToastService, $state) {

        this.route = $state;
        this.auth = AuthService;
        this.toast = ToastService;
        this.loading = false;
        this.email = '';
    }

    submit() {
        let self = this;
        this.loading = true;
        this.auth.sendResetLinkEmail(this.email)
            .success((response) => {
                self.toast.showSuccess(response.status);
                self.loading = false;
                self.route.go('auth.login');
            })
            .error((response) => {
                let msg = response.error == 'validation' ? response.errors[response.errors.keys()[0]] : response.message;
                self.toast.showError(msg);
                self.loading = false;
            })
    }
}

PasswordRecoveryController.$inject = ['AuthService', 'ToastService', '$state'];