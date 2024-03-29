/* tslint:disable */
import { CommonModule } from '@angular/common';
import {
    AfterViewInit,
    ChangeDetectorRef,
    Component,
    ContentChild,
    ElementRef,
    EventEmitter,
    forwardRef,
    Input,
    NgModule,
    OnChanges,
    Output,
    ViewChild
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { Header, SharedModule } from 'primeng/components/common/shared';
import { DomHandler } from './domhandler';

declare var Quill: any;

export const EDITOR_VALUE_ACCESSOR: any = {
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => AppEditorComponent),
    multi: true
};

@Component({
    selector: 'app-editor',
    template: `
        <div
            [ngClass]="{ 'ui-widget ui-editor-container ui-corner-all': true, active: isFocused }"
            [class]="styleClass"
        >
            <div class="ui-editor-toolbar ui-widget-header ui-corner-top" *ngIf="toolbar">
                <ng-content select="p-header"></ng-content>
            </div>
            <div class="ui-editor-toolbar ui-widget-header ui-corner-top" *ngIf="!toolbar">
                <span class="ql-formats">
                    <select class="ql-header">
                        <option value="1">Heading</option>
                        <option value="2">Subheading</option>
                        <option selected>Normal</option>
                    </select>
                    <select class="ql-font">
                        <option selected>Sans Serif</option>
                        <option value="serif">Serif</option>
                        <option value="monospace">Monospace</option>
                    </select>
                </span>
                <span class="ql-formats">
                    <button class="ql-bold" aria-label="Bold"></button>
                    <button class="ql-italic" aria-label="Italic"></button>
                    <button class="ql-underline" aria-label="Underline"></button>
                </span>
                <span class="ql-formats">
                    <select class="ql-color"></select>
                    <select class="ql-background"></select>
                </span>
                <span class="ql-formats">
                    <button class="ql-list" value="ordered" aria-label="Ordered List"></button>
                    <button class="ql-list" value="bullet" aria-label="Unordered List"></button>
                    <select class="ql-align">
                        <option selected></option>
                        <option value="center"></option>
                        <option value="right"></option>
                        <option value="justify"></option>
                    </select>
                </span>
                <span class="ql-formats">
                    <button class="ql-link" aria-label="Insert Link"></button>
                    <button class="ql-image" aria-label="Insert Image"></button>
                    <button class="ql-code-block" aria-label="Insert Code Block"></button>
                </span>
                <span class="ql-formats"> <button class="ql-clean" aria-label="Remove Styles"></button> </span>
            </div>
            <div class="ui-editor-content" [ngStyle]="style" #editorcontent></div>
        </div>
    `,
    providers: [EDITOR_VALUE_ACCESSOR]
})
export class AppEditorComponent implements AfterViewInit, ControlValueAccessor {
    constructor(public el: ElementRef, private cd: ChangeDetectorRef) {}
    @ViewChild('editorcontent') editorRef: ElementRef;

    isFocused = false;

    @Input() get readonly(): boolean {
        return this._readonly;
    }

    set readonly(val: boolean) {
        this._readonly = val;

        if (this.quill) {
            if (this._readonly) {
                this.quill.disable();
            } else {
                this.quill.enable();
            }
        }
    }
    @Output() onTextChange: EventEmitter<any> = new EventEmitter();

    @Output() onSelectionChange: EventEmitter<any> = new EventEmitter();

    @ContentChild(Header) toolbar;

    @Input() style: any;

    @Input() styleClass: string;

    @Input() placeholder: string;

    @Input() formats: string[];

    @Input() modules: any;

    @Input() bounds: Element;

    @Input() scrollingContainer: Element;

    @Input() debug: string;

    @Output() onInit: EventEmitter<any> = new EventEmitter();

    value: string;

    _readonly: boolean;

    quill: any;

    onModelChange: Function = () => {};

    onModelTouched: Function = () => {};

    ngAfterViewInit() {
        const editorElement = DomHandler.findSingle(this.el.nativeElement, 'div.ui-editor-content');
        const toolbarElement = DomHandler.findSingle(this.el.nativeElement, 'div.ui-editor-toolbar');
        const defaultModule = { toolbar: toolbarElement };
        const modules = this.modules ? { ...defaultModule, ...this.modules } : defaultModule;

        this.quill = new Quill(editorElement, {
            modules,
            placeholder: this.placeholder,
            readOnly: this.readonly,
            theme: 'snow',
            formats: this.formats,
            bounds: this.bounds,
            debug: this.debug,
            scrollingContainer: this.scrollingContainer
        });

        if (this.value) {
            this.quill.pasteHTML(this.value);
        }

        this.quill.on('text-change', (delta, oldContents, source) => {
            if (source === 'user') {
                // this.setHeight();
                let html = editorElement.children[0].innerHTML;
                const text = this.quill.getText().trim();
                if (html === '<p><br></p>') {
                    html = null;
                }

                this.onTextChange.emit({
                    htmlValue: html,
                    textValue: text,
                    delta,
                    source
                });

                this.onModelChange(html);
                this.onModelTouched();
            }
        });

        this.quill.on('selection-change', (range, oldRange, source) => {
            this.isFocused = this.quill.hasFocus();
            this.cd.detectChanges();
            this.onSelectionChange.emit({
                range,
                oldRange,
                source
            });
        });

        this.onInit.emit({
            editor: this.quill
        });
        // this.setHeight();
    }

    writeValue(value: any): void {
        this.value = value;

        if (this.quill) {
            if (value) {
                this.quill.pasteHTML(value);
            } else {
                this.quill.setText('');
            }
        }
    }

    setHeight() {
        this.style.height = 150 + 'px';
        this.cd.detectChanges();
        const contentBlock = this.editorRef.nativeElement.childNodes[0];
        const contentHeight = contentBlock.scrollHeight;
        if (contentHeight > 150) {
            this.style.height = contentHeight + 'px';
        } else {
            this.style.height = 150 + 'px';
        }
        this.cd.detectChanges();
    }

    registerOnChange(fn: Function): void {
        this.onModelChange = fn;
    }

    registerOnTouched(fn: Function): void {
        this.onModelTouched = fn;
    }

    getQuill() {
        return this.quill;
    }
}

@NgModule({
    imports: [CommonModule],
    exports: [AppEditorComponent, SharedModule],
    declarations: [AppEditorComponent]
})
export class HireEditorModule {}
/* tslint:enable */
