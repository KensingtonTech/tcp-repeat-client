import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { DataService } from './data.service';
import { Playlist } from './playlist';
import { Pcap } from './pcap';
import { Preferences } from './preferences';
import { Subscription } from 'rxjs';
import { Message, SelectItem } from 'primeng/api';
import { ConfirmationService } from 'primeng/api';
import { NetworkInterface } from './network-interface';
import { DragulaService } from 'ng2-dragula';
import { PlaylistService } from './playlist.service';


function compare(a, b) {
  if (a.name.toLowerCase() < b.name.toLowerCase()) {
    return -1;
  }
  if (a.name.toLowerCase() > b.name.toLowerCase()) {
    return 1;
  }
  return 0;
}



@Component({
  selector: 'app-root',
  providers: [ ConfirmationService ],
  template: `
<div style="height: 100vh; width: 100vw; max-width:100%; max-height: 100%;">

  <!-- status messages -->
  <p-growl [value]="messages"></p-growl>

  <!-- toolbar -->
  <div style="position:absolute; top: 0; left: 300px; right: 0; height: 100px;">
    <p-toolbar>
      <div class="ui-toolbar-group-left">
        <p-button type="button" label="New" icon="fa fa-plus" (click)="onNewPcapClicked()"></p-button>&nbsp;
        <button *ngIf="selectedPlaylist && selectedPlaylist.name == 'All'" pButton [class.fa-deselect]="selectedPcaps.length == 0" type="button" label="Delete" icon="fa fa-times" (click)="onDeletePcapClicked()"></button>
        <button *ngIf="selectedPlaylist && selectedPlaylist.name != 'All'" pButton [class.fa-deselect]="selectedPcaps.length == 0" type="button" label="Remove" icon="fa fa-minus" (click)="onRemovePcapsClicked()"></button>
        &nbsp;
        <i class="fa fa-bars"></i>&nbsp;
        <p-button type="button" label="All" (click)="onSelectAllPcaps()"></p-button>&nbsp;
        <p-button type="button" label="None" (click)="onSelectNonePcaps()"></p-button>&nbsp;
      </div>
      <div class="ui-toolbar-group-right">
        <button [class.fa-deselect]="selectedPcaps.length == 0 || !selectedNetworkInterface" pButton type="button" label="Play" icon="fa-play"></button>&nbsp;
        <button pButton type="button" label="Stop" icon="fa-stop"></button>&nbsp;
      </div>
    </p-toolbar>


    <!-- playlist settings toolbar -->
    <p-toolbar>
      <div class="ui-toolbar-group-left">

        <!-- playlist name -->
        <span *ngIf="selectedPlaylist" style="font-weight: 900;"> Playlist "{{selectedPlaylist.name}}" Defaults &nbsp;&nbsp;</span>

        <!-- speed overlay trigger button -->
        <button pButton label="Speed" type="button" (click)="playlistSpeedSelector.toggle($event)"></button>&nbsp;
        <ng-container *ngIf="!playlistSpeed">No speed selected</ng-container>
        <ng-container *ngIf="playlistSpeed == 'pcap'">PCAP Speed</ng-container>
        <ng-container *ngIf="playlistSpeed == 'unlimited'">Top Speed</ng-container>
        <ng-container *ngIf="playlistSpeed == 'custom'">{{playlistCustomSpeed}} Mbps</ng-container>&nbsp;

        <!-- speed selector overlay -->
        <p-overlayPanel #playlistSpeedSelector appendTo="body">
          <div><p-radioButton name="speedGroup1" label="PCAP Speed" value="pcap" [(ngModel)]="playlistSpeed" (ngModelChange)="onPlaylistSpeedSelected($event)"></p-radioButton></div>
          <div><p-radioButton name="speedGroup1" label="Top Speed" value="unlimited" [(ngModel)]="playlistSpeed" (ngModelChange)="onPlaylistSpeedSelected($event)"></p-radioButton></div>
          <div><p-radioButton name="speedGroup1" label="Custom Speed" value="custom" [(ngModel)]="playlistSpeed" (ngModelChange)="onPlaylistSpeedSelected($event)"></p-radioButton></div>
          <div *ngIf="playlistSpeed == 'custom'" class="ui-inputgroup">
            <input pInputText type="number" min="1" max="20000" placeholder="Speed" [(ngModel)]="playlistCustomSpeed" (ngModelChange)="onPlaylistCustomSpeedSelected($event)">
            <span class="ui-inputgroup-addon">Mbps</span>
          </div>
        </p-overlayPanel>

        <!-- NIC -->
        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<p-dropdown [options]="networkInterfaces" [(ngModel)]="selectedNetworkInterface" (ngModelChange)="onNicSelected($event)" placeholder="Select a NIC" optionLabel="name" filter="true"></p-dropdown>

        <!-- Looping -->
        <!--<p-dropdown [options]="loopingOptions" [(ngModel)]="selectedLoopingOption" (ngModelChange)="onLoopingSelected($event)" placeholder="Looping" optionLabel="name"></p-dropdown>-->

        <button pButton label="Looping" type="button" (click)="playlistLoopingSelector.toggle($event)"></button>&nbsp;
        <ng-container *ngIf="!playlistLooping">No pcap looping selected</ng-container>
        <ng-container *ngIf="playlistLooping == 'none'">None</ng-container>
        <ng-container *ngIf="playlistLooping == 'repeat'">Repeat Indefinitely</ng-container>
        <ng-container *ngIf="playlistLooping == 'custom'">{{playlistCustomLooping}} Times</ng-container>&nbsp;
        <p-overlayPanel #playlistLoopingSelector appendTo="body">
          <div><p-radioButton name="loopGroup1" label="None" value="none" [(ngModel)]="playlistLooping" (ngModelChange)="onPlaylistLoopingSelected($event)"></p-radioButton></div>
          <div><p-radioButton name="loopGroup1" label="Repeat Indefinitely" value="repeat" [(ngModel)]="playlistLooping" (ngModelChange)="onPlaylistLoopingSelected($event)"></p-radioButton></div>
          <div><p-radioButton name="loopGroup1" label="Custom" value="custom" [(ngModel)]="playlistLooping" (ngModelChange)="onPlaylistLoopingSelected($event)"></p-radioButton></div>
          <div *ngIf="playlistLooping == 'custom'" class="ui-inputgroup">
            <input pInputText type="number" min="1" max="20000" placeholder="Times" [(ngModel)]="playlistCustomLooping" (ngModelChange)="onPlaylistCustomLoopingSelected($event)">
            <span class="ui-inputgroup-addon">Times</span>
          </div>
        </p-overlayPanel>

      </div>
    </p-toolbar>
  </div>



  <!-- playlists -->
  <div style="position: absolute; left: 0; width: 300px; top: 0; bottom: 0; border: 1px solid gray;">

    <p-table #dv [value]="playlists" selectionMode="single" [(selection)]="selectedPlaylist" (onRowSelect)="onPlaylistSelected($event)">

      <ng-template pTemplate="caption">
        <div class="ui-helper-clearfix">
          <div>
            Playlists
            <div style="float: right;">
              <span (click)="onEditPlaylistClicked()" class="icon fa fa-pencil fa-lg fa-fw myButton"></span>
              <span *ngIf="selectedPlaylist" (click)="onDeletePlaylistClicked()" [class.fa-deselect-icon]="selectedPlaylist.name == 'All'" class="icon fa fa-minus fa-lg fa-fw myButton"></span>
              <span (click)="onAddPlaylistClicked()" class="icon fa fa-plus fa-lg fa-fw myButton"></span>
            </div>
          </div>
        </div>
      </ng-template>


      <ng-template pTemplate="body" let-rowData>
        <tr [pSelectableRow]="rowData" [dragula]='"first-bag"' class="canDrop" [attr.name]="rowData.name">
          <td>
            <span>&nbsp;{{rowData.name}}</span>
            <span style="float: right;">{{rowData.count}}&nbsp;&nbsp;</span>
          </td>
        </tr>
      </ng-template>

    </p-table>
  </div>



  <div *ngIf="displayedPcaps.length != 0" style="position: absolute; left: 301px; right: 0; top: 80px; bottom: 0;">

    <!-- pcaps -->
    <div style="position: absolute; left: 0; width: 75%; top: 0; bottom: 0; overflow: auto;">
      <p-table #pcapTable [value]="displayedPcaps" selectionMode="multiple" [(selection)]="selectedPcaps" (onRowSelect)="onPcapSelected($event)" (onRowUnselect)="onPcapUnselected($event)" (onRowReorder)="onRowReorder($event)">

        <ng-template pTemplate="header">
          <tr>
            <th *ngIf="selectedPlaylist">PCAPs in playlist "{{selectedPlaylist.name}}"
          </tr>
        </ng-template>

        <ng-template pTemplate="body" let-pcap let-rowIndex="rowIndex">
          <tr [pSelectableRow]="pcap" [pSelectableRowIndex]="rowIndex" [pReorderableRow]="rowIndex" [dragula]='"first-bag"' [attr.pcapId]="pcap.id">
            <td>
              <pcap-tile *ngIf="selectedPlaylist" [pcap]="pcap" [rowIndex]="rowIndex" [selectedPcaps]="selectedPcaps" [networkInterfaces]="networkInterfaces" [playlist]="selectedPlaylist"></pcap-tile>
            </td>
          </tr>
        </ng-template>
      </p-table>
    </div>



    <!-- the playlist -->
    <div style="position: absolute; right: 0; width: 25%; top: 0; bottom: 0;">
      Play Queue
    </div>


  </div>



  <!-- modals -->

  <p-dialog header="Add a PCAP" [(visible)]="showAddPcapDialog">

    <h3 style="margin-bottom: 5px; margin-top: 0;" class="first">Upload one or more PCAPs</h3>
    <div style="margin-bottom: 10px;">You may drag and drop files onto the 'choose' button</div>
    <p-fileUpload #uploader name="file[]" [url]="getUploadUrl()" (onUpload)="onUpload($event)" multiple="multiple" accept=".pcap" previewWidth="0" method="POST">
    </p-fileUpload>

  </p-dialog>


  <p-dialog header="Create a Playlist" [(visible)]="showAddPlaylistDialog">
    <p></p>
    <span class="ui-float-label">
      <input id="float-input" type="text" size="30" [(ngModel)]="newPlaylistName" pInputText>
      <label for="float-input">Enter a Playlist Name</label>
    </span>
    <p style="float: right;">
      <p-button (onClick)="addPlaylistCancel()" label="Cancel" icon="fa fa-fw fa-close"></p-button>&nbsp;
      <p-button (onClick)="addPlaylistSubmit(newPlaylistName)" label="Okay" icon="fa fa-fw fa-check"></p-button>
    </p>
  </p-dialog>

  <p-dialog *ngIf="selectedPlaylist" header="Confirm Playlist Deletion" [(visible)]="showDeletePlaylistDialog">
    <p>
      Please confirm whether you want to delete playlist "{{selectedPlaylist.name}}"<br><br>
      The PCAPs in the collection will not be deleted.
    </p>
    <p style="float: right;">
      <p-button (onClick)="showDeletePlaylistDialog = false" label="Cancel" icon="fa fa-fw fa-close"></p-button>&nbsp;
      <p-button (onClick)="onDeletePlaylistConfirmed(selectedPlaylist.name)" label="Confirm" icon="fa fa-fw fa-times"></p-button>
    </p>
  </p-dialog>

  <p-dialog *ngIf="selectedPlaylist" header="Confirm PCAP Removal" [(visible)]="showRemovePcapsDialog">
    <p>
      Please confirm removal of selected PCAP(s) from playlist "{{selectedPlaylist.name}}"<br><br>
      The PCAPs themselves will not be deleted, and will remain in the "All" collection.
    </p>
    <p style="float: right;">
      <p-button (onClick)="showRemovePcapsDialog = false" label="Cancel" icon="fa fa-fw fa-close"></p-button>&nbsp;
      <p-button (onClick)="onRemovePcapsConfirmed()" label="Confirm" icon="fa fa-fw fa-minus"></p-button>
    </p>
  </p-dialog>

  <p-dialog header="Selected Playlist Deleted" [(visible)]="showSelectedPlaylistDeletedDialog">
    <p>Ever so sorry, but a highly inconsiderate person has deleted the Playlist that you were using.</p>
    <p style="float: right;">
      <p-button (onClick)="showSelectedPlaylistDeletedDialog = !showSelectedPlaylistDeletedDialog" label="Okay" icon="fa fa-fw fa-check"></p-button>
    </p>
  </p-dialog>

  <p-confirmDialog></p-confirmDialog>

  <img class="noselect" src="/assets/logo-blacktext.png" style="position: absolute; right:10px; bottom: 15px;">

</div>
  `,
  styles: [`

.myButton {
  color: black;
  float: right;
}

.fa-deselect {
  background-color: grey;
  color: black;
}

.fa-deselect-icon {
  /*background-color: grey;*/
  color: white;
}

.pcapGroup:active {
  font-weight: bold;
}

tr.canDrop.ui-state-highlight {
  pointer-events: none;
}

  `]
})
export class AppComponent implements OnInit, OnDestroy {

