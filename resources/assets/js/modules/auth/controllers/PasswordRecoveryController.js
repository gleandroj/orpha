
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
                self.toast.showError(response.message);
                self.loading = false;
            })
    }
}