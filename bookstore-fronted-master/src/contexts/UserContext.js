import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const UserContext = createContext();

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchUserProfile = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('http://localhost:8080/api/v1/user/profile', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.code === 0) {
          setUser(data.data);
        } else {
          localStorage.removeItem('token');
        }
      } else {
        localStorage.removeItem('token');
      }
    } catch (error) {
      console.error('获取用户信息失败:', error);
      localStorage.removeItem('token');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUserProfile();
  }, [fetchUserProfile]);

  const login = async (username, password, captchaData) => {
    try {
      const response = await fetch('http://localhost:8080/api/v1/user/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username,
          password,
          captcha_id: captchaData.captchaID,
          captcha_value: captchaData.captchaValue
        }),
      });

      const data = await response.json();

      if (data.code === 0) {
        localStorage.setItem('token', data.data.access_token);
        // 立即设置用户信息，确保UI立即更新
        setUser(data.data.user);
        return { success: true };
      } else {
        return { success: false, message: data.message };
      }
    } catch (error) {
      return { success: false, message: '网络错误，请稍后重试' };
    }
  };

  const register = async (username, password, email, phone, confirmPassword, captchaData) => {
    try {
      const response = await fetch('http://localhost:8080/api/v1/user/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username,
          password,
          confirm_password: confirmPassword,
          email,
          phone,
          captcha_id: captchaData.captchaID,
          captcha_value: captchaData.captchaValue
        }),
      });

      const data = await response.json();

      if (data.code === 0) {
        return { success: true };
      } else {
        return { success: false, message: data.message };
      }
    } catch (error) {
      return { success: false, message: '网络错误，请稍后重试' };
    }
  };

  const logout = async () => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        await fetch('http://localhost:8080/api/v1/user/logout', {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
      } catch (error) {
        console.error('登出请求失败:', error);
      }
    }
    
    localStorage.removeItem('token');
    setUser(null);
  };

  const updateUserProfile = async (profileData) => {
    const token = localStorage.getItem('token');
    if (!token) {
      return { success: false, error: '未登录' };
    }

    try {
      const response = await fetch('http://localhost:8080/api/v1/user/profile', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(profileData),
      });

      const data = await response.json();

      if (data.code === 0) {
        // 更新本地用户信息
        setUser(data.data);
        return { success: true };
      } else {
        return { success: false, error: data.message };
      }
    } catch (error) {
      return { success: false, error: '网络错误，请稍后重试' };
    }
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    fetchUserProfile,
    updateUserProfile
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
}; 