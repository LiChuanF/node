--全局变量
a = 2
print(a)


--局部变量
local b = 3
print(b)


--全局变量和局部变量可以同名
a = 4
print(a) --全局变量a被修改了
local a = 5
print(a) --局部变量a被定义了，覆盖了全局变量a

--全局变量和局部变量的作用域
print(a) --局部变量a的值是5
print(_G.a) --全局变量a的值是4

--全局变量和局部变量的生命周期
print(a) --局部变量a的值是5
do
    local a = 6
    print(a) --局部变量a的值是6
end

print(a) --局部变量a的值还是5，局部变量a的生命周期已经结束了

--do end块中的变量是局部变量
do
    local c = 7
    print(c) --局部变量c的值是7
end


--数组
local arr = {1, 2, 3, 4, 5}
print(arr[1]) --输出1

--条件语句
local x = 10
if x > 5 then
    print("x大于5")
elseif x == 5 then
    print("x等于5")
else
    print("x小于5")
end

--函数
function add(a, b)
    return a + b
end
print(add(3, 4)) --输出7


--数据类型

-- nil：表示无效值或缺失值。
-- boolean：表示布尔值，可以是 true 或 false。
-- number：表示数字，包括整数和浮点数。
-- string：表示字符串，由字符序列组成。
-- table：表示表，一种关联数组，用于存储和组织数据。
-- function：表示函数，用于封装可执行的代码块。
-- userdata：表示用户自定义数据类型，通常与C语言库交互使用。
-- thread：表示协程，用于实现多线程编程。
-- metatable：表示元表，用于定义表的行为。

--table
local person = {
    name = "Alice", 
    age = 30,
    greet = function()
        print("Hello, my name is " .. person.name)
    end 
}
print(person.name) --输出Alice
print(person.age) --输出30
person.greet() --输出Hello, my name is Alice


--循环
for i = 1, 5 do
    print(i) --输出1到5
end

--while循环
local count = 1
while count <= 5 do
    print(count) --输出1到5
    count = count + 1
end

--table循环
local fruits = {"apple", "banana", "cherry"}
for index, fruit in ipairs(fruits) do
    print(index, fruit) --输出1 apple, 2 banana, 3 cherry
end

--模块化
local M = {}
function M.add(a, b)
    return a + b
end

return M


--引入模块
local mymodule = require("mymodule")
print(mymodule.add(3, 4)) --输出7
