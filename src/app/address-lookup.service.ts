// address.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

interface NominatimResponse {
    display_name: string;
    address: {
        road?: string;
        city?: string;
        state?: string;
        country?: string;
        postcode?: string;
    };
}

@Injectable({
    providedIn: 'root'
})
export class AddressLookupService {
    private nominatimBaseUrl = 'https://nominatim.openstreetmap.org/reverse';

    constructor(private http: HttpClient) {}

    getAddress(latitude: number, longitude: number): Observable<string> {
        const url = `${this.nominatimBaseUrl}?format=json&lat=${latitude}&lon=${longitude}`;

        return this.http.get<NominatimResponse>(url).pipe(
            map(response => this.formatAddress(response)),
            catchError(() => of('Address not found'))
        );
    }

    private formatAddress(response: NominatimResponse): string {
        const { road, city, state, country, postcode } = response.address;
        
        const addressParts = [
            road || '',
            city || '',
            state || '',
            country || '',
            postcode || ''
        ].filter(part => part.trim() !== '');

        return addressParts.join(', ');
    }
}
