import { TestBed } from '@angular/core/testing';

import { VehicleLocationService } from './vehicle-location.service';

describe('VehicleLocationService', () => {
  let service: VehicleLocationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(VehicleLocationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
