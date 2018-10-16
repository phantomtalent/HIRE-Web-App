import { UtilitiesService } from './../../services/utilities.service';
import { FormHelperService } from './../../services/form-helper.service';
import { Router, ActivatedRoute } from '@angular/router';
import { JobService } from './../../services/job.service';
import { FormGroup, FormBuilder } from '@angular/forms';
import { HttpResponse } from '@angular/common/http';
import { Component, OnInit, Output, Input, EventEmitter } from '@angular/core';

@Component({
    selector: 'app-job-item-new',
    templateUrl: './job-item-new.component.html',
    styleUrls: ['./job-item-new.component.scss']
})
export class JobItemNewComponent implements OnInit {
    @Output() finishedJobUpload = new EventEmitter<boolean>();
    @Input()
    set droppedFiles(files: File[]) {
        if (files) {
            this.processFiles(files);
        }
    }
    contentLoading = false;
    form: FormGroup;
    uploadQueue: any[] = [];
    uploadError: string;
    supportedFileTypes: string[];

    constructor(
        private jobService: JobService,
        private router: Router,
        private route: ActivatedRoute,
        private fb: FormBuilder,
        private formHelper: FormHelperService,
        private utilities: UtilitiesService
    ) {
        this.supportedFileTypes = [
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'application/vnd.oasis.opendocument.text',
            'text/rtf'
        ];
    }

    ngOnInit() {
        this.form = this.fb.group({
            file: ['']
        });
    }

    onFinishClicked(event) {
        event.preventDefault();
        this.uploadQueue = [];
        this.finishedJobUpload.next(true);
    }

    processFiles(files) {
        for (let i = 0, file; file = files[i]; i++) {
            console.log(file);
            if (this.validateFileType(file, this.supportedFileTypes)) {
                // ADD TO THE QUEUE
                console.log('We need to upload that file 🎈');
                this.uploadQueue.push({
                    file: file,
                    uploadStarted: false,
                    uploadFinished: false,
                    progress: 0,
                    success: false,
                    text: file.name
                });
                this.processQueue();
            } else {
                this.uploadError = 'Only supported formats are: pdf, doc, docx, rtf, odt';
                setTimeout(() => this.uploadError = null, 10000);
            }
        }
    }

    onDropFile(event) {
        const files = event.target.files || event.dataTransfer.files;
        console.log('📥 onDropFile', files);
        this.processFiles(files);
    }

    private validateFileType(file: File, types: string[]) {
        return types.indexOf(file.type) !== -1;
    }

    processQueue() {
        this.uploadQueue.forEach(item => {
            if (!item.uploadStarted && !item.uploadFinished) {
                this.uploadFile(item);
            }
        });
    }

    uploadFile(item) {
        this.utilities.readFile(item.file)
            .then(fileValue => {
                item.uploadStarted = true;
                const uploadProgressInterval = setInterval(() => {
                    item.progress = (item.progress + 1 < 97) ? item.progress + 1 : 90;
                }, 200);
                this.jobService.createJobFromCv({ file: fileValue })
                    .subscribe((response: HttpResponse<any>) => {
                        console.log('📬 Uploaded:', response);
                        const resp: any = response;
                        item.text = resp.job.title;
                        item.progress = 100;
                        item.uploadFinished = true;
                        item.success = true;
                        clearInterval(uploadProgressInterval);
                    }, error => {
                        console.error(error);
                        item.text = error && error.error && error.error.message ? error.error.error.message : 'Error';
                        item.progress = 100;
                        item.uploadFinished = true;
                        clearInterval(uploadProgressInterval);
                    });
            })
            .catch(error => {
                console.error(error);
                console.error('Error reading uploaded file');
            });
    }

}