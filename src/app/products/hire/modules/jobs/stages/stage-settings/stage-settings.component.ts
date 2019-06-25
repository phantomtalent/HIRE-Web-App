import { Component, OnInit, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Slider } from 'primeng/slider';
import { Questionnaire } from './../../../../../../core/models/questionnaire';
import { QuestionnaireService } from './../../../../../../core/services/questionnaire.service';

import { UtilitiesService } from '@app/core/services';
import { Job } from '../../../../../../core/models/job';
import { Stage } from '../../../../../../core/models/stage';
import { FormHelperService } from './../../../../../../core/services/form-helper.service';
import { JobService } from './../../../../../../core/services/job.service';

@Component({
    selector: 'app-stage-settings',
    templateUrl: './stage-settings.component.html',
    styleUrls: ['./stage-settings.component.scss']
})
export class StageSettingsComponent implements OnInit {
    @ViewChild('hcSlider') hcSlider: Slider;
    contentLoading = false;
    stage: Stage;
    jobId: string;
    job: Job;
    stageId: string;
    titleMaxLength: 30;
    stageSettingsForm: FormGroup;
    questionnaireList: Questionnaire[] = [];
    questionnaireOptions = [];
    allowanceOptions = [
        { label: '1 day', value: 1 },
        { label: '2 days', value: 2 },
        { label: '3 days', value: 3 },
        { label: '7 days', value: 7 },
        { label: '14 days', value: 14 },
        { label: '30 days', value: 30 }
    ];
    assessmentTypeOptions = [
        { label: 'Personality Assessment', value: 'personality' },
        { label: 'One Way Video Interview', value: 'video-interview' }
    ];

    assessmentBenchmarkOptions = [{ label: 'Systems Engineer (JF5593)', value: 'system_engeneer' }];
    baseUrl: string;

    constructor(
        private jobService: JobService,
        private router: Router,
        private route: ActivatedRoute,
        private fb: FormBuilder,
        private formHelper: FormHelperService,
        private questionnaireService: QuestionnaireService,
        private utilities: UtilitiesService
    ) {
        this.baseUrl = this.utilities.getHireBaseUrl();
        this.jobId = this.route.snapshot.paramMap.get('id');
        this.stageId = this.route.snapshot.paramMap.get('stageId');
        this.contentLoading = true;

        this.jobService.getJob(this.jobId).subscribe((job: Job) => (this.job = job));
        this.jobService.getStage(this.jobId, this.stageId).subscribe(
            (stage: Stage) => {
                this.contentLoading = false;
                this.stage = stage;
                console.log(this.stage);
                if (this.stage.id === 'applied') {
                    this.stageSettingsForm = this.fb.group({
                        resume_matching_threshold: [this.stage.resume_matching_threshold],
                        automatically_progress_matching_threshold: [
                            this.stage.automatically_progress_matching_threshold
                        ]
                    });

                    setTimeout(() => {
                        this.onHcSliderChange();
                    }, 100);
                } else {
                    const actions = [];
                    if (this.stage.actions && this.stage.actions.length) {
                        this.stage.actions.forEach((a) => {
                            actions.push(this.createActionItem(a.type, a.options || null));
                        });
                    }
                    this.stageSettingsForm = this.fb.group({
                        title: [this.stage.title, Validators.required],
                        assessment: this.fb.array([]),
                        acceptance_criteria: [this.stage.acceptance_criteria],
                        automatically_progress_meeting_criteria: [
                            this.stage.automatically_progress_meeting_criteria || false
                        ],
                        actions: this.fb.array(actions)
                    });
                    this.stage.assessment ? this.populateAssessment(this.stage.assessment) : this.addAssessmentGroup();
                    this.questionnaireService.getAll().subscribe(
                        (response: Questionnaire[]) => {
                            this.contentLoading = false;
                            if (response) {
                                const options = [];
                                this.questionnaireList = response.filter((q) => q.type === 'video');
                                this.questionnaireList.forEach((q) => {
                                    options.push({
                                        value: q.id,
                                        label: q.title
                                    });
                                });
                                this.questionnaireOptions = options;
                            }
                        },
                        (error) => console.error(error)
                    );

                    setTimeout(() => {
                        this.onHcSliderChange();
                    }, 100);
                }
            },
            (error) => {
                this.contentLoading = false;
                console.log(error);
                this.router.navigateByUrl(`${this.baseUrl}/jobs/${this.jobId}`);
            }
        );
    }

