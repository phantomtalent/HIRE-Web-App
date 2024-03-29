import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ActivatedRoute, UrlSegment } from '@angular/router';
import * as moment from 'moment';

import { environment } from '@env/environment';

@Injectable({
    providedIn: 'root'
})
export class UtilitiesService {
    tenantId = 'undefined';
    constructor(private http: HttpClient, private route: ActivatedRoute) {}

    readFile(file): Promise<{ name: string; size: number; mimetype: string; data: string }> {
        return new Promise((resolve, reject) => {
            // console.log(file);
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => {
                const result: any = reader.result;
                resolve({
                    name: file.name,
                    size: file.size,
                    mimetype: file.type,
                    data: result.split(',')[1]
                });
            };
        });
    }

    readAndResizeImage(file, maxWidth, maxHeight) {
        return new Promise((resolve, reject) => {
            // console.log(file);
            const w: any = window;
            const d: any = document;
            const image = new w.Image();

            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => {
                image.src = reader.result;
            };
            image.onload = () => {
                let tempW = image.width;
                let tempH = image.height;
                if (tempW > tempH) {
                    if (tempW > maxWidth) {
                        tempH *= maxWidth / tempW;
                        tempW = maxWidth;
                    }
                } else {
                    if (tempH > maxHeight) {
                        tempW *= maxHeight / tempH;
                        tempH = maxHeight;
                    }
                }
                const canvas = d.createElement('canvas');
                canvas.width = tempW;
                canvas.height = tempH;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(image, 0, 0, tempW, tempH);
                const dataURL = canvas.toDataURL('image/png');
                resolve({ name: file.name, size: file.size, mimetype: file.type, data: dataURL });
            };
        });
    }

    generateUID(length = 5) {
        let pool1: any = 'ABCDEFGHIJKLMNOPQRSTUVQWXYZ';
        let pool2: any = '123456789ABCDEFGHIJKLMNOPQRSTUVQWXYZ';
        let shuffled = '';
        let charIndex = 0;
        pool1 = pool1.split('');
        pool2 = pool2.split('');
        const firstLetterIndex = Math.floor(pool1.length * Math.random());
        while (pool2.length > 0) {
            charIndex = Math.floor(pool2.length * Math.random());
            shuffled += pool2[charIndex];
            pool2.splice(charIndex, 1);
        }
        return pool1[firstLetterIndex] + shuffled.substring(0, length - 1);
    }

    setTenant(tenantId: string) {
        this.tenantId = tenantId;
    }

    getTenant() {
        if (this.tenantId === 'undefined') {
            const urlPart = window.location.pathname.split('/tenant/')[1];
            if (urlPart) {
                this.tenantId = urlPart.split('/')[0];
            }
        }
        return this.tenantId;
    }

    // getTenant() {
    //     const tenant = window.location.pathname.split('/')[2];
    //     return tenant || 'undefined';
    // }

    getHireBaseUrl() {
        return `/tenant/${this.getTenant()}/hire`;
    }

    isLocalDevelopment() {
        const url = window.location.hostname;
        return url.indexOf('hire.local') !== -1;
    }

    getCountries() {
        return this.http.get(`${environment.apiUrl}/countries`);
    }

