export interface IBrokerOption {
  hosts: string;
  topic: {
    name: string;
  },
  consumer: {
    data: {
      path: string;
    }
  }
}
