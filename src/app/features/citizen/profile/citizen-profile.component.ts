import { Component, DestroyRef, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize, forkJoin, switchMap } from 'rxjs';
import { AccountApiService, Community, Department, Municipality } from '../../../core/api/account-api.service';
import { apiErrorMessage } from '../../../core/api/api-error';
import { AuthService } from '../../../core/auth/auth.service';

@Component({selector: 'plus-citizen-profile', standalone: true, imports: [ReactiveFormsModule], templateUrl: './citizen-profile.component.html'})
export class CitizenProfileComponent {
  readonly auth = inject(AuthService);
  private readonly api = inject(AccountApiService);
  private readonly destroy = inject(DestroyRef);
  private readonly builder = inject(FormBuilder).nonNullable;
  private territoryRevision = 0;
  private communityRevision = 0;
  readonly loading = signal(true);
  readonly pending = signal(false);
  readonly status = signal('');
  readonly loadError = signal('');
  readonly departments = signal<Department[]>([]);
  readonly municipalities = signal<Municipality[]>([]);
  readonly communities = signal<Community[]>([]);
  readonly form = this.builder.group({
    name: ['', [Validators.required, Validators.pattern(/\S/), Validators.maxLength(100)]],
    surname: ['', [Validators.required, Validators.pattern(/\S/), Validators.maxLength(100)]],
    email: ['', [Validators.required, Validators.email, Validators.maxLength(150)]],
    phone: ['', Validators.maxLength(20)], department: [''], municipality: [''], community: [''],
    caseUpdates: [false], messageAlerts: [false], bulletin: [false],
  });
  constructor() {this.load();}
  load() {
    this.loading.set(true);this.loadError.set('');
    forkJoin({user:this.api.get(),departments:this.api.departments()}).pipe(
      switchMap(({user,departments})=>{
        this.departments.set(departments);this.fill();
        return forkJoin({
          municipalities:user.perfil?.id_departamento ? this.api.municipalities(user.perfil.id_departamento) : [ [] as Municipality[] ],
          communities:user.perfil?.id_municipio ? this.api.communities(user.perfil.id_municipio) : [ [] as Community[] ],
        });
      }), takeUntilDestroyed(this.destroy), finalize(()=>this.loading.set(false)),
    ).subscribe({next:values=>{this.municipalities.set(values.municipalities);this.communities.set(values.communities);},error:error=>this.loadError.set(apiErrorMessage(error))});
  }
  private fill() {
    const user=this.auth.user();if(!user)return;
    this.form.reset({name:user.nombres,surname:user.apellidos,email:user.correo,phone:user.telefono ?? '',department:user.perfil?.id_departamento ?? '',municipality:user.perfil?.id_municipio ?? '',community:user.perfil?.id_comunidad ?? '',caseUpdates:user.preferencias?.notificar_novedades_casos ?? false,messageAlerts:user.preferencias?.notificar_mensajes ?? false,bulletin:user.preferencias?.suscrito_boletin ?? false});
  }
  invalid(name: 'name'|'surname'|'email'|'phone') {return this.form.controls[name].touched && this.form.controls[name].invalid;}
  changeDepartment() {
    const revision=++this.territoryRevision;++this.communityRevision;
    this.form.patchValue({municipality:'',community:''});this.municipalities.set([]);this.communities.set([]);
    const id=this.form.controls.department.value;if(!id)return;
    this.api.municipalities(id).pipe(takeUntilDestroyed(this.destroy)).subscribe({next:items=>{if(revision===this.territoryRevision)this.municipalities.set(items);},error:error=>{if(revision===this.territoryRevision)this.status.set(apiErrorMessage(error));}});
  }
  changeMunicipality() {
    const revision=++this.communityRevision;
    this.form.controls.community.setValue('');this.communities.set([]);
    const id=this.form.controls.municipality.value;if(!id)return;
    this.api.communities(id).pipe(takeUntilDestroyed(this.destroy)).subscribe({next:items=>{if(revision===this.communityRevision)this.communities.set(items);},error:error=>{if(revision===this.communityRevision)this.status.set(apiErrorMessage(error));}});
  }
  save() {
    if(this.pending() || this.loading() || this.loadError())return;
    this.form.markAllAsTouched();if(this.form.invalid){this.status.set('Revisa los datos personales.');return;}
    const value=this.form.getRawValue();this.pending.set(true);this.status.set('');
    this.api.update({nombres:value.name.trim(),apellidos:value.surname.trim(),correo:value.email.trim(),telefono:value.phone.trim(),id_departamento:value.department || null,id_municipio:value.municipality || null,id_comunidad:value.community || null}).pipe(takeUntilDestroyed(this.destroy),finalize(()=>this.pending.set(false))).subscribe({next:()=>this.status.set('Datos personales y ubicación guardados.'),error:error=>this.status.set(apiErrorMessage(error))});
  }
  savePreferences() {
    if(this.pending())return;
    const value=this.form.getRawValue();this.pending.set(true);this.status.set('');
    this.api.preferences({notificar_novedades_casos:value.caseUpdates,notificar_mensajes:value.messageAlerts,suscrito_boletin:value.bulletin}).pipe(takeUntilDestroyed(this.destroy),finalize(()=>this.pending.set(false))).subscribe({next:preferences=>{
      const user=this.auth.user();if(user)this.auth.updateUser({...user,preferencias:preferences});this.status.set('Preferencias guardadas.');
    },error:error=>this.status.set(apiErrorMessage(error))});
  }
  selectPhoto(event: Event) {
    const input=event.target as HTMLInputElement;const file=input.files?.[0];input.value='';
    if(!file || this.pending())return;
    if(!['image/jpeg','image/png','image/webp'].includes(file.type) || file.size>15728640){this.status.set('Selecciona una imagen JPG, PNG o WEBP de hasta 15 MB.');return;}
    this.pending.set(true);this.status.set('');
    this.api.uploadPhoto(file).pipe(takeUntilDestroyed(this.destroy),finalize(()=>this.pending.set(false))).subscribe({next:profile=>{
      const user=this.auth.user();if(user)this.auth.updateUser({...user,perfil:profile});this.status.set('Fotografía guardada.');
    },error:error=>this.status.set(apiErrorMessage(error))});
  }
  removePhoto() {
    if(this.pending())return;
    this.pending.set(true);this.status.set('');
    this.api.removePhoto().pipe(takeUntilDestroyed(this.destroy),finalize(()=>this.pending.set(false))).subscribe({next:()=>{
      const user=this.auth.user();if(user?.perfil)this.auth.updateUser({...user,perfil:{...user.perfil,foto_url:null,ruta_foto:null}});this.status.set('Fotografía eliminada.');
    },error:error=>this.status.set(apiErrorMessage(error))});
  }
  cancel() {if(this.pending())return;this.load();this.status.set('Se han recargado los datos guardados en el servidor.');}
}
