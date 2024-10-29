import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { BookAppointmentComponent } from './book-appointment/book-appointment.component';
import { HomeComponent } from './home/home.component';
import { AboutUsComponent } from './about-us/about-us.component';
import { ContactUsComponent } from './contact-us/contact-us.component';
import { RegisterComponent } from './register/register.component';
import { UserPortalComponent } from './user-portal/user-portal.component';
import { TestingComponent } from './testing/testing.component';
import { LoginComponent } from './login/login.component';
import { AppointmentsComponent } from './appointments/appointments.component';
import { DoctorPortalComponent } from './doctor-portal/doctor-portal.component';

const routes: Routes = [
  {path:'', component:HomeComponent},//Default route
  { path: 'book-appointment', component: BookAppointmentComponent },
  {path:'about-us', component:AboutUsComponent},
  {path:'contact-us', component:ContactUsComponent},
  {path:'register', component:RegisterComponent},
  {path:'user-portal',component:UserPortalComponent},
  {path:'testing',component:TestingComponent},
  {path:'login',component:LoginComponent},
  {path:'appointments',component:AppointmentsComponent},
  {path:'doctor-portal',component:DoctorPortalComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
