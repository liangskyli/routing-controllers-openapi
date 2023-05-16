const logFunction1 = (params: any) => {
  console.log(params);
  return (target: any, methodsName: any, desc: any) => {
    console.log(target); // {constructor: ƒ, getData: ƒ}
    console.log(methodsName); // getData
    console.log(desc); // {writable: true, enumerable: false, configurable: true, value: ƒ}
  };
};
export { logFunction1 };
