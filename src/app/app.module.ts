import { NgModule } from '@angular/core';
import { BrowserModule, provideClientHydration } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HeaderComponent } from './header/header.component';
import { MenuLinkComponent } from './header/menu-link/menu-link.component';
import { FooterComponent } from './footer/footer.component';
import { PreFooterComponent } from './pre-footer/pre-footer.component';
import { PictureBodyComponent } from './picture-body/picture-body.component';
import { BookAppointmentComponent } from './book-appointment/book-appointment.component';
import { OtherComponent } from './other/other.component';
import { HomeComponent } from './home/home.component';
import { AboutUsComponent } from './about-us/about-us.component';
import { ContactUsComponent } from './contact-us/contact-us.component';
import { ReactiveFormsModule } from '@angular/forms';
import { RegisterComponent } from './register/register.component';
import { UserPortalComponent } from './user-portal/user-portal.component';
import { LoginComponent } from './login/login.component';
import { CommonModule } from '@angular/common';
import { AppointmentsComponent } from './appointments/appointments.component';
import { DoctorPortalComponent } from './doctor-portal/doctor-portal.component';
import { provideHttpClient } from '@angular/common/http';
import { HttpClientModule } from '@angular/common/http';

@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    MenuLinkComponent,
    FooterComponent,
    PreFooterComponent,
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
    DoctorPortalComponent


  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BookAppointmentComponent,
    ReactiveFormsModule,
    CommonModule,
    HttpClientModule
  
  ],
  providers: [
    provideClientHydration(),
    provideHttpClient()
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
