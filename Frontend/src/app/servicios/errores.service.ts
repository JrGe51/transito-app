import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ToastrService } from 'ngx-toastr';

@Injectable({
  providedIn: 'root'
})
export class ErroresService {

  constructor(private toastr: ToastrService) { }


  messageError(e: HttpErrorResponse) {
    if(e.error.msg){
      console.log(e.error.msg);
      this.toastr.warning('Error', e.error.msg)
    } else{
        this.toastr.error('Error', 'Credenciales incorrectas')
    }
  }
}
