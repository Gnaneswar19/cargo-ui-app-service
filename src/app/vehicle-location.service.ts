
// vehicle-location.service.ts
import { Injectable } from '@angular/core';
import { Observable, interval } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
    providedIn: 'root'
})
export class VehicleLocationService {
    private baseLatitude = 16.544489;
    private baseLongitude = 81.518956;

    constructor() {}

    getLocationUpdates(): Observable<{ latitude: number; longitude: number }> {
        return interval(5000).pipe(
            map(() => {
                // Simulate vehicle movement by adding small random changes to coordinates
                const latitude = this.baseLatitude + (Math.random() - 0.5) * 0.002;
                const longitude = this.baseLongitude + (Math.random() - 0.5) * 0.002;
                
                return {
                    latitude,
                    longitude
                };
            })
        );
    }

    // You can add more methods here for actual API integration
    // For example:
    // getVehicleList(): Observable<Vehicle[]>
    // getVehicleDetails(vehicleId: string): Observable<Vehicle>
    // updateVehicleLocation(vehicleId: string, location: {latitude: number, longitude: number}): Observable<void>
}