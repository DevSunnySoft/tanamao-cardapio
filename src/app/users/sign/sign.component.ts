import { ChangeDetectorRef, Component, ElementRef, OnInit, ViewChild } from "@angular/core";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { UsersService } from "../users.service";
import { ActivatedRoute, Router } from "@angular/router";
import { StyleService } from "src/app/utils/browser/style.service";
import { forbidenTextValidator } from "src/app/utils/validators/formValidator";
import { AppService } from "src/app/app.service";

@Component({
  templateUrl: './sign.component.html',
  styleUrls: ['./sign.component.sass']
})
export class SignComponent implements OnInit {
  @ViewChild('codeInput') private codeInput?: ElementRef<HTMLInputElement>;
  @ViewChild('siginPasswordInput') private siginPasswordInput?: ElementRef<HTMLInputElement>;
  public action: 'getPhone' | 'checkCode' | 'awaiting' | 'signup' | 'signin' = 'awaiting';
  public hide = true;
  public submited = false;
  public confirmationId: null | string = null;
  public confirmation: any = null;
  public signName?: string;
  public formErrorMessage: string = '';
  public recovery: boolean = false;
  public userToConfirm?: string
  public isLoading = true
  
  phoneForm: FormGroup = new FormGroup({
    phone: new FormControl('', forbidenTextValidator("invalidPhone", /^\(\d\d\)\s?\d{4,5}\-\d{4}$/))
  })

  codeForm: FormGroup = new FormGroup({
    code: new FormControl('', forbidenTextValidator("invalidCode", /^\d{4}$/))
  })

  signupForm = new FormGroup({
    name: new FormControl('', [Validators.required, Validators.minLength(3), forbidenTextValidator('invalid_format', /[a-z]+/i)]),
    password: new FormControl('', [Validators.required, Validators.minLength(4)])
  })

  signinForm = new FormGroup({
    username: new FormControl('', [Validators.required]),
    password: new FormControl('', [Validators.required, Validators.minLength(4)])
  })

  get phone(): FormControl {
    return this.phoneForm.get('phone') as FormControl
  }

  get code(): FormControl {
    return this.codeForm.get('code') as FormControl
  }

  get name(): FormControl {
    return this.signupForm.get('name') as FormControl
  }

  get password(): FormControl {
    return this.signupForm.get('password') as FormControl
  }

  get signinUsername(): FormControl {
    return this.signinForm.get('username') as FormControl
  }

  get signinPassword(): FormControl {
    return this.signinForm.get('password') as FormControl
  }

  constructor(
    private _router: Router,
    private _route: ActivatedRoute,
    private _usersService: UsersService,
    private _appService: AppService,
    private _cdr: ChangeDetectorRef,
    styleService: StyleService
  ) {
    styleService.loadStyle('mat-form-field');
  }

  private createUserConfirmation() {
    if (this.userToConfirm)
      this._usersService.createUserConfirmation(this.phone.value, this.userToConfirm).subscribe(response => {
        if (response)
          this._router.navigate(['sign'], {
            queryParams:{ confirmation: response.confirmationId, checkout: new Date().getTime() }
          })
      })
  }

  private validatePhone() {
    const phone = this.phoneForm.value.phone;
    this._usersService.validatePhone(phone).subscribe(response => {
      if (response) {        
        if (response.hasFound === true) {

          if (response.isConfirmed === false) {
            this.userToConfirm = response.userId;
            this.userToConfirm = "new";
          } else {
            this.signName = response.name;
            this.signinUsername.setValue(phone);
            this.action = 'signin';

            this._cdr.detectChanges();
            setTimeout(() => this.siginPasswordInput?.nativeElement.focus(), 100);
          }            
        } else {
          this.userToConfirm = "new"
          this._cdr.detectChanges();
        }

        this.submited = false
      }
    })
  }
  
  private validateCode() {
    if (this.confirmationId)
      this._usersService.validatePhoneCode(this.confirmationId, this.codeForm.value.code).subscribe(success => {
        if (success) {
          this._router.navigate(['sign'], {
            queryParams:{ confirmation: this.confirmationId, checkout: new Date().getTime() }
          })
        } else
          this.code.setErrors({ validationError: true });

        this.submited = false;
      })
    else
      this.onClickRefresh()
  }

