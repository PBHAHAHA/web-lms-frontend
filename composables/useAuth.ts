import {
  useAuthApi,
  type LoginParams,
  type RegisterParams,
  type LoginUserResponse,
  type LoginResponse,
  type GetLoginUserResponse,
} from "~/lib/api/modules/auth";

export const useAuth = () => {
  const authApi = useAuthApi();
  const storage = useStorage();

  // 持久化的用户信息状态（存储到 localStorage）
  const userInfo = ref<LoginUserResponse | null>(null);

  // 存储键名
  const USER_INFO_KEY = "user-info";
  const LOGIN_TIME_KEY = "login-time";
  const TOKEN_INFO_KEY = "token-info";

  // 从 localStorage 恢复用户信息
  const restoreUserInfo = () => {
    const stored = storage.getItem<LoginUserResponse>(USER_INFO_KEY);
    if (stored) {
      userInfo.value = stored;
    }
  };

  // 保存用户信息到 localStorage
  const saveUserInfo = (data: LoginUserResponse | null) => {
    if (data) {
      storage.setItem(USER_INFO_KEY, data);
      storage.setItem(LOGIN_TIME_KEY, Date.now()); // 记录登录时间
    } else {
      storage.removeItem(USER_INFO_KEY);
      storage.removeItem(LOGIN_TIME_KEY);
      storage.removeItem(TOKEN_INFO_KEY); // 清除 token 信息
    }
    userInfo.value = data;
  };

  // 保存 token 信息到 localStorage（备份）
  const saveTokenInfo = (tokenName: string, tokenValue: string) => {
    storage.setItem(TOKEN_INFO_KEY, {
      tokenName,
      tokenValue,
      timestamp: Date.now(),
    });
  };

  // 检查是否已登录
  const isLoggedIn = computed(() => {
    const authCookie = useCookie("authorized-token");
    return !!authCookie.value;
  });

  // 检查是否是会员
  const isMember = computed(() => {
    return userInfo.value?.member == 'BASIC';
  });

  // 获取登录时间
  const getLoginTime = (): number | null => {
    return storage.getItem<number>(LOGIN_TIME_KEY);
  };

  // 获取登录持续时间（毫秒）
  const getLoginDuration = (): number => {
    const loginTime = getLoginTime();
    return loginTime ? Date.now() - loginTime : 0;
  };

  // 检查会话是否有效（可选，基于时间）
  const isSessionValid = (
    maxDurationMs: number = 24 * 60 * 60 * 1000
  ): boolean => {
    if (!isLoggedIn.value) return false;
    const duration = getLoginDuration();
    return duration < maxDurationMs;
  };

  // 检查token状态的调试函数
  const debugTokenStatus = () => {
    const authToken = useCookie("authorized-token");
    const tokenName = useCookie("token-name");
    
    console.log("Token调试信息:", {
      tokenName: tokenName.value,
      tokenValue: authToken.value,
      isLoggedIn: isLoggedIn.value
    });
    
    return {
      hasToken: !!authToken.value,
      hasTokenName: !!tokenName.value,
      tokenName: tokenName.value,
      tokenValue: authToken.value?.substring(0, 20) + "..." // 只显示前20个字符
    };
  };

  // 初始化时恢复用户信息
  if (process.client) {
    restoreUserInfo();
  }

  // 登录
  const login = async (params: LoginParams) => {
    console.log(params, "登录数据1");
    try {
      const response = await authApi.login(params);
      console.log("登录成功:", response);

      // 从登录响应中提取用户信息
      if (response && response.data && response.data.loginId) {
        // 先设置 token 信息到 cookie
        const authToken = useCookie("authorized-token");
        const tokenName = useCookie("token-name");

        authToken.value = response.data.tokenValue;
        tokenName.value = response.data.tokenName;

        // 备份 token 信息到 localStorage
        saveTokenInfo(response.data.tokenName, response.data.tokenValue);

        console.log("Token信息已保存:", {
          tokenName: response.data.tokenName,
          tokenValue: response.data.tokenValue,
        });

        // 等待一小段时间确保cookie设置完成
        await new Promise(resolve => setTimeout(resolve, 100));

        try {
          // 解析 loginId 中的用户信息（JSON 字符串）
          const userData = JSON.parse(response.data.loginId);
          console.log("解析用户信息成功:", userData);

          // 登录成功后立即获取完整的用户信息
          try {
            console.log("准备获取完整用户信息，当前token状态:", {
              tokenName: tokenName.value,
              tokenValue: authToken.value
            });
            
            const fullUserInfo = await getLoginUser();
            console.log("获取完整用户信息成功:", fullUserInfo);
            
            return {
              loginResponse: response,
              userInfo: fullUserInfo,
              token: response.data.tokenValue,
            };
          } catch (userInfoError) {
            console.warn("获取完整用户信息失败，使用基本信息:", userInfoError);
            
            // 如果获取完整信息失败，使用基本信息
            const parsedUserInfo: LoginUserResponse = {
              id: userData.id?.toString() || "0",
              userName: userData.userName || "",
              email: userData.email || "",
              member: userData.member || "0"
            };
            saveUserInfo(parsedUserInfo);
            
            return {
              loginResponse: response,
              userInfo: parsedUserInfo,
              token: response.data.tokenValue,
            };
          }
        } catch (parseError) {
          console.warn("解析用户信息失败:", parseError);
          
          // 等待一小段时间确保cookie设置完成
          await new Promise(resolve => setTimeout(resolve, 100));

          // 尝试获取完整用户信息
          try {
            console.log("通过API获取用户信息，当前token状态:", {
              tokenName: tokenName.value,
              tokenValue: authToken.value
            });
            
            const fullUserInfo = await getLoginUser();
            console.log("通过API获取用户信息成功:", fullUserInfo);
            
            return {
              loginResponse: response,
              userInfo: fullUserInfo,
              token: response.data.tokenValue,
            };
          } catch (userInfoError) {
            console.error("获取用户信息完全失败:", userInfoError);
            return {
              loginResponse: response,
              userInfo: null,
              token: response.data.tokenValue,
            };
          }
        }
      }

      return response;
    } catch (error) {
      console.error("登录失败:", error);
      throw error;
    }
  };

  // 注册
  const register = async (params: RegisterParams) => {
    try {
      const response = await authApi.register(params);
      return response;
    } catch (error) {
      console.error("注册失败:", error);
      throw error;
    }
  };

  // 获取登录用户信息
  const getLoginUser = async (): Promise<LoginUserResponse> => {
    try {
      // 调用前检查token状态
      const tokenDebug = debugTokenStatus();
      console.log("调用getLoginUser前的token状态:", tokenDebug);
      
      if (!tokenDebug.hasToken) {
        throw new Error("Token不存在，无法获取用户信息");
      }
      
      const response: GetLoginUserResponse = await authApi.getLoginUser();
      console.log("getLoginUser原始响应:", response);
      
      // 检查响应结构并提取用户数据
      if (response.errorCode === "0" && response.data) {
        const userData = response.data;
        console.log("提取的用户数据:", userData);
        
        // 更新用户信息状态（持久化）
        saveUserInfo(userData);
        return userData;
      } else {
        throw new Error(response.errorMsg || "获取用户信息失败");
      }
    } catch (error) {
      console.error("获取登录用户信息失败:", error);
      throw error;
    }
  };

  // 检查并更新用户会员状态
  const checkMemberStatus = async () => {
    try {
      if (!isLoggedIn.value) {
        console.log("用户未登录，无法检查会员状态");
        return false;
      }

      const userData = await getLoginUser();
      console.log("会员状态检查结果:", userData);
      
      // 返回是否是会员 - 检查member字段是否不是BASIC
      return userData?.member == 'BASIC';
    } catch (error) {
      console.error("检查会员状态失败:", error);
      return false;
    }
  };

  // 登出
  const logout = () => {
    // 清除认证相关的 cookie
    const authCookie = useCookie("authorized-token");
    const tokenName = useCookie("token-name");

    authCookie.value = null;
    tokenName.value = null;

    // 清除用户信息（包括 localStorage）
    saveUserInfo(null);

    console.log("用户已登出，已清除所有认证信息");
  };

  // 初始化时检查登录状态
  const initAuth = async () => {
    // 恢复用户信息
    restoreUserInfo();

    // 检查登录状态一致性
    if (isLoggedIn.value) {
      console.log("用户已登录，token 存在");
      if (!userInfo.value) {
        console.warn("Token 存在但用户信息缺失，重新获取用户信息");
        try {
          await getLoginUser();
          console.log("重新获取用户信息成功");
        } catch (error) {
          console.error("重新获取用户信息失败:", error);
        }
      } else {
        console.log("用户信息已存在:", userInfo.value);
      }
    } else {
      console.log("用户未登录");
      // 清理可能残留的用户信息
      if (userInfo.value) {
        saveUserInfo(null);
      }
    }
  };

  return {
    // 状态
    isLoggedIn,
    isMember,
    userInfo: readonly(userInfo), // 只读的用户信息

    // 方法
    login,
    register,
    getLoginUser,
    checkMemberStatus,
    logout,
    initAuth,
    debugTokenStatus,

    // 会话管理
    getLoginTime,
    getLoginDuration,
    isSessionValid,
  };
};
