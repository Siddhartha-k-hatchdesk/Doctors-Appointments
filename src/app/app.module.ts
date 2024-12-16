import { NgModule } from '@angular/core';
import { BrowserModule, provideClientHydration } from '@angular/platform-browser';
import {CdkStepperModule} from '@angular/cdk/stepper';
import {MatStepperModule} from '@angular/material/stepper';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HeaderComponent } from './header/header.component';
import { MenuLinkComponent } from './header/menu-link/menu-link.component';
import { FooterComponent } from './footer/footer.component';

import { PictureBodyComponent } from './picture-body/picture-body.component';
import { BookAppointmentComponent } from './book-appointment/book-appointment.component';
import { OtherComponent } from './other/other.component';
import { HomeComponent } from './home/home.component';
import { AboutUsComponent } from './about-us/about-us.component';
import { ContactUsComponent } from './contact-us/contact-us.component';
import { NgModel, ReactiveFormsModule } from '@angular/forms';
import { RegisterComponent } from './register/register.component';
import { UserPortalComponent } from './user-portal/user-portal.component';
import { LoginComponent } from './login/login.component';
import { CommonModule } from '@angular/common';
import { AppointmentsComponent } from './appointments/appointments.component';
import { DoctorPortalComponent } from './doctor-portal/doctor-portal.component';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { HttpClientModule } from '@angular/common/http';
import { AdminPortalComponent } from './admin-portal/admin-portal.component';
import { UserDashboardComponent } from './user-portal/user-dashboard/user-dashboard.component';
import { authGuard } from './auth.guard';
import { AuthService } from './auth.service';
import { DoctorDashboardComponent } from './doctor-portal/doctor-dashboard/doctor-dashboard.component';
import { UserAppointmentComponent } from './user-portal/user-appointment/user-appointment.component';
import { FormsModule } from '@angular/forms';
import { AdminDashboardComponent } from './admin-portal/admin-dashboard/admin-dashboard.component';
import { AddDoctorComponent } from './admin-portal/add-doctor/add-doctor.component';
import { DoctorListComponent } from './admin-portal/Doctor-List/doctor-list/doctor-list.component';
import { NgSelectModule } from '@ng-select/ng-select';
import { AllappointmentsComponent } from './admin-portal/allappointments/allappointments.component';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { MatDialogModule } from '@angular/material/dialog';
import { SearchdoctorlistComponent } from './searchdoctorlist/searchdoctorlist.component';
import { StepperComponent } from './stepper/stepper.component';
import { TimeanddateComponent } from './timeanddate/timeanddate.component';
import { AppointmentinteractionComponent } from './appointmentinteraction/appointmentinteraction.component';
import { StepperpageComponent } from './stepperpage/stepperpage.component';
import { UserdetailformComponent } from './userdetailform/userdetailform.component';
import { UserReviewFormComponent } from './user-review-form/user-review-form.component';
import { PreFooterComponent } from './pre-footer/pre-footer.component';
import { AddSpecializationComponent } from './admin-portal/add-specialization/add-specialization.component';
import { ToastrModule } from 'ngx-toastr';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { DoctorprofileComponent } from './doctor-portal/doctorprofile/doctorprofile.component';



@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    MenuLinkComponent,
    FooterComponent,
    PictureBodyComponent,
    OtherComponent,
    HomeComponent,
    AboutUsComponent,
    ContactUsComponent,
    UserPortalComponent,
    LoginComponent,
    RegisterComponent,
    AppointmentsComponent,
    AppointmentsComponent,
    DoctorPortalComponent,
    AdminPortalComponent,
    UserDashboardComponent,
    DoctorDashboardComponent,
    BookAppointmentComponent,
    UserAppointmentComponent,
    AdminDashboardComponent,
    AddDoctorComponent,
    DoctorListComponent,
    AllappointmentsComponent,
    SearchdoctorlistComponent,
    StepperComponent,
    TimeanddateComponent,
    AppointmentinteractionComponent,
    StepperpageComponent,
    UserdetailformComponent,
    UserReviewFormComponent,
    PreFooterComponent,
    AddSpecializationComponent,
    DoctorprofileComponent,
    
    ],

  imports: [
    BrowserModule,
    AppRoutingModule,
    ReactiveFormsModule,
    CommonModule,
    HttpClientModule,
    FormsModule,
    NgSelectModule,
    MatDialogModule,
    CdkStepperModule,
    MatStepperModule,
    BrowserAnimationsModule,
    ToastrModule.forRoot({   // Global toastr settings
      timeOut: 3000,
      positionClass: 'toast-top-right',
      preventDuplicates: true,
    }),
    ],
    exports:[CdkStepperModule,
      MatStepperModule
    ],
    
  providers: [
    AuthService,
     
    provideClientHydration(),
    provideHttpClient(withFetch()),
    provideAnimationsAsync(),
    
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }