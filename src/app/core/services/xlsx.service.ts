import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { JobCatalogue } from './../models/job_catalogue';

import { environment } from '@env/environment';
import { AuthService } from './../../modules/auth/auth.service';
import { UtilitiesService } from './utilities.service';
// import * as firebase from 'firebase/app';

@Injectable({
    providedIn: 'root'
})
export class XLSXService {
    apiURL: string = environment.apiUrl;
    tenantId = 'undefined';
    baseURL = '';

    constructor(private http: HttpClient, private authService: AuthService, private utilities: UtilitiesService) {
        this.tenantId = this.utilities.getTenant();
        this.baseURL = `${this.apiURL}/tenants/${this.tenantId}`;
    }

    create(data: any) {
        return this.http.post(`https://us-central1-hire-by-hellocrowd.cloudfunctions.net/api/job_catalogue`, data);
    }
}
