import { Pipe, PipeTransform } from '@angular/core';
import { listenToElementOutputs } from '@angular/core/src/view/element';

@Pipe({
    name: 'initials'
})
export class InitialsPipe implements PipeTransform {
    transform(value: any): any {
        let initials;
        if (value.first_name) {
            initials = value.first_name.charAt(0).toUpperCase();
            if (value.last_name) {
                initials += value.last_name.charAt(0).toUpperCase();
            }
        } else if (value.email) {
            initials = value.email.charAt(0).toUpperCase();
        }

        return initials;
    }
}
