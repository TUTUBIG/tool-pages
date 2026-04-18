import type { Messages } from "./types";

export const zhCN: Messages = {
  site: {
    tagline: "所有处理都在你的浏览器中完成，不会发送到我们的服务器。",
    homeTitle: "ToolFlow",
    homeDescription:
      "ToolFlow — 面向开发与设计的浏览器小工具。全部在本地浏览器运行；你的输入不会上传到我们的服务器。",
    searchPlaceholder: "搜索工具…",
    toolsNav: "工具",
    backToHome: "返回首页",
    emptyMostUsedLoading: "加载中…",
    emptyMostUsedNoRecords: "「最常用」里还没有记录。",
    emptyCategory: "该分类下没有工具。",
    searchModalPlaceholder: "搜索全部工具…",
    searchModalStartTyping: "输入关键字以搜索全部工具",
    searchModalNoResults: "没有与「{query}」匹配的工具",
    searchModalFooter: "按 ESC 关闭",
    searchModalSuggestTitle: "没找到想要的工具？",
    searchModalSuggestDescription:
      "欢迎发邮件说明你的使用场景，我们会阅读并据此考虑后续要上线的工具。",
    searchModalSuggestEmailLabel: "发邮件给支持团队",
    toolFeedbackHeading: "反馈",
    toolFeedbackBody: "发现缺陷、体验不清晰或想要新功能？欢迎在 GitHub 提 issue 或发邮件联系我们。",
    toolFeedbackGitHub: "在 GitHub 提 Issue",
    toolFeedbackEmail: "邮件联系支持",
  },
  filters: {
    "Most used": "最常用",
    Development: "开发",
    Web3: "Web3",
    Design: "设计",
    Productivity: "效率",
    Communication: "沟通",
  },
  categories: {
    Development: "开发",
    Web3: "Web3",
    Design: "设计",
    Productivity: "效率",
    Communication: "沟通",
  },
  tools: {
    "color-picker": {
      title: "取色器",
      description: "从图片中吸取十六进制与 RGB — 常见吸管式流程",
      metaDescription: "在浏览器中从图片采样十六进制与 RGB 颜色。",
    },
    "color-preview": {
      title: "颜色预览",
      description: "输入 hex、rgb()、hsl() 或 CSS 颜色名并即时预览",
      metaDescription: "在浏览器中输入 CSS 颜色（hex、rgb()、hsl() 或名称）并预览。",
    },
    "markdown-editor": {
      title: "Markdown 编辑器",
      description: "编写 Markdown 并在本地预览 HTML — 适合文档与 README",
      metaDescription: "在浏览器中编写 Markdown，并在本地预览经过净化的 HTML。",
    },
    "image-compressor": {
      title: "图片压缩",
      description: "在浏览器中降低 JPEG 或 WebP 质量以减小上传前体积",
      metaDescription: "在浏览器中重新编码图片，可调整 JPEG 或 WebP 质量。",
    },
    "email-template": {
      title: "邮件模板",
      description: "填写响应式表格布局并复制活动用 HTML",
      metaDescription: "在本地填写简洁的响应式 HTML 邮件并复制标记。",
    },
    "password-generator": {
      title: "密码生成器",
      description: "使用常见字符集选项生成本地强随机密码",
      metaDescription: "使用 crypto.getRandomValues 在本地生成强随机密码。",
    },
    "api-tester": {
      title: "API 测试",
      description: "从浏览器发送 HTTP 请求（需目标允许 CORS）",
      metaDescription: "从浏览器发送 HTTP 请求；目标站点需允许 CORS。",
    },
    "regex-builder": {
      title: "正则表达式",
      description: "构建正则并在示例文本上测试",
      metaDescription: "构建并测试 JavaScript 正则表达式与示例文本。",
    },
    "gradient-generator": {
      title: "渐变生成器",
      description: "创建带实时预览的 CSS linear-gradient 字符串",
      metaDescription: "构建带实时预览的 CSS linear-gradient() 值。",
    },
    "json-validator": {
      title: "JSON 校验",
      description: "校验并格式化 JSON 数据",
      metaDescription: "在浏览器中校验 JSON 语法并以统一缩进美化输出。",
    },
    "base64-encoder": {
      title: "Base64 编解码",
      description: "Base64 编码与解码",
      metaDescription: "在浏览器中对文本进行 Base64 编码与解码。",
    },
    "url-encoder": {
      title: "URL 编解码",
      description: "对 URL 组件进行编码与解码",
      metaDescription: "在浏览器中使用百分号编码对 URL 组件编码与解码。",
    },
    "jwt-tool": {
      title: "JWT 解析",
      description: "解析 JWT 并在本地签署 HS256 令牌",
      metaDescription: "解码 JWT 头与载荷，并使用 Web Crypto 在本地签署 HS256 令牌。",
    },
    "hash-generator": {
      title: "哈希生成",
      description: "在浏览器中计算文本的 SHA 摘要",
      metaDescription: "使用 Web Crypto 在浏览器中计算文本的 SHA-1 与 SHA-2 族摘要。",
    },
    "uuid-generator": {
      title: "UUID 生成",
      description: "生成随机 UUID v4",
      metaDescription: "在浏览器中生成加密安全的 UUID v4 标识符。",
    },
    "format-converter": {
      title: "数据格式转换",
      description: "在 JSON、YAML、XML、CSV、TSV 之间互转",
      metaDescription: "在浏览器中在 JSON、YAML、XML、CSV、TSV 之间转换；解析与序列化均在本地。",
    },
    "unit-converter": {
      title: "单位换算",
      description: "货币、温度、重量、长度与体积",
      metaDescription:
        "在浏览器中换算货币（基于欧洲央行实时汇率）、温度、重量、长度与体积。",
    },
    "uniswap-sqrt": {
      title: "Uniswap sqrtPriceX96",
      description: "解码 / 编码 V3 池的 sqrt 价格（Q64.96）",
      metaDescription:
        "在浏览器中将 Uniswap V3 sqrtPriceX96（Q64.96）与人类可读价格互转；结合代币小数位。全部本地运行。",
    },
    "wei-human": {
      title: "Wei ↔ 可读金额",
      description: "在基础单位与带小数的人类可读格式之间换算",
      metaDescription:
        "按 ERC-20 小数位，在以太坊 wei 等基础单位与人类可读小数之间换算；全部在浏览器本地完成。",
    },
    "eth-address": {
      title: "以太坊地址",
      description: "校验地址并在本地应用 EIP-55 校验和",
      metaDescription: "在浏览器中校验以太坊地址并应用 EIP-55 校验和；不会发往服务器。",
    },
    "eth-wallet": {
      title: "钱包与靓号",
      description: "靓号地址碰撞、概率与耗时估算，以及 BIP-39 助记词",
      metaDescription:
        "在浏览器本地搜索以太坊靓号地址并显示命中概率与期望耗时；生成或导入 BIP-39 助记词并推导地址；数据不上传服务器。",
    },
    "function-selector": {
      title: "函数选择器（4 字节）",
      description: "由规范函数签名计算 4 字节选择器",
      metaDescription: "由规范 Solidity 函数签名计算 4 字节函数选择器；在浏览器本地运行。",
    },
    keccak256: {
      title: "Keccak-256",
      description: "对 UTF-8 文本或十六进制字节做 Keccak-256 哈希",
      metaDescription: "在浏览器中对 UTF-8 文本或十六进制字节计算 Keccak-256。",
    },
    "hex-bytes": {
      title: "十六进制 ↔ UTF-8",
      description: "在十六进制字符串与 UTF-8 文本之间转换",
      metaDescription: "在浏览器中在十六进制字节串与 UTF-8 文本之间转换。",
    },
    "abi-codec": {
      title: "ABI 编码 / 解码",
      description: "使用本地 AbiCoder 编码与解码 ABI 数据",
      metaDescription: "使用 ethers AbiCoder 编码与解码 ABI 元组；调用数据仅在浏览器中处理。",
    },
  },
};
