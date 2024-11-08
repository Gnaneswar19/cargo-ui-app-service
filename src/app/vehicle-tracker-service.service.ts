import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class VehicleTrackerService {
  private apiUrl = 'http://34.131.193.186:8081/api/tracker-monitor-service';
  private latestTrackerUrl = 'http://34.131.193.186:8081/api/tracker-monitor-service/latest-tracker-details';

  constructor(private http: HttpClient) {}

  getVehicleTrackingInfo(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}`);
  }

  getLatestTrackerDetails(lastTimeStamp: string): Observable<any> {
    const params = new HttpParams().set('lastTimeStamp', lastTimeStamp);
    return this.http.get<any>(this.latestTrackerUrl, { params });
  }
}
