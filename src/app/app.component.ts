import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { VehicleLocationService } from './vehicle-location.service';
import { VehicleTrackingComponent } from './vehicle-tracking/vehicle-tracking.component';
import { NavbarComponent } from './navbar/navbar.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet,VehicleTrackingComponent,NavbarComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'cargoo';
}
