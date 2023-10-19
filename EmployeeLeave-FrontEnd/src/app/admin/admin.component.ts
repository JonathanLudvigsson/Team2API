import {Component} from '@angular/core';
import {BaseService} from '../services/baseservice';
import {Request} from '../models/request'
import {LeaveType} from '../models/leavetype';
import {User} from '../models/user';
import {AuthService} from "../services/auth.service";
import {Router} from '@angular/router';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css']
})
export class AdminComponent {

  constructor(private baseService: BaseService, private authService: AuthService, private router: Router) {

  }

  requests: Request[] = []

  requestsToShow: Request[] = []

  users: User[] = []

  newLeave: LeaveType = {
    leaveTypeID: '',
    name: '',
    maximumDays: ''
  }

  ngOnInit() {
    this.GetAllRequests()
    this.GetAllUsers()
    this.AuthenticateAdmin()
  }

  AuthenticateAdmin() {
    this.authService.isLoggedIn$.subscribe(response => {
      if (!response) {
        this.router.navigate(['/']);
      }
    });
    this.authService.isAdmin$.subscribe(response => {
      if (!response) {
        this.router.navigate(['/']);
      }
    });
  }

  GetAllUsers() {
    this.baseService.GetAll<User>("users").subscribe(response => {
      this.users = response.filter(u => !u.isAdmin)
    })
  }

  GetAllRequests() {
    this.baseService.GetAll<Request>("request").subscribe(response => {
      this.requests = response
      this.requestsToShow = this.requests
    })
  }

  async SortRequests(status: string) {
    this.baseService.GetAll<Request>("request").subscribe(response => {

      this.requestsToShow = response.filter(r => r.leaveStatus == status)

      this.requests = response.filter(r => r.leaveStatus == status)
      this.requestsToShow = this.requests as RequestDTO[]
      this.requestsToShow.forEach(request => {
        this.baseService.Get<User>("users/", request.userID).subscribe(user => {
          request.userName = user.name
        })
        this.baseService.Get<LeaveType>("leavetypes/", request.leaveTypeID).subscribe(leavetype => {
          request.leaveTypeName = leavetype.name
        })
      })


    })
  }

  ApproveOrDenyRequest(request: Request, approved: boolean) {
    if (approved == true) {
      request.leaveStatus = '1'
    } else {
      request.leaveStatus = '2'
    }
    this.baseService.Update<Request>("request/update/", request.requestID, request).subscribe(response => {
      console.log(response)
    })
  }

  CreateLeaveType() {
    this.baseService.Create<LeaveType>("leavetypes", this.newLeave).subscribe(response => {
    })
  }

  EditLeaveType(id: string) {
    this.baseService.Update<LeaveType>("leavetypes/", id, this.newLeave).subscribe(response => {
    })
  }

  DeleteLeaveType(id: string) {
    this.baseService.Delete<LeaveType>("leavetypes/", id).subscribe(response => {
    })
  }

}