  constructor(  private dataService: DataService,
                private confirmationService: ConfirmationService,
                private playlistService: PlaylistService,
                private dragulaService: DragulaService ) {
                  dragulaService.setOptions('first-bag', {
                    copy: true,
                    copySortSource: false,
                    accepts: function(el, target, source, sibling) {
                      // causes only the playlist name to be droppable
                      if (target.classList.contains('canDrop') && target.getAttribute('name') !== 'All') {
                        return true;
                      }
                      return false;
                    },
                    moves: function(el, target, source, sibling) {
                      // causes only a pcap to be draggable
                      // its order drag handle will not be draggable
                      // console.log('moves(): el', el);
                      // console.log('moves(): source', source);
                      if (target.classList.contains('canDrop') || source.classList.contains('fa-arrows') ) {
                        return false;
                      }
                      return true;
                    }
                  });
                  this.bag = dragulaService.find('first-bag');
                  this.drake = this.bag.drake;
                }

  @ViewChild('uploader') private uploader;

  // api
  public serverUrl = `${window.location.protocol}//${window.location.hostname}:3003`;
  public apiUrl = `${window.location.protocol}//${window.location.hostname}:3003/api`;
  public uploadUrl = `${this.apiUrl}/pcap/upload`;

  // data
  public playlist: any[] = [];
  public playlists: Playlist[] = [];
  public playlistsObj: any = {};
  private pcaps: Pcap[] = [];
  public displayedPcaps: Pcap[] = [];
  public preferences: Preferences = null;
  public messages: Message[]; // holds status messages
  public newPlaylistName: string = null;
  public networkInterfaces: NetworkInterface[] = [];
  public playlistSpeed: string = null;
  public playlistCustomSpeed: number;
  public playlistLooping: string = null;
  public playlistCustomLooping: number = null;

