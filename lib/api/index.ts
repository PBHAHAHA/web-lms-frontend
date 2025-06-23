interface myFetchOptions{
  headers?:Record<string, string>
  [key:string] : any
}

export const useHttpFetch = (url:string,opt:myFetchOptions) => {
  //token
  const token = useCookie('authorized-token')
  // 添加token和请求头
  const headers = {
      ...opt.headers,
      ...(token.value? {Authorization:`Bearer ${token.value}`}:{}),
      // cookie: token.value
  }

  opt.headers = headers

  return useFetch(url,{
      ...opt,
      baseURL: 'http://www.clothesinclothes.xyz:8888',//基本url配置
      credentials: 'include',
      onRequest({ request, options }) {
          console.log('request',request)
      },
      onRequestError({ request, options, error }) {
         
      },
      onResponse({ request, response, options }) {
          // Process the response data
          
          //自定义返回数据
           if (response._data.code === 0){
              //处理
               response._data = response._data.data
           }else{

           }
          console.log('response',response)
      },
      onResponseError({ request, response, options }) {
          // Handle the response errors
         //判断状态，如401时，返回未登录
      }
  })


}

