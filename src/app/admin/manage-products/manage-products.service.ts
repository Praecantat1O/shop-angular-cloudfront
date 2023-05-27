import { Injectable, Injector } from '@angular/core';
import { EMPTY, Observable, throwError } from 'rxjs';
import { ApiService } from '../../core/api.service';
import { catchError, map, switchMap } from 'rxjs/operators';
import { HttpErrorResponse } from '@angular/common/http';

@Injectable()
export class ManageProductsService extends ApiService {
  constructor(injector: Injector) {
    super(injector);
  }

  uploadProductsCSV(file: File): Observable<unknown> {
    if (!this.endpointEnabled('import')) {
      console.warn(
        'Endpoint "import" is disabled. To enable change your environment.ts config'
      );
      return EMPTY;
    }

    return this.getPreSignedUrl(file.name).pipe(
      switchMap((url) => {

        return this.http.post(url, file, {
          headers: {
            // eslint-disable-next-line @typescript-eslint/naming-convention
            'Content-Type': 'text/csv',
          },
        }).pipe(
          catchError((e: HttpErrorResponse) => {
            console.log('uploadProductsCSV Error: ', e);
            const error = `Error Status: ${e.status}, Message: ${e.error.message}`;

            alert(error);
            return throwError(() => new Error(error));
          }),
        );
      }

      )
    );
  }

  private getPreSignedUrl(fileName: string): Observable<string> {
    const url = this.getUrl('import', 'import');
    const token = localStorage.getItem('authorization_token') || '';

    return this.http.get<{message: string}>(url, {
      params: {
        name: fileName,
      },
      headers: {
        Authorization: token ? `Basic ${token}` : '',
      },
    }).pipe(
      catchError((e: HttpErrorResponse) => {
        console.log('getPreSignedUrl Error: ', e);
        const error = `Error Status: ${e.status}, Message: ${e.error.message}`;

        alert(error);
        return throwError(() => new Error(error));
      }),
      map(resp => resp.message)
    );
  }
}
