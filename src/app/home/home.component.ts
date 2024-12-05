import { Component, OnInit } from '@angular/core';
import { SharedDataServiceService } from '../Services/sevices/shared-data-service.service';


@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit {
  isLoading = false;
  constructor(private sharedservice:SharedDataServiceService){}
  ngOnInit() {
    this.sharedservice.loading$.subscribe((loading) => {
      this.isLoading = loading;
    });
  }
}
