import { ChangeDetectorRef, Component, OnInit } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { CompaniesService } from "src/app/companies/companies.service";

@Component({
  template: `
  <div class="app-sheet" *ngIf="conflict" >

    <header class="app-title">
      <button class="bt-icon" (click)="onClickScanner()" ><span class="mat-icon" >qr_code_scanner</span></button>
      <h1>Algo deu errado</h1>
      <button class="bt-icon" (click)="onClickLogout()" ><span class="mat-icon" >logout</span></button>
    </header>

    <div class="divider" ></div>
    <br/>

    <div class="app-section" >
      <ng-template [ngIf]="conflict['company']" >
        <p class="centralized">Temos um grande problema aqui.</p> <br/>
        <p>O seu usuário está vinculado à um pedido aberto em outra empresa.</p> <br/>
        <p>Essa conta precisa ser fechada para que você possa pedir em outro lugar.</p> <br/>
        <p>Solicite a ajuda de um garçom.</p>

      </ng-template>
      <ng-template [ngIf]="conflict['pocid']">
        <p class="centralized" >Você já está pedindo em <strong>{{conflict['pocid']}}.</strong>.</p> <br/>
        <p>Você precisa fechar essa conta primeiro para pedir em outro ponto de consumo.</p> <br/>
        <p><strong>Solicite a ajuda de um garçom.</strong></p> <br/>
      </ng-template>

      <ng-template [ngIf]="conflict['stats']">
        <p class="centralized" ><strong>{{conflict['stats']}}</strong> está em fechamento.</p> <br/>
        <p>Se foi outra pessoa quem fechou a conta, aguarde o pagamento e toque em <strong>re-enviar pedido</strong>, ou utilize outro código QR.</p> <br/>
        <p>Caso necessite,<strong> solicite a ajuda de um garçom.</strong></p> <br/>
      </ng-template>
    </div>

    <div class="app-actions">
      <ng-template [ngIf]="conflict['stats']" [ngIfElse]="otherConflictTemplate" >
        <button class="mat-button mat-stroked-button color-primary" (click)="onClickCheckout()" >
          <span class="mat-icon" >upload</span> &nbsp;
          Re-enviar pedido
        </button>

        <button class="mat-button mat-stroked-button color-primary" (click)="onClickBack()" >
          <span class="mat-icon" >navigate_before</span> &nbsp;
          Voltar ao cardápio
        </button>
      </ng-template>

      <ng-template #otherConflictTemplate >
        <button class="mat-button mat-stroked-button color-primary" (click)="onClickScanner()" >
          <span class="mat-icon" >qr_code_scanner</span> &nbsp;
          Ler outro código QR
        </button>
        <button class="mat-button mat-stroked-button color-primary" (click)="onClickLogout()" >
          <span class="mat-icon" >logout</span>&nbsp;
          Sair
        </button>
      </ng-template>
    </div>
  </div>
  `
})
export class ConflictComponent implements OnInit {
  public readonly conflict? = this._route.snapshot.queryParams

   constructor(
    private _route: ActivatedRoute,
    private _cdr: ChangeDetectorRef,
    private _router: Router,
    private _companiesService: CompaniesService
   ) {
    this._cdr.detach()
   }

   public onClickScanner(): void {
    this._router.navigate(['scanner'])
   }

   public onClickLogout(): void {
    this._router.navigate(['logout'])
   }

   public onClickCheckout(): void {
    this._router.navigate(['checkout'])
   }

   public onClickBack(): void {
    this._router.navigate([''])
   }

   ngOnInit(): void {
     this._cdr.detectChanges()
   }

}