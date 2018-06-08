interface NetworkAddress {
  addr: string;
  netmask: string;
  broadaddr: string;
}

export interface NetworkInterface {
  name: string;
  addresses: NetworkAddress[];
  flags?: string;
}
