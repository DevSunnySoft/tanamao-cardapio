import { NgModule } from '@angular/core';
import { CommonModule, TitleCasePipe } from '@angular/common';

import { TrendsRoutingModule } from './trends-routing.module';
import { TrendsComponent } from './trends.component';

@NgModule({
  declarations: [
    TrendsComponent
  ],
  providers: [
    TitleCasePipe
  ],
  imports: [
    CommonModule,
    TrendsRoutingModule
  ]
})
export class TrendsModule { }
