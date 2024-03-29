import { Directive, ElementRef, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Directive({
    selector: '[appDragEnter1]'
})
export class DragEnter1Directive implements OnInit {
    @Input() appDragEnter: string;
    @Input() appDragEnterParentClass: string;
    @Output() dropFile = new EventEmitter<File>();
    supportedFileTypes: string[];
    first: boolean = false;
    second: boolean = false;

    constructor(private _elementRef: ElementRef) {
        this.supportedFileTypes = [
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'application/vnd.oasis.opendocument.text',
            'text/rtf'
        ];
    }

    ngOnInit() {
        // Get the current element
        const el = this.appDragEnter === 'body' ? document.body : this._elementRef.nativeElement;

        // Add a style to indicate that this element is a drop target
        el.addEventListener('dragenter', (e) => {
            // console.log('dragenter', e);
            // el.classList.add('over');
            const type = e.dataTransfer.types && e.dataTransfer.types[0] ? e.dataTransfer.types[0] : null;
            if (type === 'Files') {
                if (this.first) this.second = true;
                else this.first = true;
                el.classList.add('over');
                if (e.preventDefault) {
                    e.preventDefault();
                }
                e.dataTransfer.dropEffect = 'move';
                return false;
            }
        });

        // Remove the style
        el.addEventListener('dragleave', (e) => {
            const type = e.dataTransfer.types && e.dataTransfer.types[0] ? e.dataTransfer.types[0] : null;
            if (type === 'Files') {
                if (this.second) this.second = false;
                else if (this.first) this.first = false;

                if (!this.first && !this.second) {
                    el.classList.remove('over');
                }
            } else {
                const leaveTarget = e.target;
                // console.log(leaveTarget);
                el.classList.remove('over');
                if (this.appDragEnterParentClass) {
                    el.parentNode.classList.remove(this.appDragEnterParentClass);
                }
            }
        });

        el.addEventListener('dragover', (e) => {
            const type =
                e.dataTransfer && e.dataTransfer.types && e.dataTransfer.types[0] ? e.dataTransfer.types[0] : null;
            if (type === 'Files') {
                el.classList.add('over');
                if (e.preventDefault) {
                    e.preventDefault();
                }
                e.dataTransfer.dropEffect = 'move';
                return false;
            }
            if (
                this.appDragEnter &&
                e.dataTransfer &&
                e.dataTransfer.types &&
                e.dataTransfer.types[1] &&
                this.appDragEnter === e.dataTransfer.types[1]
            ) {
                if (this.appDragEnterParentClass) {
                    el.parentNode.classList.add(this.appDragEnterParentClass);
                }
                el.classList.add('over');
                if (e.preventDefault) {
                    e.preventDefault();
                }
                e.dataTransfer.dropEffect = 'move';
                return false;
            }
        });

        // On drop, get the data and convert it back to a JSON object
        // and fire off an event passing the data
        el.addEventListener('drop', (e) => {
            const fileType =
                e.dataTransfer &&
                e.dataTransfer.items &&
                e.dataTransfer &&
                e.dataTransfer.items[0] &&
                e.dataTransfer.items[0].type
                    ? e.dataTransfer.items[0].type
                    : null;
            if (this.appDragEnterParentClass) {
                el.parentNode.classList.remove(this.appDragEnterParentClass);
            }
            if (fileType && fileType !== 'text/plain') {
                if (e.stopPropagation) {
                    e.stopPropagation(); // Stops some browsers from redirecting.
                }
                this.dropFile.emit(e);
                e.preventDefault();

                el.classList.remove('over');
                // const data = JSON.parse(e.dataTransfer.getData('text'));
                return false;
            }
        });
    }

    private validateFileType(type: string, types: string[]) {
        return types.indexOf(type) !== -1;
    }
}
