import { Injectable } from '@angular/core';
import * as io from 'socket.io-client';
import { BehaviorSubject, Subject } from 'rxjs';
import { Preferences } from './preferences';
import { Playlist } from './playlist';
import { Pcap } from './pcap';
import { HttpHeaders, HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})

export class DataService {

  constructor(private http: HttpClient) {
    // Subscribe to socket events
    this.socket.on('disconnect', reason => {
      // log.debug('Server disconnected socket with reason:', reason);
      if (reason === 'io server disconnect') {
        // the server disconnected us forcefully.  maybe due to logout or token timeout
        // start trying to reconnect
        // this will repeat until successful
        this.socket.open();
      }
    } );
    this.socket.on('connect', socket => console.debug('Socket.io connected to server' ));
    this.socket.on('preferences', preferences => this.onPreferencesUpdate(preferences) );
    this.socket.on('serverVersion', version => this.onServerVersionUpdate(version) );
    this.socket.on('pcaps', pcaps => this.onPcapsUpdate(pcaps) );
    this.socket.on('playlists', playlists => this.onPlaylistsUpdate(playlists) );
    this.socket.on('tcpreplayFound', found => this.onTcpreplayFound(found) );
    this.socket.on('networkInterfaces', interfaces => this.onNetworkInterfacesUpdate(interfaces) );
  }

  private serverUrl = `${window.location.protocol}//${window.location.hostname}:3003`;
  private apiUrl = `${this.serverUrl}/api`;
  private socket = io(this.serverUrl);
  private preferences: Preferences = null;
  private serverVersion: string = null;
  private networkInterfaces: any = [];

  // Observables
  public preferencesChanged: BehaviorSubject<any> = new BehaviorSubject<any>(this.preferences);
  public pcapsChanged: Subject<any> = new Subject<any>();
  public playlistsChanged: Subject<any> = new Subject<any>();
  public tcpreplayFoundUpdated: BehaviorSubject<any> = new BehaviorSubject<any>(false);
  public networkInterfacesUpdated: BehaviorSubject<any> = new BehaviorSubject<any>(this.networkInterfaces);



  onPreferencesUpdate(preferences): void {
    console.debug(`DataService: onPreferencesUpdate(): preferences:`, preferences);
    this.preferences = preferences;
    this.preferencesChanged.next(this.preferences);
  }



  onServerVersionUpdate(version): void {
    console.debug(`DataService: onServerVersionUpdate(): version: ${version}`);
    this.serverVersion = version;
  }



  onPcapsUpdate(pcaps): void {
    console.debug(`DataService: onPcapsUpdate(): pcaps:`, pcaps);
    this.pcapsChanged.next(pcaps);
  }



  onPlaylistsUpdate(playlists): void {
    console.debug(`DataService: onPlaylistsUpdate(): playlists:`, playlists);
    this.playlistsChanged.next(playlists);
  }



  onTcpreplayFound(found): void {
    console.debug(`DataService: onTcpreplayFound(): found: ${found}`);
    this.tcpreplayFoundUpdated.next(found);
  }



  onNetworkInterfacesUpdate(interfaces): void {
    console.debug(`DataService: onNetworkInterfacesUpdate(): interfaces:`, interfaces);
    this.networkInterfaces = interfaces;
    this.networkInterfacesUpdated.next(this.networkInterfaces);
  }



  deletePcaps(pcapIds: string[]): Promise<any> {
    console.debug('DataService: deletePcaps():', pcapIds);
    return this.http.post(this.apiUrl + '/pcap/delete', pcapIds )
                    .toPromise();
  }



  addPlaylist(name: string): Promise<any> {
    console.debug('DataService: addPlaylist():', name);
    return this.http.get(this.apiUrl + '/playlist/' + name )
                    .toPromise();
  }



  deletePlaylist(name: string): Promise<any> {
    console.debug('DataService: deletePlaylist():', name);
    return this.http.delete(this.apiUrl + '/playlist/' + name)
                    .toPromise();
  }



  updatePlaylist(playlist: Playlist, newLength: number): Promise<any> {
    console.debug('DataService: updatePlaylist():', playlist.name);
    return this.http.post(this.apiUrl + '/playlist/update', playlist )
                    .toPromise()
                    .then( () => newLength );
  }



  setPreference(key, value): void {
    localStorage.setItem(key, value);
  }



  getPreference(key): any {
    return localStorage.getItem(key);
  }

}
