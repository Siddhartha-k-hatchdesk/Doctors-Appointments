import { Component, OnInit } from '@angular/core';
import { UserServiceService } from '../Services/User/user-service.service';
import { Subject } from 'rxjs';
import { BookServiceService } from '../Services/Appointment/book-service.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-picture-body',
  templateUrl: './picture-body.component.html',
  styleUrls: ['./picture-body.component.css']
})
export class PictureBodyComponent implements OnInit{

  isSelectionValid: boolean = true; // Flag for validation
  combinedList: any[] = [];
  selectedSpecialist: number[]=[];
  selectedDoctor: number[]=[];
  selectedLocation: any = null; // Add a variable for selected location
  searchInput = new Subject<string>();
  location: any[]=[];
  filteredDoctors: any;
  loading: boolean = false;

  constructor(private router:Router, private bookservice:BookServiceService, private userservice:UserServiceService){}
  ngOnInit(): void {
     this.loadSpecialistsAndDoctors();
    
     
  }
  onSearch(term: any): void {
    this.searchInput.next(term); // Send input to searchInput subject
  }
  loadSpecialistsAndDoctors(): void {
    this.userservice.getDoctors().subscribe({
        next: (response) => {
            // Get the unique specializations
            const specializations = [...new Set(response.map(doctor => doctor.specialization))];

            // Fetch specializations to get IDs
            this.userservice.getSpecializations().subscribe(specializationData => {
                // Prepare a map for easy lookup of specialization IDs
                const specializationMap = specializationData.reduce((map: { [x: string]: any; }, spec: { specializationName: string | number; id: any; }) => {
                    map[spec.specializationName] = spec.id; // Assuming specializationName is the key
                    return map;
                }, {});
            
                // Prepare combined list of specialists and doctors
                this.combinedList = [
                    ...specializations.map(specialization => ({
                        groupName: 'Specialists',
                        name: specialization,
                        value: `specialization-${specialization}`,  // This can be used for display
                        specializationId: specializationMap[specialization] // Get the specialization ID
                    })),
                    ...response.map(doctor => ({
                        groupName: 'Doctors',
                        name: `${doctor.name} (${doctor.specialization})`,
                        value: `doctor-${doctor.name}`,
                        doctorId: doctor.id,
                        // Store full doctor object if needed
                    }))
                ];
                

                // Log the combined list for debugging purposes
                console.log('Combined List:', this.combinedList);
            });
        },
        error: (err) => console.error('Error fetching specialists and doctors:', err),
    });
}
onSpecializationDoctorChange(event: any): void {
  const selectedValues = event || []; // Handle multiple selection
  console.log("Event:", event);
  console.log("Selected Values:", selectedValues); // Debug selected values

  this.selectedSpecialist = []; // Clear previous selections
  this.selectedDoctor = []; // Clear previous selections
  selectedValues.forEach((item: any) => {
    console.log("Processing Item:", item);

    // Check if the selected item has a specializationId (i.e., it is a Specialist)
    if (item.specializationId) {
      this.selectedSpecialist.push(item.specializationId);
      console.log('Added Specialist ID:', item.specializationId);
    }
    // Check if the selected item has a doctorId (i.e., it is a Doctor)
    else if (item.doctorId) {
      this.selectedDoctor.push(item.doctorId);
      console.log('Added Doctor ID:', item.doctorId);
    }
    // Handle fallback cases for debugging
    else {
      console.log('Item does not have specializationId or doctorId:', item);
    }
  });

  console.log('Final selected specialists:', this.selectedSpecialist);
  console.log('Final selected doctors:', this.selectedDoctor);
}

loadLocation(event: { term: string; items: any[] }): void {
  const searchTerm = event.term;

  if (searchTerm.length >= 3) {
      this.userservice.getLocation(searchTerm).subscribe(
          (data: any) => {
              this.location = data;
              console.log('Loaded Locations:', this.location); // Log loaded locations
          },
          (error) => {
              console.error("Error loading locations", error);
          }
      );
  } else {
      this.location = []; // Clear the location list if less than 3 characters
  }
}

onLocationChange(event: any): void {
  console.log('Selected Location ID:', this.selectedLocation);
}
// Method to make the API call based on selected location, specialists, and doctors
// onSearchClick(): void {
//   this.loading = true; // Set loading to true at the start
 
//   // Check if any specialist or doctor is selected
//   if (this.selectedSpecialist.length === 0 && this.selectedDoctor.length === 0) {
//     this.isSelectionValid = false; // Set to false if no selection
//     this.loading = false; // Stop loading
//     return; // Exit the method
//   } else {
//     this.isSelectionValid = true; // Set to true if a selection is made
//   }
  
//   const locationId: number | undefined = this.selectedLocation ? Number(this.selectedLocation) : undefined;
//   const specialistId: number | undefined = this.selectedSpecialist.length ? Number(this.selectedSpecialist[0]) : undefined;
//   const doctorId: number | undefined = this.selectedDoctor.length ? Number(this.selectedDoctor[0]) : undefined;

//   console.log('Selected Location ID:', locationId);
//   console.log('Selected Specialist ID:', specialistId);
//   console.log('Selected Doctor ID:', doctorId);

//   this.bookservice.getDoctorsByLocation(locationId, specialistId, doctorId).subscribe({
//     next: (response) => {
//       this.filteredDoctors = response.data || response || [];

//       this.loading = false; // Set loading to false when the response is received

//       if (this.filteredDoctors.length > 0) {
//         // Use the service to store the doctors before navigation
//         this.bookservice.setFilteredDoctors(this.filteredDoctors);
//         this.router.navigate(['/searchdoctor']);
//       } else {
//         console.log('No doctors found. Not navigating to search doctor list.');
//       }
//     },
//     error: (error) => {
//       this.loading = false; // Set loading to false in case of error
//       console.error('Error fetching doctors:', error);
//     }
//   });
// }

onSearchClick(): void {
  this.loading = true;

  // Ensure at least one selection is made
  if (this.selectedSpecialist.length === 0 && this.selectedDoctor.length === 0) {
    this.isSelectionValid = false;
    this.loading = false;
    return;
  } else {
    this.isSelectionValid = true;
  }

  // Convert selectedLocation to a number or keep it undefined if not selected
  const locationId: number | undefined = this.selectedLocation ? Number(this.selectedLocation) : undefined;
  
  // Pass the entire arrays of selected specialists and doctors
  const specialistIds: number[] | undefined = this.selectedSpecialist.length ? this.selectedSpecialist : undefined;
  const doctorIds: number[] | undefined = this.selectedDoctor.length ? this.selectedDoctor : undefined;

  console.log('Selected Location ID:', locationId);
  console.log('Selected Specialist IDs:', specialistIds);
  console.log('Selected Doctor IDs:', doctorIds);

  this.bookservice.getDoctorsByLocation(locationId, specialistIds, doctorIds).subscribe({
    next: (response) => {
      this.filteredDoctors = response.data || response || [];
      this.loading = false;
  
      if (this.filteredDoctors.length > 0) {
        this.bookservice.setFilteredDoctors(this.filteredDoctors);
        this.router.navigate(['/searchdoctor']);
      } else {
        console.log('No doctors found.');
      }
    },
    error: (error) => {
      this.loading = false;
      console.error('Error fetching doctors:', error);
    }
  });
}  








}