  // selections
  public selectedPlaylist: Playlist = null;
  public selectedPcaps: Pcap[] = [];
  public selectedLoopingOption: any = null;
  public selectedNetworkInterface: NetworkInterface = null;



  // options
  public loopingOptions: any = [
    { name: 'None', value: 'none' },
    { name: 'Repeat', value: 'repeat' },
    { name: 'Custom', value: 'custom' }
  ];

  // dialog open / close placeholders
  public showAddPcapDialog = false;
  public showAddPlaylistDialog = false;
  public showSelectedPlaylistDeletedDialog = false;
  public showDeletePlaylistDialog = false;
  public showRemovePcapsDialog = false;

  // Dragula
  private drake: any = null;
  private bag: any = null;
  private dragulaDragSubscription: Subscription = this.dragulaService.drag.subscribe( value => this.onDragStart(value) );
  private dragulaDropSubscription: Subscription = this.dragulaService.drop.subscribe( value => this.onDrop(value) );
  private dragulaShadowSubscription: Subscription = this.dragulaService.shadow.subscribe( value => this.onShadow(value) );



  // Data Subscriptions
  private playlistsChangedSubscription: Subscription = this.dataService.playlistsChanged.subscribe( playlists => this.onPlaylistsChanged(playlists) );
  private pcapsChangedSubscription: Subscription = this.dataService.pcapsChanged.subscribe( pcaps => this.onPcapsChanged(pcaps) );
  private preferencesChangedSubscription: Subscription = this.dataService.preferencesChanged.subscribe( preferences => this.onPreferencesChanged(preferences) );
  private networkInterfacesUpdatedSubscription: Subscription = this.dataService.networkInterfacesUpdated.subscribe( interfaces => this.onNetworkInterfacesChanged(interfaces) );


