import { Pcap } from './pcap';
import { NetworkInterface } from './network-interface';

export interface PlaylistSettings {
  speed?: string; // 'pcap', 'unlimited', 'custom', and for pcaps - 'default'
  customSpeed?: number;
  interface?: string;
  looping?: string; // 'none', 'repeat', 'custom', and for pcaps - 'default'
  customLooping?: number;
}

export interface Playlist {
  name: string;
  count: number;
  pcaps: string[]; // an array of pcap id's
  pcapSettings: any; // { id: {} PlaylistSettings }
  settings?: PlaylistSettings;
}
