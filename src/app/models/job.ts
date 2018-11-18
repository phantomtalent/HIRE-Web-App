import { JobStage } from './job-stage';
export class Job {
    id?: string;
    title: string;
    company: string;
    location: string;
    is_remote: boolean;
    job_type: string;
    number_of_hires: string | number;
    education: string;
    experience: string;
    single_salary: boolean;
    salary_from?: number;
    salary_to?: number;
    salary_period: string;
    hide_salary: boolean;
    description: string;
    requirements: string;
    job_listing: string;
    resume_upload_required: boolean;
    email_missing_info: boolean;
    email_suggestions: boolean;
    application_field_name: string;
    application_field_email: string;
    application_field_phone: string;
    application_field_current_location: string;
    application_field_employment_equity_status: string;
    application_field_gender: string;
    application_field_experience_summary: string;
    application_field_work_history: string;
    application_field_education: string;
    application_field_cover_letter: string;
    questionnaire: string;
    hiring_managers: string[];
    team_members: string[];
    default_email_name: string;
    step_completed?: number;
    status?: string;
    created?: boolean;
    stages?: JobStage[];
    owner?: string;
    show_position_rating?: boolean;
}