  ngOnInit(): void {
    // this.selectedPlaylist = this.allPlaylist;
    // this.defaultSpeed = this.dataService.getPreference('defaultSpeed') || null;
    // this.customDefaultSpeed = Number(this.dataService.getPreference('customDefaultSpeed')) || 50;
    // this.selectedNetworkInterface = JSON.parse(this.dataService.getPreference('selectedNetworkInterface')) || null;
  }



  ngOnDestroy(): void {
    this.playlistsChangedSubscription.unsubscribe();
    this.pcapsChangedSubscription.unsubscribe();
    this.preferencesChangedSubscription.unsubscribe();
    this.networkInterfacesUpdatedSubscription.unsubscribe();
    this.dragulaDropSubscription.unsubscribe();
    this.dragulaDragSubscription.unsubscribe();
    this.dragulaShadowSubscription.unsubscribe();
  }



  idsToPcaps(ids: string[]): Pcap[] {
    let pcaps: Pcap[] = [];
    for (let i = 0; i < ids.length; i++) {
      let id = ids[i];
      for (let x = 0; x < this.pcaps.length; x++) {
        let pcap = this.pcaps[x];
        if (id === pcap.id) {
          pcaps.push(pcap);
          break;
        }
      }
    }
    return pcaps;
  }



  loadPlaylistSettings(): void {
    if ('interface' in this.selectedPlaylist.settings) {

      console.log('loadPlaylistSettings(): interface setting found');

      for (let i = 0; i < this.networkInterfaces.length; i++) {
        let nic = this.networkInterfaces[i];
        if (nic.name === this.selectedPlaylist.settings.interface) {
          console.log('loadPlaylistSettings(): setting interface nic:', nic);
          this.selectedNetworkInterface =  JSON.parse(JSON.stringify(nic));
          break;
        }
      }
    }


    if ('looping' in this.selectedPlaylist.settings) {

      // console.log('loadPlaylistSettings(): looping setting found');

      if (this.selectedPlaylist.settings.looping === 'custom') {
        if ('customLooping' in this.selectedPlaylist.settings) {
          this.playlistLooping = 'custom';
          this.playlistCustomLooping = this.selectedPlaylist.settings.customLooping;
          console.log('loadPlaylistSettings(): setting looping:', this.playlistLooping);
          console.log('loadPlaylistSettings(): setting custom looping:', this.playlistCustomLooping);
        }
      }
      else {
        this.playlistLooping = this.selectedPlaylist.settings.looping;
        console.log('loadPlaylistSettings(): setting looping:', this.playlistLooping);
      }

    }

    if ('speed' in this.selectedPlaylist.settings) {

      // console.log('loadPlaylistSettings(): speed setting found');

      if (this.selectedPlaylist.settings.speed === 'custom') {
        if ('customSpeed' in this.selectedPlaylist.settings) {
          this.playlistSpeed = 'custom';
          this.playlistCustomSpeed = this.selectedPlaylist.settings.customSpeed;
        }
      }
      else {
        this.playlistSpeed = this.selectedPlaylist.settings.speed;
      }
    }
  }



