import { Component, OnInit, OnChanges, Input } from '@angular/core';
import { Pcap } from './pcap';
import { NetworkInterface } from './network-interface';
import { Playlist, PlaylistSettings } from './playlist';
import { PlaylistService } from './playlist.service';

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'pcap-tile',
  template: `
<ng-container *ngIf="pcap">

    <span pReorderableRowHandle class="fa fa-arrows"><span>&nbsp;{{pcap.originalFilename}}</span></span>
    <div style="display: flex; margin-left: 50px; margin-top: 10px; justify-content: space-around;">

      <!-- pause / play button -->
      <span class="fa fa-3x fa-fw" [class.fa-play]="!playing" [class.fa-pause]="playing" (click)="onPlayPauseClicked($event)"></span>&nbsp;

      <!-- speed -->
      <div *ngIf="speed && pcap" (click)="preventTileSelection($event)">
        Speed
        <div><p-radioButton [name]="'speedGroup' + pcap.id" label="Playlist Default" value="default" [(ngModel)]="speed" (ngModelChange)="onSpeedChanged($event)"></p-radioButton></div>
        <div><p-radioButton [name]="'speedGroup' + pcap.id" label="PCAP Speed" value="pcap" [(ngModel)]="speed" (ngModelChange)="onSpeedChanged($event)"></p-radioButton></div>
        <div><p-radioButton [name]="'speedGroup' + pcap.id" label="Top Speed" value="unlimited" [(ngModel)]="speed" (ngModelChange)="onSpeedChanged($event)"></p-radioButton></div>
        <div>
          <p-radioButton [name]="'speedGroup' + pcap.id" label="Custom" value="custom" [(ngModel)]="speed" (ngModelChange)="onSpeedChanged($event)">
            <span>abcdefg</span>
          </p-radioButton>
        </div>
      </div>&nbsp;

      <!-- nic's -->
      <div (click)="preventTileSelection($event)">
        Interface
        <div *ngIf="nics">
          <p-dropdown [options]="nics" [(ngModel)]="selectedNetworkInterface" (ngModelChange)="onInterfaceChanged()" optionLabel="name" filter="true"></p-dropdown>
        </div>
      </div>&nbsp;

      <!-- looping -->
      <div style="display: inline-block;" (click)="preventTileSelection($event)">
        Looping
        <div><p-radioButton [name]="'loopGroup' + pcap.id" label="Playlist Default" value="default" [(ngModel)]="looping" (ngModelChange)="onLoopingChanged($event)" (click)="preventTileSelection($event)"></p-radioButton></div>
        <div><p-radioButton [name]="'loopGroup' + pcap.id" label="None" value="none" [(ngModel)]="looping" (ngModelChange)="onLoopingChanged($event)" (click)="preventTileSelection($event)"></p-radioButton></div>
        <div><p-radioButton [name]="'loopGroup' + pcap.id" label="Repeat" value="repeat" [(ngModel)]="looping" (ngModelChange)="onLoopingChanged($event)" (click)="preventTileSelection($event)"></p-radioButton></div>
        <div>
          <p-radioButton [name]="'loopGroup' + pcap.id" label="Custom" value="custom" [(ngModel)]="looping" (ngModelChange)="onLoopingChanged($event)"></p-radioButton>
          <div *ngIf="looping == 'custom'" class="ui-inputgroup" (click)="preventTileSelection($event)">
            <input pInputText type="number" min="2" max="10000" [(ngModel)]="customLooping">
            <span class="ui-inputgroup-addon"> Times</span>
          </div>
        </div>
      </div>
    </div>


</ng-container>
  `,
  styles: [`

  `]
})

export class PcapTileComponent implements OnInit, OnChanges {

  constructor(private playlistService: PlaylistService) { }

  @Input() pcap: Pcap = null;
  @Input() rowIndex: any = null;
  @Input() selectedPcaps: Pcap[] = null;
  @Input() playlist: Playlist = null; // the currently selected playlist
  @Input() networkInterfaces:  NetworkInterface[] = null;

  // selections
  nics: NetworkInterface[] = null; // a copy of networkInterfaces with default added
  selectedNetworkInterface: NetworkInterface = null;
  looping = 'default';
  customLooping = null;
  speed = 'default';
  customSpeed = 0;
  pcapSettings: PlaylistSettings = null;

  // state
  active = false;
  playing = false;


  ngOnInit(): void {
    // console.log('PcapTileComponent: ngOnInit(): pcap:', this.pcap);
    // console.log('PcapTileComponent: ngOnInit(): rowIndex:', this.rowIndex);

    this.nics = JSON.parse(JSON.stringify(this.networkInterfaces)); // we don't want to directly modify an @Input
    this.nics.unshift( { name: 'Playlist Default', addresses: [] } );
    this.selectedNetworkInterface = this.nics[0];

    this.pcapSettings = this.playlistService.getPcapSettings(this.playlist.name, this.pcap.id);
    console.log('PcapTileComponent: ngOnInit(): pcapSettings:', this.pcapSettings);
    if (this.pcapSettings) {
      if ('speed' in this.pcapSettings) {
        this.speed = this.pcapSettings.speed;
      }
      if ('customSpeed' in this.pcapSettings) {
        this.customSpeed = this.pcapSettings.customSpeed;
      }
      if ('looping' in this.pcapSettings) {
        this.looping = this.pcapSettings.looping;
      }
      if ('customLooping' in this.pcapSettings) {
        this.customLooping = this.pcapSettings.customLooping;
      }
      if ('interface' in this.pcapSettings) {
        for (let i = 0; i < this.networkInterfaces.length; i++) {
          let nic = this.networkInterfaces[i];
          if (nic.name === this.pcapSettings.interface) {
            this.selectedNetworkInterface = nic;
            break;
          }
        }
      }
    }
  }



  ngOnChanges(data: any): void {
    // console.log('PcapTileComponent: ngOnChanges(): data:', data);
    this.active = false;
    if ('selectedPcaps' in data && data.selectedPcaps.currentValue.length !== 0) {
      for (let i = 0; i < this.selectedPcaps.length; i++) {
        let pcap = this.selectedPcaps[i];
        if (pcap.id === this.pcap.id) {
          this.active = true;
        }
      }
    }
  }



  onPlayPauseClicked(event): void {
    // console.log('PcapTileComponent: onPlayPauseClicked(): event:', event);
    event.stopPropagation();
    this.playing = !this.playing;
  }



  onLoopingChanged(event: string): void {
    this.playlistService.setPcapLooping(this.playlist.name, this.pcap.id, event);
  }



  onInterfaceChanged(): void {
    this.playlistService.setPcapInterface(this.playlist.name, this.pcap.id, this.selectedNetworkInterface.name);
  }



  preventTileSelection(event): void {
    event.stopPropagation();
  }



  onSpeedChanged(event): void {
    console.log('onSpeedChanged() event:', event);
    this.playlistService.setPcapSpeed(this.playlist.name, this.pcap.id, event);
  }

}
