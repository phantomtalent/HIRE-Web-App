import { User } from './../../models/user';
import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { SelectItem } from 'primeng/api';

import { Job } from './../../models/job';
import { JobService } from './../../services/job.service';
import { ConditionalValidator } from './../../validators/conditional.validator';
import { GooglePlaceDirective } from 'ngx-google-places-autocomplete';



@Component({
    selector: 'app-job-item',
    templateUrl: './job-item.component.html',
    styleUrls: ['./job-item.component.scss']
})
export class JobItemComponent implements OnInit {
    job: Job;
    contentLoading = true;

    constructor(
        private route: ActivatedRoute,
        private jobService: JobService,
        private router: Router
    ) {
        let jobId = this.route.snapshot.paramMap.get('id');
        this.jobService.getJob(jobId)
            .subscribe((job: Job) => {
                this.job = job;
                setTimeout(() => this.contentLoading = false, 200);
                console.log('FROM ROUTE-------------------- JOB:', jobId, this.job);

            });


        this.route.paramMap.subscribe((params: ParamMap) => {
            if (params.get('id') !== jobId) {
                this.contentLoading = true;
                jobId = params.get('id');
                this.jobService.getJob(jobId)
                    .subscribe((job: Job) => {
                        this.job = job;
                        setTimeout(() => this.contentLoading = false, 200);
                        console.log('FROM CHANGE-------------------- JOB:', jobId, this.job);
                    });
            }
        });
    }

    ngOnInit() {

    }
}
