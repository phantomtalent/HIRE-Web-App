import { CandidateService } from './candidate.service';
import { EmailService } from './email.service';
import { FormHelperService } from './form-helper.service';
import { JobService } from './job.service';
import { QuestionnaireService } from './questionnaire.service';
import { ThemeService } from './theme.service';
import { UserService } from './user.service';
import { UtilitiesService } from './utilities.service';
import { XLSXService } from './xlsx.service';

export const services: any[] = [
    UserService,
    JobService,
    CandidateService,
    UtilitiesService,
    QuestionnaireService,
    FormHelperService,
    EmailService,
    ThemeService,
    XLSXService
];

export * from './questionnaire.service';
export * from './candidate.service';
export * from './candidate.service';
export * from './job.service';
export * from './user.service';
export * from './utilities.service';
export * from './email.service';
export * from './theme.service';
export * from './xlsx.service';
