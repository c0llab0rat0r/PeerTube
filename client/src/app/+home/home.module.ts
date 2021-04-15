import { NgModule } from '@angular/core'
import { SharedFormModule } from '@app/shared/shared-forms'
import { SharedGlobalIconModule } from '@app/shared/shared-icons'
import { SharedInstanceModule } from '@app/shared/shared-instance'
import { SharedMainModule } from '@app/shared/shared-main'
import { HomeRoutingModule } from './home-routing.module'
import { HomeComponent } from './home.component'

@NgModule({
  imports: [
    HomeRoutingModule,

    SharedMainModule,
    SharedFormModule,
    SharedInstanceModule,
    SharedGlobalIconModule
  ],

  declarations: [
    HomeComponent
  ],

  exports: [
    HomeComponent
  ],

  providers: [ ]
})
export class HomeModule { }
