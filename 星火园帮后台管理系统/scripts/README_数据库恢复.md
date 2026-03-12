# 星火园帮 - 数据库结构恢复说明

当腾讯云数据库因未续费被清空后，可按以下步骤在新实例上恢复**表结构**（不含历史数据）。

## 一、在腾讯云新建数据库

1. 登录 [腾讯云控制台](https://console.cloud.tencent.com/) → 云数据库 MySQL / CynosDB。
2. 新建实例（或使用已有实例），记下 **内网地址、端口、数据库名、账号密码**。
3. 在实例下**创建数据库**（若控制台已提供“创建数据库”）：  
   数据库名建议与项目配置一致，例如 `users`（与 `config/database.js`、`models/index.js` 中的库名一致）。  
   字符集：`utf8mb4`，排序规则：`utf8mb4_unicode_ci`。

## 二、修改项目数据库配置

编辑以下文件中的连接信息为新实例信息：

- `config/database.js`
- `星火园帮后台管理系统/models/index.js`

修改项：`host`、`port`、`username`、`password`、**数据库名**（若你新建的库名不是 `users`，这里要一致）。

## 三、执行恢复脚本顺序

在**已连接到新数据库**的客户端（如 MySQL 命令行、Navicat、DBeaver、腾讯云 DMC）中按顺序执行：

| 顺序 | 脚本文件 | 说明 |
|------|----------|------|
| 1 | `00_init_database_full.sql` | 创建所有**基础表**（用户、社区、反馈、提现、聊天、评论、关注、配置、系统消息等），不包含任务/校园互动/二手市集分表 |
| 2 | `01_create_first_community_and_shards.sql` | 插入一个默认社区（id=1），并创建该社区的三张分表：`tasks_community_1`、`campus_resources_community_1`、`market_products_community_1` |

### 执行前注意

- 在 `00_init_database_full.sql` 顶部将 `USE users;` 改为你的实际数据库名（若不用 `users`）。
- 若你在腾讯云控制台创建的库名就是 `users`，则无需改脚本，直接执行即可。

### 执行方式示例（命令行）

```bash
# 假设库名为 users，主机、端口、账号密码按你的环境改
mysql -h你的主机 -P端口 -u root -p users < "00_init_database_full.sql"
mysql -h你的主机 -P端口 -u root -p users < "01_create_first_community_and_shards.sql"
```

或在 MySQL 客户端中：

```sql
USE users;
SOURCE /path/to/00_init_database_full.sql;
SOURCE /path/to/01_create_first_community_and_shards.sql;
```

## 四、分表与后续社区说明

- **任务、校园互动、二手市集** 采用按社区分表，没有“主表”：
  - 任务：`tasks_community_{communityId}`
  - 校园互动：`campus_resources_community_{communityId}`
  - 二手市集：`market_products_community_{communityId}`
- 脚本 `01` 只为**社区 id=1** 创建了上述三张分表。
- **之后在后台新增社区**时，项目中的 `AutoShardingService` 会自动为该社区创建对应的三张分表，无需再手动执行 SQL。
- 若你希望先有多个社区再启动服务，可：
  - 先执行 `00`、`01`；
  - 再在 `communities` 表中插入更多社区（如 id=2,3,...）；
  - 然后通过后台接口或服务逻辑触发“为新社区建表”，或参考 `01` 中建表语句为社区 2、3 等复制一份并改表名中的社区 id。

## 五、验证

- 执行完后在新库中查看表列表，应包含：
  - 基础表：`users`、`communities`、`feedbacks`、`withdrawals`、`chats`、`resources`、`books`、`comments`、`follows`、`page_configs`、`exam_proofs`、`after_sales`、`user_earnings`、`system_messages`、`system_broadcasts`、`user_broadcast_reads`、`dispatchTeams`、`teamApplications`、`teamMembers`、`user_addresses` 等；
  - 分表：`tasks_community_1`、`campus_resources_community_1`、`market_products_community_1`。
- 启动后台项目，能正常连接并访问（无“表不存在”等错误即可）。

## 六、关于历史数据

本方案只恢复**表结构**，不包含任何业务数据。历史用户、订单、任务等数据若未在清空前备份，则无法通过脚本恢复。建议今后定期做数据库备份（腾讯云支持自动备份与下载）。

---

脚本由项目内 Sequelize 模型与现有 SQL 脚本整理生成，若表名或字段与当前代码不一致，以你当前代码为准，可对照 `models/` 下各模型再微调 SQL。
