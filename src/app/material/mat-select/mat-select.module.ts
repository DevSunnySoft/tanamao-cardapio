import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { ReactiveFormsModule } from '@angular/forms'
import { MatMenuModule } from '../mat-menu/mat-menu.module'
import { MatSelectComponent } from './mat-select.component'

@NgModule({
  declarations: [MatSelectComponent],
  exports: [MatSelectComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatMenuModule
  ]
})
export class MatSelectModule {}