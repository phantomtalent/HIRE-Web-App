import { HttpClient } from '@angular/common/http';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { select, Store } from '@ngrx/store';
import { Message } from 'primeng/components/common/api';
import { User } from './../../../../../../core/models/user';

import * as fromStore from '../../../../../../store';
import * as fromSelectors from '../../../../../../store/selectors';
import { FormHelperService } from './../../../../../../core/services/form-helper.service';
import { GeoService } from './../../../../../../core/services/geo.service';
import { RecruiterService } from './../../../../../../core/services/recruiter.service';

@Component({
    selector: 'app-company-details',
    templateUrl: './company-details.component.html',
    styleUrls: ['./company-details.component.scss']
})
export class CompanyDetailsComponent implements OnInit {
    form: FormGroup;
    countryTypeOptions = [];
    initialCountry = 'za';
    contentLoading = true;
    user: User;
    msgs: Message[] = [];
    @ViewChild('phone') el: ElementRef;
    constructor(
        private fb: FormBuilder,
        private formHelper: FormHelperService,
        private http: HttpClient,
        private router: Router,
        private geoService: GeoService,
        private recruiterService: RecruiterService,
        private store: Store<fromStore.State>
    ) {
        this.countryTypeOptions = this.geoService.countriesList();
        this.initForm();

        this.recruiterService.getOnboarding().subscribe((data: any) => {
            this.contentLoading = false;
            if (data && data.companyDetails) {
                this.populateForm(data.companyDetails);
            }
        });
        this.store.pipe(select(fromSelectors.getUserEntity)).subscribe((user: User) => {
            this.user = user;
            if (
                this.user &&
                this.form &&
                this.form.get('companyDetails') &&
                this.form.get('companyDetails').get('email')
            ) {
                this.form
                    .get('companyDetails')
                    .get('email')
                    .patchValue(this.user.email);
            }
        });
    }

    ngOnInit() {}

    initForm() {
        this.form = this.fb.group({
            companyDetails: this.fb.group({
                name: ['', Validators.required],
                reg_num: ['', Validators.required],
                phone: ['', Validators.required],
                email: ['', [Validators.required, Validators.email]]
            }),
            address: this.fb.group({
                address_line_1: ['', Validators.required],
                address_line_2: [''],
                city: [''],
                state: ['', Validators.required],
                zip: ['', Validators.required],
                country: ['', Validators.required]
            }),
            primaryContact: this.fb.group({
                first_name: ['', Validators.required],
                last_name: ['', Validators.required],
                phone: ['', Validators.required],
                email: ['', Validators.required]
            })
        });
        this.form
            .get('companyDetails')
            .get('email')
            .disable();
    }

    populateForm(data) {
        this.form.patchValue(data);
    }

    get companyDetails() {
        return this.form.controls['companyDetails'];
    }

    get address() {
        return this.form.controls['address'];
    }

    get primaryContact() {
        return this.form.controls['primaryContact'];
    }

    onSaveClick(event) {
        event.preventDefault();
        const formValue = this.form.getRawValue();
        console.log('Save Form', formValue);
        this.recruiterService.onboardingStepSave({
            stepName: 'companyDetails',
            value: formValue
        });
    }

    onNextClick(event) {
        event.preventDefault();
        const form = this.form;
        if (!form.valid) {
            this.formHelper.markFormGroupTouched(form);
            console.log('FORM IS INVALID:', form.value);
            return;
        }

        const formValue = this.form.getRawValue();
        console.log('FORM IS VALID', formValue);

        console.log(JSON.stringify(formValue));
        this.recruiterService.onboardingStepCompleted({
            step: 'company-details',
            stepName: 'companyDetails',
            value: formValue
        });
    }
}
