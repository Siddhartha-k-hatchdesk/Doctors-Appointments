import { Component, OnInit } from '@angular/core';
import { UserServiceService } from '../../../Services/User/user-service.service';
import { DoctorServiceService } from '../../../Services/Doctor/doctor-service.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-doctor-list',
  templateUrl: './doctor-list.component.html',
  styleUrl: './doctor-list.component.css'
})
export class DoctorListComponent implements OnInit {

  doctors:any[]=[];
  selectedDoctor:any=null;

  constructor(private userService:UserServiceService,private doctorService:DoctorServiceService,private router:Router){}

  ngOnInit(): void {
this.loadDoctors();

  }
  loadDoctors(): void {
    this.userService.getDoctors().subscribe(data => {
      this.doctors = data;
      console.log('Doctor loaded:',this.doctors);
    });
  }
 
  deleteDoctor(id: number): void {
    if (confirm('Are you sure you want to delete this doctor?')) {
      this.doctorService.deleteDoctor(id).subscribe(response => {
        alert('Doctor deleted successfully');
        this.loadDoctors(); // Reload the list to reflect changes
      }, error => {
        alert('Error deleting doctor');
      });
    }
  }
  editDoctor(id: number): void {
    this.router.navigate(['/admin-portal/add-doctor', id]);
  }
}

