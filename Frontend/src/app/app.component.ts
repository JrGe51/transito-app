import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { RouterModule } from '@angular/router';
import { SpinnerComponent } from './shared/spinner/spinner.component';
import { LoadingService } from './servicios/loading.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterModule, SpinnerComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'departament-transit';
  loading: boolean = false;

  constructor(private loadingService: LoadingService) {
    this.loadingService.loading$.subscribe((state: boolean) => {
      this.loading = state;
    });
  }
}
