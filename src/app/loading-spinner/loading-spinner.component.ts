import { Component, OnInit } from '@angular/core';
import { SharedDataServiceService } from '../Services/sevices/shared-data-service.service';

@Component({
  selector: 'app-loading-spinner',
  templateUrl: './loading-spinner.component.html',
  styleUrl: './loading-spinner.component.css'
})
export class LoadingSpinnerComponent implements OnInit  {
  isLoading = false;
  constructor(private sharedservice:SharedDataServiceService){}
  ngOnInit() {
    this.sharedservice.loading$.subscribe((loading) => {
      this.isLoading = loading;
    });
  }
}
