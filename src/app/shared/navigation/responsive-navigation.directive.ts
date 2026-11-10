import { Directive, ElementRef, EventEmitter, Inject, Input, OnChanges, OnDestroy, Output } from '@angular/core';
import { DOCUMENT } from '@angular/common';

@Directive({selector:'[plusResponsiveNavigation]',standalone:true})
export class ResponsiveNavigationDirective implements OnChanges, OnDestroy {
  @Input() plusResponsiveNavigation=false;
  @Input() navigationBreakpoint=1024;
  @Input() navigationModal=true;
  @Input() navigationBackground?:HTMLElement;
  @Output() navigationClose=new EventEmitter<void>();
  private media?:MediaQueryList;private active=false;private opener?:HTMLElement;private frame?:number;
  private oldOverflow='';private oldInert=false;
  private readonly resized=()=>{if(!this.media?.matches){this.deactivate(false);if(this.plusResponsiveNavigation)this.navigationClose.emit();}};
  private readonly keydown=(event:KeyboardEvent)=>{
    if(!this.active)return;
    if(event.key==='Escape'){event.preventDefault();event.stopPropagation();this.navigationClose.emit();return;}
    if(event.key!=='Tab' || !this.navigationModal)return;
    const items=this.focusable(),first=items[0],last=items[items.length-1],current=this.document.activeElement;
    if(!first){event.preventDefault();this.element.nativeElement.focus();return;}
    if(event.shiftKey && (current===first || !this.element.nativeElement.contains(current))){event.preventDefault();last.focus();}
    else if(!event.shiftKey && (current===last || !this.element.nativeElement.contains(current))){event.preventDefault();first.focus();}
  };
  constructor(private readonly element:ElementRef<HTMLElement>,@Inject(DOCUMENT) private readonly document:Document){}
  ngOnChanges(){
    if(!this.media){this.media=this.document.defaultView?.matchMedia(`(max-width: ${this.navigationBreakpoint-1}px)`);this.media?.addEventListener('change',this.resized);}
    if(this.plusResponsiveNavigation && this.media?.matches)this.activate();else this.deactivate(true);
  }
  private focusable(){return Array.from(this.element.nativeElement.querySelectorAll<HTMLElement>('a[href],button:not(:disabled),input:not(:disabled),select:not(:disabled),textarea:not(:disabled),[tabindex="0"]')).filter(item=>item.getClientRects().length>0 && !item.closest('[inert]'));}
  private activate(){
    if(this.active)return;
    this.active=true;this.opener=this.document.activeElement as HTMLElement;
    if(this.navigationModal){
      this.oldOverflow=this.document.body.style.overflow;this.document.body.style.overflow='hidden';
      if(this.navigationBackground){this.oldInert=this.navigationBackground.inert;this.navigationBackground.inert=true;}
      this.element.nativeElement.setAttribute('role','dialog');this.element.nativeElement.setAttribute('aria-modal','true');
    }
    this.document.addEventListener('keydown',this.keydown);
    this.frame=this.document.defaultView?.requestAnimationFrame(()=>this.focusable()[0]?.focus());
  }
  private deactivate(restore:boolean){
    if(!this.active)return;this.active=false;
    if(this.frame!==undefined)this.document.defaultView?.cancelAnimationFrame(this.frame);
    this.document.removeEventListener('keydown',this.keydown);
    if(this.navigationModal){this.document.body.style.overflow=this.oldOverflow;if(this.navigationBackground)this.navigationBackground.inert=this.oldInert;this.element.nativeElement.removeAttribute('role');this.element.nativeElement.removeAttribute('aria-modal');}
    if(restore && this.opener?.isConnected)this.opener.focus();
  }
  ngOnDestroy(){this.deactivate(false);this.media?.removeEventListener('change',this.resized);}
}
