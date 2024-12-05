import { TestBed } from '@angular/core/testing';

import { SearchSharedServiceService } from './search-shared-service.service';

describe('SearchSharedServiceService', () => {
  let service: SearchSharedServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SearchSharedServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
