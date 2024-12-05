import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SearchSharedServiceService {
  private searchData: any = {};

  setSearchData(data: any): void {
    this.searchData = data;
  }

  getSearchData(): any {
    return this.searchData;
  }
}