  onPlaylistsChanged(playlists: Playlist[]): void {
    console.log('onPlaylistsChanged(): playlists:', playlists);
    // playlists.unshift(this.allPlaylist); // add the 'all' group as the first group element
    setTimeout( () => {
      this.playlists = playlists;

      // create an object of our playlists which we can easily reference later
      let plObj: any = {};
      for (let i = 0; i < this.playlists.length; i++) {
        let pl = this.playlists[i];
        let name = pl.name;
        plObj[name] = pl;
      }
      this.playlistsObj = plObj;

      if (!this.selectedPlaylist) {
        // if we're just loading, select the All playlist
        this.selectedPlaylist = this.playlists[0];
      }

      if (this.selectedPlaylist && !(this.selectedPlaylist.name in this.playlistsObj) ) {
        // if someone has deleted the selected playlist, reselect 'All' playlist
        this.selectedPlaylist = this.playlists[0];
        this.showSelectedPlaylistDeletedDialog = true;
      }

      if (this.selectedPlaylist) {
        let name = this.selectedPlaylist.name;
        this.selectedPlaylist = this.playlistsObj[name];
      }

      this.displayedPcaps = this.idsToPcaps(this.selectedPlaylist.pcaps);

      this.loadPlaylistSettings();

    }, 0 );
  }



