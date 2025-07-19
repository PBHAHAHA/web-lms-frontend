import { useApi } from '../index'

export const postOrder = (params: any) => {
  return useApi().post("/order/order", params);
};