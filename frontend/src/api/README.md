# API 架构说明

## 目录结构

```
src/api/
├── client.js      # API客户端基础类
├── utils.js       # 工具函数（错误处理、重试等）
├── auth.js        # 认证相关API
├── papers.js      # 论文处理相关API
├── billing.js     # 计费相关API
├── content.js     # 内容管理API
├── core.js        # 核心LLM功能API
└── index.js       # 统一导出
```

## 使用示例

### 1. 基础API调用

```javascript
import { authAPI } from '@/api';

// 登录
const result = await authAPI.login(email, password);
if (result.success) {
  console.log('登录成功', result.user);
} else {
  console.error('登录失败', result.error);
}
```

### 2. 使用Hook管理状态

```javascript
import { useApiCall } from '@/hooks/useApiCall';
import { papersAPI } from '@/api';

function MyComponent() {
  const { data, loading, error, execute } = useApiCall(
    papersAPI.getFormats
  );

  useEffect(() => {
    execute('zh-CN');
  }, []);

  if (loading) return <div>加载中...</div>;
  if (error) return <div>错误: {error.message}</div>;
  
  return <div>{/* 渲染数据 */}</div>;
}
```

### 3. 表单提交

```javascript
import { useFormSubmit } from '@/hooks/useApiCall';
import { authAPI } from '@/api';

function RegisterForm() {
  const { submitting, error, fieldErrors, submit } = useFormSubmit(
    authAPI.register,
    {
      onSuccess: () => {
        alert('注册成功！');
        navigate('/login');
      }
    }
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    await submit(Object.fromEntries(formData));
  };

  return (
    <form onSubmit={handleSubmit}>
      {error && <div className="error">{error}</div>}
      <input name="email" />
      {fieldErrors.email && <span>{fieldErrors.email}</span>}
      <button disabled={submitting}>注册</button>
    </form>
  );
}
```

### 4. 流式响应

```javascript
import { papersAPI } from '@/api';

async function generateWithStream() {
  try {
    for await (const chunk of papersAPI.generatePaperStream(params)) {
      console.log('收到数据块:', chunk);
      // 更新UI
    }
  } catch (error) {
    console.error('流式生成失败:', error);
  }
}
```

## 错误处理

所有API方法都返回统一格式的响应：

```javascript
// 成功响应
{
  success: true,
  data: {...} // 或 message: "..."
}

// 错误响应
{
  success: false,
  error: "错误信息",
  fieldErrors: { // 字段级错误（可选）
    email: "邮箱格式不正确"
  }
}
```

## 环境配置

在项目根目录创建 `.env` 文件：

```env
VITE_API_URL=http://localhost:8000/api/v1
```

## 注意事项

1. Token会自动管理，401错误会触发自动刷新
2. 所有API调用都有30秒超时限制
3. 网络错误会自动重试3次（仅限502/503/504错误）
4. 文件上传使用 `FormData`，无需手动设置 Content-Type