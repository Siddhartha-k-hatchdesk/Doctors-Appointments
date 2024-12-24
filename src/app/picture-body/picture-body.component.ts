import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { UserServiceService } from '../Services/User/user-service.service';
import { Subject } from 'rxjs';
import { BookServiceService } from '../Services/Appointment/book-service.service';
import { Router } from '@angular/router';
import { SharedDataServiceService } from '../Services/sevices/shared-data-service.service';
import { SearchSharedServiceService } from '../Services/SearchShared/search-shared-service.service';


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
  filteredDoctorsByLocation: any[] = []; // New variable for doctors filtered by location


  constructor(private cdr:ChangeDetectorRef, private searchShared:SearchSharedServiceService, private Sharedservice:SharedDataServiceService, private router:Router, private bookservice:BookServiceService, private userservice:UserServiceService){}
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
                        name: `${doctor.name} (${doctor.specialization})`, // Include specialization in display
                        value: `doctor-${doctor.name}`,
                        doctorId: doctor.id,
                    }))
                ];
                this.cdr.detectChanges();
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

loadLocation(event: {term: string; items: any[] }): void {
  const searchTerm = event.term;
  console.log('Search Term:', searchTerm); // Debug log

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

  if (this.selectedLocation) {
      const locationId = Number(this.selectedLocation); // Ensure it's a number
      this.userservice.getDoctorsByLocation(locationId).subscribe({
          next: (response) => {
              console.log('Filtered Doctors response:', response); // Log the response
              
              // Filtered doctors from the selected location
              this.filteredDoctorsByLocation = response || []; // Update the filtered list
              
              // Maintain the original combined list, filtering to keep only specialists and the new filtered doctors
              const filteredDoctorsWithSpecialization = this.filteredDoctorsByLocation.map((doctor: any) => ({
                  groupName: 'Doctors',
                  name: `${doctor.name} (${doctor.specialization})`, // Format as needed
                  doctorId: doctor.id,
              }));
             
              // Combine specialists and filtered doctors
              this.combinedList = [
                  ...this.combinedList.filter(item => item.groupName === 'Specialists'), // Only keep specialists
                  ...filteredDoctorsWithSpecialization // Add filtered doctors with specializations
              ];

              console.log('Updated Combined List after location change:', this.combinedList);
          },
          error: (error) => {
              console.error('Error fetching doctors:', error);
          }
      });
  } else {
      // If no location is selected, reset the combined list to show all specialists and doctors
      this.loadSpecialistsAndDoctors(); // This will re-fetch and display the full list
      console.log('No location selected, showing full list of specialists and doctors.');
  }
}



onSearchClick(): void {
  this.Sharedservice.showLoading();

  // Ensure at least one selection is made
  if (this.selectedSpecialist.length === 0 && this.selectedDoctor.length === 0) {
    this.isSelectionValid = false;
    this.Sharedservice.hideLoading();
    return;
  } else {
    this.isSelectionValid = true;
  }
 // Check if only one doctor is selected and no specialist is selected
if (this.selectedDoctor.length === 1 && this.selectedSpecialist.length === 0) {
  const selectedDoctorId = this.selectedDoctor[0];
  const selectedSpecialistId = this.selectedSpecialist.length > 0 ? this.selectedSpecialist[0] : null; // If any specialist is selected

  // Save the doctor ID and specialist ID in the shared service
  this.Sharedservice.setDoctorId(selectedDoctorId.toString());
  
  if (selectedSpecialistId) {
    this.Sharedservice.setSpecialistId(selectedSpecialistId.toString());
  }

  // Add a slight delay to show the loading indicator before navigation
  setTimeout(() => {
    this.Sharedservice.hideLoading(); // Stop loading indicator
    this.router.navigate(['/stepperpage'], { 
      queryParams: { 
        doctorId: selectedDoctorId, 
        specialistId: selectedSpecialistId || '' // Pass specialistId as query param, if selected
      }
    });
  }, 500); // Delay of 500ms for better user experience

  return;
}
  // Convert selectedLocation to a number or keep it undefined if not selected
  const locationId: number | undefined = this.selectedLocation ? Number(this.selectedLocation) : undefined;

  // Pass the entire arrays of selected specialists and doctors
  const specialistIds: number[] | undefined = this.selectedSpecialist.length ? this.selectedSpecialist : [];
  const doctorIds: number[] | undefined = this.selectedDoctor.length ? this.selectedDoctor : [];

  console.log('Selected Location ID:', locationId);
  console.log('Selected Specialist IDs:', specialistIds);
  console.log('Selected Doctor IDs:', doctorIds);

  this.bookservice.getDoctorsByLocation(locationId, specialistIds, doctorIds).subscribe({
    next: (response) => {
      this.filteredDoctors = response.data || response || [];
      this.Sharedservice.hideLoading();

      if (this.filteredDoctors.length > 0) {
        this.bookservice.setFilteredDoctors(this.filteredDoctors);

        // Use shared service to store the data
        this.searchShared.setSearchData({
          location: this.selectedLocation,
          specialists: this.selectedSpecialist,
          doctors: this.selectedDoctor,
        });

        this.router.navigate(['/searchdoctor']);
      } else {
        console.log('No doctors found.');
      }
    },
    error: (error) => {
      this.router.navigate(['/searchdoctor']);
      this.Sharedservice.hideLoading();
      console.error('Error fetching doctors:', error);
    },
  });
}

}


