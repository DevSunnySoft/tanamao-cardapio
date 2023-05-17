import { NgModule } from "@angular/core";
import { Route, RouterModule } from "@angular/router";
import { ProfileComponent } from "./profile/profile.component";
//import { NotificationsComponent } from "./notifications/notifications.component";
//import { OrdersComponent } from "./orders/orders.component";
//import { ProfileComponent } from "./profile/profile.component";
import { UserComponent } from "./user.component";

const routes: Route[] = [
  {
    path: "",
    component: UserComponent
  },
  /*
  {
    path: "messages",
    component: NotificationsComponent
  },
  {
    path: "orders",
    component: OrdersComponent
  },
  */
  {
    path: "profile",
    component: ProfileComponent
  }
]

@NgModule({
  imports: [
    RouterModule.forChild(routes)
  ],
  exports: [RouterModule]
})
export class UserRoutingModule {}