    ngOnInit() {
        this.stageSettingsForm = this.fb.group({
            resume_matching_threshold: [60],
            automatically_progress_matching_threshold: [true]
        });
    }

    onHcSliderChange() {
        const value =
            this.stage.id === 'applied'
                ? this.stageSettingsForm.get('resume_matching_threshold').value
                : this.stageSettingsForm.get('acceptance_criteria').value;
        if (this.hcSlider) {
            const handler = this.hcSlider.el.nativeElement.children[0].children[1];
            if (handler) {
                handler.innerHTML = value;
            }
        }
    }

    onSave() {
        const form = this.stageSettingsForm;
        if (!form.valid) {
            this.formHelper.markFormGroupTouched(form);
            console.log('FORM IS INVALID:', form, form.value);
            return;
        }
        // VALID
        console.log('FORM IS VALID:', form.value);
        this.contentLoading = true;
        this.jobService.updateStage(this.jobId, this.stageId, form.value).subscribe(
            () => {
                this.contentLoading = false;
            },
            (error) => {
                console.log(error);
                this.contentLoading = false;
            }
        );
    }

    onDelete() {
        console.log('onDelete');
        this.contentLoading = true;
        this.jobService.removeStage(this.jobId, this.stageId).subscribe(
            () => {
                this.contentLoading = false;
                this.router.navigateByUrl(`${this.baseUrl}/jobs/${this.jobId}`);
            },
            (error) => {
                console.log(error);
                this.contentLoading = false;
            }
        );
    }

    get actions(): FormArray {
        return this.stageSettingsForm && (this.stageSettingsForm.controls.actions as FormArray);
    }

    createActionItem(type, dataOptions): FormGroup {
        let options;
        if (type === 'spark-hire-video') {
            options = {
                questionnaire_id: [(dataOptions && dataOptions.questionnaire_id) || '', Validators.required],
                send_reminder: [(dataOptions && dataOptions.send_reminder) || true],
                time_allowance: [(dataOptions && dataOptions.time_allowance) || 30]
            };
        }
        return this.fb.group({
            type: [type],
            options: this.fb.group(options || null)
        });
    }

    onActionToggle(type: string) {
        const selected = this.isActionSelected(type);
        if (selected) {
            this.actions.removeAt(this.actions.value.findIndex((a) => a.type === type));
        } else {
            this.actions.push(this.createActionItem(type, null));
        }
    }

    onDeleteAction(type: string) {
        this.actions.removeAt(this.actions.value.findIndex((a) => a.type === type));
    }

    isActionSelected(type: string) {
        const formValue = this.stageSettingsForm.value;
        const actions = formValue.actions.map((a) => a.type);
        return actions.indexOf(type) !== -1 ? true : false;
    }

    onBackClick() {
        this.router.navigateByUrl(`${this.baseUrl}/jobs/${this.jobId}`);
    }

    get assessment(): FormArray {
        return this.stageSettingsForm && (this.stageSettingsForm.controls['assessment'] as FormArray);
    }

    addAssessmentGroup() {
        this.assessment.push(
            this.fb.group({
                type: ['', Validators.required],
                option: ['', Validators.required]
            })
        );
    }

    populateAssessment(assessment) {
        assessment.forEach((c) => {
            this.assessment.push(
                this.fb.group({
                    type: [c.type, Validators.required],
                    option: [c.option, Validators.required]
                })
            );
        });
    }
    onAddAssessment() {
        if (this.stageSettingsForm.get('assessment').valid) {
            this.addAssessmentGroup();
        } else {
            this.formHelper.markFormGroupTouched(this.stageSettingsForm);
        }
    }
}