    /* tslint:disable */
    isEqual(obj1, obj2) {
        var i,
            l,
            leftChain = [],
            rightChain = [];

        function compare2Objects(x, y) {
            var p;

            // remember that NaN === NaN returns false
            // and isNaN(undefined) returns true
            if (isNaN(x) && isNaN(y) && typeof x === 'number' && typeof y === 'number') {
                return true;
            }

            // Compare primitives and functions.
            // Check if both arguments link to the same object.
            // Especially useful on the step where we compare prototypes
            if (x === y) {
                return true;
            }

            // Works in case when functions are created in constructor.
            // Comparing dates is a common scenario. Another built-ins?
            // We can even handle functions passed across iframes
            if (
                (typeof x === 'function' && typeof y === 'function') ||
                (x instanceof Date && y instanceof Date) ||
                (x instanceof RegExp && y instanceof RegExp) ||
                (x instanceof String && y instanceof String) ||
                (x instanceof Number && y instanceof Number)
            ) {
                return x.toString() === y.toString();
            }

            // At last checking prototypes as good as we can
            if (!(x instanceof Object && y instanceof Object)) {
                return false;
            }

            if (x.isPrototypeOf(y) || y.isPrototypeOf(x)) {
                return false;
            }

            if (x.constructor !== y.constructor) {
                return false;
            }

            if (x.prototype !== y.prototype) {
                return false;
            }

            // Check for infinitive linking loops
            if (leftChain.indexOf(x) > -1 || rightChain.indexOf(y) > -1) {
                return false;
            }

            // Quick checking of one object being a subset of another.
            // todo: cache the structure of arguments[0] for performance
            for (p in y) {
                if (y.hasOwnProperty(p) !== x.hasOwnProperty(p)) {
                    return false;
                } else if (typeof y[p] !== typeof x[p]) {
                    return false;
                }
            }

            for (p in x) {
                if (y.hasOwnProperty(p) !== x.hasOwnProperty(p)) {
                    return false;
                } else if (typeof y[p] !== typeof x[p]) {
                    return false;
                }

                switch (typeof x[p]) {
                    case 'object':
                    case 'function':
                        leftChain.push(x);
                        rightChain.push(y);

                        if (!compare2Objects(x[p], y[p])) {
                            return false;
                        }

                        leftChain.pop();
                        rightChain.pop();
                        break;

                    default:
                        if (x[p] !== y[p]) {
                            return false;
                        }
                        break;
                }
            }

            return true;
        }

        if (!compare2Objects(obj1, obj2)) {
            return false;
        }

        return true;
    }
    /* tslint:enable */

    fromNow(date) {
        const today = moment()
            .utc()
            .startOf('day')
            .valueOf();
        const timeinmilisec = today - date;
        const days = Math.floor(timeinmilisec / (1000 * 60 * 60 * 24));
        let value = '';
        if (days === -1) {
            value = 'Today';
        } else if (days === 0) {
            value = 'Yesterday';
        } else if (days > 0) {
            value = days + 1 + 'd ago';
        }
        return value;
    }

    omit(obj, properties) {
        return Object.entries(obj)
            .filter(([key]) => !properties.includes(key))
            .reduce((newObj, [key, val]) => ({ ...newObj, [key]: val }), {});
    }

    isBottomOfPage() {
        return window.innerHeight + Math.ceil(window.pageYOffset + 1) >= document.body.offsetHeight;
    }

    arrayMove(arr, old_index, new_index) {
        while (old_index < 0) {
            old_index += arr.length;
        }
        while (new_index < 0) {
            new_index += arr.length;
        }
        if (new_index >= arr.length) {
            var k = new_index - arr.length + 1;
            while (k--) {
                arr.push(undefined);
            }
        }
        arr.splice(new_index, 0, arr.splice(old_index, 1)[0]);
        return arr;
    }

    getRadarChartData() {
        return {
            labels: ['Extroversion', 'Agreeableness', 'Conscientiousness', 'Neuroticism', 'Openness'],
            datasets: [
                {
                    label: 'Second Dataset',
                    data: [0, 0, 0, 0, 0],
                    fill: true,
                    backgroundColor: 'rgba(76, 217, 100, 0.3)',
                    borderColor: '#4cd964',
                    borderWidth: 1,
                    pointRadius: 0,
                    pointHoverRadius: 0
                },
                {
                    label: 'Avarage Dataset',
                    data: [72, 72, 72, 72, 72],
                    fill: true,
                    backgroundColor: 'rgba(0, 0, 0, 0.3)',
                    borderColor: '#e5e5ea',
                    borderWidth: 1,
                    pointRadius: 0,
                    pointHoverRadius: 0
                }
            ]
        };
    }

    getRadarChartOptions() {
        return {
            scale: {
                pointLabels: { fontSize: 15, fontColor: '#000000' },
                ticks: {
                    beginAtZero: true,
                    min: 0,
                    max: 120,
                    stepSize: 40,
                    fontColor: '#525f7f',
                    fontStyle: 'bold',
                    padding: 100,
                    backdropColor: 'transparent',
                    userCallback: (label, index, labels) => {
                        if (index === 1) {
                            return 'LOW';
                        } else if (index === 2) {
                            return 'NEUTRAL';
                        } else if (index === 3) {
                            return 'HIGH';
                        } else {
                            return '';
                        }
                    }
                }
            },
            legend: { display: false, labels: { fontColor: 'rgb(255, 99, 132)' } }
        };
    }
}
