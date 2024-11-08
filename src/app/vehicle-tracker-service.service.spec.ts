import { TestBed } from '@angular/core/testing';

import { VehicleTrackerService} from './vehicle-tracker-service.service';

describe('VehicleTrackerServiceService', () => {
  let service: VehicleTrackerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(VehicleTrackerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
