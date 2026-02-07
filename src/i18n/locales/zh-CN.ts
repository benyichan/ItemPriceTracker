// 中文语言文件
export default {
  // 通用
  common: {
    back: '返回',
    save: '保存',
    cancel: '取消',
    confirm: '确认',
    delete: '删除',
    edit: '编辑',
    add: '添加',
    search: '搜索',
    filter: '筛选',
    sort: '排序',
    loading: '加载中...',
    success: '操作成功',
    error: '操作失败',
    warning: '警告',
    info: '信息',
    viewAll: '查看全部',
    none: '无'
  },
  
  // 导航
  navigation: {
    home: '首页',
    items: '物品',
    add: '添加',
    statistics: '统计',
    settings: '设置'
  },
  
  // 首页
  home: {
    title: '价格追踪器',
    welcome: '欢迎使用价格追踪器',
    recentItems: '最近添加',
    expiringSoon: '即将过期',
    priceChanges: '价格变动',
    noItems: '暂无物品',
    addFirstItem: '添加第一个物品',
    monthlyCost: '本月累计分摊成本',
    totalCost: '总花费',
    totalCostDesc: '所有物品购买金额总和',
    dailyCost: '今日分摊成本',
    dailyCostDesc: '今日在下次购买日期之前的物品分摊',
    addItem: '添加物品',
    itemList: '物品列表',
    statistics: '数据统计',
    recentlyPurchased: '最近购买',
    uncategorized: '未分类',
    unit: '件',
    purchaseDate: '购买日期',
    purchasePrice: '购买价格',
    perUseCost: '单次成本',
    nextPurchaseDate: '下次购买日期'
  },
  
  // 物品列表
  items: {
    title: '我的物品',
    searchPlaceholder: '搜索物品',
    filterByCategory: '按分类筛选',
    sortBy: '排序方式',
    nameAsc: '名称（升序）',
    nameDesc: '名称（降序）',
    priceAsc: '价格（升序）',
    priceDesc: '价格（降序）',
    dateAsc: '日期（升序）',
    dateDesc: '日期（降序）',
    noItems: '暂无物品',
    addItem: '添加物品',
    all: '全部',
    active: '进行中',
    finished: '已用完',
    archived: '已归档',
    dateAdded: '添加时间',
    purchaseDate: '购买日期',
    expiryDate: '到期时间',
    unitPrice: '单价高低',
    totalCost: '总花费',
    perUse: '/次',
    perDay: '/天',
    uncategorized: '未分类',
    unit: '件',
    noMatchingItems: '没有找到匹配的物品',
    activeStatus: '使用中',
    expiredStatus: '已过期',
    expiringSoon: '即将过期'
  },
  
  // 添加物品
  addItem: {
    title: '添加物品',
    name: '物品名称',
    namePlaceholder: '输入物品名称',
    category: '分类',
    categoryPlaceholder: '选择分类',
    price: '价格',
    pricePlaceholder: '输入价格',
    quantity: '数量',
    quantityPlaceholder: '输入数量',
    unit: '单位',
    unitPlaceholder: '输入单位',
    store: '商店',
    storePlaceholder: '输入商店名称',
    link: '链接',
    linkPlaceholder: '输入商品链接',
    image: '图片',
    uploadImage: '上传图片',
    expiryDate: '过期日期',
    selectDate: '选择日期',
    notes: '备注',
    notesPlaceholder: '输入备注信息',
    saveItem: '保存物品'
  },
  
  // 物品详情
  itemDetail: {
    title: '物品详情',
    name: '名称',
    category: '分类',
    price: '价格',
    quantity: '数量',
    unit: '单位',
    unitPrice: '单价',
    store: '商店',
    link: '链接',
    addedDate: '添加日期',
    expiryDate: '过期日期',
    notes: '备注',
    editItem: '编辑物品',
    deleteItem: '删除物品',
    deleteConfirm: '确定要删除这个物品吗？',
    priceHistory: '价格历史',
    noHistory: '暂无价格历史',
    addPrice: '添加价格记录'
  },
  
  // 统计
  statistics: {
    title: '统计分析',
    totalCost: '总成本',
    totalItems: '物品总数',
    averagePrice: '平均单价',
    activeItems: '进行中',
    finishedItems: '已用完',
    expiringItems: '即将到期',
    categoryDistribution: '分类分布',
    priceTrend: '价格趋势',
    topExpensive: '最昂贵的物品',
    expiryAnalysis: '过期分析',
    expiringSoon: '即将过期',
    noData: '暂无数据',
    detailedAnalysis: '详细分析',
    oldestItem: '使用年限最长的物品',
    mostExpensiveItem: '价格最高的物品',
    latestPurchase: '最近一次购买日期',
    topCategory: '金额合计最高的类别'
  },
  
  // 设置
  settings: {
    title: '设置',
    appearance: '外观',
    theme: '主题',
    themeColor: '主题颜色',
    light: '浅色',
    dark: '深色',
    system: '跟随系统',
    dataManagement: '数据管理',
    reminderSettings: '提醒设置',
    about: '关于',
    version: '版本信息',
    privacy: '隐私说明',
    localOnly: '所有数据仅存储在本地设备',
    noUpload: '不会上传到任何服务器'
  },
  
  // 备份管理
  backup: {
    title: '备份管理',
    createBackup: '创建备份',
    downloadBackup: '下载备份',
    uploadBackup: '上传备份',
    restoreBackup: '恢复备份',
    autoBackup: '自动备份',
    backupList: '备份列表',
    createDate: '创建日期',
    size: '大小',
    actions: '操作',
    deleteBackup: '删除备份',
    deleteConfirm: '确定要删除这个备份吗？',
    restoreConfirm: '确定要从这个备份恢复数据吗？这将覆盖当前所有数据。',
    backupCreated: '备份创建成功',
    backupDownloaded: '备份下载成功',
    backupRestored: '备份恢复成功',
    backupDeleted: '备份删除成功',
    errorCreating: '创建备份失败',
    errorDownloading: '下载备份失败',
    errorUploading: '上传备份失败',
    errorRestoring: '恢复备份失败'
  },
  
  // 提醒管理
  reminder: {
    title: '提醒设置',
    enableReminders: '启用提醒',
    reminderTime: '提醒时间',
    daysBeforeExpiry: '过期前提醒天数',
    checkExpiring: '检查即将过期物品',
    expiringItems: '即将过期物品',
    expiredItems: '已过期物品',
    noReminders: '暂无提醒',
    markAsRead: '标记为已读',
    deleteReminder: '删除提醒',
    reminderSettingsSaved: '提醒设置保存成功',
    checkingExpiring: '正在检查即将过期的物品...'
  },
  
  // 语言选择
  language: {
    title: '语言',
    zhCN: '中文',
    enUS: 'English'
  }
};