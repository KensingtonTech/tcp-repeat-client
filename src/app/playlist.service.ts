import { Injectable } from '@angular/core';
import { Pcap } from './pcap';
import { Playlist, PlaylistSettings } from './playlist';
import { DataService } from './data.service';
import { Subscription } from 'rxjs';

@Injectable({
  providedIn: 'root'
})

export class PlaylistService {

  constructor(private dataService: DataService) { }

  playlists: Playlist[];
  playlistsObj: any;
  pcaps: Pcap[];
  pcapsObj: any;

  playlistsChangedSubscription: Subscription = this.dataService.playlistsChanged.subscribe( playlists => {
    this.playlists = playlists;
    let playlistsObj = {};
    for (let i = 0; i < this.playlists.length; i++) {
      let playlist = this.playlists[i];
      playlistsObj[playlist.name] = playlist;
    }
    this.playlistsObj = playlistsObj;
  });
  pcapsChangedSubscription: Subscription = this.dataService.pcapsChanged.subscribe( pcaps => {
    this.pcaps = pcaps;
    let pcapsObj = {};
    for (let i = 0; i < this.pcaps.length; i++) {
      let pcap = this.pcaps[i];
      pcapsObj[pcap.id] = pcap;
    }
    this.pcapsObj = pcapsObj;
  });



  addPcapsToPlaylist(playlistName: string, pcapIds: string[]): Promise<any> {
    let playlist: Playlist = this.playlistsObj[playlistName];
    let pcapsToAdd = [];
    for (let i = 0; i < pcapIds.length; i++) {
      let id = pcapIds[i];
      if (!(playlist.pcaps.includes(id))) {
        pcapsToAdd.push(id);
      }
    }
    if (pcapsToAdd.length !== 0) {
      playlist.pcaps = playlist.pcaps.concat(pcapsToAdd);
      return this.dataService.updatePlaylist(playlist, pcapsToAdd.length);
    }
    return Promise.resolve(0);
  }



  removePcapsFromPlaylist(playlistName: string, pcapIds: string[] ): Promise<any> {
    console.log('removePcapsFromPlaylist(): playlistName:', playlistName);
    console.log('removePcapsFromPlaylist(): pcapIds:', pcapIds);
    let playlist: Playlist = this.playlistsObj[playlistName];
    let pcapsRemoved = 0;
    for (let i = 0; i < pcapIds.length; i++) {
      let idToRemove = pcapIds[i];
      for (let x = 0; x < playlist.pcaps.length; x++) {
        let id = playlist.pcaps[x];
        if (idToRemove === id) {
          playlist.pcaps.splice(x, 1);
          pcapsRemoved++;
          break;
        }
      }
    }
    if (pcapsRemoved !== 0) {
      return this.dataService.updatePlaylist(playlist, pcapsRemoved);
    }
    return Promise.resolve(0);
  }



  setPlaylistOrder(playlistName: string, pcapIds: string[]): void {
    let playlist: Playlist = this.playlistsObj[playlistName];
    playlist.pcaps = pcapIds;
    this.dataService.updatePlaylist(playlist, null);
  }



  setPlaylistNic(playlistName: string, nic: string) {
    console.log('setPlaylistNic(): nic:', nic);
    let playlist: Playlist = this.playlistsObj[playlistName];
    playlist.settings.interface = nic;
    this.dataService.updatePlaylist(playlist, null);
  }



  setPlaylistLoop(playlistName: string, loop: string) {
    let playlist: Playlist = this.playlistsObj[playlistName];
    playlist.settings.looping = loop;
    this.dataService.updatePlaylist(playlist, null);
  }



  setPlaylistCustomLoop(playlistName: string, loop: number) {
    let playlist: Playlist = this.playlistsObj[playlistName];
    playlist.settings.looping = 'custom';
    playlist.settings.customLooping = loop;
    this.dataService.updatePlaylist(playlist, null);
  }



  setPlaylistSpeed(playlistName: string, speed: string) {
    let playlist: Playlist = this.playlistsObj[playlistName];
    playlist.settings.speed = speed;
    this.dataService.updatePlaylist(playlist, null);
  }



  setPlaylistCustomSpeed(playlistName: string, speed: number) {
    let playlist: Playlist = this.playlistsObj[playlistName];
    playlist.settings.speed = 'custom';
    playlist.settings.customSpeed = speed;
    this.dataService.updatePlaylist(playlist, null);
  }



  setPcapSettings(playlistName: string, pcapId: string, settings: PlaylistSettings) {
    this.playlistsObj[playlistName].pcapSettings[pcapId] = settings;
  }



  setPcapInterface(playlistName: string, pcapId: string, nic: string) {
    let playlist: Playlist = this.playlistsObj[playlistName];

    if (!(pcapId in playlist.pcapSettings)) {
      playlist.pcapSettings[pcapId] =  {};
    }

    playlist.pcapSettings[pcapId]['interface'] = nic;
    if (nic === 'default' && 'interface' in playlist.pcapSettings) {
      delete playlist.pcapSettings.interface;
    }
    this.dataService.updatePlaylist(playlist, null);
  }



  setPcapSpeed(playlistName: string, pcapId: string, speed: string) {
    let playlist: Playlist = this.playlistsObj[playlistName];

    if (!(pcapId in playlist.pcapSettings)) {
      playlist.pcapSettings[pcapId] =  {};
    }

    playlist.pcapSettings[pcapId]['speed'] = speed;
    if (speed === 'default') {
      if ('speed' in playlist.pcapSettings) {
        delete playlist.pcapSettings.speed;
      }
      if ('customSpeed' in playlist.pcapSettings) {
        delete playlist.pcapSettings.customSpeed;
      }
    }
    this.dataService.updatePlaylist(playlist, null);
  }



  setPcapCustomSpeed(playlistName: string, pcapId: string, customSpeed: number) {
    let playlist: Playlist = this.playlistsObj[playlistName];

    if (!(pcapId in playlist.pcapSettings)) {
      playlist.pcapSettings[pcapId] =  {};
    }

    playlist.pcapSettings[pcapId]['speed'] = 'custom';
    playlist.pcapSettings[pcapId]['customSpeed'] = customSpeed;
    this.dataService.updatePlaylist(playlist, null);
  }



  setPcapLooping(playlistName: string, pcapId: string, looping: string) {
    let playlist: Playlist = this.playlistsObj[playlistName];

    if (!(pcapId in playlist.pcapSettings)) {
      playlist.pcapSettings[pcapId] =  {};
    }

    playlist.pcapSettings[pcapId]['looping'] = looping;
    if (looping === 'default') {
      if ('looping' in playlist.pcapSettings) {
        delete playlist.pcapSettings.looping;
      }
      if ('customLooping' in playlist.pcapSettings) {
        delete playlist.pcapSettings.customLooping;
      }
    }
    this.dataService.updatePlaylist(playlist, null);
  }



  setPcapCustomLooping(playlistName: string, pcapId: string, customLooping: number) {
    let playlist: Playlist = this.playlistsObj[playlistName];

    if (!(pcapId in playlist.pcapSettings)) {
      playlist.pcapSettings[pcapId] =  {};
    }

    playlist.pcapSettings[pcapId]['looping'] = 'custom';
    playlist.pcapSettings[pcapId]['customLooping'] = customLooping;
    this.dataService.updatePlaylist(playlist, null);
  }



  getPcapSettings(playlistName: string, pcapId: string): PlaylistSettings {
    if (playlistName in this.playlistsObj && pcapId in this.playlistsObj[playlistName].pcapSettings) {
      return this.playlistsObj[playlistName].pcapSettings[pcapId];
    }
    return null;
  }

}
