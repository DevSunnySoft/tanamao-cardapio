import { Component, OnInit } from '@angular/core';
import { UsersService } from '../users.service';

@Component({
  selector: 'app-logout',
  template: '<p>Saindoo!</p>',
  styleUrls: ['./logout.component.sass']
})
export class LogoutComponent implements OnInit {

  constructor(
    private _usersService: UsersService
  ) { }

  ngOnInit(): void {
    this._usersService.logout()
  }
}
