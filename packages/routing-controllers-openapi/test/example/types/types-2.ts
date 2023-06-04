// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace proto {
  export interface LockRequest {
    /** 房间id */
    roomId: number;
  }
  export interface InterfaceAndNamespaceSame {
    name1: proto.InterfaceAndNamespaceSame.item[];
  }
  // eslint-disable-next-line @typescript-eslint/no-namespace
  export namespace InterfaceAndNamespaceSame {
    export interface item {
      id: number;
      name: string;
    }
  }
}

interface InterFaceSame {
  id: string;
}

interface InterFaceSame {
  id2: string;
}

// same interface(InterFaceSame) use new interface wrap
// eslint-disable-next-line  @typescript-eslint/no-empty-interface
export interface InterFaceSameAll extends InterFaceSame {}

// same interface and namespace(InterfaceAndNamespaceSame) use new interface wrap
// eslint-disable-next-line  @typescript-eslint/no-empty-interface
export interface InterfaceAndNamespaceSameAll
  extends proto.InterfaceAndNamespaceSame {}

export interface commonResponse2 {
  /**
   * 多行注释
   * @minimum 1
   * @maximum 10
   * */
  param2: number;
}
