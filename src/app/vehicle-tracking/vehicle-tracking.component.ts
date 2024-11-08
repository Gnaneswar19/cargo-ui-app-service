import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { VehicleLocationService } from '../vehicle-location.service';
import * as L from 'leaflet';
import { forkJoin, Subscription } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { AddressLookupService } from '../address-lookup.service';
import { VehicleTrackerService } from '../vehicle-tracker-service.service';

export interface Vehicle {
  number: string;
  name: string;
  status: string;
  lastUpdated: Date;
  latitude: number;
  longitude: number;
  address?: string;
  vehicleNo: string;
  cargoId: string;
  updatedDate: Date;
  speed: number;
}

@Component({
  selector: 'app-vehicle-tracking',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './vehicle-tracking.component.html',
  styleUrls: ['./vehicle-tracking.component.css']
})
export class VehicleTrackingComponent implements OnInit, OnDestroy {
  private map!: L.Map;
  private markers: Map<string, L.Marker> = new Map();
  private locationSubscription?: Subscription;

  sidebarClosed = false;
  searchTerm = '';
  selectedVehicle: Vehicle | null = null;
  filteredVehicles: Vehicle[] = [];
  vehicles: Vehicle[] = [];
  statuses = [
    { label: 'Total Vehicles', count: 6, iconClass: 'total' },
    { label: 'Moving Vehicles', count: 3, iconClass: 'moving' },
    { label: 'Parked Vehicles', count: 1, iconClass: 'parked' },
    { label: 'Idle Vehicles', count: 2, iconClass: 'idle' }
  ];

  constructor(
    private vehicleLocationService: VehicleLocationService,
    private addressLookupService: AddressLookupService,
    private vehicleTrackerService: VehicleTrackerService
  ) {}

  ngOnInit(): void {
    this.initMap();
    this.loadVehicles();
  }

  ngOnDestroy(): void {
    this.locationSubscription?.unsubscribe();
  }

  private loadVehicles(): void {
    this.vehicleTrackerService.getVehicleTrackingInfo().subscribe(response => {
      const latestVehicles = this.getLatestVehicleRecords(response);
      this.vehicles = latestVehicles;
      this.filteredVehicles = [...latestVehicles];
      this.initializeVehiclesWithAddresses();

      const lastEntry = latestVehicles[latestVehicles.length - 1];
      if (lastEntry) {
        const lastUpdatedDate = new Date(lastEntry.updatedDate);
        this.fetchAndStoreLatestTrackerDetails(lastUpdatedDate);
        console.log('lastUpdatedDate:',lastUpdatedDate)
      }
    });
  }

  private fetchAndStoreLatestTrackerDetails(lastUpdatedDate: Date) {
    // Format the date as ISO string while retaining the local time zone
    const lastUpdatedDateString = lastUpdatedDate.getFullYear() + '-' +
                                  String(lastUpdatedDate.getMonth() + 1).padStart(2, '0') + '-' +
                                  String(lastUpdatedDate.getDate()).padStart(2, '0') + 'T' +
                                  String(lastUpdatedDate.getHours()).padStart(2, '0') + ':' +
                                  String(lastUpdatedDate.getMinutes()).padStart(2, '0') + ':' +
                                  String(lastUpdatedDate.getSeconds()).padStart(2, '0');
  
    console.log('Last Updated Date (Local Time):', lastUpdatedDateString);
  
    // Call the API with the correctly formatted timestamp
    this.vehicleTrackerService.getLatestTrackerDetails(lastUpdatedDateString)
      .subscribe(response => {
        console.log('Latest Tracker Details:', response);
        localStorage.setItem('latestTrackerDetails', JSON.stringify(response));
      });
  }
  
  

  private getLatestVehicleRecords(vehicleData: Vehicle[]): Vehicle[] {
    const vehicleMap = new Map<string, Vehicle>();

    vehicleData.forEach((vehicle: Vehicle) => {
      const existingVehicle = vehicleMap.get(vehicle.vehicleNo);
      if (!existingVehicle || new Date(vehicle.updatedDate) > new Date(existingVehicle.updatedDate)) {
        vehicleMap.set(vehicle.vehicleNo, vehicle);
      }
    });

    return Array.from(vehicleMap.values());
  }

  private initializeVehiclesWithAddresses(): void {
    const addressRequests = this.vehicles.map(vehicle =>
      this.addressLookupService.getAddress(vehicle.latitude, vehicle.longitude)
    );

    forkJoin(addressRequests).subscribe(addresses => {
      this.vehicles.forEach((vehicle, index) => {
        vehicle.address = addresses[index];
      });
      this.filteredVehicles = [...this.vehicles];
      this.initializeMarkers();
    });
  }

  private initMap(): void {
    this.map = L.map('map').setView([-30.5595, 22.9375], 13);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 18,
      attribution: '© OpenStreetMap contributors',
    }).addTo(this.map);
  }

  private initializeMarkers(): void {
    this.vehicles.forEach(vehicle => {
      const marker = this.createMarker(vehicle);
      this.markers.set(vehicle.vehicleNo, marker);
    });
  }

  private createMarker(vehicle: Vehicle): L.Marker {
    const icon = L.icon({
      iconUrl: '../../assets/suv.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
    });

    const marker = L.marker([vehicle.latitude, vehicle.longitude], { icon })
      .bindPopup(`
        <div class="marker-popup">
          <p>VehicleNo: ${vehicle.vehicleNo}</p>
          <p>Status: ${vehicle.status}</p>
          <p>VehicleSpeed: ${vehicle.speed}</p>
          <p>Updated: ${new Date(vehicle.updatedDate).toLocaleString()}</p>
        </div>
      `)
      .addTo(this.map);

    marker.on('click', () => (this.selectedVehicle = vehicle));
    return marker;
  }

  searchVehicles(): void {
    const term = this.searchTerm.toLowerCase().trim();

    this.filteredVehicles = this.vehicles.filter(vehicle => {
      const vehicleNoMatches = vehicle.vehicleNo.toLowerCase().includes(term);
      const cargoIdMatches = vehicle.cargoId.toString().includes(term);
      return vehicleNoMatches || cargoIdMatches;
    });
  }

  showVehicleLocation(vehicle: Vehicle): void {
    this.selectedVehicle = vehicle;
    this.map.setView([vehicle.latitude, vehicle.longitude], 13);

    this.markers.forEach(marker => marker.closePopup());
    const marker = this.markers.get(vehicle.vehicleNo);
    if (marker) {
      marker.openPopup();
    }
  }

  toggleSidebar(): void {
    this.sidebarClosed = !this.sidebarClosed;
  }
}
