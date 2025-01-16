import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { UserServiceService } from '../Services/User/user-service.service';
import { Subject } from 'rxjs';
import { BookServiceService } from '../Services/Appointment/book-service.service';
import { Router } from '@angular/router';
import { SharedDataServiceService } from '../Services/sevices/shared-data-service.service';
import { SearchSharedServiceService } from '../Services/SearchShared/search-shared-service.service';
import { ToastrService } from 'ngx-toastr';

interface Doctor {
  doctorId: number;
  name: string;
  isActive: boolean;
  isProfileComplete: boolean;
  // Add other properties from your API response if needed
}

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
  isLoading =false;
  filteredDoctorsByLocation: any[] = []; // New variable for doctors filtered by location


  constructor(private toster:ToastrService, private cdr:ChangeDetectorRef, private searchShared:SearchSharedServiceService, private Sharedservice:SharedDataServiceService, private router:Router, private bookservice:BookServiceService, private userservice:UserServiceService){
    // Subscribe to loading state
    this.Sharedservice.loading$.subscribe((loading) => {
      this.isLoading = loading;
    });
  }
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
             // Get the unique specializations and sort them alphabetically
             const specializations = [...new Set(response.map(doctor => doctor.specialization))]
             .sort((a, b) => a.localeCompare(b)); // Sort alphabetically

            // Fetch specializations to get IDs
            this.userservice.getSpecializations().subscribe(specializationData => {
                // Prepare a map for easy lookup of specialization IDs
                const specializationMap = specializationData.reduce((map: { [x: string]: any; }, spec: { specializationName: string | number; id: any; }) => {
                    map[spec.specializationName] = spec.id; // Assuming specializationName is the key
                    return map;
                }, {});

                 // Sort doctors alphabetically, ignoring 'Dr.' prefix
                 const sortedDoctors = response.sort((a, b) => {
                  const nameA = a.name.replace(/^Dr\.\s*/, ''); // Remove 'Dr.' prefix
                  const nameB = b.name.replace(/^Dr\.\s*/, ''); // Remove 'Dr.' prefix
                  return nameA.localeCompare(nameB);
              });
                
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

  // Clear previous search results
  this.filteredDoctors = [];
  this.bookservice.setFilteredDoctors([]);

    // If only location is selected, we proceed to search for all doctors in that location
    if (this.selectedLocation && this.selectedSpecialist.length === 0 && this.selectedDoctor.length === 0) {
      const locationId = Number(this.selectedLocation);  // Ensure locationId is set
      const specialistIds: number[] = [];  // Empty array for specialistIds
      const doctorIds: number[] = [];  // Empty array for doctorIds
  
      // Proceed to call the API with locationId only
      this.callDoctorSearchAPI(locationId, specialistIds, doctorIds);
      return;
    }
    
  // Ensure at least one selection is made
  if (this.selectedSpecialist.length === 0 && this.selectedDoctor.length === 0) {
    this.isSelectionValid = false;
    this.Sharedservice.hideLoading();
    console.log('No selection made. Please select at least one specialist or doctor.');
    return;
  } else {
    this.isSelectionValid = true;
  }

  // Check if only one doctor is selected and no specialist is selected
  if (this.selectedDoctor.length === 1 && this.selectedSpecialist.length === 0) {
    const selectedDoctorId = this.selectedDoctor[0];
    const selectedDoctorName = this.combinedList.find(
      (item) => item.doctorId === selectedDoctorId
    )?.name;

    this.Sharedservice.setDoctorId(selectedDoctorId.toString());
    if (selectedDoctorName) {
      this.userservice.setDoctorName(selectedDoctorName);
    }

    setTimeout(() => {
      this.Sharedservice.hideLoading();
      this.router.navigate(['/stepperpage'], { 
        queryParams: { 
          doctorId: selectedDoctorId 
        }
      });
    }, 500);

    return;
  }
 // Convert location, specialists, and doctors into variables
 const locationId = this.selectedLocation ? Number(this.selectedLocation) : undefined;
 const specialistIds = this.selectedSpecialist.length ? this.selectedSpecialist : [];
 const doctorIds = this.selectedDoctor.length ? this.selectedDoctor : [];

 if (!locationId && specialistIds.length === 0 && doctorIds.length === 0) {
   this.Sharedservice.hideLoading();
   console.log('No valid search criteria provided.');
   return;
 }

 console.log('Search Criteria:', { locationId, specialistIds, doctorIds });

 // Call the API to fetch matching doctors
 this.callDoctorSearchAPI(locationId, specialistIds, doctorIds);
}
  // Call the API to fetch matching doctors
  private callDoctorSearchAPI(locationId: number | undefined, specialistIds: number[], doctorIds: number[]): void {
    this.bookservice.getDoctorsByLocation(locationId, specialistIds, doctorIds).subscribe({
      next: (response) => {
        const allDoctors: Doctor[] = response.data || [];
        console.log('All Doctors from API:', allDoctors);
  
        // Filter for active doctors only (isActive === true)
        this.filteredDoctors = allDoctors.filter(
          (doctor: Doctor) => doctor.isActive === true
        );
        console.log('Filtered Doctors:', this.filteredDoctors);
  
        this.Sharedservice.hideLoading();
        // Check if only one doctor is present in the filtered list
      if (this.filteredDoctors.length === 1) {
  const singleDoctor = this.filteredDoctors[0];
  console.log('Single Doctor Found:', singleDoctor);

  // Ensure doctorId exists
  if (!singleDoctor.id) {
    console.error('DoctorId is missing:', singleDoctor);
    return;
  }

  // Set shared data
  this.Sharedservice.setDoctorId(singleDoctor.id.toString());
  this.userservice.setDoctorName(singleDoctor.name);

  // Navigate directly to the Stepper Page
  console.log('Navigating to Stepper Page');
  this.router.navigate(['/stepperpage'], {
    queryParams: { doctorId: singleDoctor.id },
  }).then(() => {
    console.log('Navigation to Stepper Page successful');
  }).catch((err) => {
    console.error('Navigation error:', err);
  });

  return; // Exit to avoid further processing
}

  
        if (this.filteredDoctors.length > 0) {
          this.bookservice.setFilteredDoctors(this.filteredDoctors);
  
          this.searchShared.setSearchData({
            location: this.selectedLocation,
            specialists: this.selectedSpecialist,
            doctors: this.selectedDoctor,
          });
  
          this.router.navigate(['/searchdoctor']);
        } else {
          this.toster.warning(
            'No active doctor profiles found for this search! Please try other criteria.'
          );
          console.log('No active doctors found.');
        }
      },
      error: (error) => {
        this.Sharedservice.hideLoading();
        this.toster.warning(
          'No doctors are available'
        );
        console.error('Error fetching doctors:', error);
      }
    });
}
}