  onDeletePcapClicked(): void {
    console.log('onDeletePcapClicked()');

    if (this.selectedPcaps.length === 0) {
      return;
    }

    let filenamesToDelete = [];
    let pcapIdsToDelete = [];
    for (let i = 0; i < this.selectedPcaps.length; i++) {
      let pcap = this.selectedPcaps[i];
      filenamesToDelete.push(pcap.originalFilename);
      pcapIdsToDelete.push(pcap.id);
    }
    let deletetionText = filenamesToDelete.join('<br>');
    let pluralizedPcap = 'file';
    if (filenamesToDelete.length > 1) {
      pluralizedPcap = 'files';
    }

    this.confirmationService.confirm({
      message: `Do you want to delete the selected PCAP ${pluralizedPcap}?<p class="deleteItems">${deletetionText}</p>`,
      header: `Delete PCAP ${pluralizedPcap}`,
      icon: 'fa fa-trash',
      accept: () => {
        this.dataService.deletePcaps(pcapIdsToDelete)
                        .then( () => {
                          this.messages = [{severity: 'info', summary: 'Confirmed', detail: `${filenamesToDelete.length} PCAP ${pluralizedPcap} deleted`}];
                          this.selectedPcaps = []; // we need to clear the selection as we just deleted what was selected
                        })
                        .catch( err => {
                          console.error(err);
                          this.messages = [{severity: 'error', summary: 'Error', detail: `The server reported an error when deleting PCAP files:<br><br>${err.error.error || 'unknown'}`}];
                        });
      },
      reject: null
  });
  }



  onPcapsChanged(pcaps: Pcap[]): void {
    // console.log('onPcapsChanged() pcaps:', pcaps);
    this.pcaps = pcaps;
    // this.allPlaylist.pcaps = this.pcaps;
    // this.allPlaylist.count = this.pcaps.length;
    /*if (this.selectedPlaylist ) {
      this.displayedPcaps = this.idsToPcaps()
    }*/
    // setTimeout( () => this.pcaps = pcaps, 0 );
  }



  onPreferencesChanged(preferences: Preferences): void {
    setTimeout( () => this.preferences = preferences, 0 );
  }



  onAddPlaylistClicked(): void {
    this.showAddPlaylistDialog = true;
  }



  addPlaylistCancel(): void {
    this.showAddPlaylistDialog = false;
  }



  onEditPlaylistClicked(): void {

  }



  onNewPcapClicked(): void {
    this.showAddPcapDialog = true;
    this.uploader.clear();
  }



  onUpload(event): void {
    // triggers after an upload has completed
    console.log('onUpload(): event:', event);
    this.showAddPcapDialog = false;
    this.messages = [];
    this.messages.push({severity: 'info', summary: 'Files uploaded successfully', detail: ''});
  }



  onPlaylistSelected(event): void {
    console.log(`onPlaylistSelected(): event:`, event);
    console.log(`onPlaylistSelected(): selectedPlaylist:`, this.selectedPlaylist);
    setTimeout( () => this.displayedPcaps = [], 0); // clear the display first to force the pcap's to re-init
    setTimeout( () => {
      this.displayedPcaps = this.idsToPcaps(event.data.pcaps);
      let selectedName = event.data.name;
      /*if (selectedName === this.selectedPlaylist.name) {
        return;
      }*/
      this.selectedPcaps = [];
      this.loadPlaylistSettings();
    }, 0);
  }