  private accountRecovery() {
    const username = this.signinUsername.value;
    if (username)
      this._usersService.recovery(username).subscribe((response: any) => {
        if (response.success === true) {
          const date = new Date()
          this._router.navigate(['sign'], {
            queryParams:{
              confirmation: response.data.confirmationId,
              checkout: date.getTime()
            }
          })
        }
      });
  }

  private getConfirmation(): void {
    if (!this.confirmationId)
      return 

    this._usersService.getConfirmation(this.confirmationId).subscribe(response => {
      if (response) {
        this.confirmation = response

        if (response.isConfirmed) {
          this.action = 'signup';

          if (response.userName)
            this.name.setValue(response.userName)

          if (response.isRecovery)
            this.recovery = true

          this._cdr.detectChanges();
        } else {
          this.action = 'checkCode';
          this._cdr.detectChanges();
          setTimeout(() =>
            this.codeInput?.nativeElement.focus(), 200
          );
        }

        this.isLoading = false;
      } else
        this.onClickRefresh()
    })
  }

  private reditect() {
    const redirectto = this._route.snapshot.queryParamMap.get('redirectto') || 'me'

    this._usersService.getLogged().subscribe((response: any) => {
      if (this._appService.isbrowser && response)
        window.location.href = `./${redirectto}`
    })
  }

  private cadastre() {
    //this._subscriptions.push(
    const formValue = this.signupForm.value;
    this._usersService.cadastre(formValue.name, formValue.password, this.confirmationId!).subscribe(response => {
      if (response.success === true) {
        const subscription = this._usersService.login(this.confirmation.phone, formValue.password).subscribe(response => {
          if (response.success === true)
            this.reditect();

          this.submited = false;
          subscription.unsubscribe();
        })
      }
      else if (response.error && response.error.status === 409)
        this.submited = false;
      else
        this.submited = false;
    })
    //)
  }

  private login() {
    const formValue = this.signinForm.value

    this.formErrorMessage = ''
    //this._subscriptions.push(
    this._usersService.login(formValue.username, formValue.password).subscribe(response => {
      if (response.success === true)
        this.reditect()
      else
        this.loginError(response, true)

      this.submited = false;
    })
    //)
  }

  private loginError(response: any, self: boolean) {
    if (response.error.status === 401 || response.error.status === 409) {
      switch (response.error.error.message) {
        case 'invalid_username':
          this.signinUsername.setErrors({ nonexistent: true })
          break
        case 'password_validation_error':
          this.signinPassword.setErrors({ invalid: true })
          break
        case 'username_already_exists':
          this.formErrorMessage = 'Este e-mail foi cadastro pelo método tradicional, utilizado e-mail e senha'
          break
        case 'method_validation_error':
          this.formErrorMessage = self ? 'Este e-mail foi cadastrado utilizando rede social (Facebook ou Google)' : 'Este e-mail foi cadastro pelo método tradicional, utilizado e-mail e senha'
          break
        default:
          this.formErrorMessage = 'Erro na validação dos dados'
      }

      //if (self === false)
      //  this.cdr.detectChanges();
    }
  }

  onSubmitSign(ev: Event) {
    if (this.phoneForm.valid && !this.submited) {
      this.submited = true;
      this.validatePhone();
    }
  }

  onSubmitCodeForm(ev: Event): void {
    if (this.codeForm.valid  && !this.submited) {
      this.submited = true;
      this.validateCode();
    }
  }

  onSubmitSignupForm(e: any) {
    e.preventDefault();

    if (!this.submited && this.signupForm.valid) {
      this.submited = true;
      this.cadastre();
    }
  }

  onSubmitSigninForm(e: any): void {
    e.preventDefault()
    if (!this.submited && this.signinForm.valid === true) {
      this.submited = true;
      this.login();
    }
  }

  onClickRecovery() {
    this.accountRecovery()
  }

  onClickHome(): void {
    this._router.navigate(['./'])
  }

  onClickSendConfirmation() {
    this.createUserConfirmation()
  }

  onClickRefresh() {
    if (this._appService.isbrowser)
      window.location.href = './sign';
  }

  ngOnInit(): void {
    this.recovery = false;
    this.hide = true;
    
    this._route.queryParamMap.subscribe(params => {
      this.confirmationId = params.get('confirmation');

      if (this.confirmationId)
        this.getConfirmation();
      else {
        this.action = 'getPhone';
        this.isLoading = false;
      }

      this._cdr.detectChanges()
    })
  }

}