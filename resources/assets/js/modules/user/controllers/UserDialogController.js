/**
 * Created by FG0003 on 13/02/2017.
 */

export default class UserDialogController {

    constructor(DialogService, UserService, ToastService, MessageService, OrphaUtilService) {
        this.dialogService = DialogService;
        this.userService = UserService;
        this.toastService = ToastService;
        this.messageService = MessageService;
        this.utilService = OrphaUtilService;
        this.loading = false;
        this.originalUser = this.utilService.copy(this.user);
    }

    setForm(scope){
        this.utilService.timeout(() => this.form = scope.userForm, 10);
    }

    getForm(){
        return this.form;
    }

    close() {
        this.dialogService.cancelDialog({});
    }

    cancel() {
        if (this.user.id == '' || this.user.id == null) {
            this.close();
        } else {
            this.readOnly = true;
            if(!this.getForm().$submitted || !this.getForm().$valid){
                this.user = this.utilService.copy(this.originalUser);
            }
        }
    }

    changeToEditMode() {
        this.readOnly = false;
    }

    submitUser() {
        this.loading = true;
        this.userService.save(this.user)
            .success((newUser) => {
                this.loading = false;
                this.dialogService.hideDialog(newUser);
            }).error((err)=> {
                this.loading = false;
                if(err.error === 'validation')
                    this.showValidationErrors(err.errors);
                else
                    this.toastService.showError(err ? err['message'] : this.messageService.get('MSG4'));
            });
    }

    showValidationErrors(errors){
        this.toastService.showError(Object.keys(errors).map((key) => errors[key]).join(", "));
    }

    showConfirmation(okCallback, cancelCallback){
        this.dialogService
            .showConfirmDialog({
                title: 'Confirmação',
                okBtn: 'Sim',
                cancelBtn: 'Não',
                message: this.messageService.get('MSG6')
            }).then(okCallback, cancelCallback);
    }

    submit() {
        if (this.user.id == '' || this.user.id == null) {
            this.submitUser();
        } else {
            this.showConfirmation(()=>{
                this.submitUser();
            }, ()=>{});
        }
    }

    enableUser() {
        this.loading = true;
        this.userService.enable(this.user)
            .then((newUser)=> {
                this.loading = false;
                this.dialogService.hideDialog(newUser);
            }, (err)=> {
                this.loading = false;
                console.log(err);
                this.toastService.showError(err ? err['message'] : this.messageService.get('MSG4'));
            });
    }
}

UserDialogController.$inject = ['DialogService', 'UserService', 'ToastService', 'MessageService', 'OrphaUtilService'];