  onPcapSelected(event): void {
    console.log('onPcapSelected(): event:', event);
    console.log('onPcapSelected(): selectedPcaps:', this.selectedPcaps);
  }



  onPcapUnselected(event): void {
    console.log('onPcapUnselected(): event:', event);
    console.log('onPcapUnselected(): selectedPcaps:', this.selectedPcaps);
  }



  onNetworkInterfacesChanged(interfaces: any) {
    let nics = interfaces.sort(compare);
    this.networkInterfaces = nics;
  }



  onSelectAllPcaps(): void {
    this.selectedPcaps = this.pcaps;
  }



  onSelectNonePcaps(): void {
    this.selectedPcaps = [];
  }



  onPlaylistSpeedSelected(option: string): void {
    console.log('onPlaylistSpeedSelected(): option:', option);
    if (option === 'custom') {
      // this will be set once the custom value has been entered
      return;
    }
    this.playlistService.setPlaylistSpeed(this.selectedPlaylist.name, option);
  }



  onPlaylistCustomSpeedSelected(option: number): void {
    console.log('onPlaylistCustomSpeedSelected(): option:', option);
    this.playlistService.setPlaylistCustomSpeed(this.selectedPlaylist.name, option);
  }



  onPlaylistLoopingSelected(option: string): void {
    console.log('onPlaylistLoopingSelected(): option:', option);
    if (option === 'custom') {
      // this will be set once the custom value has been entered
      return;
    }
    this.playlistService.setPlaylistLoop(this.selectedPlaylist.name, option);
  }



  onPlaylistCustomLoopingSelected(option: number): void {
    console.log('onPlaylistCustomLoopingSelected(): option:', option);
    this.playlistService.setPlaylistCustomLoop(this.selectedPlaylist.name, option);
  }



  onNicSelected(event): void {
    console.log('onNicSelected(): event', event);
    // this.dataService.setPreference('selectedNetworkInterface', JSON.stringify(this.selectedNetworkInterface));
    this.playlistService.setPlaylistNic(this.selectedPlaylist.name, event.name);
  }



  onLoopingSelected(event): void {
    console.log('onLoopingSelected(): event', event);
    // this.dataService.setPreference('selectedNetworkInterface', JSON.stringify(this.selectedNetworkInterface));
    this.playlistService.setPlaylistLoop(this.selectedPlaylist.name, event.value);
  }



  addPlaylistSubmit(name): void {
   this.dataService.addPlaylist(name)
                   .then( () => {
                     this.showAddPlaylistDialog = false;
                     this.newPlaylistName = '';
                   })
                   .catch( () => {

                   });
  }



  onDeletePlaylistClicked(): void {
    if (this.selectedPlaylist.name === 'All') {
      return;
    }
    this.showDeletePlaylistDialog = true;
  }


  onDeletePlaylistConfirmed(name): void {
    this.selectedPlaylist = this.playlists[0];
    this.dataService.deletePlaylist(name)
                    .then( () => {
                      this.showDeletePlaylistDialog = false;
                      this.messages = [];
                      this.messages.push({severity: 'info', summary: `Playlist "${name}" deleted successfully`, detail: ''});
                    })
                    .catch( (err) => {
                      this.messages = [];
                      this.messages.push({severity: 'error', summary: 'Error', detail: `The server reported an error when deleting playlist "${name}<br><br>${err.error.error || 'unknown'}"`});
                    });
      this.selectedPcaps = [];
  }



  onDragStart(event): void {
    console.log('onDragStart', event);
  }



  onDragEnd(event): void {
    console.log('onDragEnd', event);
  }



