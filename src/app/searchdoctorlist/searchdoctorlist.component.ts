import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BookServiceService } from '../Services/Appointment/book-service.service';
import { SharedDataServiceService } from '../Services/sevices/shared-data-service.service';
import { UserServiceService } from '../Services/User/user-service.service';
import { event } from 'jquery';
import { SearchSharedServiceService } from '../Services/SearchShared/search-shared-service.service';
import { DoctorServiceService } from '../Services/Doctor/doctor-service.service';
import { ToastrService } from 'ngx-toastr';

interface Doctor {
  doctorId: number;
  name: string;
  isActive: boolean;
  isProfileComplete: boolean;
  // Add other properties from your API response if needed
}
@Component({
  selector: 'app-searchdoctorlist',
  templateUrl: './searchdoctorlist.component.html',
  styleUrl: './searchdoctorlist.component.css'
})
export class SearchdoctorlistComponent implements OnInit{
  filteredDoctors: any[] = [];
  selectedLocation: any=null;
  selectedSpecialists: any[] = [];
  selectedDoctors: number[] = [];
  specializations: any;
  searchPerformed = false;
  combinedList: any[] = [];
  location: any[]=[]; // Store locations if needed
  filteredDoctorsByLocation: any[] = []; // New variable for doctors filtered by location
  isSelectionValid: boolean = true; // Flag for validation
  loading: boolean = false;
  doctorAvailability: { days: string; time: string }[] = [];
  totalRecords: number = 0;
  page: number = 1;
  pageSize: number = 5;
  totalPages: number = 0;
  isGetAppointmentPage=false;
  constructor(private toster:ToastrService, private doctorservice:DoctorServiceService, private searchshared:SearchSharedServiceService, private userservice:UserServiceService, private bookservice:BookServiceService, private route:ActivatedRoute, private Sharedservice:SharedDataServiceService, private router:Router){}
  ngOnInit(): void {
    // First, load specialists and doctors asynchronously
    this.loadSpecialistsAndDoctors().then(() => {
      // After specialists and doctors are loaded, retrieve the shared data
      const searchData = this.searchshared.getSearchData();
      
      if (searchData) {
        this.selectedLocation = searchData.location ? Number(searchData.location) : null;
        this.selectedSpecialists = searchData.specialists || [];
        this.selectedDoctors = searchData.doctors || [];
        
        console.log('Selected Location:', this.selectedLocation);
        console.log('Selected Specialists:', this.selectedSpecialists);
        console.log('Selected Doctors:', this.selectedDoctors);
      }
  
      // Now, check if we have query parameters that override or add to the selected specialists
      this.route.queryParams.subscribe((params) => {
        const specialistsParam = params['specialists'];
        if (specialistsParam) {
          this.selectedSpecialists = JSON.parse(specialistsParam);
          console.log('Specialists from Query Params:', this.selectedSpecialists);
        }
        
        // Proceed to display the filtered doctors with the combined data
        this.fetchDoctors();
      });
    });
  }
  
  onPageChange(newPage: number): void {
    this.page = newPage;
    this.fetchDoctors();
  }
  onPageSizeChange(event: Event) {
    this.pageSize = +(event.target as HTMLSelectElement).value; // Get selected value
    this.page = 1; // Reset to the first page
    this.fetchDoctors(); // Reload data
  }
 
  fetchDoctors(): void {
    const locationId = this.selectedLocation ? Number(this.selectedLocation) : undefined;
    const specialistIds = this.selectedSpecialists.length ? this.selectedSpecialists : [];
   const doctorIds = this.selectedDoctors.length ? this.selectedDoctors : [];
    
   // Ensure we have valid search criteria
  if (!specialistIds.length && !locationId) {
    console.log('No valid search criteria. Not fetching doctors.');
    this.filteredDoctors = [];
    this.totalRecords = 0;
    this.totalPages = 0;
    return;
  }
    // Ensure there are valid search criteria
    if (!locationId && specialistIds.length === 0 && doctorIds.length === 0) {
      console.log('No valid search criteria. Not fetching doctors.');
      this.filteredDoctors = [];
      this.totalRecords = 0;
      this.totalPages = 0;
      return;
    }
  
    console.log('Fetching doctors with criteria:', { locationId, specialistIds, doctorIds });
  
    this.bookservice.getDoctorsByLocation(locationId, specialistIds, doctorIds, this.page, this.pageSize).subscribe({
      next: (response) => {
        this.filteredDoctors = response.data || [];
        this.totalRecords = response.totalRecords || 0;
        this.totalPages = response.totalPages || 0;
  
        if (this.filteredDoctors.length === 0) {
          console.log('No doctors found based on the selected criteria.');
        } else {
          console.log('Filtered doctors:', this.filteredDoctors);
        }
      },
      error: (error) => {
        console.error('Error fetching doctors:', error);
      }
    });
  }
  

  
  onAppointmentClick(doctorId: number, specializationId: number,doctorName: string): void {
    console.log('Selected Doctor ID:', doctorId);
    console.log('Selected Specialist ID:', specializationId);
    console.log('Selected Doctor Name:', doctorName)
    // Set both IDs in the shared service
    this.Sharedservice.setDoctorId(doctorId.toString()); 
    this.Sharedservice.setSpecialistId(specializationId.toString()); // Set specialistId
    this.userservice.setDoctorName(doctorName);
   // console.log('Doctor Name set in service:', doctorName);
  }
  
