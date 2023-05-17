import { AfterViewInit, ChangeDetectorRef, Component, OnDestroy, OnInit } from "@angular/core";
import { FormControl, FormGroup } from "@angular/forms";
import { Router } from "@angular/router";
import { Subscription } from "rxjs";
import { AppService } from "src/app/app.service";
import { OrderOdsService } from "src/app/orders/order.ods.service";
import { StyleService } from "src/app/utils/styles/styles.service";
import IUser from "../user";
import { UsersService } from "../users.service";

@Component({
  templateUrl: 'profile.component.html'
})
export class ProfileComponent implements AfterViewInit, OnInit, OnDestroy {
  private _subscriptions: Subscription[] = []
  private _saveSubscription?: Subscription

  public canEditName = false

  public readonly items$ = this._orderOdsService.items$

  public userForm: FormGroup = new FormGroup({
    name: new FormControl(''),
    email: new FormControl('')
  })

  get name(): FormControl {
    return this.userForm.get('name') as FormControl
  }

  get email(): FormControl {
    return this.userForm.get('email') as FormControl
  }

  private setFormData(data: IUser) {
    this.userForm.setValue({
      name: data.name,
      email: data.username
    })
  }

  constructor(
    private _cdr: ChangeDetectorRef,
    private _appService: AppService,
    private _orderOdsService: OrderOdsService,
    private _styleService: StyleService,
    private _userService: UsersService,
    private _router: Router
  ) {
    this._styleService.loadStyle('mat-form-field')
    this._cdr.detach()
  }

  private unsubscribeSaveSub() {
    if (this._saveSubscription) {
      this._saveSubscription?.unsubscribe()
      this._saveSubscription = undefined
    }
  }

  private save() {
    if (!this.canEditName) {
      this._appService.log = 'Não é possivel alterar neste momento'
      return
    }

    if (!this._saveSubscription)
      this._saveSubscription = this._userService.update({$set: {name: this.userForm.value.name}}).subscribe(data => {
        if (data)
          this.refresh()

        this.unsubscribeSaveSub()
      })
  }

  private refresh(): void {
    if (window)
      window.location.reload()
  }

  onClickBack() {
    this._router.navigate(['me'])
  }

  onSave(ev: Event): void {
    ev.preventDefault()

    if (this.userForm.valid)
      this.save()
  }
 
  onClickLogout(): void {
    this._router.navigate(['logout'])
  }

  public onClickQrScanner(): void {
    this._router.navigate(['scanner'], {replaceUrl: true})
  }

  public onClickHome(): void {
    this._router.navigate([``])
  }

  public onClickBasket(): void {
    this._router.navigate(['basket'])
  }

  public onClickOrder() {
    this._router.navigate(['order'])
  }

  public onClickUser(): void {
    this._router.navigate(['me'])
  }

  ngAfterViewInit(): void {
    this._subscriptions.push(
      this._appService.user$.subscribe(user => {
        if (user) {
          this.canEditName = user.localorder ? false : true
          this.setFormData(user)
        }
      }),
      this.items$.subscribe(item => this._cdr.detectChanges())
    )
  }

  ngOnInit(): void {
    this._cdr.detectChanges()
  }

  ngOnDestroy(): void {
    this._subscriptions.forEach(item => item.unsubscribe())
    this.unsubscribeSaveSub()
  }

}