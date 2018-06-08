import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule } from '@angular/common/http';

import { AppComponent } from './app.component';
import { DataService } from './data.service';
import { PlaylistService } from './playlist.service';
import { PcapTileComponent } from './pcap-tile.component';

import { DataViewModule } from 'primeng/dataview';
import { DropdownModule } from 'primeng/dropdown';
import { InputTextModule } from 'primeng/inputtext';
import { ToolbarModule } from 'primeng/toolbar';
import { SplitButtonModule } from 'primeng/splitbutton';
import { DialogModule } from 'primeng/dialog';
import { FileUploadModule } from 'primeng/fileupload';
import { GrowlModule } from 'primeng/growl';
import { TableModule } from 'primeng/table';
import { DataScrollerModule } from 'primeng/datascroller';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { OverlayPanelModule } from 'primeng/overlaypanel';
import { RadioButtonModule } from 'primeng/radiobutton';

import { DragulaModule } from 'ng2-dragula';


@NgModule({
  declarations: [
    AppComponent,
    PcapTileComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    BrowserAnimationsModule,
    HttpClientModule,
    DataViewModule,
    DropdownModule,
    InputTextModule,
    ToolbarModule,
    SplitButtonModule,
    DialogModule,
    FileUploadModule,
    GrowlModule,
    TableModule,
    DataScrollerModule,
    ConfirmDialogModule,
    OverlayPanelModule,
    RadioButtonModule,
    DragulaModule
  ],
  providers: [
    DataService,
    PlaylistService
  ],
  bootstrap: [AppComponent]
})

export class AppModule { }
