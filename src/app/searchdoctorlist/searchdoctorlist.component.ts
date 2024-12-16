import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BookServiceService } from '../Services/Appointment/book-service.service';
import { SharedDataServiceService } from '../Services/sevices/shared-data-service.service';
import { UserServiceService } from '../Services/User/user-service.service';
import { event } from 'jquery';
import { SearchSharedServiceService } from '../Services/SearchShared/search-shared-service.service';
import { DoctorServiceService } from '../Services/Doctor/doctor-service.service';




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

  constructor(private doctorservice:DoctorServiceService, private searchshared:SearchSharedServiceService, private userservice:UserServiceService, private bookservice:BookServiceService, private route:ActivatedRoute, private Sharedservice:SharedDataServiceService, private router:Router){}
  ngOnInit(): void {
    // Load specialists and doctors asynchronously
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
        console.log('Location List:', this.location);
        console.log('Combined List:', this.combinedList);
      }
      // Proceed to display the filtered doctors
      this.displayFilteredDoctors();
      
    });
  
    // Now load locations
    // this.loadLocation({term: 'Noida', items: []});
  }

  // getSelectedItemsDisplay(): string {
  //   const specialistNames = this.selectedSpecialists.map((id) => `Specialist ${id}`).join(', ');
  //   const doctorNames = this.selectedDoctors.map((id) => `Doctor ${id}`).join(', ');
  
  //   return [specialistNames, doctorNames].filter(Boolean).join(' | ');
  // }
  displayFilteredDoctors(): void {
    // Fetch filtered doctors from service
    this.filteredDoctors = this.bookservice.getFilteredDoctors()||[];
    this.searchPerformed = true;
    

    if (this.filteredDoctors.length > 0) {
      console.log('Filtered Doctors in search doctor list:', this.filteredDoctors);
    } else {
      console.log('No doctors found.');
    }

    if (this.specializations) {
      const specializationNames = this.selectedSpecialists.map((id) => {
        const spec = this.specializations.find((s: { id: number }) => s.id === Number(id));
        return spec ? spec.specializationName : '<unknown>';
      });
      console.log('Selected Specializations:', specializationNames);
    } else {
      console.error('Specializations are not loaded.');
    }
  }
  onAppointmentClick(doctorId: number, specializationId: number): void {
    console.log('Selected Doctor ID:', doctorId);
    console.log('Selected Specialist ID:', specializationId);
  
    // Set both IDs in the shared service
    this.Sharedservice.setDoctorId(doctorId.toString()); 
    this.Sharedservice.setSpecialistId(specializationId.toString()); // Set specialistId
  
    // Navigate to the next page
    // this.router.navigate(['/stepperpage']).then(() => {
    //   document.body.scrollTop = 0;
    //   document.documentElement.scrollTop = 0;
    // });
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
  onSearchClick(): void {
    this.Sharedservice.showLoading();
  
    // Ensure at least one selection is made
    if (this.selectedSpecialists.length === 0 && this.selectedDoctors.length === 0) {
      this.isSelectionValid = false;
      this.Sharedservice.hideLoading();
      return;
    } else {
      this.isSelectionValid = true;
    }
  
    // Convert selectedLocation to a number or keep it undefined if not selected
    const locationId: number | undefined = this.selectedLocation ? Number(this.selectedLocation) : undefined;
    
    // Pass the entire arrays of selected specialists and doctors
    const specialistIds: number[] | undefined = this.selectedSpecialists.length ? this.selectedSpecialists : [];
    const doctorIds: number[] | undefined = this.selectedDoctors.length ? this.selectedDoctors : [];
  
    console.log('Selected Location ID:', locationId);
    console.log('Selected Specialist IDs:', specialistIds);
    console.log('Selected Doctor IDs:', doctorIds);
  
    // this.searchShared.setSearchCriteria(locationId, specialistIds, doctorIds);
   
    this.bookservice.getDoctorsByLocation(locationId, specialistIds, doctorIds).subscribe({
      next: (response) => {
        this.filteredDoctors = response.data || response || [];
        this.Sharedservice.hideLoading();
  
        if (this.filteredDoctors.length > 0) {
          this.bookservice.setFilteredDoctors(this.filteredDoctors);
         
          this.router.navigate(['/searchdoctor'], {
            queryParams: {
              location: this.selectedLocation,
              specialists: JSON.stringify(this.selectedSpecialists),
              doctors: JSON.stringify(this.selectedDoctors),
            },
          });
        } else {
          console.log('No doctors found.');
        }
      },
      error: (error) => {
        this.router.navigate(['/searchdoctor']);
        this.Sharedservice.hideLoading();
        console.error('Error fetching doctors:', error);
      }
    });
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
  
  
}