  formatTime(time: string): string {
    const [hours, minutes] = time.split(':').map(Number);
    const suffix = hours >= 12 ? 'PM' : 'AM';
    const formattedHours = hours % 12 || 12; // Convert to 12-hour format
    return `${formattedHours}:${minutes.toString().padStart(2, '0')} ${suffix}`;
  }
  
  getAvailableDays(availability: any): { days: string, startTime: string, endTime: string } {
    const days = [
      { name: 'MON', available: availability.monday },
      { name: 'TUE', available: availability.tuesday },
      { name: 'WED', available: availability.wednesday },
      { name: 'THU', available: availability.thursday },
      { name: 'FRI', available: availability.friday },
      { name: 'SAT', available: availability.saturday },
      { name: 'SUN', available: availability.sunday }
    ];
  
    // Filter the days based on availability and join them as a comma-separated string
    const availableDays = days.filter(day => day.available).map(day => day.name).join(', ');
  
    // Format the time range using the start and end times
    const formattedStartTime = this.formatTime(availability.startTime);
    const formattedEndTime = this.formatTime(availability.endTime);
  
    return {
      days: availableDays, // Comma-separated string of available days
      startTime: formattedStartTime,
      endTime: formattedEndTime
    };
  }

 
  loadSpecialistsAndDoctors(): Promise<void> {
    return new Promise((resolve, reject) => {
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
            
            // Log the combined list for debugging purposes
            console.log('Combined List:', this.combinedList);
            
            resolve(); // Resolve the promise once loading is complete
          }, (error) => {
            console.error('Error fetching specializations:', error);
            reject(error); // Reject if there's an error loading specializations
          });
        },
        error: (err) => {
          console.error('Error fetching doctors:', err);
          reject(err); // Reject if there's an error loading doctors
        },
      });
    });
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
        
    }
  }
   onSpecializationDoctorChange(event: any): void {
    const selectedValues = event || []; // Handle multiple selection
    console.log("Event:", event);
    console.log("Selected Values:", selectedValues); // Debug selected values
  
    this.selectedSpecialists = []; // Clear previous selections
    this.selectedDoctors = []; // Clear previous selections
    selectedValues.forEach((item: any) => {
      console.log("Processing Item:", item);
  
      // Check if the selected item has a specializationId (i.e., it is a Specialist)
      if (item.specializationId) {
        this.selectedSpecialists.push(item.specializationId);
        console.log('Added Specialist ID:', item.specializationId);
      }
      // Check if the selected item has a doctorId (i.e., it is a Doctor)
      else if (item.doctorId) {
        this.selectedDoctors.push(item.doctorId);
        console.log('Added Doctor ID:', item.doctorId);
      }
      // Handle fallback cases for debugging
      else {
        console.log('Item does not have specializationId or doctorId:', item);
      }
    });
  
    console.log('Final selected specialists:', this.selectedSpecialists);
    console.log('Final selected doctors:', this.selectedDoctors);
  }
  onSearchClick(): void {
    this.Sharedservice.showLoading();
  
    // Clear previous search results
    this.filteredDoctors = [];
    this.bookservice.setFilteredDoctors([]);
   // this.cdr.detectChanges(); // Force UI update for the reset
  
      // If only location is selected, we proceed to search for all doctors in that location
      if (this.selectedLocation && this.selectedSpecialists.length === 0 && this.selectedDoctors.length === 0) {
        const locationId = Number(this.selectedLocation);  // Ensure locationId is set
        const specialistIds: number[] = [];  // Empty array for specialistIds
        const doctorIds: number[] = [];  // Empty array for doctorIds
    
        // Proceed to call the API with locationId only
        this.callDoctorSearchAPI(locationId, specialistIds, doctorIds);
        return;
      }
      
    // Ensure at least one selection is made
    if (this.selectedSpecialists.length === 0 && this.selectedDoctors.length === 0) {
      this.isSelectionValid = false;
      this.Sharedservice.hideLoading();
      console.log('No selection made. Please select at least one specialist or doctor.');
      return;
    } else {
      this.isSelectionValid = true;
    }
  
    // Check if only one doctor is selected and no specialist is selected
    if (this.selectedDoctors.length === 1 && this.selectedSpecialists.length === 0) {
      const selectedDoctorId = this.selectedDoctors[0];
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
   const specialistIds = this.selectedSpecialists.length ? this.selectedSpecialists : [];
   const doctorIds = this.selectedDoctors.length ? this.selectedDoctors : [];
  
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
    // Force Angular to update the UI
    
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
    
            this.searchshared.setSearchData({
              location: this.selectedLocation,
              specialists: this.selectedSpecialists,
              doctors: this.selectedDoctors,
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
 
//   onSearchClick(): void {
//     this.Sharedservice.showLoading();
  
//     // Clear previous search results
//     this.filteredDoctors = [];
//     this.bookservice.setFilteredDoctors([]);
  
//     // Ensure at least one selection is made
//     if (this.selectedSpecialists.length === 0 && this.selectedDoctors.length === 0) {
//       this.isSelectionValid = false;
//       this.Sharedservice.hideLoading();
//       console.log('No selection made. Please select at least one specialist or doctor.');
//       return;
//     } else {
//       this.isSelectionValid = true;
//     }
//    // Check if only one doctor is selected and no specialist is selected
// if (this.selectedDoctors.length === 1 && this.selectedSpecialists.length === 0) {
//   const selectedDoctorId = this.selectedDoctors[0];
//   const selectedSpecialistId = this.selectedSpecialists.length > 0 ? this.selectedSpecialists[0] : null; // If any specialist is selected

//   // Save the doctor ID and specialist ID in the shared service
//   this.Sharedservice.setDoctorId(selectedDoctorId.toString());
  
//   if (selectedSpecialistId) {
//     this.Sharedservice.setSpecialistId(selectedSpecialistId.toString());
//   }

//   // Add a slight delay to show the loading indicator before navigation
//   setTimeout(() => {
//     this.Sharedservice.hideLoading(); // Stop loading indicator
//     this.router.navigate(['/stepperpage'], { 
//       queryParams: { 
//         doctorId: selectedDoctorId, 
//         specialistId: selectedSpecialistId || '' // Pass specialistId as query param, if selected
//       }
//     });
//   }, 500); // Delay of 500ms for better user experience

//   return;
// }
//     // Convert location, specialists, and doctors into variables
//     const locationId = this.selectedLocation ? Number(this.selectedLocation) : undefined;
//     const specialistIds = this.selectedSpecialists.length ? this.selectedSpecialists : [];
//     const doctorIds = this.selectedDoctors.length ? this.selectedDoctors : [];
  
//     // Validate the search criteria
//     if (!locationId && specialistIds.length === 0 && doctorIds.length === 0) {
//       this.Sharedservice.hideLoading();
      
//       console.log('No valid search criteria provided.');
//       return;
//     }
  
//     console.log('Search Criteria:', { locationId, specialistIds, doctorIds });
  
//     // Call the API to fetch matching doctors
//     this.bookservice.getDoctorsByLocation(locationId, specialistIds, doctorIds).subscribe({
//       next: (response) => {
//         this.filteredDoctors = response.data || [];
//         this.Sharedservice.hideLoading();
  
//         if (this.filteredDoctors.length > 0) {
//           this.bookservice.setFilteredDoctors(this.filteredDoctors);
  
//           this.searchshared.setSearchData({
//             location: this.selectedLocation,
//             specialists: this.selectedSpecialists,
//             doctors: this.selectedDoctors,
//           });
  
//           this.router.navigate(['/searchdoctor']);
//         } else {
//           console.log('No doctors found.');
//         }
//       },
//       error: (error) => {
//         this.Sharedservice.hideLoading();
//         alert('No doctor found this specilist in thislocation! Please select other location near you');
//         console.error('Error fetching doctors:', error);
//       }
//     });
//   }
  
 
   // displayFilteredDoctors(): void {
  //   // Fetch filtered doctors from service
  //   this.filteredDoctors = this.bookservice.getFilteredDoctors()||[];
  //   this.searchPerformed = true;
    

  //   if (this.filteredDoctors.length > 0) {
  //     console.log('Filtered Doctors in search doctor list:', this.filteredDoctors);
  //   } else {
  //     console.log('No doctors found.');
  //   }

  //   if (this.specializations) {
  //     const specializationNames = this.selectedSpecialists.map((id) => {
  //       const spec = this.specializations.find((s: { id: number }) => s.id === Number(id));
  //       return spec ? spec.specializationName : '<unknown>';
  //     });
  //     console.log('Selected Specializations:', specializationNames);
  //   } else {
  //     console.error('Specializations are not loaded.');
  //   }
  // }
    // Navigate to the next page
    // this.router.navigate(['/stepperpage']).then(() => {
    //   document.body.scrollTop = 0;
    //   document.documentElement.scrollTop = 0;
    // });
  
 
  
  


