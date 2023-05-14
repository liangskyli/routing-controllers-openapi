export type Item = {
  id: string;
  name: string;
  pics: string[];
};
export type user = {
  name: string;
  id: number;
  list: Item[];
};
export type userWithList = Pick<user, 'list'>;
export type getUserRequest = {
  /** a any */
  a: any;
  b: string;
  c: { d?: string };
  user: userWithList;
};

export type ActivityBase = {
  /** 活动id(对应原有字段chooseRoomActivityId) */
  activityId: number;
  /** 活动名称 */
  activityName: string;
} & {
  /**活动下的用户数量 */
  customerCount: number;
  /**活动下的房源数量 */
  roomCount?: number;
  /**摇号同步数据-是否有异常 */
  isException?: boolean;
};

export type IUser = { id: number; name?: string };

export type IUserWithId = string | Partial<Pick<IUser, 'id'>>;
export type IUserWithName = Required<Pick<IUser, 'name'>>;

export type commonResponse = { a: string };
export interface getQueryParams1Request {
  /** activityBases */
  activityBases: ActivityBase[];
}

export interface commonResponse2 {
  /**
   * 多行注释
   * @minimum 1
   * @maximum 10
   * */
  param1: number;
}

export interface IParam1 {
  /**
   * 多行注释
   * @minimum 1
   * @maximum 10
   * */
  param1: number;
}
export type IParam2 = {
  /** 单行注释 */
  param1: string;
  param2: null;
  // paramTuple3: [string,number];
};
export type IParam3 = {
  param1: { a: string } & { b: boolean; c: { a: number } };
  // 生成问题
  param2_1: number | string;
  param2: number | IUserWithId;
  param3: '1' | '2' | '3';
  param4: '1' | '2' | 3 | true;
  param5: '1' | '2' | 3 | IParam2;
};
export type IParam4 = {
  /** param1 minLength 1
   * @minLength 1
   * */
  param1: string;
  param2: string | Required<ActivityBase>;
  param3: IUserWithName;
};

export interface Response1 {
  activityBases2: ActivityBase & { activityBases2Other: { a: string } };
}

type postBody11 = {
  postBody1param11: string;
};
export type postBody1 = {
  postBody1param1: string;
  tow: Partial<postBody11>[];
};
export type BodyParam1 = {
  BodyParam1: string;
};
