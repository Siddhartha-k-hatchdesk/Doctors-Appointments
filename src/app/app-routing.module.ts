import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { BookAppointmentComponent } from './book-appointment/book-appointment.component';
import { HomeComponent } from './home/home.component';
import { AboutUsComponent } from './about-us/about-us.component';
import { ContactUsComponent } from './contact-us/contact-us.component';
import { RegisterComponent } from './register/register.component';
import { UserPortalComponent } from './user-portal/user-portal.component';
import { LoginComponent } from './login/login.component';
import { AppointmentsComponent } from './appointments/appointments.component';
import { DoctorPortalComponent } from './doctor-portal/doctor-portal.component';
import { AdminPortalComponent } from './admin-portal/admin-portal.component';
import { UserDashboardComponent } from './user-portal/user-dashboard/user-dashboard.component';
import { authGuard } from './auth.guard';
import { DoctorDashboardComponent } from './doctor-portal/doctor-dashboard/doctor-dashboard.component';
import { UserAppointmentComponent } from './user-portal/user-appointment/user-appointment.component';
import { AdminDashboardComponent } from './admin-portal/admin-dashboard/admin-dashboard.component';
import { AddDoctorComponent } from './admin-portal/add-doctor/add-doctor.component';
import { DoctorListComponent } from './admin-portal/Doctor-List/doctor-list/doctor-list.component';
import { AllappointmentsComponent } from './admin-portal/allappointments/allappointments.component';
import { SearchdoctorlistComponent } from './searchdoctorlist/searchdoctorlist.component';
import { StepperComponent } from './stepper/stepper.component';
import { StepperpageComponent } from './stepperpage/stepperpage.component';
import { AppointmentinteractionComponent } from './appointmentinteraction/appointmentinteraction.component';
import { AddSpecializationComponent } from './admin-portal/add-specialization/add-specialization.component';
import { DoctorprofileComponent } from './doctor-portal/doctorprofile/doctorprofile.component';


const routes: Routes = [
  {path:'',component:HomeComponent},//Default route
  {path: 'book-appointment', component: BookAppointmentComponent },
  {path:'about-us', component:AboutUsComponent},
  {path:'contact-us', component:ContactUsComponent},
  {path:'register', component:RegisterComponent},
  {path:'login',component:LoginComponent},
  {path:'admin/login',component:LoginComponent},
  {path:'doctor/login',component:LoginComponent},
  {path:'stepper',component:StepperComponent},
  {path:'stepperpage',component:StepperpageComponent},
  {path:'appointmentinteracation', component:AppointmentinteractionComponent},
  
  {path:'doctor-portal',
   canActivate:[authGuard],
   data:{role:'2'},
    component:DoctorPortalComponent,
  children:[
    {path:'',redirectTo:'doctor-dashboard',pathMatch:'full'},
    {path:'doctor-dashboard',component:DoctorDashboardComponent},
    {path:'appointments',component:AppointmentsComponent},
    {path:'doctor-profile/:id',component:DoctorprofileComponent}
  ]
  },

  {path:'user-portal',
    component:UserPortalComponent,
    canActivate:[authGuard],
    data:{role:'3'},
    children:[
        
      {path:'',redirectTo:'user-dashboard',pathMatch:'full'},
      {path:'user-dashboard',component:UserDashboardComponent},
      {path:'user-appointment',component:UserAppointmentComponent},
    ]
  },
  
  {path:'admin-portal',
   canActivate:[authGuard],
    component:AdminPortalComponent,
   data:{role:'1'},
  children:[
    {path:'',redirectTo:'admin-dashboard',pathMatch:'full'},
    {path:'admin-dashboard',component:AdminDashboardComponent},
    {path:'allappointments',component:AllappointmentsComponent},
    {path:'add-doctor',component:AddDoctorComponent},
    {path:'add-doctor/:id',component:AddDoctorComponent},
    {path:'doctor-list',component:DoctorListComponent},
    {path:'add-specialization',component:AddSpecializationComponent}
   
  ]},
  {path:'searchdoctor',component:SearchdoctorlistComponent},
  
  
];

@NgModule({
  imports: [RouterModule.forRoot(routes,{
    scrollPositionRestoration:'enabled',
    anchorScrolling:'enabled',
  })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
