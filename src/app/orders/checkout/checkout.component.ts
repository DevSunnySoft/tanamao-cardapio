import { AfterViewInit, ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { distinctUntilChanged, firstValueFrom } from 'rxjs';
import { AppService } from 'src/app/app.service';
import { MatDialogDirective } from 'src/app/material/mat-dialog/mat-dialog.directive';
import IUser from 'src/app/users/user';
import { UsersService } from 'src/app/users/users.service';
import { StyleService } from 'src/app/utils/styles/styles.service';
import { OrderOdsService } from '../order.ods.service';
import { SummaryOrderPocTypes } from '../summary-order';
import { LocationComponent } from './location/location.component';

@Component({
  templateUrl: 'checkout.component.html'
})
export class CheckoutComponent implements OnInit, AfterViewInit {
  @ViewChild('locationDialog') locationDialog!: MatDialogDirective
  public locationDialogConfig = { component: LocationComponent }

  constructor(
    private _orderOdsService: OrderOdsService,
    private _appService: AppService,
    private _cdr: ChangeDetectorRef,
    private _userService: UsersService,
    private _router: Router,
    private _route: ActivatedRoute,
    styleService: StyleService
  ) {
    this._cdr.detach()
    styleService.loadStyle('mat-dialog')
    styleService.loadStyle('mat-form-field')
  }

  private afterSave(): void {
    firstValueFrom(this._userService.getLogged()).then(() => this._router.navigate(['order']))
  }

  private sendOrder(user: IUser, location?: number): void {
    if (this._route.snapshot.queryParamMap.get('recover')) {

      if (this._orderOdsService.recoveOrder)
        firstValueFrom(this._orderOdsService.recover(location)).then(() => this.afterSave())

    } else
      firstValueFrom(this._orderOdsService.items$).then(items => {
        if (items.length > 0)
          firstValueFrom(this._orderOdsService.save(user._id, location)).then(success => {
            if (success)
              this.afterSave()
          })
      })
  }

  private watchFirstUser() {
    firstValueFrom(this._appService.user$.pipe(distinctUntilChanged())).then(user => {
      if (user) {
        if (this._appService.company?.poctype === SummaryOrderPocTypes.command) {

          if (!user.localorder || (user.localorder && !user.localorder.location))
            this.locationDialog.show({
              sendOrder: (location: number) => this.sendOrder(user, location)
            })
          else
            this.sendOrder(user)

        } else
          this.sendOrder(user)

      } else
        this.watchFirstUser()
    })
  }

  public onCloseLocation(ev: number | undefined) { }

  ngAfterViewInit(): void {
    this.watchFirstUser()
  }

  ngOnInit(): void {
    this._cdr.detectChanges()
  }

}