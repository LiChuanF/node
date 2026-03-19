import { IsEmail, IsNotEmpty, IsNumber, IsString } from 'class-validator'
import { Transform } from 'class-transformer'

/**
 * 用户 DTO
 * 用于用户相关的请求和响应
 */

export class UserDto {
    /**
     * 用户名
     */
    @IsNotEmpty({ message: '用户名不能为空' })
    @IsString()
    @Transform(({ value }) => value.trim())
    name: string

    /**
     * 用户邮箱
     */
    @IsNotEmpty({ message: '用户邮箱不能为空' })
    @IsEmail({}, { message: '用户邮箱格式错误' })
    email: string
}
