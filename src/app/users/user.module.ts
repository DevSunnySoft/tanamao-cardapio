import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { MatBadgeModule } from "../material/mat-badge/mat-badge.module";
import { MatFormFieldModule } from "../material/mat-form-field/mat-form-field.module";
import { MatInputModule } from "../material/mat-input/mat-input.module";
import { MatLabelModule } from "../material/mat-label/mat-label.module";
import { ProfileComponent } from "./profile/profile.component";
import { UserRoutingModule } from "./user-routing.module";
import { UserComponent } from "./user.component";

@NgModule({
  declarations: [
    UserComponent,
    ProfileComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    UserRoutingModule,
    MatFormFieldModule,
    MatInputModule,
    MatLabelModule,
    MatBadgeModule
  ]
})
export class UserModule {}