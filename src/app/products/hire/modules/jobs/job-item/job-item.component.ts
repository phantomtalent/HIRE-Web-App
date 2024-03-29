import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';

import { Job } from './../../../../../core/models/job';
import { JobService } from './../../../../../core/services/job.service';

@Component({
    selector: 'app-job-item',
    templateUrl: './job-item.component.html',
    styleUrls: ['./job-item.component.scss']
})
export class JobItemComponent implements OnInit {
    jobId: string;
    job: Job;
    contentLoading = true;
    editMode = false;

    constructor(private route: ActivatedRoute, private jobService: JobService, private router: Router) {
        let jobId = this.route.snapshot.paramMap.get('id');
        this.jobId = jobId;
        this.jobService.getJob(jobId).subscribe((job: Job) => {
            this.job = job;
            this.contentLoading = false;
            console.log('FROM ROUTE-------------------- JOB:', jobId, this.job);

            if (this.job && this.job.status && this.job.status === 'BUILD') {
                this.editMode = true;
            }
        });

        this.route.paramMap.subscribe((params: ParamMap) => {
            if (params.get('id') !== jobId) {
                this.contentLoading = true;
                jobId = params.get('id');
                this.jobService.getJob(jobId).subscribe((job: Job) => {
                    this.job = job;
                    this.contentLoading = false;
                    console.log('FROM CHANGE-------------------- JOB:', jobId, this.job);
                });
            }
        });

        this.route.queryParamMap.subscribe((params: ParamMap) => {
            // console.log('Query params change:', params);
            const editMode = this.route.snapshot.queryParamMap.get('editMode');
            if (editMode) {
                this.editMode = true;
            }
        });
    }

    ngOnInit() {}

    onSetEditMode(value) {
        // this.editMode = this.job.status === 'BUILD' ? false : value;
        this.editMode = value;
    }

    onJobUpdate() {
        this.jobService.getJob(this.jobId).subscribe((job: Job) => {
            this.job = job;
            this.contentLoading = false;
            console.log('FROM ROUTE-------------------- JOB:', this.jobId, this.job);

            if (this.job && this.job.status && this.job.status === 'BUILD') {
                this.editMode = true;
            }
        });
    }
}
