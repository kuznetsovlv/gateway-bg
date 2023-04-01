export const uidCreator = () => {
  let uid = 0;

  return () => ++uid;
};
