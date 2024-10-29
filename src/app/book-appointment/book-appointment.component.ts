
import { Component,OnInit } from '@angular/core';
import { FormControl, FormGroup,Validators } from '@angular/forms';
import { BookServiceService } from '../Services/Appointment/book-service.service';
import { UserServiceService } from '../Services/User/user-service.service';
import { AuthService } from '../auth.service';
import { Observable, Subject } from 'rxjs';
import { debounceTime,distinctUntilChanged,switchMap } from 'rxjs';

@Component({
  selector: 'app-book-appointment',
  templateUrl: './book-appointment.component.html',
  styleUrls: ['./book-appointment.component.css']
})
export class BookAppointmentComponent implements OnInit {
  bookappoinment : FormGroup;
  isFormSubmitted:boolean = false;
  errorMessage: string="";
  username: any;
  selectedSpecialist: number[]=[];
  selectedDoctor: number[]=[];
  combinedList: any[] = [];
  timeSlots:string[]=[];
  message:boolean=false;
  searchInput = new Subject<string>(); // Subject for typeahead
  filteredList: any[] = []; // Filtered list to show in ng-select

  constructor(private authservice:AuthService, private bookService:BookServiceService,private userservice:UserServiceService)
  {
    this.bookappoinment = new FormGroup({
      name : new FormControl("",[Validators.required]),
      email : new FormControl("",[Validators.required,Validators.email]),
      dateOfBirth: new FormControl(""),
      gender:new FormControl("Male"),
      phoneNumber: new FormControl(""),
      preferedDate: new FormControl("",[Validators.required]),
      preferedTime:new FormControl("8:00 to 9:00"),
    
    })
  }
  
 ngOnInit(): void {
     this.loadSpecialistsAndDoctors();
     this.username=this.userservice.getUserName();
       this.generateTimeSlots();

        // Initialize filteredList as empty
  this.filteredList = [];

      // Setup typeahead search
    this.searchInput.pipe(
      debounceTime(300), // Add delay to prevent too many requests
      distinctUntilChanged(), // Ignore if the same input
      switchMap(term => this.searchDoctorsAndSpecialists(term)) // Switch to search term
    ).subscribe(results => {
      this.filteredList = results;
    }); 
  }
  
  // Typeahead search function
  searchDoctorsAndSpecialists(term: string): Observable<any[]> {
   // Only search if the term length is 3 or more characters
  if (term.length < 3) {
    return new Observable(observer => observer.next([])); // Return empty list if input is less than 3 characters
  }
    return new Observable(observer => {
      const results = this.combinedList.filter(item =>
        item.name.toLowerCase().includes(term.toLowerCase()) // Filter based on input
      );
      observer.next(results);
    });
  }
  // This method will trigger when the user starts typing in the dropdown
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

generateTimeSlots(): void {
  const startHour = 10; // Starting hour (8 AM)
  const endHour = 18; // Ending hour (5 PM)
  //const interval = 1; // Interval in hours

  for (let hour = startHour; hour <= endHour; hour++) {
    const hourAmPm = hour % 24 === 0 ? 24 : hour % 24; // Convert to 12-hour format
    const amPm1 = hour < 12 ? 'AM' : 'PM'; // Determine AM or PM
    const amPm2 = (hour + 1) % 12 === 0 ? 'PM' : hour + 1 < 12 ? 'AM' : 'PM'; // Next hour AM/PM

    this.timeSlots.push(`${this.pad(hourAmPm)}:00 ${amPm1} to ${this.pad(hourAmPm)}:30 ${amPm1}`);
    this.timeSlots.push(`${this.pad(hourAmPm)}:30 ${amPm1} to ${this.pad((hour + 1) % 12 === 0 ? 12 : (hour + 1))}:00 ${amPm2}`);
  }
}

pad(num: number): string {
  return num < 10 ? '0' + num : num.toString();
}

 onSubmit(){
  const isformvalid=this.bookappoinment.valid;
  this.isFormSubmitted=true;
   if(this.bookappoinment.valid){
    const formValue= this.bookappoinment.value;

    const book={
      name:formValue.name,
      email:formValue.email,
      gender:formValue.gender,
      phone:formValue.phoneNumber,
      dateofbirth:formValue.dateOfBirth,
      preferreddate:formValue.preferedDate,
      preferredtime:formValue.preferedTime,
      Specialization: this.selectedSpecialist.length > 0 ? this.selectedSpecialist : null,
      Doctor: this.selectedDoctor.length > 0 ? this.selectedDoctor : null,
  };

    console.log('Booking data being sent:', JSON.stringify(book));
    console.log('Booking data:', book); // Debugging log
    this.bookService.bookappointment(book).subscribe({
      next:(response)=>{
        //alert('Booking succefully');
         this.message=true;
         // Capture the booking ID from the response
         const bookingId = response.bookingId; // Get the booking ID from the response
         console.log('Booking ID:', bookingId); // Log the booking ID to the console
        //reset the form after succesfully submit
        this.bookappoinment.reset();

       // after submit the form value are reset mode
         this.bookappoinment.patchValue({gender:"male",preferredtime:"8:00 to 9:00"});
         this.isFormSubmitted=false;
        this.errorMessage='';//clear any error message
      },
      error:(error)=>{
        console.log('Error:', error);
        alert(`Booking failed: ${error.message}`);
      }
    });
  }  
  else
  {
    alert('form is not valid');
   }
  }
  getData(event:any){
    const selectedValue=event.target.value;
    this.bookappoinment.patchValue({appointmentFor:selectedValue});
    console.log(event.target.value)
  }
  
}