  onDrop(event): void {
    console.log('onDrop(): event', event);
    // let bag = this.dragulaService.find('first-bag');
    // console.log('onDrop(): bag:', this.bag);
    // console.log('onDrop(): drake:', this.drake);
    this.drake.cancel(true);
    let [bagname, el, target, source, sibling] = event;
    if (!target) {
      // target will be null if we drag onto the area after our last playlist anme
      return;
    }
    let playlistName = target.getAttribute('name');
    // console.log('onDrop(): playlistName:', playlistName);
    let pcapIdsToAdd = [];
    if (this.selectedPcaps && this.selectedPcaps.length !== 0) {
      // we have selected multiple pcaps
      for (let i = 0; i < this.selectedPcaps.length; i++) {
        let pcap = this.selectedPcaps[i];
        pcapIdsToAdd.push(pcap.id);
      }
    }
    else {
      // we dragged a pcap without first click-selecting it
      console.log('onDrop(): source', source);
      let id = source.getAttribute('pcapId');
      pcapIdsToAdd.push(id);
    }
    // console.log('onDrop(): pcapIdsToAdd', pcapIdsToAdd);
    this.playlistService.addPcapsToPlaylist(playlistName, pcapIdsToAdd)
                        .then( (newLength) => {
                          this.messages = [];
                          let pluralStr = 'PCAP';
                          let pluralStr1 = 'was';
                          if (newLength === 0 || newLength > 1) {
                            pluralStr = 'PCAPs';
                            pluralStr1 = 'were';
                          }
                          this.messages.push({severity: 'info', summary: `${newLength} new ${pluralStr} ${pluralStr1} added to playlist "${playlistName}"`, detail: ''});
                        } )
                        .catch( err => {
                          this.messages = [];
                          this.messages.push({severity: 'error', summary: 'Error', detail: `The server reported an error when updating playlist "${playlistName}<br><br>${err.error.error || 'unknown'}"`});
                        });
      this.selectedPcaps = [];
  }



  onDragEnter(event): void {
    console.log('onDragEnter(): event:', event);
  }



  onShadow(event): void {
    let [bagname, el, container, source] = event;
    console.log('onShadow(): el:', el);
    console.log('onShadow(): container:', container);
    console.log('onShadow(): source:', source);
    el.style.display = 'none';
  }



  onRemovePcapsClicked(): void {
    if (this.selectedPcaps.length === 0) {
      return;
    }
    this.showRemovePcapsDialog = true;
  }


  onRemovePcapsConfirmed(): void  {
    // when a pcap is removed from a non-All playlist
    // it doesn't delete the pcap
    let pcapIdsToRemove = [];
    if (this.selectedPcaps && this.selectedPcaps.length !== 0) {
      // we have selected multiple pcaps
      for (let i = 0; i < this.selectedPcaps.length; i++) {
        let pcap = this.selectedPcaps[i];
        pcapIdsToRemove.push(pcap.id);
      }
    }
    this.playlistService.removePcapsFromPlaylist(this.selectedPlaylist.name, pcapIdsToRemove)
                        .then( (newLength) => {
                          this.messages = [];
                          let pluralStr = 'PCAP';
                          let pluralStr1 = 'was';
                          if (newLength === 0 || newLength > 1) {
                            pluralStr = 'PCAPs';
                            pluralStr1 = 'were';
                          }
                          this.messages.push({severity: 'info', summary: `${newLength} ${pluralStr} ${pluralStr1} removed from playlist "${this.selectedPlaylist.name}"`, detail: ''});
                        } )
                        .catch( err => {
                          this.messages = [];
                          this.messages.push({severity: 'error', summary: 'Error', detail: `The server reported an error when updating playlist "${this.selectedPlaylist.name}<br><br>${err.error.error || 'unknown'}"`});
                        });
    this.selectedPcaps = [];
    this.showRemovePcapsDialog = false;
  }



  getUploadUrl(): string {
    if (this.selectedPlaylist) {
      return `${this.uploadUrl}/${this.selectedPlaylist.name}`;
    }
    return `${this.uploadUrl}/undefined`;
  }



  onRowReorder(event): void {
    console.log('onRowReorder(): event:', event);
    let [dragIndex, dropIndex] = event;
    console.log('onRowReorder(): this.displayedPcaps:', this.displayedPcaps);
    let pcapIds = [];
    for (let i = 0; i < this.displayedPcaps.length; i++) {
      let pc = this.displayedPcaps[i];
      pcapIds.push(pc.id);
    }
    this.playlistService.setPlaylistOrder(this.selectedPlaylist.name, pcapIds);
  }

}
