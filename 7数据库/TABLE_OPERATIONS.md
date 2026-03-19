# MySQL 数据表操作完整指南

## 目录

- [创建数据库](#创建数据库)
- [创建表](#创建表)
- [查看表](#查看表)
- [修改表结构](#修改表结构)
- [插入数据](#插入数据)
- [查询数据](#查询数据)
- [更新数据](#更新数据)
- [删除数据](#删除数据)
- [索引操作](#索引操作)
- [约束操作](#约束操作)

---

## 创建数据库

### 创建新数据库

```sql
CREATE DATABASE database_name;
```

### 创建数据库（如果不存在）

```sql
CREATE DATABASE IF NOT EXISTS database_name;
```

### 指定字符集创建数据库

```sql
CREATE DATABASE database_name
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;
```

### 删除数据库

```sql
DROP DATABASE database_name;
```

### 切换数据库

```sql
USE database_name;
```

---

## 创建表

### 基本语法

```sql
CREATE TABLE table_name (
    column1 datatype constraints,
    column2 datatype constraints,
    ...
);
```

### 列定义详解

#### 完整的列定义格式

```sql
column_name datatype [UNSIGNED] [ZEROFILL] [NOT NULL | NULL] [DEFAULT value]
[AUTO_INCREMENT] [UNIQUE] [PRIMARY KEY] [COMMENT 'description']
```

#### 各参数详细说明

**1. 数据类型（datatype）**

- 必填项，定义该列存储的数据类型
- 例如：`INT`, `VARCHAR(50)`, `DATETIME` 等

**2. UNSIGNED（无符号）**

- 仅用于数值类型
- 表示该列只存储非负数（0和正数）
- 使用后可以扩大正数范围

```sql
age INT UNSIGNED  -- 范围：0 到 4294967295（而不是 -2147483648 到 2147483647）
```

**3. ZEROFILL（零填充）**

- 仅用于数值类型
- 自动在数字前面补零，达到指定宽度
- 自动隐含 UNSIGNED

```sql
code INT(5) ZEROFILL  -- 存储 23 显示为 00023
```

**4. NULL / NOT NULL（是否允许空值）**

- `NULL`：允许该列为空（默认）
- `NOT NULL`：该列必须有值，不能为空

```sql
username VARCHAR(50) NOT NULL  -- 必须填写用户名
nickname VARCHAR(50) NULL      -- 昵称可以为空
```

**5. DEFAULT（默认值）**

- 插入数据时，如果不指定该列的值，则使用默认值

```sql
status TINYINT DEFAULT 1                              -- 默认值为 1
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP        -- 默认当前时间
country VARCHAR(50) DEFAULT '中国'                     -- 默认字符串
is_active BOOLEAN DEFAULT TRUE                        -- 默认布尔值
```

**6. AUTO_INCREMENT（自动增长）**

- 仅用于整数类型
- 每次插入新记录时，该列自动递增
- 通常用于主键 ID
- 一个表只能有一个 AUTO_INCREMENT 列
- 必须是索引列（通常是主键）

```sql
id INT AUTO_INCREMENT PRIMARY KEY
-- 插入数据时不需要指定 id，会自动生成 1, 2, 3, 4...
```

**7. PRIMARY KEY（主键）**

- 唯一标识表中的每一行记录
- 不能为 NULL
- 不能重复
- 一个表只能有一个主键（但可以是复合主键）

```sql
id INT PRIMARY KEY                    -- 单列主键
PRIMARY KEY (user_id, product_id)     -- 复合主键
```

**8. UNIQUE（唯一约束）**

- 该列的值不能重复
- 可以为 NULL（NULL 不算重复）
- 一个表可以有多个 UNIQUE 列

```sql
email VARCHAR(100) UNIQUE             -- 邮箱不能重复
username VARCHAR(50) NOT NULL UNIQUE  -- 用户名不能重复且不能为空
```

**9. COMMENT（注释）**

- 为列添加说明文字
- 不影响功能，仅用于文档说明

```sql
age INT COMMENT '用户年龄'
status TINYINT COMMENT '状态：0-禁用，1-启用'
```

**10. ON UPDATE（更新时触发）**

- 仅用于 TIMESTAMP 和 DATETIME
- 记录更新时自动更新该字段

```sql
updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
-- 创建时记录当前时间，每次更新记录时自动更新为当前时间
```

### 完整示例（带详细注释）

```sql
CREATE TABLE users (
    -- 主键ID：整数类型，主键，自动递增
    id INT PRIMARY KEY AUTO_INCREMENT COMMENT '用户ID',

    -- 用户名：最长50字符，不能为空，不能重复
    username VARCHAR(50) NOT NULL UNIQUE COMMENT '用户名',

    -- 邮箱：最长100字符，不能为空，不能重复
    email VARCHAR(100) NOT NULL UNIQUE COMMENT '邮箱地址',

    -- 密码：最长255字符，不能为空
    password VARCHAR(255) NOT NULL COMMENT '加密后的密码',

    -- 年龄：整数，无符号（只能是正数），默认18
    age INT UNSIGNED DEFAULT 18 COMMENT '用户年龄',

    -- 余额：精确小数，10位数字，2位小数，默认0.00
    balance DECIMAL(10,2) DEFAULT 0.00 COMMENT '账户余额',

    -- 状态：微整数，默认1（启用）
    status TINYINT DEFAULT 1 COMMENT '状态：0-禁用，1-启用',

    -- 是否VIP：布尔值，默认false
    is_vip BOOLEAN DEFAULT FALSE COMMENT '是否VIP用户',

    -- 创建时间：时间戳，默认当前时间
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',

    -- 更新时间：时间戳，默认当前时间，更新时自动更新
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',

    -- 为常用查询字段添加索引
    INDEX idx_username (username),
    INDEX idx_email (email),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户表';
```

### 表级选项说明

**ENGINE（存储引擎）**

```sql
ENGINE=InnoDB    -- 支持事务、外键（推荐）
ENGINE=MyISAM    -- 不支持事务，查询速度快
ENGINE=MEMORY    -- 数据存储在内存中，速度最快但重启丢失
```

**DEFAULT CHARSET（默认字符集）**

```sql
DEFAULT CHARSET=utf8mb4              -- 支持完整的UTF-8，包括emoji（推荐）
DEFAULT CHARSET=utf8                 -- 标准UTF-8
DEFAULT CHARSET=latin1               -- 拉丁字符集
```

**COLLATE（排序规则）**

```sql
COLLATE=utf8mb4_unicode_ci          -- 不区分大小写，支持多语言
COLLATE=utf8mb4_general_ci          -- 不区分大小写，性能更好
COLLATE=utf8mb4_bin                 -- 区分大小写
```

**AUTO_INCREMENT（起始值）**

```sql
AUTO_INCREMENT=1000                 -- 自增ID从1000开始
```

### 更多创建表示例

#### 示例1：商品表

```sql
CREATE TABLE products (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    product_name VARCHAR(200) NOT NULL COMMENT '商品名称',
    product_code VARCHAR(50) NOT NULL UNIQUE COMMENT '商品编码',
    price DECIMAL(10,2) UNSIGNED NOT NULL COMMENT '价格',
    stock INT UNSIGNED DEFAULT 0 COMMENT '库存数量',
    category_id INT NOT NULL COMMENT '分类ID',
    description TEXT COMMENT '商品描述',
    images JSON COMMENT '商品图片JSON数组',
    is_on_sale BOOLEAN DEFAULT TRUE COMMENT '是否上架',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_category (category_id),
    INDEX idx_code (product_code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='商品表';
```

#### 示例2：订单表（带外键）

```sql
CREATE TABLE orders (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    order_no VARCHAR(32) NOT NULL UNIQUE COMMENT '订单号',
    user_id INT NOT NULL COMMENT '用户ID',
    total_amount DECIMAL(10,2) NOT NULL COMMENT '订单总金额',
    status ENUM('pending', 'paid', 'shipped', 'completed', 'cancelled')
        DEFAULT 'pending' COMMENT '订单状态',
    payment_method ENUM('alipay', 'wechat', 'card') COMMENT '支付方式',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    paid_at TIMESTAMP NULL COMMENT '支付时间',

    -- 外键约束
    FOREIGN KEY (user_id) REFERENCES users(id)
        ON DELETE CASCADE ON UPDATE CASCADE,

    INDEX idx_user (user_id),
    INDEX idx_status (status),
    INDEX idx_order_no (order_no)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='订单表';
```

#### 示例3：日志表（使用复合主键）

```sql
CREATE TABLE user_login_log (
    user_id INT NOT NULL COMMENT '用户ID',
    login_time TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '登录时间',
    ip_address VARCHAR(45) COMMENT 'IP地址',
    device VARCHAR(100) COMMENT '设备信息',

    -- 复合主键
    PRIMARY KEY (user_id, login_time),

    INDEX idx_time (login_time)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户登录日志表';
```

### 常用数据类型

#### 数值类型

```sql
TINYINT      -- 1字节，-128 到 127
SMALLINT     -- 2字节，-32768 到 32767
MEDIUMINT    -- 3字节
INT          -- 4字节，-2147483648 到 2147483647
BIGINT       -- 8字节
FLOAT        -- 单精度浮点
DOUBLE       -- 双精度浮点
DECIMAL(M,D) -- 精确小数，M总位数，D小数位数
```

#### 字符串类型

```sql
CHAR(n)       -- 定长字符串，最大255
VARCHAR(n)    -- 变长字符串，最大65535
TEXT          -- 长文本，最大65535
MEDIUMTEXT    -- 中等文本，最大16MB
LONGTEXT      -- 超长文本，最大4GB
```

#### 日期时间类型

```sql
DATE          -- 日期 YYYY-MM-DD
TIME          -- 时间 HH:MM:SS
DATETIME      -- 日期时间 YYYY-MM-DD HH:MM:SS
TIMESTAMP     -- 时间戳
YEAR          -- 年份
```

#### 其他类型

```sql
ENUM('value1', 'value2', ...)  -- 枚举
JSON                            -- JSON数据
BLOB                            -- 二进制数据
```

### 创建表（从其他表复制结构）

```sql
CREATE TABLE new_table LIKE old_table;
```

### 创建表（从查询结果）

```sql
CREATE TABLE new_table AS
SELECT * FROM old_table WHERE condition;
```

---

## 查看表

### 查看所有表

```sql
SHOW TABLES;
```

### 查看表结构

```sql
DESCRIBE table_name;
-- 或
DESC table_name;
-- 或
SHOW COLUMNS FROM table_name;
```

### 查看创建表的SQL语句

```sql
SHOW CREATE TABLE table_name;
```

### 查看表状态信息

```sql
SHOW TABLE STATUS LIKE 'table_name';
```

---

## 修改表结构

### 重命名表

```sql
RENAME TABLE old_name TO new_name;
-- 或
ALTER TABLE old_name RENAME TO new_name;
```

### 添加列

```sql
-- 添加到最后
ALTER TABLE table_name
ADD COLUMN column_name datatype;

-- 添加到第一列
ALTER TABLE table_name
ADD COLUMN column_name datatype FIRST;

-- 添加到指定列之后
ALTER TABLE table_name
ADD COLUMN column_name datatype AFTER existing_column;
```

### 修改列

```sql
-- 修改列数据类型
ALTER TABLE table_name
MODIFY COLUMN column_name new_datatype;

-- 修改列名和数据类型
ALTER TABLE table_name
CHANGE COLUMN old_name new_name new_datatype;
```

### 删除列

```sql
ALTER TABLE table_name
DROP COLUMN column_name;
```

### 添加多列

```sql
ALTER TABLE table_name
ADD COLUMN column1 datatype,
ADD COLUMN column2 datatype;
```

### 删除表

```sql
DROP TABLE table_name;

-- 如果存在则删除
DROP TABLE IF EXISTS table_name;
```

### 清空表数据

```sql
-- 删除所有数据，保留表结构
TRUNCATE TABLE table_name;

-- 或使用DELETE（较慢，但可回滚）
DELETE FROM table_name;
```

---

## 插入数据

### 插入单条数据

```sql
INSERT INTO table_name (column1, column2, column3)
VALUES (value1, value2, value3);
```

### 插入多条数据

```sql
INSERT INTO table_name (column1, column2, column3)
VALUES
    (value1, value2, value3),
    (value4, value5, value6),
    (value7, value8, value9);
```

### 插入所有列（省略列名）

```sql
INSERT INTO table_name
VALUES (value1, value2, value3);
```

### 插入并忽略重复

```sql
INSERT IGNORE INTO table_name (column1, column2)
VALUES (value1, value2);
```

### 插入或更新（存在则更新）

```sql
INSERT INTO table_name (id, name, age)
VALUES (1, '张三', 25)
ON DUPLICATE KEY UPDATE
    name = VALUES(name),
    age = VALUES(age);
```

### 从其他表插入数据

```sql
INSERT INTO table1 (column1, column2)
SELECT column1, column2 FROM table2 WHERE condition;
```

---

## 查询数据

### 基本查询

```sql
-- 查询所有列
SELECT * FROM table_name;

-- 查询指定列
SELECT column1, column2 FROM table_name;

-- 去重查询
SELECT DISTINCT column_name FROM table_name;
```

### 条件查询（WHERE）

```sql
-- 等于
SELECT * FROM users WHERE age = 25;

-- 不等于
SELECT * FROM users WHERE age != 25;
SELECT * FROM users WHERE age <> 25;
	
-- 大于、小于
SELECT * FROM users WHERE age > 18;
SELECT * FROM users WHERE age <= 30;

-- 范围查询
SELECT * FROM users WHERE age BETWEEN 18 AND 30;

-- IN查询
SELECT * FROM users WHERE id IN (1, 2, 3, 5);

-- 模糊查询
SELECT * FROM users WHERE username LIKE '张%';    -- 张开头
SELECT * FROM users WHERE username LIKE '%三';    -- 三结尾
SELECT * FROM users WHERE username LIKE '%小%';   -- 包含小

-- NULL查询
SELECT * FROM users WHERE email IS NULL;
SELECT * FROM users WHERE email IS NOT NULL;

-- 多条件查询
SELECT * FROM users WHERE age > 18 AND status = 1;
SELECT * FROM users WHERE age < 18 OR age > 60;
SELECT * FROM users WHERE NOT (age < 18);
```

### 排序（ORDER BY）

```sql
-- 升序
SELECT * FROM users ORDER BY age ASC;

-- 降序
SELECT * FROM users ORDER BY age DESC;

-- 多列排序
SELECT * FROM users ORDER BY age DESC, username ASC;
```

### 限制结果数量（LIMIT）

```sql
-- 查询前10条
SELECT * FROM users LIMIT 10;

-- 分页查询（跳过前10条，取5条）
SELECT * FROM users LIMIT 10, 5;

-- 或使用OFFSET
SELECT * FROM users LIMIT 5 OFFSET 10;
```

### 聚合函数

```sql
-- 计数
SELECT COUNT(*) FROM users;
SELECT COUNT(DISTINCT age) FROM users;

-- 求和
SELECT SUM(age) FROM users;

-- 平均值
SELECT AVG(age) FROM users;

-- 最大值、最小值
SELECT MAX(age), MIN(age) FROM users;
```

### 分组查询（GROUP BY）

```sql
-- 按年龄分组统计人数
SELECT age, COUNT(*) as count
FROM users
GROUP BY age;

-- 分组后筛选（HAVING）
SELECT age, COUNT(*) as count
FROM users
GROUP BY age
HAVING count > 5;
```

### 连接查询（JOIN）

```sql
-- 内连接
SELECT users.username, orders.order_no
FROM users
INNER JOIN orders ON users.id = orders.user_id;

-- 左连接
SELECT users.username, orders.order_no
FROM users
LEFT JOIN orders ON users.id = orders.user_id;

-- 右连接
SELECT users.username, orders.order_no
FROM users
RIGHT JOIN orders ON users.id = orders.user_id;

-- 全连接（MySQL不直接支持，需用UNION）
SELECT users.username, orders.order_no
FROM users
LEFT JOIN orders ON users.id = orders.user_id
UNION
SELECT users.username, orders.order_no
FROM users
RIGHT JOIN orders ON users.id = orders.user_id;
```

### 子查询

```sql
-- WHERE子查询
SELECT * FROM users
WHERE id IN (SELECT user_id FROM orders WHERE amount > 1000);

-- FROM子查询
SELECT * FROM (
    SELECT username, age FROM users WHERE age > 18
) AS adult_users;

-- EXISTS子查询
SELECT * FROM users u
WHERE EXISTS (
    SELECT 1 FROM orders o WHERE o.user_id = u.id
);
```

### 联合查询（UNION）

```sql
-- 合并结果（去重）
SELECT username FROM users WHERE age < 18
UNION
SELECT username FROM users WHERE age > 60;

-- 合并结果（不去重）
SELECT username FROM users WHERE age < 18
UNION ALL
SELECT username FROM users WHERE age > 60;
```

---

## 更新数据

### 基本更新

```sql
UPDATE table_name
SET column1 = value1, column2 = value2
WHERE condition;
```

### 示例

```sql
-- 更新单条记录
UPDATE users
SET age = 26
WHERE id = 1;

-- 更新多个字段
UPDATE users
SET age = 26, status = 1, updated_at = NOW()
WHERE id = 1;

-- 批量更新
UPDATE users
SET status = 0
WHERE age < 18;

-- 使用表达式更新
UPDATE users
SET age = age + 1
WHERE id = 1;
```

### 多表更新

```sql
UPDATE users u
INNER JOIN orders o ON u.id = o.user_id
SET u.total_orders = u.total_orders + 1
WHERE o.status = 'completed';
```

---

## 删除数据

### 基本删除

```sql
DELETE FROM table_name WHERE condition;
```

### 示例

```sql
-- 删除单条记录
DELETE FROM users WHERE id = 1;

-- 删除多条记录
DELETE FROM users WHERE age < 18;

-- 删除所有记录（慎用）
DELETE FROM users;
```

### 多表删除

```sql
DELETE u, o
FROM users u
INNER JOIN orders o ON u.id = o.user_id
WHERE u.status = 0;
```

---

## 索引操作

### 创建索引

```sql
-- 普通索引
CREATE INDEX idx_username ON users(username);

-- 唯一索引
CREATE UNIQUE INDEX idx_email ON users(email);

-- 复合索引
CREATE INDEX idx_name_age ON users(username, age);

-- 全文索引
CREATE FULLTEXT INDEX idx_content ON articles(content);
```

### 在创建表时添加索引

```sql
CREATE TABLE users (
    id INT PRIMARY KEY,
    username VARCHAR(50),
    email VARCHAR(100),
    INDEX idx_username (username),
    UNIQUE INDEX idx_email (email)
);
```

### 使用ALTER TABLE添加索引

```sql
ALTER TABLE users ADD INDEX idx_username (username);
ALTER TABLE users ADD UNIQUE INDEX idx_email (email);
```

### 查看索引

```sql
SHOW INDEX FROM table_name;
```

### 删除索引

```sql
DROP INDEX index_name ON table_name;
-- 或
ALTER TABLE table_name DROP INDEX index_name;
```

---

## 约束操作

### 主键约束（PRIMARY KEY）

```sql
-- 创建表时添加
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT
);

-- 添加主键
ALTER TABLE users ADD PRIMARY KEY (id);

-- 删除主键
ALTER TABLE users DROP PRIMARY KEY;
```

### 外键约束（FOREIGN KEY）

```sql
-- 创建表时添加
CREATE TABLE orders (
    id INT PRIMARY KEY,
    user_id INT,
    FOREIGN KEY (user_id) REFERENCES users(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);

-- 添加外键
ALTER TABLE orders
ADD CONSTRAINT fk_user
FOREIGN KEY (user_id) REFERENCES users(id);

-- 删除外键
ALTER TABLE orders DROP FOREIGN KEY fk_user;
```

### 唯一约束（UNIQUE）

```sql
-- 创建表时添加
CREATE TABLE users (
    email VARCHAR(100) UNIQUE
);

-- 添加唯一约束
ALTER TABLE users ADD UNIQUE (email);

-- 删除唯一约束
ALTER TABLE users DROP INDEX email;
```

### 非空约束（NOT NULL）

```sql
-- 创建表时添加
CREATE TABLE users (
    username VARCHAR(50) NOT NULL
);

-- 修改列为非空
ALTER TABLE users MODIFY username VARCHAR(50) NOT NULL;

-- 取消非空约束
ALTER TABLE users MODIFY username VARCHAR(50) NULL;
```

### 默认值约束（DEFAULT）

```sql
-- 创建表时添加
CREATE TABLE users (
    status TINYINT DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 添加默认值
ALTER TABLE users ALTER COLUMN status SET DEFAULT 1;

-- 删除默认值
ALTER TABLE users ALTER COLUMN status DROP DEFAULT;
```

### 检查约束（CHECK）- MySQL 8.0.16+

```sql
-- 创建表时添加
CREATE TABLE users (
    age INT CHECK (age >= 0 AND age <= 150)
);

-- 添加检查约束
ALTER TABLE users ADD CONSTRAINT chk_age CHECK (age >= 0);

-- 删除检查约束
ALTER TABLE users DROP CHECK chk_age;
```

---

## 实用技巧

### 查看当前数据库

```sql
SELECT DATABASE();
```

### 查看MySQL版本

```sql
SELECT VERSION();
```

### 查看当前时间

```sql
SELECT NOW();
SELECT CURDATE();  -- 只显示日期
SELECT CURTIME();  -- 只显示时间
```

### 事务操作

```sql
-- 开始事务
START TRANSACTION;
-- 或
BEGIN;

-- 提交事务
COMMIT;

-- 回滚事务
ROLLBACK;

-- 示例
START TRANSACTION;
UPDATE users SET balance = balance - 100 WHERE id = 1;
UPDATE users SET balance = balance + 100 WHERE id = 2;
COMMIT;
```

### 备份和恢复

```bash
# 备份数据库
mysqldump -u root -p database_name > backup.sql

# 备份单个表
mysqldump -u root -p database_name table_name > table_backup.sql

# 恢复数据库
mysql -u root -p database_name < backup.sql
```

### 性能优化建议

1. 为经常查询的字段添加索引
2. 避免使用 `SELECT *`，只查询需要的列
3. 使用 LIMIT 限制结果集大小
4. 合理使用连接查询，避免过多的子查询
5. 定期分析和优化表：`ANALYZE TABLE table_name;`
6. 使用 EXPLAIN 分析查询性能：`EXPLAIN SELECT * FROM users;`

---

## 常见问题

### 1. 忘记WHERE导致全表更新/删除

```sql
-- 危险操作！会删除所有数据
DELETE FROM users;

-- 正确做法：始终加WHERE条件
DELETE FROM users WHERE id = 1;
```

### 2. 字符集问题

```sql
-- 查看表字符集
SHOW CREATE TABLE table_name;

-- 修改表字符集
ALTER TABLE table_name CONVERT TO CHARACTER SET utf8mb4;
```

### 3. 自增ID重置

```sql
-- 重置自增ID
ALTER TABLE table_name AUTO_INCREMENT = 1;
```

### 4. 查看表大小

```sql
SELECT
    table_name,
    ROUND(((data_length + index_length) / 1024 / 1024), 2) AS size_mb
FROM information_schema.TABLES
WHERE table_schema = 'database_name'
ORDER BY size_mb DESC;
```

---

## 总结

这份文档涵盖了 MySQL 数据表操作的主要内容，包括：

- ✅ 数据库和表的创建、修改、删除
- ✅ 数据的增删改查（CRUD）
- ✅ 复杂查询（连接、子查询、聚合）
- ✅ 索引和约束管理
- ✅ 事务处理
- ✅ 性能优化建议

建议按照实际需求逐步学习和实践，多动手操作才能熟练掌握！
